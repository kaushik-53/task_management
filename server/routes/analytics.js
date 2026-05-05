const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAnalytics } = require('../controllers/analyticsController');

router.use(auth);
router.get('/', getAnalytics);

module.exports = router;
