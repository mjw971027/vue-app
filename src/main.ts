/**
 * ============================================================
 * 文件：src/main.ts
 * 作用：Vue 应用的入口文件（Entry Point）
 * 说明：
 *   - 负责创建 Vue 应用实例
 *   - 注册全局插件（路由、Element Plus、全局样式等）
 *   - 将应用挂载到 DOM 的 #app 节点上
 * ============================================================
 */

// 从 Vue 核心库中导入 createApp 函数，用于创建 Vue 应用实例
import { createApp } from "vue";

// 导入 Element Plus 和样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入全局样式表，在执行到这行时样式会自动应用到整个应用
// 注意：直接 import CSS 文件会让 Vite 将其作为全局样式处理
import "./style.css";

// 导入根组件 App.vue，这是整个应用的最顶层组件
// 所有其他组件都会作为 App.vue 的子组件渲染
import App from "./App.vue";

// 导入路由配置（src/router/index.ts 中定义的路由表）
// 包含首页、页面一、页面二、页面三的路由规则
import router from "./router";

/**
 * 创建 Vue 应用实例并启动应用
 * 1. createApp(App)  — 以 App.vue 为根组件创建应用实例
 * 2. .use(router)    — 注册 Vue Router 插件，启用路由功能
 * 3. .use(ElementPlus) — 注册 Element Plus 组件库
 * 4. .mount("#app")  — 将应用渲染并挂载到 index.html 中 id="app" 的 DOM 节点
 */
const app = createApp(App)

// 注册 Element Plus
app.use(router)
app.use(ElementPlus)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount("#app");
