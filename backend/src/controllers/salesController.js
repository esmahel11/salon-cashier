// کۆنتڕۆڵەری فرۆشتنەکان
const db = require('../config/database');
const { sendSaleNotification } = require('../utils/telegramNotification');

// دروستکردنی ژمارەی پسوڵە
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
};

// دروستکردنی فرۆشتنی نوێ
exports.createSale = async (req, res) => {
  try {
    const { customer_id, items, discount_type, discount_value, payment_method, notes } = req.body;

    // پشکنینی داتاکان
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'تکایە بەلایەنی کەم یەک بەرهەم یان خزمەتگوزاری هەڵبژێرە'
      });
    }

    // حیسابکردنی کۆی گشتی
    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      if (item.item_type === 'product') {
        // پشکنینی بوونی مادە
        const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.item_id);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `مادەی ${item.item_id} نەدۆزرایەوە`
          });
        }

        // پشکنینی بڕی کۆگا
        if (product.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `بڕی کۆگای ${product.name_ku} بەسە (${product.quantity} دانە مابووەوە)`
          });
        }

        const itemTotal = product.sell_price * item.quantity;
        subtotal += itemTotal;

        saleItems.push({
          item_type: 'product',
          item_id: product.id,
          item_name: product.name_ku,
          quantity: item.quantity,
          price: product.sell_price,
          total: itemTotal
        });

      } else if (item.item_type === 'service') {
        // پشکنینی بوونی خزمەتگوزاری
        const service = db.prepare('SELECT * FROM services WHERE id = ? AND is_active = 1').get(item.item_id);
        if (!service) {
          return res.status(404).json({
            success: false,
            message: `خزمەتگوزاری ${item.item_id} نەدۆزرایەوە`
          });
        }

        const itemTotal = service.price * (item.quantity || 1);
        subtotal += itemTotal;

        saleItems.push({
          item_type: 'service',
          item_id: service.id,
          item_name: service.name_ku,
          quantity: item.quantity || 1,
          price: service.price,
          total: itemTotal
        });
      }
    }

    // حیسابکردنی داشکاندن
    let discountAmount = 0;
    if (discount_type === 'percentage') {
      discountAmount = subtotal * (discount_value / 100);
    } else if (discount_type === 'fixed') {
      discountAmount = discount_value;
    }

    const total = subtotal - discountAmount;

    // دەستپێکردنی تراناکشن
    const transaction = db.transaction(() => {
      // دروستکردنی فرۆشتن
      const invoiceNumber = generateInvoiceNumber();
      const saleResult = db.prepare(`
        INSERT INTO sales 
        (invoice_number, customer_id, user_id, subtotal, discount_type, discount_value, total, payment_method, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        invoiceNumber,
        customer_id || null,
        req.user.id,
        subtotal,
        discount_type || 'none',
        discount_value || 0,
        total,
        payment_method || 'cash',
        notes || null
      );

      const saleId = saleResult.lastInsertRowid;

      // زیادکردنی بڕگەکانی فرۆشتن
      for (const item of saleItems) {
        db.prepare(`
          INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, price, total)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(saleId, item.item_type, item.item_id, item.item_name, item.quantity, item.price, item.total);

        // کەمکردنەوەی کۆگای مادە
        if (item.item_type === 'product') {
          db.prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?').run(item.quantity, item.item_id);
        }
      }

      // نوێکردنەوەی زانیاری کڕیار
      if (customer_id) {
        db.prepare(`
          UPDATE customers SET 
            total_purchases = total_purchases + ?,
            visit_count = visit_count + 1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(total, customer_id);
      }

      return { saleId, invoiceNumber };
    });

    const result = transaction();

    // ناردنی نۆتیفیکەیشن بۆ تێلیگرام
    try {
      // وەرگرتنی ناوی کڕیار ئەگەر هەبوو
      const customerData = customer_id ? 
        db.prepare('SELECT name FROM customers WHERE id = ?').get(customer_id) : 
        null;
      
      // ناردنی نۆتیفیکەیشن
      await sendSaleNotification({
        invoice_number: result.invoiceNumber,
        total: total,
        customer_name: customerData ? customerData.name : 'کڕیاری نەناسراو',
        items_count: saleItems.length,
        discount: discountAmount,
        user_name: req.user.full_name || req.user.username,
        payment_method: payment_method || 'cash'
      });
      
      console.log('✅ نۆتیفیکەیشنی تێلیگرام نێردرا');
    } catch (notifError) {
      // ئەگەر نۆتیفیکەیشن شکستی هێنا، فرۆشتنەکە هێشتا سەرکەوتووە
      console.error('❌ هەڵە لە ناردنی نۆتیفیکەیشن:', notifError.message);
    }

    res.status(201).json({
      success: true,
      message: 'فرۆشتن بە سەرکەوتوویی تۆمارکرا',
      data: {
        sale_id: result.saleId,
        invoice_number: result.invoiceNumber,
        total: total
      }
    });

  } catch (error) {
    console.error('هەڵە لە دروستکردنی فرۆشتن:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی هەموو فرۆشتنەکان
exports.getAllSales = (req, res) => {
  try {
    const { startDate, endDate, customer_id, user_id, limit = 50 } = req.query;
    let query = 'SELECT s.*, c.name as customer_name, u.full_name as user_name FROM sales s LEFT JOIN customers c ON s.customer_id = c.id LEFT JOIN users u ON s.user_id = u.id WHERE 1=1';
    const params = [];

    // فلتەری بەروار
    if (startDate) {
      query += ' AND DATE(s.created_at) >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND DATE(s.created_at) <= ?';
      params.push(endDate);
    }

    // فلتەری کڕیار
    if (customer_id) {
      query += ' AND s.customer_id = ?';
      params.push(customer_id);
    }

    // فلتەری بەکارهێنەر
    if (user_id) {
      query += ' AND s.user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY s.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const sales = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: sales,
      count: sales.length
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی فرۆشتنەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی فرۆشتنێک بە ID
exports.getSaleById = (req, res) => {
  try {
    const { id } = req.params;

    // وەرگرتنی فرۆشتن
    const sale = db.prepare(`
      SELECT s.*, c.name as customer_name, c.phone as customer_phone, u.full_name as user_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `).get(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'فرۆشتن نەدۆزرایەوە'
      });
    }

    // وەرگرتنی بڕگەکانی فرۆشتن
    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(id);

    res.json({
      success: true,
      data: {
        ...sale,
        items: items
      }
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی فرۆشتن:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// سڕینەوەی فرۆشتن (تەنها بۆ admin)
exports.deleteSale = (req, res) => {
  try {
    const { id } = req.params;

    // وەرگرتنی فرۆشتن
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'فرۆشتن نەدۆزرایەوە'
      });
    }

    // وەرگرتنی بڕگەکان
    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(id);

    // دەستپێکردنی تراناکشن
    const transaction = db.transaction(() => {
      // گەڕاندنەوەی کۆگای مادەکان
      for (const item of items) {
        if (item.item_type === 'product') {
          db.prepare('UPDATE products SET quantity = quantity + ? WHERE id = ?').run(item.quantity, item.item_id);
        }
      }

      // کەمکردنەوەی زانیاری کڕیار
      if (sale.customer_id) {
        db.prepare(`
          UPDATE customers SET 
            total_purchases = total_purchases - ?,
            visit_count = visit_count - 1
          WHERE id = ?
        `).run(sale.total, sale.customer_id);
      }

      // سڕینەوەی فرۆشتن (بڕگەکانیش بە ئۆتۆماتیک دەسڕێنەوە بەهۆی CASCADE)
      db.prepare('DELETE FROM sales WHERE id = ?').run(id);
    });

    transaction();

    res.json({
      success: true,
      message: 'فرۆشتن بە سەرکەوتوویی سڕایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە سڕینەوەی فرۆشتن:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی ئامارەکانی فرۆشتنی ئەمڕۆ
exports.getTodaySalesStats = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(total) as total_revenue,
        SUM(subtotal - total) as total_discount,
        AVG(total) as average_sale
      FROM sales
      WHERE DATE(created_at) = ?
    `).get(today);

    res.json({
      success: true,
      data: stats || { total_sales: 0, total_revenue: 0, total_discount: 0, average_sale: 0 }
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی ئامارەکانی فرۆشتن:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};