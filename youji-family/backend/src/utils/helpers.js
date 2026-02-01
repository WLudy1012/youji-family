/**
 * 工具函数模块
 * 提供常用的辅助函数
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * 密码加密
 * @param {string} password - 明文密码
 * @returns {Promise<string>} 加密后的密码
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * 密码验证
 * @param {string} password - 明文密码
 * @param {string} hashedPassword - 加密后的密码
 * @returns {Promise<boolean>} 验证结果
 */
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * 生成JWT令牌（管理员）
 * @param {Object} admin - 管理员信息
 * @returns {string} JWT令牌
 */
const generateAdminToken = (admin) => {
  const payload = {
    id: admin.id,
    username: admin.username,
    role: admin.role,
    type: 'admin'
  };
  
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * 生成JWT令牌（成员）
 * @param {Object} member - 成员信息
 * @returns {string} JWT令牌
 */
const generateMemberToken = (member) => {
  const payload = {
    id: member.id,
    member_id: member.member_id,
    username: member.username,
    type: 'member'
  };
  
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式模板
 * @returns {string} 格式化后的日期字符串
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return null;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 生成分页参数
 * @param {Object} query - 请求查询参数
 * @returns {Object} 分页参数
 */
const getPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * 生成分页响应
 * @param {Array} data - 数据列表
 * @param {number} total - 总记录数
 * @param {Object} pagination - 分页参数
 * @returns {Object} 分页响应
 */
const paginateResponse = (data, total, pagination) => {
  const { page, limit } = pagination;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

/**
 * 过滤对象字段
 * @param {Object} obj - 原对象
 * @param {Array} allowedFields - 允许的字段列表
 * @returns {Object} 过滤后的对象
 */
const filterObject = (obj, allowedFields) => {
  const filtered = {};
  allowedFields.forEach(field => {
    if (obj.hasOwnProperty(field)) {
      filtered[field] = obj[field];
    }
  });
  return filtered;
};

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} 随机字符串
 */
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateAdminToken,
  generateMemberToken,
  formatDate,
  getPagination,
  paginateResponse,
  filterObject,
  generateRandomString
};
