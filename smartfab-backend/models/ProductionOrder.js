const { DataTypes } = require('sequelize');
const AuditMixin = require('./AuditMixin');

module.exports = (sequelize) => {
  const PRODUCTION_ORDER = sequelize.define('PRODUCTION_ORDER', {
    PRODUCTION_ORDER_ID: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    PRODUCTION_ORDER_REQUESTOR_ID: { type: DataTypes.STRING, allowNull: false },
    PRODUCTION_ORDER_SPC_NAME: { type: DataTypes.STRING, allowNull: false },
    PRODUCTION_ORDER_CITY_CODE: { type: DataTypes.STRING },
    PRODUCTION_ORDER_VEHICLE_TYPE: { type: DataTypes.STRING },
    PRODUCTION_ORDER_CUSTOMER_NAME: { type: DataTypes.STRING, allowNull: false },
    PRODUCTION_ORDER_APPLICATION:{ type: DataTypes.STRING, allowNull: false },
    PRODUCTION_ORDER_MESH_TYPE: { type: DataTypes.STRING, allowNull: false },
    PRODUCTION_ORDER_WELDMESH_QTY: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    // Existing PRODUCTION_ORDER model mein add karein
    // PRODUCTION_ORDER_TOTAL_PRODUCED_QTY: {
    //   type: DataTypes.DECIMAL(18, 2),
    //   defaultValue: 0
    // },
    // PRODUCTION_ORDER_REMAINING_QTY: {
    //   type: DataTypes.DECIMAL(18, 2),
    //   defaultValue: 0
    // },
    // PRODUCTION_ORDER_PRODUCTION_STATUS: {
    //   type: DataTypes.ENUM('Not Started', 'In Progress', 'Completed', 'On Hold'),
    //   defaultValue: 'Not Started'
    // },
    PRODUCTION_ORDER_UNIT: { type: DataTypes.STRING, allowNull: false },
    PRODUCTION_ORDER_WELDMESH_DETAILS: { type: DataTypes.TEXT },
    PRODUCTION_ORDER_DISPATCH_LOCATION: { type: DataTypes.STRING, allowNull: false },
    PRODUCTION_ORDER_ORDER_TYPE: { type: DataTypes.STRING, allowNull: false },
    PRODUCTION_ORDER_RM_MATERIAL_NO: { type: DataTypes.STRING },
    PRODUCTION_ORDER_RM_TYPE: { type: DataTypes.STRING, allowNull: false },
    PRODUCTION_ORDER_RM_MATERIAL_DESCRIPTION: { type: DataTypes.STRING(40), allowNull: false },
    PRODUCTION_ORDER_FG_MATERIAL_DESCRIPTION: { type: DataTypes.STRING(40), allowNull: false },
    PRODUCTION_ORDER_FG_MATERIAL_NUMBER: { type: DataTypes.STRING },

    PRODUCTION_ORDER_FREIGHT_MAINTAINED: {
      type: DataTypes.BOOLEAN,
      set(v) {
        this.setDataValue(
          'PRODUCTION_ORDER_FREIGHT_MAINTAINED',
          v === 'Yes' || v === true || v === 1
        );
      },
      get() {
        return this.getDataValue('PRODUCTION_ORDER_FREIGHT_MAINTAINED') ? 'Yes' : 'No';
      }
    },
    PRODUCTION_ORDER_FREIGHT_PO_NUMBER: {
      type: DataTypes.STRING,
      allowNull: true
    },
    PRODUCTION_ORDER_FREIGHT_STD_RATE: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true
    },

    PRODUCTION_ORDER_REMARKS: { type: DataTypes.TEXT },
    PRODUCTION_ORDER_DELIVERY_DATE: { type: DataTypes.DATE, allowNull: false },
    // File paths and names
    PRODUCTION_ORDER_DRAWING_ATTACHMENT_PATH: { type: DataTypes.STRING },
    PRODUCTION_ORDER_PO_ATTACHMENT_PATH: { type: DataTypes.STRING },
    PRODUCTION_ORDER_DRAWING_ATTACHMENT_NAME: { type: DataTypes.STRING },
    PRODUCTION_ORDER_PO_ATTACHMENT_NAME: { type: DataTypes.STRING },

    // 🔹 Workflow tracking
    PRODUCTION_ORDER_STATUS: { type: DataTypes.STRING, allowNull: false },
    PRODUCTION_ORDER_CURRENT_APPROVAL_LEVEL: { type: DataTypes.INTEGER },
    PRODUCTION_ORDER_FINAL_STATUS: { type: DataTypes.STRING },
    PRODUCTION_ORDER_IS_ACTIVE: { type: DataTypes.BOOLEAN, defaultValue: true },

    // 🔹 NEW for return logic
    // PRODUCTION_ORDER_RETURN_REASON: { type: DataTypes.TEXT },
    // PRODUCTION_ORDER_LAST_RETURN_LEVEL: { type: DataTypes.INTEGER },

    // 🔹 Audit columns
    ...AuditMixin('PRODUCTION_ORDER'),
  }, {
    schema: 'SMFB',
    tableName: 'PRODUCTION_ORDER',
    timestamps: false
  });

  // 🔹 Hooks
  PRODUCTION_ORDER.beforeCreate((order, options) => {
    const userId = options.userId || 'SYSTEM';
    order.PRODUCTION_ORDER_CREATED_BY = userId;
    order.PRODUCTION_ORDER_CREATED_ON = new Date();
    if (order.PRODUCTION_ORDER_IS_ACTIVE == null) order.PRODUCTION_ORDER_IS_ACTIVE = true;
    order._userId = userId;
  });

  PRODUCTION_ORDER.beforeUpdate((order, options) => {
    const userId = options.userId || order._userId || 'SYSTEM';
    order.PRODUCTION_ORDER_MODIFIED_BY = userId;
    order.PRODUCTION_ORDER_MODIFIED_ON = new Date();
    order._userId = userId;
  });

  // 🔹 After create hook — create workflow automatically
  PRODUCTION_ORDER.afterCreate(async (order, options) => {
    try {
      // NOTE: update to your real service name here
      const { createApprovalWorkflow } = require('../services/approvalDashboardService');
      const userId = options.userId || order.PRODUCTION_ORDER_REQUESTOR_ID || 'SYSTEM';
      await createApprovalWorkflow(order, userId);
    } catch (err) {
      console.error('❌ Error creating approval workflow:', err);
    }
  });

  return PRODUCTION_ORDER;
};