const express = require('express');
const router = express.Router();
const privacyController = require('../controllers/privacyController');
const { protect, admin } = require('../middleware/auth');

router.get('/', privacyController.getPrivacy);
router.put('/', protect, admin, privacyController.updatePrivacy);

module.exports = router;
