// 📁 models/CODE_MASTER.js
const {DataTypes}=require('sequelize');
const AuditMixin=require('./AuditMixin');

module.exports=sequelize=>{
  const CODE_MASTER=sequelize.define('CODE_MASTER',{
    CODE_MASTER_ID:      {type:DataTypes.INTEGER, primaryKey:true, autoIncrement:true},
    CODE_MASTER_CATEGORY:{type:DataTypes.STRING(50),  allowNull:false},
    CODE_MASTER_KEY:     {type:DataTypes.STRING(50),  allowNull:false},
    CODE_MASTER_VALUE:   {type:DataTypes.STRING(100), allowNull:false},
    CODE_MASTER_DESCRIPTION:{type:DataTypes.STRING(255)},
    CODE_MASTER_ORDER:   {type:DataTypes.INTEGER, defaultValue:0},
    ...AuditMixin('CODE_MASTER')
  },{
    schema:'SMFB',
    tableName:'CODE_MASTER',
    timestamps:false,
    indexes:[{unique:true,fields:['CODE_MASTER_CATEGORY','CODE_MASTER_KEY']}]
  });

  // 🔹 Hook: auto-set audit fields on create
  CODE_MASTER.beforeCreate((code,opt)=>{
    const userId=opt.userId||'SYSTEM';
    code.CODE_MASTER_CREATED_BY=userId;
    code.CODE_MASTER_CREATED_ON=new Date();
    if(code.CODE_MASTER_IS_ACTIVE==null) code.CODE_MASTER_IS_ACTIVE=true;
    code._userId=userId;
  });

  // 🔹 Hook: auto-update audit fields on update
  CODE_MASTER.beforeUpdate((code,opt)=>{
    const userId=opt.userId||code._userId||'SYSTEM';
    code.CODE_MASTER_MODIFIED_BY=userId;
    code.CODE_MASTER_MODIFIED_ON=new Date();
    code._userId=userId;
  });

  return CODE_MASTER;
};