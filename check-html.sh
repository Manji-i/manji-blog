#!/bin/bash
# 检查 index.html 引用的 JS 文件

echo "=== 检查 index.html ==="
cat /blog/dist/index.html | grep -o 'src="[^"]*"' | grep -E "\.(js|css)"

echo ""
echo "=== 实际存在的 JS 文件 ==="
ls -la /blog/dist/assets/*.js

echo ""
echo "=== 对比 ==="
echo "如果 index.html 引用的文件名和实际文件名不一致，需要检查上传是否完整"
