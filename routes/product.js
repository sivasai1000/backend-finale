const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth'); // Import auth middleware

const upload = require('../middleware/upload');

router.get('/trash', protect, admin, productController.getTrashProducts); // Trash route
router.put('/restore/:id', protect, admin, productController.restoreProduct); // Restore route

router.get('/', productController.getAllProducts);
router.get('/famous', productController.getFamousProducts);
router.get('/deals', productController.getDeals); // Deals route
router.post('/', upload.single('image'), productController.createProduct);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
