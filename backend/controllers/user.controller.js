// controllers/user.controller.js
const User = require('../models/User');

exports.listUsers = async (req, res) => {
  const users = await User.find().select('-password -refreshTokens');
  res.json(users);
};

exports.updateRole = async (req, res) => {
  const { role } = req.body;
  if (!['admin','editeur','redacteur','lecteur'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  user.role = role;
  await user.save();
  res.json({ success: true });
};


exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err });
  }
};