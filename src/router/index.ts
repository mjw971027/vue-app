/**
 * ============================================================
 * 文件：src/router/index.ts
 * 作用：Vue Router 路由配置（懒加载 + 页面标题）
 * ============================================================
 */
import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, isAdmin, getStoredPermissions } from '../utils/auth'

const DEFAULT_TITLE = import.meta.env.VITE_APP_TITLE || 'WKB 工装管理系统'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 登录页（不需要认证）
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false, title: '登录' },
    },

    // 注册页（不需要认证）
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Register.vue'),
      meta: { requiresAuth: false, title: '注册' },
    },

    // 首页（需要认证）
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true, title: '首页' },
    },

    // 页面一（需要认证 + 页面权限）
    {
      path: '/page1',
      name: 'Page1',
      component: () => import('../views/Page1.vue'),
      meta: { requiresAuth: true, pagePermission: 'page1', title: '页面一' },
    },

    // 页面二（需要认证 + 页面权限）
    {
      path: '/page2',
      name: 'Page2',
      component: () => import('../views/Page2.vue'),
      meta: { requiresAuth: true, pagePermission: 'page2', title: '页面二' },
    },

    // 页面三（需要认证 + 页面权限）
    {
      path: '/page3',
      name: 'Page3',
      component: () => import('../views/Page3.vue'),
      meta: { requiresAuth: true, pagePermission: 'page3', title: '页面三' },
    },

    // 页面四：工装申请管理（需要认证 + 页面权限）
    {
      path: '/page4',
      name: 'Page4',
      component: () => import('../views/Page4.vue'),
      meta: { requiresAuth: true, pagePermission: 'page4', title: '工装申请管理' },
    },

    // 用户管理（需要认证 + ADMIN 角色）
    {
      path: '/users',
      name: 'UserManage',
      component: () => import('../views/UserManage.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, title: '用户管理' },
    },

    // 捕获所有未定义的路由，跳转到首页
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// ========== 全局前置守卫 ==========
router.beforeEach((to, from, next) => {
  const isLoggedIn = isAuthenticated()

  // 已登录访问登录/注册页 → 跳首页
  if (['/login', '/register'].includes(to.path) && isLoggedIn) {
    next('/')
    return
  }

  // 检查认证
  if (to.meta.requiresAuth) {
    if (!isLoggedIn) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    if (to.meta.requiresAdmin && !isAdmin()) {
      next('/')
      return
    }

    const pagePerm = to.meta.pagePermission as string | undefined
    if (pagePerm && !isAdmin()) {
      const perms = getStoredPermissions()
      if (!perms.includes(pagePerm)) {
        next('/')
        return
      }
    }

    next()
  } else {
    next()
  }
})

// ========== 全局后置守卫：自动设置页面标题 ==========
router.afterEach((to) => {
  const pageTitle = (to.meta.title as string) || ''
  document.title = pageTitle ? `${pageTitle} - ${DEFAULT_TITLE}` : DEFAULT_TITLE
})

export default router
