// 上课记录控制器
const { executeQuery, executeTransaction } = require('../../db/connection');
const DBUtils = require('../../db/dbUtils');

const recordController = {
  // 创建上课记录
  async createClassRecord(req, res) {
    try {
      const { scheduleId, teachingContent, teachingSummary, homework } = req.body;
      
      if (!scheduleId || !teachingContent) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
      }
      
      // 验证排课是否存在
      const schedule = await DBUtils.findOne('schedule', { schedule_id: scheduleId });
      if (!schedule) {
        return res.status(404).json({ success: false, message: '排课记录不存在' });
      }
      
      // 检查是否已存在上课记录
      const existingRecord = await DBUtils.findOne('class_record', { schedule_id: scheduleId });
      if (existingRecord) {
        return res.status(400).json({ success: false, message: '该排课已存在上课记录' });
      }
      
      // 获取出勤统计
      const attendanceStats = await executeQuery(
        'SELECT COUNT(*) as total, ' +
        'SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present, ' +
        'SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late, ' +
        'SUM(CASE WHEN status = "early_leave" THEN 1 ELSE 0 END) as early_leave, ' +
        'SUM(CASE WHEN status = "absent" THEN 1 ELSE 0 END) as absent ' +
        'FROM attendance WHERE schedule_id = ?',
        [scheduleId]
      );
      
      const stats = attendanceStats[0];
      
      // 创建上课记录
      const recordId = await DBUtils.create('class_record', {
        schedule_id: scheduleId,
        teacher_id: schedule.teacher_id,
        classroom_id: schedule.classroom_id,
        actual_start_time: schedule.start_time,
        actual_end_time: schedule.end_time,
        teaching_content: teachingContent,
        teaching_summary: teachingSummary,
        homework: homework,
        attendance_count: stats.present + stats.late,
        late_count: stats.late,
        absent_count: stats.absent,
        leave_early_count: stats.early_leave,
        status: 'completed',
        created_by: req.user?.userId || 1
      });
      
      // 更新排课状态为已完成
      await DBUtils.update('schedule', { status: 'completed' }, { schedule_id: scheduleId });
      
      // 自动扣课处理
      if (schedule.auto_deduct) {
        await this.autoDeductHours(scheduleId, schedule.course_id, schedule.hours);
      }
      
      res.status(201).json({ 
        success: true, 
        data: { 
          recordId,
          attendanceStats: {
            total: stats.total,
            present: stats.present,
            late: stats.late,
            absent: stats.absent,
            earlyLeave: stats.early_leave
          }
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 自动扣课（内部方法）
  async autoDeductHours(scheduleId, courseId, hours) {
    try {
      // 获取需要扣课的学生（出勤状态为present或late的学生）
      const attendanceRecords = await executeQuery(
        'SELECT a.student_id, a.status FROM attendance a ' +
        'JOIN schedule_student ss ON a.student_id = ss.student_id AND a.schedule_id = ss.schedule_id ' +
        'WHERE a.schedule_id = ? AND ss.status = "active" ' +
        'AND a.status IN ("present", "late")',
        [scheduleId]
      );
      
      // 获取扣课规则
      const activeRules = await DBUtils.findAll('deduction_rule', { is_active: 1 }, { orderBy: 'priority ASC' });
      
      const operations = [];
      
      for (const record of attendanceRecords) {
        // 查找适用的扣课规则
        let deductionRatio = 1.0;
        
        const applicableRule = activeRules.find(rule => 
          rule.rule_type === 'attendance_based' && rule.attendance_status === record.status
        );
        
        if (applicableRule) {
          deductionRatio = applicableRule.deduction_ratio;
        }
        
        const actualDeductionHours = hours * deductionRatio;
        
        // 更新学生课时
        operations.push({
          sql: 'UPDATE student_course SET remaining_hours = remaining_hours - ?, used_hours = used_hours + ?, last_deduction_time = NOW() ' +
               'WHERE student_id = ? AND course_id = ? AND remaining_hours >= ?',
          params: [actualDeductionHours, actualDeductionHours, record.student_id, courseId, actualDeductionHours]
        });
        
        // 创建课时记录
        operations.push({
          sql: 'INSERT INTO course_hours_record (student_id, course_id, schedule_id, hours, record_type, record_date, class_start_time, class_end_time) ' +
               'VALUES (?, ?, ?, ?, ?, CURDATE(), (SELECT start_time FROM schedule WHERE schedule_id = ?), (SELECT end_time FROM schedule WHERE schedule_id = ?))',
          params: [record.student_id, courseId, scheduleId, actualDeductionHours, 'deduction', scheduleId, scheduleId]
        });
      }
      
      if (operations.length > 0) {
        await executeTransaction(operations);
      }
    } catch (error) {
      console.error('自动扣课失败:', error.message);
      // 这里不抛出错误，避免影响上课记录的创建
    }
  },

  // 获取上课记录列表
  async getClassRecords(req, res) {
    try {
      const { page = 1, pageSize = 10, teacherId, courseId, studentId, startDate, endDate } = req.query;
      
      let sql = 'SELECT cr.*, c.course_name, t.name as teacher_name, sc.room_no, ' +
                's.class_name as className ' +
                'FROM class_record cr ' +
                'JOIN schedule sch ON cr.schedule_id = sch.schedule_id ' +
                'JOIN course c ON sch.course_id = c.course_id ' +
                'JOIN teacher t ON cr.teacher_id = t.teacher_id ' +
                'JOIN classroom sc ON cr.classroom_id = sc.classroom_id ' +
                'LEFT JOIN class s ON sch.class_id = s.class_id ';
      
      const whereConditions = [];
      const params = [];
      
      if (teacherId) {
        whereConditions.push('cr.teacher_id = ?');
        params.push(teacherId);
      }
      
      if (courseId) {
        whereConditions.push('sch.course_id = ?');
        params.push(courseId);
      }
      
      if (studentId) {
        sql += 'JOIN student_class_archive sca ON cr.class_record_id = sca.class_record_id ';
        whereConditions.push('sca.student_id = ?');
        params.push(studentId);
      }
      
      if (startDate) {
        whereConditions.push('cr.actual_start_time >= ?');
        params.push(startDate);
      }
      
      if (endDate) {
        whereConditions.push('cr.actual_end_time <= ?');
        params.push(endDate);
      }
      
      if (whereConditions.length > 0) {
        sql += 'WHERE ' + whereConditions.join(' AND ');
      }
      
      sql += ' ORDER BY cr.actual_start_time DESC ';
      sql += ` LIMIT ${(page - 1) * pageSize}, ${pageSize}`;
      
      const records = await executeQuery(sql, params);
      
      // 获取总数
      const countSql = `SELECT COUNT(DISTINCT cr.class_record_id) as count FROM class_record cr JOIN schedule sch ON cr.schedule_id = sch.schedule_id ${whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : ''}`;
      const [countResult] = await executeQuery(countSql, params);
      
      res.json({ 
        success: true, 
        data: { 
          list: records, 
          total: countResult.count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取学生上课记录
  async getStudentClassRecords(req, res) {
    try {
      const { studentId } = req.params;
      const { page = 1, pageSize = 10, startDate, endDate } = req.query;
      
      let sql = 'SELECT sca.*, c.course_name, t.name as teacher_name, cr.teaching_content, cr.teaching_summary ' +
                'FROM student_class_archive sca ' +
                'JOIN course c ON sca.course_id = c.course_id ' +
                'JOIN teacher t ON sca.teacher_id = t.teacher_id ' +
                'LEFT JOIN class_record cr ON sca.class_record_id = cr.class_record_id ' +
                'WHERE sca.student_id = ? ';
      
      const params = [studentId];
      
      if (startDate) {
        sql += 'AND sca.class_date >= ? ';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += 'AND sca.class_date <= ? ';
        params.push(endDate);
      }
      
      sql += ' ORDER BY sca.class_date DESC ';
      sql += ` LIMIT ${(page - 1) * pageSize}, ${pageSize}`;
      
      const records = await executeQuery(sql, params);
      
      // 获取总数
      const countSql = `SELECT COUNT(*) as count FROM student_class_archive WHERE student_id = ? ${startDate ? 'AND class_date >= ?' : ''} ${endDate ? 'AND class_date <= ?' : ''}`;
      const [countResult] = await executeQuery(countSql, params);
      
      res.json({ 
        success: true, 
        data: { 
          list: records, 
          total: countResult.count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取出勤汇总
  async getAttendanceSummary(req, res) {
    try {
      const { recordId } = req.params;
      
      // 获取上课记录信息
      const classRecord = await DBUtils.findOne('class_record', { class_record_id: recordId });
      if (!classRecord) {
        return res.status(404).json({ success: false, message: '上课记录不存在' });
      }
      
      // 获取详细出勤信息
      const attendanceDetails = await executeQuery(
        'SELECT a.student_id, s.name as student_name, a.status, a.late_minutes, a.early_leave_minutes ' +
        'FROM attendance a ' +
        'JOIN student s ON a.student_id = s.student_id ' +
        'WHERE a.schedule_id = ?',
        [classRecord.schedule_id]
      );
      
      res.json({ 
        success: true, 
        data: {
          summary: {
            total: classRecord.attendance_count + classRecord.absent_count + classRecord.leave_early_count,
            present: classRecord.attendance_count - classRecord.late_count,
            late: classRecord.late_count,
            absent: classRecord.absent_count,
            earlyLeave: classRecord.leave_early_count
          },
          details: attendanceDetails
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = recordController;