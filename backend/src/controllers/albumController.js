/**
 * Album controller
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

const getAlbums = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const { isPublic } = req.query;
    const isAdmin = isAdminRequest(req);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (isAdmin && isPublic !== undefined) {
      whereClause += ' AND is_public = ?';
      params.push(normalizeFlag(isPublic));
    }

    if (!isAdmin) {
      whereClause += ' AND is_public = 1';
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM albums ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const selectFields = isAdmin
      ? 'id, name, description, cover_image, is_public, created_at'
      : 'id, name, description, cover_image, created_at';

    const albums = await query(
      `SELECT ${selectFields}
       FROM albums
       ${whereClause}
       ORDER BY sort_order ASC, created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: paginateResponse(albums, total, { page, limit })
    });
  } catch (error) {
    next(error);
  }
};

const getAlbumById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = isAdminRequest(req);

    const albums = await query(
      `SELECT id, name, description, cover_image, is_public, created_at
       FROM albums
       WHERE id = ?`,
      [id]
    );

    if (albums.length === 0) {
      return res.status(404).json({
        success: false,
        message: '相册不存在'
      });
    }

    const album = albums[0];

    if (!isAdmin && !album.is_public) {
      return res.status(404).json({
        success: false,
        message: '相册不存在'
      });
    }

    const images = await query(
      `SELECT id, image_path, caption, sort_order, created_at
       FROM album_images
       WHERE album_id = ?
       ORDER BY sort_order ASC, created_at ASC`,
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

const createAlbum = async (req, res, next) => {
  try {
    const { name, description, cover_image, is_public, sort_order } = req.body;
    const publicFlag = normalizeFlag(is_public);

    const [result] = await query(
      `INSERT INTO albums (name, description, cover_image, is_public, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, cover_image, publicFlag, sort_order || 0]
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

const updateAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, cover_image, is_public, sort_order } = req.body;
    const publicFlag = normalizeFlag(is_public);

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
      [name, description, cover_image, publicFlag, sort_order, id]
    );

    res.json({
      success: true,
      message: '相册更新成功'
    });
  } catch (error) {
    next(error);
  }
};

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

const addImageToAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { image_path, caption, sort_order } = req.body;

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
