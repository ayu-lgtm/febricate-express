const { DataTypes } = require('sequelize'); 
const AuditMixin = require('./AuditMixin'); 

module.exports = (sequelize) => {   
  const CONVERSION_CHARGE = sequelize.define('CONVERSION_CHARGE', {     
    CONVERSION_CHARGE_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },     
    CONVERSION_CHARGE_SPC: { type: DataTypes.INTEGER, allowNull: false }, // 1439, 1440, etc.     
    CONVERSION_CHARGE_SECTION: { type: DataTypes.STRING(10), allowNull: false }, // 2-3mm, 3-4mm...     
    CONVERSION_CHARGE_WIRE_TYPE: { type: DataTypes.ENUM('AIRCOOLED','TMT','DRAWN'), allowNull: false },     
    CONVERSION_CHARGE_VALUE: { type: DataTypes.FLOAT, allowNull: false },     
    CONVERSION_CHARGE_DESCRIPTION: { type: DataTypes.STRING(255) },     
    ...AuditMixin('CONVERSION_CHARGE')   
  }, {     
    schema: 'SMFB',     
    tableName: 'CONVERSION_CHARGE',     
    timestamps: false,     
    indexes: [       
      { 
        unique: true, 
        fields: ['CONVERSION_CHARGE_SPC','CONVERSION_CHARGE_SECTION','CONVERSION_CHARGE_WIRE_TYPE'],
        name: 'idx_conv_charge_unique' // ✅ Shortened index name
      }     
    ]   
  });   

  CONVERSION_CHARGE.beforeCreate((row,opt)=>{     
    const userId = opt.userId || 'SYSTEM';     
    row.CONVERSION_CHARGE_CREATED_BY = userId;     
    row.CONVERSION_CHARGE_CREATED_ON = new Date();   
  });   

  CONVERSION_CHARGE.beforeUpdate((row,opt)=>{     
    const userId = opt.userId || 'SYSTEM';     
    row.CONVERSION_CHARGE_MODIFIED_BY = userId;     
    row.CONVERSION_CHARGE_MODIFIED_ON = new Date();   
  });   

  return CONVERSION_CHARGE; 
};