// ڕاوتەکانی ئۆسێنتیکەیشن
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// چوونەژوورەوە
router.post('/login', authController.login);

// وەرگرتنی زانیاری بەکارهێنەری ئێستا
router.get('/me', authMiddleware, authController.getCurrentUser);

// گۆڕینی وشەی نهێنی
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;