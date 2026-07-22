# Manji Blog 首次部署 / 灾备恢复指南

> 日常上线不要使用本文档。日常上线只执行 `bash deploy.local.sh`，见 [DEPLOY.md](./DEPLOY.md)。本文档用于新服务器初始化、灾备恢复或完全迁移。

## 一、准备工作

### 1. 本地打包项目文件

在项目根目录执行：

```bash
# 确保项目已构建
npm run build

# 创建部署包目录
mkdir -p deploy/blog

# 复制必要文件
cp -r api deploy/blog/
cp -r dist deploy/blog/
cp package.json deploy/blog/
cp package-lock.json deploy/blog/
cp ecosystem.config.cjs deploy/blog/
cp nginx.conf deploy/blog/
cp DEPLOY.md deploy/blog/

# 打包
cd deploy
tar -czvf blog.tar.gz blog/
```

### 2. 需要上传的文件清单

```
blog/
├── api/                    # 后端代码
│   ├── database/          # 数据库目录（空）
│   ├── middleware/        # 中间件
│   ├── routes/            # API 路由
│   ├── uploads/           # 上传文件目录（空）
│   ├── app.ts             # Express 应用
│   ├── database.ts        # 数据库配置
│   └── server.ts          # 服务器入口
├── dist/                   # 前端构建产物
├── package.json            # 依赖配置
├── package-lock.json       # 锁定依赖版本
├── ecosystem.config.cjs    # PM2 配置
└── nginx.conf              # Nginx 配置
```

---

## 二、服务器环境准备

### 1. 连接服务器

```bash
ssh root@你的服务器IP
```

### 2. 更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. 安装 Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v  # 应显示 v20.x.x
npm -v   # 应显示 10.x.x
```

### 4. 安装 PM2

```bash
sudo npm install -g pm2 tsx

# 验证安装
pm2 -v
```

### 5. 安装 Nginx

```bash
sudo apt install -y nginx

# 验证安装
nginx -v
```

### 6. 安装 Certbot（用于 SSL 证书）

```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 三、上传项目文件

### 方法 1：使用部署包

在本地终端执行：

```bash
# 上传部署包到服务器。灾备恢复时可用 scp；日常上线不要走这条路径
scp deploy/blog.tar.gz root@你的服务器IP:/root/

# 连接服务器解压
ssh root@你的服务器IP
cd /root
tar -xzvf blog.tar.gz
sudo mv blog /blog
```

### 方法 2：使用 SFTP 工具

使用 FileZilla、WinSCP 等工具上传 `blog.tar.gz` 到服务器 `/root/` 目录，然后 SSH 连接解压。

---

## 四、项目部署

### 1. 创建项目目录并设置权限

```bash
sudo mkdir -p /blog
sudo chown -R $USER:$USER /blog
```

### 2. 进入项目目录

```bash
cd /blog
```

### 3. 安装依赖

```bash
npm install
```

### 4. 创建必要目录

```bash
mkdir -p api/database api/uploads logs
```

### 5. 配置环境变量（可选）

```bash
# 编辑环境变量文件
nano /blog/.env
```

添加内容：
```
NODE_ENV=production
PORT=3001
JWT_SECRET=你的随机密钥（建议修改）
```

---

## 五、启动后端服务

### 1. 使用 PM2 启动

```bash
cd /blog
pm2 start ecosystem.config.cjs

# 查看状态
pm2 status

# 保存配置
pm2 save
pm2 startup
```

### 2. 测试后端是否运行

```bash
curl http://localhost:3001/api/health

# 应返回：{"success":true,"message":"Server is running"}
```

---

## 六、配置 Nginx

### 1. 复制配置文件

```bash
sudo cp /blog/nginx.conf /etc/nginx/sites-available/blog
```

### 2. 编辑配置文件，替换域名

```bash
sudo nano /etc/nginx/sites-available/blog
```

将 `your-domain.com` 替换为你的实际域名：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # ← 修改这里
    ...
}
```

### 3. 创建软链接

```bash
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
```

### 4. 删除默认配置

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 5. 测试配置并重启

```bash
# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 七、配置 SSL 证书（HTTPS）

### 1. 申请证书

```bash
# 替换 your-domain.com 为你的域名
sudo certbot --nginx -d your-domain.com

# 按提示操作：
# 1. 输入邮箱
# 2. 同意协议
# 3. 选择是否接收邮件
# 4. 选择重定向选项（建议选 2：强制 HTTPS）
```

### 2. 测试自动续期

```bash
sudo certbot renew --dry-run
```

### 3. 检查 Nginx 配置

Certbot 会自动修改 Nginx 配置添加 SSL，检查是否正常：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 八、防火墙配置

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 'Nginx Full'

# 允许 SSH
sudo ufw allow OpenSSH

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

---

## 九、验证部署

### 1. 访问网站

打开浏览器访问：
- HTTP: `http://你的域名`
- HTTPS: `https://你的域名`（配置 SSL 后）

### 2. 测试管理员登录

- 访问：`https://你的域名/admin/login`
- 使用部署时单独创建或恢复的管理员账号登录。
- 生产环境没有公开默认账号或默认密码；不要把凭据写进仓库、部署包或本文档。

### 3. 测试网站设置

登录后进入「网站设置」，修改博客名称等信息，查看前台是否更新。

---

## 十、日常维护

### 查看应用状态

```bash
pm2 status
pm2 logs blog-server
```

### 重启应用

```bash
pm2 restart blog-server
```

### 更新代码后重新部署

日常上线不要在服务器里 `git pull` 或手动覆盖文件。回到本地项目根目录执行：

```bash
bash deploy.local.sh
```

### 备份数据

```bash
# 备份数据库
cp /blog/api/database/blog.db /backup/blog-$(date +%Y%m%d).db

# 备份上传文件
rsync -avz /blog/api/uploads/ /backup/uploads/
```

---

## 十一、故障排查

### 1. 后端无法启动

```bash
# 查看日志
pm2 logs blog-server

# 检查端口占用
sudo ss -tlnp | grep 3001

# 手动测试启动
cd /blog
npx tsx api/server.ts
```

### 2. 前端无法访问

```bash
# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 检查 Nginx 配置
sudo nginx -t

# 检查 dist 目录是否存在
ls -la /blog/dist/
```

### 3. API 请求失败

```bash
# 测试 API
curl http://localhost:3001/api/health

# 检查后端日志
pm2 logs blog-server
```

### 4. 数据库权限问题

```bash
# 检查数据库目录权限
ls -la /blog/api/database/

# 修复权限
sudo chown -R $USER:$USER /blog/api/database/
chmod 755 /blog/api/database/
```

---

## 十二、安全建议

1. **使用独立 JWT 密钥**：生产密钥通过受控环境配置注入，不写入 Git
2. **禁止默认管理员**：管理员必须显式创建，登录页不展示任何账号密码
3. **定期备份**：设置定时任务自动备份数据库
4. **更新系统**：定期运行 `sudo apt update && sudo apt upgrade`
5. **监控日志**：使用 `pm2 logs` 定期查看应用日志
6. **防火墙**：只开放必要端口（80、443、22）

---

## 部署完成！

现在你的博客应该可以通过域名访问了。有任何问题请查看故障排查部分或检查日志。
