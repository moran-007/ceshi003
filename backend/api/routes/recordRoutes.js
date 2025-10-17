// 上课记录模块路由
const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');

// 创建上课记录
router.post('/', recordController.createRecord || recordController.createClassRecord);

// 获取上课记录列表
router.get('/', recordController.getRecordList || recordController.getClassRecords);

// 获取上课记录详情
router.get('/:recordId', recordController.getRecordDetail || recordController.getClassRecordById || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' })));

// 按排课获取记录
router.get('/schedule/:scheduleId', recordController.getRecordsBySchedule || recordController.getClassRecordsBySchedule || ((req, res) => res.status(501).json({ success: false, message: '功能待实现' })));

// 按学生获取记录
router.get('/student/:studentId', recordController.getRecordsByStudent || recordController.getStudentClassRecords);

// 获取出勤汇总
router.get('/:recordId/attendance-summary', recordController.getAttendanceSummary);

module.exports = router;