/**
 * Article controller
 */

const { query } = require('../config/database');
const { getPagination, paginateResponse } = require('../utils/helpers');

const isAdminRequest = (req) => req.user?.type === 'admin';
const normalizeFlag = (value, defaultValue = 0) => {
  if (value === undefined) {
    return defaultValue;
  }

  return value === true || value === 1 || value === '1' ? 1 : 0;
};

const getArticles = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { category, keyword, isPublished } = req.query;
    const isAdmin = isAdminRequest(req);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (!isAdmin) {
      whereClause += ' AND is_published = 1';
    } else if (isPublished !== undefined) {
      whereClause += ' AND is_published = ?';
      params.push(normalizeFlag(isPublished));
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (keyword) {
      whereClause += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM articles ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const articles = await query(
       `SELECT id, title, content, cover_image, summary, category, is_published,
              view_count, published_at, created_at, updated_at
       FROM articles
       ${whereClause}
       ORDER BY sort_order ASC, published_at DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: paginateResponse(articles, total, { page, limit })
    });
  } catch (error) {
    next(error);
  }
};

const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = isAdminRequest(req);

    const articles = await query(
      `SELECT id, title, content, cover_image, summary, category,
              is_published, view_count, published_at, created_at, updated_at
       FROM articles
       WHERE id = ?`,
      [id]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    const article = articles[0];

    if (!article.is_published && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权访问此文章'
      });
    }

    if (!isAdmin) {
      await query(
        'UPDATE articles SET view_count = view_count + 1 WHERE id = ?',
        [id]
      );
      article.view_count += 1;
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
};

const createArticle = async (req, res, next) => {
  try {
    const {
      title,
      content,
      cover_image,
      summary,
      category,
      is_published,
      published_at,
      sort_order
    } = req.body;

    const published = normalizeFlag(is_published, 0);
    const [result] = await query(
      `INSERT INTO articles (title, content, cover_image, summary, category,
                            is_published, published_at, sort_order, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        content,
        cover_image,
        summary,
        category,
        published,
        published_at || null,
        sort_order || 0,
        req.user ? req.user.id : null
      ]
    );

    res.status(201).json({
      success: true,
      message: '文章创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      cover_image,
      summary,
      category,
      is_published,
      published_at,
      sort_order
    } = req.body;

    const existing = await query('SELECT id FROM articles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    await query(
      `UPDATE articles SET
        title = ?, content = ?, cover_image = ?, summary = ?, category = ?,
        is_published = ?, published_at = ?, sort_order = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title,
        content,
        cover_image,
        summary,
        category,
        normalizeFlag(is_published, 0),
        published_at,
        sort_order,
        id
      ]
    );

    res.json({
      success: true,
      message: '文章更新成功'
    });
  } catch (error) {
    next(error);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM articles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    await query('DELETE FROM articles WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '文章删除成功'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
