// 用户模块路由配置
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 用户登录
router.post('/login', userController.login);

// 用户登出
router.post('/logout', userController.logout);

// 获取当前用户信息
router.get('/profile', userController.getCurrentUser);

// 更新用户信息
router.put('/profile', userController.updateProfile);

// 更改密码
router.post('/change-password', userController.changePassword);

// 重置密码（管理员操作）
router.post('/:userId/reset-password', userController.resetPassword);

// 获取用户列表（分页）
router.get('/', userController.getUserList);

// 获取用户详情
router.get('/:userId', userController.getUserDetail);

// 创建用户（管理员操作）
router.post('/', userController.createUser);

// 更新用户状态（启用/禁用）
router.put('/:userId/status', userController.updateUserStatus);

// 删除用户
router.delete('/:userId', userController.deleteUser);

module.exports = router;