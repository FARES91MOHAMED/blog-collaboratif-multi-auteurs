// // routes/article.routes.js
// const express = require('express');
// const router = express.Router();
// const articleCtrl = require('../controllers/article.controller');
// const auth = require('../middlewares/auth.middleware');
// const role = require('../middlewares/role.middleware');
// const upload = require('../middlewares/upload.middleware')



// // ✅ Route création avec upload
// router.post('/', auth, upload.single('image'), articleCtrl.create);

// // ✅ Route modification avec upload
// router.put('/:id', auth, upload.single('image'), articleCtrl.update);
// // ✅ Récupérer tous les articles
// router.get('/', articleCtrl.list);

// // ✅ Récupérer un seul article par ID (manquant avant)
// router.get('/:id', articleCtrl.getOne);

// // ✅ Créer un article
// router.post(
//   '/',
//   auth,
//   role(['redacteur', 'editeur', 'admin']),
//   articleCtrl.create
// );

// // ✅ Mettre à jour un article
// router.put(
//   '/:id',
//   auth,
//   role(['redacteur', 'editeur', 'admin']),
//   articleCtrl.update
// );

// // ✅ Supprimer un article
// router.delete('/:id', auth, role(['admin']), articleCtrl.delete);

// // ✅ Ajouter un commentaire
// router.post('/:id/comments', auth, articleCtrl.addComment);

// // ✅ Récupérer un article par ID
// router.get('/:id', articleCtrl.getById);
// // ➕ Créer un article avec image uploadée
// router.post('/', auth, upload.single('image'), articleCtrl.create);

// // ✏️ Modifier un article (avec ou sans nouvelle image)
// router.put('/:id', auth, upload.single('image'), articleCtrl.update);

// module.exports = router;
// //
// routes/article.routes.js
const express = require('express');
const router = express.Router();
const articleCtrl = require('../controllers/article.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

// ---------------------------------------------
// 📰 GESTION DES ARTICLES
// ---------------------------------------------

// ✅ Récupérer tous les articles
router.get('/', articleCtrl.list);

// ✅ Récupérer un article par ID
router.get('/:id', articleCtrl.getOne);

// ✅ Créer un article (avec upload d’image)
router.post(
  '/',
  auth,
  role(['redacteur', 'editeur', 'admin']),
  upload.single('image'),
  articleCtrl.create
);

// ✅ Mettre à jour un article (avec ou sans nouvelle image)
router.put(
  '/:id',
  auth,
  role(['redacteur', 'editeur', 'admin']),
  upload.single('image'),
  articleCtrl.update
);

// ✅ Supprimer un article (admin uniquement)
router.delete('/:id', auth, role(['admin']), articleCtrl.delete);

// ---------------------------------------------
// 💬 GESTION DES COMMENTAIRES
// ---------------------------------------------

// ✅ Ajouter un commentaire à un article
router.post('/:id/comments', auth, articleCtrl.addComment);

module.exports = router;
