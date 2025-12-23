const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, userController.getAllUsers);
router.put('/:id/status', protect, admin, userController.toggleUserStatus);
router.put('/:id/role', protect, admin, userController.updateUserRole);
router.delete('/:id', protect, admin, userController.deleteUser);


router.get('/trash', protect, admin, userController.getTrashUsers);
router.put('/restore/:id', protect, admin, userController.restoreUser);

module.exports = router;
