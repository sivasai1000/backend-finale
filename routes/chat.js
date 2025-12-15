const express = require('express');
const chatController = require('../controllers/chatController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/send', chatController.sendMessage);
router.get('/history/:userId?', chatController.getHistory);
router.put('/read', chatController.markRead);

// Admin Routes
router.get('/conversations', admin, chatController.getConversations);

module.exports = router;
