-- ============================================
-- 由基家族网站系统 - PostgreSQL 初始化脚本
-- ============================================

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  is_active SMALLINT DEFAULT 1,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  avatar VARCHAR(255),
  birth_date DATE,
  death_date DATE,
  bio TEXT,
  generation INTEGER DEFAULT 1,
  gender VARCHAR(20) DEFAULT 'unknown',
  phone VARCHAR(20),
  email VARCHAR(100),
  address VARCHAR(255),
  is_public SMALLINT DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS relationships (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  parent_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  relation_type VARCHAR(20) DEFAULT 'child',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(member_id, parent_id)
);

CREATE TABLE IF NOT EXISTS member_users (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  is_active SMALLINT DEFAULT 1,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  cover_image VARCHAR(255),
  summary VARCHAR(500),
  category VARCHAR(50),
  author_id INTEGER,
  is_published SMALLINT DEFAULT 0,
  published_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  is_pinned SMALLINT DEFAULT 0,
  is_published SMALLINT DEFAULT 1,
  publish_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS albums (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_image VARCHAR(255),
  is_public SMALLINT DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS album_images (
  id SERIAL PRIMARY KEY,
  album_id INTEGER NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  image_path VARCHAR(255) NOT NULL,
  caption VARCHAR(255),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guestbook (
  id SERIAL PRIMARY KEY,
  author_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  member_id INTEGER,
  is_approved SMALLINT DEFAULT 0,
  reply_content TEXT,
  reply_at TIMESTAMP,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_configs (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value TEXT,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registration_requests (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  real_name VARCHAR(100),
  phone VARCHAR(20),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by INTEGER,
  reviewed_at TIMESTAMP,
  review_note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admins (username, password, email, role)
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQzBZN0UfGNEKjN7xK8Q8Q8Q8Q8Q', 'admin@youji-family.com', 'super_admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO site_configs (config_key, config_value, description) VALUES
('site_name', '由基家族', '站点名称'),
('site_logo', '/uploads/logo.png', '站点LOGO路径'),
('home_banner_title', '由基家族', '首页横幅标题'),
('home_banner_subtitle', '世代传承，薪火相传', '首页横幅副标题')
ON CONFLICT (config_key) DO NOTHING;
