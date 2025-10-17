// 认证系统测试脚本
const express = require('express');
const bcrypt = require('./backend/node_modules/bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('./backend/config/app.config');
const logger = require('./backend/utils/logger');

// 创建模拟Express应用
const app = express();
app.use(express.json());

// 模拟用户数据（用于测试）
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$eI6W6J1QeW6Y6f6e5e4d3c2b1a0a9a8a7a6a5a4a3a2a1a0a9a8a7a6a5a4a3a2a1a', // 模拟哈希密码 'admin123'
    role: 'admin',
    name: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    status: 1
  },
  {
    id: 2,
    username: 'teacher',
    password: '$2a$10$eI6W6J1QeW6Y6f6e5e4d3c2b1a0a9a8a7a6a5a4a3a2a1a0a9a8a7a6a5a4a3a2a1a', // 模拟哈希密码 'teacher123'
    role: 'teacher',
    name: '教师用户',
    email: 'teacher@example.com',
    phone: '13900139000',
    status: 1
  },
  {
    id: 3,
    username: 'student',
    password: '$2a$10$eI6W6J1QeW6Y6f6e5e4d3c2b1a0a9a8a7a6a5a4a3a2a1a0a9a8a7a6a5a4a3a2a1a', // 模拟哈希密码 'student123'
    role: 'student',
    name: '学生用户',
    email: 'student@example.com',
    phone: '13700137000',
    status: 1
  }
];

// 生成JWT令牌函数
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  
  return jwt.sign(payload, config.auth.tokenSecret, {
    expiresIn: config.auth.tokenExpiry
  });
}

// 模拟登录API
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }
    
    // 查找用户
    const user = mockUsers.find(u => u.username === username);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 检查用户状态
    if (user.status !== 1) {
      return res.status(401).json({
        success: false,
        message: '用户已被禁用'
      });
    }
    
    // 模拟密码验证（实际中应该使用bcrypt.compare）
    // 这里为了测试简化处理
    const validPasswords = {
      'admin': 'admin123',
      'teacher': 'teacher123',
      'student': 'student123'
    };
    
    const isPasswordValid = password === validPasswords[username];
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 生成令牌
    const token = generateToken(user);
    
    // 返回用户信息和令牌
    const userResponse = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone
    };
    
    res.json({
      success: true,
      message: '登录成功',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

// 模拟获取当前用户信息API
app.get('/api/v1/auth/me', (req, res) => {
  try {
    // 从请求头获取令牌
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }
    
    // 验证令牌
    const decoded = jwt.verify(token, config.auth.tokenSecret);
    
    // 查找用户
    const user = mockUsers.find(u => u.id === decoded.id);
    
    if (!user || user.status !== 1) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }
    
    // 返回用户信息
    const userResponse = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone
    };
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get current user error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '令牌已过期'
      });
    }
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

// 模拟注销API
app.post('/api/v1/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: '注销成功'
  });
});

// 启动测试服务器
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`测试认证服务器已启动，监听端口 ${PORT}`);
  console.log('可用API:');
  console.log('- POST /api/v1/auth/login - 用户登录');
  console.log('- GET /api/v1/auth/me - 获取当前用户信息');
  console.log('- POST /api/v1/auth/logout - 用户注销');
  console.log('测试账号:');
  console.log('- 管理员: admin / admin123');
  console.log('- 教师: teacher / teacher123');
  console.log('- 学生: student / student123');
});