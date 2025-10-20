const express = require('express');
const router = express.Router();
const articleCtrl = require('../controllers/article.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/', articleCtrl.list);

router.get('/:id', articleCtrl.getOne);

router.post(
  '/',
  auth,
  role(['redacteur', 'editeur', 'admin']),
  upload.single('image'),
  articleCtrl.create
);

router.put(
  '/:id',
  auth,
  role(['redacteur', 'editeur', 'admin']),
  upload.single('image'),
  articleCtrl.update
);

router.delete('/:id', auth, role(['admin']), articleCtrl.delete);


router.post('/:id/comments', auth, articleCtrl.addComment);

module.exports = router;
