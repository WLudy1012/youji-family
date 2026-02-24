-- ============================================
-- 由基家族网站系统 - 数据库初始化脚本
-- 数据库: MySQL 8.0+
-- 编码: utf8mb4_unicode_ci
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS youji_family 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE youji_family;

-- ============================================
-- 1. 管理员表
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '管理员ID',
  username VARCHAR(50) NOT NULL COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '加密密码',
  email VARCHAR(100) DEFAULT NULL COMMENT '邮箱地址',
  role ENUM('super_admin', 'admin') DEFAULT 'admin' COMMENT '角色：超级管理员/管理员',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用：0-禁用 1-启用',
  last_login DATETIME DEFAULT NULL COMMENT '最后登录时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- 插入默认管理员账号 (密码: admin123)
INSERT INTO admins (username, password, email, role) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN7xK8Q8Q8Q8Q8Q', 'admin@youji-family.com', 'super_admin');

-- ============================================
-- 2. 家族成员表
-- ============================================
CREATE TABLE IF NOT EXISTS members (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '成员ID',
  name VARCHAR(100) NOT NULL COMMENT '成员姓名',
  avatar VARCHAR(255) DEFAULT NULL COMMENT '头像图片路径',
  birth_date DATE DEFAULT NULL COMMENT '出生日期',
  death_date DATE DEFAULT NULL COMMENT '逝世日期（NULL表示健在）',
  bio TEXT DEFAULT NULL COMMENT '个人简介',
  generation INT UNSIGNED DEFAULT 1 COMMENT '辈分/代数',
  gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown' COMMENT '性别',
  phone VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  email VARCHAR(100) DEFAULT NULL COMMENT '电子邮箱',
  address VARCHAR(255) DEFAULT NULL COMMENT '居住地址',
  is_public TINYINT(1) DEFAULT 1 COMMENT '是否公开显示：0-隐私 1-公开',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_generation (generation),
  INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家族成员表';

-- ============================================
-- 3. 家族关系表
-- ============================================
CREATE TABLE IF NOT EXISTS relationships (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '关系ID',
  member_id INT UNSIGNED NOT NULL COMMENT '子成员ID',
  parent_id INT UNSIGNED NOT NULL COMMENT '父成员ID',
  relation_type ENUM('child', 'spouse') DEFAULT 'child' COMMENT '关系类型：子女/配偶',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_relation (member_id, parent_id),
  INDEX idx_member_id (member_id),
  INDEX idx_parent_id (parent_id),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家族关系表';

-- ============================================
-- 4. 成员用户账号表
-- ============================================
CREATE TABLE IF NOT EXISTS member_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  member_id INT UNSIGNED NOT NULL COMMENT '关联的成员ID',
  username VARCHAR(50) NOT NULL COMMENT '登录用户名',
  password VARCHAR(255) NOT NULL COMMENT '加密密码',
  email VARCHAR(100) DEFAULT NULL COMMENT '邮箱地址',
  is_active TINYINT(1) DEFAULT 1 COMMENT '账号是否启用',
  last_login DATETIME DEFAULT NULL COMMENT '最后登录时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_username (username),
  UNIQUE KEY uk_member_id (member_id),
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成员用户账号表';

-- ============================================
-- 5. 文章表
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '文章ID',
  title VARCHAR(200) NOT NULL COMMENT '文章标题',
  content LONGTEXT NOT NULL COMMENT '文章内容（支持HTML）',
  cover_image VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
  summary VARCHAR(500) DEFAULT NULL COMMENT '文章摘要',
  category VARCHAR(50) DEFAULT NULL COMMENT '文章分类',
  author_id INT UNSIGNED DEFAULT NULL COMMENT '作者ID',
  is_published TINYINT(1) DEFAULT 0 COMMENT '是否发布：0-草稿 1-已发布',
  published_at DATETIME DEFAULT NULL COMMENT '发布时间',
  view_count INT UNSIGNED DEFAULT 0 COMMENT '浏览次数',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_is_published (is_published),
  INDEX idx_category (category),
  INDEX idx_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- ============================================
-- 6. 公告表
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '公告ID',
  title VARCHAR(200) NOT NULL COMMENT '公告标题',
  content TEXT NOT NULL COMMENT '公告内容',
  is_pinned TINYINT(1) DEFAULT 0 COMMENT '是否置顶：0-否 1-是',
  is_published TINYINT(1) DEFAULT 1 COMMENT '是否发布',
  publish_at DATETIME DEFAULT NULL COMMENT '定时发布时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_is_pinned (is_pinned),
  INDEX idx_is_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';

-- ============================================
-- 7. 相册表
-- ============================================
CREATE TABLE IF NOT EXISTS albums (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '相册ID',
  name VARCHAR(100) NOT NULL COMMENT '相册名称',
  description TEXT DEFAULT NULL COMMENT '相册描述',
  cover_image VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
  is_public TINYINT(1) DEFAULT 1 COMMENT '是否公开',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相册表';

-- ============================================
-- 8. 相册图片表
-- ============================================
CREATE TABLE IF NOT EXISTS album_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '图片ID',
  album_id INT UNSIGNED NOT NULL COMMENT '所属相册ID',
  image_path VARCHAR(255) NOT NULL COMMENT '图片路径',
  caption VARCHAR(255) DEFAULT NULL COMMENT '图片说明',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_album_id (album_id),
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相册图片表';

-- ============================================
-- 9. 留言表
-- ============================================
CREATE TABLE IF NOT EXISTS guestbook (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '留言ID',
  author_name VARCHAR(100) NOT NULL COMMENT '留言者姓名',
  content TEXT NOT NULL COMMENT '留言内容',
  member_id INT UNSIGNED DEFAULT NULL COMMENT '关联的成员ID',
  is_approved TINYINT(1) DEFAULT 0 COMMENT '是否审核通过：0-待审核 1-已通过',
  reply_content TEXT DEFAULT NULL COMMENT '管理员回复内容',
  reply_at DATETIME DEFAULT NULL COMMENT '回复时间',
  ip_address VARCHAR(45) DEFAULT NULL COMMENT '留言者IP',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_is_approved (is_approved),
  INDEX idx_member_id (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='留言表';

-- ============================================
-- 10. 站点配置表
-- ============================================
CREATE TABLE IF NOT EXISTS site_configs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
  config_key VARCHAR(100) NOT NULL COMMENT '配置键名',
  config_value TEXT DEFAULT NULL COMMENT '配置值',
  description VARCHAR(255) DEFAULT NULL COMMENT '配置说明',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='站点配置表';

-- 插入默认站点配置
INSERT INTO site_configs (config_key, config_value, description) VALUES
('site_name', '由基家族', '站点名称'),
('site_logo', '/uploads/logo.png', '站点LOGO路径'),
('site_description', '由基家族官方网站，记录家族历史，传承家族文化', '站点描述'),
('site_keywords', '由基家族,家族网站,家族历史,家谱', 'SEO关键词'),
('contact_email', 'contact@youji-family.com', '联系邮箱'),
('contact_phone', '', '联系电话'),
('theme_primary_color', '#1e3a5f', '主题主色（深蓝）'),
('theme_secondary_color', '#c9a227', '主题辅色（金色）'),
('icp_number', '', 'ICP备案号'),
('footer_copyright', '© 2024 由基家族 版权所有', '页脚版权信息'),
('family_declaration', '传承家族文化，凝聚家族力量', '家族宣言'),
('home_banner_title', '由基家族', '首页横幅标题'),
('home_banner_subtitle', '世代传承，薪火相传', '首页横幅副标题');

-- ============================================
-- 11. 注册申请表
-- ============================================
CREATE TABLE IF NOT EXISTS registration_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '申请ID',
  username VARCHAR(50) NOT NULL COMMENT '申请用户名',
  password VARCHAR(255) NOT NULL COMMENT '加密密码',
  email VARCHAR(100) DEFAULT NULL COMMENT '邮箱地址',
  real_name VARCHAR(100) DEFAULT NULL COMMENT '真实姓名',
  phone VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  reason TEXT DEFAULT NULL COMMENT '申请理由',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '申请状态：pending-待审核 approved-已通过 rejected-已拒绝',
  reviewed_by INT UNSIGNED DEFAULT NULL COMMENT '审核人ID',
  reviewed_at DATETIME DEFAULT NULL COMMENT '审核时间',
  review_note VARCHAR(255) DEFAULT NULL COMMENT '审核备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  UNIQUE KEY uk_username (username),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='注册申请表';

-- ============================================
-- 插入示例数据
-- ============================================

-- 示例家族成员（始祖）
INSERT INTO members (name, generation, bio, is_public, sort_order) VALUES
('由基始祖', 1, '家族创始人，开创了由基家族的辉煌历史。', 1, 0);

-- 示例文章
INSERT INTO articles (title, content, summary, category, is_published, published_at) VALUES
('由基家族历史沿革', 
 '<p>由基家族源远流长，历经数百年的发展...</p>', 
 '介绍由基家族的历史渊源和发展历程', 
 '家族历史', 
 1, 
 NOW());

-- 示例公告
INSERT INTO announcements (title, content, is_pinned, is_published) VALUES
('欢迎访问由基家族网站', '欢迎大家访问由基家族官方网站，这里记录了家族的历史和文化。', 1, 1);

-- 示例相册
INSERT INTO albums (name, description, is_public) VALUES
('家族聚会', '记录家族重要聚会活动的精彩瞬间', 1);
