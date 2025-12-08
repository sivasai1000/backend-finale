const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const upload = require('../middleware/upload');

router.get('/', productController.getAllProducts);
router.get('/famous', productController.getFamousProducts);
router.get('/deals', productController.getDeals); // Deals route
router.post('/', upload.single('image'), productController.createProduct);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);
router.put('/:id', upload.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
