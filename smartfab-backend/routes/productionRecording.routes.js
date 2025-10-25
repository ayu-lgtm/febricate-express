const express = require('express');
const router = express.Router();
const productionRecordingController = require('../controllers/productionRecordingController');

// 🔹 Create production recording
router.post('/create', productionRecordingController.createProductionRecording);

// 🔹 Get production history for an order
router.get('/history/:orderId', productionRecordingController.getProductionHistory);

// 🔹 Get approved orders for production
router.get('/approved-orders', productionRecordingController.getApprovedOrders);

// 🔹 Get monthly production summary
router.get('/monthly-summary/:month/:year', productionRecordingController.getMonthlyProductionSummary);

// 🔹 Update production recording
router.put('/update/:recordingId', productionRecordingController.updateProductionRecording);

// 🔹 Delete production recording
router.delete('/delete/:recordingId', productionRecordingController.deleteProductionRecording);

// 🔹 Get production recording by ID
// router.get('/:recordingId', productionRecordingController.getProductionRecordingById);
// 🔹 Get quick stats (Today, This Week, This Month)
router.get('/quick-stats', productionRecordingController.getQuickStats);

module.exports = router;