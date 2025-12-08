const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, pageController.getAllPages);
router.post('/', protect, admin, pageController.createPage);
router.get('/:slug', pageController.getPageBySlug);
router.put('/:slug', protect, admin, pageController.updatePage);
router.delete('/:slug', protect, admin, pageController.deletePage);

module.exports = router;
