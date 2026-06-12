/**
 * ============================================================
 * 文件：src/main.ts
 * 作用：Vue 应用的入口文件（Entry Point）
 * ============================================================
 */
import { createApp } from 'vue'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Pinia 状态管理
import pinia from './stores'

// 全局样式
import './styles/main.scss'

// 根组件
import App from './App.vue'

// 路由
import router from './router'

const app = createApp(App)

// ===== 注册插件 =====
app.use(router)
app.use(pinia)
app.use(ElementPlus)

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// ===== 全局错误处理 =====
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Global Error]', err)
  console.error('[Error Info]', info)

  // 可以在这里集成错误上报服务（如 Sentry）
  // reportError(err, info)
}

// ===== 全局警告处理 =====
app.config.warnHandler = (msg, _instance, trace) => {
  if (import.meta.env.DEV) {
    console.warn(`[Vue Warn] ${msg}`, trace)
  }
}

app.mount('#app')
