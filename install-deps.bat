@echo off
chcp 65001 >nul
echo 正在安装缺失的依赖...
npm install element-plus @element-plus/icons-vue axios
echo.
echo 安装完成！按任意键关闭...
pause
