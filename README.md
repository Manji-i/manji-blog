# Manji Blog

> 线上地址：https://manji.pro/
> 仓库：https://github.com/Manji-i/manji-blog

Manji Blog 是一个个人博客 CMS，承载「长文章」和「随想」两条内容主线。前台用于阅读，后台用于写作、发布、配置站点和管理内容。

## 功能

- 前台：首页、文章列表、文章详情、随想、关于页
- 后台：登录、仪表盘、文章管理、随想管理、分类管理、网站设置
- 写作：文章和随想都支持 Markdown，文章支持摘要和图片插入
- 上传：图片上传到后端 `/uploads`
- 响应式：适配桌面端、移动端、微信/飞书内置浏览器

## 技术栈

- 前端：React 18 + TypeScript + Vite + Tailwind CSS + React Router + Zustand + Axios
- 后端：Node.js + Express + SQLite + JWT + Multer
- 部署：Nginx + PM2，后端用 `tsx` 直接运行 TypeScript

## 本地开发

```bash
npm install
npm run dev
```

- 前端开发服务：http://localhost:5173
- 后端 API：http://localhost:3001
- Vite 会把 `/api` 和 `/uploads` 代理到后端

常用命令：

```bash
npm run client:dev    # 仅启动前端
npm run server:dev    # 仅启动后端
npm test              # 安全回归测试
npm run check         # TypeScript 检查
npm run build         # 生产构建
npm run lint          # ESLint
```

## 部署

日常上线使用本地脚本：

```bash
bash deploy.local.sh
```

`deploy.local.sh` 不入 git。它会构建前端、同步 `dist/`、用 `rsync` 同步整个 `api/` 目录，并排除线上数据库和上传文件：

- 排除：`api/database/`
- 排除：`api/uploads/`

不要用 `deploy.sh` 作为当前真实上线流程；它是公开模板，不代表当前服务器的完整同步策略。

更多运维细节见 [DEPLOY.md](./DEPLOY.md)。

## 版本记录

版本演进和发布记录见 [版本修订.md](./版本修订.md)。每次功能上线或修复发布后，需要同步更新版本记录。
