const { DataTypes } = require('sequelize');
const AuditMixin = require('./AuditMixin');
const WORKFLOW_STATUS = require('../config/workflowStatus');

module.exports = (sequelize) => {
  const APPROVAL_WORKFLOW = sequelize.define('APPROVAL_WORKFLOW', {
    APPROVAL_WORKFLOW_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    // 🔹 Link to production order
    APPROVAL_WORKFLOW_ORDER_ID: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: { tableName: 'PRODUCTION_ORDER', schema: 'SMFB' },
        key: 'PRODUCTION_ORDER_ID'
      },
      onDelete: 'CASCADE'
    },

    // 🔹 Role performing the action
    APPROVAL_WORKFLOW_ROLE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: { tableName: 'ROLE', schema: 'SMFB' },
        key: 'ROLE_ID'
      },
      onDelete: 'CASCADE'
    },

    // 🔹 Approval Level
    APPROVAL_WORKFLOW_APPROVAL_LEVEL: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // 🔹 Current Status (pending, approved, rejected, return, etc.)
    APPROVAL_WORKFLOW_STATUS: {
      type: DataTypes.ENUM(...Object.values(WORKFLOW_STATUS)),
      allowNull: false,
      defaultValue: WORKFLOW_STATUS.PENDING
    },

    // 🔹 NEW: explicitly store action type taken by user (APPROVE, REJECT, RETURN)
    APPROVAL_WORKFLOW_ACTION_TYPE: {
      type: DataTypes.ENUM(...Object.values(WORKFLOW_STATUS)),
      allowNull: true
    },

    APPROVAL_WORKFLOW_REMARKS: { type: DataTypes.TEXT },

    APPROVAL_WORKFLOW_ACTION_DATE: { type: DataTypes.DATE },

    // 🔹 Audit Columns
    ...AuditMixin('APPROVAL_WORKFLOW')
  }, {
    schema: 'SMFB',
    tableName: 'APPROVAL_WORKFLOW',
    timestamps: false
  });

  // 🔹 Hooks
  APPROVAL_WORKFLOW.beforeCreate((wf, opt) => {
    const userId = opt.userId || 'SYSTEM';
    wf.APPROVAL_WORKFLOW_CREATED_BY = userId;
    wf.APPROVAL_WORKFLOW_CREATED_ON = new Date();
    wf.APPROVAL_WORKFLOW_ACTION_DATE = new Date();
    // Set default action type same as status if not provided
    if (!wf.APPROVAL_WORKFLOW_ACTION_TYPE) {
      wf.APPROVAL_WORKFLOW_ACTION_TYPE = wf.APPROVAL_WORKFLOW_STATUS;
    }
  });

  APPROVAL_WORKFLOW.beforeUpdate((wf, opt) => {
    const userId = opt.userId || 'SYSTEM';
    wf.APPROVAL_WORKFLOW_MODIFIED_BY = userId;
    wf.APPROVAL_WORKFLOW_MODIFIED_ON = new Date();

    // whenever status changes, also update action date and default action type
    if (wf.changed('APPROVAL_WORKFLOW_STATUS')) {
      wf.APPROVAL_WORKFLOW_ACTION_DATE = new Date();
      if (!wf.APPROVAL_WORKFLOW_ACTION_TYPE) {
        wf.APPROVAL_WORKFLOW_ACTION_TYPE = wf.APPROVAL_WORKFLOW_STATUS;
      }
    }
  });

  return APPROVAL_WORKFLOW;
};