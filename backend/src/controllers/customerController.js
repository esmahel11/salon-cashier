// کۆنتڕۆڵەری کڕیارەکان
const db = require('../config/database');

// وەرگرتنی هەموو کڕیارەکان
exports.getAllCustomers = (req, res) => {
  try {
    const { search, sortBy } = req.query;
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params = [];

    // فلتەری گەڕان
    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // ڕیزکردن
    if (sortBy === 'purchases') {
      query += ' ORDER BY total_purchases DESC';
    } else if (sortBy === 'visits') {
      query += ' ORDER BY visit_count DESC';
    } else {
      query += ' ORDER BY name ASC';
    }

    const customers = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: customers,
      count: customers.length
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی کڕیارەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی کڕیارێک بە ID
exports.getCustomerById = (req, res) => {
  try {
    const { id } = req.params;
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'کڕیار نەدۆزرایەوە'
      });
    }

    // وەرگرتنی مێژووی کڕین
    const purchases = db.prepare(`
      SELECT s.*, GROUP_CONCAT(si.item_name) as items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.customer_id = ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `).all(id);

    res.json({
      success: true,
      data: {
        ...customer,
        recent_purchases: purchases
      }
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی کڕیار:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// زیادکردنی کڕیاری نوێ
exports.addCustomer = (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;

    // پشکنینی داتاکان
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'تکایە ناو و ژمارەی مۆبایل بنووسە'
      });
    }

    // پشکنینی دووبارەبوونەوەی ژمارەی مۆبایل
    const existing = db.prepare('SELECT id FROM customers WHERE phone = ?').get(phone);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'ئەم ژمارە مۆبایلە پێشتر تۆمارکراوە'
      });
    }

    // زیادکردنی کڕیار
    const result = db.prepare(`
      INSERT INTO customers (name, phone, email, address, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, phone, email || null, address || null, notes || null);

    res.status(201).json({
      success: true,
      message: 'کڕیار بە سەرکەوتوویی زیادکرا',
      data: { id: result.lastInsertRowid }
    });

  } catch (error) {
    console.error('هەڵە لە زیادکردنی کڕیار:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// نوێکردنەوەی کڕیار
exports.updateCustomer = (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address, notes } = req.body;

    // پشکنینی بوونی کڕیار
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'کڕیار نەدۆزرایەوە'
      });
    }

    // پشکنینی دووبارەبوونەوەی ژمارەی مۆبایل
    if (phone && phone !== customer.phone) {
      const existing = db.prepare('SELECT id FROM customers WHERE phone = ? AND id != ?').get(phone, id);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'ئەم ژمارە مۆبایلە پێشتر تۆمارکراوە'
        });
      }
    }

    // نوێکردنەوەی کڕیار
    db.prepare(`
      UPDATE customers SET
        name = ?,
        phone = ?,
        email = ?,
        address = ?,
        notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name || customer.name,
      phone || customer.phone,
      email || customer.email,
      address || customer.address,
      notes || customer.notes,
      id
    );

    res.json({
      success: true,
      message: 'کڕیار بە سەرکەوتوویی نوێکرایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە نوێکردنەوەی کڕیار:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// سڕینەوەی کڕیار
exports.deleteCustomer = (req, res) => {
  try {
    const { id } = req.params;

    // پشکنینی بوونی کڕیار
    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'کڕیار نەدۆزرایەوە'
      });
    }

    // پشکنینی ئەگەر کڕیار فرۆشتنی هەبێت
    const hasSales = db.prepare('SELECT COUNT(*) as count FROM sales WHERE customer_id = ?').get(id);
    if (hasSales.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'ناتوانیت ئەم کڕیارە بسڕیتەوە چونکە مێژووی کڕینی هەیە'
      });
    }

    // سڕینەوەی کڕیار
    db.prepare('DELETE FROM customers WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'کڕیار بە سەرکەوتوویی سڕایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە سڕینەوەی کڕیار:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی باشترین کڕیارەکان
exports.getTopCustomers = (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const customers = db.prepare(`
      SELECT * FROM customers 
      ORDER BY total_purchases DESC 
      LIMIT ?
    `).all(parseInt(limit));

    res.json({
      success: true,
      data: customers
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی باشترین کڕیارەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};