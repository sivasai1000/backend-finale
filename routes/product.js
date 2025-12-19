const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/trash', protect, admin, productController.getTrashProducts);
router.put('/restore/:id', protect, admin, productController.restoreProduct);

router.get('/', productController.getAllProducts);
router.get('/famous', productController.getFamousProducts);
router.get('/deals', productController.getDeals);
router.post('/', upload.single('image'), productController.createProduct);
router.get('/categories', productController.getCategories);
router.get('/name/:name', productController.getProductByName); // New route for name-based fetch
router.get('/:id', productController.getProductById);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
