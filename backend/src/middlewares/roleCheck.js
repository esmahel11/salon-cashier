// میدڵوێری بۆ پشکنینی ڕۆڵی بەکارهێنەر
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    // پشکنینی ئەگەر بەکارهێنەر لە request دا هەیە
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'تکایە سەرەتا بچۆرە ژوورەوە'
      });
    }

    // پشکنینی ڕۆڵی بەکارهێنەر
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'تۆ مافی ئەم کردارەت نییە'
      });
    }

    next();
  };
};

module.exports = roleCheck;