const productionRecordingService = require('../services/productionRecordingService');
const { getUserFromToken } = require('../services/authServices');

/**
 * Create production recording
 */
exports.createProductionRecording = async (req, res) => {
  try {
    const authToken = req.headers['authorization']?.split(' ')[1];
    if (!authToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await getUserFromToken(authToken);
    const recordingData = req.body;

    // Validate required fields
    const requiredFields = [
      'PRODUCTION_RECORDING_ORDER_ID',
      'PRODUCTION_RECORDING_DATE',
      'PRODUCTION_RECORDING_QUANTITY',
      'PRODUCTION_RECORDING_MACHINE_NUMBERS'
    ];

    for (const field of requiredFields) {
      if (!recordingData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const recording = await productionRecordingService.createProductionRecording(recordingData, user.userID);
    
    res.status(201).json({
      success: true,
      message: 'Production recording created successfully',
      data: recording
    });
  } catch (error) {
    console.error('Error creating production recording:', error);
    res.status(400).json({
      error: 'Failed to create production recording',
      details: error.message
    });
  }
};

/**
 * Get production history for an order
 */
exports.getProductionHistory = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const history = await productionRecordingService.getProductionHistory(orderId);
    
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting production history:', error);
    res.status(500).json({
      error: 'Failed to fetch production history',
      details: error.message
    });
  }
};

/**
 * Get approved orders for production
 */
exports.getApprovedOrders = async (req, res) => {
  try {
    const orders = await productionRecordingService.getApprovedOrders();
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error getting approved orders:', error);
    res.status(500).json({
      error: 'Failed to fetch approved orders',
      details: error.message
    });
  }
};

/**
 * Get monthly production summary
 */
exports.getMonthlyProductionSummary = async (req, res) => {
  try {
    const { month, year } = req.params;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const summary = await productionRecordingService.getMonthlyProductionSummary(
      parseInt(month),
      parseInt(year)
    );
    
    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting monthly production summary:', error);
    res.status(500).json({
      error: 'Failed to fetch production summary',
      details: error.message
    });
  }
};

/**
 * Update production recording
 */
exports.updateProductionRecording = async (req, res) => {
  try {
    const authToken = req.headers['authorization']?.split(' ')[1];
    if (!authToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await getUserFromToken(authToken);
    const { recordingId } = req.params;
    const updateData = req.body;

    if (!recordingId) {
      return res.status(400).json({ error: 'Recording ID is required' });
    }

    const updatedRecording = await productionRecordingService.updateProductionRecording(
      recordingId,
      updateData,
      user.userID
    );
    
    res.status(200).json({
      success: true,
      message: 'Production recording updated successfully',
      data: updatedRecording
    });
  } catch (error) {
    console.error('Error updating production recording:', error);
    res.status(400).json({
      error: 'Failed to update production recording',
      details: error.message
    });
  }
};

/**
 * Delete production recording
 */
exports.deleteProductionRecording = async (req, res) => {
  try {
    const authToken = req.headers['authorization']?.split(' ')[1];
    if (!authToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await getUserFromToken(authToken);
    const { recordingId } = req.params;

    if (!recordingId) {
      return res.status(400).json({ error: 'Recording ID is required' });
    }

    const result = await productionRecordingService.deleteProductionRecording(recordingId, user.userID);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting production recording:', error);
    res.status(400).json({
      error: 'Failed to delete production recording',
      details: error.message
    });
  }
};

/**
 * Get production recording by ID
 */
exports.getProductionRecordingById = async (req, res) => {
  try {
    const { recordingId } = req.params;

    if (!recordingId) {
      return res.status(400).json({ error: 'Recording ID is required' });
    }

    const recording = await productionRecordingService.getProductionRecordingById(recordingId);

    if (!recording) {
      return res.status(404).json({ error: 'Production recording not found' });
    }

    res.status(200).json({
      success: true,
      data: recording
    });
  } catch (error) {
    console.error('Error getting production recording:', error);
    res.status(500).json({
      error: 'Failed to fetch production recording',
      details: error.message
    });
  }
};

// 🔹 Get Quick Stats (Today, This Week, This Month)


exports.getQuickStats = async (req, res) => {
 

  try {
    const stats = await productionRecordingService.getQuickStats();


    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quick stats',
      details: error.message,
    });
  } 
};