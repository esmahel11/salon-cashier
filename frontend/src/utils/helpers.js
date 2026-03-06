// فەنکشنە یارمەتیدەرەکان

// فۆرمات کردنی ژمارە بۆ نرخ
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

// فۆرمات کردنی بەروار
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
};

// فۆرمات کردنی کات
export const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString.substring(0, 5); // HH:MM
};

// فۆرمات کردنی بەروار و کات پێکەوە
export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return `${formatDate(date)} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

// وەرگرتنی بەرواری ئەمڕۆ بە فۆرماتی YYYY-MM-DD
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// وەرگرتنی کاتی ئێستا بە فۆرماتی HH:MM
export const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().substring(0, 5);
};

// حیسابکردنی داشکاندن
export const calculateDiscount = (subtotal, discountType, discountValue) => {
  if (discountType === 'percentage') {
    return subtotal * (discountValue / 100);
  } else if (discountType === 'fixed') {
    return discountValue;
  }
  return 0;
};

// پشکنینی ئەگەر بەکارهێنەر admin بێت
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

// خزنکردنی لە localStorage
export const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('هەڵە لە خەزنکردن لە localStorage:', error);
  }
};

// وەرگرتن لە localStorage
export const getFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('هەڵە لە وەرگرتن لە localStorage:', error);
    return null;
  }
};

// سڕینەوە لە localStorage
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('هەڵە لە سڕینەوە لە localStorage:', error);
  }
};

// دروستکردنی ژمارەی پسوڵە
export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
};

// پشکنینی ڕاستی ئیمەیڵ
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// پشکنینی ڕاستی ژمارەی مۆبایل
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
};