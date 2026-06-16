/**
 * ============================================================
 * 文件：vite.config.ts
 * 作用：Vite 构建工具的配置文件
 * ============================================================
 */
/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        dts: 'src/components.d.ts',
      }),
    ],

    server: {
      port: Number(env.VITE_PORT) || 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
        },
      },
    },

    build: {
      sourcemap: false, // 生产环境关闭 sourcemap
      rollupOptions: {
        output: {
          // 按模块拆分 chunk（Vite 8 使用 rolldown，必须用函数格式）
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

    // ===== Vitest 测试配置 =====
    test: {
      environment: 'happy-dom',
      globals: true,
      include: ['src/**/*.{test,spec}.{js,ts}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/**/*.{test,spec}.ts', 'src/**/*.d.ts'],
      },
    },
  }
})
