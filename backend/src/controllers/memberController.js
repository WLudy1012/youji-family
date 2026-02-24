/**
 * 成员管理控制器
 * 处理家族成员的CRUD操作和关系管理
 */

const { query, getConnection } = require('../config/database');
const { getPagination, paginateResponse, formatDate, hashPassword } = require('../utils/helpers');

/**
 * 获取成员列表
 * GET /api/members
 */
const getMembers = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { generation, keyword, isPublic } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (generation) {
      whereClause += ' AND generation = ?';
      params.push(generation);
    }

    if (isPublic !== undefined) {
      whereClause += ' AND is_public = ?';
      params.push(isPublic);
    }

    if (keyword) {
      whereClause += ' AND (name LIKE ? OR bio LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM members ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 查询数据
    const members = await query(
      `SELECT id, name, avatar, birth_date, death_date, bio, generation, 
              gender, phone, email, address, is_public, sort_order, created_at
       FROM members 
       ${whereClause}
       ORDER BY generation ASC, sort_order ASC, id ASC
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
      `SELECT id, name, avatar, birth_date, death_date, bio, generation, 
              gender, phone, email, address, is_public, sort_order, created_at
       FROM members WHERE id = ?`,
      [id]
    );

    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    const member = members[0];

    // 获取父母关系
    const parents = await query(
      `SELECT m.id, m.name, m.avatar, m.generation
       FROM relationships r
       JOIN members m ON r.parent_id = m.id
       WHERE r.member_id = ? AND r.relation_type = 'child'`,
      [id]
    );

    // 获取子女关系
    const children = await query(
      `SELECT m.id, m.name, m.avatar, m.generation
       FROM relationships r
       JOIN members m ON r.member_id = m.id
       WHERE r.parent_id = ? AND r.relation_type = 'child'`,
      [id]
    );

    // 获取配偶关系
    const spouses = await query(
      `SELECT m.id, m.name, m.avatar, m.generation
       FROM relationships r
       JOIN members m ON (r.member_id = m.id OR r.parent_id = m.id)
       WHERE (r.member_id = ? OR r.parent_id = ?) AND r.relation_type = 'spouse'`,
      [id, id]
    );

    member.relationships = {
      parents,
      children,
      spouses: spouses.filter(s => s.id !== parseInt(id))
    };

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
 * POST /api/members
 */
const createMember = async (req, res, next) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      name, avatar, birth_date, death_date, bio, generation,
      gender, phone, email, address, is_public, sort_order,
      parents = [], spouses = []
    } = req.body;

    // 插入成员
    const [result] = await connection.execute(
      `INSERT INTO members (name, avatar, birth_date, death_date, bio, generation,
                           gender, phone, email, address, is_public, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, avatar, birth_date, death_date, bio, generation,
       gender, phone, email, address, is_public || 1, sort_order || 0]
    );

    const memberId = result.insertId;

    // 添加父母关系
    for (const parentId of parents) {
      await connection.execute(
        'INSERT INTO relationships (member_id, parent_id, relation_type) VALUES (?, ?, ?)',
        [memberId, parentId, 'child']
      );
    }

    // 添加配偶关系
    for (const spouseId of spouses) {
      await connection.execute(
        'INSERT INTO relationships (member_id, parent_id, relation_type) VALUES (?, ?, ?)',
        [memberId, spouseId, 'spouse']
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: '成员创建成功',
      data: { id: memberId }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * 更新成员
 * PUT /api/members/:id
 */
const updateMember = async (req, res, next) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      name, avatar, birth_date, death_date, bio, generation,
      gender, phone, email, address, is_public, sort_order,
      parents, spouses
    } = req.body;

    // 检查成员是否存在
    const existing = await connection.execute(
      'SELECT id FROM members WHERE id = ?',
      [id]
    );

    if (existing[0].length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    // 更新成员信息
    await connection.execute(
      `UPDATE members SET
        name = ?, avatar = ?, birth_date = ?, death_date = ?, bio = ?,
        generation = ?, gender = ?, phone = ?, email = ?, address = ?,
        is_public = ?, sort_order = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, avatar, birth_date, death_date, bio, generation,
       gender, phone, email, address, is_public, sort_order, id]
    );

    // 更新关系（如果提供了）
    if (parents !== undefined) {
      // 删除旧的父母关系
      await connection.execute(
        "DELETE FROM relationships WHERE member_id = ? AND relation_type = 'child'",
        [id]
      );
      // 添加新的父母关系
      for (const parentId of parents) {
        await connection.execute(
          "INSERT INTO relationships (member_id, parent_id, relation_type) VALUES (?, ?, 'child')",
          [id, parentId]
        );
      }
    }

    if (spouses !== undefined) {
      // 删除旧的配偶关系
      await connection.execute(
        "DELETE FROM relationships WHERE (member_id = ? OR parent_id = ?) AND relation_type = 'spouse'",
        [id, id]
      );
      // 添加新的配偶关系
      for (const spouseId of spouses) {
        await connection.execute(
          "INSERT INTO relationships (member_id, parent_id, relation_type) VALUES (?, ?, 'spouse')",
          [id, spouseId]
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: '成员更新成功'
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * 删除成员
 * DELETE /api/members/:id
 */
const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查成员是否存在
    const existing = await query('SELECT id FROM members WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    // 删除成员（关联的关系会自动删除）
    await query('DELETE FROM members WHERE id = ?', [id]);

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
    // 获取所有公开成员
    const members = await query(
      `SELECT id, name, avatar, generation, gender, birth_date, death_date
       FROM members WHERE is_public = 1 ORDER BY generation ASC, sort_order ASC`
    );

    // 获取所有关系
    const relationships = await query(
      `SELECT member_id, parent_id, relation_type FROM relationships`
    );

    res.json({
      success: true,
      data: {
        members,
        relationships
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 为成员创建登录账号
 * POST /api/members/:id/account
 */
const createMemberAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, password, email } = req.body;

    // 检查成员是否存在
    const member = await query('SELECT id FROM members WHERE id = ?', [id]);
    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    // 检查是否已有账号
    const existing = await query('SELECT id FROM member_users WHERE member_id = ?', [id]);
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
      'INSERT INTO member_users (member_id, username, password, email) VALUES (?, ?, ?, ?)',
      [id, username, hashedPassword, email]
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
