// ڕاوتەکانی فرۆشتن
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authMiddleware = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// هەموو ڕاوتەکان پێویستیان بە ئۆسێنتیکەیشن هەیە
router.use(authMiddleware);

// دروستکردنی فرۆشتنی نوێ
router.post('/', salesController.createSale);

// وەرگرتنی هەموو فرۆشتنەکان
router.get('/', salesController.getAllSales);

// وەرگرتنی فرۆشتنێک بە ID
router.get('/:id', salesController.getSaleById);

// سڕینەوەی فرۆشتن (تەنها admin)
router.delete('/:id', roleCheck('admin'), salesController.deleteSale);

// وەرگرتنی ئامارەکانی فرۆشتنی ئەمڕۆ
router.get('/stats/today', salesController.getTodaySalesStats);

module.exports = router;