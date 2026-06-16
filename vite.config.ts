/**
 * ============================================================
 * 文件：vite.config.ts
 * 作用：Vite 构建工具的配置文件
 * ============================================================
 */
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const useMock = env.VITE_USE_MOCK === 'true'

  return {
    plugins: [
      vue(),
      viteMockServe({
        mockPath: './mock',
        enable: useMock,
      }),
    ],

    // 路径别名: @ -> src/
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      port: Number(env.VITE_PORT) || 5173,
      proxy: {
        '/api': {
          target: 'http://169.24.216.110:8081',
          changeOrigin: true,
          // 后端接口路径不带 /api 前缀，转发前剥离
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/element-plus')) return 'element-plus'
            if (id.includes('node_modules/@element-plus')) return 'element-icons'
            if (
              id.includes('node_modules/vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/pinia')
            )
              return 'vue-vendor'
          },
        },
      },
    },
  }
})
