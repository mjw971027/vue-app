# ============================================================
# 多阶段构建 Docker 镜像
# 阶段 1：Node.js 构建前端资源
# 阶段 2：Nginx 运行静态文件
# ============================================================

# ===== 阶段 1：构建 =====
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件（利用 Docker 缓存层）
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci --prefer-offline

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# ===== 阶段 2：运行 =====
FROM nginx:alpine

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
