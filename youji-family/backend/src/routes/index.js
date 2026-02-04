/**
 * 路由配置
 * 统一注册所有API路由
 */

const express = require('express');
const router = express.Router();

// 中间件
const { verifyAdminToken, verifyMemberToken, optionalAuth } = require('../middleware/auth');
const { upload, uploadErrorHandler } = require('../config/upload');

// 控制器
const authController = require('../controllers/authController');
const memberController = require('../controllers/memberController');
const configController = require('../controllers/configController');
const articleController = require('../controllers/articleController');
const announcementController = require('../controllers/announcementController');
const albumController = require('../controllers/albumController');
const guestbookController = require('../controllers/guestbookController');
const uploadController = require('../controllers/uploadController');
const backupController = require('../controllers/backupController');

// ==================== 公开接口 ====================

// 站点配置
router.get('/configs', configController.getPublicConfigs);

// 家族成员
router.get('/members', memberController.getMembers);
router.get('/members/tree', memberController.getFamilyTree);
router.get('/members/:id', memberController.getMemberById);

// 文章
router.get('/articles', articleController.getArticles);
router.get('/articles/:id', articleController.getArticleById);

// 公告
router.get('/announcements', announcementController.getAnnouncements);
router.get('/announcements/:id', announcementController.getAnnouncementById);

// 相册
router.get('/albums', albumController.getAlbums);
router.get('/albums/:id', albumController.getAlbumById);

// 留言板
router.get('/guestbook', guestbookController.getGuestbook);
router.post('/guestbook', optionalAuth, guestbookController.createMessage);

// ==================== 成员接口 ====================

// 成员认证
router.post('/auth/member/login', authController.memberLogin);
router.get('/auth/member/profile', verifyMemberToken, authController.getMemberProfile);

// ==================== 管理员接口 ====================

// 管理员认证
router.post('/auth/admin/login', authController.adminLogin);
router.get('/auth/admin/profile', verifyAdminToken, authController.getAdminProfile);
router.put('/auth/admin/password', verifyAdminToken, authController.changeAdminPassword);

// 配置管理
router.get('/admin/configs', verifyAdminToken, configController.getAllConfigs);
router.get('/admin/configs/:key', verifyAdminToken, configController.getConfigByKey);
router.put('/admin/configs', verifyAdminToken, configController.updateConfigs);
router.put('/admin/configs/:key', verifyAdminToken, configController.updateConfig);

// 成员管理
router.post('/admin/members', verifyAdminToken, memberController.createMember);
router.put('/admin/members/:id', verifyAdminToken, memberController.updateMember);
router.delete('/admin/members/:id', verifyAdminToken, memberController.deleteMember);
router.post('/admin/members/:id/account', verifyAdminToken, memberController.createMemberAccount);

// 文章管理
router.post('/admin/articles', verifyAdminToken, articleController.createArticle);
router.put('/admin/articles/:id', verifyAdminToken, articleController.updateArticle);
router.delete('/admin/articles/:id', verifyAdminToken, articleController.deleteArticle);

// 公告管理
router.get('/admin/announcements', verifyAdminToken, announcementController.getAnnouncements);
router.post('/admin/announcements', verifyAdminToken, announcementController.createAnnouncement);
router.put('/admin/announcements/:id', verifyAdminToken, announcementController.updateAnnouncement);
router.delete('/admin/announcements/:id', verifyAdminToken, announcementController.deleteAnnouncement);

// 相册管理
router.post('/admin/albums', verifyAdminToken, albumController.createAlbum);
router.put('/admin/albums/:id', verifyAdminToken, albumController.updateAlbum);
router.delete('/admin/albums/:id', verifyAdminToken, albumController.deleteAlbum);
router.post('/admin/albums/:id/images', verifyAdminToken, albumController.addImageToAlbum);
router.put('/admin/albums/images/:imageId', verifyAdminToken, albumController.updateImage);
router.delete('/admin/albums/images/:imageId', verifyAdminToken, albumController.deleteImage);

// 留言管理
router.get('/admin/guestbook', verifyAdminToken, guestbookController.getAllGuestbook);
router.put('/admin/guestbook/:id/approve', verifyAdminToken, guestbookController.approveMessage);
router.put('/admin/guestbook/:id/reply', verifyAdminToken, guestbookController.replyMessage);
router.delete('/admin/guestbook/:id', verifyAdminToken, guestbookController.deleteMessage);

// 文件上传
router.post('/admin/upload/image', 
  verifyAdminToken, 
  upload.single('image'), 
  uploadErrorHandler,
  uploadController.uploadImage
);
router.post('/admin/upload/images', 
  verifyAdminToken, 
  upload.array('images', 10), 
  uploadErrorHandler,
  uploadController.uploadMultipleImages
);

// 数据备份
router.get('/admin/backups', verifyAdminToken, backupController.getBackups);
router.post('/admin/backups', verifyAdminToken, backupController.createBackup);
router.post('/admin/backups/:id/restore', verifyAdminToken, backupController.restoreBackup);
router.delete('/admin/backups/:id', verifyAdminToken, backupController.deleteBackup);

module.exports = router;
