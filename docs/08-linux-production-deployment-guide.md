# 由基家族网站系统 Linux 生产部署指南

本文档基于当前仓库结构整理，适用于 `Ubuntu 22.04/24.04`、`Debian 12` 一类 Linux 服务器。

推荐生产方案：

- `PostgreSQL` 负责数据库
- `Node.js + PM2` 运行后端 API
- `Nginx` 托管前台与后台静态文件，并反向代理 `/api`
- 前台与后台在服务器上构建，输出 `dist`

不推荐直接照搬仓库当前的 Docker Compose 文件，原因如下：

- [docker/docker-compose.yml](/C:/Users/wangs/Documents/由基家族/youji-family/docker/docker-compose.yml) 依赖 `nginx.conf`
- 当前仓库里没有对应的 `docker/nginx.conf`
- 因此 Docker 方案并不是开箱即用

如果你后续需要，我可以再单独补一版可直接运行的 Docker 部署方案。

## 1. 服务器要求

- CPU：2 核以上
- 内存：4 GB 以上
- 磁盘：40 GB 以上
- 系统：Ubuntu 22.04+ / Debian 12+
- 网络：放通 `80`、`443`、`22`
- 域名：建议准备一个域名，便于配置 HTTPS

## 2. 项目结构

仓库主要目录：

- `frontend/`：前台站点
- `admin/`：后台管理界面
- `backend/`：后端 API
- `sql/init_postgres.sql`：PostgreSQL 初始化脚本
- `backend/uploads/`：上传文件目录

## 3. 安装系统依赖

先更新系统并安装基础软件：

```bash
sudo apt update
sudo apt install -y git curl nginx postgresql postgresql-contrib
```

安装 Node.js 20：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

安装 PM2：

```bash
sudo npm install -g pm2
```

检查版本：

```bash
node -v
npm -v
nginx -v
psql --version
pm2 -v
```

## 4. 上传代码

建议部署目录：

```bash
/var/www/youji-family
```

创建目录并授权：

```bash
sudo mkdir -p /var/www/youji-family
sudo chown -R $USER:$USER /var/www/youji-family
cd /var/www/youji-family
```

如果使用 Git：

```bash
git clone <你的仓库地址> .
```

如果不是 Git，就把本地项目完整上传到 `/var/www/youji-family`。

## 5. 初始化 PostgreSQL

进入 PostgreSQL：

```bash
sudo -u postgres psql
```

创建数据库和用户：

```sql
CREATE DATABASE youji_family;
CREATE USER youji_user WITH PASSWORD '请替换为强密码';
GRANT ALL PRIVILEGES ON DATABASE youji_family TO youji_user;
\q
```

导入初始化脚本：

```bash
psql -h 127.0.0.1 -U youji_user -d youji_family -f /var/www/youji-family/sql/init_postgres.sql
```

如果该命令因为权限失败，可以改用：

```bash
sudo -u postgres psql -d youji_family -f /var/www/youji-family/sql/init_postgres.sql
```

## 6. 配置后端环境变量

安装后端依赖：

```bash
cd /var/www/youji-family/backend
npm install
```

参考 [backend/.env.example](/C:/Users/wangs/Documents/由基家族/youji-family/backend/.env.example) 创建生产环境文件：

```bash
cp .env.example .env
nano .env
```

建议内容如下：

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=youji_family
DB_USER=youji_user
DB_PASSWORD=请替换为数据库密码

JWT_SECRET=请替换为足够长的随机字符串
JWT_EXPIRES_IN=7d

PORT=8080
NODE_ENV=production

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

SITE_NAME=由基家族
SITE_URL=https://你的域名

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@your-domain.com
```

说明：

- 当前后端数据库连接配置在 [backend/src/config/database.js](/C:/Users/wangs/Documents/由基家族/youji-family/backend/src/config/database.js)
- 后端默认监听 `8080`
- 初始化脚本会创建默认管理员 `admin / admin123`
- 上线后应第一时间修改管理员密码

## 7. 创建上传目录

执行：

```bash
mkdir -p /var/www/youji-family/backend/uploads
mkdir -p /var/www/youji-family/backend/uploads/avatars
mkdir -p /var/www/youji-family/backend/uploads/covers
mkdir -p /var/www/youji-family/backend/uploads/albums
mkdir -p /var/www/youji-family/backend/uploads/images
```

如需限制权限：

```bash
chmod -R 755 /var/www/youji-family/backend/uploads
```

## 8. 本地验证后端

先手工启动一次，确认数据库和环境变量无误：

```bash
cd /var/www/youji-family/backend
node src/app.js
```

成功后会看到类似：

- 数据库连接成功
- 服务监听在 `http://localhost:8080`

然后中断：

```bash
Ctrl + C
```

## 9. 用 PM2 托管后端

启动：

```bash
cd /var/www/youji-family/backend
pm2 start src/app.js --name youji-backend
```

保存 PM2 配置：

```bash
pm2 save
pm2 startup
```

查看状态与日志：

```bash
pm2 status
pm2 logs youji-backend
```

## 10. 构建前台

安装并构建前台：

```bash
cd /var/www/youji-family/frontend
npm install
npm run build
```

当前前台构建命令来自 [frontend/package.json](/C:/Users/wangs/Documents/由基家族/youji-family/frontend/package.json)。

构建产物目录：

```bash
/var/www/youji-family/frontend/dist
```

## 11. 构建后台

安装并构建后台：

```bash
cd /var/www/youji-family/admin
npm install
npm run build
```

当前后台构建命令来自 [admin/package.json](/C:/Users/wangs/Documents/由基家族/youji-family/admin/package.json)。

构建产物目录：

```bash
/var/www/youji-family/admin/dist
```

## 12. 配置 Nginx

创建配置文件：

```bash
sudo nano /etc/nginx/sites-available/youji-family
```

写入以下内容：

```nginx
server {
    listen 80;
    server_name 你的域名;

    client_max_body_size 20m;

    root /var/www/youji-family/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /admin/ {
        alias /var/www/youji-family/admin/dist/;
        try_files $uri $uri/ /admin/index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /var/www/youji-family/backend/uploads/;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/youji-family /etc/nginx/sites-enabled/youji-family
```

如果默认站点冲突，移除它：

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

检查配置并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 13. 配置 HTTPS

安装 Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
```

申请证书：

```bash
sudo certbot --nginx -d 你的域名
```

自动续期检查：

```bash
sudo certbot renew --dry-run
```

完成后，站点通常会自动切换到 HTTPS。

## 14. 部署后检查

检查后端健康接口：

```bash
curl http://127.0.0.1:8080/health
```

检查 PM2：

```bash
pm2 status
```

检查 Nginx：

```bash
sudo systemctl status nginx
```

浏览器访问：

- 前台：`https://你的域名/`
- 后台：`https://你的域名/admin/`

默认后台账号：

- 用户名：`admin`
- 密码：`admin123`

上线后立即改密码。

## 15. 更新部署流程

以后每次更新代码，执行：

```bash
cd /var/www/youji-family
git pull

cd backend
npm install

cd ../frontend
npm install
npm run build

cd ../admin
npm install
npm run build

pm2 restart youji-backend
sudo systemctl reload nginx
```

## 16. 备份建议

建议每天备份数据库和上传目录。

数据库备份：

```bash
pg_dump -h 127.0.0.1 -U youji_user -d youji_family > /backup/youji_family_$(date +%F).sql
```

上传目录备份：

```bash
tar -czf /backup/youji_uploads_$(date +%F).tar.gz /var/www/youji-family/backend/uploads
```

可以用 `cron` 定时执行。

## 17. 常见问题

### 17.1 后台页面空白

优先检查：

- Nginx `/admin/` 配置是否正确
- `admin/dist` 是否存在
- 后台静态资源是否返回 `200`

### 17.2 `/api` 请求失败

优先检查：

- `pm2 status`
- `pm2 logs youji-backend`
- Nginx 的 `/api/` 反代配置
- `.env` 中数据库配置是否正确

### 17.3 图片上传后无法访问

优先检查：

- `backend/uploads/` 是否存在
- Nginx 的 `/uploads/` 是否正确指向上传目录
- 上传目录权限是否正确

### 17.4 数据库连接失败

优先检查：

- PostgreSQL 是否在运行
- `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` 是否与实际一致
- 初始化脚本是否已经导入

### 17.5 后台能打开但登录失败

优先检查：

- 初始化脚本是否成功导入
- `admins` 表中是否有默认管理员
- 后端日志里是否有数据库或 JWT 错误

## 18. 可选优化

如果后续要继续上线优化，建议补这几项：

- 增加 `pm2 ecosystem.config.js`
- 增加专用生产环境 `nginx` 配置模板
- 增加数据库迁移脚本，而不是只依赖初始化 SQL
- 补一版完整可运行的 Docker 生产方案

## 19. 本文档对应文件

本文档覆盖的关键配置文件：

- [backend/.env.example](/C:/Users/wangs/Documents/由基家族/youji-family/backend/.env.example)
- [backend/package.json](/C:/Users/wangs/Documents/由基家族/youji-family/backend/package.json)
- [frontend/package.json](/C:/Users/wangs/Documents/由基家族/youji-family/frontend/package.json)
- [admin/package.json](/C:/Users/wangs/Documents/由基家族/youji-family/admin/package.json)
- [backend/src/config/database.js](/C:/Users/wangs/Documents/由基家族/youji-family/backend/src/config/database.js)
- [sql/init_postgres.sql](/C:/Users/wangs/Documents/由基家族/youji-family/sql/init_postgres.sql)
- [docker/docker-compose.yml](/C:/Users/wangs/Documents/由基家族/youji-family/docker/docker-compose.yml)
