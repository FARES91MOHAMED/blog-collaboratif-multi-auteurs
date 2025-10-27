const Comment = require('../models/Comment');
const Article = require('../models/Article');

exports.getStatistics = async (req, res) => {
  try {
    const articleCount = await Article.countDocuments();
    const commentCount = await Comment.countDocuments();

    // Exemple simple : nombre d'articles/commentaires par mois
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const articlesByMonth = new Array(12).fill(0);
    const commentsByMonth = new Array(12).fill(0);

    const articles = await Article.find();
    const comments = await Comment.find();

    articles.forEach((a) => {
      const m = new Date(a.createdAt).getMonth();
      articlesByMonth[m]++;
    });

    comments.forEach((c) => {
      const m = new Date(c.createdAt).getMonth();
      commentsByMonth[m]++;
    });

    res.json({
      articleCount,
      commentCount,
      chartData: {
        labels: months,
        articles: articlesByMonth,
        comments: commentsByMonth,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
