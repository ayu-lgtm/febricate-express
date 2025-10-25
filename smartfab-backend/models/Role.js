// 📁 models/Role.js
const { DataTypes } = require('sequelize');
const AuditMixin = require('./AuditMixin');

module.exports = (sequelize) => {
  const ROLE = sequelize.define('ROLE', {
    ROLE_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ROLE_ROLE_NAME: { type: DataTypes.STRING, allowNull: false },
    ...AuditMixin('ROLE'),
  }, {
    schema: 'SMFB',
    tableName: 'ROLE',
    timestamps: false,
    indexes: [{ unique: true, fields: ['ROLE_ROLE_NAME'] }],
  });

  // 🔹 Hooks
  ROLE.beforeCreate((role, options) => {
    const userId = options.userId || 'SYSTEM';
    role.ROLE_CREATED_BY = userId;
    role.ROLE_CREATED_ON = new Date();
    if (role.ROLE_IS_ACTIVE == null) role.ROLE_IS_ACTIVE = true;
    role._userId = userId;
  });

  ROLE.beforeUpdate((role, options) => {
    const userId = options.userId || role._userId || 'SYSTEM';
    role.ROLE_MODIFIED_BY = userId;
    role.ROLE_MODIFIED_ON = new Date();
    role._userId = userId;
  });

  return ROLE;
};