// Import
const sql = require('mssql');
require('dotenv').config();

// DB config
const dbConfig = {
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  server:process.env.DB_SERVER,
  database:process.env.DB_DATABASE,
  port:parseInt(process.env.DB_PORT||'1433'),
  pool:{max:10,min:0,idleTimeoutMillis:30000},
  options:{encrypt:false,trustServerCertificate:true,enableArithAbort:true}
};

// Create pool with error handling
const createPool=async()=>{
  try{
    const pool=new sql.ConnectionPool(dbConfig);
    await pool.connect();
    console.log('✅ Connected to SQL Server');
    return pool;
  }catch(err){
    console.error('❌ Database Connection Failed! Error:',err);
    process.exit(1);
  }
};

// Export
const poolPromise=createPool();
module.exports={sql,poolPromise,dbConfig};