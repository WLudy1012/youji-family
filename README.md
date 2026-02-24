# 由基家族网站系统

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/youji-family)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

一个完整的家族网站系统，包含前台展示、管理后台、家族成员管理、文章发布、相册管理、留言板等功能。

## 功能特性

- 🏠 **前台展示网站**
  - 响应式设计，支持PC/移动端
  - 家族成员展示和族谱查看
  - 家族文章阅读
  - 相册浏览
  - 公告查看
  - 留言板

- 🔐 **管理后台**
  - 管理员登录认证
  - 成员管理（CRUD、关系维护）
  - 文章管理
  - 公告管理
  - 相册管理
  - 留言审核
  - 站点配置

- 💾 **数据库**
  - PostgreSQL关系型数据库
  - 完整的表结构设计
  - 支持数据备份/恢复

- 🚀 **部署方式**
  - Docker一键部署
  - 裸机部署
  - 支持SSL/HTTPS

## 技术栈

- **后端**: Node.js + Express + PostgreSQL
- **前台**: React + Vite + Tailwind CSS
- **后台**: React + Ant Design
- **部署**: Docker + Nginx

## 快速开始

### 方式一：Docker部署（推荐）

```bash
# 1. 克隆代码
git clone https://github.com/yourusername/youji-family.git
cd youji-family

# 2. 配置环境变量
cd docker
cp .env.example .env
# 编辑 .env 文件，修改数据库密码等配置

# 3. 启动服务
docker-compose up -d

# 4. 访问网站
# 前台: http://localhost
# 后台: http://localhost/admin
# 默认账号: admin / admin123
```

### 方式二：本地开发

```bash
# 1. 启动数据库
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16

# 2. 导入数据库
psql -h localhost -U postgres -d youji_family -f sql/init_postgres.sql

# 3. 启动后端
cd backend
cp .env.example .env
npm install
npm run dev

# 4. 启动前台
cd frontend
npm install
npm run dev

# 5. 启动后台
cd admin
npm install
npm run dev
```

## 项目结构

```
youji-family/
├── backend/              # 后端API
│   ├── src/
│   │   ├── config/       # 配置文件
│   │   ├── controllers/  # 控制器
│   │   ├── middleware/   # 中间件
│   │   ├── routes/       # 路由
│   │   └── utils/        # 工具函数
│   └── package.json
├── frontend/             # 前台展示网站
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   └── services/     # API服务
│   └── package.json
├── admin/                # 管理后台
│   ├── src/
│   │   └── pages/        # 页面
│   └── package.json
├── docker/               # Docker配置
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── nginx.conf
├── sql/                  # 数据库脚本
│   └── init.sql
└── docs/                 # 文档
    ├── 01-系统架构.md
    ├── 02-数据库设计.md
    ├── 03-部署指南.md
    ├── 04-API接口文档.md
    └── 05-后台使用手册.md
```

## 文档

- [系统架构设计](docs/01-系统架构.md)
- [数据库设计](docs/02-数据库设计.md)
- [部署指南](docs/03-部署指南.md)
- [API接口文档](docs/04-API接口文档.md)
- [后台使用手册](docs/05-后台使用手册.md)
- [技术架构与实现路线规划](docs/07-技术架构与实现路线规划.md)

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | admin123 |

**⚠️ 首次登录后请立即修改默认密码！**

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| DB_HOST | 数据库主机 | localhost |
| DB_PORT | 数据库端口 | 5432 |
| DB_NAME | 数据库名 | youji_family |
| DB_USER | 数据库用户 | postgres |
| DB_PASSWORD | 数据库密码 | - |
| JWT_SECRET | JWT密钥 | - |
| PORT | 后端端口 | 8080 |

## 截图

![控制台](screenshots/dashboard.png)
![成员管理](screenshots/members.png)
![文章管理](screenshots/articles.png)

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

- 项目主页: https://github.com/yourusername/youji-family
- 问题反馈: https://github.com/yourusername/youji-family/issues
