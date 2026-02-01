/**
 * 相册控制器
 * 处理相册和图片的CRUD操作
 */

const { query } = require('../config/database');
const { getPagination, paginateResponse } = require('../utils/helpers');

// ==================== 相册管理 ====================

/**
 * 获取相册列表
 * GET /api/albums
 */
const getAlbums = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    // 只显示公开相册
    const whereClause = 'WHERE is_public = 1';

    // 查询总数
    const countResult = await query(
      `SELECT COUNT(*) as total FROM albums ${whereClause}`
    );
    const total = countResult[0].total;

    // 查询数据
    const albums = await query(
      `SELECT id, name, description, cover_image, created_at
       FROM albums 
       ${whereClause}
       ORDER BY sort_order ASC, created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      success: true,
      data: paginateResponse(albums, total, { page, limit })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取相册详情
 * GET /api/albums/:id
 */
const getAlbumById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 获取相册信息
    const albums = await query(
      `SELECT id, name, description, cover_image, is_public, created_at
       FROM albums WHERE id = ?`,
      [id]
    );

    if (albums.length === 0) {
      return res.status(404).json({
        success: false,
        message: '相册不存在'
      });
    }

    const album = albums[0];

    // 获取相册图片
    const images = await query(
      `SELECT id, image_path, caption, sort_order, created_at
       FROM album_images WHERE album_id = ? ORDER BY sort_order ASC, created_at ASC`,
      [id]
    );

    album.images = images;

    res.json({
      success: true,
      data: album
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建相册
 * POST /api/albums
 */
const createAlbum = async (req, res, next) => {
  try {
    const { name, description, cover_image, is_public, sort_order } = req.body;

    const [result] = await query(
      `INSERT INTO albums (name, description, cover_image, is_public, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, cover_image, is_public !== undefined ? is_public : 1, sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: '相册创建成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新相册
 * PUT /api/albums/:id
 */
const updateAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, cover_image, is_public, sort_order } = req.body;

    const existing = await query('SELECT id FROM albums WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '相册不存在'
      });
    }

    await query(
      `UPDATE albums SET
        name = ?, description = ?, cover_image = ?, is_public = ?, 
        sort_order = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, description, cover_image, is_public, sort_order, id]
    );

    res.json({
      success: true,
      message: '相册更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除相册
 * DELETE /api/albums/:id
 */
const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id FROM albums WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '相册不存在'
      });
    }

    await query('DELETE FROM albums WHERE id = ?', [id]);

    res.json({
      success: true,
      message: '相册删除成功'
    });
  } catch (error) {
    next(error);
  }
};

// ==================== 图片管理 ====================

/**
 * 添加图片到相册
 * POST /api/albums/:id/images
 */
const addImageToAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { image_path, caption, sort_order } = req.body;

    // 检查相册是否存在
    const album = await query('SELECT id FROM albums WHERE id = ?', [id]);
    if (album.length === 0) {
      return res.status(404).json({
        success: false,
        message: '相册不存在'
      });
    }

    const [result] = await query(
      `INSERT INTO album_images (album_id, image_path, caption, sort_order)
       VALUES (?, ?, ?, ?)`,
      [id, image_path, caption, sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: '图片添加成功',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新图片信息
 * PUT /api/albums/images/:imageId
 */
const updateImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;
    const { caption, sort_order } = req.body;

    const existing = await query('SELECT id FROM album_images WHERE id = ?', [imageId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '图片不存在'
      });
    }

    await query(
      'UPDATE album_images SET caption = ?, sort_order = ? WHERE id = ?',
      [caption, sort_order, imageId]
    );

    res.json({
      success: true,
      message: '图片更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除图片
 * DELETE /api/albums/images/:imageId
 */
const deleteImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    const existing = await query('SELECT id FROM album_images WHERE id = ?', [imageId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '图片不存在'
      });
    }

    await query('DELETE FROM album_images WHERE id = ?', [imageId]);

    res.json({
      success: true,
      message: '图片删除成功'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addImageToAlbum,
  updateImage,
  deleteImage
};
