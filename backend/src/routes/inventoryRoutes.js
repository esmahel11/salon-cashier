// ڕاوتەکانی کۆگا
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// هەموو ڕاوتەکان پێویستیان بە ئۆسێنتیکەیشن هەیە
router.use(authMiddleware);

// وەرگرتنی هەموو مادەکان
router.get('/', inventoryController.getAllProducts);

// وەرگرتنی مادەیەک بە ID
router.get('/:id', inventoryController.getProductById);

// زیادکردنی مادە (تەنها admin)
router.post('/', roleCheck('admin'), inventoryController.addProduct);

// نوێکردنەوەی مادە (تەنها admin)
router.put('/:id', roleCheck('admin'), inventoryController.updateProduct);

// سڕینەوەی مادە (تەنها admin)
router.delete('/:id', roleCheck('admin'), inventoryController.deleteProduct);

// وەرگرتنی مادە کەمەکان
router.get('/alerts/low-stock', inventoryController.getLowStockProducts);

// وەرگرتنی پۆلەکان
router.get('/meta/categories', inventoryController.getCategories);

module.exports = router;