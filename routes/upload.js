const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');

// POST /api/upload
// Uses 'image' as the field name for the file
router.post('/', upload.single('image'), uploadController.uploadFile);

module.exports = router;
