# 博客系统部署指南

## 火山云ECS服务器部署步骤

### 1. 服务器环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2
sudo npm install -g pm2 tsx

# 安装 Nginx
sudo apt install -y nginx

# 安装 Certbot (用于SSL证书)
sudo apt install -y certbot python3-certbot-nginx
```

### 2. 项目部署

```bash
# 创建项目目录
sudo mkdir -p /blog
sudo chown -R $USER:$USER /blog

# 克隆或上传项目代码到 /blog 目录
cd /blog

# 安装依赖
npm install

# 创建必要目录
mkdir -p api/uploads api/database logs

# 构建前端
npm run build

# 使用 PM2 启动后端
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save
pm2 startup
```

### 3. Nginx 配置

```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/blog

# 编辑配置文件，替换 your-domain.com 为你的域名
sudo nano /etc/nginx/sites-available/blog

# 创建软链接
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/

# 删除默认配置
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. SSL 证书配置

```bash
# 申请证书 (替换 your-domain.com 为你的域名)
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

### 5. 更新 Nginx 配置启用 SSL

编辑 `/etc/nginx/sites-available/blog`，取消 SSL 相关配置的注释：

```nginx
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

然后重启 Nginx：

```bash
sudo systemctl restart nginx
```

### 6. 防火墙配置

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 'Nginx Full'

# 允许 SSH
sudo ufw allow OpenSSH

# 启用防火墙
sudo ufw enable
```

### 7. 日常维护命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs blog-server

# 重启应用
pm2 restart blog-server

# 更新代码后重新构建
cd /blog
git pull
npm install
npm run build
pm2 restart blog-server

# 备份数据库
cp /blog/api/database/blog.db /backup/blog-$(date +%Y%m%d).db

# 备份上传文件
rsync -avz /blog/api/uploads/ /backup/uploads/
```

### 8. 目录结构

```
/blog/
├── api/                    # 后端代码
│   ├── database/          # SQLite 数据库
│   ├── uploads/           # 上传的文件
│   ├── middleware/        # 中间件
│   ├── routes/            # API 路由
│   ├── app.ts             # Express 应用
│   ├── database.ts        # 数据库配置
│   └── server.ts          # 服务器入口
├── dist/                  # 前端构建产物
├── logs/                  # 日志文件
├── nginx.conf             # Nginx 配置
├── ecosystem.config.js    # PM2 配置
└── package.json
```

### 9. 默认登录信息

- 邮箱: wangxun417@foxmail.com
- 密码: sj2kv1t5

**注意**: 首次登录后请立即修改密码！

### 10. 故障排查

```bash
# 检查应用日志
pm2 logs blog-server

# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查端口占用
sudo netstat -tlnp | grep 3000

# 测试 API 是否运行
curl http://localhost:3000/api/health
```
