// 扣课模块路由
const express = require('express');
const router = express.Router();
const deductionController = require('../controllers/deductionController');

// 扣课相关API接口
router.post('/', deductionController.deductHours); // 手动扣课
router.post('/batch', deductionController.batchDeductHours); // 批量扣课
router.post('/add', deductionController.addHours); // 加课
router.get('/student/:studentId', deductionController.getStudentDeductionRecords); // 获取学生扣课记录
router.get('/student/:studentId/course/:courseId', deductionController.getStudentCourseDeductionRecords); // 获取学生课程扣课记录
router.get('/rules', deductionController.getDeductionRules); // 获取扣课规则列表
router.post('/rules', deductionController.createDeductionRule); // 创建扣课规则
router.put('/rules/:ruleId', deductionController.updateDeductionRule); // 更新扣课规则
router.delete('/rules/:ruleId', deductionController.deleteDeductionRule); // 删除扣课规则
router.get('/statistics/student/:studentId', deductionController.getStudentHoursStatistics); // 获取学生课时统计
router.get('/statistics/course/:courseId', deductionController.getCourseHoursStatistics); // 获取课程课时统计
router.get('/statistics/class/:classId', deductionController.getClassHoursStatistics); // 获取班级课时统计

module.exports = router;