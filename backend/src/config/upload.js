/**
 * 上传配置
 */

const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_PATH = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');

const ensureUploadDir = (subDir = '') => {
  const target = subDir ? path.join(UPLOAD_PATH, subDir) : UPLOAD_PATH;
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
};

ensureUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = (req.query.type || 'images').toString();
    ensureUploadDir(folder);
    cb(null, path.join(UPLOAD_PATH, folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024) },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('仅支持图片文件上传'));
    }
  }
});

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message || '上传失败' });
  }
  next();
};

module.exports = {
  UPLOAD_PATH,
  upload,
  uploadErrorHandler,
  ensureUploadDir
};
