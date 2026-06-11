/**
 * ============================================================
 * 文件：src/router/index.ts
 * 作用：Vue Router 路由配置文件
 * 说明：
 *   - 定义 URL 路径与页面组件之间的映射关系
 *   - 使用 HTML5 History 模式（无 # 号，URL 更美观）
 *   - 添加路由守卫，实现登录认证控制
 *   - 该文件被 src/main.ts 导入并注册为全局路由
 * ============================================================
 */

// 从 vue-router 核心库导入路由创建函数
// createRouter   — 创建路由实例
// createWebHistory — 使用 HTML5 History API（无 # 号的路由模式）
import { createRouter, createWebHistory } from 'vue-router'
// 导入 Token 管理工具
import { isAuthenticated } from '../utils/auth'

// 导入各个页面组件（懒加载可改为 () => import('...') 以提升首屏速度）

import Home from '../views/Home.vue'   // 首页
import Page1 from '../views/Page1.vue' // 页面一：基础信息展示
import Page2 from '../views/Page2.vue' // 页面二：数据统计分析
import Page3 from '../views/Page3.vue' // 页面三：系统设置管理
import Page4 from '../views/Page4.vue' // 页面四：工装申请管理
import Login from '../views/Login.vue' // 登录页面

/**
 * 创建路由实例
 * createRouter() 接收一个配置对象，返回路由实例
 */
const router = createRouter({

  // ========== 路由模式 ==========
  // createWebHistory() — HTML5 History 模式
  //   URL 示例：http://localhost:5173/page1（无 # 号，更美观）
  //   缺点：生产环境需要服务器配置 fallback，否则刷新 404
  // 备选：createWebHashHistory() — Hash 模式，URL 带 #，无需服务器配置
  history: createWebHistory(),

  // ========== 路由表 ==========
  // routes 数组：定义所有路由规则
  // 每个路由对象包含：
  //   path    — URL 路径（如 '/'、'/page1'）
  //   name    — 路由名称（用于编程式导航，如 router.push({ name: 'Home' })）
  //   component — 对应渲染的 Vue 组件
  //   meta    — 路由元信息（可自定义，如 requiresAuth 表示需要登录）
  routes: [
    // 登录页（不需要认证）
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false }
    },

    // 首页（需要认证）
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true }
    },

    // 页面一（需要认证）
    {
      path: '/page1',
      name: 'Page1',
      component: Page1,
      meta: { requiresAuth: true }
    },

    // 页面二（需要认证）
    {
      path: '/page2',
      name: 'Page2',
      component: Page2,
      meta: { requiresAuth: true }
    },

    // 页面三（需要认证）
    {
      path: '/page3',
      name: 'Page3',
      component: Page3,
      meta: { requiresAuth: true }
    },

    // 页面四：工装申请管理（需要认证）
    {
      path: '/page4',
      name: 'Page4',
      component: Page4,
      meta: { requiresAuth: true }
    },

    // 捕获所有未定义的路由，跳转到首页
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
})

// ========== 全局前置守卫 ==========
// 每次路由跳转前执行
// to   — 即将进入的目标路由对象
// from — 当前导航正要离开的路由对象
// next — 调用该方法才能进入下一个钩子
router.beforeEach((to, from, next) => {
  // 检查用户是否已登录
  const isLoggedIn = isAuthenticated()

  // 如果已登录，访问登录页时直接跳转到首页
  if (to.path === '/login' && isLoggedIn) {
    next('/')
    return
  }

  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    if (isLoggedIn) {
      // 已登录，允许访问
      next()
    } else {
      // 未登录，跳转到登录页，并保存目标路径
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    // 不需要认证（如登录页），直接放行
    next()
  }
})

// 导出路由实例，供 main.ts 使用：app.use(router)
export default router
