-- 课程管理系统数据库SQL文件
-- 删除已存在的表（按照外键依赖关系的相反顺序）
DROP DATABASE IF EXISTS `course_management_system`;
CREATE DATABASE IF NOT EXISTS `course_management_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `course_management_system`;

-- 1. 用户相关表

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
  `email` VARCHAR(100) UNIQUE COMMENT '邮箱',
  `phone` VARCHAR(20) COMMENT '手机号',
  `real_name` VARCHAR(50) COMMENT '真实姓名',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `last_login_time` TIMESTAMP COMMENT '最后登录时间',
  `last_login_ip` VARCHAR(50) COMMENT '最后登录IP',
  `status` TINYINT(4) DEFAULT 1 COMMENT '用户状态：0-禁用，1-启用',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (`username`),
  INDEX idx_email (`email`),
  INDEX idx_phone (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 角色表
CREATE TABLE IF NOT EXISTS `role` (
  `role_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
  `role_name` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色名称',
  `description` TEXT COMMENT '角色描述',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_role_name (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

-- 权限表
CREATE TABLE IF NOT EXISTS `permission` (
  `permission_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',
  `permission_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '权限编码',
  `permission_name` VARCHAR(100) NOT NULL COMMENT '权限名称',
  `module` VARCHAR(50) NOT NULL COMMENT '所属模块',
  `operation` VARCHAR(50) COMMENT '操作类型：add, edit, delete, view',
  `description` TEXT COMMENT '权限描述',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_permission_code (`permission_code`),
  INDEX idx_module (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 用户-角色关联表
CREATE TABLE IF NOT EXISTS `user_role` (
  `id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `user_id` INT(11) NOT NULL COMMENT '用户ID',
  `role_id` INT(11) NOT NULL COMMENT '角色ID',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_user_role (`user_id`, `role_id`),
  INDEX idx_user_id (`user_id`),
  INDEX idx_role_id (`role_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-角色关联表';

-- 角色-权限关联表
CREATE TABLE IF NOT EXISTS `role_permission` (
  `id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `role_id` INT(11) NOT NULL COMMENT '角色ID',
  `permission_id` INT(11) NOT NULL COMMENT '权限ID',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_role_permission (`role_id`, `permission_id`),
  INDEX idx_role_id (`role_id`),
  INDEX idx_permission_id (`permission_id`),
  FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permission` (`permission_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色-权限关联表';

-- 权限组表
CREATE TABLE IF NOT EXISTS `permission_group` (
  `group_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '权限组ID',
  `group_name` VARCHAR(100) NOT NULL COMMENT '权限组名称',
  `description` TEXT COMMENT '权限组描述',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_group_name (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限组表';

-- 权限组-权限关联表
CREATE TABLE IF NOT EXISTS `group_permission` (
  `id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `group_id` INT(11) NOT NULL COMMENT '权限组ID',
  `permission_id` INT(11) NOT NULL COMMENT '权限ID',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_group_permission (`group_id`, `permission_id`),
  INDEX idx_group_id (`group_id`),
  INDEX idx_permission_id (`permission_id`),
  FOREIGN KEY (`group_id`) REFERENCES `permission_group` (`group_id`) ON DELETE CASCADE,
  FOREIGN KEY (`permission_id`) REFERENCES `permission` (`permission_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限组-权限关联表';

-- 2. 教师相关表

-- 教师表
CREATE TABLE IF NOT EXISTS `teacher` (
  `teacher_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '教师ID',
  `user_id` INT(11) UNIQUE COMMENT '关联用户ID',
  `teacher_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '教师编号',
  `name` VARCHAR(50) NOT NULL COMMENT '教师姓名',
  `gender` VARCHAR(10) COMMENT '性别',
  `birthday` DATE COMMENT '出生日期',
  `phone` VARCHAR(20) COMMENT '手机号码',
  `email` VARCHAR(100) COMMENT '电子邮箱',
  `address` VARCHAR(255) COMMENT '家庭地址',
  `hire_date` DATE COMMENT '入职日期',
  `position` VARCHAR(50) COMMENT '职位',
  `department` VARCHAR(100) COMMENT '所属部门',
  `qualification` VARCHAR(100) COMMENT '资格证书',
  `specialty` VARCHAR(100) COMMENT '专业特长',
  `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-在职，inactive-离职，suspended-暂停',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_teacher_no (`teacher_no`),
  INDEX idx_name (`name`),
  INDEX idx_phone (`phone`),
  INDEX idx_email (`email`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教师表';

-- 3. 学生相关表

-- 学生表
CREATE TABLE IF NOT EXISTS `student` (
  `student_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '学生ID',
  `user_id` INT(11) UNIQUE COMMENT '关联用户ID',
  `student_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '学号',
  `name` VARCHAR(50) NOT NULL COMMENT '学生姓名',
  `gender` VARCHAR(10) COMMENT '性别',
  `birthday` DATE COMMENT '出生日期',
  `phone` VARCHAR(20) COMMENT '手机号码',
  `email` VARCHAR(100) COMMENT '电子邮箱',
  `address` VARCHAR(255) COMMENT '家庭地址',
  `enrollment_date` DATE COMMENT '入学日期',
  `parent_name` VARCHAR(50) COMMENT '家长姓名',
  `parent_phone` VARCHAR(20) COMMENT '家长联系电话',
  `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-在读，graduated-毕业，dropped-退学',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_student_no (`student_no`),
  INDEX idx_name (`name`),
  INDEX idx_phone (`phone`),
  INDEX idx_email (`email`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生表';

-- 4. 课程相关表

-- 课程表
CREATE TABLE IF NOT EXISTS `course` (
  `course_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '课程ID',
  `course_name` VARCHAR(100) NOT NULL COMMENT '课程名称',
  `description` TEXT COMMENT '课程描述',
  `credit` INT(11) COMMENT '学分',
  `total_hours` INT(11) NOT NULL COMMENT '总课时',
  `start_date` DATE COMMENT '开始日期',
  `end_date` DATE COMMENT '结束日期',
  `level` VARCHAR(50) COMMENT '难度级别',
  `category` VARCHAR(100) COMMENT '课程分类',
  `target_audience` VARCHAR(255) COMMENT '适用对象',
  `teaching_method` VARCHAR(255) COMMENT '教学方式',
  `status` VARCHAR(20) DEFAULT 'draft' COMMENT '状态：draft-草稿，published-已发布，ended-已结束',
  `created_by` INT(11) COMMENT '创建人ID',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_course_name (`course_name`),
  INDEX idx_category (`category`),
  INDEX idx_status (`status`),
  INDEX idx_created_by (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程表';

-- 课程大纲表
CREATE TABLE IF NOT EXISTS `course_syllabus` (
  `syllabus_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '大纲ID',
  `course_id` INT(11) NOT NULL COMMENT '课程ID',
  `chapter_title` VARCHAR(255) NOT NULL COMMENT '章节标题',
  `chapter_no` INT(11) NOT NULL COMMENT '章节序号',
  `content` TEXT COMMENT '章节内容',
  `hours` DECIMAL(5,1) COMMENT '章节课时',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_course_id (`course_id`),
  INDEX idx_chapter_no (`chapter_no`),
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程大纲表';

-- 课程教材表
CREATE TABLE IF NOT EXISTS `course_material` (
  `material_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '教材ID',
  `course_id` INT(11) NOT NULL COMMENT '课程ID',
  `title` VARCHAR(255) NOT NULL COMMENT '教材名称',
  `author` VARCHAR(100) COMMENT '作者',
  `publisher` VARCHAR(100) COMMENT '出版社',
  `isbn` VARCHAR(50) COMMENT 'ISBN号',
  `required_type` VARCHAR(20) DEFAULT 'required' COMMENT '类型：required-必选，recommended-推荐',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_course_id (`course_id`),
  INDEX idx_title (`title`),
  INDEX idx_isbn (`isbn`),
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课程教材表';

-- 5. 班级相关表

-- 班级表
CREATE TABLE IF NOT EXISTS `class` (
  `class_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '班级ID',
  `class_name` VARCHAR(100) NOT NULL COMMENT '班级名称',
  `grade` VARCHAR(50) COMMENT '年级',
  `head_teacher_id` INT(11) COMMENT '班主任ID',
  `start_date` DATE COMMENT '开班日期',
  `end_date` DATE COMMENT '毕业日期',
  `max_students` INT(11) COMMENT '最大学生数',
  `current_students` INT(11) DEFAULT 0 COMMENT '当前学生数',
  `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-在读，graduated-已毕业，closed-已关闭',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_class_name (`class_name`),
  INDEX idx_head_teacher_id (`head_teacher_id`),
  INDEX idx_status (`status`),
  FOREIGN KEY (`head_teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班级表';

-- 学生-班级关联表
CREATE TABLE IF NOT EXISTS `student_class` (
  `id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `student_id` INT(11) NOT NULL COMMENT '学生ID',
  `class_id` INT(11) NOT NULL COMMENT '班级ID',
  `join_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入日期',
  `leave_date` DATE COMMENT '离开日期',
  `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-在读，transferred-转学，graduated-毕业，dropped-退学',
  UNIQUE KEY uk_student_class (`student_id`, `class_id`),
  INDEX idx_student_id (`student_id`),
  INDEX idx_class_id (`class_id`),
  INDEX idx_status (`status`),
  FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生-班级关联表';

-- 6. 排课相关表

-- 教室表
CREATE TABLE IF NOT EXISTS `classroom` (
  `classroom_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '教室ID',
  `room_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '教室编号',
  `capacity` INT(11) NOT NULL COMMENT '容量',
  `location` VARCHAR(255) COMMENT '位置',
  `equipment` TEXT COMMENT '设备情况',
  `floor` INT(11) COMMENT '楼层',
  `building` VARCHAR(100) COMMENT '楼栋',
  `room_type` VARCHAR(50) COMMENT '教室类型：classroom-普通教室，lab-实验室，computer-电脑教室，meeting-会议室',
  `has_projector` TINYINT(4) DEFAULT 0 COMMENT '是否有投影仪：0-否，1-是',
  `has_whiteboard` TINYINT(4) DEFAULT 0 COMMENT '是否有白板：0-否，1-是',
  `has_wifi` TINYINT(4) DEFAULT 0 COMMENT '是否有WiFi：0-否，1-是',
  `status` VARCHAR(20) DEFAULT 'available' COMMENT '状态：available-可用，maintenance-维护中，unavailable-不可用',
  `last_maintenance_date` DATE COMMENT '最后维护日期',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_room_no (`room_no`),
  INDEX idx_status (`status`),
  INDEX idx_room_type (`room_type`),
  INDEX idx_floor (`floor`),
  INDEX idx_building (`building`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教室表';

-- 排课表
CREATE TABLE IF NOT EXISTS `schedule` (
  `schedule_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '排课ID',
  `course_id` INT(11) NOT NULL COMMENT '课程ID',
  `teacher_id` INT(11) NOT NULL COMMENT '教师ID',
  `class_id` INT(11) COMMENT '班级ID',
  `classroom_id` INT(11) NOT NULL COMMENT '教室ID',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `day_of_week` INT(11) COMMENT '星期几（1-7）',
  `week_no` INT(11) COMMENT '周次',
  `total_weeks` INT(11) COMMENT '总周数',
  `hours` DECIMAL(5,1) NOT NULL COMMENT '课时数',
  `schedule_type` VARCHAR(20) DEFAULT 'regular' COMMENT '排课类型：regular-常规课，makeup-补课，trial-试听',
  `attendance_required` TINYINT(4) DEFAULT 1 COMMENT '是否需要签到：0-否，1-是',
  `auto_deduct` TINYINT(4) DEFAULT 1 COMMENT '是否自动扣课：0-否，1-是',
  `max_students` INT(11) COMMENT '最大学生数',
  `current_students` INT(11) DEFAULT 0 COMMENT '当前学生数',
  `status` VARCHAR(20) DEFAULT 'scheduled' COMMENT '状态：scheduled-已排课，completed-已完成，canceled-已取消，rescheduled-已调课',
  `cancel_reason` TEXT COMMENT '取消原因',
  `original_schedule_id` INT(11) COMMENT '原排课ID（调课时使用）',
  `remark` TEXT COMMENT '备注',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_course_id (`course_id`),
  INDEX idx_teacher_id (`teacher_id`),
  INDEX idx_class_id (`class_id`),
  INDEX idx_classroom_id (`classroom_id`),
  INDEX idx_start_time (`start_time`),
  INDEX idx_end_time (`end_time`),
  INDEX idx_status (`status`),
  INDEX idx_schedule_type (`schedule_type`),
  INDEX idx_day_of_week (`day_of_week`),
  INDEX idx_week_no (`week_no`),
  INDEX idx_original_schedule (`original_schedule_id`),
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `class` (`class_id`) ON DELETE SET NULL,
  FOREIGN KEY (`classroom_id`) REFERENCES `classroom` (`classroom_id`) ON DELETE CASCADE,
  FOREIGN KEY (`original_schedule_id`) REFERENCES `schedule` (`schedule_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排课表';

-- 教室使用状态表
CREATE TABLE IF NOT EXISTS `classroom_status_log` (
  `log_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `classroom_id` INT(11) NOT NULL COMMENT '教室ID',
  `schedule_id` INT(11) COMMENT '关联排课ID',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `status` VARCHAR(20) NOT NULL COMMENT '状态：booked-已预订，in_use-使用中，available-可用，maintenance-维护中',
  `description` VARCHAR(255) COMMENT '描述',
  `created_by` INT(11) COMMENT '创建人',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_classroom_id (`classroom_id`),
  INDEX idx_schedule_id (`schedule_id`),
  INDEX idx_start_time (`start_time`),
  INDEX idx_end_time (`end_time`),
  INDEX idx_status (`status`),
  INDEX idx_created_by (`created_by`),
  FOREIGN KEY (`classroom_id`) REFERENCES `classroom` (`classroom_id`) ON DELETE CASCADE,
  FOREIGN KEY (`schedule_id`) REFERENCES `schedule` (`schedule_id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教室使用状态表';

-- 7. 学生选课相关表

-- 学生-课程关联表
CREATE TABLE IF NOT EXISTS `student_course` (
  `id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `student_id` INT(11) NOT NULL COMMENT '学生ID',
  `course_id` INT(11) NOT NULL COMMENT '课程ID',
  `enrollment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '报名日期',
  `total_hours` DECIMAL(5,1) DEFAULT 0 COMMENT '总课时',
  `remaining_hours` DECIMAL(5,1) DEFAULT 0 COMMENT '剩余课时',
  `used_hours` DECIMAL(5,1) DEFAULT 0 COMMENT '已使用课时',
  `last_deduction_time` TIMESTAMP COMMENT '最后扣课时间',
  `auto_deduct_flag` TINYINT(4) DEFAULT 1 COMMENT '是否自动扣课：0-否，1-是',
  `status` VARCHAR(20) DEFAULT 'enrolled' COMMENT '状态：enrolled-已报名，completed-已完成，dropped-已退课，paused-已暂停',
  UNIQUE KEY uk_student_course (`student_id`, `course_id`),
  INDEX idx_student_id (`student_id`),
  INDEX idx_course_id (`course_id`),
  INDEX idx_status (`status`),
  INDEX idx_last_deduction (`last_deduction_time`),
  FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生-课程关联表';

-- 课时记录表
CREATE TABLE IF NOT EXISTS `course_hours_record` (
  `record_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
  `student_id` INT(11) NOT NULL COMMENT '学生ID',
  `course_id` INT(11) NOT NULL COMMENT '课程ID',
  `teacher_id` INT(11) NOT NULL COMMENT '教师ID',
  `schedule_id` INT(11) COMMENT '关联排课ID',
  `hours` DECIMAL(5,1) NOT NULL COMMENT '课时数量',
  `record_type` VARCHAR(20) NOT NULL COMMENT '记录类型：deduction-扣课，addition-加课，adjustment-调整',
  `record_date` DATE NOT NULL COMMENT '记录日期',
  `class_start_time` DATETIME COMMENT '上课开始时间',
  `class_end_time` DATETIME COMMENT '上课结束时间',
  `classroom_id` INT(11) COMMENT '教室ID',
  `record_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '录入时间',
  `recorded_by` INT(11) COMMENT '录入人',
  `reason` VARCHAR(255) COMMENT '原因',
  `remark` VARCHAR(255) COMMENT '备注',
  INDEX idx_student_id (`student_id`),
  INDEX idx_course_id (`course_id`),
  INDEX idx_teacher_id (`teacher_id`),
  INDEX idx_schedule_id (`schedule_id`),
  INDEX idx_record_date (`record_date`),
  INDEX idx_record_type (`record_type`),
  INDEX idx_recorded_by (`recorded_by`),
  FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE CASCADE,
  FOREIGN KEY (`schedule_id`) REFERENCES `schedule` (`schedule_id`) ON DELETE SET NULL,
  FOREIGN KEY (`classroom_id`) REFERENCES `classroom` (`classroom_id`) ON DELETE SET NULL,
  FOREIGN KEY (`recorded_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='课时记录表';

-- 上课记录表
CREATE TABLE IF NOT EXISTS `class_record` (
  `class_record_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '上课记录ID',
  `schedule_id` INT(11) NOT NULL COMMENT '排课ID',
  `teacher_id` INT(11) NOT NULL COMMENT '教师ID',
  `classroom_id` INT(11) NOT NULL COMMENT '教室ID',
  `actual_start_time` DATETIME COMMENT '实际开始时间',
  `actual_end_time` DATETIME COMMENT '实际结束时间',
  `teaching_content` TEXT COMMENT '教学内容',
  `teaching_summary` TEXT COMMENT '教学总结',
  `homework` TEXT COMMENT '作业布置',
  `attendance_count` INT(11) DEFAULT 0 COMMENT '出勤人数',
  `late_count` INT(11) DEFAULT 0 COMMENT '迟到人数',
  `absent_count` INT(11) DEFAULT 0 COMMENT '缺勤人数',
  `leave_early_count` INT(11) DEFAULT 0 COMMENT '早退人数',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待记录，completed-已完成，canceled-已取消',
  `created_by` INT(11) COMMENT '创建人',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_schedule_id (`schedule_id`),
  INDEX idx_teacher_id (`teacher_id`),
  INDEX idx_classroom_id (`classroom_id`),
  INDEX idx_status (`status`),
  INDEX idx_actual_start_time (`actual_start_time`),
  INDEX idx_created_by (`created_by`),
  FOREIGN KEY (`schedule_id`) REFERENCES `schedule` (`schedule_id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE CASCADE,
  FOREIGN KEY (`classroom_id`) REFERENCES `classroom` (`classroom_id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='上课记录表';

-- 学生上课档案表
CREATE TABLE IF NOT EXISTS `student_class_archive` (
  `archive_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '档案ID',
  `student_id` INT(11) NOT NULL COMMENT '学生ID',
  `course_id` INT(11) NOT NULL COMMENT '课程ID',
  `schedule_id` INT(11) NOT NULL COMMENT '排课ID',
  `class_record_id` INT(11) COMMENT '上课记录ID',
  `teacher_id` INT(11) NOT NULL COMMENT '教师ID',
  `classroom_id` INT(11) NOT NULL COMMENT '教室ID',
  `class_date` DATE NOT NULL COMMENT '上课日期',
  `class_start_time` DATETIME NOT NULL COMMENT '上课开始时间',
  `class_end_time` DATETIME NOT NULL COMMENT '上课结束时间',
  `attendance_status` VARCHAR(20) NOT NULL COMMENT '出勤状态：present-出勤，late-迟到，early_leave-早退，absent-缺勤',
  `hours_deducted` DECIMAL(5,1) DEFAULT 0 COMMENT '扣减课时',
  `learning_behavior` TEXT COMMENT '学习表现',
  `teacher_comment` TEXT COMMENT '教师评语',
  `parent_feedback` TEXT COMMENT '家长反馈',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_student_id (`student_id`),
  INDEX idx_course_id (`course_id`),
  INDEX idx_schedule_id (`schedule_id`),
  INDEX idx_class_record_id (`class_record_id`),
  INDEX idx_teacher_id (`teacher_id`),
  INDEX idx_class_date (`class_date`),
  INDEX idx_attendance_status (`attendance_status`),
  FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  FOREIGN KEY (`schedule_id`) REFERENCES `schedule` (`schedule_id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_record_id`) REFERENCES `class_record` (`class_record_id`) ON DELETE SET NULL,
  FOREIGN KEY (`teacher_id`) REFERENCES `teacher` (`teacher_id`) ON DELETE CASCADE,
  FOREIGN KEY (`classroom_id`) REFERENCES `classroom` (`classroom_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学生上课档案表';

-- 8. 签到相关表

-- 签到记录表
CREATE TABLE IF NOT EXISTS `attendance` (
  `attendance_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '签到记录ID',
  `schedule_id` INT(11) NOT NULL COMMENT '排课ID',
  `student_id` INT(11) NOT NULL COMMENT '学生ID',
  `attendance_time` TIMESTAMP COMMENT '签到时间',
  `leave_time` TIMESTAMP COMMENT '签退时间',
  `attendance_type` VARCHAR(20) COMMENT '签到方式：qr_code-二维码，face-人脸识别，manual-手动，location-定位，password-密码',
  `leave_type` VARCHAR(20) COMMENT '签退方式：qr_code-二维码，face-人脸识别，manual-手动，location-定位',
  `status` VARCHAR(20) NOT NULL COMMENT '状态：present-出勤，late-迟到，early_leave-早退，absent-缺勤',
  `late_minutes` INT(11) DEFAULT 0 COMMENT '迟到分钟数',
  `early_leave_minutes` INT(11) DEFAULT 0 COMMENT '早退分钟数',
  `ip_address` VARCHAR(50) COMMENT '签到IP地址',
  `location` VARCHAR(255) COMMENT '签到位置',
  `device_info` VARCHAR(255) COMMENT '设备信息',
  `password` VARCHAR(50) COMMENT '签到密码（加密存储）',
  `remark` VARCHAR(255) COMMENT '备注',
  INDEX idx_schedule_id (`schedule_id`),
  INDEX idx_student_id (`student_id`),
  INDEX idx_attendance_time (`attendance_time`),
  INDEX idx_leave_time (`leave_time`),
  INDEX idx_status (`status`),
  INDEX idx_attendance_type (`attendance_type`),
  FOREIGN KEY (`schedule_id`) REFERENCES `schedule` (`schedule_id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='签到记录表';

-- 扣课规则表
CREATE TABLE IF NOT EXISTS `deduction_rule` (
  `rule_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '规则ID',
  `rule_name` VARCHAR(100) NOT NULL COMMENT '规则名称',
  `rule_type` VARCHAR(50) NOT NULL COMMENT '规则类型：attendance_based-基于出勤，schedule_based-基于排课',
  `attendance_status` VARCHAR(20) COMMENT '出勤状态（rule_type=attendance_based时有效）',
  `deduction_ratio` DECIMAL(5,2) DEFAULT 1.00 COMMENT '扣减比例',
  `min_hours` DECIMAL(5,1) DEFAULT 0.5 COMMENT '最小扣减课时',
  `max_hours` DECIMAL(5,1) DEFAULT 3.0 COMMENT '最大扣减课时',
  `is_active` TINYINT(4) DEFAULT 1 COMMENT '是否启用：0-否，1-是',
  `priority` INT(11) DEFAULT 10 COMMENT '优先级（数字越小优先级越高）',
  `description` TEXT COMMENT '规则描述',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_rule_type (`rule_type`),
  INDEX idx_attendance_status (`attendance_status`),
  INDEX idx_is_active (`is_active`),
  INDEX idx_priority (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='扣课规则表';

-- 排课-学生关联表
CREATE TABLE IF NOT EXISTS `schedule_student` (
  `id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `schedule_id` INT(11) NOT NULL COMMENT '排课ID',
  `student_id` INT(11) NOT NULL COMMENT '学生ID',
  `course_id` INT(11) NOT NULL COMMENT '课程ID',
  `join_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-有效，removed-已移除，canceled-已取消',
  `auto_deduct_flag` TINYINT(4) DEFAULT 1 COMMENT '是否自动扣课：0-否，1-是',
  UNIQUE KEY uk_schedule_student (`schedule_id`, `student_id`),
  INDEX idx_schedule_id (`schedule_id`),
  INDEX idx_student_id (`student_id`),
  INDEX idx_course_id (`course_id`),
  INDEX idx_status (`status`),
  FOREIGN KEY (`schedule_id`) REFERENCES `schedule` (`schedule_id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排课-学生关联表';

-- 9. 订单相关表

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  `student_id` INT(11) NOT NULL COMMENT '学生ID',
  `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '订单编号',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT '订单金额',
  `discount` DECIMAL(10, 2) DEFAULT 0 COMMENT '优惠金额',
  `actual_amount` DECIMAL(10, 2) NOT NULL COMMENT '实际支付金额',
  `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending-待支付，paid-已支付，canceled-已取消，refunded-已退款',
  `payment_method` VARCHAR(50) COMMENT '支付方式：cash-现金，alipay-支付宝，wechat-微信支付，bank-银行转账',
  `payment_time` TIMESTAMP COMMENT '支付时间',
  `remark` TEXT COMMENT '订单备注',
  `created_by` INT(11) COMMENT '创建人',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_student_id (`student_id`),
  INDEX idx_order_no (`order_no`),
  INDEX idx_status (`status`),
  INDEX idx_payment_time (`payment_time`),
  INDEX idx_created_by (`created_by`),
  FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单详情表
CREATE TABLE IF NOT EXISTS `order_item` (
  `item_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '订单详情ID',
  `order_id` INT(11) NOT NULL COMMENT '订单ID',
  `course_id` INT(11) NOT NULL COMMENT '课程ID',
  `quantity` INT(11) DEFAULT 1 COMMENT '数量',
  `unit_price` DECIMAL(10, 2) NOT NULL COMMENT '单价',
  `total_price` DECIMAL(10, 2) NOT NULL COMMENT '总价',
  INDEX idx_order_id (`order_id`),
  INDEX idx_course_id (`course_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单详情表';

-- 发票表
CREATE TABLE IF NOT EXISTS `invoice` (
  `invoice_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '发票ID',
  `order_id` INT(11) NOT NULL COMMENT '订单ID',
  `invoice_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '发票号码',
  `invoice_type` VARCHAR(20) COMMENT '发票类型：normal-普通发票，special-专用发票',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT '发票金额',
  `title` VARCHAR(255) NOT NULL COMMENT '发票抬头',
  `tax_no` VARCHAR(50) COMMENT '税号',
  `issue_date` DATE COMMENT '开票日期',
  `status` VARCHAR(20) DEFAULT 'unissued' COMMENT '状态：unissued-未开票，issued-已开票，cancelled-已作废',
  `remark` TEXT COMMENT '备注',
  INDEX idx_order_id (`order_id`),
  INDEX idx_invoice_no (`invoice_no`),
  INDEX idx_status (`status`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='发票表';

-- 退款记录表
CREATE TABLE IF NOT EXISTS `refund_record` (
  `refund_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '退款记录ID',
  `order_id` INT(11) NOT NULL COMMENT '订单ID',
  `refund_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '退款单号',
  `refund_amount` DECIMAL(10, 2) NOT NULL COMMENT '退款金额',
  `reason` TEXT NOT NULL COMMENT '退款原因',
  `status` VARCHAR(20) DEFAULT 'applied' COMMENT '状态：applied-申请中，approved-已批准，rejected-已拒绝，completed-已完成',
  `apply_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  `process_time` TIMESTAMP COMMENT '处理时间',
  `processed_by` INT(11) COMMENT '处理人',
  `remark` TEXT COMMENT '备注',
  INDEX idx_order_id (`order_id`),
  INDEX idx_refund_no (`refund_no`),
  INDEX idx_status (`status`),
  INDEX idx_processed_by (`processed_by`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  FOREIGN KEY (`processed_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款记录表';

-- 10. 学习相关表

-- 成绩表
CREATE TABLE IF NOT EXISTS `score` (
  `score_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '成绩ID',
  `student_id` INT(11) NOT NULL COMMENT '学生ID',
  `course_id` INT(11) NOT NULL COMMENT '课程ID',
  `exam_type` VARCHAR(50) NOT NULL COMMENT '考试类型：midterm-期中，final-期末，quiz-测验，assignment-作业',
  `score_value` DECIMAL(5, 2) COMMENT '成绩分数',
  `exam_date` DATE COMMENT '考试日期',
  `remarks` TEXT COMMENT '备注',
  `created_by` INT(11) COMMENT '录入人',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_student_id (`student_id`),
  INDEX idx_course_id (`course_id`),
  INDEX idx_exam_type (`exam_type`),
  INDEX idx_exam_date (`exam_date`),
  INDEX idx_created_by (`created_by`),
  FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成绩表';

-- 学习进度表
CREATE TABLE IF NOT EXISTS `learning_progress` (
  `progress_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '进度ID',
  `student_id` INT(11) NOT NULL COMMENT '学生ID',
  `course_id` INT(11) NOT NULL COMMENT '课程ID',
  `completed_hours` INT(11) DEFAULT 0 COMMENT '已完成课时',
  `total_hours` INT(11) COMMENT '总课时',
  `progress_percentage` DECIMAL(5, 2) DEFAULT 0 COMMENT '进度百分比',
  `last_study_time` TIMESTAMP COMMENT '最后学习时间',
  `next_schedule_time` TIMESTAMP COMMENT '下次排课时间',
  `attendance_rate` DECIMAL(5, 2) DEFAULT 0 COMMENT '出勤率',
  `avg_score` DECIMAL(5, 2) COMMENT '平均分',
  `status` VARCHAR(20) DEFAULT 'in_progress' COMMENT '状态：in_progress-进行中，completed-已完成，paused-已暂停',
  UNIQUE KEY uk_student_course (`student_id`, `course_id`),
  INDEX idx_student_id (`student_id`),
  INDEX idx_course_id (`course_id`),
  INDEX idx_status (`status`),
  INDEX idx_next_schedule_time (`next_schedule_time`),
  INDEX idx_attendance_rate (`attendance_rate`),
  FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习进度表';

-- 作业表
CREATE TABLE IF NOT EXISTS `assignment` (
  `assignment_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '作业ID',
  `course_id` INT(11) NOT NULL COMMENT '课程ID',
  `title` VARCHAR(255) NOT NULL COMMENT '作业标题',
  `description` TEXT COMMENT '作业描述',
  `start_time` TIMESTAMP NOT NULL COMMENT '发布时间',
  `due_time` TIMESTAMP NOT NULL COMMENT '截止时间',
  `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-进行中，completed-已结束',
  `created_by` INT(11) COMMENT '发布人',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_course_id (`course_id`),
  INDEX idx_title (`title`),
  INDEX idx_status (`status`),
  INDEX idx_created_by (`created_by`),
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业表';

-- 作业提交表
CREATE TABLE IF NOT EXISTS `assignment_submission` (
  `submission_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '提交ID',
  `assignment_id` INT(11) NOT NULL COMMENT '作业ID',
  `student_id` INT(11) NOT NULL COMMENT '学生ID',
  `content` TEXT COMMENT '作业内容',
  `file_path` VARCHAR(255) COMMENT '附件路径',
  `submit_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
  `score` DECIMAL(5, 2) COMMENT '评分',
  `feedback` TEXT COMMENT '教师反馈',
  `graded_by` INT(11) COMMENT '评分人',
  `graded_time` TIMESTAMP COMMENT '评分时间',
  `status` VARCHAR(20) DEFAULT 'submitted' COMMENT '状态：submitted-已提交，graded-已评分，late-迟到',
  UNIQUE KEY uk_assignment_student (`assignment_id`, `student_id`),
  INDEX idx_assignment_id (`assignment_id`),
  INDEX idx_student_id (`student_id`),
  INDEX idx_status (`status`),
  INDEX idx_graded_by (`graded_by`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignment` (`assignment_id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON DELETE CASCADE,
  FOREIGN KEY (`graded_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='作业提交表';

-- 11. 教学资源相关表

-- 教学资源表
CREATE TABLE IF NOT EXISTS `teaching_resource` (
  `resource_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '资源ID',
  `title` VARCHAR(255) NOT NULL COMMENT '资源标题',
  `description` TEXT COMMENT '资源描述',
  `file_path` VARCHAR(255) NOT NULL COMMENT '文件路径',
  `file_size` BIGINT(20) COMMENT '文件大小（字节）',
  `file_type` VARCHAR(50) COMMENT '文件类型',
  `category` VARCHAR(100) COMMENT '资源分类',
  `course_id` INT(11) COMMENT '所属课程',
  `uploader_id` INT(11) NOT NULL COMMENT '上传者ID',
  `upload_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `download_count` INT(11) DEFAULT 0 COMMENT '下载次数',
  `status` VARCHAR(20) DEFAULT 'published' COMMENT '状态：draft-草稿，published-已发布，archived-已归档',
  INDEX idx_title (`title`),
  INDEX idx_category (`category`),
  INDEX idx_course_id (`course_id`),
  INDEX idx_uploader_id (`uploader_id`),
  INDEX idx_status (`status`),
  FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE SET NULL,
  FOREIGN KEY (`uploader_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教学资源表';

-- 12. 系统相关表

-- 公告表
CREATE TABLE IF NOT EXISTS `announcement` (
  `announcement_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '公告ID',
  `title` VARCHAR(255) NOT NULL COMMENT '公告标题',
  `content` TEXT NOT NULL COMMENT '公告内容',
  `type` VARCHAR(50) DEFAULT 'general' COMMENT '公告类型',
  `target_role` VARCHAR(100) COMMENT '目标角色',
  `start_time` TIMESTAMP COMMENT '开始显示时间',
  `end_time` TIMESTAMP COMMENT '结束显示时间',
  `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态：active-有效，inactive-无效',
  `created_by` INT(11) COMMENT '发布人',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_title (`title`),
  INDEX idx_type (`type`),
  INDEX idx_status (`status`),
  INDEX idx_created_by (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS `operation_log` (
  `log_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  `user_id` INT(11) COMMENT '操作用户ID',
  `username` VARCHAR(50) COMMENT '用户名',
  `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型',
  `module` VARCHAR(50) NOT NULL COMMENT '操作模块',
  `action` VARCHAR(255) NOT NULL COMMENT '具体操作',
  `ip_address` VARCHAR(50) COMMENT 'IP地址',
  `user_agent` TEXT COMMENT '用户代理',
  `success` TINYINT(4) DEFAULT 1 COMMENT '是否成功：0-失败，1-成功',
  `error_message` TEXT COMMENT '错误信息',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  INDEX idx_user_id (`user_id`),
  INDEX idx_username (`username`),
  INDEX idx_operation_type (`operation_type`),
  INDEX idx_module (`module`),
  INDEX idx_create_time (`create_time`),
  INDEX idx_success (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS `system_config` (
  `config_id` INT(11) PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
  `config_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  `config_value` TEXT COMMENT '配置值',
  `config_type` VARCHAR(50) DEFAULT 'string' COMMENT '配置类型：string-字符串，number-数字，boolean-布尔值，json-JSON对象',
  `description` VARCHAR(255) COMMENT '配置描述',
  `status` TINYINT(4) DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_config_key (`config_key`),
  INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 插入测试数据

-- 1. 用户表测试数据
INSERT INTO `user` (`username`, `password`, `email`, `phone`, `real_name`, `status`) VALUES
('admin', '123456', 'admin@example.com', '13800138001', '管理员', 1),
('teacher1', '123456', 'teacher1@example.com', '13800138002', '张老师', 1),
('teacher2', '123456', 'teacher2@example.com', '13800138003', '李老师', 1),
('student1', '123456', 'student1@example.com', '13800138004', '王同学', 1),
('student2', '123456', 'student2@example.com', '13800138005', '刘同学', 1);

-- 2. 角色表测试数据
INSERT INTO `role` (`role_name`, `description`) VALUES
('管理员', '系统管理员，拥有所有权限'),
('教师', '教师角色，负责教学工作'),
('学生', '学生角色，参与课程学习'),
('家长', '家长角色，查看学生信息'),
('财务', '财务角色，负责收费管理');

-- 3. 权限表测试数据
INSERT INTO `permission` (`permission_code`, `permission_name`, `module`, `operation`) VALUES
('user:view', '查看用户', '用户管理', 'view'),
('course:add', '添加课程', '课程管理', 'add'),
('teacher:edit', '编辑教师', '教师管理', 'edit'),
('student:delete', '删除学生', '学生管理', 'delete'),
('schedule:view', '查看排课', '排课管理', 'view');

-- 4. 教师表测试数据
INSERT INTO `teacher` (`user_id`, `teacher_no`, `name`, `gender`, `phone`, `email`, `department`, `specialty`) VALUES
(2, 'T001', '张老师', '男', '13800138002', 'teacher1@example.com', '数学组', '高中数学'),
(3, 'T002', '李老师', '女', '13800138003', 'teacher2@example.com', '英语组', '初中英语'),
(1, 'T003', '管理员', '男', '13800138001', 'admin@example.com', '管理部门', '系统管理'),
(NULL, 'T004', '王老师', '男', '13800138006', 'teacher3@example.com', '物理组', '高中物理'),
(NULL, 'T005', '赵老师', '女', '13800138007', 'teacher4@example.com', '化学组', '初中化学');

-- 5. 学生表测试数据
INSERT INTO `student` (`user_id`, `student_no`, `name`, `gender`, `phone`, `email`, `parent_name`, `parent_phone`) VALUES
(4, 'S001', '王同学', '男', '13800138004', 'student1@example.com', '王父', '13900139001'),
(5, 'S002', '刘同学', '女', '13800138005', 'student2@example.com', '刘母', '13900139002'),
(NULL, 'S003', '张同学', '男', '13800138008', 'student3@example.com', '张父', '13900139003'),
(NULL, 'S004', '李同学', '女', '13800138009', 'student4@example.com', '李母', '13900139004'),
(NULL, 'S005', '陈同学', '男', '13800138010', 'student5@example.com', '陈父', '13900139005');

-- 6. 课程表测试数据
INSERT INTO `course` (`course_name`, `description`, `credit`, `total_hours`, `start_date`, `end_date`, `level`, `category`, `status`, `created_by`) VALUES
('高中数学', '高中数学基础知识讲解', 6, 120, '2024-09-01', '2025-06-30', '高级', '数学', 'published', 1),
('初中英语', '初中英语语法和词汇', 4, 80, '2024-09-01', '2025-06-30', '中级', '英语', 'published', 1),
('物理实验', '物理实验操作课程', 2, 40, '2024-09-15', '2025-01-15', '中级', '物理', 'published', 1),
('化学基础', '化学基础知识入门', 3, 60, '2024-10-01', '2025-03-31', '初级', '化学', 'draft', 1),
('生物进阶', '生物学进阶课程', 4, 80, '2024-09-10', '2025-06-20', '高级', '生物', 'published', 1);

-- 7. 班级表测试数据
INSERT INTO `class` (`class_name`, `grade`, `head_teacher_id`, `start_date`, `end_date`, `max_students`, `status`) VALUES
('高三(1)班', '高三', 1, '2024-09-01', '2025-06-30', 50, 'active'),
('初二(2)班', '初二', 2, '2024-09-01', '2025-06-30', 45, 'active'),
('高一(3)班', '高一', 1, '2024-09-01', '2025-06-30', 50, 'active'),
('初三(4)班', '初三', 2, '2024-09-01', '2025-06-30', 45, 'active'),
('高二(5)班', '高二', 1, '2024-09-01', '2025-06-30', 50, 'active');

-- 8. 教室表测试数据
INSERT INTO `classroom` (`room_no`, `capacity`, `location`, `floor`, `building`, `room_type`, `has_projector`, `has_whiteboard`, `has_wifi`, `status`) VALUES
('A101', 50, 'A栋1楼', 1, 'A栋', 'classroom', 1, 1, 1, 'available'),
('B203', 45, 'B栋2楼', 2, 'B栋', 'classroom', 1, 1, 1, 'available'),
('C302', 30, 'C栋3楼', 3, 'C栋', 'lab', 1, 0, 1, 'available'),
('D105', 20, 'D栋1楼', 1, 'D栋', 'computer', 1, 1, 1, 'available'),
('E201', 80, 'E栋2楼', 2, 'E栋', 'meeting', 1, 1, 1, 'available');

-- 9. 学生-班级关联表测试数据
INSERT INTO `student_class` (`student_id`, `class_id`, `join_date`, `status`) VALUES
(1, 1, '2024-09-01', 'active'),
(2, 2, '2024-09-01', 'active'),
(3, 3, '2024-09-01', 'active'),
(4, 4, '2024-09-01', 'active'),
(5, 5, '2024-09-01', 'active');

-- 10. 学生-课程关联表测试数据
INSERT INTO `student_course` (`student_id`, `course_id`, `enrollment_date`, `total_hours`, `remaining_hours`, `used_hours`, `status`) VALUES
(1, 1, '2024-09-01', 120, 100, 20, 'enrolled'),
(2, 2, '2024-09-01', 80, 70, 10, 'enrolled'),
(3, 3, '2024-09-15', 40, 35, 5, 'enrolled'),
(4, 4, '2024-10-01', 60, 60, 0, 'enrolled'),
(5, 5, '2024-09-10', 80, 75, 5, 'enrolled');

-- 11. 排课表测试数据
INSERT INTO `schedule` (`course_id`, `teacher_id`, `class_id`, `classroom_id`, `start_time`, `end_time`, `day_of_week`, `week_no`, `total_weeks`, `hours`, `schedule_type`, `status`) VALUES
(1, 1, 1, 1, '2024-10-15 09:00:00', '2024-10-15 10:30:00', 2, 6, 20, 1.5, 'regular', 'scheduled'),
(2, 2, 2, 2, '2024-10-15 14:00:00', '2024-10-15 15:30:00', 2, 6, 20, 1.5, 'regular', 'scheduled'),
(3, 4, 3, 3, '2024-10-16 10:00:00', '2024-10-16 12:00:00', 3, 6, 16, 2.0, 'regular', 'scheduled'),
(1, 1, 1, 1, '2024-10-17 09:00:00', '2024-10-17 10:30:00', 4, 6, 20, 1.5, 'regular', 'scheduled'),
(2, 2, 2, 2, '2024-10-18 14:00:00', '2024-10-18 15:30:00', 5, 6, 20, 1.5, 'regular', 'scheduled');

-- 12. 扣课规则表测试数据
INSERT INTO `deduction_rule` (`rule_name`, `rule_type`, `attendance_status`, `deduction_ratio`, `min_hours`, `max_hours`, `is_active`, `priority`) VALUES
('正常出勤扣课', 'attendance_based', 'present', 1.00, 0.5, 3.0, 1, 1),
('迟到扣课', 'attendance_based', 'late', 0.80, 0.5, 3.0, 1, 2),
('缺勤扣课', 'attendance_based', 'absent', 1.00, 0.5, 3.0, 1, 3),
('排课自动扣课', 'schedule_based', NULL, 1.00, 0.5, 3.0, 1, 4),
('早退扣课', 'attendance_based', 'early_leave', 0.50, 0.5, 3.0, 1, 5);

-- 13. 课时记录表测试数据
INSERT INTO `course_hours_record` (`student_id`, `course_id`, `teacher_id`, `schedule_id`, `hours`, `record_type`, `record_date`, `class_start_time`, `class_end_time`, `classroom_id`, `recorded_by`) VALUES
(1, 1, 1, 1, 1.5, 'deduction', '2024-10-15', '2024-10-15 09:00:00', '2024-10-15 10:30:00', 1, 1),
(2, 2, 2, 2, 1.5, 'deduction', '2024-10-15', '2024-10-15 14:00:00', '2024-10-15 15:30:00', 2, 1),
(3, 3, 4, 3, 2.0, 'deduction', '2024-10-16', '2024-10-16 10:00:00', '2024-10-16 12:00:00', 3, 1),
(1, 1, 1, 4, 1.5, 'deduction', '2024-10-17', '2024-10-17 09:00:00', '2024-10-17 10:30:00', 1, 1),
(2, 2, 2, 5, 1.5, 'deduction', '2024-10-18', '2024-10-18 14:00:00', '2024-10-18 15:30:00', 2, 1);

-- 14. 签到记录表测试数据
INSERT INTO `attendance` (`schedule_id`, `student_id`, `attendance_time`, `leave_time`, `attendance_type`, `status`) VALUES
(1, 1, '2024-10-15 08:55:00', '2024-10-15 10:30:00', 'manual', 'present'),
(2, 2, '2024-10-15 13:58:00', '2024-10-15 15:30:00', 'manual', 'present'),
(3, 3, '2024-10-16 10:05:00', '2024-10-16 12:00:00', 'manual', 'late'),
(4, 1, '2024-10-17 09:00:00', '2024-10-17 10:30:00', 'manual', 'present'),
(5, 2, '2024-10-18 14:00:00', '2024-10-18 15:30:00', 'manual', 'present');

-- 15. 上课记录表测试数据
INSERT INTO `class_record` (`schedule_id`, `teacher_id`, `classroom_id`, `actual_start_time`, `actual_end_time`, `teaching_content`, `teaching_summary`, `attendance_count`, `late_count`, `absent_count`, `status`, `created_by`) VALUES
(1, 1, 1, '2024-10-15 09:00:00', '2024-10-15 10:30:00', '函数部分讲解', '学生掌握良好', 1, 0, 0, 'completed', 2),
(2, 2, 2, '2024-10-15 14:00:00', '2024-10-15 15:30:00', '语法复习', '学生积极参与', 1, 0, 0, 'completed', 3),
(3, 4, 3, '2024-10-16 10:00:00', '2024-10-16 12:00:00', '实验操作', '学生动手能力强', 1, 1, 0, 'completed', 4),
(4, 1, 1, '2024-10-17 09:00:00', '2024-10-17 10:30:00', '三角函数', '需要课后练习', 1, 0, 0, 'completed', 2),
(5, 2, 2, '2024-10-18 14:00:00', '2024-10-18 15:30:00', '阅读理解', '学生理解能力不错', 1, 0, 0, 'completed', 3);

-- 16. 学生上课档案表测试数据
INSERT INTO `student_class_archive` (`student_id`, `course_id`, `schedule_id`, `class_record_id`, `teacher_id`, `classroom_id`, `class_date`, `class_start_time`, `class_end_time`, `attendance_status`, `hours_deducted`, `teacher_comment`) VALUES
(1, 1, 1, 1, 1, 1, '2024-10-15', '2024-10-15 09:00:00', '2024-10-15 10:30:00', 'present', 1.5, '学习认真'),
(2, 2, 2, 2, 2, 2, '2024-10-15', '2024-10-15 14:00:00', '2024-10-15 15:30:00', 'present', 1.5, '表现良好'),
(3, 3, 3, 3, 4, 3, '2024-10-16', '2024-10-16 10:00:00', '2024-10-16 12:00:00', 'late', 1.2, '下次注意时间'),
(1, 1, 4, 4, 1, 1, '2024-10-17', '2024-10-17 09:00:00', '2024-10-17 10:30:00', 'present', 1.5, '继续保持'),
(2, 2, 5, 5, 2, 2, '2024-10-18', '2024-10-18 14:00:00', '2024-10-18 15:30:00', 'present', 1.5, '积极回答问题');

-- 17. 订单表测试数据
INSERT INTO `orders` (`student_id`, `order_no`, `amount`, `discount`, `actual_amount`, `status`, `payment_method`, `payment_time`, `created_by`) VALUES
(1, 'OD202410010001', 5000.00, 500.00, 4500.00, 'paid', 'alipay', '2024-09-01 10:00:00', 1),
(2, 'OD202410010002', 4000.00, 400.00, 3600.00, 'paid', 'wechat', '2024-09-01 11:00:00', 1),
(3, 'OD202410010003', 3000.00, 300.00, 2700.00, 'paid', 'bank', '2024-09-15 14:00:00', 1),
(4, 'OD202410010004', 3500.00, 0.00, 3500.00, 'pending', NULL, NULL, 1),
(5, 'OD202410010005', 4200.00, 420.00, 3780.00, 'paid', 'alipay', '2024-09-10 09:00:00', 1);

-- 18. 订单详情表测试数据
INSERT INTO `order_item` (`order_id`, `course_id`, `quantity`, `unit_price`, `total_price`) VALUES
(1, 1, 1, 5000.00, 5000.00),
(2, 2, 1, 4000.00, 4000.00),
(3, 3, 1, 3000.00, 3000.00),
(4, 4, 1, 3500.00, 3500.00),
(5, 5, 1, 4200.00, 4200.00);

-- 19. 成绩表测试数据
INSERT INTO `score` (`student_id`, `course_id`, `exam_type`, `score_value`, `exam_date`, `created_by`) VALUES
(1, 1, 'quiz', 95.00, '2024-10-10', 2),
(2, 2, 'quiz', 92.00, '2024-10-10', 3),
(3, 3, 'assignment', 88.00, '2024-10-12', 4),
(1, 1, 'assignment', 90.00, '2024-10-14', 2),
(2, 2, 'assignment', 94.00, '2024-10-14', 3);

-- 20. 学习进度表测试数据
INSERT INTO `learning_progress` (`student_id`, `course_id`, `completed_hours`, `total_hours`, `progress_percentage`, `last_study_time`, `attendance_rate`, `status`) VALUES
(1, 1, 20, 120, 16.67, '2024-10-17 10:30:00', 100.00, 'in_progress'),
(2, 2, 10, 80, 12.50, '2024-10-18 15:30:00', 100.00, 'in_progress'),
(3, 3, 5, 40, 12.50, '2024-10-16 12:00:00', 100.00, 'in_progress'),
(4, 4, 0, 60, 0.00, NULL, 0.00, 'in_progress'),
(5, 5, 5, 80, 6.25, '2024-10-16 16:00:00', 100.00, 'in_progress');

-- 21. 公告表测试数据
INSERT INTO `announcement` (`title`, `content`, `type`, `target_role`, `start_time`, `end_time`, `status`, `created_by`) VALUES
('新学期开学通知', '各位同学，新学期将于9月1日正式开始，请按时到校报到。', 'general', '学生', '2024-08-20 00:00:00', '2024-09-10 00:00:00', 'active', 1),
('教师会议通知', '全体教师请注意，9月5日下午2点在会议室召开新学期工作会议。', 'meeting', '教师', '2024-09-01 00:00:00', '2024-09-05 14:00:00', 'active', 1),
('期中考试安排', '期中考试将于11月15日至11月17日举行，请同学们做好准备。', 'exam', '学生', '2024-10-20 00:00:00', '2024-11-17 00:00:00', 'active', 1),
('系统维护通知', '系统将于10月20日凌晨2点至4点进行维护升级，期间系统暂停使用。', 'system', 'all', '2024-10-18 00:00:00', '2024-10-20 04:00:00', 'active', 1),
('家长开放日通知', '10月25日将举行家长开放日活动，欢迎各位家长前来参观。', 'event', '家长', '2024-10-20 00:00:00', '2024-10-26 00:00:00', 'active', 1);

-- 22. 系统配置表测试数据
INSERT INTO `system_config` (`config_key`, `config_value`, `config_type`, `description`, `status`) VALUES
('system.name', '课程管理系统', 'string', '系统名称', 1),
('system.version', '1.0.0', 'string', '系统版本', 1),
('attendance.allowed_late_minutes', '10', 'number', '允许迟到分钟数', 1),
('deduction.auto_enabled', 'true', 'boolean', '是否启用自动扣课', 1),
('mail.server', 'smtp.example.com', 'string', '邮件服务器地址', 1);

-- 完成数据库创建提示
SELECT '数据库创建成功！' AS message;