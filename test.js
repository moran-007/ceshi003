// 数据库连接测试脚本
const { testConnection, executeQuery } = require('./db/connection');
const DBUtils = require('./db/dbUtils');

async function runTests() {
  console.log('开始测试数据库连接...');
  
  try {
    // 1. 测试基本连接
    console.log('\n1. 测试数据库连接:');
    const connected = await testConnection();
    console.log(`连接状态: ${connected ? '成功' : '失败'}`);
    
    if (!connected) {
      console.error('数据库连接失败，请检查配置后重试');
      return;
    }
    
    // 2. 测试基本查询
    console.log('\n2. 测试基本SQL查询:');
    const result = await executeQuery('SELECT NOW() as current_time');
    console.log('当前数据库时间:', result[0].current_time);
    
    // 3. 测试查询用户表
    console.log('\n3. 测试查询用户表:');
    try {
      const users = await executeQuery('SELECT * FROM user LIMIT 5');
      console.log(`查询到 ${users.length} 个用户记录`);
      users.forEach(user => {
        console.log(`- ${user.username} (${user.email})`);
      });
    } catch (error) {
      console.log('警告: 用户表查询失败，可能表不存在或权限问题');
      console.log('错误信息:', error.message);
    }
    
    // 4. 测试DBUtils类
    console.log('\n4. 测试DBUtils工具类:');
    try {
      const courseCount = await DBUtils.count('course');
      console.log(`课程总数: ${courseCount}`);
      
      const courses = await DBUtils.findAll('course', {}, { limit: 3, orderBy: 'course_id DESC' });
      console.log('最新的3个课程:');
      courses.forEach(course => {
        console.log(`- ${course.course_name} (ID: ${course.course_id})`);
      });
    } catch (error) {
      console.log('警告: DBUtils测试失败');
      console.log('错误信息:', error.message);
    }
    
    console.log('\n测试完成!');
    console.log('\n使用说明:');
    console.log('1. 修改 .env 文件中的数据库配置信息');
    console.log('2. 运行 `npm install` 安装依赖');
    console.log('3. 运行 `npm start` 启动服务器');
    console.log('4. 访问 http://localhost:3000/health 检查服务状态');
    console.log('5. 访问 http://localhost:3000/db/check 检查数据库连接');
    console.log('6. 访问 http://localhost:3000/api/courses 查看课程列表');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
runTests();