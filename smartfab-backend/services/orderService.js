// 📁 services/orderService.js
const { ProductionOrder, SPCPlant, MaterialMapping, CodeMaster } = require("../models");

/**
 * Create a new production order
 * @param {Object} orderData - The order data
 * @param {string} userId - User ID creating the order
 * @returns {Promise<Object>} The created order
 */
exports.createOrder = async (orderData, userId) => {
  try {
    // Check if order already exists
    const exists = await ProductionOrder.findOne({
      where: { PRODUCTION_ORDER_ID: orderData.PRODUCTION_ORDER_ID },
    });
    
    if (exists) throw new Error("Order with this ID already exists.");

    // Create order
    // console.log(orderData)
    const order = await ProductionOrder.create(orderData, { userId });
    return order.toJSON();
  } catch (err) {
    console.error("Service layer error in createOrder:", err.message);
    throw err;
  }
};

// exports.updateOrder = async (orderId, updateData, userId) => {
//   try {
//     const order = await ProductionOrder.findOne({ where: { PRODUCTION_ORDER_ID: orderId } });
//     if (!order) throw new Error("Order not found");

//     // Check if user can edit this order
//     // const canEdit = await this.canUserEditOrder(orderId, userId, updateData.userRole);
//     // console.log(userId ,"_",canEdit)
//     // if (!canEdit) {
//     //   throw new Error("User cannot edit this order in current status");
//     // }

//     const updatedOrder = await order.update(updateData, { userId });
        
//     // Re-create approval workflow for resubmitted orders
//     if (order.PRODUCTION_ORDER_STATUS.includes("Returned")) {
//       const { createApprovalWorkflow } = require("./approvalDashboardService");
//       await createApprovalWorkflow(updatedOrder, userId);
//     }
        
//     return updatedOrder.toJSON();
//   } catch (err) {
//     console.error("Service layer error in updateOrder:", err.message);
//     throw err;
//   }
// };


exports.updateOrder = async (orderId, updateData, userId) => {
  try {
    const order = await ProductionOrder.findOne({ where: { PRODUCTION_ORDER_ID: orderId } });
    if (!order) throw new Error("Order not found");

    try {
        const updatedOrder = await order.update(updateData, { userId });
        console.log("Order status:", updatedOrder.status);
    } catch (error) {
        console.error("Failed to update order:", error);
    }

    // 🔹 Re-create approval workflow (like afterCreate hook)
    const { createApprovalWorkflow } = require("./approvalDashboardService");
    await createApprovalWorkflow(order, userId);

    return order.toJSON();
  } catch (err) {
    console.error("Service layer error in updateOrder:", err.message);
    throw err;
  }
};
/**
 * Get all production orders with optional filters
 * @param {Object} filters - Filtering options (status, spcName, customerName)
 * @param {number} page - Page number
 * @param {number} limit - Records per page
 * @returns {Promise<Object>} Paginated orders
 */
exports.getAllOrders = async (filters = {}, page = 1, limit = 10) => {
  try {
    const where = {};

    if (filters.status) where.PRODUCTION_ORDER_STATUS = filters.status;
    if (filters.spcName) where.PRODUCTION_ORDER_SPC_NAME = filters.spcName;
    if (filters.customerName) where.PRODUCTION_ORDER_CUSTOMER_NAME = filters.customerName;

    const offset = (page - 1) * limit;

    const { count, rows } = await ProductionOrder.findAndCountAll({
      where,
      order: [["PRODUCTION_ORDER_CREATED_ON", "DESC"]],
      limit,
      offset,
    });

    return {
      total: count,
      page,
      pageSize: limit,
      data: rows.map(r => r.toJSON()),
    };
  } catch (error) {
    console.error("Error in getAllOrders service:", error.message);
    throw new Error("Failed to fetch orders");
  }
};


/**
 * Get production orders created by a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of orders
 */
exports.getOrdersByUser = async (userId) => {
  try {
    const orders = await ProductionOrder.findAll({
      where: { PRODUCTION_ORDER_REQUESTOR_ID: userId },
      order: [["PRODUCTION_ORDER_CREATED_ON", "DESC"]],
    });

    return orders.map(o => o.toJSON());
  } catch (error) {
    console.error("Error in getOrdersByUser service:", error.message);
    throw new Error("Failed to fetch user orders");
  }
};

/**
 * Get orders pending approval at a specific level
 * @param {number} level - Approval level
 * @returns {Promise<Array>} List of pending orders
 */
exports.getOrdersByApprovalLevel = async (level) => {
  try {
    const orders = await ProductionOrder.findAll({
      where: {
        PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL: level,
        PRODUCTION_ORDER_STATUS: "Pending with SPC Manager",
      },
      order: [["PRODUCTION_ORDER_CREATED_ON", "DESC"]],
    });

    return orders.map(o => o.toJSON());
  } catch (error) {
    console.error("Error in getOrdersByApprovalLevel service:", error.message);
    throw new Error("Failed to fetch orders by approval level");
  }
};

/**
 * Get all active production orders
 * @returns {Promise<Array>} List of active orders
 */
exports.getActiveOrders = async () => {
  try {
    const orders = await ProductionOrder.findAll({
      where: { PRODUCTION_ORDER_IS_ACTIVE: true },
      order: [["PRODUCTION_ORDER_CREATED_ON", "DESC"]],
    });

    return orders.map(o => o.toJSON());
  } catch (error) {
    console.error("Error in getActiveOrders service:", error.message);
    throw new Error("Failed to fetch active orders");
  }
};



/**
 * Get all active SPC plants
 * @returns {Promise<Array>} Array of SPC plants
 */
exports.getSPCPlants = async () => {
  try {
    return await SPCPlant.findAll({
      where: { SPC_PLANTS_IS_ACTIVE: true },
      order: [["SPC_PLANTS_NAME", "ASC"]],
    });
  } catch (error) {
    console.error("Error in getSPCPlants service:", error);
    throw new Error("Failed to fetch SPC plants");
  }
};

/**
 * Get all active material mappings
 * @returns {Promise<Array>} Array of material mappings
 */
exports.getMaterialMappings = async () => {
  try {
    return await MaterialMapping.findAll({
      where: { MATERIAL_MAPPING_IS_ACTIVE: true },
      attributes: [
        "MATERIAL_MAPPING_ID",
        "MATERIAL_MAPPING_DESCRIPTION",
        "MATERIAL_MAPPING_ALIAS",
      ],
      order: [["MATERIAL_MAPPING_DESCRIPTION", "ASC"]],
    });
  } catch (err) {
    console.error("Error in getMaterialMappings service:", err.message);
    throw new Error("Failed to fetch material mappings");
  }
};

/**
 * Get code values by category from CodeMaster
 * @param {string} category - Category key
 * @returns {Promise<Array>} Array of code values
 */
exports.getCodeValues = async (category) => {
  try {
    return await CodeMaster.findAll({
      where: {
        CODE_MASTER_CATEGORY: category,
        CODE_MASTER_IS_ACTIVE: true,
      },
      order: [["CODE_MASTER_ORDER", "ASC"]],
      attributes: [
        "CODE_MASTER_KEY",
        "CODE_MASTER_VALUE",
        "CODE_MASTER_DESCRIPTION",
      ],
    });
  } catch (error) {
    console.error(
      `Error fetching code values for category ${category}:`,
      error.message
    );
    throw new Error(`Failed to fetch code values for category: ${category}`);
  }
};


exports.getOrderById = async (orderId) => {
  try {
    const order = await ProductionOrder.findOne({
      where: { PRODUCTION_ORDER_ID: orderId },
      attributes: [
        "PRODUCTION_ORDER_ID",
        "PRODUCTION_ORDER_REQUESTOR_ID",
        "PRODUCTION_ORDER_SPC_NAME",
        "PRODUCTION_ORDER_CITY_CODE",
        "PRODUCTION_ORDER_VEHICLE_TYPE",
        "PRODUCTION_ORDER_CUSTOMER_NAME",
        "PRODUCTION_ORDER_APPLICATION",
        "PRODUCTION_ORDER_MESH_TYPE",
        "PRODUCTION_ORDER_WELDMESH_QTY",
        "PRODUCTION_ORDER_UNIT",
        "PRODUCTION_ORDER_WELDMESH_DETAILS",
        "PRODUCTION_ORDER_DISPATCH_LOCATION",
        "PRODUCTION_ORDER_ORDER_TYPE",
        "PRODUCTION_ORDER_RM_MATERIAL_NO",
        "PRODUCTION_ORDER_RM_TYPE",
        "PRODUCTION_ORDER_RM_MATERIAL_DESCRIPTION",
        "PRODUCTION_ORDER_FG_MATERIAL_NUMBER",
        "PRODUCTION_ORDER_FG_MATERIAL_DESCRIPTION",
        "PRODUCTION_ORDER_FREIGHT_MAINTAINED",
        "PRODUCTION_ORDER_FREIGHT_PO_NUMBER",       // NEW
        "PRODUCTION_ORDER_FREIGHT_STD_RATE",        // NEW
        "PRODUCTION_ORDER_REMARKS",
        "PRODUCTION_ORDER_DELIVERY_DATE",
        "PRODUCTION_ORDER_DRAWING_ATTACHMENT_PATH",
        "PRODUCTION_ORDER_PO_ATTACHMENT_PATH",
        "PRODUCTION_ORDER_STATUS",
        "PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL",
        "PRODUCTION_ORDER_FINAL_STATUS",
        "PRODUCTION_ORDER_IS_ACTIVE",
        "PRODUCTION_ORDER_CREATED_BY",
        "PRODUCTION_ORDER_CREATED_ON",
        "PRODUCTION_ORDER_MODIFIED_BY",
        "PRODUCTION_ORDER_MODIFIED_ON"
      ]
    });
    return order ? order.toJSON() : null;
  } catch (error) {
    console.error("Error in getOrderById service:", error.message);
    throw new Error("Failed to fetch order");
  }
};

exports.canUserEditOrder = async (orderId, userId, userRole) => {
  try {
    const order = await ProductionOrder.findOne({
      where: { PRODUCTION_ORDER_ID: orderId }
    });
        
    if (!order) return false;
        
    const status = order.PRODUCTION_ORDER_STATUS;
        
    // Sales can edit orders returned to them
    if (userRole === "sales" && status === "Returned to Sales") {
      return true;
    }
    
    // Admin can edit orders returned to sales or manager
    if (userRole === "admin" && (status === "Returned to Sales" || status === "Returned to SPC Manager")) {
      return true;
    }
        
    // SPC Manager can edit orders returned to them
    if (userRole === "spc_manager" && status === "Returned to SPC Manager") {
      return true;
    }
        
    return false;
  } catch (error) {
    console.error("Error in canUserEditOrder service:", error.message);
    return false;
  }
}
