-- 由基家族网站系统 - 数据库初始化脚本
-- 版本: 1.0.0
-- 日期: 2026-02-01

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `youji_family` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `youji_family`;

-- 清空现有表（如果存在）
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `family_backups`;
DROP TABLE IF EXISTS `family_guestbook`;
DROP TABLE IF EXISTS `family_images`;
DROP TABLE IF EXISTS `family_albums`;
DROP TABLE IF EXISTS `family_announcements`;
DROP TABLE IF EXISTS `family_articles`;
DROP TABLE IF EXISTS `family_accounts`;
DROP TABLE IF EXISTS `family_members`;
DROP TABLE IF EXISTS `family_configs`;
SET FOREIGN_KEY_CHECKS = 1;

-- ==================== 站点配置表 ====================
CREATE TABLE `family_configs` (
  `config_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
  `config_key` VARCHAR(255) NOT NULL UNIQUE COMMENT '配置键名',
  `config_value` TEXT COMMENT '配置值',
  `config_type` VARCHAR(50) NOT NULL DEFAULT 'text' COMMENT '配置类型：text/image/boolean/number',
  `description` VARCHAR(500) COMMENT '配置说明',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='站点配置表';

-- ==================== 家族成员表 ====================
CREATE TABLE `family_members` (
  `member_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '成员ID',
  `name` VARCHAR(100) NOT NULL COMMENT '姓名',
  `relation` VARCHAR(255) COMMENT '关系描述',
  `generation` INT NOT NULL DEFAULT 1 COMMENT '代数',
  `parent_id` INT COMMENT '父节点ID，自关联',
  `spouse_id` INT COMMENT '配偶ID，自关联',
  `birth_date` DATE COMMENT '出生日期',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `bio` TEXT COMMENT '个人简介',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT '状态：active/inactive/deceased',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`parent_id`) REFERENCES `family_members` (`member_id`) ON DELETE SET NULL,
  FOREIGN KEY (`spouse_id`) REFERENCES `family_members` (`member_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家族成员表';

-- ==================== 成员账号表 ====================
CREATE TABLE `family_accounts` (
  `account_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '账号ID',
  `member_id` INT COMMENT '关联成员ID',
  `username` VARCHAR(100) NOT NULL UNIQUE COMMENT '用户名',
  `email` VARCHAR(255) NOT NULL UNIQUE COMMENT '邮箱',
  `phone` VARCHAR(20) COMMENT '电话',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
  `role` VARCHAR(50) NOT NULL DEFAULT 'member' COMMENT '角色：admin/member',
  `last_login` TIMESTAMP COMMENT '最后登录时间',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT '状态：active/inactive/suspended',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`member_id`) REFERENCES `family_members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='成员账号表';

-- ==================== 文章表 ====================
CREATE TABLE `family_articles` (
  `article_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '文章ID',
  `title` VARCHAR(255) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '内容',
  `author_id` INT COMMENT '作者ID（关联账号）',
  `cover_image` VARCHAR(255) COMMENT '封面图片',
  `category` VARCHAR(100) COMMENT '分类',
  `tags` VARCHAR(255) COMMENT '标签（逗号分隔）',
  `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `status` VARCHAR(50) NOT NULL DEFAULT 'draft' COMMENT '状态：draft/published/archived',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`author_id`) REFERENCES `family_accounts` (`account_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- ==================== 公告表 ====================
CREATE TABLE `family_announcements` (
  `announcement_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '公告ID',
  `title` VARCHAR(255) NOT NULL COMMENT '标题',
  `content` TEXT NOT NULL COMMENT '内容',
  `author_id` INT COMMENT '发布者ID（关联账号）',
  `cover_image` VARCHAR(255) COMMENT '封面图片',
  `priority` INT NOT NULL DEFAULT 0 COMMENT '优先级（数字越大优先级越高）',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT '状态：active/expired',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`author_id`) REFERENCES `family_accounts` (`account_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公告表';

-- ==================== 相册表 ====================
CREATE TABLE `family_albums` (
  `album_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '相册ID',
  `name` VARCHAR(255) NOT NULL COMMENT '相册名称',
  `description` TEXT COMMENT '相册描述',
  `cover_image` VARCHAR(255) COMMENT '封面图片',
  `created_by` INT COMMENT '创建者ID（关联账号）',
  `status` VARCHAR(50) NOT NULL DEFAULT 'active' COMMENT '状态：active/archived',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`created_by`) REFERENCES `family_accounts` (`account_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='相册表';

-- ==================== 图片表 ====================
CREATE TABLE `family_images` (
  `image_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '图片ID',
  `album_id` INT COMMENT '关联相册ID',
  `filename` VARCHAR(255) NOT NULL COMMENT '文件名',
  `filepath` VARCHAR(255) NOT NULL COMMENT '文件路径',
  `url` VARCHAR(255) NOT NULL COMMENT '访问URL',
  `description` TEXT COMMENT '图片描述',
  `uploaded_by` INT COMMENT '上传者ID（关联账号）',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`album_id`) REFERENCES `family_albums` (`album_id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaded_by`) REFERENCES `family_accounts` (`account_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='图片表';

-- ==================== 留言板表 ====================
CREATE TABLE `family_guestbook` (
  `message_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '留言ID',
  `author_name` VARCHAR(100) NOT NULL COMMENT '作者姓名',
  `author_email` VARCHAR(255) COMMENT '作者邮箱',
  `content` TEXT NOT NULL COMMENT '留言内容',
  `member_id` INT COMMENT '关联成员ID（如果是成员）',
  `reply_content` TEXT COMMENT '回复内容',
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending' COMMENT '状态：pending/approved/rejected',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`member_id`) REFERENCES `family_members` (`member_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='留言板表';

-- ==================== 备份记录表 ====================
CREATE TABLE `family_backups` (
  `backup_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '备份ID',
  `backup_type` VARCHAR(50) NOT NULL DEFAULT 'full' COMMENT '备份类型：full/partial',
  `backup_file` VARCHAR(255) NOT NULL COMMENT '备份文件路径',
  `size` BIGINT COMMENT '文件大小（字节）',
  `created_by` INT COMMENT '创建者ID（关联账号）',
  `status` VARCHAR(50) NOT NULL DEFAULT 'completed' COMMENT '状态：in_progress/completed/failed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (`created_by`) REFERENCES `family_accounts` (`account_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='备份记录表';

-- ==================== 插入默认数据 ====================

-- 插入站点配置
INSERT INTO `family_configs` (`config_key`, `config_value`, `config_type`, `description`) VALUES
('site_name', '由基家族', 'text', '站点名称'),
('site_slogan', '世代传承的荣耀', 'text', '站点标语'),
('site_description', '由基家族官方网站，记录家族历史，传承家族文化', 'text', '站点描述'),
('site_logo', '/uploads/logo.png', 'image', '站点Logo'),
('contact_email', 'contact@youjifamily.com', 'text', '联系邮箱'),
('contact_phone', '13800138000', 'text', '联系电话'),
('admin_email', 'admin@youjifamily.com', 'text', '管理员邮箱'),
('footer_text', '© 2026 由基家族. 保留所有权利.', 'text', '页脚文本'),
('family_creed', '团结、诚信、进取、创新', 'text', '家族宣言'),
('theme_color', '#1e3a5f', 'text', '主题颜色'),
('accent_color', '#c9a227', 'text', '强调颜色');

-- 插入家族成员（示例数据）
INSERT INTO `family_members` (`name`, `relation`, `generation`, `parent_id`, `spouse_id`, `birth_date`, `avatar`, `bio`, `status`) VALUES
('由基始祖', '家族创始人', 1, NULL, NULL, '1900-01-01', '/uploads/avatars/ancestor.png', '由基家族的创始人，建立了家族的基础和传统。', 'deceased'),
('由基一郎', '长子', 2, 1, NULL, '1920-01-01', '/uploads/avatars/一郎.png', '家族第二代长子，继承了家族事业。', 'deceased'),
('由基次郎', '次子', 2, 1, NULL, '1925-01-01', '/uploads/avatars/次郎.png', '家族第二代次子，在学术领域有卓越成就。', 'deceased'),
('由基花子', '长女', 2, 1, NULL, '1930-01-01', '/uploads/avatars/花子.png', '家族第二代长女，在艺术领域有杰出贡献。', 'deceased'),
('由基三郎', '长孙', 3, 2, NULL, '1945-01-01', '/uploads/avatars/三郎.png', '家族第三代长孙，现任家族族长。', 'active'),
('由基四郎', '次孙', 3, 2, NULL, '1950-01-01', '/uploads/avatars/四郎.png', '家族第三代次孙，在商业领域取得成功。', 'active'),
('由基百合', '孙女', 3, 3, NULL, '1955-01-01', '/uploads/avatars/百合.png', '家族第三代孙女，在教育领域有突出贡献。', 'active'),
('由基太郎', '曾孙', 4, 5, NULL, '1970-01-01', '/uploads/avatars/太郎.png', '家族第四代长孙，年轻有为的家族成员。', 'active'),
('由基次郎', '曾孙', 4, 5, NULL, '1975-01-01', '/uploads/avatars/次郎2.png', '家族第四代次孙，在科技领域创业。', 'active'),
('由基樱', '曾孙女', 4, 6, NULL, '1980-01-01', '/uploads/avatars/樱.png', '家族第四代孙女，在医疗领域工作。', 'active');

-- 插入管理员账号（密码：admin123）
INSERT INTO `family_accounts` (`member_id`, `username`, `email`, `phone`, `password_hash`, `role`, `status`) VALUES
(5, 'admin', 'admin@youjifamily.com', '13800138000', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin', 'active');

-- 插入示例文章
INSERT INTO `family_articles` (`title`, `content`, `author_id`, `cover_image`, `category`, `tags`, `status`) VALUES
('由基家族的起源', '由基家族起源于20世纪初，由我们的始祖创立。经过几代人的努力，家族不断发展壮大，在各个领域都取得了卓越的成就。', 1, '/uploads/articles/origin.jpg', '家族历史', '起源,历史', 'published'),
('家族传统与价值观', '我们家族一直秉持着团结、诚信、进取、创新的价值观，这些价值观指导着我们家族成员的行为和决策。', 1, '/uploads/articles/values.jpg', '家族文化', '传统,价值观', 'published'),
('家族近期活动回顾', '近期，我们家族举办了一系列活动，包括家族聚会、慈善活动等，这些活动增强了家族成员之间的联系。', 1, '/uploads/articles/activities.jpg', '家族活动', '活动,聚会', 'published');

-- 插入示例公告
INSERT INTO `family_announcements` (`title`, `content`, `author_id`, `cover_image`, `priority`, `status`) VALUES
('家族年度聚会通知', '尊敬的家族成员，我们将于2026年春节期间举办家族年度聚会，具体时间和地点将另行通知。', 1, '/uploads/announcements/party.jpg', 5, 'active'),
('家族网站正式上线', '由基家族官方网站现已正式上线，欢迎家族成员访问并提供宝贵意见。', 1, '/uploads/announcements/website.jpg', 10, 'active');

-- 插入示例相册
INSERT INTO `family_albums` (`name`, `description`, `cover_image`, `created_by`, `status`) VALUES
('家族聚会', '家族成员聚会的照片集', '/uploads/albums/party_cover.jpg', 1, 'active'),
('家族历史', '家族历史照片和文档', '/uploads/albums/history_cover.jpg', 1, 'active'),
('家族活动', '家族各类活动的照片', '/uploads/albums/activities_cover.jpg', 1, 'active');

-- 插入示例留言
INSERT INTO `family_guestbook` (`author_name`, `author_email`, `content`, `status`) VALUES
('访客1', 'visitor1@example.com', '恭喜由基家族网站上线！网站设计非常精美，内容丰富。', 'approved'),
('访客2', 'visitor2@example.com', '希望能了解更多关于由基家族的历史和文化。', 'approved'),
('访客3', 'visitor3@example.com', '期待家族聚会的举办，希望能认识更多家族成员。', 'pending');

-- ==================== 创建索引 ====================

-- 家族成员表索引
CREATE INDEX idx_family_members_generation ON `family_members` (`generation`);
CREATE INDEX idx_family_members_parent_id ON `family_members` (`parent_id`);
CREATE INDEX idx_family_members_spouse_id ON `family_members` (`spouse_id`);
CREATE INDEX idx_family_members_status ON `family_members` (`status`);

-- 账号表索引
CREATE INDEX idx_family_accounts_member_id ON `family_accounts` (`member_id`);
CREATE INDEX idx_family_accounts_username ON `family_accounts` (`username`);
CREATE INDEX idx_family_accounts_email ON `family_accounts` (`email`);
CREATE INDEX idx_family_accounts_role ON `family_accounts` (`role`);
CREATE INDEX idx_family_accounts_status ON `family_accounts` (`status`);

-- 文章表索引
CREATE INDEX idx_family_articles_author_id ON `family_articles` (`author_id`);
CREATE INDEX idx_family_articles_category ON `family_articles` (`category`);
CREATE INDEX idx_family_articles_status ON `family_articles` (`status`);
CREATE INDEX idx_family_articles_created_at ON `family_articles` (`created_at`);

-- 公告表索引
CREATE INDEX idx_family_announcements_author_id ON `family_announcements` (`author_id`);
CREATE INDEX idx_family_announcements_priority ON `family_announcements` (`priority`);
CREATE INDEX idx_family_announcements_status ON `family_announcements` (`status`);

-- 相册表索引
CREATE INDEX idx_family_albums_created_by ON `family_albums` (`created_by`);
CREATE INDEX idx_family_albums_status ON `family_albums` (`status`);

-- 图片表索引
CREATE INDEX idx_family_images_album_id ON `family_images` (`album_id`);
CREATE INDEX idx_family_images_uploaded_by ON `family_images` (`uploaded_by`);

-- 留言板表索引
CREATE INDEX idx_family_guestbook_member_id ON `family_guestbook` (`member_id`);
CREATE INDEX idx_family_guestbook_status ON `family_guestbook` (`status`);
CREATE INDEX idx_family_guestbook_created_at ON `family_guestbook` (`created_at`);

-- 备份表索引
CREATE INDEX idx_family_backups_created_by ON `family_backups` (`created_by`);
CREATE INDEX idx_family_backups_status ON `family_backups` (`status`);
CREATE INDEX idx_family_backups_created_at ON `family_backups` (`created_at`);

-- ==================== 数据库初始化完成 ====================

-- 显示创建结果
SELECT '数据库初始化完成！' AS result;
SELECT '创建的表数量：' AS description, COUNT(*) AS count FROM information_schema.tables WHERE table_schema = 'youji_family';
SELECT '插入的配置数量：' AS description, COUNT(*) AS count FROM `family_configs`;
SELECT '插入的成员数量：' AS description, COUNT(*) AS count FROM `family_members`;
SELECT '插入的账号数量：' AS description, COUNT(*) AS count FROM `family_accounts`;
SELECT '插入的文章数量：' AS description, COUNT(*) AS count FROM `family_articles`;
SELECT '插入的公告数量：' AS description, COUNT(*) AS count FROM `family_announcements`;
SELECT '插入的相册数量：' AS description, COUNT(*) AS count FROM `family_albums`;
SELECT '插入的留言数量：' AS description, COUNT(*) AS count FROM `family_guestbook`;