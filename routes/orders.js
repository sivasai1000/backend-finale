const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const { protect, admin } = require('../middleware/auth');

router.get('/', protect, orderController.getAllOrders);
router.post('/create', protect, orderController.placeOrder);
router.post('/verify', protect, orderController.verifyPayment);

module.exports = router;
