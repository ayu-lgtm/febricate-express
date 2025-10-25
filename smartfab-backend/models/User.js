// 📁 models/User.js
const { DataTypes } = require('sequelize');
const AuditMixin = require('./AuditMixin');

module.exports = (sequelize) => {
  const USER = sequelize.define('USER', {
    USER_ID: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    USER_USERNAME: { type: DataTypes.STRING, allowNull: false },
    USER_EMAIL: { type: DataTypes.STRING, allowNull: false },
    USER_ROLE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: { tableName: 'ROLE', schema: 'SMFB' }, key: 'ROLE_ID' }
    },
    ...AuditMixin('USER'),
  }, {
    schema: 'SMFB',
    tableName: 'USER',
    timestamps: false,
    indexes: [{ unique: true, fields: ['USER_EMAIL'] }]
  });

  // 🔹 Hooks
  USER.beforeCreate((user, options) => {
    const userId = options.userId || 'SYSTEM';
    user.USER_CREATED_BY = userId;
    user.USER_CREATED_ON = new Date();
    if (user.USER_IS_ACTIVE == null) user.USER_IS_ACTIVE = true;
    user._userId = userId;
  });

  USER.beforeUpdate((user, options) => {
    const userId = options.userId || user._userId || 'SYSTEM';
    user.USER_MODIFIED_BY = userId;
    user.USER_MODIFIED_ON = new Date();
    user._userId = userId;
  });

  return USER;
};