// routes/costCalculationRoutes.js
const express = require('express');
const router = express.Router();
const costCalculationController = require('../controllers/costCalculationController');

// Single cost calculation
router.post('/calculate-cost', costCalculationController.calculateCost);

// Bulk cost calculation
router.post('/calculate-bulk-costs', costCalculationController.calculateBulkCosts);

// Material code analysis
router.post('/analyze-material', costCalculationController.analyzeMaterial);

// Get conversion charges for a plant
router.get('/conversion-charges/:plantCode', costCalculationController.getConversionChargesByPlant);

// Get freight charges for a plant
router.get('/freight/:plantCode', costCalculationController.getFreightByPlant);

module.exports = router;