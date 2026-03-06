// ڕاوتەکانی کڕیارەکان
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// هەموو ڕاوتەکان پێویستیان بە ئۆسێنتیکەیشن هەیە
router.use(authMiddleware);

// وەرگرتنی هەموو کڕیارەکان
router.get('/', customerController.getAllCustomers);

// وەرگرتنی کڕیارێک بە ID
router.get('/:id', customerController.getCustomerById);

// زیادکردنی کڕیار
router.post('/', customerController.addCustomer);

// نوێکردنەوەی کڕیار
router.put('/:id', customerController.updateCustomer);

// سڕینەوەی کڕیار (تەنها admin)
router.delete('/:id', roleCheck('admin'), customerController.deleteCustomer);

// وەرگرتنی باشترین کڕیارەکان
router.get('/stats/top', customerController.getTopCustomers);

module.exports = router;