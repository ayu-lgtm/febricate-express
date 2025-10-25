// controllers/costCalculationController.js
const { ConversionCharge } = require('../models');
const costCalculationService = require('../services/costCalculationService');

// Single cost calculation
exports.calculateCost = async (req, res) => {
  try {
    const { materialCode, plantCode, orderMonth, fgDispatchCost } = req.body;
    
    
    if (!materialCode || !plantCode || !orderMonth) {
      return res.status(400).json({
        success: false,
        error: 'materialCode, plantCode, and orderMonth are required'
      });
    }

    const result = await costCalculationService.calculateProductionCost({
      materialCode,
      plantCode,
      orderMonth,
      fgDispatchCost: fgDispatchCost || 0
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Bulk cost calculation
exports.calculateBulkCosts = async (req, res) => {
  try {
    const { orders } = req.body;
    
    if (!Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        error: 'orders array is required'
      });
    }

    const results = await costCalculationService.calculateBulkCosts(orders);
    
    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Material code analysis
exports.analyzeMaterial = (req, res) => {
  try {
    const { materialCode } = req.body;
    console.log(materialCode)
    
    if (!materialCode) {
      return res.status(400).json({
        success: false,
        error: 'materialCode is required'
      });
    }

    const analysis = costCalculationService.deriveDetailsFromMaterial(materialCode);
    
    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all conversion charges for a plant
exports.getConversionChargesByPlant = async (req, res) => {
  try {
    const { plantCode } = req.params;
    
    // Call the correct service function
    const charges = await costCalculationService.getConversionChargesByPlant(plantCode);
    
    res.json({
      success: true,
      data: charges,
      count: charges.length
    });
  } catch (error) {
    console.error('Error in getConversionChargesByPlant:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get freight charges for a plant
exports.getFreightByPlant = async (req, res) => {
  try {
    const { plantCode } = req.params;
    
    const freight = await costCalculationService.getFreightCharges(plantCode);
    
    res.json({
      success: true,
      data: freight
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};