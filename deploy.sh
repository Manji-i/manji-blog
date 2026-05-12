#!/bin/bash

# 一键部署脚本
echo "🚀 开始部署到服务器..."

# 服务器配置
SERVER="root@14.103.45.4"
REMOTE_DIR="/blog"
LOCAL_DIR="/Users/bytedance/Documents/trae_projects"

echo ""
echo "📦 1/4 - 构建项目..."
cd "$LOCAL_DIR"
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败！"
    exit 1
fi

echo ""
echo "📤 2/4 - 上传前端文件..."
scp -r "$LOCAL_DIR/dist/*" "$SERVER:$REMOTE_DIR/dist/"
if [ $? -ne 0 ]; then
    echo "❌ 前端上传失败！"
    exit 1
fi

echo ""
echo "📤 3/4 - 上传后端文件..."
scp "$LOCAL_DIR/api/database.ts" "$SERVER:$REMOTE_DIR/api/"
scp "$LOCAL_DIR/api/server.ts" "$SERVER:$REMOTE_DIR/api/"
scp "$LOCAL_DIR/api/routes/upload.ts" "$SERVER:$REMOTE_DIR/api/routes/"
scp "$LOCAL_DIR/ecosystem.config.cjs" "$SERVER:$REMOTE_DIR/"
scp "$LOCAL_DIR/nginx.conf" "$SERVER:$REMOTE_DIR/"
if [ $? -ne 0 ]; then
    echo "❌ 后端上传失败！"
    exit 1
fi

echo ""
echo "🔄 4/4 - 重启后端服务和Nginx..."
ssh "$SERVER" << 'EOF'
cd /blog
# 复制nginx配置到正确位置
cp nginx.conf /etc/nginx/sites-available/blog
# 重新加载nginx配置
nginx -t && nginx -s reload
# 重启后端服务
pm2 restart blog-server
echo "✅ 服务已重启"
EOF

if [ $? -ne 0 ]; then
    echo "❌ 服务重启失败！"
    exit 1
fi

echo ""
echo "🎉 部署完成！"
echo "🌐 访问地址: http://manji.pro/"
echo "🔗 备用地址: http://14.103.45.4/"
