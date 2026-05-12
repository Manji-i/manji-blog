#!/bin/bash
# 检查 dist 目录结构

echo "=== 检查 dist 目录 ==="
echo "1. 检查 /blog/dist 目录..."
ls -la /blog/dist/

echo ""
echo "2. 检查 /blog/dist/assets 目录..."
ls -la /blog/dist/assets/ 2>/dev/null || echo "assets 目录不存在"

echo ""
echo "3. 查找所有 JS 文件..."
find /blog/dist -name "*.js" -type f 2>/dev/null

echo ""
echo "4. 检查 nginx 配置的 root 路径..."
grep "root" /etc/nginx/sites-available/blog
