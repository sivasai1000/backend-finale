const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

router.get('/', contactController.getContact);
router.put('/', protect, admin, contactController.updateContact);

module.exports = router;
