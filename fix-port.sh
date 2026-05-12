#!/bin/bash
# 修复博客服务端口问题

echo "=== 修复博客服务 ==="

# 1. 检查并创建 ecosystem.config.js
echo "1. 检查配置文件..."
if [ ! -f /blog/ecosystem.config.js ]; then
    echo "   创建 ecosystem.config.js..."
    cat > /blog/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'blog-server',
    script: './api/server.ts',
    interpreter: 'tsx',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      JWT_SECRET: 'your-secret-key-change-in-production'
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
EOF
    echo "   配置文件创建完成"
else
    echo "   配置文件已存在"
    cat /blog/ecosystem.config.js
fi

# 2. 清理进程
echo "2. 清理进程..."
pm2 delete blog-server 2>/dev/null
kill -9 $(lsof -ti:3001) 2>/dev/null
sleep 2

# 3. 删除数据库重新初始化
echo "3. 重置数据库..."
rm -rf /blog/api/database/blog.db

# 4. 启动服务
echo "4. 启动服务..."
cd /blog
pm2 start ecosystem.config.js

sleep 3

# 5. 检查状态
echo "5. 检查状态..."
pm2 status

echo ""
echo "=== 完成 ==="
echo "如果状态不是 online，请运行: pm2 logs blog-server"
