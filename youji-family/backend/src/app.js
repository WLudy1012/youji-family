/**
 * 由基家族网站系统 - 后端API主入口
 * 
 * @description 家族网站后端服务，提供RESTful API接口
 * @author YouJi Family
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { ensureUploadDir } = require('./config/upload');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 8080;

// ==================== 中间件配置 ====================

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==================== 健康检查 ====================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务正常运行',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ==================== API路由 ====================

app.use('/api', routes);

// ==================== 错误处理 ====================

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// ==================== 启动服务 ====================

const startServer = async () => {
  try {
    // 测试数据库连接
    console.log('正在连接数据库...');
    let dbConnected = false;
    
    try {
      dbConnected = await testConnection();
      console.log('✅ 数据库连接成功');
    } catch (error) {
      console.warn('⚠️  数据库连接失败，将以模拟数据模式启动');
      console.warn('   提示: 请配置正确的数据库连接信息以使用完整功能');
      dbConnected = false;
    }

    // 确保上传目录存在
    ensureUploadDir('avatars');
    ensureUploadDir('covers');
    ensureUploadDir('albums');
    ensureUploadDir('images');

    // 启动服务器
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('🎉 由基家族网站系统 - 后端服务已启动');
      console.log('='.repeat(50));
      console.log(`📡 服务地址: http://localhost:${PORT}`);
      console.log(`📚 API文档: http://localhost:${PORT}/api`);
      console.log(`💓 健康检查: http://localhost:${PORT}/health`);
      console.log(`💡 运行模式: ${dbConnected ? '完整模式' : '模拟数据模式'}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
};

// 启动服务
startServer();

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
