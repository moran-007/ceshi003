// 签到控制器
const { executeQuery } = require('../../db/connection');
const DBUtils = require('../../db/dbUtils');

const attendanceController = {
  // 签到
  async checkIn(req, res) {
    try {
      const { scheduleId, studentId, attendanceType = 'manual', location, deviceInfo } = req.body;
      
      if (!scheduleId || !studentId) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
      }
      
      // 验证排课是否存在
      const schedule = await DBUtils.findOne('schedule', { schedule_id: scheduleId });
      if (!schedule || schedule.status !== 'scheduled') {
        return res.status(400).json({ success: false, message: '排课不存在或已结束' });
      }
      
      // 验证学生是否在排课中
      const scheduleStudent = await DBUtils.findOne('schedule_student', {
        schedule_id: scheduleId,
        student_id: studentId,
        status: 'active'
      });
      
      if (!scheduleStudent) {
        return res.status(400).json({ success: false, message: '学生未被安排在该课程中' });
      }
      
      // 检查是否已经签到
      const existingAttendance = await DBUtils.findOne('attendance', {
        schedule_id: scheduleId,
        student_id: studentId
      });
      
      if (existingAttendance && existingAttendance.attendance_time) {
        return res.status(400).json({ success: false, message: '学生已经签到' });
      }
      
      const now = new Date();
      const scheduleStartTime = new Date(schedule.start_time);
      const lateThreshold = new Date(scheduleStartTime.getTime() + 15 * 60000); // 15分钟后算迟到
      
      let status = 'present';
      let lateMinutes = 0;
      
      if (now > lateThreshold) {
        status = 'late';
        lateMinutes = Math.floor((now - scheduleStartTime) / 60000);
      }
      
      const attendanceData = {
        attendance_time: now,
        attendance_type: attendanceType,
        status: status,
        late_minutes: lateMinutes,
        ip_address: req.ip,
        location: location,
        device_info: deviceInfo
      };
      
      let attendanceId;
      if (existingAttendance) {
        // 更新现有记录
        await DBUtils.update('attendance', attendanceData, {
          attendance_id: existingAttendance.attendance_id
        });
        attendanceId = existingAttendance.attendance_id;
      } else {
        // 创建新记录
        attendanceId = await DBUtils.create('attendance', {
          schedule_id: scheduleId,
          student_id: studentId,
          ...attendanceData
        });
      }
      
      res.json({ 
        success: true, 
        message: status === 'present' ? '签到成功' : '已迟到，签到成功',
        data: { 
          attendanceId,
          status,
          lateMinutes,
          checkInTime: now
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 签退
  async checkOut(req, res) {
    try {
      const { scheduleId, studentId, leaveType = 'manual' } = req.body;
      
      if (!scheduleId || !studentId) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
      }
      
      // 查找签到记录
      const attendance = await DBUtils.findOne('attendance', {
        schedule_id: scheduleId,
        student_id: studentId
      });
      
      if (!attendance || !attendance.attendance_time) {
        return res.status(400).json({ success: false, message: '请先签到' });
      }
      
      if (attendance.leave_time) {
        return res.status(400).json({ success: false, message: '已经签退' });
      }
      
      // 获取排课信息
      const schedule = await DBUtils.findOne('schedule', { schedule_id: scheduleId });
      const scheduleEndTime = new Date(schedule.end_time);
      const now = new Date();
      
      let status = attendance.status;
      let earlyLeaveMinutes = 0;
      
      // 如果提前离开，更新状态
      if (now < scheduleEndTime) {
        const timeDiff = scheduleEndTime - now;
        if (timeDiff > 15 * 60000) { // 提前15分钟以上算早退
          status = status === 'late' ? 'late_early_leave' : 'early_leave';
          earlyLeaveMinutes = Math.floor((scheduleEndTime - now) / 60000);
        }
      }
      
      // 更新签到记录
      await DBUtils.update('attendance', {
        leave_time: now,
        leave_type: leaveType,
        status: status,
        early_leave_minutes: earlyLeaveMinutes
      }, {
        attendance_id: attendance.attendance_id
      });
      
      res.json({ 
        success: true, 
        message: earlyLeaveMinutes > 0 ? '早退，签退成功' : '签退成功',
        data: { 
          checkOutTime: now,
          status,
          earlyLeaveMinutes
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取排课签到列表
  async getScheduleAttendance(req, res) {
    try {
      const { scheduleId } = req.params;
      
      const sql = 'SELECT a.*, s.name as student_name, s.student_no, sc.course_name ' +
                'FROM attendance a ' +
                'JOIN student s ON a.student_id = s.student_id ' +
                'JOIN schedule sch ON a.schedule_id = sch.schedule_id ' +
                'JOIN course sc ON sch.course_id = sc.course_id ' +
                'WHERE a.schedule_id = ? ' +
                'ORDER BY s.name ASC';
      
      const attendanceRecords = await executeQuery(sql, [scheduleId]);
      
      // 统计出勤情况
      const summary = attendanceRecords.reduce((acc, curr) => {
        switch (curr.status) {
          case 'present':
            acc.present++;
            break;
          case 'late':
          case 'late_early_leave':
            acc.late++;
            break;
          case 'early_leave':
            acc.earlyLeave++;
            break;
          case 'absent':
            acc.absent++;
            break;
        }
        return acc;
      }, { present: 0, late: 0, earlyLeave: 0, absent: 0 });
      
      res.json({ 
        success: true, 
        data: {
          summary,
          details: attendanceRecords
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取学生签到记录
  async getStudentAttendance(req, res) {
    try {
      const { studentId } = req.params;
      const { page = 1, pageSize = 10, startDate, endDate } = req.query;
      
      let sql = 'SELECT a.*, c.course_name, t.name as teacher_name, sch.start_time as schedule_start_time ' +
                'FROM attendance a ' +
                'JOIN schedule sch ON a.schedule_id = sch.schedule_id ' +
                'JOIN course c ON sch.course_id = c.course_id ' +
                'JOIN teacher t ON sch.teacher_id = t.teacher_id ' +
                'WHERE a.student_id = ? ';
      
      const params = [studentId];
      
      if (startDate) {
        sql += 'AND sch.start_time >= ? ';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += 'AND sch.end_time <= ? ';
        params.push(endDate);
      }
      
      sql += ' ORDER BY sch.start_time DESC ';
      sql += ` LIMIT ${(page - 1) * pageSize}, ${pageSize}`;
      
      const records = await executeQuery(sql, params);
      
      // 获取总数
      const countSql = `SELECT COUNT(*) as count FROM attendance a JOIN schedule sch ON a.schedule_id = sch.schedule_id WHERE a.student_id = ? ${startDate ? 'AND sch.start_time >= ?' : ''} ${endDate ? 'AND sch.end_time <= ?' : ''}`;
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

  // 获取学生出勤统计
  async getStudentAttendanceStatistics(req, res) {
    try {
      const { studentId } = req.params;
      const { startDate, endDate } = req.query;
      
      let sql = 'SELECT COUNT(*) as total, ' +
                'SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present, ' +
                'SUM(CASE WHEN status = "late" OR status = "late_early_leave" THEN 1 ELSE 0 END) as late, ' +
                'SUM(CASE WHEN status = "early_leave" OR status = "late_early_leave" THEN 1 ELSE 0 END) as earlyLeave, ' +
                'SUM(CASE WHEN status = "absent" THEN 1 ELSE 0 END) as absent ' +
                'FROM attendance a ' +
                'JOIN schedule sch ON a.schedule_id = sch.schedule_id ' +
                'WHERE a.student_id = ? ';
      
      const params = [studentId];
      
      if (startDate) {
        sql += 'AND sch.start_time >= ? ';
        params.push(startDate);
      }
      
      if (endDate) {
        sql += 'AND sch.end_time <= ? ';
        params.push(endDate);
      }
      
      const [stats] = await executeQuery(sql, params);
      
      // 计算出勤率
      const attendanceRate = stats.total > 0 ? (stats.present / stats.total * 100).toFixed(2) : 0;
      
      res.json({ 
        success: true, 
        data: {
          ...stats,
          attendanceRate: parseFloat(attendanceRate)
        } 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 更新签到记录
  async updateAttendance(req, res) {
    try {
      const { attendanceId } = req.params;
      const { status, lateMinutes, earlyLeaveMinutes, remark } = req.body;
      
      // 验证记录是否存在
      const attendance = await DBUtils.findOne('attendance', { attendance_id: attendanceId });
      if (!attendance) {
        return res.status(404).json({ success: false, message: '签到记录不存在' });
      }
      
      const updateData = {};
      if (status !== undefined) updateData.status = status;
      if (lateMinutes !== undefined) updateData.late_minutes = lateMinutes;
      if (earlyLeaveMinutes !== undefined) updateData.early_leave_minutes = earlyLeaveMinutes;
      if (remark !== undefined) updateData.remark = remark;
      
      await DBUtils.update('attendance', updateData, { attendance_id: attendanceId });
      
      res.json({ success: true, message: '签到记录已更新' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = attendanceController;