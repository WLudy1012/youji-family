/**
 * 文章控制器
 * 处理家族文章的CRUD操作
 */

const { query } = require('../config/database');
const { getPagination, paginateResponse } = require('../utils/helpers');

/**
 * 获取文章列表
 * GET /api/articles
 */
const getArticles = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { category, keyword, isPublished } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    // 前台只显示已发布的文章
    if (!req.user || req.user.type !== 'admin') {
      whereClause += ' AND is_published = 1';
    } else if (isPublished !== undefined) {
      whereClause += ' AND is_published = ?';
      params.push(isPublished);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (keyword) {
      whereClause += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM articles ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 查询数据
    const articles = await query(
      `SELECT id, title, cover_image, summary, category, is_published,
              view_count, published_at, created_at, updated_at
       FROM articles 
       ${whereClause}
       ORDER BY is_pinned DESC, sort_order ASC, published_at DESC
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

/**
 * 获取文章详情
 * GET /api/articles/:id
 */
const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const articles = await query(
      `SELECT id, title, content, cover_image, summary, category,
              is_published, view_count, published_at, created_at, updated_at
       FROM articles WHERE id = ?`,
      [id]
    );

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    const article = articles[0];

    // 检查权限
    if (!article.is_published && (!req.user || req.user.type !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: '无权访问此文章'
      });
    }

    // 增加浏览次数
    await query(
      'UPDATE articles SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );

    article.view_count++;

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建文章
 * POST /api/articles
 */
const createArticle = async (req, res, next) => {
  try {
    const {
      title, content, cover_image, summary, category,
      is_published, published_at, sort_order
    } = req.body;

    const [result] = await query(
      `INSERT INTO articles (title, content, cover_image, summary, category,
                            is_published, published_at, sort_order, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, cover_image, summary, category,
       is_published || 0, published_at || null, sort_order || 0,
       req.user ? req.user.id : null]
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

/**
 * 更新文章
 * PUT /api/articles/:id
 */
const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title, content, cover_image, summary, category,
      is_published, published_at, sort_order
    } = req.body;

    // 检查文章是否存在
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
      [title, content, cover_image, summary, category,
       is_published, published_at, sort_order, id]
    );

    res.json({
      success: true,
      message: '文章更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除文章
 * DELETE /api/articles/:id
 */
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
