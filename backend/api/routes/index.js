/*
 * @Author: 陌
 * @Date: 2025-10-16 20:35:28
 * @LastEditors: 陌
 * @LastEditTime: 2025-10-16 22:30:04
 */
// API路由集成
const express = require('express');
const router = express.Router();

// 导入各模块路由
const userRoutes = require('./userRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const deductionRoutes = require('./deductionRoutes');
const recordRoutes = require('./recordRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const courseRoutes = require('./courseRoutes');
const teacherRoutes = require('./teacherRoutes');
const systemRoutes = require('./systemRoutes'); // 添加系统路由导入

// 注册路由
router.use('/auth', userRoutes);  // 用户认证相关路由
router.use('/users', userRoutes);  // 用户管理相关路由
router.use('/schedules', scheduleRoutes);  // 排课管理路由
router.use('/attendance', attendanceRoutes);  // 签到管理路由
router.use('/deduction', deductionRoutes);  // 扣课管理路由
router.use('/records', recordRoutes);  // 上课记录路由
router.use('/courses', courseRoutes);  // 课程管理路由
router.use('/teachers', teacherRoutes);  // 教师管理路由
router.use('/system', systemRoutes);  // 系统配置和备份路由

// 基础路由
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '课程管理系统API接口',
    version: '1.0.0',
    docs: '/api-docs',
    endpoints: {
      auth: '/api/auth/*',
      users: '/api/users/*',
      courses: '/api/courses/*',
      schedules: '/api/schedules/*',
      attendance: '/api/attendance/*',
      records: '/api/records/*',
      deduction: '/api/deduction/*',
      teachers: '/api/teachers/*',
      system: '/api/system/*'
    }
  });
});

module.exports = router;