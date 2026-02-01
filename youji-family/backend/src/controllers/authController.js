/**
 * 认证控制器
 * 处理管理员和成员的登录认证
 */

const { query } = require('../config/database');
const { verifyPassword, generateToken } = require('../utils/helpers');

/**
 * 管理员登录
 * POST /api/auth/admin/login
 */
const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 查询管理员账号
    const accounts = await query(
      'SELECT account_id, member_id, username, password_hash, email, phone, role, status, last_login FROM family_accounts WHERE username = ? AND role = ?',
      [username, 'admin']
    );

    if (accounts.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const account = accounts[0];

    // 检查账号是否启用
    if (account.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    // 验证密码
    const isValid = await verifyPassword(password, account.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    await query(
      'UPDATE family_accounts SET last_login = NOW() WHERE account_id = ?',
      [account.account_id]
    );

    // 生成JWT令牌
    const token = generateToken(account);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: account.account_id,
          member_id: account.member_id,
          username: account.username,
          email: account.email,
          phone: account.phone,
          role: account.role
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

    // 查询成员账号
    const accounts = await query(
      `SELECT fa.account_id, fa.member_id, fa.username, fa.password_hash, fa.email, fa.phone, fa.role, fa.status, fa.last_login,
              fm.name as member_name, fm.avatar 
       FROM family_accounts fa 
       JOIN family_members fm ON fa.member_id = fm.member_id 
       WHERE fa.username = ? AND fa.role = ?`,
      [username, 'member']
    );

    if (accounts.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const account = accounts[0];

    // 检查账号是否启用
    if (account.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    // 验证密码
    const isValid = await verifyPassword(password, account.password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 更新最后登录时间
    await query(
      'UPDATE family_accounts SET last_login = NOW() WHERE account_id = ?',
      [account.account_id]
    );

    // 生成JWT令牌
    const token = generateToken(account);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: account.account_id,
          member_id: account.member_id,
          username: account.username,
          email: account.email,
          phone: account.phone,
          member_name: account.member_name,
          avatar: account.avatar,
          role: account.role
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
    const accountId = req.user.id;

    const accounts = await query(
      'SELECT account_id, member_id, username, email, phone, role, status, last_login, created_at FROM family_accounts WHERE account_id = ? AND role = ?',
      [accountId, 'admin']
    );

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    res.json({
      success: true,
      data: accounts[0]
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
    const accountId = req.user.id;

    const accounts = await query(
      `SELECT fa.account_id, fa.member_id, fa.username, fa.email, fa.phone, fa.role, fa.status, fa.last_login,
              fm.name, fm.avatar, fm.birth_date, fm.bio, fm.generation, fm.status as member_status
       FROM family_accounts fa 
       JOIN family_members fm ON fa.member_id = fm.member_id 
       WHERE fa.account_id = ? AND fa.role = ?`,
      [accountId, 'member']
    );

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '成员不存在'
      });
    }

    res.json({
      success: true,
      data: accounts[0]
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
    const accountId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // 查询账号
    const accounts = await query(
      'SELECT password_hash FROM family_accounts WHERE account_id = ? AND role = ?',
      [accountId, 'admin']
    );

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    // 验证旧密码
    const isValid = await verifyPassword(oldPassword, accounts[0].password_hash);
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
      'UPDATE family_accounts SET password_hash = ? WHERE account_id = ?',
      [hashedPassword, accountId]
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
