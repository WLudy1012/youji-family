/**
 * 数据库配置模块
 * 提供MySQL数据库连接池配置和模拟数据功能
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'youji_family',
  user: process.env.DB_USER || 'youji',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 数据库连接状态
let dbConnected = false;

// 模拟数据
const mockData = {
  family_members: [
    {
      member_id: 1,
      name: '由基 太公',
      relation: '祖先',
      generation: 1,
      parent_id: null,
      spouse_id: null,
      birth_date: '1800-01-01',
      avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=elderly%20Chinese%20man%20portrait%20traditional%20clothing&size=512x512',
      bio: '由基家族的祖先，创立了家族基业。',
      status: 'active',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      member_id: 2,
      name: '由基 太婆',
      relation: '祖先配偶',
      generation: 1,
      parent_id: null,
      spouse_id: 1,
      birth_date: '1805-01-01',
      avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=elderly%20Chinese%20woman%20portrait%20traditional%20clothing&size=512x512',
      bio: '由基太公的配偶，贤良淑德。',
      status: 'active',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      member_id: 3,
      name: '由基 爷爷',
      relation: '祖父',
      generation: 2,
      parent_id: 1,
      spouse_id: 4,
      birth_date: '1850-01-01',
      avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=middle%20aged%20Chinese%20man%20portrait%20traditional%20clothing&size=512x512',
      bio: '由基家族的第二代传人，继承了家族事业。',
      status: 'active',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      member_id: 4,
      name: '由基 奶奶',
      relation: '祖母',
      generation: 2,
      parent_id: null,
      spouse_id: 3,
      birth_date: '1855-01-01',
      avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=middle%20aged%20Chinese%20woman%20portrait%20traditional%20clothing&size=512x512',
      bio: '由基爷爷的配偶，温柔贤惠。',
      status: 'active',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      member_id: 5,
      name: '由基 爸爸',
      relation: '父亲',
      generation: 3,
      parent_id: 3,
      spouse_id: 6,
      birth_date: '1900-01-01',
      avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=young%20Chinese%20man%20portrait%20modern%20clothing&size=512x512',
      bio: '由基家族的第三代传人，拓展了家族事业。',
      status: 'active',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      member_id: 6,
      name: '由基 妈妈',
      relation: '母亲',
      generation: 3,
      parent_id: null,
      spouse_id: 5,
      birth_date: '1905-01-01',
      avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=young%20Chinese%20woman%20portrait%20modern%20clothing&size=512x512',
      bio: '由基爸爸的配偶，相夫教子。',
      status: 'active',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    },
    {
      member_id: 7,
      name: '由基 我',
      relation: '本人',
      generation: 4,
      parent_id: 5,
      spouse_id: null,
      birth_date: '1950-01-01',
      avatar: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=modern%20Chinese%20person%20portrait%20professional%20clothing&size=512x512',
      bio: '由基家族的第四代传人，致力于家族文化传承。',
      status: 'active',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    }
  ],
  family_guestbook: [
    {
      guest_id: 1,
      name: '访客1',
      email: 'guest1@example.com',
      phone: '13800138001',
      message: '祝福由基家族繁荣昌盛！',
      status: 'approved',
      created_at: new Date('2024-01-01')
    },
    {
      guest_id: 2,
      name: '访客2',
      email: 'guest2@example.com',
      phone: '13800138002',
      message: '很高兴认识由基家族的各位成员！',
      status: 'approved',
      created_at: new Date('2024-01-02')
    }
  ],
  family_configs: [
    {
      config_key: 'site_name',
      config_value: '由基家族',
      config_type: 'string'
    },
    {
      config_key: 'site_desc',
      config_value: '由基家族的官方网站',
      config_type: 'string'
    },
    {
      config_key: 'admin_email',
      config_value: 'admin@youji-family.com',
      config_type: 'string'
    }
  ],
  family_articles: [
    {
      article_id: 1,
      title: '家族历史',
      content: '由基家族有着悠久的历史...',
      status: 'published',
      created_at: new Date('2024-01-01')
    }
  ],
  family_announcements: [
    {
      announcement_id: 1,
      title: '网站开通',
      content: '由基家族网站正式开通了！',
      status: 'active',
      created_at: new Date('2024-01-01')
    }
  ],
  family_albums: [
    {
      album_id: 1,
      name: '家族聚会',
      description: '家族成员聚会的照片',
      cover_image: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=family%20gathering%20traditional%20Chinese%20style&size=512x512',
      created_at: new Date('2024-01-01')
    }
  ]
};

/**
 * 执行SQL查询
 * @param {string} sql - SQL语句
 * @param {Array} params - 查询参数
 * @returns {Promise} 查询结果
 */
const query = async (sql, params = []) => {
  try {
    // 如果数据库连接失败，返回模拟数据
    if (!dbConnected) {
      return getMockData(sql, params);
    }
    
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('数据库查询错误:', error);
    // 如果执行查询时出错，返回模拟数据
    return getMockData(sql, params);
  }
};

/**
 * 获取模拟数据
 * @param {string} sql - SQL语句
 * @param {Array} params - 查询参数
 * @returns {Array} 模拟数据
 */
const getMockData = (sql, params = []) => {
  // 匹配查询家族成员的SQL语句
  if (sql.includes('family_members')) {
    if (sql.includes('COUNT(*)')) {
      return [{ total: mockData.family_members.length }];
    }
    if (sql.includes('member_id = ?')) {
      const id = params[0];
      return mockData.family_members.filter(member => member.member_id == id);
    }
    if (sql.includes('tree')) {
      return mockData.family_members;
    }
    return mockData.family_members;
  }
  
  // 匹配查询留言板的SQL语句
  if (sql.includes('family_guestbook')) {
    if (sql.includes('COUNT(*)')) {
      return [{ total: mockData.family_guestbook.length }];
    }
    return mockData.family_guestbook;
  }
  
  // 匹配查询配置的SQL语句
  if (sql.includes('family_configs')) {
    return mockData.family_configs;
  }
  
  // 匹配查询文章的SQL语句
  if (sql.includes('family_articles')) {
    if (sql.includes('COUNT(*)')) {
      return [{ total: mockData.family_articles.length }];
    }
    return mockData.family_articles;
  }
  
  // 匹配查询公告的SQL语句
  if (sql.includes('family_announcements')) {
    if (sql.includes('COUNT(*)')) {
      return [{ total: mockData.family_announcements.length }];
    }
    return mockData.family_announcements;
  }
  
  // 匹配查询相册的SQL语句
  if (sql.includes('family_albums')) {
    if (sql.includes('COUNT(*)')) {
      return [{ total: mockData.family_albums.length }];
    }
    return mockData.family_albums;
  }
  
  return [];
};

/**
 * 获取数据库连接（用于事务）
 * @returns {Promise} 数据库连接
 */
const getConnection = async () => {
  if (!dbConnected) {
    throw new Error('数据库连接失败');
  }
  return await pool.getConnection();
};

/**
 * 测试数据库连接
 */
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    dbConnected = true;
    return true;
  } catch (error) {
    console.warn('⚠️  数据库连接失败，将以模拟数据模式启动');
    console.warn('   提示: 请配置正确的数据库连接信息以使用完整功能');
    dbConnected = false;
    return false;
  }
};

/**
 * 获取数据库连接状态
 * @returns {boolean} 数据库连接状态
 */
const getDbConnected = () => {
  return dbConnected;
};

module.exports = {
  pool,
  query,
  getConnection,
  testConnection,
  getDbConnected
};
