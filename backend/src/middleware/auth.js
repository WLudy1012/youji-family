/**
 * 认证中间件
 * 处理JWT令牌验证和权限检查
 */

const jwt = require('jsonwebtoken');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * 验证管理员Token
 * 用于保护管理员后台API
 */
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 检查是否为管理员
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '无权访问此资源'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '令牌无效或已过期'
    });
  }
};

/**
 * 验证成员Token
 * 用于保护成员专属API
 */
const verifyMemberToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 检查是否为成员
    if (decoded.type !== 'member') {
      return res.status(403).json({
        success: false,
        message: '无权访问此资源'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '令牌无效或已过期'
    });
  }
};

/**
 * 可选认证
 * 用于某些接口，登录和未登录用户均可访问，但返回内容可能不同
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // 令牌无效，继续但不设置用户信息
    }
  }
  
  next();
};

module.exports = {
  verifyAdminToken,
  verifyMemberToken,
  optionalAuth,
  JWT_SECRET
};
