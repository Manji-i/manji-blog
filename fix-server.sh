#!/bin/bash
# 修复博客服务器脚本

echo "=== 修复博客服务 ==="

# 1. 查找并杀掉占用 3000 端口的进程
echo "1. 清理占用 3000 端口的进程..."
PID=$(lsof -ti:3000)
if [ -n "$PID" ]; then
    echo "   找到进程 PID: $PID，正在终止..."
    kill -9 $PID 2>/dev/null
    sleep 2
    echo "   进程已终止"
else
    echo "   没有找到占用 3000 端口的进程"
fi

# 2. 停止 PM2 服务
echo "2. 停止 PM2 服务..."
pm2 stop blog-server 2>/dev/null

# 3. 删除数据库重新初始化
echo "3. 重置数据库..."
cd /blog/api
rm -rf database/blog.db

# 4. 启动服务
echo "4. 启动服务..."
pm2 start blog-server

# 5. 等待服务启动
sleep 3

# 6. 检查服务状态
echo "5. 检查服务状态..."
pm2 status blog-server

# 7. 查看最新日志
echo "6. 查看最新日志..."
pm2 logs blog-server --lines 10

echo ""
echo "=== 修复完成 ==="
echo "请刷新浏览器页面尝试登录"
echo "账号: wangxun417@foxmail.com"
echo "密码: sj2kv1t5"
