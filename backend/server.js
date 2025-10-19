// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const webpush = require('web-push');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: '*' } // en prod : limiter à ton domaine
});

// Connect DB
connectDB().catch(err => {
  console.error('DB connection failed', err);
  process.exit(1);
});

// Configure web-push
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'admin@example.com'}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Temp storage for subscriptions (prod -> stocker dans MongoDB)
let subscriptions = [];

// Middlewares
app.use('/uploads', express.static('uploads'));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));

// Exposer io et helpers aux routes
app.set('io', io);

// fonction pour envoyer push à toutes les subscriptions connues
function sendWebPushNotificationToAll(payloadObj) {
  const payload = JSON.stringify(payloadObj);
  subscriptions.forEach((sub, idx) => {
    webpush.sendNotification(sub, payload).catch(err => {
      console.error('Erreur envoi notification à', sub.endpoint, err);
      // Si abonnement invalide -> retirer
      if (err.statusCode === 410 || err.statusCode === 404) {
        subscriptions.splice(idx, 1);
      }
    });
  });
}

// Expose les utilitaires via app (routes peuvent y acceder)
app.set('webpushSendAll', sendWebPushNotificationToAll);
app.set('webpushSubscriptions', subscriptions);

// Route pour enregistrer une souscription (frontend POST)
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: 'Subscription invalide' });
  }

  // Eviter doublons
  const exists = subscriptions.find(s => s.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
    console.log('Nouvelle souscription enregistrée, total =', subscriptions.length);
  }
  return res.status(201).json({ message: 'Souscription enregistrée' });
});

// Route pour supprimer une souscription (optionnel)
app.post('/api/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  subscriptions = subscriptions.filter(s => s.endpoint !== endpoint);
  app.set('webpushSubscriptions', subscriptions);
  return res.status(200).json({ message: 'Désabonné' });
});

// Routes existantes - adapte les chemins selon ton projet
const commentRoutes = require('./routes/comment.routes');
app.use('/api/comments', commentRoutes);
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/articles', require('./routes/article.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Socket.IO handling
io.on('connection', (socket) => {
  console.log('Socket connecté', socket.id);

  socket.on('joinUserRoom', (userId) => {
    socket.join(String(userId));
    console.log(`Utilisateur ${userId} rejoint sa room`);
  });

  // Evénement générique depuis frontend quand un commentaire est posté
  socket.on('newComment', (data) => {
    const { authorId, articleTitle, commenterName } = data;

    // Notification temps réel via Socket.IO
    io.to(String(authorId)).emit('commentNotification', {
      title: 'Nouveau commentaire',
      message: `${commenterName} a commenté ton article "${articleTitle}"`,
      articleTitle,
    });

    // Notification Web Push à toutes les subscriptions (ou filtrer par auteur si stock en DB)
    sendWebPushNotificationToAll({
      title: 'Nouveau commentaire',
      message: `${commenterName} a commenté ton article "${articleTitle}"`,
      articleTitle,
    });
  });

  socket.on('disconnect', () => {
    console.log('Socket déconnecté', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
