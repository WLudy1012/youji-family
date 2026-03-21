/**
 * Member controller
 */

const { query, getConnection } = require('../config/database');
const { getPagination, paginateResponse, hashPassword } = require('../utils/helpers');

const isAdminRequest = (req) => req.user?.type === 'admin';

const normalizeFlag = (value, defaultValue = 1) => {
  if (value === undefined) {
    return defaultValue;
  }

  return value === true || value === 1 || value === '1' ? 1 : 0;
};

const ADMIN_MEMBER_FIELDS = `
  id, name, avatar, birth_date, death_date, bio, generation,
  gender, phone, email, address, is_public, sort_order, created_at
`;

const PUBLIC_MEMBER_FIELDS = `
  id, name, avatar, birth_date, death_date, bio, generation,
  gender, is_public, sort_order, created_at
`;

const getMembers = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { generation, keyword, isPublic } = req.query;
    const isAdmin = isAdminRequest(req);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (generation) {
      whereClause += ' AND generation = ?';
      params.push(generation);
    }

    if (isAdmin && isPublic !== undefined) {
      whereClause += ' AND is_public = ?';
      params.push(normalizeFlag(isPublic));
    }

    if (!isAdmin) {
      whereClause += ' AND is_public = 1';
    }

    if (keyword) {
      whereClause += ' AND (name LIKE ? OR bio LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM members ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const selectFields = isAdmin ? ADMIN_MEMBER_FIELDS : PUBLIC_MEMBER_FIELDS;
    const members = await query(
      `SELECT ${selectFields}
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

const getMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = isAdminRequest(req);

    const selectFields = isAdmin ? ADMIN_MEMBER_FIELDS : PUBLIC_MEMBER_FIELDS;
    const members = await query(
      `SELECT ${selectFields}
       FROM members
       WHERE id = ?${isAdmin ? '' : ' AND is_public = 1'}`,
      [id]
    );

    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    const member = members[0];
    const publicRelationFilter = isAdmin ? '' : ' AND m.is_public = 1';

    const parents = await query(
      `SELECT m.id, m.name, m.avatar, m.generation
       FROM relationships r
       JOIN members m ON r.parent_id = m.id
       WHERE r.member_id = ? AND r.relation_type = 'child'${publicRelationFilter}`,
      [id]
    );

    const children = await query(
      `SELECT m.id, m.name, m.avatar, m.generation
       FROM relationships r
       JOIN members m ON r.member_id = m.id
       WHERE r.parent_id = ? AND r.relation_type = 'child'${publicRelationFilter}`,
      [id]
    );

    const spouses = await query(
      `SELECT m.id, m.name, m.avatar, m.generation
       FROM relationships r
       JOIN members m ON (r.member_id = m.id OR r.parent_id = m.id)
       WHERE (r.member_id = ? OR r.parent_id = ?)
         AND r.relation_type = 'spouse'${publicRelationFilter}`,
      [id, id]
    );

    member.relationships = {
      parents,
      children,
      spouses: spouses.filter((spouse) => spouse.id !== Number.parseInt(id, 10))
    };

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    next(error);
  }
};

const createMember = async (req, res, next) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const {
      name,
      avatar,
      birth_date,
      death_date,
      bio,
      generation,
      gender,
      phone,
      email,
      address,
      is_public,
      sort_order,
      parents = [],
      spouses = []
    } = req.body;

    const publicFlag = normalizeFlag(is_public);

    const [result] = await connection.execute(
      `INSERT INTO members (name, avatar, birth_date, death_date, bio, generation,
                           gender, phone, email, address, is_public, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        avatar,
        birth_date,
        death_date,
        bio,
        generation,
        gender,
        phone,
        email,
        address,
        publicFlag,
        sort_order || 0
      ]
    );

    const memberId = result.insertId;

    for (const parentId of parents) {
      await connection.execute(
        'INSERT INTO relationships (member_id, parent_id, relation_type) VALUES (?, ?, ?)',
        [memberId, parentId, 'child']
      );
    }

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

const updateMember = async (req, res, next) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      name,
      avatar,
      birth_date,
      death_date,
      bio,
      generation,
      gender,
      phone,
      email,
      address,
      is_public,
      sort_order,
      parents,
      spouses
    } = req.body;

    const publicFlag = normalizeFlag(is_public);
    const [existing] = await connection.execute(
      'SELECT id FROM members WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    await connection.execute(
      `UPDATE members SET
        name = ?, avatar = ?, birth_date = ?, death_date = ?, bio = ?,
        generation = ?, gender = ?, phone = ?, email = ?, address = ?,
        is_public = ?, sort_order = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name,
        avatar,
        birth_date,
        death_date,
        bio,
        generation,
        gender,
        phone,
        email,
        address,
        publicFlag,
        sort_order,
        id
      ]
    );

    if (parents !== undefined) {
      await connection.execute(
        "DELETE FROM relationships WHERE member_id = ? AND relation_type = 'child'",
        [id]
      );

      for (const parentId of parents) {
        await connection.execute(
          "INSERT INTO relationships (member_id, parent_id, relation_type) VALUES (?, ?, 'child')",
          [id, parentId]
        );
      }
    }

    if (spouses !== undefined) {
      await connection.execute(
        "DELETE FROM relationships WHERE (member_id = ? OR parent_id = ?) AND relation_type = 'spouse'",
        [id, id]
      );

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

const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM members WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    await query('DELETE FROM members WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '成员删除成功'
    });
  } catch (error) {
    next(error);
  }
};

const getFamilyTree = async (req, res, next) => {
  try {
    const members = await query(
      `SELECT id, name, avatar, generation, gender, birth_date, death_date
       FROM members
       WHERE is_public = 1
       ORDER BY generation ASC, sort_order ASC`
    );

    const relationships = await query(
      'SELECT member_id, parent_id, relation_type FROM relationships'
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

const createMemberAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, password, email } = req.body;

    const member = await query('SELECT id FROM members WHERE id = ?', [id]);
    if (member.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    const existing = await query('SELECT id FROM member_users WHERE member_id = ?', [id]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: '该成员已有登录账号'
      });
    }

    const hashedPassword = await hashPassword(password);

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
