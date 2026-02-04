/**
 * 站点配置控制器
 * 处理站点全局配置的CRUD操作
 */

const { query } = require('../config/database');

/**
 * 获取所有配置
 * GET /api/admin/configs
 */
const getAllConfigs = async (req, res, next) => {
  try {
    const configs = await query(
      'SELECT config_id, config_key, config_value, config_type, description FROM family_configs ORDER BY config_key'
    );

    // 转换为键值对格式
    const configMap = {};
    configs.forEach(config => {
      configMap[config.config_key] = config.config_value;
    });

    res.json({
      success: true,
      data: configMap
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个配置
 * GET /api/admin/configs/:key
 */
const getConfigByKey = async (req, res, next) => {
  try {
    const { key } = req.params;

    const configs = await query(
      'SELECT config_id, config_key, config_value, config_type, description FROM family_configs WHERE config_key = ?',
      [key]
    );

    if (configs.length === 0) {
      return res.status(404).json({
        success: false,
        message: '配置项不存在'
      });
    }

    res.json({
      success: true,
      data: configs[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 批量更新配置
 * PUT /api/admin/configs
 */
const updateConfigs = async (req, res, next) => {
  try {
    const configs = req.body;

    if (!configs || typeof configs !== 'object') {
      return res.status(400).json({
        success: false,
        message: '请提供有效的配置数据'
      });
    }

    // 批量更新
    for (const [key, value] of Object.entries(configs)) {
      // 跳过非字符串值
      if (value !== null && typeof value !== 'string') {
        continue;
      }

      await query(
        'UPDATE family_configs SET config_value = ?, updated_at = NOW() WHERE config_key = ?',
        [value, key]
      );
    }

    res.json({
      success: true,
      message: '配置更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新单个配置
 * PUT /api/admin/configs/:key
 */
const updateConfig = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    // 检查配置项是否存在
    const existing = await query(
      'SELECT config_id FROM family_configs WHERE config_key = ?',
      [key]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '配置项不存在'
      });
    }

    await query(
      'UPDATE family_configs SET config_value = ?, updated_at = NOW() WHERE config_key = ?',
      [value, key]
    );

    res.json({
      success: true,
      message: '配置更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取前端展示所需配置
 * GET /api/configs
 */
const getPublicConfigs = async (req, res, next) => {
  try {
    // 只返回前端需要的配置项
    const publicKeys = [
      'site_name',
      'site_slogan',
      'site_description',
      'site_logo',
      'contact_email',
      'contact_phone',
      'footer_text',
      'family_creed',
      'theme_color',
      'accent_color'
    ];

    const placeholders = publicKeys.map(() => '?').join(',');
    const configs = await query(
      `SELECT config_key, config_value FROM family_configs WHERE config_key IN (${placeholders})`,
      publicKeys
    );

    // 转换为键值对格式
    const configMap = {};
    configs.forEach(config => {
      configMap[config.config_key] = config.config_value;
    });

    res.json({
      success: true,
      data: configMap
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllConfigs,
  getConfigByKey,
  updateConfigs,
  updateConfig,
  getPublicConfigs
};
