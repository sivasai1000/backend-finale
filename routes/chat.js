const express = require('express');
const chatController = require('../controllers/chatController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();


router.use(protect);

router.post('/send', chatController.sendMessage);
router.get('/history', chatController.getHistory);
router.get('/history/:userId', chatController.getHistory);
router.put('/read', chatController.markRead);


router.get('/conversations', admin, chatController.getConversations);

module.exports = router;
