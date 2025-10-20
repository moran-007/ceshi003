-- 系统配置表
CREATE TABLE IF NOT EXISTS `system_config` (
  `config_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
  `config_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键名',
  `config_value` TEXT COMMENT '配置值',
  `description` VARCHAR(255) COMMENT '配置描述',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_config_key (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 系统备份表
CREATE TABLE IF NOT EXISTS `system_backup` (
  `backup_id` VARCHAR(100) PRIMARY KEY COMMENT '备份ID',
  `backup_time` TIMESTAMP NOT NULL COMMENT '备份时间',
  `description` VARCHAR(255) COMMENT '备份描述',
  `size_mb` DECIMAL(10,2) COMMENT '备份大小(MB)',
  `is_encrypted` TINYINT(4) DEFAULT 0 COMMENT '是否加密:0-否,1-是',
  `created_by` VARCHAR(50) COMMENT '创建者',
  `file_path` VARCHAR(255) COMMENT '备份文件路径',
  `status` TINYINT(4) DEFAULT 1 COMMENT '状态:0-失败,1-成功',
  INDEX idx_backup_time (`backup_time`),
  INDEX idx_created_by (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统备份表';

-- 插入默认系统配置
INSERT INTO `system_config` (`config_key`, `config_value`, `description`) VALUES
('system_name', '教育管理系统', '系统名称'),
('system_version', 'v1.0.0', '系统版本'),
('system_description', '用于学校教学管理的综合系统', '系统描述'),
('contact_email', 'admin@example.com', '联系邮箱'),
('copyright', '© 2023 教育管理系统', '版权信息'),
('enable_registration', 'false', '是否允许注册'),
('default_role', 'student', '默认角色'),
('password_policy', 'medium', '密码策略'),
('password_expiry_days', '90', '密码过期天数'),
('max_failed_login_attempts', '5', '最大失败登录次数'),
('account_lock_minutes', '30', '账户锁定分钟数'),
('require_email_verification', 'false', '是否需要邮箱验证'),
('semester_weeks', '20', '每学期周数'),
('daily_sessions', '8', '每天上课节数'),
('max_course_capacity', '100', '课程最大容量'),
('session_timeout_minutes', '30', '会话超时分钟数'),
('backup_enabled', 'true', '是否启用自动备份'),
('backup_frequency', 'daily', '备份频率'),
('backup_time', '02:00', '备份时间'),
('backup_retention_count', '7', '备份保留数量');