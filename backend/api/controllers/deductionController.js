// 扣课控制器
const { executeQuery, executeTransaction } = require('../../db/connection');
const DBUtils = require('../../db/dbUtils');

const deductionController = {
  // 手动扣课
  async deductHours(req, res) {
    try {
      const { studentId, courseId, hours, reason, scheduleId, teacherId } = req.body;
      
      // 验证参数
      if (!studentId || !courseId || !hours) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
      }
      
      // 验证学生-课程关联是否存在
      const studentCourse = await DBUtils.findOne('student_course', { 
        student_id: studentId, 
        course_id: courseId 
      });
      
      if (!studentCourse || studentCourse.status !== 'enrolled') {
        return res.status(400).json({ success: false, message: '学生未报名该课程' });
      }
      
      // 检查剩余课时是否足够
      if (studentCourse.remaining_hours < hours) {
        return res.status(400).json({ success: false, message: '剩余课时不足' });
      }
      
      // 开始事务
      await executeTransaction([
        // 更新学生剩余课时
        {
          sql: 'UPDATE student_course SET remaining_hours = remaining_hours - ?, used_hours = used_hours + ?, last_deduction_time = NOW() WHERE student_id = ? AND course_id = ?',
          params: [hours, hours, studentId, courseId]
        },
        // 创建课时记录
        {
          sql: 'INSERT INTO course_hours_record (student_id, course_id, teacher_id, schedule_id, hours, record_type, record_date) VALUES (?, ?, ?, ?, ?, ?, CURDATE())',
          params: [studentId, courseId, teacherId || null, scheduleId || null, hours, 'deduction']
        }
      ]);
      
      res.json({ 
        success: true, 
        message: '扣课成功',
        data: { 
          deductionHours: hours,
          remainingHours: studentCourse.remaining_hours - hours
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 批量扣课
  async batchDeductHours(req, res) {
    try {
      const { scheduleId, deductionHours } = req.body;
      
      if (!scheduleId || !deductionHours) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
      }
      
      // 获取排课信息
      const schedule = await DBUtils.findOne('schedule', { schedule_id: scheduleId });
      if (!schedule) {
        return res.status(404).json({ success: false, message: '排课记录不存在' });
      }
      
      // 获取排课中的学生
      const students = await executeQuery(
        'SELECT student_id, course_id FROM schedule_student WHERE schedule_id = ? AND status = "active"',
        [scheduleId]
      );
      
      if (students.length === 0) {
        return res.json({ success: true, message: '排课中没有学生需要扣课' });
      }
      
      // 开始批量扣课事务
      const operations = [];
      const failedStudents = [];
      
      for (const student of students) {
        // 先检查剩余课时
        const studentCourse = await DBUtils.findOne('student_course', { 
          student_id: student.student_id, 
          course_id: student.course_id 
        });
        
        if (studentCourse && studentCourse.status === 'enrolled' && studentCourse.remaining_hours >= deductionHours) {
          // 更新学生剩余课时
          operations.push({
            sql: 'UPDATE student_course SET remaining_hours = remaining_hours - ?, used_hours = used_hours + ?, last_deduction_time = NOW() WHERE student_id = ? AND course_id = ?',
            params: [deductionHours, deductionHours, student.student_id, student.course_id]
          });
          
          // 创建课时记录
          operations.push({
            sql: 'INSERT INTO course_hours_record (student_id, course_id, teacher_id, schedule_id, hours, record_type, record_date) VALUES (?, ?, ?, ?, ?, ?, CURDATE())',
            params: [student.student_id, student.course_id, schedule.teacher_id, scheduleId, deductionHours, 'deduction']
          });
        } else {
          failedStudents.push({
            studentId: student.student_id,
            reason: studentCourse ? (studentCourse.remaining_hours < deductionHours ? '课时不足' : '未报名该课程') : '未报名该课程'
          });
        }
      }
      
      if (operations.length > 0) {
        await executeTransaction(operations);
      }
      
      res.json({ 
        success: true, 
        message: '批量扣课完成',
        data: {
          successCount: students.length - failedStudents.length,
          failedCount: failedStudents.length,
          failedStudents: failedStudents
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 加课
  async addHours(req, res) {
    try {
      const { studentId, courseId, hours, reason } = req.body;
      
      if (!studentId || !courseId || !hours) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
      }
      
      // 验证学生-课程关联是否存在
      const studentCourse = await DBUtils.findOne('student_course', { 
        student_id: studentId, 
        course_id: courseId 
      });
      
      if (!studentCourse || studentCourse.status !== 'enrolled') {
        return res.status(400).json({ success: false, message: '学生未报名该课程' });
      }
      
      // 开始事务
      await executeTransaction([
        // 更新学生剩余课时
        {
          sql: 'UPDATE student_course SET remaining_hours = remaining_hours + ?, total_hours = total_hours + ? WHERE student_id = ? AND course_id = ?',
          params: [hours, hours, studentId, courseId]
        },
        // 创建课时记录
        {
          sql: 'INSERT INTO course_hours_record (student_id, course_id, hours, record_type, record_date, reason) VALUES (?, ?, ?, ?, CURDATE(), ?)',
          params: [studentId, courseId, hours, 'addition', reason]
        }
      ]);
      
      res.json({ 
        success: true, 
        message: '加课成功',
        data: { 
          addedHours: hours,
          remainingHours: studentCourse.remaining_hours + hours
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取学生扣课记录
  async getStudentDeductionRecords(req, res) {
    try {
      const { studentId } = req.params;
      const { page = 1, pageSize = 10, startDate, endDate, recordType } = req.query;
      
      let sql = 'SELECT chr.*, c.course_name, t.name as teacher_name ' +
                'FROM course_hours_record chr ' +
                'LEFT JOIN course c ON chr.course_id = c.course_id ' +
                'LEFT JOIN teacher t ON chr.teacher_id = t.teacher_id ' +
                'WHERE chr.student_id = ? ';
      
      const params = [studentId];
      
      if (startDate) {
        sql += 'AND chr.record_date >= ? ';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += 'AND chr.record_date <= ? ';
        params.push(endDate);
      }
      
      if (recordType) {
        sql += 'AND chr.record_type = ? ';
        params.push(recordType);
      }
      
      sql += ' ORDER BY chr.record_time DESC ';
      sql += ` LIMIT ${(page - 1) * pageSize}, ${pageSize}`;
      
      const records = await executeQuery(sql, params);
      
      // 获取总数
      const countSql = `SELECT COUNT(*) as count FROM course_hours_record WHERE student_id = ? ${startDate ? 'AND record_date >= ?' : ''} ${endDate ? 'AND record_date <= ?' : ''} ${recordType ? 'AND record_type = ?' : ''}`;
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

  // 获取学生课时统计
  async getStudentHoursStatistics(req, res) {
    try {
      const { studentId } = req.params;
      
      // 获取学生所有课程的课时统计
      const sql = 'SELECT sc.course_id, c.course_name, sc.total_hours, sc.remaining_hours, sc.used_hours ' +
                'FROM student_course sc ' +
                'JOIN course c ON sc.course_id = c.course_id ' +
                'WHERE sc.student_id = ? AND sc.status = "enrolled"';
      
      const statistics = await executeQuery(sql, [studentId]);
      
      // 计算总体统计
      const totalStats = statistics.reduce((acc, curr) => {
        acc.totalHours += parseFloat(curr.total_hours || 0);
        acc.remainingHours += parseFloat(curr.remaining_hours || 0);
        acc.usedHours += parseFloat(curr.used_hours || 0);
        return acc;
      }, { totalHours: 0, remainingHours: 0, usedHours: 0 });
      
      res.json({ 
        success: true, 
        data: {
          courses: statistics,
          summary: totalStats
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取扣课规则列表
  async getDeductionRules(req, res) {
    try {
      const { isActive } = req.query;
      let conditions = {};
      
      if (isActive !== undefined) {
        conditions.is_active = isActive;
      }
      
      const rules = await DBUtils.findAll('deduction_rule', conditions, { 
        orderBy: 'priority ASC' 
      });
      
      res.json({ success: true, data: rules });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = deductionController;