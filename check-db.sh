#!/bin/bash
# 检查数据库用户

echo "=== 检查数据库 ==="

# 安装 sqlite3（如果没有）
if ! command -v sqlite3 &> /dev/null; then
    echo "安装 sqlite3..."
    apt update && apt install -y sqlite3
fi

# 检查数据库文件
echo "1. 检查数据库文件..."
ls -la /blog/api/database/

# 查看用户表
echo "2. 查看用户..."
sqlite3 /blog/api/database/blog.db "SELECT * FROM users;"

# 查看密码哈希
echo "3. 查看密码哈希..."
sqlite3 /blog/api/database/blog.db "SELECT email, password_hash FROM users;"

# 计算正确密码的哈希
echo "4. 计算 sj2kv1t5 的 MD5..."
echo -n "sj2kv1t5" | md5sum

echo ""
echo "=== 如果密码哈希不匹配，执行以下命令修复 ==="
echo "sqlite3 /blog/api/database/blog.db \"UPDATE users SET password_hash = 'f02562afb1bd3abbb3042055d986bbe9' WHERE email = 'wangxun417@foxmail.com';\""
