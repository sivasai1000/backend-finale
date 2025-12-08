const express = require('express');
const router = express.Router();
const termsController = require('../controllers/termsController');
const { protect, admin } = require('../middleware/auth');

router.get('/', termsController.getTerms);
router.put('/', protect, admin, termsController.updateTerms);

module.exports = router;
