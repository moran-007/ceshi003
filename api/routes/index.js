// API路由配置
const express = require('express');
const router = express.Router();

// 导入各模块路由
const userRoutes = require('./userRoutes');
const teacherRoutes = require('./teacherRoutes');
const studentRoutes = require('./studentRoutes');
const courseRoutes = require('./courseRoutes');
const classRoutes = require('./classRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const deductionRoutes = require('./deductionRoutes');
const recordRoutes = require('./recordRoutes');

// 路由注册
router.use('/users', userRoutes);
router.use('/teachers', teacherRoutes);
router.use('/students', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/classes', classRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/deduction', deductionRoutes);
router.use('/records', recordRoutes);

module.exports = router;