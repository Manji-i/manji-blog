#!/bin/bash
# 强制清除缓存

echo "=== 强制清除浏览器缓存 ==="

# 1. 给 index.html 添加随机版本号
cd /blog/dist
RANDOM=$(date +%s)
sed -i "s|/assets/index-BwXSMegJ.js|/assets/index-BwXSMegJ.js?v=$RANDOM|g" index.html
sed -i "s|/assets/index-DvvM5KC_.css|/assets/index-DvvM5KC_.css?v=$RANDOM|g" index.html

echo "已添加版本号: $RANDOM"

# 2. 重启 nginx
sudo systemctl restart nginx

echo "完成！请强制刷新浏览器 (Ctrl+Shift+R 或 Cmd+Shift+R)"
