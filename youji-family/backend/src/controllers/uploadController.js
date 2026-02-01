/**
 * 文件上传控制器
 * 处理图片上传
 */

const path = require('path');
const { UPLOAD_PATH } = require('../config/upload');

/**
 * 上传单张图片
 * POST /api/upload/image
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    // 构建文件访问URL
    const fileUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;

    res.json({
      success: true,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 上传多张图片
 * POST /api/upload/images
 */
const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const files = req.files.map(file => ({
      url: `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size
    }));

    res.json({
      success: true,
      message: '上传成功',
      data: {
        files,
        count: files.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages
};
