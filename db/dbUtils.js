// 数据库操作工具类
const { executeQuery } = require('./connection');

class DBUtils {
  // 查询单条记录
  static async findOne(table, conditions = {}) {
    const whereClause = this._buildWhereClause(conditions);
    const sql = `SELECT * FROM ${table} ${whereClause} LIMIT 1`;
    const rows = await executeQuery(sql, Object.values(conditions));
    return rows.length > 0 ? rows[0] : null;
  }

  // 查询多条记录
  static async findAll(table, conditions = {}, options = {}) {
    const whereClause = this._buildWhereClause(conditions);
    const limitClause = options.limit ? ` LIMIT ${options.limit}` : '';
    const offsetClause = options.offset ? ` OFFSET ${options.offset}` : '';
    const orderByClause = options.orderBy ? ` ORDER BY ${options.orderBy}` : '';
    
    const sql = `SELECT * FROM ${table} ${whereClause}${orderByClause}${limitClause}${offsetClause}`;
    return await executeQuery(sql, Object.values(conditions));
  }

  // 创建记录
  static async create(table, data) {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${fields}) VALUES (${placeholders})`;
    const [result] = await executeQuery(sql, Object.values(data));
    return result.insertId;
  }

  // 更新记录
  static async update(table, data, conditions) {
    const setClause = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    const whereClause = this._buildWhereClause(conditions);
    
    const params = [...Object.values(data), ...Object.values(conditions)];
    const sql = `UPDATE ${table} SET ${setClause} ${whereClause}`;
    const [result] = await executeQuery(sql, params);
    return result.affectedRows;
  }

  // 删除记录
  static async delete(table, conditions) {
    const whereClause = this._buildWhereClause(conditions);
    const sql = `DELETE FROM ${table} ${whereClause}`;
    const [result] = await executeQuery(sql, Object.values(conditions));
    return result.affectedRows;
  }

  // 计算记录数
  static async count(table, conditions = {}) {
    const whereClause = this._buildWhereClause(conditions);
    const sql = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
    const [rows] = await executeQuery(sql, Object.values(conditions));
    return rows[0].count;
  }

  // 构建WHERE子句
  static _buildWhereClause(conditions) {
    if (Object.keys(conditions).length === 0) {
      return '';
    }
    
    const whereConditions = Object.keys(conditions)
      .map(key => `${key} = ?`)
      .join(' AND ');
    
    return `WHERE ${whereConditions}`;
  }
}

module.exports = DBUtils;