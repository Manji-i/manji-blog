#!/bin/bash
# 检查 dist 目录真实内容

echo "=== 检查 dist 目录 ==="
ls -la /blog/dist/

echo ""
echo "=== 检查是否有正常的文件（非 ._ 开头）===""
ls /blog/dist/ | grep -v "^\._"

echo ""
echo "=== 检查 dist 目录大小 ==="
du -sh /blog/dist/

echo ""
echo "=== 结论 ==="
if [ -f /blog/dist/index.html ] && [ ! -f /blog/dist/._index.html ]; then
    echo "✓ dist 目录结构正确"
elif [ -f /blog/dist/._index.html ] && [ ! -f /blog/dist/index.html ]; then
    echo "✗ dist 目录只有 macOS 隐藏文件，需要重新上传"
else
    echo "? dist 目录状态未知"
fi
