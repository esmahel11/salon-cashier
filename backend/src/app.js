// ڕێکخستنی Express و Middlewares
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// وەرگرتنی ڕاوتەکان
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const salesRoutes = require('./routes/salesRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const customerRoutes = require('./routes/customerRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

// دروستکردنی Express App
const app = express();

// Middlewares
// CORS بۆ ڕێگەدان بە داواکاری لە هەموو سەرچاوەیەکەوە (بۆ مۆبایل)
app.use(cors({
  origin: '*', // ڕێگە بە هەموو سەرچاوەیەک بدە
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ڕاوتی سەرەتایی
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'بەخێربێیت بۆ API ی سیستەمی کاشێری ئارایشتگا',
    version: '1.0.0'
  });
});

// بەستنەوەی ڕاوتەکان
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// هەڵەڕەشەی 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'ئەم ڕاوتە نەدۆزرایەوە'
  });
});

// هەڵەڕەشەی گشتی
app.use((err, req, res, next) => {
  console.error('هەڵەی سێرڤەر:', err);
  res.status(500).json({
    success: false,
    message: 'هەڵەیەکی ناوخۆیی سێرڤەر ڕوویدا',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;