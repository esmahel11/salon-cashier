// کۆنتڕۆڵەری کۆگای مادەکان
const db = require('../config/database');

// وەرگرتنی هەموو مادەکان
exports.getAllProducts = (req, res) => {
  try {
    const { search, category, active } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    // فلتەری گەڕان
    if (search) {
      query += ' AND (name_ku LIKE ? OR name_ar LIKE ? OR barcode LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // فلتەری پۆل
    if (category) {
      query += ' AND (category_ku = ? OR category_ar = ?)';
      params.push(category, category);
    }

    // فلتەری چالاک/ناچالاک
    if (active !== undefined) {
      query += ' AND is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY name_ku ASC';

    const products = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی مادەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی مادەیەک بە ID
exports.getProductById = (req, res) => {
  try {
    const { id } = req.params;
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'مادە نەدۆزرایەوە'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی مادە:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// زیادکردنی مادەی نوێ
exports.addProduct = (req, res) => {
  try {
    const {
      name_ku,
      name_ar,
      barcode,
      quantity,
      buy_price,
      sell_price,
      min_stock,
      category_ku,
      category_ar,
      description
    } = req.body;

    // پشکنینی داتاکان
    if (!name_ku || !name_ar || !buy_price || !sell_price) {
      return res.status(400).json({
        success: false,
        message: 'تکایە خانە پێویستەکان پڕ بکەرەوە'
      });
    }

    // پشکنینی دووبارەبوونەوەی بارکۆد
    if (barcode) {
      const existing = db.prepare('SELECT id FROM products WHERE barcode = ?').get(barcode);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'ئەم بارکۆدە پێشتر بەکارهێنراوە'
        });
      }
    }

    // زیادکردنی مادە
    const result = db.prepare(`
      INSERT INTO products 
      (name_ku, name_ar, barcode, quantity, buy_price, sell_price, min_stock, category_ku, category_ar, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name_ku,
      name_ar,
      barcode || null,
      quantity || 0,
      buy_price,
      sell_price,
      min_stock || 10,
      category_ku || null,
      category_ar || null,
      description || null
    );

    res.status(201).json({
      success: true,
      message: 'مادە بە سەرکەوتوویی زیادکرا',
      data: { id: result.lastInsertRowid }
    });

  } catch (error) {
    console.error('هەڵە لە زیادکردنی مادە:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// نوێکردنەوەی مادە
exports.updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const {
      name_ku,
      name_ar,
      barcode,
      quantity,
      buy_price,
      sell_price,
      min_stock,
      category_ku,
      category_ar,
      description,
      is_active
    } = req.body;

    // پشکنینی بوونی مادە
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'مادە نەدۆزرایەوە'
      });
    }

    // پشکنینی دووبارەبوونەوەی بارکۆد
    if (barcode && barcode !== product.barcode) {
      const existing = db.prepare('SELECT id FROM products WHERE barcode = ? AND id != ?').get(barcode, id);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'ئەم بارکۆدە پێشتر بەکارهێنراوە'
        });
      }
    }

    // نوێکردنەوەی مادە
    db.prepare(`
      UPDATE products SET
        name_ku = ?,
        name_ar = ?,
        barcode = ?,
        quantity = ?,
        buy_price = ?,
        sell_price = ?,
        min_stock = ?,
        category_ku = ?,
        category_ar = ?,
        description = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name_ku || product.name_ku,
      name_ar || product.name_ar,
      barcode || product.barcode,
      quantity !== undefined ? quantity : product.quantity,
      buy_price || product.buy_price,
      sell_price || product.sell_price,
      min_stock !== undefined ? min_stock : product.min_stock,
      category_ku || product.category_ku,
      category_ar || product.category_ar,
      description || product.description,
      is_active !== undefined ? (is_active ? 1 : 0) : product.is_active,
      id
    );

    res.json({
      success: true,
      message: 'مادە بە سەرکەوتوویی نوێکرایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە نوێکردنەوەی مادە:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// سڕینەوەی مادە
exports.deleteProduct = (req, res) => {
  try {
    const { id } = req.params;

    // پشکنینی بوونی مادە
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'مادە نەدۆزرایەوە'
      });
    }

    // سڕینەوەی مادە
    db.prepare('DELETE FROM products WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'مادە بە سەرکەوتوویی سڕایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە سڕینەوەی مادە:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی مادە کەمەکان
exports.getLowStockProducts = (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products WHERE quantity <= min_stock AND is_active = 1').all();

    res.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی مادە کەمەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی پۆلەکان
exports.getCategories = (req, res) => {
  try {
    const { language } = req.query;
    const field = language === 'ar' ? 'category_ar' : 'category_ku';
    
    const categories = db.prepare(`
      SELECT DISTINCT ${field} as category 
      FROM products 
      WHERE ${field} IS NOT NULL AND ${field} != ''
      ORDER BY ${field}
    `).all();

    res.json({
      success: true,
      data: categories.map(c => c.category)
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی پۆلەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};