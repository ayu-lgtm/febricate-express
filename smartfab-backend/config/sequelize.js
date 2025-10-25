// Import
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize init
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_SERVER,
    dialect: 'mssql',
    port: parseInt(process.env.DB_PORT),
    dialectOptions:{options:{encrypt:false,trustServerCertificate:true,enableArithAbort:true}},
    define:{freezeTableName:true,timestamps:false},
    pool:{max:10,min:0,acquire:30000,idle:10000},
    logging:process.env.NODE_ENV==='development'?console.log:false
  }
);

// Export
module.exports = sequelize;