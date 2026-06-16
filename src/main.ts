/**
 * ============================================================
 * 文件：src/main.ts
 * 作用：Vue 应用的入口文件（Entry Point）
 * ============================================================
 */
import { createApp } from 'vue'

// Element Plus 全量引入
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Element Plus 图标全量引入
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Pinia 状态管理
import pinia from './stores'

// 全局样式
import './styles/main.scss'

// 根组件
import App from './App.vue'

// 路由
import router from './router'

// 初始化加密 Token 缓存（必须在 app.mount 之前）
import { initTokenStorage } from './utils/auth'

const app = createApp(App)

// ===== 注册插件 =====
app.use(router)
app.use(pinia)
app.use(ElementPlus)

// 全局注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// ===== 全局错误处理 =====
app.config.errorHandler = async (err, _instance, info) => {
  console.error('[Global Error]', err)
  console.error('[Error Info]', info)

  // 使用 Element Plus 展示错误通知
  try {
    const { ElNotification } = await import('element-plus')
    ElNotification.error({
      title: '应用错误',
      message: err instanceof Error ? err.message : '发生未知错误',
      duration: 5000,
      position: 'top-right',
    })
  } catch {
    // 降级：如果 Element Plus 加载失败，使用 alert
    console.error('Failed to show notification')
  }

  // 可以在这里集成错误上报服务（如 Sentry）
  // reportError(err, info)
}

// ===== 全局警告处理 =====
app.config.warnHandler = (msg, _instance, trace) => {
  if (import.meta.env.DEV) {
    console.warn(`[Vue Warn] ${msg}`, trace)
  }
}

// 初始化 Token 加密缓存后再挂载应用
initTokenStorage().then(() => {
  app.mount('#app')
})
