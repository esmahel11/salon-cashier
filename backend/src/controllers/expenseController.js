// کۆنتڕۆڵەری خەرجییەکان
const db = require('../config/database');

// وەرگرتنی هەموو خەرجییەکان
exports.getAllExpenses = (req, res) => {
  try {
    const { startDate, endDate, category, user_id } = req.query;
    let query = `
      SELECT e.*, u.full_name as user_name
      FROM expenses e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // فلتەری بەروار
    if (startDate) {
      query += ' AND e.expense_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND e.expense_date <= ?';
      params.push(endDate);
    }

    // فلتەری پۆل
    if (category) {
      query += ' AND (e.category_ku = ? OR e.category_ar = ?)';
      params.push(category, category);
    }

    // فلتەری بەکارهێنەر
    if (user_id) {
      query += ' AND e.user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY e.expense_date DESC, e.created_at DESC';

    const expenses = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: expenses,
      count: expenses.length
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی خەرجییەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی خەرجییەک بە ID
exports.getExpenseById = (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = db.prepare(`
      SELECT e.*, u.full_name as user_name
      FROM expenses e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.id = ?
    `).get(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'خەرجی نەدۆزرایەوە'
      });
    }

    res.json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی خەرجی:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// زیادکردنی خەرجیی نوێ
exports.addExpense = (req, res) => {
  try {
    const { category_ku, category_ar, description, amount, expense_date, payment_method } = req.body;

    // پشکنینی داتاکان
    if (!category_ku || !category_ar || !description || !amount || !expense_date) {
      return res.status(400).json({
        success: false,
        message: 'تکایە هەموو خانە پێویستەکان پڕ بکەرەوە'
      });
    }

    // زیادکردنی خەرجی
    const result = db.prepare(`
      INSERT INTO expenses (category_ku, category_ar, description, amount, expense_date, payment_method, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(category_ku, category_ar, description, amount, expense_date, payment_method || 'cash', req.user.id);

    res.status(201).json({
      success: true,
      message: 'خەرجی بە سەرکەوتوویی زیادکرا',
      data: { id: result.lastInsertRowid }
    });

  } catch (error) {
    console.error('هەڵە لە زیادکردنی خەرجی:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// نوێکردنەوەی خەرجی
exports.updateExpense = (req, res) => {
  try {
    const { id } = req.params;
    const { category_ku, category_ar, description, amount, expense_date, payment_method } = req.body;

    // پشکنینی بوونی خەرجی
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'خەرجی نەدۆزرایەوە'
      });
    }

    // نوێکردنەوەی خەرجی
    db.prepare(`
      UPDATE expenses SET
        category_ku = ?,
        category_ar = ?,
        description = ?,
        amount = ?,
        expense_date = ?,
        payment_method = ?
      WHERE id = ?
    `).run(
      category_ku || expense.category_ku,
      category_ar || expense.category_ar,
      description || expense.description,
      amount !== undefined ? amount : expense.amount,
      expense_date || expense.expense_date,
      payment_method || expense.payment_method,
      id
    );

    res.json({
      success: true,
      message: 'خەرجی بە سەرکەوتوویی نوێکرایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە نوێکردنەوەی خەرجی:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// سڕینەوەی خەرجی
exports.deleteExpense = (req, res) => {
  try {
    const { id } = req.params;

    // پشکنینی بوونی خەرجی
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'خەرجی نەدۆزرایەوە'
      });
    }

    // سڕینەوەی خەرجی
    db.prepare('DELETE FROM expenses WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'خەرجی بە سەرکەوتوویی سڕایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە سڕینەوەی خەرجی:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی کۆی خەرجیەکانی ماوەیەک
exports.getExpenseSummary = (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = 'SELECT SUM(amount) as total_expenses, COUNT(*) as count FROM expenses WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND expense_date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND expense_date <= ?';
      params.push(endDate);
    }

    const summary = db.prepare(query).get(...params);

    res.json({
      success: true,
      data: {
        total_expenses: summary.total_expenses || 0,
        count: summary.count || 0
      }
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی کورتەی خەرجیەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی پۆلەکانی خەرجی
exports.getExpenseCategories = (req, res) => {
  try {
    const { language } = req.query;
    const field = language === 'ar' ? 'category_ar' : 'category_ku';
    
    const categories = db.prepare(`
      SELECT DISTINCT ${field} as category 
      FROM expenses 
      WHERE ${field} IS NOT NULL AND ${field} != ''
      ORDER BY ${field}
    `).all();

    res.json({
      success: true,
      data: categories.map(c => c.category)
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی پۆلەکانی خەرجی:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};