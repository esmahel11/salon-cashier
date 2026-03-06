// ڕاوتەکانی چاوپێکەوتنەکان
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// هەموو ڕاوتەکان پێویستیان بە ئۆسێنتیکەیشن هەیە
router.use(authMiddleware);

// وەرگرتنی هەموو چاوپێکەوتنەکان
router.get('/', appointmentController.getAllAppointments);

// دروستکردنی چاوپێکەوتنی نوێ
router.post('/', appointmentController.createAppointment);

// نوێکردنەوەی دۆخی چاوپێکەوتن
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

// سڕینەوەی چاوپێکەوتن
router.delete('/:id', appointmentController.deleteAppointment);

// وەرگرتنی چاوپێکەوتنەکانی ئەمڕۆ
router.get('/today/list', appointmentController.getTodayAppointments);

module.exports = router;