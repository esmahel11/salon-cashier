// کۆنتڕۆڵەری خزمەتگوزارییەکان
const db = require('../config/database');

// وەرگرتنی هەموو خزمەتگوزارییەکان
exports.getAllServices = (req, res) => {
  try {
    const { search, active } = req.query;
    let query = 'SELECT * FROM services WHERE 1=1';
    const params = [];

    // فلتەری گەڕان
    if (search) {
      query += ' AND (name_ku LIKE ? OR name_ar LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // فلتەری چالاک/ناچالاک
    if (active !== undefined) {
      query += ' AND is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY name_ku ASC';

    const services = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: services,
      count: services.length
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی خزمەتگوزارییەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی خزمەتگوزاریێک بە ID
exports.getServiceById = (req, res) => {
  try {
    const { id } = req.params;
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'خزمەتگوزاری نەدۆزرایەوە'
      });
    }

    res.json({
      success: true,
      data: service
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی خزمەتگوزاری:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// زیادکردنی خزمەتگوزاریی نوێ
exports.addService = (req, res) => {
  try {
    const { name_ku, name_ar, price, duration, description_ku, description_ar } = req.body;

    // پشکنینی داتاکان
    if (!name_ku || !name_ar || !price) {
      return res.status(400).json({
        success: false,
        message: 'تکایە خانە پێویستەکان پڕ بکەرەوە'
      });
    }

    // زیادکردنی خزمەتگوزاری
    const result = db.prepare(`
      INSERT INTO services (name_ku, name_ar, price, duration, description_ku, description_ar)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name_ku, name_ar, price, duration || 30, description_ku || null, description_ar || null);

    res.status(201).json({
      success: true,
      message: 'خزمەتگوزاری بە سەرکەوتوویی زیادکرا',
      data: { id: result.lastInsertRowid }
    });

  } catch (error) {
    console.error('هەڵە لە زیادکردنی خزمەتگوزاری:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// نوێکردنەوەی خزمەتگوزاری
exports.updateService = (req, res) => {
  try {
    const { id } = req.params;
    const { name_ku, name_ar, price, duration, description_ku, description_ar, is_active } = req.body;

    // پشکنینی بوونی خزمەتگوزاری
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'خزمەتگوزاری نەدۆزرایەوە'
      });
    }

    // نوێکردنەوەی خزمەتگوزاری
    db.prepare(`
      UPDATE services SET
        name_ku = ?,
        name_ar = ?,
        price = ?,
        duration = ?,
        description_ku = ?,
        description_ar = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name_ku || service.name_ku,
      name_ar || service.name_ar,
      price !== undefined ? price : service.price,
      duration !== undefined ? duration : service.duration,
      description_ku || service.description_ku,
      description_ar || service.description_ar,
      is_active !== undefined ? (is_active ? 1 : 0) : service.is_active,
      id
    );

    res.json({
      success: true,
      message: 'خزمەتگوزاری بە سەرکەوتوویی نوێکرایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە نوێکردنەوەی خزمەتگوزاری:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// سڕینەوەی خزمەتگوزاری
exports.deleteService = (req, res) => {
  try {
    const { id } = req.params;

    // پشکنینی بوونی خزمەتگوزاری
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'خزمەتگوزاری نەدۆزرایەوە'
      });
    }

    // سڕینەوەی خزمەتگوزاری
    db.prepare('DELETE FROM services WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'خزمەتگوزاری بە سەرکەوتوویی سڕایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە سڕینەوەی خزمەتگوزاری:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};