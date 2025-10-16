// 排课模块路由
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// 排课相关API接口
router.post('/', scheduleController.createSchedule); // 创建排课
router.get('/', scheduleController.getSchedules); // 获取排课列表
router.get('/:scheduleId', scheduleController.getScheduleById); // 获取排课详情
router.put('/:scheduleId', scheduleController.updateSchedule); // 更新排课
router.delete('/:scheduleId', scheduleController.deleteSchedule); // 删除排课
router.post('/:scheduleId/cancel', scheduleController.cancelSchedule); // 取消排课
router.post('/:scheduleId/reschedule', scheduleController.reschedule); // 调课
router.get('/teacher/:teacherId', scheduleController.getTeacherSchedules); // 获取教师排课
router.get('/student/:studentId', scheduleController.getStudentSchedules); // 获取学生排课
router.get('/course/:courseId', scheduleController.getCourseSchedules); // 获取课程排课
router.post('/:scheduleId/students', scheduleController.addStudentsToSchedule); // 添加学生到排课
router.delete('/:scheduleId/students/:studentId', scheduleController.removeStudentFromSchedule); // 从排课移除学生
router.get('/:scheduleId/students', scheduleController.getScheduleStudents); // 获取排课学生列表
router.get('/check/conflict', scheduleController.checkScheduleConflict); // 检查排课冲突

module.exports = router;