const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

const Article = require('../models/Article');


router.post('/:articleId', auth, async (req, res) => {
  try {
    const newComment = await commentCtrl.create(req, res, true); 

    if (!newComment || !newComment.article) return; 

    
    const article = await Article.findById(req.params.articleId).populate('author');
    if (!article || !article.author) return;

    const authorId = article.author._id;
    const commenterName = req.user.name || 'Un lecteur';
    const articleTitle = article.title;

    
    const io = req.app.get('io');
    io.to(String(authorId)).emit('commentNotification', {
      title: 'Nouveau commentaire',
      message: `${commenterName} a commenté ton article "${articleTitle}"`,
      articleId: article._id,
      commentId: newComment._id,
    });

    
    const sendAll = req.app.get('webpushSendAll');
    if (sendAll) {
      sendAll({
        title: 'Nouveau commentaire',
        message: `${commenterName} a commenté ton article "${articleTitle}"`,
        articleId: article._id,
      });
    }

    return res.status(201).json(newComment);

  } catch (err) {
    console.error('Erreur création commentaire :', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});


router.get('/:articleId', commentCtrl.listByArticle);

router.delete('/:id', auth, role(['admin']), commentCtrl.delete);

module.exports = router;
