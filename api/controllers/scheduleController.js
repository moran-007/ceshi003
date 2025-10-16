// 排课控制器
const { executeQuery, executeTransaction } = require('../../db/connection');
const DBUtils = require('../../db/dbUtils');

const scheduleController = {
  // 创建排课
  async createSchedule(req, res) {
    try {
      const { courseId, teacherId, classId, classroomId, startTime, endTime, hours } = req.body;
      
      // 验证参数
      if (!courseId || !teacherId || !classroomId || !startTime || !endTime || !hours) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
      }
      
      // 检查排课冲突
      const conflictCheck = await this.checkScheduleConflictInternal(req);
      if (conflictCheck.conflict) {
        return res.status(400).json({ success: false, message: '排课时间冲突', conflictInfo: conflictCheck.info });
      }
      
      // 创建排课记录
      const scheduleId = await DBUtils.create('schedule', {
        course_id: courseId,
        teacher_id: teacherId,
        class_id: classId,
        classroom_id: classroomId,
        start_time: startTime,
        end_time: endTime,
        hours: hours,
        status: 'scheduled'
      });
      
      // 更新教室使用状态
      await DBUtils.create('classroom_status_log', {
        classroom_id: classroomId,
        schedule_id: scheduleId,
        start_time: startTime,
        end_time: endTime,
        status: 'booked',
        created_by: req.user?.userId || 1
      });
      
      res.status(201).json({ success: true, data: { scheduleId } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取排课列表
  async getSchedules(req, res) {
    try {
      const { page = 1, pageSize = 10, teacherId, courseId, studentId, status, startDate, endDate } = req.query;
      
      let conditions = {};
      if (teacherId) conditions.teacher_id = teacherId;
      if (courseId) conditions.course_id = courseId;
      if (status) conditions.status = status;
      
      let sql = 'SELECT s.*, c.course_name, t.name as teacher_name, cl.class_name, cr.room_no ';
      sql += 'FROM schedule s ';
      sql += 'LEFT JOIN course c ON s.course_id = c.course_id ';
      sql += 'LEFT JOIN teacher t ON s.teacher_id = t.teacher_id ';
      sql += 'LEFT JOIN class cl ON s.class_id = cl.class_id ';
      sql += 'LEFT JOIN classroom cr ON s.classroom_id = cr.classroom_id ';
      
      const whereConditions = [];
      const params = [];
      
      if (Object.keys(conditions).length > 0) {
        Object.entries(conditions).forEach(([key, value]) => {
          whereConditions.push(`s.${key} = ?`);
          params.push(value);
        });
      }
      
      if (startDate) {
        whereConditions.push('s.start_time >= ?');
        params.push(startDate);
      }
      
      if (endDate) {
        whereConditions.push('s.end_time <= ?');
        params.push(endDate);
      }
      
      if (studentId) {
        sql += 'JOIN schedule_student ss ON s.schedule_id = ss.schedule_id ';
        whereConditions.push('ss.student_id = ?');
        params.push(studentId);
      }
      
      if (whereConditions.length > 0) {
        sql += 'WHERE ' + whereConditions.join(' AND ');
      }
      
      sql += ' ORDER BY s.start_time DESC ';
      sql += ` LIMIT ${(page - 1) * pageSize}, ${pageSize}`;
      
      const schedules = await executeQuery(sql, params);
      
      // 获取总数
      const countSql = `SELECT COUNT(*) as count FROM schedule s ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}`;
      const [countResult] = await executeQuery(countSql, params);
      
      res.json({ 
        success: true, 
        data: { 
          list: schedules, 
          total: countResult.count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取排课详情
  async getScheduleById(req, res) {
    try {
      const { scheduleId } = req.params;
      
      const sql = 'SELECT s.*, c.course_name, t.name as teacher_name, cl.class_name, cr.room_no ' +
                 'FROM schedule s ' +
                 'LEFT JOIN course c ON s.course_id = c.course_id ' +
                 'LEFT JOIN teacher t ON s.teacher_id = t.teacher_id ' +
                 'LEFT JOIN class cl ON s.class_id = cl.class_id ' +
                 'LEFT JOIN classroom cr ON s.classroom_id = cr.classroom_id ' +
                 'WHERE s.schedule_id = ?';
      
      const [schedule] = await executeQuery(sql, [scheduleId]);
      
      if (!schedule) {
        return res.status(404).json({ success: false, message: '排课记录不存在' });
      }
      
      res.json({ success: true, data: schedule });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 取消排课
  async cancelSchedule(req, res) {
    try {
      const { scheduleId } = req.params;
      const { reason } = req.body;
      
      // 验证排课是否存在
      const schedule = await DBUtils.findOne('schedule', { schedule_id: scheduleId });
      if (!schedule) {
        return res.status(404).json({ success: false, message: '排课记录不存在' });
      }
      
      if (schedule.status !== 'scheduled') {
        return res.status(400).json({ success: false, message: '只有已排课状态的记录可以取消' });
      }
      
      // 更新排课状态
      await DBUtils.update('schedule', { status: 'canceled', cancel_reason: reason }, { schedule_id: scheduleId });
      
      // 更新教室使用状态
      await DBUtils.update('classroom_status_log', { status: 'available' }, { schedule_id: scheduleId });
      
      res.json({ success: true, message: '排课已成功取消' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 检查排课冲突（内部方法）
  async checkScheduleConflictInternal(req) {
    const { teacherId, classroomId, startTime, endTime, scheduleId } = req.body || req.query;
    
    let sql = 'SELECT schedule_id, course_id, teacher_id, classroom_id, start_time, end_time ';
    sql += 'FROM schedule ';
    sql += 'WHERE status = "scheduled" AND ((start_time < ? AND end_time > ?) ';
    sql += 'OR (start_time < ? AND end_time > ?) ';
    sql += 'OR (start_time >= ? AND end_time <= ?)) ';
    
    const params = [endTime, startTime, endTime, startTime, startTime, endTime];
    
    if (teacherId) {
      sql += 'AND teacher_id = ? ';
      params.push(teacherId);
    }
    
    if (classroomId) {
      sql += 'AND classroom_id = ? ';
      params.push(classroomId);
    }
    
    if (scheduleId) {
      sql += 'AND schedule_id != ? ';
      params.push(scheduleId);
    }
    
    const conflicts = await executeQuery(sql, params);
    
    return {
      conflict: conflicts.length > 0,
      info: conflicts
    };
  },

  // 检查排课冲突（API接口）
  async checkScheduleConflict(req, res) {
    try {
      const result = await this.checkScheduleConflictInternal(req);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取排课学生列表
  async getScheduleStudents(req, res) {
    try {
      const { scheduleId } = req.params;
      
      const sql = 'SELECT s.student_id, s.name as student_name, s.student_no, sc.remaining_hours ' +
                 'FROM schedule_student ss ' +
                 'JOIN student s ON ss.student_id = s.student_id ' +
                 'LEFT JOIN student_course sc ON ss.student_id = sc.student_id AND ss.course_id = sc.course_id ' +
                 'WHERE ss.schedule_id = ? AND ss.status = "active"';
      
      const students = await executeQuery(sql, [scheduleId]);
      
      res.json({ success: true, data: students });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 添加学生到排课
  async addStudentsToSchedule(req, res) {
    try {
      const { scheduleId } = req.params;
      const { studentIds } = req.body;
      
      if (!studentIds || !Array.isArray(studentIds)) {
        return res.status(400).json({ success: false, message: '请提供有效的学生ID列表' });
      }
      
      // 验证排课是否存在
      const schedule = await DBUtils.findOne('schedule', { schedule_id: scheduleId });
      if (!schedule) {
        return res.status(404).json({ success: false, message: '排课记录不存在' });
      }
      
      // 批量添加学生到排课
      const operations = studentIds.map(studentId => ({
        sql: 'INSERT IGNORE INTO schedule_student (schedule_id, student_id, course_id) VALUES (?, ?, ?)',
        params: [scheduleId, studentId, schedule.course_id]
      }));
      
      await executeTransaction(operations);
      
      res.json({ success: true, message: '学生添加成功', count: studentIds.length });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = scheduleController;