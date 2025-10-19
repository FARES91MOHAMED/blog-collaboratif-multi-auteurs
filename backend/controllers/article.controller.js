const Article = require('../models/Article');
const Comment = require('../models/Comment');

// ➕ Créer un article (avec image uploadée OU URL)
exports.create = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Titre et contenu sont requis.' });
    }

    // 📸 Gestion de l’image
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; // upload local
    } else if (req.body.image) {
      imageUrl = req.body.image; // URL directe
    }

    const article = await Article.create({
      title,
      content,
      images: imageUrl ? [imageUrl] : [],
      tags,
      author: req.user._id,
    });

    res.status(201).json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 📝 Modifier un article (avec image uploadée ou inchangée)
exports.update = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article introuvable.' });

    // ✅ Vérification des permissions :
    if (req.user.role === 'lecteur') {
      return res.status(403).json({ message: 'Les lecteurs ne peuvent pas modifier les articles.' });
    }

    if (req.user.role === 'redacteur' && !article.author.equals(req.user._id)) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres articles.' });
    }

    const { title, content, tags } = req.body;

    if (title) article.title = title;
    if (content) article.content = content;
    if (tags) article.tags = tags;

    // 📸 Gestion nouvelle image
    if (req.file) {
      const newImage = `/uploads/${req.file.filename}`;
      article.images = [newImage];
    } else if (req.body.image) {
      article.images = [req.body.image];
    }

    await article.save();
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ❌ Supprimer un article (admin uniquement)
exports.delete = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article introuvable.' });

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seul un administrateur peut supprimer des articles.' });
    }

    await article.deleteOne();
    res.json({ message: 'Article supprimé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 📄 Lister tous les articles
exports.list = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    const filter = {};

    if (tag) filter.tags = tag;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;

    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'name email role');

    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 💬 Ajouter un commentaire
exports.addComment = async (req, res) => {
  try {
    const articleId = req.params.id;
    const { content, parent } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Le contenu du commentaire est requis.' });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé.' });
    }

    const comment = await Comment.create({
      article: articleId,
      author: req.user._id,
      parent: parent || null,
      content,
    });

    // 🔔 Notification temps réel via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(String(article.author)).emit('newComment', { articleId, comment });
    }

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 📄 Obtenir un seul article simple
exports.getOne = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('author', 'name');
    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// 📄 Obtenir un article complet (avec commentaires)
exports.getById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name email')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' },
      });

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
