// 课程控制器
const { executeQuery } = require('../../db/connection');
const DBUtils = require('../../db/dbUtils');

const courseController = {
  // 获取课程列表
  async getCourseList(req, res) {
    try {
      const { page = 1, pageSize = 10, keyword, categoryId, status } = req.query;
      
      // 修改查询，移除不存在的course_category表的JOIN
      let sql = 'SELECT c.* FROM course c WHERE 1=1 ';
      
      const params = [];
      
      if (keyword) {
        sql += 'AND (c.course_name LIKE ? OR c.description LIKE ?) ';
        const likeKeyword = `%${keyword}%`;
        params.push(likeKeyword, likeKeyword);
      }
      
      if (categoryId) {
        sql += 'AND c.category_id = ? ';
        params.push(categoryId);
      }
      
      if (status !== undefined) {
        sql += 'AND c.status = ? ';
        params.push(status);
      }
      
      sql += 'ORDER BY c.course_id DESC ';
      sql += `LIMIT ${(page - 1) * pageSize}, ${pageSize}`;
      
      const courses = await executeQuery(sql, params);
      
      // 获取总数
      const countSql = 'SELECT COUNT(*) as count FROM course WHERE 1=1 ' +
                      (keyword ? 'AND (course_name LIKE ? OR description LIKE ?) ' : '') +
                      (categoryId ? 'AND category_id = ? ' : '') +
                      (status !== undefined ? 'AND status = ? ' : '');
      const [countResult] = await executeQuery(countSql, params);
      
      res.json({ 
        success: true, 
        data: { 
          list: courses,
          total: countResult.count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取课程详情
  async getCourseDetail(req, res) {
    try {
      const { courseId } = req.params;
      
      // 修改查询，移除不存在的表的JOIN
      const sql = 'SELECT c.* FROM course c WHERE c.course_id = ?';
      
      const [course] = await executeQuery(sql, [courseId]);
      
      if (!course) {
        return res.status(404).json({ success: false, message: '课程不存在' });
      }
      
      res.json({ success: true, data: course });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 创建课程
  async createCourse(req, res) {
    try {
      const { courseName, description, categoryId, teacherId, totalHours, price, status = 1 } = req.body;
      
      // 验证必填字段
      if (!courseName || !totalHours) {
        return res.status(400).json({ success: false, message: '缺少必要参数' });
      }
      
      // 创建课程
      const courseId = await DBUtils.create('course', {
        course_name: courseName,
        description,
        category_id: categoryId,
        teacher_id: teacherId,
        total_hours: totalHours,
        price,
        status,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      res.json({ 
        success: true, 
        message: '课程创建成功',
        data: { courseId }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 更新课程
  async updateCourse(req, res) {
    try {
      const { courseId } = req.params;
      const { courseName, description, categoryId, teacherId, totalHours, price, status } = req.body;
      
      // 验证课程是否存在
      const course = await DBUtils.findOne('course', { course_id: courseId });
      if (!course) {
        return res.status(404).json({ success: false, message: '课程不存在' });
      }
      
      const updateData = {};
      if (courseName !== undefined) updateData.course_name = courseName;
      if (description !== undefined) updateData.description = description;
      if (categoryId !== undefined) updateData.category_id = categoryId;
      if (teacherId !== undefined) updateData.teacher_id = teacherId;
      if (totalHours !== undefined) updateData.total_hours = totalHours;
      if (price !== undefined) updateData.price = price;
      if (status !== undefined) updateData.status = status;
      updateData.updated_at = new Date();
      
      await DBUtils.update('course', updateData, { course_id: courseId });
      
      res.json({ success: true, message: '课程更新成功' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 删除课程
  async deleteCourse(req, res) {
    try {
      const { courseId } = req.params;
      
      // 验证课程是否存在
      const course = await DBUtils.findOne('course', { course_id: courseId });
      if (!course) {
        return res.status(404).json({ success: false, message: '课程不存在' });
      }
      
      // 软删除（实际项目中推荐）
      await DBUtils.update('course', { status: 0 }, { course_id: courseId });
      
      res.json({ success: true, message: '课程已删除' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取课程大纲
  async getCourseOutline(req, res) {
    try {
      const { courseId } = req.params;
      
      const outline = await executeQuery(
        'SELECT * FROM course_outline WHERE course_id = ? ORDER BY outline_order ASC',
        [courseId]
      );
      
      res.json({ success: true, data: outline });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // 获取课程教材
  async getCourseMaterials(req, res) {
    try {
      const { courseId } = req.params;
      
      const materials = await executeQuery(
        'SELECT * FROM course_material WHERE course_id = ? ORDER BY created_at DESC',
        [courseId]
      );
      
      res.json({ success: true, data: materials });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = courseController;