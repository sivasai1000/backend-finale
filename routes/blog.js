const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

const upload = require('../middleware/upload');

router.get('/', blogController.getAllBlogs);
router.post('/', upload.single('image'), blogController.createBlog); // For admin/seeding
router.get('/categories', blogController.getCategories);
router.get('/:id', blogController.getBlogById);
router.put('/:id', upload.single('image'), blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
