import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:tonemail@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let subscriptions = []; // Tu peux aussi les stocker dans MongoDB

// Route pour enregistrer une souscription
export const subscribe = (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
};

// Route pour envoyer une notification
export const sendNotification = (req, res) => {
  const { title, message } = req.body;

  const payload = JSON.stringify({ title, message });

  subscriptions.forEach(sub =>
    webpush.sendNotification(sub, payload).catch(err => console.error(err))
  );

  res.status(200).json({ message: 'Notification envoyée' });
};
