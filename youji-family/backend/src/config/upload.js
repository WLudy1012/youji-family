/**
 * 文件上传配置模块
 * 配置multer用于处理文件上传
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 上传目录
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';

// 确保上传目录存在
const ensureUploadDir = (subDir = '') => {
  const dir = path.join(UPLOAD_PATH, subDir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

// 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 根据文件类型选择存储目录
    let subDir = '';
    if (file.fieldname === 'avatar') {
      subDir = 'avatars';
    } else if (file.fieldname === 'cover') {
      subDir = 'covers';
    } else if (file.fieldname === 'album') {
      subDir = 'albums';
    } else {
      subDir = 'images';
    }
    
    const dir = ensureUploadDir(subDir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的图片类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件（JPEG、PNG、GIF、WebP）'), false);
  }
};

// 文件大小限制（10MB）
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024;

// 创建multer实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize
  }
});

// 错误处理中间件
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: '文件大小超过限制（最大10MB）'
      });
    }
    return res.status(400).json({
      success: false,
      message: `上传错误: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  uploadErrorHandler,
  UPLOAD_PATH,
  ensureUploadDir
};
