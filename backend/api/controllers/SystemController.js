// 系统配置控制器
const { executeQuery } = require('../../db/connection');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const systemController = {
  // 获取系统配置
  async getSystemConfig(req, res) {
    try {
      const sql = 'SELECT * FROM system_config';
      const configs = await executeQuery(sql);
      
      // 将配置转换为对象格式
      const configMap = {};
      configs.forEach(item => {
        configMap[item.config_key] = item.config_value;
      });
      
      return res.status(200).json({
        success: true,
        data: configMap
      });
    } catch (error) {
      console.error('获取系统配置失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取系统配置失败',
        error: error.message
      });
    }
  },

  // 更新系统配置
  async updateSystemConfig(req, res) {
    try {
      const configData = req.body;
      
      // 开启事务
      await executeQuery('START TRANSACTION');
      
      // 循环更新每个配置项
      for (const [key, value] of Object.entries(configData)) {
        const checkSql = 'SELECT * FROM system_config WHERE config_key = ?';
        const [existingConfig] = await executeQuery(checkSql, [key]);
        
        if (existingConfig) {
          const updateSql = 'UPDATE system_config SET config_value = ? WHERE config_key = ?';
          await executeQuery(updateSql, [value, key]);
        } else {
          const insertSql = 'INSERT INTO system_config (config_key, config_value) VALUES (?, ?)';
          await executeQuery(insertSql, [key, value]);
        }
      }
      
      // 提交事务
      await executeQuery('COMMIT');
      
      return res.status(200).json({
        success: true,
        message: '系统配置更新成功'
      });
    } catch (error) {
      // 回滚事务
      await executeQuery('ROLLBACK');
      console.error('更新系统配置失败:', error);
      return res.status(500).json({
        success: false,
        message: '更新系统配置失败',
        error: error.message
      });
    }
  },

  // 获取备份列表
  async getBackupList(req, res) {
    try {
      const sql = 'SELECT * FROM system_backup ORDER BY backup_time DESC';
      const backups = await executeQuery(sql);
      
      return res.status(200).json({
        success: true,
        data: backups
      });
    } catch (error) {
      console.error('获取备份列表失败:', error);
      return res.status(500).json({
        success: false,
        message: '获取备份列表失败',
        error: error.message
      });
    }
  },

  // 创建备份
  async createBackup(req, res) {
    try {
      const { description = '', isEncrypted = false, password = null } = req.body;
      
      // 这里应该有实际的数据库备份逻辑
      // 暂时模拟备份过程
      const backupId = `backup_${Date.now()}`;
      const backupTime = new Date();
      const backupSize = Math.floor(Math.random() * 1000) + 500; // 模拟备份大小(MB)
      
      // 保存备份记录
      const sql = `INSERT INTO system_backup 
                  (backup_id, backup_time, description, size_mb, is_encrypted, created_by) 
                  VALUES (?, ?, ?, ?, ?, ?)`;
      
      await executeQuery(sql, [
        backupId,
        backupTime,
        description,
        backupSize,
        isEncrypted,
        req.user ? req.user.username : 'system'
      ]);
      
      return res.status(200).json({
        success: true,
        message: '备份创建成功',
        data: {
          backupId,
          backupTime,
          description,
          backupSize,
          isEncrypted
        }
      });
    } catch (error) {
      console.error('创建备份失败:', error);
      return res.status(500).json({
        success: false,
        message: '创建备份失败',
        error: error.message
      });
    }
  },

  // 恢复备份
  async restoreBackup(req, res) {
    try {
      const { backupId, password = null } = req.body;
      
      // 检查备份是否存在
      const checkSql = 'SELECT * FROM system_backup WHERE backup_id = ?';
      const [backup] = await executeQuery(checkSql, [backupId]);
      
      if (!backup) {
        return res.status(404).json({
          success: false,
          message: '备份文件不存在'
        });
      }
      
      // 如果是加密备份，验证密码
      if (backup.is_encrypted && !password) {
        return res.status(400).json({
          success: false,
          message: '需要提供备份密码'
        });
      }
      
      // 这里应该有实际的数据库恢复逻辑
      // 暂时模拟恢复过程
      
      return res.status(200).json({
        success: true,
        message: '备份恢复成功'
      });
    } catch (error) {
      console.error('恢复备份失败:', error);
      return res.status(500).json({
        success: false,
        message: '恢复备份失败',
        error: error.message
      });
    }
  },

  // 删除备份
  async deleteBackup(req, res) {
    try {
      const { backupId } = req.params;
      
      const sql = 'DELETE FROM system_backup WHERE backup_id = ?';
      await executeQuery(sql, [backupId]);
      
      return res.status(200).json({
        success: true,
        message: '备份删除成功'
      });
    } catch (error) {
      console.error('删除备份失败:', error);
      return res.status(500).json({
        success: false,
        message: '删除备份失败',
        error: error.message
      });
    }
  }
};

module.exports = systemController;