# 由基家族网站系统

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/youji-family)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

由基家族网站系统是一个面向“家族文化传承与数字化记录”的综合网站，融合前台展示与后台管理能力，支持家族成员信息沉淀、内容发布与互动沟通。

## 网站介绍

该系统以“家族档案数字化”为核心目标，提供以下完整体验：

- 面向访客与家族成员的前台门户
- 面向管理员的内容与数据管理后台
- 支持家族文化长期积累的结构化信息系统

## 核心功能

### 前台网站
- 响应式浏览体验（PC / 移动端）
- 家族成员展示与族谱查看
- 家族文章阅读
- 家族相册浏览
- 公告查看
- 留言互动

### 管理后台
- 管理员登录认证
- 成员管理（增删改查、关系维护）
- 文章管理
- 公告管理
- 相册管理
- 留言审核
- 站点配置管理
- 注册申请审核（管理员通过后开通账号）

## 技术架构概览

- 前台：React + Vite + Tailwind CSS
- 后台：React + Vite + Ant Design
- 后端：Node.js + Express
- 数据库：PostgreSQL
- 缓存/扩展：Redis（规划中）

## 项目结构

```text
youji-family/
├── frontend/             # 前台展示网站
├── admin/                # 管理后台
├── backend/              # 后端 API
├── docs/                 # 项目文档
├── sql/                  # 数据库脚本
├── docker/               # 容器相关配置
└── README.md
```

## 文档索引

- [系统架构设计](docs/01-系统架构.md)
- [数据库设计](docs/02-数据库设计.md)
- [API接口文档](docs/04-API接口文档.md)
- [后台使用手册](docs/05-后台使用手册.md)
- [技术架构与实现路线规划](docs/07-技术架构与实现路线规划.md)

## 页面截图

![控制台](screenshots/dashboard.png)
![成员管理](screenshots/members.png)
![文章管理](screenshots/articles.png)

## 联系方式

- 项目主页: https://github.com/yourusername/youji-family
- 问题反馈: https://github.com/yourusername/youji-family/issues
