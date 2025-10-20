const Comment = require('../models/Comment');
const Article = require('../models/Article');

exports.create = async (req, res, internal = false) => {
  try {
    const { content, parent } = req.body;
    const { articleId } = req.params;

    if (!content) {
      if (!internal) return res.status(400).json({ message: 'Le contenu du commentaire est requis.' });
      return null;
    }

    const article = await Article.findById(articleId).populate('author');
    if (!article) {
      if (!internal) return res.status(404).json({ message: 'Article non trouvé.' });
      return null;
    }

    const comment = await Comment.create({
      article: articleId,
      author: req.user._id,
      parent: parent || null,
      content
    });

    if (req.app && article.author && String(article.author._id) !== String(req.user._id)) {
      const io = req.app.get('io');
      const sendAll = req.app.get('webpushSendAll');

      const commenterName = req.user.name || 'Un lecteur';
      const articleTitle = article.title;

      if (io) {
        io.to(String(article.author._id)).emit('commentNotification', {
          title: 'Nouveau commentaire',
          message: `${commenterName} a commenté ton article "${articleTitle}"`,
          articleId: article._id,
          commentId: comment._id,
        });
      }

      if (sendAll) {
        sendAll({
          title: 'Nouveau commentaire',
          message: `${commenterName} a commenté ton article "${articleTitle}"`,
          articleId: article._id,
        });
      }
    }

    if (internal) return comment;

    return res.status(201).json(comment);

  } catch (err) {
    console.error('Erreur création commentaire :', err);
    if (!internal) res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.listByArticle = async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.articleId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.delete = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Commentaire introuvable.' });

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seul un administrateur peut supprimer des commentaires.' });
    }

    await comment.deleteOne();
    res.json({ message: 'Commentaire supprimé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
