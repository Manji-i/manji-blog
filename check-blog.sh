#!/bin/bash
# 检查博客服务状态

echo "=== 检查博客服务 ==="

# 1. 检查端口占用
echo "1. 检查 3001 端口占用..."
lsof -ti:3001

# 2. 检查 PM2 状态
echo "2. PM2 状态..."
pm2 status

# 3. 查看日志
echo "3. 查看日志..."
pm2 logs blog-server --lines 50

# 4. 手动测试启动
echo "4. 尝试手动启动..."
cd /blog/api
PORT=3001 npx tsx server.ts
