/**
 * Announcement controller
 */

const { query } = require('../config/database');
const { getPagination, paginateResponse } = require('../utils/helpers');

const isAdminRequest = (req) => req.user?.type === 'admin';
const normalizeFlag = (value, defaultValue = 1) => {
  if (value === undefined) {
    return defaultValue;
  }

  return value === true || value === 1 || value === '1' ? 1 : 0;
};

const getAnnouncements = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { status } = req.query;
    const isAdmin = isAdminRequest(req);

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

const getAnnouncementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = isAdminRequest(req);

    const announcements = await query(
      `SELECT id, title, content, is_pinned, is_published, created_at
       FROM announcements
       WHERE id = ?`,
      [id]
    );

    if (announcements.length === 0) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    const announcement = announcements[0];

    if (!isAdmin && !announcement.is_published) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, is_pinned, is_published, publish_at } = req.body;
    const pinned = normalizeFlag(is_pinned, 0);
    const published = normalizeFlag(is_published, 1);

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

const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, is_pinned, is_published, publish_at } = req.body;
    const pinned = normalizeFlag(is_pinned, 0);
    const published = normalizeFlag(is_published, 1);

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
