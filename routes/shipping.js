const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { protect, admin } = require('../middleware/auth');

router.get('/', shippingController.getShipping);
router.put('/', protect, admin, shippingController.updateShipping);

module.exports = router;
