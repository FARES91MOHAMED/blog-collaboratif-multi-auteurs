const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');
const userCtrl = require('../controllers/user.controller');

router.get('/', auth, role(['admin']), userCtrl.listUsers);
router.put('/:id/role', auth, role(['admin']), userCtrl.updateRole);
router.delete('/:id', auth, role(['admin']), userCtrl.deleteUser);

module.exports = router;
