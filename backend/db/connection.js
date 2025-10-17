// 数据库连接模块
const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    return false;
  }
}

// 执行SQL查询
async function executeQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('SQL执行错误:', error.message);
    throw error;
  }
}

// 执行事务
async function executeTransaction(operations) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    for (const { sql, params } of operations) {
      await connection.execute(sql, params);
    }
    
    await connection.commit();
    console.log('事务执行成功');
    return true;
  } catch (error) {
    await connection.rollback();
    console.error('事务执行失败，已回滚:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction
};