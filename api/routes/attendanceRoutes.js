// 签到模块路由
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// 签到相关API接口
router.post('/', attendanceController.createAttendance); // 创建签到记录
router.post('/checkin', attendanceController.checkIn); // 签到
router.post('/checkout', attendanceController.checkOut); // 签退
router.get('/:attendanceId', attendanceController.getAttendanceById); // 获取签到详情
router.get('/schedule/:scheduleId', attendanceController.getScheduleAttendance); // 获取排课签到列表
router.get('/student/:studentId', attendanceController.getStudentAttendance); // 获取学生签到记录
router.put('/:attendanceId', attendanceController.updateAttendance); // 更新签到记录
router.delete('/:attendanceId', attendanceController.deleteAttendance); // 删除签到记录
router.get('/statistics/student/:studentId', attendanceController.getStudentAttendanceStatistics); // 获取学生出勤统计
router.get('/statistics/class/:classId', attendanceController.getClassAttendanceStatistics); // 获取班级出勤统计
router.get('/statistics/course/:courseId', attendanceController.getCourseAttendanceStatistics); // 获取课程出勤统计
router.post('/batch/import', attendanceController.importAttendance); // 批量导入签到记录
router.get('/export/:scheduleId', attendanceController.exportAttendance); // 导出签到记录

module.exports = router;