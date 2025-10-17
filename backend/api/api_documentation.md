# 课程管理系统后端API文档

## 1. 系统概述

本API文档描述了课程管理系统的后端接口，系统采用Node.js + Express开发，支持用户认证、课程管理、排课管理、签到管理、扣课管理和上课记录管理等核心功能。

## 2. 基础信息

- **API基础路径**: `/api`
- **请求格式**: JSON
- **响应格式**: JSON
- **认证方式**: 会话认证

## 3. 统一响应格式

```json
{
  "success": true/false,
  "message": "操作结果描述",
  "data": {}
}
```

## 4. API接口列表

### 4.1 健康检查接口

#### 4.1.1 系统健康检查

- **URL**: `/health`
- **方法**: `GET`
- **描述**: 检查系统服务状态
- **响应示例**:
  ```json
  {
    "status": "healthy",
    "message": "课程管理系统后端服务运行正常"
  }
  ```

#### 4.1.2 数据库连接检查

- **URL**: `/db/check`
- **方法**: `GET`
- **描述**: 检查数据库连接状态
- **响应示例**:
  ```json
  {
    "status": "connected",
    "message": "数据库连接成功"
  }
  ```

### 4.2 用户认证模块

#### 4.2.1 用户登录

- **URL**: `/api/auth/login`
- **方法**: `POST`
- **描述**: 用户登录
- **请求体**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "登录成功",
    "data": {
      "userId": 1,
      "username": "admin",
      "roleName": "超级管理员"
    }
  }
  ```

#### 4.2.2 用户登出

- **URL**: `/api/auth/logout`
- **方法**: `POST`
- **描述**: 用户登出
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "登出成功"
  }
  ```

#### 4.2.3 获取当前用户信息

- **URL**: `/api/auth/profile`
- **方法**: `GET`
- **描述**: 获取当前登录用户信息
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "userId": 1,
      "username": "admin",
      "roleName": "超级管理员"
    }
  }
  ```

#### 4.2.4 更新用户信息

- **URL**: `/api/auth/profile`
- **方法**: `PUT`
- **描述**: 更新当前用户信息
- **请求体**:
  ```json
  {
    "realName": "string",
    "phone": "string",
    "email": "string"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "更新成功"
  }
  ```

#### 4.2.5 修改密码

- **URL**: `/api/auth/change-password`
- **方法**: `POST`
- **描述**: 修改当前用户密码
- **请求体**:
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "密码修改成功"
  }
  ```

### 4.3 用户管理模块

#### 4.3.1 获取用户列表

- **URL**: `/api/users`
- **方法**: `GET`
- **描述**: 获取用户列表（分页）
- **请求参数**:
  - `page`: 页码
  - `pageSize`: 每页大小
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "list": [],
      "total": 100,
      "page": 1,
      "pageSize": 10
    }
  }
  ```

#### 4.3.2 获取用户详情

- **URL**: `/api/users/:userId`
- **方法**: `GET`
- **描述**: 获取用户详情
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "user_id": 1,
      "username": "admin",
      "real_name": "管理员"
    }
  }
  ```

#### 4.3.3 创建用户

- **URL**: `/api/users`
- **方法**: `POST`
- **描述**: 创建新用户
- **请求体**:
  ```json
  {
    "username": "string",
    "password": "string",
    "realName": "string",
    "roleId": 1
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "用户创建成功"
  }
  ```

#### 4.3.4 更新用户状态

- **URL**: `/api/users/:userId/status`
- **方法**: `PUT`
- **描述**: 更新用户状态（启用/禁用）
- **请求体**:
  ```json
  {
    "status": 1/0
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "状态更新成功"
  }
  ```

#### 4.3.5 删除用户

- **URL**: `/api/users/:userId`
- **方法**: `DELETE`
- **描述**: 删除用户
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "用户删除成功"
  }
  ```

#### 4.3.6 重置用户密码

- **URL**: `/api/users/:userId/reset-password`
- **方法**: `POST`
- **描述**: 重置用户密码
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "密码重置成功"
  }
  ```

### 4.4 课程管理模块

#### 4.4.1 获取课程列表

- **URL**: `/api/courses`
- **方法**: `GET`
- **描述**: 获取课程列表（分页）
- **请求参数**:
  - `page`: 页码
  - `pageSize`: 每页大小
  - `keyword`: 搜索关键词
  - `categoryId`: 分类ID
  - `status`: 状态
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "list": [],
      "total": 50,
      "page": 1,
      "pageSize": 10
    }
  }
  ```

#### 4.4.2 获取课程详情

- **URL**: `/api/courses/:courseId`
- **方法**: `GET`
- **描述**: 获取课程详情
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "course_id": 1,
      "course_name": "数学基础",
      "description": "数学基础知识课程",
      "total_hours": 40,
      "price": 2000
    }
  }
  ```

#### 4.4.3 创建课程

- **URL**: `/api/courses`
- **方法**: `POST`
- **描述**: 创建新课程
- **请求体**:
  ```json
  {
    "courseName": "string",
    "description": "string",
    "categoryId": 1,
    "teacherId": 1,
    "totalHours": 40,
    "price": 2000
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "课程创建成功"
  }
  ```

### 4.5 排课管理模块

#### 4.5.1 创建排课

- **URL**: `/api/schedules`
- **方法**: `POST`
- **描述**: 创建排课记录
- **请求体**:
  ```json
  {
    "courseId": 1,
    "teacherId": 1,
    "classId": 1,
    "classroomId": 1,
    "startTime": "2023-10-20 09:00:00",
    "endTime": "2023-10-20 11:00:00",
    "hours": 2
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "scheduleId": 1
    }
  }
  ```

#### 4.5.2 获取排课列表

- **URL**: `/api/schedules`
- **方法**: `GET`
- **描述**: 获取排课列表（分页）
- **请求参数**:
  - `page`: 页码
  - `pageSize`: 每页大小
  - `teacherId`: 教师ID
  - `courseId`: 课程ID
  - `studentId`: 学生ID
  - `status`: 状态
  - `startDate`: 开始日期
  - `endDate`: 结束日期
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "list": [],
      "total": 30,
      "page": 1,
      "pageSize": 10
    }
  }
  ```

### 4.6 签到管理模块

#### 4.6.1 学生签到

- **URL**: `/api/attendance/check-in`
- **方法**: `POST`
- **描述**: 学生签到
- **请求体**:
  ```json
  {
    "scheduleId": 1,
    "studentId": 1,
    "attendanceType": "manual",
    "location": "string",
    "deviceInfo": "string"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "签到成功",
    "data": {
      "attendanceId": 1,
      "status": "present",
      "lateMinutes": 0,
      "checkInTime": "2023-10-20 08:55:00"
    }
  }
  ```

#### 4.6.2 学生签退

- **URL**: `/api/attendance/check-out`
- **方法**: `POST`
- **描述**: 学生签退
- **请求体**:
  ```json
  {
    "scheduleId": 1,
    "studentId": 1,
    "leaveType": "manual"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "签退成功"
  }
  ```

### 4.7 扣课管理模块

#### 4.7.1 手动扣课

- **URL**: `/api/deduction/deduct`
- **方法**: `POST`
- **描述**: 手动扣减学生课时
- **请求体**:
  ```json
  {
    "studentId": 1,
    "courseId": 1,
    "hours": 2,
    "reason": "正常上课",
    "scheduleId": 1,
    "teacherId": 1
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "扣课成功",
    "data": {
      "deductionHours": 2,
      "remainingHours": 38
    }
  }
  ```

#### 4.7.2 批量扣课

- **URL**: `/api/deduction/batch-deduct`
- **方法**: `POST`
- **描述**: 批量扣减排课中所有学生的课时
- **请求体**:
  ```json
  {
    "scheduleId": 1,
    "deductionHours": 2
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "批量扣课成功"
  }
  ```

### 4.8 上课记录模块

#### 4.8.1 创建上课记录

- **URL**: `/api/records`
- **方法**: `POST`
- **描述**: 创建上课记录
- **请求体**:
  ```json
  {
    "scheduleId": 1,
    "teachingContent": "string",
    "teachingSummary": "string",
    "homework": "string"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "recordId": 1,
      "attendanceStats": {
        "total": 20,
        "present": 18,
        "late": 1,
        "absent": 1,
        "earlyLeave": 0
      }
    }
  }
  ```

#### 4.8.2 获取上课记录列表

- **URL**: `/api/records`
- **方法**: `GET`
- **描述**: 获取上课记录列表（分页）
- **请求参数**:
  - `page`: 页码
  - `pageSize`: 每页大小
  - `teacherId`: 教师ID
  - `courseId`: 课程ID
  - `studentId`: 学生ID
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "list": [],
      "total": 25,
      "page": 1,
      "pageSize": 10
    }
  }
  ```

### 4.9 教师管理模块

#### 4.9.1 获取教师列表

- **URL**: `/api/teachers`
- **方法**: `GET`
- **描述**: 获取教师列表（分页）
- **请求参数**:
  - `page`: 页码
  - `pageSize`: 每页大小
  - `keyword`: 搜索关键词
- **响应示例**:
  ```json
  {
    "success": true,
    "data": {
      "list": [],
      "total": 15,
      "page": 1,
      "pageSize": 10
    }
  }
  ```

## 5. 错误码说明

| 错误码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权或认证失败 |
| 403 | 没有权限执行该操作 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 6. 安全注意事项

1. 所有敏感操作需要进行权限验证
2. 密码采用加密存储
3. 避免SQL注入攻击
4. 接口调用频率限制
5. 敏感数据传输使用HTTPS