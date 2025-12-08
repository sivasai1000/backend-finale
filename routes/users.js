const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, userController.getAllUsers);
router.put('/:id/status', protect, admin, userController.toggleUserStatus);

module.exports = router;
