// 📁 models/MaterialMapping.js
const { DataTypes } = require('sequelize');
const AuditMixin = require('./AuditMixin');

module.exports = (sequelize) => {
  const MATERIAL_MAPPING = sequelize.define('MATERIAL_MAPPING', {
    MATERIAL_MAPPING_ID: { type: DataTypes.STRING, primaryKey: true, allowNull: false, field: 'MATERIAL_MAPPING_ID' },
    MATERIAL_MAPPING_DESCRIPTION: { type: DataTypes.STRING, allowNull: false, field: 'MATERIAL_MAPPING_DESCRIPTION' },
    MATERIAL_MAPPING_ALIAS: { type: DataTypes.STRING, allowNull: false, field: 'MATERIAL_MAPPING_ALIAS' },
    ...AuditMixin('MATERIAL_MAPPING'),
  }, { schema: 'SMFB', tableName: 'MATERIAL_MAPPING', timestamps: false });

  // 🔹 Lifecycle Hooks
  MATERIAL_MAPPING.beforeCreate((material, options) => {
    const userId = options.userId || 'SYSTEM';
    material.MATERIAL_MAPPING_CREATED_BY = userId;
    material.MATERIAL_MAPPING_CREATED_ON = new Date();
    if (material.MATERIAL_MAPPING_IS_ACTIVE === undefined || material.MATERIAL_MAPPING_IS_ACTIVE === null)
      material.MATERIAL_MAPPING_IS_ACTIVE = true;
    material._userId = userId; // keep for update hooks
  });

  MATERIAL_MAPPING.beforeUpdate((material, options) => {
    const userId = options.userId || material._userId || 'SYSTEM';
    material.MATERIAL_MAPPING_MODIFIED_BY = userId;
    material.MATERIAL_MAPPING_MODIFIED_ON = new Date();
    material._userId = userId;
  });

  return MATERIAL_MAPPING;
};