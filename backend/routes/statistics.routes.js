const express = require('express');
const router = express.Router();
const statisticsCtrl = require('../controllers/statistics.controller');
const auth = require('../middlewares/auth.middleware'); // si tu veux protéger la route

router.get('/', auth, statisticsCtrl.getStatistics);

module.exports = router;
