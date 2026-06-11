@echo off
chcp 65001 >nul
REM 一键启动 Vue 项目脚本
REM 作者：WorkBuddy
REM 日期：2026-06-04

echo ================================================
echo           Vue 项目一键启动脚本
echo ================================================
echo.

REM 检查 node_modules 是否存在
if not exist "node_modules\" (
    echo [1/3] 检测到 node_modules 不存在，正在安装依赖...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ 依赖安装失败！请检查网络连接或 package.json 文件。
        pause
        exit /b 1
    )
    echo.
    echo ✅ 依赖安装完成！
) else (
    echo [1/3] ✓ node_modules 已存在，跳过依赖安装。
)

echo.
echo [2/3] 正在启动 Vue 开发服务器...
echo.

REM 启动开发服务器
call npm run dev

echo.
echo ================================================
echo 开发服务器已停止
echo ================================================
pause
