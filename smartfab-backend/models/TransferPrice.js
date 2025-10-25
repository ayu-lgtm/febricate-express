const { DataTypes } = require('sequelize'); 
const AuditMixin = require('./AuditMixin'); 

module.exports = (sequelize) => {   
  const TRANSFER_PRICE = sequelize.define('TRANSFER_PRICE', {     
    TRANSFER_PRICE_ID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },     
    TRANSFER_PRICE_MONTH: { type: DataTypes.STRING(10), allowNull: false },     
    TRANSFER_PRICE_RM_TYPE: { type: DataTypes.STRING(255), allowNull: false },     
    TRANSFER_PRICE_VALUE: { type: DataTypes.FLOAT, allowNull: false },     
    TRANSFER_PRICE_DESCRIPTION: { type: DataTypes.STRING(255) },     
    ...AuditMixin('TRANSFER_PRICE')   
  }, {     
    schema: 'SMFB',     
    tableName: 'TRANSFER_PRICE',     
    timestamps: false,     
    indexes: [{ 
      unique: true, 
      fields: ['TRANSFER_PRICE_MONTH','TRANSFER_PRICE_RM_TYPE'],
      name: 'idx_transfer_price_unique' // ✅ Shortened index name
    }]   
  });   

  TRANSFER_PRICE.beforeCreate((row,opt)=>{     
    const userId = opt.userId || 'SYSTEM';     
    row.TRANSFER_PRICE_CREATED_BY = userId;     
    row.TRANSFER_PRICE_CREATED_ON = new Date();   
  });   

  TRANSFER_PRICE.beforeUpdate((row,opt)=>{     
    const userId = opt.userId || 'SYSTEM';     
    row.TRANSFER_PRICE_MODIFIED_BY = userId;     
    row.TRANSFER_PRICE_MODIFIED_ON = new Date();   
  });   

  return TRANSFER_PRICE; 
};