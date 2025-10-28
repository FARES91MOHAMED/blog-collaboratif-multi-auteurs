const Comment = require('../models/Comment');
const Article = require('../models/Article');

exports.getStatistics = async (req, res) => {
  try {
    const articleCount = await Article.countDocuments();
    const commentCount = await Comment.countDocuments();

    // --- Vue mensuelle ---
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const articlesByMonth = new Array(12).fill(0);
    const commentsByMonth = new Array(12).fill(0);

    // --- Vue journalière ---
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    const articlesByDay = new Array(31).fill(0);
    const commentsByDay = new Array(31).fill(0);

    const articles = await Article.find();
    const comments = await Comment.find();

    articles.forEach((a) => {
      const d = new Date(a.createdAt);
      articlesByMonth[d.getMonth()]++;
      articlesByDay[d.getDate() - 1]++;
    });

    comments.forEach((c) => {
      const d = new Date(c.createdAt);
      commentsByMonth[d.getMonth()]++;
      commentsByDay[d.getDate() - 1]++;
    });

    res.json({
      articleCount,
      commentCount,
      chartData: {
        daily: { labels: days, articles: articlesByDay, comments: commentsByDay },
        monthly: { labels: months, articles: articlesByMonth, comments: commentsByMonth }
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
