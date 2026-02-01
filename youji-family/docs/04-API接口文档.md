# 由基家族网站系统 - API接口文档

## 接口基础信息

- **基础URL**: `http://your-domain.com/api`
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证方式

### JWT Token认证

需要在请求头中添加：
```
Authorization: Bearer <your_token>
```

## 响应格式

### 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息"
}
```

## 公开接口（无需认证）

### 站点配置

#### 获取站点配置
```
GET /configs
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "site_name": "由基家族",
    "site_logo": "/uploads/logo.png",
    "site_description": "...",
    "footer_copyright": "© 2024 由基家族"
  }
}
```

### 家族成员

#### 获取成员列表
```
GET /members?page=1&limit=10&generation=1
```

**参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页数量，默认10 |
| generation | int | 否 | 按代数筛选 |
| keyword | string | 否 | 关键词搜索 |

**响应示例：**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

#### 获取成员详情
```
GET /members/:id
```

#### 获取家族树
```
GET /members/tree
```

### 文章

#### 获取文章列表
```
GET /articles?page=1&limit=10&category=家族历史
```

#### 获取文章详情
```
GET /articles/:id
```

### 公告

#### 获取公告列表
```
GET /announcements?page=1&limit=10
```

#### 获取公告详情
```
GET /announcements/:id
```

### 相册

#### 获取相册列表
```
GET /albums?page=1&limit=10
```

#### 获取相册详情
```
GET /albums/:id
```

### 留言板

#### 获取留言列表
```
GET /guestbook?page=1&limit=10
```

#### 提交留言
```
POST /guestbook
```

**请求体：**
```json
{
  "author_name": "访客",
  "content": "留言内容"
}
```

## 管理员接口（需要管理员Token）

### 认证

#### 管理员登录
```
POST /auth/admin/login
```

**请求体：**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "super_admin"
    }
  }
}
```

#### 获取管理员信息
```
GET /auth/admin/profile
```

#### 修改密码
```
PUT /auth/admin/password
```

**请求体：**
```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

### 配置管理

#### 获取所有配置
```
GET /admin/configs
```

#### 获取单个配置
```
GET /admin/configs/:key
```

#### 批量更新配置
```
PUT /admin/configs
```

**请求体：**
```json
{
  "site_name": "新名称",
  "site_description": "新描述"
}
```

#### 更新单个配置
```
PUT /admin/configs/:key
```

**请求体：**
```json
{
  "value": "配置值"
}
```

### 成员管理

#### 创建成员
```
POST /admin/members
```

**请求体：**
```json
{
  "name": "成员姓名",
  "avatar": "/uploads/avatar.jpg",
  "birth_date": "1990-01-01",
  "bio": "个人简介",
  "generation": 2,
  "gender": "male",
  "phone": "13800138000",
  "email": "member@example.com",
  "address": "居住地址",
  "parents": [1, 2],
  "spouses": [3]
}
```

#### 更新成员
```
PUT /admin/members/:id
```

#### 删除成员
```
DELETE /admin/members/:id
```

#### 创建成员账号
```
POST /admin/members/:id/account
```

**请求体：**
```json
{
  "username": "member001",
  "password": "password123",
  "email": "member@example.com"
}
```

### 文章管理

#### 创建文章
```
POST /admin/articles
```

**请求体：**
```json
{
  "title": "文章标题",
  "content": "<p>文章内容（支持HTML）</p>",
  "cover_image": "/uploads/cover.jpg",
  "summary": "文章摘要",
  "category": "家族历史",
  "is_published": 1,
  "published_at": "2024-01-01 00:00:00"
}
```

#### 更新文章
```
PUT /admin/articles/:id
```

#### 删除文章
```
DELETE /admin/articles/:id
```

### 公告管理

#### 创建公告
```
POST /admin/announcements
```

**请求体：**
```json
{
  "title": "公告标题",
  "content": "公告内容",
  "is_pinned": 1,
  "is_published": 1
}
```

#### 更新公告
```
PUT /admin/announcements/:id
```

#### 删除公告
```
DELETE /admin/announcements/:id
```

### 相册管理

#### 创建相册
```
POST /admin/albums
```

**请求体：**
```json
{
  "name": "相册名称",
  "description": "相册描述",
  "cover_image": "/uploads/cover.jpg",
  "is_public": 1
}
```

#### 更新相册
```
PUT /admin/albums/:id
```

#### 删除相册
```
DELETE /admin/albums/:id
```

#### 添加图片
```
POST /admin/albums/:id/images
```

**请求体：**
```json
{
  "image_path": "/uploads/albums/image.jpg",
  "caption": "图片说明"
}
```

#### 更新图片
```
PUT /admin/albums/images/:imageId
```

#### 删除图片
```
DELETE /admin/albums/images/:imageId
```

### 留言管理

#### 获取所有留言
```
GET /admin/guestbook?page=1&limit=10&isApproved=0
```

#### 审核留言
```
PUT /admin/guestbook/:id/approve
```

**请求体：**
```json
{
  "is_approved": 1
}
```

#### 回复留言
```
PUT /admin/guestbook/:id/reply
```

**请求体：**
```json
{
  "reply_content": "回复内容"
}
```

#### 删除留言
```
DELETE /admin/guestbook/:id
```

### 文件上传

#### 上传单张图片
```
POST /admin/upload/image
```

**Content-Type**: `multipart/form-data`

**参数：**
| 参数名 | 类型 | 说明 |
|--------|------|------|
| image | File | 图片文件 |

**响应示例：**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/images/xxx.jpg",
    "filename": "xxx.jpg",
    "size": 1024000
  }
}
```

#### 上传多张图片
```
POST /admin/upload/images
```

**Content-Type**: `multipart/form-data`

**参数：**
| 参数名 | 类型 | 说明 |
|--------|------|------|
| images | File[] | 图片文件数组，最多10张 |

## 成员接口（需要成员Token）

### 认证

#### 成员登录
```
POST /auth/member/login
```

**请求体：**
```json
{
  "username": "member001",
  "password": "password123"
}
```

#### 获取成员信息
```
GET /auth/member/profile
```

## 错误码说明

| HTTP状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，Token无效或过期 |
| 403 | 无权访问 |
| 404 | 资源不存在 |
| 409 | 数据冲突（如重复） |
| 500 | 服务器内部错误 |

## 分页参数说明

所有列表接口都支持分页：

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| page | int | 1 | 当前页码 |
| limit | int | 10 | 每页数量，最大100 |

分页响应格式：
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```
