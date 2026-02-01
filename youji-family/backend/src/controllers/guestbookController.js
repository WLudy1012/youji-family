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
    const whereClause = 'WHERE is_approved = 1';

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM guestbook ${whereClause}`
    );
    const total = countResult[0].total;

    // 查询数据
    const messages = await query(
      `SELECT id, author_name, content, reply_content, reply_at, created_at
       FROM guestbook 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
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
    const { isApproved } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (isApproved !== undefined) {
      whereClause += ' AND is_approved = ?';
      params.push(isApproved);
    }

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM guestbook ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 查询数据
    const messages = await query(
      `SELECT g.id, g.author_name, g.content, g.is_approved, 
              g.reply_content, g.reply_at, g.ip_address, g.created_at,
              m.name as member_name
       FROM guestbook g
       LEFT JOIN members m ON g.member_id = m.id
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
    const { author_name, content } = req.body;
    const memberId = req.user && req.user.type === 'member' ? req.user.member_id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;

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

    const [result] = await query(
      `INSERT INTO guestbook (author_name, content, member_id, ip_address, is_approved)
       VALUES (?, ?, ?, ?, ?)`,
      [author_name || '匿名', content, memberId, ipAddress, 0]
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
    const { is_approved } = req.body;

    const existing = await query('SELECT id FROM guestbook WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '留言不存在'
      });
    }

    await query(
      'UPDATE guestbook SET is_approved = ? WHERE id = ?',
      [is_approved, id]
    );

    res.json({
      success: true,
      message: is_approved ? '留言已通过审核' : '留言已取消审核'
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

    const existing = await query('SELECT id FROM guestbook WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '留言不存在'
      });
    }

    await query(
      'UPDATE guestbook SET reply_content = ?, reply_at = NOW() WHERE id = ?',
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

    const existing = await query('SELECT id FROM guestbook WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '留言不存在'
      });
    }

    await query('DELETE FROM guestbook WHERE id = ?', [id]);

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
