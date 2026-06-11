#!/bin/bash
# 一键启动 Vue 项目脚本
# 作者：WorkBuddy
# 日期：2026-06-04

echo "================================================"
echo "          Vue 项目一键启动脚本"
echo "================================================"
echo ""

# 检测操作系统
OS="Unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="Windows"
fi

echo "检测到操作系统: $OS"
echo ""

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "[1/3] 检测到 node_modules 不存在，正在安装依赖..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ 依赖安装失败！请检查网络连接或 package.json 文件。"
        read -p "按 Enter 键退出..."
        exit 1
    fi
    echo ""
    echo "✅ 依赖安装完成！"
else
    echo "[1/3] ✓ node_modules 已存在，跳过依赖安装。"
fi

echo ""
echo "[2/3] 正在启动 Vue 开发服务器..."
echo ""

# 启动开发服务器
npm run dev

echo ""
echo "================================================"
echo "开发服务器已停止"
echo "================================================"
read -p "按 Enter 键退出..."
