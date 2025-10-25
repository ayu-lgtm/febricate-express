// 📁 models/RoleMenuMapping.js
const { DataTypes } = require('sequelize');
const AuditMixin = require('./AuditMixin');

module.exports = (sequelize) => {
  const ROLE_MENU_MAPPING = sequelize.define('ROLE_MENU_MAPPING', {
    ROLE_MENU_MAPPING_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ROLE_MENU_MAPPING_ROLE_ID: {
      type: DataTypes.INTEGER, allowNull: false,
      references: { model: { tableName: 'ROLE', schema: 'SMFB' }, key: 'ROLE_ID' }
    },
    ROLE_MENU_MAPPING_MENU_ID: {
      type: DataTypes.INTEGER, allowNull: false,
      references: { model: { tableName: 'MENU_MASTER', schema: 'SMFB' }, key: 'MENU_MASTER_ID' }
    },
    ROLE_MENU_MAPPING_CAN_VIEW: { type: DataTypes.BOOLEAN, defaultValue: true },
    ROLE_MENU_MAPPING_CAN_CREATE: { type: DataTypes.BOOLEAN, defaultValue: false },
    ROLE_MENU_MAPPING_CAN_EDIT: { type: DataTypes.BOOLEAN, defaultValue: false },
    ROLE_MENU_MAPPING_CAN_DELETE: { type: DataTypes.BOOLEAN, defaultValue: false },
    ...AuditMixin('ROLE_MENU_MAPPING'),
  }, {
    schema: 'SMFB',
    tableName: 'ROLE_MENU_MAPPING',
    timestamps: false,
    indexes: [{ unique: true, fields: ['ROLE_MENU_MAPPING_ROLE_ID', 'ROLE_MENU_MAPPING_MENU_ID'] }]
  });

  // 🔹 Hooks
  ROLE_MENU_MAPPING.beforeCreate((mapping, options) => {
    const userId = options.userId || 'SYSTEM';
    mapping.ROLE_MENU_MAPPING_CREATED_BY = userId;
    mapping.ROLE_MENU_MAPPING_CREATED_ON = new Date();
    if (mapping.ROLE_MENU_MAPPING_IS_ACTIVE == null) mapping.ROLE_MENU_MAPPING_IS_ACTIVE = true;
    mapping._userId = userId;
  });

  ROLE_MENU_MAPPING.beforeUpdate((mapping, options) => {
    const userId = options.userId || mapping._userId || 'SYSTEM';
    mapping.ROLE_MENU_MAPPING_MODIFIED_BY = userId;
    mapping.ROLE_MENU_MAPPING_MODIFIED_ON = new Date();
    mapping._userId = userId;
  });

  return ROLE_MENU_MAPPING;
};