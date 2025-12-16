const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

const { protect, admin } = require('../middleware/auth'); 

router.get('/trash', protect, admin, couponController.getTrashCoupons);
router.put('/restore/:id', protect, admin, couponController.restoreCoupon);

router.get('/', couponController.getCoupons);
router.post('/create', couponController.createCoupon);
router.delete('/:id', couponController.deleteCoupon);
router.post('/validate', couponController.validateCoupon);

module.exports = router;
