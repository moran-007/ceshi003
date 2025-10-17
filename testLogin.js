// 简单的登录测试脚本，用于调试登录问题
const http = require('http');

// 测试管理员登录
async function testLogin(username, password) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`响应状态码: ${res.statusCode}`);
        console.log(`响应头:`, res.headers);
        console.log(`响应体: ${data}`);
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (e) {
          reject(new Error(`解析JSON失败: ${e.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`请求错误: ${error.message}`);
      reject(error);
    });
    
    req.write(JSON.stringify({ username, password }));
    req.end();
  });
}

// 运行测试
async function runTest() {
  console.log('测试管理员登录...');
  try {
    const result = await testLogin('admin', '123456');
    console.log('测试结果:', result);
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

runTest();