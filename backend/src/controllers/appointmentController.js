// کۆنتڕۆڵەری چاوپێکەوتنەکان
const db = require('../config/database');

// وەرگرتنی هەموو چاوپێکەوتنەکان
exports.getAllAppointments = (req, res) => {
  try {
    const { date, status, customer_id } = req.query;
    let query = `
      SELECT a.*, c.name as customer_name, c.phone as customer_phone, 
             s.name_ku as service_name, s.duration, u.full_name as created_by_name
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // فلتەری بەروار
    if (date) {
      query += ' AND a.appointment_date = ?';
      params.push(date);
    }

    // فلتەری دۆخ
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    // فلتەری کڕیار
    if (customer_id) {
      query += ' AND a.customer_id = ?';
      params.push(customer_id);
    }

    query += ' ORDER BY a.appointment_date DESC, a.appointment_time ASC';

    const appointments = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی چاوپێکەوتنەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// دروستکردنی چاوپێکەوتنی نوێ
exports.createAppointment = (req, res) => {
  try {
    const { customer_id, service_id, appointment_date, appointment_time, notes } = req.body;

    // پشکنینی داتاکان
    if (!customer_id || !service_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        message: 'تکایە هەموو خانە پێویستەکان پڕ بکەرەوە'
      });
    }

    // پشکنینی بوونی کڕیار
    const customer = db.prepare('SELECT id FROM customers WHERE id = ?').get(customer_id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'کڕیار نەدۆزرایەوە'
      });
    }

    // پشکنینی بوونی خزمەتگوزاری
    const service = db.prepare('SELECT id FROM services WHERE id = ? AND is_active = 1').get(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'خزمەتگوزاری نەدۆزرایەوە'
      });
    }

    // پشکنینی دووبارەبوونەوەی کات
    const existing = db.prepare(`
      SELECT id FROM appointments 
      WHERE appointment_date = ? AND appointment_time = ? AND status != 'cancelled'
    `).get(appointment_date, appointment_time);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'ئەم کاتە پێشتر حەجزکراوە'
      });
    }

    // دروستکردنی چاوپێکەوتن
    const result = db.prepare(`
      INSERT INTO appointments (customer_id, service_id, appointment_date, appointment_time, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(customer_id, service_id, appointment_date, appointment_time, notes || null, req.user.id);

    res.status(201).json({
      success: true,
      message: 'چاوپێکەوتن بە سەرکەوتوویی حەجزکرا',
      data: { id: result.lastInsertRowid }
    });

  } catch (error) {
    console.error('هەڵە لە دروستکردنی چاوپێکەوتن:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// نوێکردنەوەی دۆخی چاوپێکەوتن
exports.updateAppointmentStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // پشکنینی دۆخ
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'دۆخی نادروست'
      });
    }

    // پشکنینی بوونی چاوپێکەوتن
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'چاوپێکەوتن نەدۆزرایەوە'
      });
    }

    // نوێکردنەوەی دۆخ
    db.prepare('UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);

    res.json({
      success: true,
      message: 'دۆخ بە سەرکەوتوویی نوێکرایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە نوێکردنەوەی دۆخ:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// سڕینەوەی چاوپێکەوتن
exports.deleteAppointment = (req, res) => {
  try {
    const { id } = req.params;

    // پشکنینی بوونی چاوپێکەوتن
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'چاوپێکەوتن نەدۆزرایەوە'
      });
    }

    // سڕینەوەی چاوپێکەوتن
    db.prepare('DELETE FROM appointments WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'چاوپێکەوتن بە سەرکەوتوویی سڕایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە سڕینەوەی چاوپێکەوتن:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// وەرگرتنی چاوپێکەوتنەکانی ئەمڕۆ
exports.getTodayAppointments = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const appointments = db.prepare(`
      SELECT a.*, c.name as customer_name, c.phone as customer_phone, 
             s.name_ku as service_name, s.duration
      FROM appointments a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.appointment_date = ?
      ORDER BY a.appointment_time ASC
    `).all(today);

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی چاوپێکەوتنەکانی ئەمڕۆ:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};