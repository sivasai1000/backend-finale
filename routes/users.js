const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const { protect, admin } = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/', protect, admin, userController.getAllUsers);
router.put('/profile', protect, upload.single('image'), userController.updateProfile); // Using 'image' field for profile pic
router.put('/:id/status', protect, admin, userController.toggleUserStatus);
router.put('/:id/role', protect, admin, userController.updateUserRole);
router.delete('/:id', protect, admin, userController.deleteUser);
router.get('/trash', protect, admin, userController.getTrashUsers);
router.put('/restore/:id', protect, admin, userController.restoreUser);

module.exports = router;
