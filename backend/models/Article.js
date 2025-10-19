const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  content: { type: String, required: true },
  images: [{ type: String }], // ✅ plusieurs images
  tags: [{ type: String, index: true }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

ArticleSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Article', ArticleSchema);
