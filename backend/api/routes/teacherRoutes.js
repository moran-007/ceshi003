// 教师管理路由配置
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// 获取教师列表
router.get('/', teacherController.getTeacherList);

module.exports = router;