// ڕاوتەکانی خزمەتگوزارییەکان
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');

// هەموو ڕاوتەکان پێویستیان بە ئۆسێنتیکەیشن هەیە
router.use(authMiddleware);

// وەرگرتنی هەموو خزمەتگوزارییەکان
router.get('/', serviceController.getAllServices);

// وەرگرتنی خزمەتگوزاریێک بە ID
router.get('/:id', serviceController.getServiceById);

// زیادکردنی خزمەتگوزاری (تەنها admin)
router.post('/', roleCheck('admin'), serviceController.addService);

// نوێکردنەوەی خزمەتگوزاری (تەنها admin)
router.put('/:id', roleCheck('admin'), serviceController.updateService);

// سڕینەوەی خزمەتگوزاری (تەنها admin)
router.delete('/:id', roleCheck('admin'), serviceController.deleteService);

module.exports = router;