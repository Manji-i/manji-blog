# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目定位

Manji Blog 是博主个人博客系统，承载长文章 + 随想两条内容主线。

- **GitHub**：https://github.com/Manji-i/manji-blog
- **线上**：https://manji.pro/
- **服务器**：`root@14.103.45.4`，部署目录 `/blog`
- **HTTPS**：Let's Encrypt 证书覆盖 `manji.pro` / `www.manji.pro`，证书目录 `/etc/letsencrypt/live/manji.pro/`，由 `certbot.timer` 自动续期

## 技术栈

- 前端：React 18 + TypeScript + Vite + Tailwind + React Router 7 + Zustand + Axios
- 后端：Node.js + Express + SQLite（WAL 模式）+ JWT + Multer
- 部署：Nginx + PM2（`tsx` 直接跑 TS，不编译）

## 常用命令

```bash
npm run dev           # 同时启动前后端（concurrently）
npm run server:dev    # 仅启动后端（nodemon + tsx）
npm run client:dev    # 仅启动前端（Vite，端口 5173）
npm run build         # 构建（tsc -b && vite build）
npm test              # 安全回归测试
npm run check         # 仅类型检查（tsc --noEmit）
npm run lint          # ESLint
```

后端端口 3001，前端 5173；Vite 代理 `/api` 和 `/uploads` 到后端。

## 管理员账号

- 生产环境没有默认管理员账号或默认密码，禁止在代码、文档和前端页面中公开凭据。
- 只有同时显式提供 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD_HASH` 时，启动流程才会初始化管理员。
- 线上账号变更先备份数据库，再按邮箱精确操作并验证内容归属；不要把密码或哈希写入 Git。

## 数据库

- 位置：`api/database/blog.db`（不入 git）
- 表结构在 `api/database.ts` 的 `initDatabase()` 里集中定义，新增字段需在 `migrateDatabase()` 里加迁移
- 启动时会自动建表并写入缺失的默认设置；管理员只在显式配置初始化凭据时创建

## 上传

- 用户上传图片存到 `api/uploads/`（不入 git，自动创建）
- 后端通过 `express.static` 暴露 `/uploads/*`
- Vite dev server 必须代理 `/uploads` 才能在前端访问

## 部署流程

⚠️ **每次上线必须三件套同步**：

1. **代码 commit + push**
   - `git config user.email` 必须是 `wangxun417@gmail.com`，否则 GitHub 不会算贡献
2. **部署到服务器**：`bash deploy.local.sh`
   - 脚本会构建前端 → rsync `dist/` → rsync 后端 `api/`（排除 `database/`、`uploads/`，绝不覆盖线上 blog.db）→ 远端 PM2 重启 + nginx reload
   - 后端用 rsync 整目录同步，新增/修改 `api/**/*.ts` 自动上线，无需手动维护文件清单
   - SSH 已配置免密登录，部署可在对话中直接执行
3. **更新 `版本修订.md`**
   - 在「版本时间线」表格加一行
   - 文末追加新版本完整章节（版本目标 / 主要调整 / 关键问题 / 解决方案 / 阶段结果）
   - 更新「当前版本号」段落
   - 版本号规则：新功能 minor 升（v1.x.0），修复 patch 升（v1.x.y）

## 服务器日常操作

SSH 免密已配好，以下操作可直接在对话中完成，无需用户手动输入密码：

- **查数据库**：`ssh root@14.103.45.4 "sqlite3 /blog/api/database/blog.db '<SQL>'"`
- **改数据**：直接 UPDATE 即可，SQLite 直读、无需重启（改完让用户硬刷新页面验证）；仅改了后端代码才需 `pm2 restart blog-server`
- **重启服务**：`ssh root@14.103.45.4 "pm2 restart blog-server"`
- **查看服务状态**：`ssh root@14.103.45.4 "pm2 status"`
- **检查证书续期**：`ssh root@14.103.45.4 "certbot renew --dry-run"`

## 关键约定

- 中文沟通、中文 commit message
- 不要修改 `deploy.sh`（公开模板）；只改 `deploy.local.sh`（本地、`.gitignore` 已排除）
- 不要把 `api/database/*.db` 或 `api/uploads/` 入 git
- 不要把 root 密码贴到对话里，部署用 SSH key 或在用户终端跑
