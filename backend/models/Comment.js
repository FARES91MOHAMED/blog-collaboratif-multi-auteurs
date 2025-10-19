// models/Comment.js
const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  content: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
