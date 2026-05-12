#!/bin/bash
# 修复前端文件

echo "=== 检查前端文件 ==="

# 检查 dist 目录内容
echo "1. 检查 /blog/dist 内容..."
ls -la /blog/dist/

# 检查是否有 index.html
echo "2. 检查 index.html..."
ls -la /blog/dist/index.html 2>/dev/null || echo "index.html 不存在"

# 检查 nginx 配置的 root
echo "3. 检查 nginx 配置..."
grep "root" /etc/nginx/sites-available/blog

# 检查 /blog 目录下的所有 html 文件
echo "4. 查找所有 html 文件..."
find /blog -name "*.html" -type f 2>/dev/null

# 检查 /blog 目录结构
echo "5. /blog 目录结构..."
ls -la /blog/
