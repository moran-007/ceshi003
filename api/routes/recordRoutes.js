// 上课记录模块路由
const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');

// 上课记录相关API接口
router.post('/', recordController.createClassRecord); // 创建上课记录
router.get('/', recordController.getClassRecords); // 获取上课记录列表
router.get('/:recordId', recordController.getClassRecordById); // 获取上课记录详情
router.put('/:recordId', recordController.updateClassRecord); // 更新上课记录
router.delete('/:recordId', recordController.deleteClassRecord); // 删除上课记录
router.get('/schedule/:scheduleId', recordController.getClassRecordsBySchedule); // 获取排课的上课记录
router.get('/teacher/:teacherId', recordController.getTeacherClassRecords); // 获取教师上课记录
router.get('/student/:studentId', recordController.getStudentClassRecords); // 获取学生上课记录
router.get('/course/:courseId', recordController.getCourseClassRecords); // 获取课程上课记录
router.post('/:recordId/feedback', recordController.addFeedback); // 添加反馈
router.get('/:recordId/attendance-summary', recordController.getAttendanceSummary); // 获取出勤汇总
router.get('/statistics/teacher/:teacherId', recordController.getTeacherStatistics); // 获取教师统计
router.get('/statistics/student/:studentId', recordController.getStudentStatistics); // 获取学生统计
router.post('/batch/import', recordController.importClassRecords); // 批量导入上课记录

module.exports = router;