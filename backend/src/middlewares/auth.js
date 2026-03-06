// میدڵوێری بۆ پشکنینی ئۆسێنتیکەیشن
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // وەرگرتنی تۆکن لە هیدەر
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'تۆکن نەدۆزرایەوە. تکایە دووبارە بچۆرە ژوورەوە'
      });
    }

    // پشکنینی تۆکن
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // زیادکردنی زانیاری بەکارهێنەر بۆ request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      language: decoded.language
    };
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'تۆکن نادروستە یان بەسەرچووە'
    });
  }
};

module.exports = authMiddleware;