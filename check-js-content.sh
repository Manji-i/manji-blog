#!/bin/bash
# 检查 JS 文件中是否包含 marked 函数调用

echo "=== 检查 JS 文件中的 marked 调用 ==="

# 查找 marked 函数调用
grep -o "marked(" /blog/dist/assets/index-BwXSMegJ.js | head -5

# 查找 dangerouslySetInnerHTML
grep -o "dangerouslySetInnerHTML" /blog/dist/assets/index-BwXSMegJ.js | head -5

echo ""
echo "=== 检查 JS 文件大小（确认是否是最新的）==="
ls -lh /blog/dist/assets/index-BwXSMegJ.js

echo ""
echo "=== 检查 index.html 引用的 JS 文件名 ==="
grep "src=" /blog/dist/index.html | grep "\.js"
