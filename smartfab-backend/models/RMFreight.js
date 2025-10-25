const { DataTypes } = require('sequelize');
const AuditMixin = require('./AuditMixin');

module.exports = (sequelize) => {
  const FREIGHT = sequelize.define('FREIGHT', {
    FREIGHT_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    FREIGHT_PLANT: { type: DataTypes.INTEGER, allowNull: false },
    FREIGHT_FIRST_LEG: { type: DataTypes.FLOAT, allowNull: false },
    FREIGHT_SECOND_LEG: { type: DataTypes.FLOAT, allowNull: false },
    FREIGHT_DESCRIPTION: { type: DataTypes.STRING(255) },
    ...AuditMixin('FREIGHT')
  }, {
    schema: 'SMFB',
    tableName: 'FREIGHT',
    timestamps: false,
    indexes: [{ unique: true, fields: ['FREIGHT_PLANT'] }]
  });

  FREIGHT.beforeCreate((row,opt)=>{
    const userId = opt.userId || 'SYSTEM';
    row.FREIGHT_CREATED_BY = userId;
    row.FREIGHT_CREATED_ON = new Date();
  });

  FREIGHT.beforeUpdate((row,opt)=>{
    const userId = opt.userId || 'SYSTEM';
    row.FREIGHT_MODIFIED_BY = userId;
    row.FREIGHT_MODIFIED_ON = new Date();
  });

  return FREIGHT;
};