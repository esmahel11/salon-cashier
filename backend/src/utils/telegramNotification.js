// یارمەتیدەر بۆ ناردنی نۆتیفیکەیشن بۆ تێلیگرام
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_ENABLED = process.env.TELEGRAM_ENABLED === 'true';

// ناردنی پەیام بۆ تێلیگرام
const sendTelegramMessage = async (message) => {
  // پشکنینی ئەگەر تێلیگرام چالاک کراوە
  if (!TELEGRAM_ENABLED || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('⚠️ تێلیگرام چالاک نەکراوە');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    });

    console.log('✅ نۆتیفیکەیشن نێردرا بۆ تێلیگرام');
  } catch (error) {
    console.error('❌ هەڵە لە ناردنی نۆتیفیکەیشن بۆ تێلیگرام:', error.message);
  }
};

// فۆرماتکردنی نۆتیفیکەیشنی فرۆشتن
const formatSaleNotification = (saleData) => {
  const {
    invoice_number,
    total,
    customer_name,
    items_count,
    discount,
    user_name,
    payment_method
  } = saleData;

  const date = new Date().toLocaleString('en-GB', { 
    timeZone: 'Asia/Baghdad',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let message = `🔔 <b>فرۆشتنی نوێ!</b>\n\n`;
  message += `📋 ژمارەی پسوڵە: <code>${invoice_number}</code>\n`;
  message += `💰 کۆی گشتی: <b>${formatCurrency(total)} IQD</b>\n`;
  
  if (discount > 0) {
    message += `🎁 داشکاندن: ${formatCurrency(discount)} IQD\n`;
  }
  
  message += `📦 ژمارەی بەرهەم/خزمەتگوزاری: ${items_count}\n`;
  
  if (customer_name) {
    message += `👤 کڕیار: ${customer_name}\n`;
  }
  
  message += `💳 شێوازی پارەدان: ${payment_method === 'cash' ? 'نەقد 💵' : 'کارت 💳'}\n`;
  message += `👨‍💼 کارمەند: ${user_name}\n`;
  message += `📅 کات: ${date}\n`;

  return message;
};

// فۆرماتکردنی ژمارە بۆ نرخ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

// ناردنی نۆتیفیکەیشنی فرۆشتن
const sendSaleNotification = async (saleData) => {
  const message = formatSaleNotification(saleData);
  await sendTelegramMessage(message);
};

// ناردنی نۆتیفیکەیشنی ئاگاداری مادە کەم
const sendLowStockAlert = async (products) => {
  if (!products || products.length === 0) return;

  let message = `⚠️ <b>ئاگاداری مادە کەم!</b>\n\n`;
  message += `${products.length} بەرهەم بڕیان کەمە:\n\n`;

  products.slice(0, 10).forEach((product, index) => {
    message += `${index + 1}. ${product.name_ku}\n`;
    message += `   📦 بڕ: <b>${product.quantity}</b> (کەمترین: ${product.min_stock})\n\n`;
  });

  if (products.length > 10) {
    message += `\n... و ${products.length - 10} بەرهەمی تر`;
  }

  await sendTelegramMessage(message);
};

// ناردنی نۆتیفیکەیشنی گشتی
const sendGeneralNotification = async (title, details) => {
  let message = `ℹ️ <b>${title}</b>\n\n${details}`;
  await sendTelegramMessage(message);
};

module.exports = {
  sendTelegramMessage,
  sendSaleNotification,
  sendLowStockAlert,
  sendGeneralNotification
};