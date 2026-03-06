// ڕاوتەکانی بەکارهێنەرەکان
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// هەموو ڕاوتەکان پێویستیان بە ئۆسێنتیکەیشن و ڕۆڵی admin هەیە
router.use(authMiddleware);
router.use(roleCheck('admin'));

// وەرگرتنی هەموو بەکارهێنەرەکان
router.get('/', userController.getAllUsers);

// زیادکردنی بەکارهێنەری نوێ
router.post('/', userController.addUser);

// نوێکردنەوەی بەکارهێنەر
router.put('/:id', userController.updateUser);

// ڕێسێت کردنی وشەی نهێنی
router.post('/:id/reset-password', userController.resetPassword);

// سڕینەوەی بەکارهێنەر
router.delete('/:id', userController.deleteUser);

module.exports = router;