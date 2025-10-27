const express = require('express');
const router = express.Router();
const statsCtrl = require('../controllers/statistics.controller');
const auth = require('../middlewares/auth.middleware');
const role = require('../middlewares/role.middleware');

router.get('/', auth, role(['admin']), statsCtrl.getStatistics);

module.exports = router;
