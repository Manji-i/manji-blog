#!/bin/bash
# 检查上传目录

echo "=== 检查 uploads 目录 ==="
ls -la /blog/api/uploads/ 2>/dev/null || echo "uploads 目录不存在"

echo ""
echo "=== 创建 uploads 目录（如果不存在）==="
mkdir -p /blog/api/uploads
chmod 755 /blog/api/uploads

echo ""
echo "=== 检查目录权限 ==="
ls -ld /blog/api/uploads/

echo ""
echo "=== 检查 nginx 配置中的 uploads 路径 ==="
grep -A2 "location /uploads" /etc/nginx/sites-available/blog
