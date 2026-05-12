#!/bin/bash
# 检查 Markdown 渲染是否正确

echo "=== 检查 JS 文件 ==="

# 检查是否包含 marked 关键字
echo "1. 检查是否包含 marked..."
grep -o "marked" /blog/dist/assets/*.js | head -1

# 检查是否包含 dangerouslySetInnerHTML
echo "2. 检查是否包含 dangerouslySetInnerHTML..."
grep -o "dangerouslySetInnerHTML" /blog/dist/assets/*.js | head -1

# 检查 JS 文件修改时间
echo "3. JS 文件修改时间..."
ls -lt /blog/dist/assets/*.js | head -3

echo ""
echo "=== 如果没有找到 marked，说明文件没有正确上传 ==="
