// 签到模块路由
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// 签到相关API接口
// 获取签到统计
router.get('/statistics', attendanceController.getAttendanceStatistics || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' })));

// 获取排课签到列表
router.get('/schedule/:scheduleId', attendanceController.getScheduleAttendance);

// 获取学生签到记录
router.get('/student/:studentId', attendanceController.getStudentAttendance);

// 获取学生出勤统计
router.get('/statistics/student/:studentId', attendanceController.getStudentAttendanceStatistics);

// 签到
router.post('/:recordId/sign-in', attendanceController.signIn || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' })));

// 签退
router.post('/:recordId/sign-out', attendanceController.signOut || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' })));

// 更新签到记录
router.put('/:attendanceId', attendanceController.updateAttendance || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' })));

// 创建签到记录
router.post('/', attendanceController.createAttendance || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' }))); // 创建签到记录
router.get('/:attendanceId', attendanceController.getAttendanceById || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' }))); // 获取签到详情
router.delete('/:attendanceId', attendanceController.deleteAttendance || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' }))); // 删除签到记录
router.get('/statistics/class/:classId', attendanceController.getClassAttendanceStatistics || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' }))); // 获取班级出勤统计
router.get('/statistics/course/:courseId', attendanceController.getCourseAttendanceStatistics || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' }))); // 获取课程出勤统计
router.post('/batch/import', attendanceController.importAttendance || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' }))); // 批量导入签到记录
router.get('/export/:scheduleId', attendanceController.exportAttendance || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' }))); // 导出签到记录

module.exports = router;