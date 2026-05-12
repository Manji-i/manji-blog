#!/bin/bash
# 修复白屏问题

echo "=== 修复文件引用 ==="

# 1. 恢复文件名
cd /blog/dist/assets
mv "index-BwXSMegJ.js?v=2" index-BwXSMegJ.js 2>/dev/null
mv "index-DvvM5KC_.css?v=2" index-DvvM5KC_.css 2>/dev/null

# 2. 恢复 index.html 中的引用
sed -i 's|index-BwXSMegJ.js?v=2|index-BwXSMegJ.js|g' /blog/dist/index.html
sed -i 's|index-DvvM5KC_.css?v=2|index-DvvM5KC_.css|g' /blog/dist/index.html

# 3. 删除旧的 JS 文件，只保留最新的
cd /blog/dist/assets
ls -t *.js | tail -n +2 | xargs rm -f 2>/dev/null
ls -t *.css | tail -n +2 | xargs rm -f 2>/dev/null

# 4. 重启 nginx
sudo systemctl restart nginx

echo "=== 检查修复结果 ==="
echo "index.html 引用:"
grep -o 'src="[^"]*"' /blog/dist/index.html | grep -E "\.(js|css)"
echo ""
echo "实际文件:"
ls -la /blog/dist/assets/*.js

echo ""
echo "修复完成！请刷新页面"
