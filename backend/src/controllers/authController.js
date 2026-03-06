// کۆنتڕۆڵەری ئۆسێنتیکەیشن
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// چوونەژوورەوە
exports.login = (req, res) => {
  try {
    const { username, password } = req.body;

    // پشکنینی داتاکان
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'تکایە هەموو خانەکان پڕ بکەرەوە'
      });
    }

    // دۆزینەوەی بەکارهێنەر
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە'
      });
    }

    // پشکنینی وشەی نهێنی
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە'
      });
    }

    // دروستکردنی تۆکن
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        language: user.language
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // وەڵامدانەوە
    res.json({
      success: true,
      message: 'بە سەرکەوتوویی چوویتە ژوورەوە',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          language: user.language
        }
      }
    });

  } catch (error) {
    console.error('هەڵەی چوونەژوورەوە:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا لە سێرڤەر'
    });
  }
};

// وەرگرتنی زانیاری بەکارهێنەری ئێستا
exports.getCurrentUser = (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, full_name, role, language FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'بەکارهێنەر نەدۆزرایەوە'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('هەڵە لە وەرگرتنی زانیاری بەکارهێنەر:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};

// گۆڕینی وشەی نهێنی
exports.changePassword = (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // پشکنینی داتاکان
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'تکایە هەموو خانەکان پڕ بکەرەوە'
      });
    }

    // وەرگرتنی بەکارهێنەر
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    // پشکنینی وشەی نهێنی کۆن
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'وشەی نهێنی ئێستا هەڵەیە'
      });
    }

    // هاش کردنی وشەی نهێنی نوێ
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // نوێکردنەوەی وشەی نهێنی
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedPassword, req.user.id);

    res.json({
      success: true,
      message: 'وشەی نهێنی بە سەرکەوتوویی گۆڕدرا'
    });

  } catch (error) {
    console.error('هەڵە لە گۆڕینی وشەی نهێنی:', error);
    res.status(500).json({
      success: false,
      message: 'هەڵەیەک ڕوویدا'
    });
  }
};