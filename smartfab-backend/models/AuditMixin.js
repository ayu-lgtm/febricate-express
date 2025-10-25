// 📁 models/AuditMixin.js
const {DataTypes}=require('sequelize');

/**
 * 🔹 Adds standard audit fields to any table.
 * @param {string} tableName - The base table name for prefixing fields.
 * @returns {Object} - Sequelize field definitions with prefixed audit columns.
 */
const AuditMixin=tableName=>{
  const p=tableName.toUpperCase();
  return {
    [`${p}_CREATED_BY`]:   {type:DataTypes.STRING, allowNull:false, defaultValue:'SYSTEM'},
    [`${p}_CREATED_ON`]:   {type:DataTypes.DATE,   allowNull:false, defaultValue:DataTypes.NOW},
    [`${p}_MODIFIED_BY`]:  {type:DataTypes.STRING, allowNull:true},
    [`${p}_MODIFIED_ON`]:  {type:DataTypes.DATE,   allowNull:true},
    [`${p}_IS_ACTIVE`]:    {type:DataTypes.BOOLEAN,allowNull:false,defaultValue:true}
  };
};

module.exports=AuditMixin;