const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products with optional filtering
router.get('/', productController.getAllProducts);

// Search products
router.get('/search', productController.searchProducts);

// Get a product by barcode
router.get('/barcode/:barcode', productController.getProductByBarcode);

// Create a new product
router.post('/', productController.createProduct);

// Update a product
router.put('/barcode/:barcode', productController.updateProduct);

// Delete a product
router.delete('/barcode/:barcode', productController.deleteProduct);

module.exports = router; 