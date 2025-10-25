const { ProductionRecording, ProductionOrder, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new production recording entry
 */
exports.createProductionRecording = async (recordingData, userId) => {
  try {
    // Validate order exists and is approved
    const order = await ProductionOrder.findOne({
      where: {
        PRODUCTION_ORDER_ID: recordingData.PRODUCTION_RECORDING_ORDER_ID,
        PRODUCTION_ORDER_FINAL_STATUS: 'APPROVED',
        PRODUCTION_ORDER_IS_ACTIVE: true
      }
    });

    if (!order) {
      throw new Error('Order not found or not approved');
    }

    // Check if quantity exceeds remaining quantity
    const totalProduced = await exports.getTotalProducedQuantity(recordingData.PRODUCTION_RECORDING_ORDER_ID);
    const remainingQuantity = order.PRODUCTION_ORDER_WELDMESH_QTY - totalProduced;
    
    if (recordingData.PRODUCTION_RECORDING_QUANTITY > remainingQuantity) {
      throw new Error(`Production quantity exceeds remaining quantity. Remaining: ${remainingQuantity} ${order.PRODUCTION_ORDER_UNIT}`);
    }

    const recording = await ProductionRecording.create({
      ...recordingData,
      PRODUCTION_RECORDING_RECORDED_BY: userId
    }, { userId });

    return recording.toJSON();
  } catch (error) {
    console.error('Error creating production recording:', error);
    throw error;
  }
};

/**
 * Get total produced quantity for an order
 */
exports.getTotalProducedQuantity = async (orderId) => {
  try {
    const result = await ProductionRecording.sum('PRODUCTION_RECORDING_QUANTITY', {
      where: {
        PRODUCTION_RECORDING_ORDER_ID: orderId,
        PRODUCTION_RECORDING_IS_ACTIVE: true
      }
    });
    return result || 0;
  } catch (error) {
    console.error('Error getting total produced quantity:', error);
    throw error;
  }
};

/**
 * Get production history for an order
 */
exports.getProductionHistory = async (orderId) => {
  try {
    const recordings = await ProductionRecording.findAll({
      where: {
        PRODUCTION_RECORDING_ORDER_ID: orderId,
        PRODUCTION_RECORDING_IS_ACTIVE: true
      },
      
      order: [['PRODUCTION_RECORDING_DATE', 'DESC']]
    });

    return recordings.map(rec => rec.toJSON());
  } catch (error) {
    console.error('Error getting production history:', error);
    throw error;
  }
};

/**
 * Get approved orders available for production recording
 */
exports.getApprovedOrders = async () => {
  try {
    const orders = await ProductionOrder.findAll({
      where: {
        PRODUCTION_ORDER_FINAL_STATUS: 'APPROVED',
        PRODUCTION_ORDER_IS_ACTIVE: true
      },
      attributes: [
        'PRODUCTION_ORDER_ID',
        'PRODUCTION_ORDER_CUSTOMER_NAME',
        'PRODUCTION_ORDER_SPC_NAME',
        'PRODUCTION_ORDER_WELDMESH_QTY',
        'PRODUCTION_ORDER_UNIT',
        'PRODUCTION_ORDER_FG_MATERIAL_DESCRIPTION'
      ],
      order: [['PRODUCTION_ORDER_CREATED_ON', 'DESC']]
    });

    // Add remaining quantity to each order
    const ordersWithRemaining = await Promise.all(
      orders.map(async (order) => {
        const totalProduced = await exports.getTotalProducedQuantity(order.PRODUCTION_ORDER_ID);
        const remainingQuantity = order.PRODUCTION_ORDER_WELDMESH_QTY - totalProduced;
        
        return {
          ...order.toJSON(),
          totalProduced,
          remainingQuantity: remainingQuantity > 0 ? remainingQuantity : 0,
          isCompleted: remainingQuantity <= 0
        };
      })
    );

    return ordersWithRemaining.filter(order => !order.isCompleted);
  } catch (error) {
    console.error('Error getting approved orders:', error);
    throw error;
  }
};

/**
 * Get monthly production summary
 */
exports.getMonthlyProductionSummary = async (month, year) => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const productions = await ProductionRecording.findAll({
      where: {
        PRODUCTION_RECORDING_DATE: {
          [Op.between]: [startDate, endDate]
        },
        PRODUCTION_RECORDING_IS_ACTIVE: true
      },
      include: [
        {
          model: ProductionOrder,
          as: 'Order',
          attributes: ['PRODUCTION_ORDER_ID', 'PRODUCTION_ORDER_CUSTOMER_NAME', 'PRODUCTION_ORDER_FG_MATERIAL_DESCRIPTION']
        }
        
      ],
      order: [['PRODUCTION_RECORDING_DATE', 'ASC']]
    });

    // Group by date
    const dailyProduction = {};
    productions.forEach(prod => {
      const dateStr = prod.PRODUCTION_RECORDING_DATE.toISOString().split('T')[0];
      if (!dailyProduction[dateStr]) {
        dailyProduction[dateStr] = {
          date: dateStr,
          productions: [],
          totalQuantity: 0
        };
      }
      dailyProduction[dateStr].productions.push(prod.toJSON());
      dailyProduction[dateStr].totalQuantity += parseFloat(prod.PRODUCTION_RECORDING_QUANTITY);
    });

    return {
      dailyProduction: Object.values(dailyProduction),
      totalMonthlyProduction: productions.reduce((sum, prod) => sum + parseFloat(prod.PRODUCTION_RECORDING_QUANTITY), 0),
      productionDays: Object.keys(dailyProduction).length
    };
  } catch (error) {
    console.error('Error getting monthly production summary:', error);
    throw error;
  }
};

/**
 * Update production recording
 */
exports.updateProductionRecording = async (recordingId, updateData, userId) => {
  try {
    const recording = await ProductionRecording.findOne({
      where: {
        PRODUCTION_RECORDING_ID: recordingId,
        PRODUCTION_RECORDING_IS_ACTIVE: true
      }
    });

    if (!recording) {
      throw new Error('Production recording not found');
    }

    // If quantity is being updated, validate against remaining quantity
    if (updateData.PRODUCTION_RECORDING_QUANTITY) {
      const otherProductions = await ProductionRecording.sum('PRODUCTION_RECORDING_QUANTITY', {
        where: {
          PRODUCTION_RECORDING_ORDER_ID: recording.PRODUCTION_RECORDING_ORDER_ID,
          PRODUCTION_RECORDING_ID: { [Op.ne]: recordingId },
          PRODUCTION_RECORDING_IS_ACTIVE: true
        }
      });

      const order = await ProductionOrder.findByPk(recording.PRODUCTION_RECORDING_ORDER_ID);
      const remainingQuantity = order.PRODUCTION_ORDER_WELDMESH_QTY - (otherProductions || 0);
      
      if (updateData.PRODUCTION_RECORDING_QUANTITY > remainingQuantity) {
        throw new Error(`Updated quantity exceeds remaining quantity. Remaining: ${remainingQuantity} ${order.PRODUCTION_ORDER_UNIT}`);
      }
    }

    const updatedRecording = await recording.update(updateData, { userId });
    return updatedRecording.toJSON();
  } catch (error) {
    console.error('Error updating production recording:', error);
    throw error;
  }
};

/**
 * Delete production recording (soft delete)
 */
exports.deleteProductionRecording = async (recordingId, userId) => {
  try {
    const recording = await ProductionRecording.findOne({
      where: {
        PRODUCTION_RECORDING_ID: recordingId,
        PRODUCTION_RECORDING_IS_ACTIVE: true
      }
    });

    if (!recording) {
      throw new Error('Production recording not found');
    }

    await recording.update({
      PRODUCTION_RECORDING_IS_ACTIVE: false
    }, { userId });

    return { message: 'Production recording deleted successfully' };
  } catch (error) {
    console.error('Error deleting production recording:', error);
    throw error;
  }
};

/**
 * Get production recording by ID
 */
exports.getProductionRecordingById = async (recordingId) => {
  try {
    
    const recording = await ProductionRecording.findOne({
      where: {
        PRODUCTION_RECORDING_ID: recordingId,
        PRODUCTION_RECORDING_IS_ACTIVE: true
      },
      include: [
        {
          model: ProductionOrder,
          as: 'Order',
          attributes: ['PRODUCTION_ORDER_ID', 'PRODUCTION_ORDER_CUSTOMER_NAME', 'PRODUCTION_ORDER_FG_MATERIAL_DESCRIPTION', 'PRODUCTION_ORDER_WELDMESH_QTY', 'PRODUCTION_ORDER_UNIT']
        },
        
      ]
    });

    return recording ? recording.toJSON() : null;
  } catch (error) {
    console.error('Error getting production recording by ID:', error);
    throw error;
  }
};



exports.getQuickStats = async () => {
  try {
    const today = new Date();
    
    // Create date ranges for proper comparison with DATE type
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    // Start of week (Monday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // console.log('=== Date Ranges ===');
    // console.log('Today range:', startOfToday, 'to', endOfToday);
    // console.log('Week start:', startOfWeek);
    // console.log('Month start:', startOfMonth);

    // Today's production - use date range with DATE type
    const todayProduction = await ProductionRecording.sum('PRODUCTION_RECORDING_QUANTITY', {
      where: {
        PRODUCTION_RECORDING_DATE: {
          [Op.between]: [startOfToday, endOfToday]
        },
        PRODUCTION_RECORDING_IS_ACTIVE: true,
      },
    });

    // This week's production
    const weekProduction = await ProductionRecording.sum('PRODUCTION_RECORDING_QUANTITY', {
      where: {
        PRODUCTION_RECORDING_DATE: {
          [Op.gte]: startOfWeek
        },
        PRODUCTION_RECORDING_IS_ACTIVE: true,
      },
    });

    // This month's production
    const monthProduction = await ProductionRecording.sum('PRODUCTION_RECORDING_QUANTITY', {
      where: {
        PRODUCTION_RECORDING_DATE: {
          [Op.gte]: startOfMonth
        },
        PRODUCTION_RECORDING_IS_ACTIVE: true,
      },
    });

    // console.log('=== Production Results ===');
    // console.log('Today production:', todayProduction);
    // console.log('Week production:', weekProduction);
    // console.log('Month production:', monthProduction);

    return {
      todayProduction: parseFloat(todayProduction) || 0,
      weekProduction: parseFloat(weekProduction) || 0,
      monthProduction: parseFloat(monthProduction) || 0,
    };
  } catch (error) {
    console.error('Error getting quick stats:', error);
    throw error;
  }
};