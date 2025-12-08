const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.post('/create', orderController.placeOrder);
router.post('/verify', orderController.verifyPayment);

module.exports = router;
