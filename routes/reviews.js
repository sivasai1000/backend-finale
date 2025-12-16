const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');


router.post('/', protect, reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/eligibility/:productId', protect, reviewController.checkEligibility);


router.get('/admin', protect, admin, reviewController.getAllReviewsAdmin);
router.get('/admin/trash', protect, admin, reviewController.getTrashReviews); 
router.put('/admin/restore/:id', protect, admin, reviewController.restoreReview); 
router.put('/admin/:id', protect, admin, reviewController.updateReviewStatus);
router.delete('/admin/:id', protect, admin, reviewController.deleteReview);

module.exports = router;
