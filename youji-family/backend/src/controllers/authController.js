/**
 * 认证控制器
 * 处理管理员和成员的登录认证
 */

const { query } = require('../config/database');
const { verifyPassword, generateAdminToken, generateMemberToken } = require('../utils/helpers');

/**
 * 管理员登录
 * POST /api/auth/admin/login
 */
const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 查询管理员
    const admins = await query(
      'SELECT id, username, password, email, role, is_active FROM admins WHERE username = ?',
      [username]
    );

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const admin = admins[0];

    // 检查账号是否启用
    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    // 验证密码
    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    await query(
      'UPDATE admins SET last_login = NOW() WHERE id = ?',
      [admin.id]
    );

    // 生成JWT令牌
    const token = generateAdminToken(admin);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 成员登录
 * POST /api/auth/member/login
 */
const memberLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 查询成员用户
    const users = await query(
      `SELECT mu.id, mu.member_id, mu.username, mu.password, mu.email, mu.is_active, 
              m.name as member_name, m.avatar 
       FROM member_users mu 
       JOIN members m ON mu.member_id = m.id 
       WHERE mu.username = ?`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];

    // 检查账号是否启用
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    await query(
      'UPDATE member_users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // 生成JWT令牌
    const token = generateMemberToken(user);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          member_id: user.member_id,
          username: user.username,
          email: user.email,
          member_name: user.member_name,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前登录管理员信息
 * GET /api/auth/admin/profile
 */
const getAdminProfile = async (req, res, next) => {
  try {
    const adminId = req.user.id;

    const admins = await query(
      'SELECT id, username, email, role, is_active, last_login, created_at FROM admins WHERE id = ?',
      [adminId]
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    res.json({
      success: true,
      data: admins[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前登录成员信息
 * GET /api/auth/member/profile
 */
const getMemberProfile = async (req, res, next) => {
  try {
    const memberId = req.user.member_id;

    const members = await query(
      `SELECT m.id, m.name, m.avatar, m.birth_date, m.death_date, m.bio, 
              m.generation, m.gender, m.phone, m.email, m.address,
              mu.username, mu.email as user_email, mu.last_login
       FROM members m 
       JOIN member_users mu ON m.id = mu.member_id 
       WHERE m.id = ?`,
      [memberId]
    );

    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    res.json({
      success: true,
      data: members[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 修改管理员密码
 * PUT /api/auth/admin/password
 */
const changeAdminPassword = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // 查询管理员
    const admins = await query(
      'SELECT password FROM admins WHERE id = ?',
      [adminId]
    );

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    // 验证旧密码
    const isValid = await verifyPassword(oldPassword, admins[0].password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: '旧密码错误'
      });
    }

    // 更新密码
    const { hashPassword } = require('../utils/helpers');
    const hashedPassword = await hashPassword(newPassword);

    await query(
      'UPDATE admins SET password = ? WHERE id = ?',
      [hashedPassword, adminId]
    );

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  memberLogin,
  getAdminProfile,
  getMemberProfile,
  changeAdminPassword
};
