/**
 * 留言控制器
 * 处理留言板的CRUD操作
 */

const { query } = require('../config/database');
const { getPagination, paginateResponse } = require('../utils/helpers');

/**
 * 获取留言列表（前台）
 * GET /api/guestbook
 */
const getGuestbook = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    // 只显示已审核的留言
    const whereClause = 'WHERE status = ?';
    const params = ['approved'];

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM family_guestbook ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 查询数据
    const messages = await query(
      `SELECT message_id, author_name, author_email, content, reply_content, created_at, updated_at
       FROM family_guestbook 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: paginateResponse(messages, total, { page, limit })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取所有留言（后台管理）
 * GET /api/admin/guestbook
 */
const getAllGuestbook = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { status } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM family_guestbook ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 查询数据
    const messages = await query(
      `SELECT g.message_id, g.author_name, g.author_email, g.content, g.status, 
              g.reply_content, g.created_at, g.updated_at,
              fm.name as member_name
       FROM family_guestbook g
       LEFT JOIN family_members fm ON g.member_id = fm.member_id
       ${whereClause}
       ORDER BY g.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: paginateResponse(messages, total, { page, limit })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 提交留言
 * POST /api/guestbook
 */
const createMessage = async (req, res, next) => {
  try {
    const { author_name, author_email, content } = req.body;
    const memberId = req.user && req.user.member_id ? req.user.member_id : null;

    // 内容验证
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '留言内容不能为空'
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: '留言内容不能超过1000字'
      });
    }

    const result = await query(
      `INSERT INTO family_guestbook (author_name, author_email, content, member_id, status)
       VALUES (?, ?, ?, ?, ?)`,
      [author_name || '匿名', author_email || null, content, memberId, 'pending']
    );

    res.status(201).json({
      success: true,
      message: '留言提交成功，等待审核',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 审核留言
 * PUT /api/admin/guestbook/:id/approve
 */
const approveMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existing = await query('SELECT message_id FROM family_guestbook WHERE message_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '留言不存在'
      });
    }

    await query(
      'UPDATE family_guestbook SET status = ? WHERE message_id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: status === 'approved' ? '留言已通过审核' : '留言已拒绝'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 回复留言
 * PUT /api/admin/guestbook/:id/reply
 */
const replyMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply_content } = req.body;

    const existing = await query('SELECT message_id FROM family_guestbook WHERE message_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '留言不存在'
      });
    }

    await query(
      'UPDATE family_guestbook SET reply_content = ? WHERE message_id = ?',
      [reply_content, id]
    );

    res.json({
      success: true,
      message: '回复成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除留言
 * DELETE /api/admin/guestbook/:id
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT message_id FROM family_guestbook WHERE message_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '留言不存在'
      });
    }

    await query('DELETE FROM family_guestbook WHERE message_id = ?', [id]);

    res.json({
      success: true,
      message: '留言删除成功'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGuestbook,
  getAllGuestbook,
  createMessage,
  approveMessage,
  replyMessage,
  deleteMessage
};
