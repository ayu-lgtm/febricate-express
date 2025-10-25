// 📁 models/spcPlant.js
const { DataTypes } = require('sequelize');
const AuditMixin = require('./AuditMixin');

module.exports = (sequelize) => {
  const SPC_PLANTS = sequelize.define('SPC_PLANTS', {
    SPC_PLANTS_ID: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    SPC_PLANTS_NAME: { type: DataTypes.STRING, allowNull: false },
    ...AuditMixin('SPC_PLANTS'),
  }, {
    schema: 'SMFB',
    tableName: 'SPC_PLANTS',
    timestamps: false
  });

  // 🔹 Hooks
  SPC_PLANTS.beforeCreate((plant, options) => {
    const userId = options.userId || 'SYSTEM';
    plant.SPC_PLANTS_CREATED_BY = userId;
    plant.SPC_PLANTS_CREATED_ON = new Date();
    if (plant.SPC_PLANTS_IS_ACTIVE == null) plant.SPC_PLANTS_IS_ACTIVE = true;
    plant._userId = userId;
  });

  SPC_PLANTS.beforeUpdate((plant, options) => {
    const userId = options.userId || plant._userId || 'SYSTEM';
    plant.SPC_PLANTS_MODIFIED_BY = userId;
    plant.SPC_PLANTS_MODIFIED_ON = new Date();
    plant._userId = userId;
  });

  return SPC_PLANTS;
};