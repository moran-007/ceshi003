// 初始化系统配置和备份相关的数据库表
const { executeQuery } = require('./connection');
const fs = require('fs');
const path = require('path');

async function initSystemTables() {
  try {
    console.log('开始初始化系统配置和备份表...');
    
    // 读取SQL文件内容
    const sqlFilePath = path.join(__dirname, 'system_tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // 分割SQL语句（按分号分割）
    const sqlStatements = sqlContent.split(';').filter(statement => statement.trim());
    
    // 执行每条SQL语句
    for (const statement of sqlStatements) {
      await executeQuery(statement);
      console.log('执行SQL语句成功');
    }
    
    console.log('系统配置和备份表初始化完成！');
    return true;
  } catch (error) {
    console.error('初始化系统表失败:', error.message);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initSystemTables().then(() => {
    console.log('初始化完成，退出进程');
    process.exit(0);
  }).catch(error => {
    console.error('初始化失败:', error);
    process.exit(1);
  });
}

module.exports = { initSystemTables };