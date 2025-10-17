// 课程管理路由配置
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// 获取课程列表
router.get('/', courseController.getCourseList);

// 获取课程详情
router.get('/:courseId', courseController.getCourseDetail);

// 创建课程
router.post('/', courseController.createCourse);

// 更新课程
router.put('/:courseId', courseController.updateCourse);

// 删除课程
router.delete('/:courseId', courseController.deleteCourse);

// 获取课程大纲
router.get('/:courseId/outline', courseController.getCourseOutline);

// 获取课程教材
router.get('/:courseId/materials', courseController.getCourseMaterials);

module.exports = router;