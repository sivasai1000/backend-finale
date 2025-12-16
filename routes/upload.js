const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');



router.post('/', upload.single('image'), uploadController.uploadFile);

module.exports = router;
