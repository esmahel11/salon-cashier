// ڕاوتەکانی ڕاپۆرتەکان
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middlewares/auth');

// هەموو ڕاوتەکان پێویستیان بە ئۆسێنتیکەیشن هەیە
router.use(authMiddleware);

// ئامارەکانی داشبۆرد
router.get('/dashboard', reportController.getDashboardStats);

// ڕاپۆرتی فرۆشتن
router.get('/sales', reportController.getSalesReport);

// ڕاپۆرتی قازانج و زەرەر
router.get('/profit-loss', reportController.getProfitLossReport);

// ڕاپۆرتی بەرهەمە باشەکان
router.get('/top-products', reportController.getTopSellingProducts);

// ڕاپۆرتی خزمەتگوزاری باشەکان
router.get('/top-services', reportController.getTopServices);

// ڕاپۆرتی کڕیارەکان
router.get('/customers', reportController.getCustomerReport);

// ڕاپۆرتی کۆگا
router.get('/inventory', reportController.getInventoryReport);

module.exports = router;