// 教师控制器
const { executeQuery } = require('../../db/connection');
const DBUtils = require('../../db/dbUtils');

const teacherController = {
  // 获取教师列表
  async getTeacherList(req, res) {
    try {
      const { page = 1, pageSize = 10, keyword } = req.query;
      
      let sql = 'SELECT * FROM teacher WHERE 1=1 ';
      const params = [];
      
      if (keyword) {
        sql += 'AND (name LIKE ? OR phone LIKE ? OR email LIKE ?) ';
        const likeKeyword = `%${keyword}%`;
        params.push(likeKeyword, likeKeyword, likeKeyword);
      }
      
      sql += 'ORDER BY teacher_id DESC ';
      sql += `LIMIT ${(page - 1) * pageSize}, ${pageSize}`;
      
      const teachers = await executeQuery(sql, params);
      
      // 获取总数
      const countSql = 'SELECT COUNT(*) as count FROM teacher WHERE 1=1 ' +
                      (keyword ? 'AND (name LIKE ? OR phone LIKE ? OR email LIKE ?) ' : '');
      const [countResult] = await executeQuery(countSql, params);
      
      res.json({ 
        success: true, 
        data: { 
          list: teachers,
          total: countResult.count,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = teacherController;