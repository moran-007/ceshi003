/*
 * @Author: 系统配置和备份相关路由
 */
// 系统模块路由配置
const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

// 系统配置相关路由
router.get('/config', systemController.getSystemConfig);
router.put('/config', systemController.updateSystemConfig);

// 备份相关路由
router.get('/backups', systemController.getBackupList);
router.post('/backups', systemController.createBackup);
router.put('/backups/restore', systemController.restoreBackup);
router.delete('/backups/:backupId', systemController.deleteBackup);

module.exports = router;