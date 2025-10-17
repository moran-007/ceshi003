# 课程管理系统后端服务

基于Node.js和MySQL的课程管理系统后端服务，提供数据库连接和API接口。

## 项目结构

```
├── db/
│   ├── connection.js    # 数据库连接配置
│   └── dbUtils.js       # 数据库操作工具类
├── .env                 # 环境变量配置
├── package.json         # 项目依赖配置
├── server.js            # Express服务器
├── test.js              # 测试脚本
└── README.md            # 项目说明
```

## 技术栈

- Node.js
- Express.js
- MySQL2 (Promise API)
- dotenv (环境变量管理)

## 功能特性

- 数据库连接池管理
- 封装的CRUD操作工具类
- 事务支持
- RESTful API基础框架
- 健康检查接口
- 数据库连接测试接口

## 使用说明

### 1. 配置环境变量

复制或编辑 `.env` 文件，设置数据库连接信息：

```dotenv
# 数据库连接配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=course_management_system
DB_PORT=3306

# 服务器配置
SERVER_PORT=3000
NODE_ENV=development
```

### 2. 安装依赖

```bash
npm install
```

### 3. 测试数据库连接

```bash
node test.js
```

### 4. 启动服务器

```bash
node server.js
```

### 5. 验证服务

- 健康检查: `http://localhost:3000/health`
- 数据库检查: `http://localhost:3000/db/check`
- 课程列表: `http://localhost:3000/api/courses`

## 数据库操作示例

```javascript
// 使用DBUtils进行数据库操作
const DBUtils = require('./db/dbUtils');

// 查询单条记录
const user = await DBUtils.findOne('user', { username: 'admin' });

// 查询多条记录
const courses = await DBUtils.findAll('course', { status: 1 }, { limit: 10, orderBy: 'course_id DESC' });

// 创建记录
const userId = await DBUtils.create('user', {
  username: 'newuser',
  password: 'hashed_password',
  email: 'user@example.com'
});

// 更新记录
const updatedCount = await DBUtils.update('course', 
  { status: 0 }, 
  { course_id: 1 }
);

// 删除记录
const deletedCount = await DBUtils.delete('user', { user_id: 10 });

// 使用事务
const { executeTransaction } = require('./db/connection');
await executeTransaction([
  { sql: 'UPDATE user SET points = points + 10 WHERE user_id = ?', params: [userId] },
  { sql: 'INSERT INTO transaction_log (user_id, points, type) VALUES (?, ?, ?)', params: [userId, 10, 'reward'] }
]);
```

## 注意事项

1. 请确保MySQL数据库已启动且可访问
2. 数据库 `course_management_system` 已创建
3. 根据实际数据库配置修改 `.env` 文件
4. 在生产环境中，请勿使用root用户直接连接数据库
5. 密码应进行加密存储，本示例仅供测试使用

## 扩展开发

1. 根据需要添加更多API接口
2. 实现用户认证和授权
3. 添加日志记录功能
4. 实现错误处理中间件
5. 添加数据验证