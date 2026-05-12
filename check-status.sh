#!/bin/bash
# 检查当前状态

echo "=== 检查 index.html ==="
cat /blog/dist/index.html | grep -E "(src=|href=)" | head -5

echo ""
echo "=== 检查 assets 目录 ==="
ls -la /blog/dist/assets/

echo ""
echo "=== 检查 nginx 状态 ==="
sudo systemctl status nginx --no-pager | head -10

echo ""
echo "=== 检查后端服务 ==="
pm2 status
