# Manji Blog

个人博客系统，支持文章发布、Markdown 编辑、图片上传、分类管理、关于页配置和移动端适配。

## 技术栈

- **前端：** React 18 + TypeScript + Vite + Tailwind CSS
- **后端：** Node.js + Express + SQLite
- **部署：** Nginx + PM2
- **仓库：** https://github.com/Manji-i/manji-blog

## 功能特性

- 前台：首页、文章列表、文章详情、关于页
- 后台：登录、仪表盘、文章管理、分类管理、站点设置
- 功能：Markdown 编辑、图片上传、文章摘要、移动端适配
- 部署：一键部署脚本 `deploy.sh`，已绑定域名 manji.pro

## 开发

```bash
# 安装依赖
npm install

# 本地开发（前端 + 后端同时启动）
npm run dev

# 只启动前端
npm run client:dev

# 只启动后端
npm run server:dev

# 构建前端
npm run build
```

## 后续提交并推送到 GitHub 的方法

### 日常开发提交

```bash
# 查看变更
git status

# 添加所有变更
git add .

# 提交（注意：要先更新版本修订.md）
git commit -m "提交说明"

# 推送到 GitHub
git push
```

### 版本发布（推荐）

按照 `版本修订.md` 里的规范：

1. 完成功能或修复后，执行 `npm run build` 验证
2. 更新 `版本修订.md`，增加新版本记录
3. 执行上述提交和推送命令
4. 需要时可创建标签：`git tag v1.x.x`，然后 `git push --tags`

## 部署

部署相关说明请查看 `DEPLOY.md` 和 `deploy.sh`。

## 版本记录

详细版本记录请查看 `版本修订.md`。
