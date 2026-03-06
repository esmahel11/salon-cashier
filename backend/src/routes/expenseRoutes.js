// ڕاوتەکانی خەرجییەکان
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// هەموو ڕاوتەکان پێویستیان بە ئۆسێنتیکەیشن هەیە
router.use(authMiddleware);

// وەرگرتنی هەموو خەرجییەکان
router.get('/', expenseController.getAllExpenses);

// وەرگرتنی خەرجییەک بە ID
router.get('/:id', expenseController.getExpenseById);

// زیادکردنی خەرجی
router.post('/', expenseController.addExpense);

// نوێکردنەوەی خەرجی (تەنها admin)
router.put('/:id', roleCheck('admin'), expenseController.updateExpense);

// سڕینەوەی خەرجی (تەنها admin)
router.delete('/:id', roleCheck('admin'), expenseController.deleteExpense);

// وەرگرتنی کورتەی خەرجییەکان
router.get('/stats/summary', expenseController.getExpenseSummary);

// وەرگرتنی پۆلەکانی خەرجی
router.get('/meta/categories', expenseController.getExpenseCategories);

module.exports = router;