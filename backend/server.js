/*
 * @Author: 陌
 * @Date: 2025-10-16 20:22:59
 * @LastEditors: 陌
 * @LastEditTime: 2025-10-17 00:29:13
 */
// Express服务器配置
const express = require('express');
const { testConnection } = require('./db/connection');
require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 跨域中间件
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: '课程管理系统后端服务运行正常'
  });
});

// 数据库连接检查接口
app.get('/db/check', async (req, res) => {
  try {
    const connected = await testConnection();
    if (connected) {
      res.status(200).json({
        status: 'connected',
        message: '数据库连接成功'
      });
    } else {
      res.status(500).json({
        status: 'disconnected',
        message: '数据库连接失败'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 加载API路由
const routes = require('./api/routes');
app.use('/api', routes);

// API文档访问
app.get('/api-docs', (req, res) => {
  res.sendFile(__dirname + '/backend/api/swagger.json');
});

// 启动服务器
async function startServer() {
  try {
    // 启动前检查数据库连接
    const connected = await testConnection();
    if (!connected) {
      console.warn('数据库连接失败，但服务器仍将启动');
    }

    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`健康检查: http://localhost:${PORT}/health`);
      console.log(`数据库检查: http://localhost:${PORT}/db/check`);
      console.log(`API文档: http://localhost:${PORT}/api-docs`);
      console.log('系统功能模块已加载:');
      console.log('- 用户认证管理');
      console.log('- 排课管理');
      console.log('- 签到管理');
      console.log('- 上课记录管理');
      console.log('- 扣课管理');
    });
  } catch (error) {
    console.error('服务器启动失败:', error.message);
    process.exit(1);
  }
}

// 启动服务器
if (require.main === module) {
  startServer();
}

module.exports = app;