# Manji Blog 部署与运维手册

本文档记录当前线上环境的真实部署方式。首次迁移或灾备恢复见 [DEPLOY_MANUAL.md](./DEPLOY_MANUAL.md)。

## 当前线上环境

- 线上地址：https://manji.pro/
- 备用地址：http://14.103.45.4/
- 服务器：`root@14.103.45.4`
- 部署目录：`/blog`
- 前端目录：`/blog/dist`
- 后端目录：`/blog/api`
- 数据库：`/blog/api/database/blog.db`
- 上传目录：`/blog/api/uploads`
- PM2 进程：`blog-server`
- 后端端口：`3001`
- Nginx：监听 80/443，HTTP 自动跳转 HTTPS，代理 `/api` 到 `http://localhost:3001`

## 日常上线

在本机项目根目录执行：

```bash
bash deploy.local.sh
```

脚本会执行：

1. `npm run build`
2. `rsync --delete dist/` 到 `/blog/dist/`
3. `rsync api/` 到 `/blog/api/`
4. 同步 `ecosystem.config.cjs` 和 `nginx.conf`
5. 远端执行 `nginx -t && nginx -s reload`
6. 远端执行 `pm2 restart blog-server`

后端同步会排除：

```text
api/database/
api/uploads/
```

这两个目录保存线上数据，不能被本地文件覆盖。

## 不要使用的旧流程

- 不要用逐文件 `scp` 清单部署后端；新增路由或中间件时容易漏传。
- 不要把 `/blog/api/database/blog.db` 从本地覆盖到线上。
- 不要把 `/blog/api/uploads/` 从本地覆盖到线上。
- 不要把 `deploy.sh` 当作当前真实生产部署脚本；它只是公开模板。

## 上线前检查

```bash
git status --short --branch
npm test
npm run check
npm run build
```

每次上线都要同步更新 [版本修订.md](./版本修订.md)。提交前只暂存本次变更文件，不使用 `git add .`。

## 上线后验证

```bash
curl https://manji.pro/api/health
curl -I https://manji.pro/
ssh root@14.103.45.4 "pm2 status"
```

预期：

- `/api/health` 返回 `{"success":true,"message":"Server is running"}`
- 首页 HTML 引用最新构建产物
- `blog-server` 状态为 `online`

## 常用服务器命令

```bash
# 服务状态
ssh root@14.103.45.4 "pm2 status"

# 服务日志
ssh root@14.103.45.4 "pm2 logs blog-server --lines 100"

# 重启后端
ssh root@14.103.45.4 "pm2 restart blog-server"

# 检查 Nginx
ssh root@14.103.45.4 "nginx -t"

# 重载 Nginx
ssh root@14.103.45.4 "nginx -s reload"
```

## HTTPS 证书

- 证书覆盖：`manji.pro`、`www.manji.pro`
- 证书目录：`/etc/letsencrypt/live/manji.pro/`
- 自动续期：`certbot.timer`

```bash
ssh root@14.103.45.4 "systemctl status certbot.timer"
ssh root@14.103.45.4 "certbot renew --dry-run"
```

## 数据操作

SQLite 数据库在服务器：

```text
/blog/api/database/blog.db
```

只改文章/随想日期等数据时，可以直接执行 SQL，不需要重启 PM2。

示例：

```bash
ssh root@14.103.45.4 "sqlite3 /blog/api/database/blog.db \"SELECT id,title,published_at FROM articles ORDER BY COALESCE(published_at, created_at) DESC LIMIT 10;\""
```

字段口径：

- 文章公开日期和排序优先看 `articles.published_at`，缺失时回退 `articles.created_at`
- 随想日期看 `thoughts.created_at`

## 备份建议

```bash
ssh root@14.103.45.4 "mkdir -p /backup/blog"
ssh root@14.103.45.4 "cp /blog/api/database/blog.db /backup/blog/blog-\$(date +%Y%m%d-%H%M%S).db"
ssh root@14.103.45.4 "rsync -a /blog/api/uploads/ /backup/blog/uploads/"
```

## 故障排查

### 首页没变化

1. 确认线上首页引用的新资产：
   ```bash
   curl -sS -L -H 'Cache-Control: no-cache' https://manji.pro/
   ```
2. 确认构建资产存在：
   ```bash
   ssh root@14.103.45.4 "ls -la /blog/dist/assets | tail"
   ```
3. 如果 HTML 已更新但浏览器没变化，强刷新或清缓存。

### API 不通

```bash
curl https://manji.pro/api/health
ssh root@14.103.45.4 "pm2 logs blog-server --lines 100"
ssh root@14.103.45.4 "ss -tlnp | grep 3001"
```

### 上传失败

检查 Nginx 上传限制和目录权限：

```bash
ssh root@14.103.45.4 "grep client_max_body_size /blog/nginx.conf /etc/nginx/sites-available/blog"
ssh root@14.103.45.4 "ls -ld /blog/api/uploads"
```
