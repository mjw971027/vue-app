/**
 * ============================================================
 * 文件：vite.config.ts
 * 作用：Vite 构建工具的配置文件
 * 说明：
 *   - Vite 是现代化的前端构建工具，提供极速开发服务器和打包能力
 *   - 该文件导出的配置对象会被 Vite 启动时自动读取
 *   - 使用 @vitejs/plugin-vue 插件来支持 .vue 单文件组件的解析和编译
 * ============================================================
 */

// 从 Vite 核心库导入 defineConfig 函数
// defineConfig() 提供 TypeScript 类型提示，让配置编写时有智能补全
import { defineConfig } from 'vite'

// 导入 Vue 官方 Vite 插件
// 该插件负责：解析 .vue 文件、支持 <script setup>、处理 Vue SFC 的编译
import vue from '@vitejs/plugin-vue'

// Vite 官方配置文档：https://vite.dev/config/
export default defineConfig({
  // ========== 插件配置 ==========
  // plugins 数组：注册 Vite 插件，可包含多个插件
  // 常见插件：vue()、vueJsx()、legacy()、AutoImport 等
  plugins: [vue()],

  // ========== 开发服务器配置（npm run dev 时生效）==========
  server: {
    port: 5173,  // 指定开发服务器监听端口（Vite 默认就是 5173）
    // 代理配置：解决开发环境跨域问题
    // 将 /api 请求代理到后端服务器 http://localhost:8081
    proxy: {
      '/api': {
        target: 'http://localhost:8081',  // 后端服务地址
        changeOrigin: true,                // 修改请求头中的 Origin
        // rewrite: (path) => path.replace(/^\/api/, '/api'), // 保持 /api 前缀不变
      }
    }
  },

  // ========== 生产环境构建配置（npm run build 时生效）==========
  build: {
    // 生成 source map 文件（.map 文件）
    // 作用：生产环境报错时，浏览器控制台可以映射到原始源码位置，方便调试
    // 代价：构建产物会稍大
    sourcemap: true,
  },
})
