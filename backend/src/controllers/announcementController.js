/**
 * 公告控制器
 * 处理公告的CRUD操作
 */

const { query } = require('../config/database');
const { getPagination, paginateResponse } = require('../utils/helpers');

/**
 * 获取公告列表
 * GET /api/announcements
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const isAdmin = req.user?.type === 'admin';
    const { status } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (!isAdmin) {
      whereClause += ' AND is_published = 1';
    }

    if (isAdmin && status) {
      if (status === 'published') {
        whereClause += ' AND is_published = 1';
      } else if (status === 'draft') {
        whereClause += ' AND is_published = 0';
      }
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM announcements ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const announcements = await query(
      `SELECT id, title, content, is_pinned, is_published, publish_at, created_at, updated_at
       FROM announcements
       ${whereClause}
       ORDER BY is_pinned DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: paginateResponse(announcements, total, { page, limit })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取公告详情
 * GET /api/announcements/:id
 */
const getAnnouncementById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcements = await query(
      `SELECT id, title, content, is_pinned, is_published, created_at
       FROM announcements WHERE id = ?`,
      [id]
    );

    if (announcements.length === 0) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    res.json({
      success: true,
      data: announcements[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建公告
 * POST /api/announcements
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, is_pinned, is_published, publish_at } = req.body;

    const pinned = is_pinned === true || is_pinned === 1 || is_pinned === '1' ? 1 : 0;
    const published = is_published === undefined ? 1 : (is_published === true || is_published === 1 || is_published === '1' ? 1 : 0);


    const [result] = await query(
      `INSERT INTO announcements (title, content, is_pinned, is_published, publish_at)
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, pinned, published, publish_at || null]
    );

    res.status(201).json({
      success: true,
      message: '公告创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新公告
 * PUT /api/announcements/:id
 */
const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, is_pinned, is_published, publish_at } = req.body;

    const pinned = is_pinned === true || is_pinned === 1 || is_pinned === '1' ? 1 : 0;
    const published = is_published === undefined ? 1 : (is_published === true || is_published === 1 || is_published === '1' ? 1 : 0);

    const existing = await query('SELECT id FROM announcements WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    await query(
      `UPDATE announcements SET
        title = ?, content = ?, is_pinned = ?, is_published = ?, 
        publish_at = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, content, pinned, published, publish_at || null, id]
    );

    res.json({
      success: true,
      message: '公告更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除公告
 * DELETE /api/announcements/:id
 */
const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM announcements WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    await query('DELETE FROM announcements WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '公告删除成功'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};
