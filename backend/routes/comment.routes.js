// routes/comment.routes.js
const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

// Models (si tu en as besoin pour récupérer auteur)
const Article = require('../models/Article');

// ➕ Ajouter un commentaire à un article
router.post('/:articleId', auth, async (req, res) => {
  try {
    // 1️⃣ Créer le commentaire via ton controller existant
    const newComment = await commentCtrl.create(req, res, true); 
    // on passe `true` pour que le controller retourne le commentaire sans envoyer la réponse

    if (!newComment || !newComment.article) return; // déjà traité par controller

    // 2️⃣ Récupérer les infos pour notification
    const article = await Article.findById(req.params.articleId).populate('author');
    if (!article || !article.author) return;

    const authorId = article.author._id;
    const commenterName = req.user.name || 'Un lecteur';
    const articleTitle = article.title;

    // 3️⃣ Socket.IO → notifier l’auteur en direct s’il est connecté
    const io = req.app.get('io');
    io.to(String(authorId)).emit('commentNotification', {
      title: 'Nouveau commentaire',
      message: `${commenterName} a commenté ton article "${articleTitle}"`,
      articleId: article._id,
      commentId: newComment._id,
    });

    // 4️⃣ Web Push → notifier même s’il est déconnecté
    const sendAll = req.app.get('webpushSendAll');
    if (sendAll) {
      sendAll({
        title: 'Nouveau commentaire',
        message: `${commenterName} a commenté ton article "${articleTitle}"`,
        articleId: article._id,
      });
    }

    // 5️⃣ Réponse finale (si le controller ne l’a pas déjà envoyée)
    return res.status(201).json(newComment);

  } catch (err) {
    console.error('Erreur création commentaire :', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 📜 Lister les commentaires d’un article
router.get('/:articleId', commentCtrl.listByArticle);

// ❌ Supprimer un commentaire (admin uniquement)
router.delete('/:id', auth, role(['admin']), commentCtrl.delete);

module.exports = router;
