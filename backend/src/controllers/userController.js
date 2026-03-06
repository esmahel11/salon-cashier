// کۆنتڕۆڵەری بەکارهێنەرەکان
const db = require('../config/database');
const bcrypt = require('bcryptjs');

// وەرگرتنی هەموو بەکارهێنەرەکان (تەنها بۆ admin)
exports.getAllUsers = (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, username, full_name, role, language, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.json({
      success: true,
      data: users,
      count: users.length
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی بەکارهێنەرەکان:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// زیادکردنی بەکارهێنەری نوێ
exports.addUser = (req, res) => {
  try {
    const { username, password, full_name, role, language } = req.body;

    // پشکنینی داتاکان
    if (!username || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        message: 'تکایە هەموو خانە پێویستەکان پڕ بکەرەوە'
      });
    }

    // پشکنینی ڕۆڵ
    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'ڕۆڵی نادروست'
      });
    }

    // پشکنینی دووبارەبوونەوەی ناوی بەکارهێنەر
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'ئەم ناوی بەکارهێنەرە پێشتر بەکارهێنراوە'
      });
    }

    // هاش کردنی وشەی نهێنی
    const hashedPassword = bcrypt.hashSync(password, 10);

    // زیادکردنی بەکارهێنەر
    const result = db.prepare(`
      INSERT INTO users (username, password, full_name, role, language)
      VALUES (?, ?, ?, ?, ?)
    `).run(username, hashedPassword, full_name, role, language || 'ku');

    res.status(201).json({
      success: true,
      message: 'بەکارهێنەر بە سەرکەوتوویی زیادکرا',
      data: { id: result.lastInsertRowid }
    });

  } catch (error) {
    console.error('هەڵە لە زیادکردنی بەکارهێنەر:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// نوێکردنەوەی بەکارهێنەر
exports.updateUser = (req, res) => {
  try {
    const { id } = req.params;
    const { username, full_name, role, language, is_active } = req.body;

    // پشکنینی بوونی بەکارهێنەر
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'بەکارهێنەر نەدۆزرایەوە'
      });
    }

    // پشکنینی دووبارەبوونەوەی ناوی بەکارهێنەر
    if (username && username !== user.username) {
      const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, id);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'ئەم ناوی بەکارهێنەرە پێشتر بەکارهێنراوە'
        });
      }
    }

    // نوێکردنەوەی بەکارهێنەر
    db.prepare(`
      UPDATE users SET
        username = ?,
        full_name = ?,
        role = ?,
        language = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      username || user.username,
      full_name || user.full_name,
      role || user.role,
      language || user.language,
      is_active !== undefined ? (is_active ? 1 : 0) : user.is_active,
      id
    );

    res.json({
      success: true,
      message: 'بەکارهێنەر بە سەرکەوتوویی نوێکرایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە نوێکردنەوەی بەکارهێنەر:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// ڕێسێت کردنی وشەی نهێنی
exports.resetPassword = (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'وشەی نهێنی دەبێت لانیکەم ٤ پیت بێت'
      });
    }

    // پشکنینی بوونی بەکارهێنەر
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'بەکارهێنەر نەدۆزرایەوە'
      });
    }

    // هاش کردنی وشەی نهێنی نوێ
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // نوێکردنەوەی وشەی نهێنی
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedPassword, id);

    res.json({
      success: true,
      message: 'وشەی نهێنی بە سەرکەوتوویی ڕێسێت کرا'
    });

  } catch (error) {
    console.error('هەڵە لە ڕێسێت کردنی وشەی نهێنی:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// سڕینەوەی بەکارهێنەر
exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;

    // پشکنینی بوونی بەکارهێنەر
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'بەکارهێنەر نەدۆزرایەوە'
      });
    }

    // ڕێگری لە سڕینەوەی خۆت
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'ناتوانیت هەژمارەکەی خۆت بسڕیتەوە'
      });
    }

    // سڕینەوەی بەکارهێنەر
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'بەکارهێنەر بە سەرکەوتوویی سڕایەوە'
    });

  } catch (error) {
    console.error('هەڵە لە سڕینەوەی بەکارهێنەر:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};