const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { protect, admin } = require('../middleware/auth');

router.get('/', faqController.getFAQs);
router.post('/', protect, admin, faqController.createFAQ);
router.delete('/:id', protect, admin, faqController.deleteFAQ);

module.exports = router;
