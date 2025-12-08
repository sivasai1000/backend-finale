const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

router.get('/', couponController.getCoupons);
router.post('/create', couponController.createCoupon);
router.delete('/:id', couponController.deleteCoupon);
router.post('/validate', couponController.validateCoupon);

module.exports = router;
