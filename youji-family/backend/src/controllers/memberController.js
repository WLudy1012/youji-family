/**
 * 成员管理控制器
 * 处理家族成员的CRUD操作和关系管理
 */

const { query, getConnection } = require('../config/database');
const { getPagination, paginateResponse, hashPassword } = require('../utils/helpers');

/**
 * 获取成员列表
 * GET /api/members
 */
const getMembers = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { generation, keyword } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (generation) {
      whereClause += ' AND generation = ?';
      params.push(generation);
    }

    if (keyword) {
      whereClause += ' AND (name LIKE ? OR bio LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM family_members ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 查询数据
    const members = await query(
      `SELECT member_id, name, relation, generation, parent_id, spouse_id, 
              birth_date, avatar, bio, status, created_at, updated_at
       FROM family_members 
       ${whereClause}
       ORDER BY generation ASC, created_at ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: paginateResponse(members, total, { page, limit })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取成员详情
 * GET /api/members/:id
 */
const getMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 获取成员基本信息
    const members = await query(
      `SELECT member_id, name, relation, generation, parent_id, spouse_id, 
              birth_date, avatar, bio, status, created_at, updated_at
       FROM family_members WHERE member_id = ?`,
      [id]
    );

    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    const member = members[0];

    // 获取父母信息
    if (member.parent_id) {
      const parent = await query(
        `SELECT member_id, name, avatar, generation FROM family_members WHERE member_id = ?`,
        [member.parent_id]
      );
      member.parent = parent.length > 0 ? parent[0] : null;
    }

    // 获取配偶信息
    if (member.spouse_id) {
      const spouse = await query(
        `SELECT member_id, name, avatar, generation FROM family_members WHERE member_id = ?`,
        [member.spouse_id]
      );
      member.spouse = spouse.length > 0 ? spouse[0] : null;
    }

    // 获取子女信息
    const children = await query(
      `SELECT member_id, name, avatar, generation FROM family_members WHERE parent_id = ?`,
      [id]
    );
    member.children = children;

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建成员
 * POST /api/admin/members
 */
const createMember = async (req, res, next) => {
  try {
    const {
      name, relation, generation, parent_id, spouse_id,
      birth_date, avatar, bio, status
    } = req.body;

    // 插入成员
    const result = await query(
      `INSERT INTO family_members (name, relation, generation, parent_id, spouse_id, 
                                  birth_date, avatar, bio, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, relation, generation, parent_id, spouse_id,
       birth_date, avatar, bio, status || 'active']
    );

    const memberId = result.insertId;

    res.status(201).json({
      success: true,
      message: '成员创建成功',
      data: { member_id: memberId }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新成员
 * PUT /api/admin/members/:id
 */
const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name, relation, generation, parent_id, spouse_id,
      birth_date, avatar, bio, status
    } = req.body;

    // 检查成员是否存在
    const existing = await query(
      'SELECT member_id FROM family_members WHERE member_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    // 更新成员信息
    await query(
      `UPDATE family_members SET
        name = ?, relation = ?, generation = ?, parent_id = ?, spouse_id = ?,
        birth_date = ?, avatar = ?, bio = ?, status = ?, updated_at = NOW()
       WHERE member_id = ?`,
      [name, relation, generation, parent_id, spouse_id,
       birth_date, avatar, bio, status, id]
    );

    res.json({
      success: true,
      message: '成员更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除成员
 * DELETE /api/admin/members/:id
 */
const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查成员是否存在
    const existing = await query('SELECT member_id FROM family_members WHERE member_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    // 删除成员
    await query('DELETE FROM family_members WHERE member_id = ?', [id]);

    res.json({
      success: true,
      message: '成员删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取家族树数据
 * GET /api/members/tree
 */
const getFamilyTree = async (req, res, next) => {
  try {
    // 获取所有成员
    const members = await query(
      `SELECT member_id, name, avatar, generation, parent_id, spouse_id, status
       FROM family_members ORDER BY generation ASC, created_at ASC`
    );

    res.json({
      success: true,
      data: {
        members
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 为成员创建登录账号
 * POST /api/admin/members/:id/account
 */
const createMemberAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, password, email, phone } = req.body;

    // 检查成员是否存在
    const member = await query('SELECT member_id FROM family_members WHERE member_id = ?', [id]);
    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    // 检查是否已有账号
    const existing = await query('SELECT account_id FROM family_accounts WHERE member_id = ?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: '该成员已有登录账号'
      });
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建账号
    await query(
      'INSERT INTO family_accounts (member_id, username, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, username, email, phone, hashedPassword, 'member', 'active']
    );

    res.status(201).json({
      success: true,
      message: '账号创建成功'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getFamilyTree,
  createMemberAccount
};
