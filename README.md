# 课程管理系统设计文档

## 1. 系统概述

### 1.1 系统简介
课程管理系统是为培训机构设计的综合性管理平台，旨在提高教学管理效率，优化教学流程，提供全面的课程、教师、学生和资源管理功能。系统支持多角色协作，数据统计分析，以及灵活的课程安排，满足培训机构日常运营的各项需求。

### 1.2 系统目标
- 实现课程信息的全面管理和维护
- 优化学生、教师和班级的管理流程
- 提供灵活的排课和签到管理功能
- 实现教学资源的有效管理和共享
- 提供订单处理和财务管理功能
- 支持学习进度跟踪和成绩统计分析
- 确保数据安全和系统稳定性

## 2. 系统架构

### 2.1 整体架构
系统采用三层架构设计：
- **表现层**：Web前端界面，提供用户交互
- **业务逻辑层**：处理核心业务逻辑，实现各功能模块
- **数据访问层**：负责数据存储和检索

### 2.2 技术栈
- **前端**：Vue.js + Element UI
- **后端**：Node.js
- **数据库**：MySQL
- **权限控制**：JWT + RBAC模型
- **文件存储**：本地存储或云存储


### 2.3 系统架构图
```
+------------------+      +------------------+      +------------------+
|   表现层         |      |   业务逻辑层     |      |   数据访问层     |
|                  |      |                  |      |                  |
|  Web前端         |<---->|  Node.js应用     |<---->|  MySQL数据库     |
|  Vue.js + Element|<---->|  Express/Koa框架 |<---->|  本地/云存储     |
+------------------+      +------------------+      +------------------+
```


## 3. 系统角色

### 3.1 超级管理员
- 用户管理：创建、删除、编辑所有用户账户
- 权限管理：分配和管理所有用户的权限，创建和修改角色及权限组
- 系统管理：系统参数配置和维护，系统升级管理
- 数据管理：数据备份和恢复，数据导入导出
- 日志审计：查看所有操作日志，进行安全审计
- 模块管理：启用/禁用系统功能模块，配置模块参数

### 3.2 系统管理员
- 用户管理：创建、编辑和禁用普通用户（教师、学生、财务/行政人员）
- 教师/学生管理：教师/学生信息的创建、修改和查询
- 课程管理：课程创建、修改、删除、排课和查询
- 权限管理：管理非管理员角色的权限分配
- 日志管理：查看系统运行日志和用户操作日志
- 数据统计：生成系统使用统计报表
- 班级管理：班级创建、修改和管理

### 3.3 教师
- 课程信息管理：查看和修改已分配课程的基本信息
- 学生管理：查询学生信息，查看学生课时情况
- 成绩管理：成绩录入、修改、查询和统计分析
- 排课管理：仅排课和查询功能，无删除课程权限
- 教学资源管理：教学资源上传、下载、查询和管理
- 签到管理：发起课堂签到，设置密码签到，查看签到统计
- 学习进度管理：跟踪和记录学生的学习进度
- 作业管理：布置、批改作业，查看作业完成情况
- 公告管理：发布课程相关公告和通知

### 3.4 学生
- 课程管理：查询已报名课程信息，查看课程表
- 个人信息管理：查看和修改个人基本信息
- 在线学习：访问在线学习资源，观看课程视频
- 作业管理：查看作业要求，提交作业，查看作业批改结果
- 成绩管理：查询个人学习成绩和排名
- 签到管理：参与课程签到，查看个人出勤记录
- 学习进度：查看个人学习进度和完成情况
- 消息管理：查看系统通知和课程相关消息

### 3.5 财务/行政人员
- 订单管理：创建、修改、取消和跟踪学生报名订单
- 学生管理：学生信息查询和创建，学生档案管理
- 课时管理：学生课时录入、修改、查询和统计
- 费用管理：收费标准设置、费用核算、账单生成
- 财务报表：生成财务统计报表、收入支出分析
- 发票管理：开具和管理发票
- 退费管理：处理学生退费申请和审批
- 统计分析：学生报名统计、收入统计等数据分析

## 4. 核心功能模块

### 4.1 课程编排

#### 4.1.1 功能描述
提供灵活的课程编排功能，支持按时间段、教师、教室等条件进行排课，避免时间冲突。
可视化输出当前教室的实时状态，包括上课老师信息、上课人数统计、当前课程进度等关键数据。

#### 4.1.2 子功能
- 课程计划创建
- 排课冲突检测
- 课程表生成和导出
- 课程调整和修改

#### 4.1.3 数据结构
```sql
-- 课程表
CREATE TABLE course (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course_name VARCHAR(100) NOT NULL,
    description TEXT,
    credit INT,
    total_hours INT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 课程表
CREATE TABLE schedule (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    teacher_id INT,
    classroom_id INT,
    start_time DATETIME,
    end_time DATETIME,
    day_of_week INT,
    status VARCHAR(20),
    FOREIGN KEY (course_id) REFERENCES course(course_id),
    FOREIGN KEY (teacher_id) REFERENCES user(user_id),
    FOREIGN KEY (classroom_id) REFERENCES classroom(classroom_id)
);
```

### 4.2 信息查询

#### 4.2.1 功能描述
提供多维度的信息查询功能，包括课程、学生、教师、班级等信息的查询和统计。

#### 4.2.2 子功能
- 课程信息查询
- 学生信息查询
- 教师信息查询
- 班级信息查询
- 学习成绩查询
- 数据统计报表生成

#### 4.2.3 查询条件
- 按关键词搜索
- 按日期范围筛选
- 按状态筛选
- 多条件组合查询
- 排序和分页

### 4.3 学生信息添加与课时管理

#### 4.3.1 功能描述
支持学生信息的录入、编辑、删除和查询，以及学生与班级、课程的关联管理。同时提供学生课时的录入、查询和管理功能，支持按课程、时间段进行课时统计。

#### 4.3.2 子功能
- 单个学生信息添加
- 批量学生信息导入
- 学生信息编辑和删除
- 学生分班管理
- 学生选课管理
- 学生档案管理
- 学生课时录入：记录学生已上课时和剩余课时
- 课时查询统计：按学生、课程、时间段统计课时信息
- 课时预警提醒：当学生课时不足时自动提醒

#### 4.3.3 数据结构
```sql
-- 学生表
CREATE TABLE student (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    student_no VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    birthday DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    enrollment_date DATE,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- 学生-课程关联表
CREATE TABLE student_course (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    course_id INT,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_hours DECIMAL(5,1) DEFAULT 0, -- 总课时
    remaining_hours DECIMAL(5,1) DEFAULT 0, -- 剩余课时
    used_hours DECIMAL(5,1) DEFAULT 0, -- 已使用课时
    status VARCHAR(20),
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);

-- 课时记录表
CREATE TABLE course_hours_record (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    course_id INT,
    teacher_id INT,
    hours DECIMAL(5,1) NOT NULL, -- 课时数量
    record_date DATE,
    record_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by INT, -- 录入人
    remark VARCHAR(255),
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (course_id) REFERENCES course(course_id),
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id),
    FOREIGN KEY (recorded_by) REFERENCES user(user_id)
);
```

### 4.4 课程签到管理

#### 4.4.1 功能描述
提供课程签到功能，支持多种签到方式，自动记录学生出勤情况。

#### 4.4.2 子功能
- 课堂签到
- 签到记录查询和统计
- 缺勤提醒
- 签到数据导出
- 迟到、早退记录

#### 4.4.3 签到方式
- 二维码签到：生成动态二维码，学生扫描完成签到
- 人脸识别签到：通过人脸识别技术快速完成签到
- 手动签到：教师手动标记学生出勤状态
- 定位签到：基于地理位置的签到验证
- 密码签到：由老师为每次课程设置临时密码，学生输入密码完成签到

#### 4.4.4 数据结构
```sql
-- 签到记录表
CREATE TABLE attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT,
    student_id INT,
    attendance_time TIMESTAMP,
    attendance_type VARCHAR(20),
    status VARCHAR(20), -- 出勤、迟到、早退、缺勤
    remark VARCHAR(255),
    FOREIGN KEY (schedule_id) REFERENCES schedule(schedule_id),
    FOREIGN KEY (student_id) REFERENCES student(student_id)
);
```

### 4.5 订单处理

#### 4.5.1 功能描述
处理学生报名、缴费等订单相关业务，支持多种支付方式和订单状态管理。

#### 4.5.2 子功能
- 订单创建
- 支付管理
- 订单状态跟踪
- 退款处理
- 订单查询和统计
- 发票管理

#### 4.5.3 数据结构
```sql
-- 订单表
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20), -- 待支付、已支付、已取消、已退款
    payment_method VARCHAR(50),
    payment_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(student_id)
);

-- 订单详情表
CREATE TABLE order_item (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    course_id INT,
    quantity INT,
    unit_price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);
```

### 4.6 课程信息录入

#### 4.6.1 功能描述
提供课程基本信息的录入、编辑、删除和查询功能。

#### 4.6.2 子功能
- 课程基本信息管理
- 课程大纲管理
- 课程教材管理
- 课程评价管理
- 课程状态管理

#### 4.6.3 课程属性
- 课程名称
- 课程描述
- 学分/学时
- 开课时间
- 结课时间
- 课程状态
- 课程大纲
- 适用对象

## 5. 辅助功能模块

### 5.1 教师管理

#### 5.1.1 功能描述
管理教师信息，包括个人资料、教学科目、授课安排等。

#### 5.1.2 子功能
- 教师信息管理
- 教师授课安排
- 教师评价管理
- 教师考勤管理
- 教师绩效统计

#### 5.1.3 数据结构
```sql
-- 教师表
CREATE TABLE teacher (
    teacher_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    teacher_no VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    birthday DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    hire_date DATE,
    position VARCHAR(50),
    department VARCHAR(100),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);
```

### 5.2 班级管理

#### 5.2.1 功能描述
管理班级信息，包括班级创建、学生分班、班级课程安排等。

#### 5.2.2 子功能
- 班级创建和管理
- 学生分班管理
- 班级课程安排
- 班级通讯录
- 班级统计信息

#### 5.2.3 数据结构
```sql
-- 班级表
CREATE TABLE class (
    class_id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(100) NOT NULL,
    grade VARCHAR(50),
    head_teacher_id INT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (head_teacher_id) REFERENCES teacher(teacher_id)
);

-- 学生-班级关联表
CREATE TABLE student_class (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    class_id INT,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20),
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (class_id) REFERENCES class(class_id)
);
```

### 5.3 教学资源管理

#### 5.3.1 功能描述
管理各类教学资源，包括教案、课件、视频、音频、文档等。

#### 5.3.2 子功能
- 教学资源上传和下载
- 资源分类管理
- 资源搜索和预览
- 资源权限控制
- 资源版本管理

#### 5.3.3 数据结构
```sql
-- 教学资源表
CREATE TABLE teaching_resource (
    resource_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(50),
    category VARCHAR(100),
    course_id INT,
    uploader_id INT,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_count INT DEFAULT 0,
    status VARCHAR(20),
    FOREIGN KEY (course_id) REFERENCES course(course_id),
    FOREIGN KEY (uploader_id) REFERENCES user(user_id)
);
```

### 5.4 学习进度跟踪

#### 5.4.1 功能描述
跟踪和记录学生的学习进度，提供学习建议和预警功能。

#### 5.4.2 子功能
- 学习进度记录
- 学习计划制定
- 进度统计和分析
- 学习预警提醒
- 学习建议生成

#### 5.4.3 数据结构
```sql
-- 学习进度表
CREATE TABLE learning_progress (
    progress_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    course_id INT,
    completed_hours INT DEFAULT 0,
    total_hours INT,
    progress_percentage DECIMAL(5, 2),
    last_study_time TIMESTAMP,
    status VARCHAR(20),
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);
```

### 5.5 成绩统计分析

#### 5.5.1 功能描述
记录学生成绩，提供多维度的成绩统计和分析功能。

#### 5.5.2 子功能
- 成绩录入和管理
- 成绩统计报表
- 成绩分析图表
- 学生成绩查询
- 成绩预警

#### 5.5.3 数据结构
```sql
-- 成绩表
CREATE TABLE score (
    score_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    course_id INT,
    exam_type VARCHAR(50),
    score_value DECIMAL(5, 2),
    exam_date DATE,
    remarks TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (course_id) REFERENCES course(course_id),
    FOREIGN KEY (created_by) REFERENCES user(user_id)
);
```

## 6. 系统操作流程

### 6.1 用户登录流程
1. 用户打开系统登录页面
2. 输入用户名和密码
3. 系统验证用户身份
4. 根据用户角色分配权限
5. 进入系统主界面

### 6.2 课程创建流程
1. 教师/管理员进入课程管理模块
2. 点击"创建课程"按钮
3. 填写课程基本信息
4. 设置课程大纲和教学计划
5. 提交保存课程信息
6. 系统生成课程记录

### 6.3 学生报名流程
1. 学生浏览可报名课程
2. 选择课程并点击"立即报名"
3. 确认订单信息
4. 选择支付方式并完成支付
5. 系统生成订单并更新学生课程信息

### 6.4 课堂签到流程
1. 教师进入签到管理模块
2. 选择对应的课程和班级
3. 生成签到码或选择其他签到方式
4. 学生进行签到
5. 系统记录签到信息并实时更新
6. 签到结束后生成签到报表

### 6.5 成绩录入流程
1. 教师进入成绩管理模块
2. 选择课程和考试类型
3. 录入学生成绩（支持单个录入或批量导入）
4. 系统进行数据验证
5. 提交保存成绩信息
6. 学生可查询个人成绩

## 7. 系统安全设计

### 7.1 权限控制

#### 7.1.1 权限数据结构
```sql
-- 权限表
CREATE TABLE permission (
    permission_id INT PRIMARY KEY AUTO_INCREMENT,
    permission_code VARCHAR(50) NOT NULL UNIQUE, -- 权限编码
    permission_name VARCHAR(100) NOT NULL, -- 权限名称
    module VARCHAR(50) NOT NULL, -- 所属模块
    operation VARCHAR(50), -- 操作类型：add, edit, delete, view
    description TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE role (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 角色-权限关联表
CREATE TABLE role_permission (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT,
    permission_id INT,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE
);

-- 用户-角色关联表
CREATE TABLE user_role (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    role_id INT,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE
);

-- 权限组表
CREATE TABLE permission_group (
    group_id INT PRIMARY KEY AUTO_INCREMENT,
    group_name VARCHAR(100) NOT NULL,
    description TEXT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 权限组-权限关联表
CREATE TABLE group_permission (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT,
    permission_id INT,
    FOREIGN KEY (group_id) REFERENCES permission_group(group_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(permission_id) ON DELETE CASCADE
);
```

#### 7.1.2 权限管理功能模块
- **权限点管理**：新增、修改、删除系统权限点
- **角色管理**：创建和管理角色，分配权限
- **权限组管理**：创建权限组，批量管理权限
- **用户授权**：为用户分配角色或直接分配权限
- **权限继承**：支持角色权限继承，简化权限层级管理
- **权限验证**：API接口权限验证，前端路由权限控制
- **权限审计**：记录权限变更历史，便于追溯

#### 7.1.3 后续可扩展权限
系统设计预留了权限扩展空间，后续可根据业务需求增加以下特定权限：
- **数据范围权限**：控制用户可访问的数据范围，如仅允许查看特定班级、特定时间段的数据
- **字段级权限**：控制用户对数据字段的访问权限，如某些敏感字段仅对特定角色可见
- **操作时效性权限**：设置权限的有效期，如临时授权某教师查看特定学生信息
- **审批流程权限**：配置多级审批流程中的审批权限
- **报表定制权限**：控制用户对报表的定制和导出权限
- **API调用权限**：控制第三方系统对API的调用权限和频率
- **批量操作权限**：控制用户进行批量操作的权限，如批量导入、批量修改等
- **敏感操作权限**：对敏感操作（如数据删除）设置更严格的权限控制和审批流程
- 基于角色的访问控制（RBAC）：结合JWT实现灵活的权限管理
- 细粒度的权限管理：支持按模块、操作类型进行权限分配，实现增、删、改、查操作级别的权限控制
- 操作日志记录：记录所有关键操作，便于审计和追溯
- 动态权限调整：管理员可实时调整用户权限，无需重启系统
- 权限可扩展性：设计支持后续新增权限点，可根据业务需求动态添加权限定义
- 权限组管理：支持将相关权限打包为权限组，简化权限分配
- 数据权限控制：支持基于数据范围的权限控制，如部门、班级等维度的权限隔离

### 7.2 数据安全
- 数据加密存储：敏感数据采用加密存储，如用户密码、支付信息等
- 定期数据备份：建立完善的数据备份和恢复机制
- 防SQL注入：使用参数化查询，防止SQL注入攻击
- XSS攻击防护：输入验证和输出转义，防止跨站脚本攻击
- CSRF防护：实施跨站请求伪造防护措施
- 数据脱敏：在非必要场景下对敏感数据进行脱敏处理
- 访问控制：基于权限的数据访问控制
- 数据审计：记录数据变更历史，便于追踪

### 7.3 用户认证
- JWT token认证：无状态认证，便于水平扩展，支持token刷新机制
- 密码加密存储：采用bcrypt等安全算法进行密码哈希存储
- 会话管理：token有效期控制，支持主动登出，支持多终端登录管理
- 多因素认证：可选功能，如短信验证码、邮箱验证码等，增强账户安全性
- 账户锁定：连续登录失败次数过多时自动锁定账户
- 密码复杂度策略：强制要求密码复杂度，定期提醒密码更新
- 登录审计：记录用户登录日志，包括登录时间、IP地址、设备信息等

## 8. 系统扩展性设计

### 8.1 模块化设计
采用模块化设计，各功能模块低耦合高内聚，便于系统扩展和维护。

### 8.2 接口设计
提供标准的API接口，支持第三方系统集成和功能扩展。

### 8.3 插件机制
设计插件机制，支持功能模块的动态加载和卸载。

## 9. 系统部署建议

### 9.1 硬件需求
- 服务器：4核8G及以上配置
- 存储空间：至少100GB
- 数据库服务器：建议独立部署

### 9.2 软件环境
- 操作系统：Linux/Windows Server/macOS
- Node.js：14.x及以上版本
- npm/yarn：最新稳定版
- MySQL：5.7及以上
- 可选：MongoDB（用于非结构化数据存储）
- 可选：Redis（用于缓存优化）

### 9.3 部署架构
建议采用负载均衡架构，确保系统高可用性和性能。

## 10. 后续功能规划

### 10.1 在线学习功能
- 视频直播教学
- 录播课程观看
- 在线作业提交和批改

### 10.2 智能分析功能
- 学习行为分析
- 个性化学习推荐
- 智能排课优化

### 10.3 家校互动功能
- 家长端应用
- 家校通知系统
- 学生表现报告

### 10.4 移动应用
- 教师端移动应用
- 学生端移动应用
- 家长端移动应用

---

本文档详细描述了课程管理系统的设计方案，包括系统架构、功能模块、数据结构和操作流程等。系统设计充分考虑了培训机构的实际需求，提供了全面的课程管理解决方案，可根据实际情况进行适当调整和扩展。
