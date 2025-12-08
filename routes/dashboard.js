const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

const { protect, admin } = require('../middleware/auth');

router.get('/stats', protect, admin, dashboardController.getDashboardStats);

module.exports = router;
