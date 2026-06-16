/**
 * ============================================================
 * 文件：src/router/index.ts
 * 作用：PVM 系统路由配置
 * ============================================================
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { isAuthenticated, isAdmin } from '../utils/auth'

/**
 * 路由配置（分模块分组，便于维护）
 */
const routes: RouteRecordRaw[] = [
  // ========== 登录 ==========
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },

  // ========== 首页 ==========
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true, title: '首页' },
  },

  // ========== PVM 业务模块 ==========

  // 1. 报审申请 - 查询列表页（含查询条件、分页、增删改查、取消审批、导出）
  {
    path: '/pvm/detail',
    name: 'PvmDetail',
    component: () => import('../views/pvm/PvmDetail.vue'),
    meta: { requiresAuth: true, title: '报审申请' },
  },

  // 2. 设计评标项目查询 - 评审会查询页（含更多筛选条件）
  {
    path: '/pvm/search',
    name: 'PvmSearch',
    component: () => import('../views/pvm/PvmSearch.vue'),
    meta: { requiresAuth: true, title: '设计评标项目查询' },
  },

  // 3. 评审会详情 - 头表信息编辑（含技术协议、附件、审批流程）
  {
    path: '/pvm/update/:chkNo',
    name: 'PvmUpdate',
    component: () => import('../views/pvm/PvmUpdate.vue'),
    props: true,
    meta: { requiresAuth: true, title: '评审会详情' },
  },

  // 4. 会议管理 - 设置会议时间、排序、设置评审结果
  {
    path: '/pvm/meeting',
    name: 'PvmMeeting',
    component: () => import('../views/pvm/PvmMeeting.vue'),
    meta: { requiresAuth: true, title: '会议管理' },
  },

  // 5. 会议编号列表 - 全部会议编号管理
  {
    path: '/pvm/meeting-list',
    name: 'PvmMeetingList',
    component: () => import('../views/pvm/PvmMeetingList.vue'),
    meta: { requiresAuth: true, title: '会议编号列表' },
  },

  // ========== PVM 配置模块（管理员功能） ==========

  // 6. 评审会类型管理
  {
    path: '/pvm/manage/type',
    name: 'PvmManageType',
    component: () => import('../views/pvm/PvmManageType.vue'),
    meta: { requiresAuth: true, title: '评审会类型管理' },
  },

  // 7. 审批节点管理
  {
    path: '/pvm/manage/approve',
    name: 'PvmManageApprove',
    component: () => import('../views/pvm/PvmManageApprove.vue'),
    meta: { requiresAuth: true, title: '审批节点管理' },
  },

  // 8. 评审会管理员
  {
    path: '/pvm/manage/admin',
    name: 'PvmManageAdmin',
    component: () => import('../views/pvm/PvmManageAdmin.vue'),
    meta: { requiresAuth: true, title: '评审会管理员' },
  },

  // 9. 申请人配置
  {
    path: '/pvm/applicant',
    name: 'PvmApplicant',
    component: () => import('../views/pvm/PvmApplicant.vue'),
    meta: { requiresAuth: true, title: '申请人配置' },
  },

  // 10. 报审申请权限配置
  {
    path: '/pvm/authority',
    name: 'PvmAuthority',
    component: () => import('../views/pvm/PvmAuthority.vue'),
    meta: { requiresAuth: true, title: '报审申请权限' },
  },

  // 11. 供应商评分配置
  {
    path: '/pvm/score',
    name: 'PvmScore',
    component: () => import('../views/pvm/PvmScore.vue'),
    meta: { requiresAuth: true, title: '供应商评分' },
  },

  // 12. 供应商排序
  {
    path: '/pvm/sort',
    name: 'PvmSort',
    component: () => import('../views/pvm/PvmSort.vue'),
    meta: { requiresAuth: true, title: '供应商排序' },
  },

  // ========== 系统原有用户管理（保留） ==========
  {
    path: '/users',
    name: 'UserManage',
    component: () => import('../views/UserManage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: '用户管理' },
  },

  // 404 重定向到首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ========== 全局前置守卫 ==========
router.beforeEach((to, _from, next) => {
  const loggedIn = isAuthenticated()

  // 已登录访问登录页，跳首页
  if (to.path === '/login' && loggedIn) {
    next('/')
    return
  }

  // 需要认证
  if (to.meta.requiresAuth) {
    if (!loggedIn) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
    // 管理员权限
    if (to.meta.requiresAdmin && !isAdmin()) {
      next('/')
      return
    }
  }
  next()
})

// ========== 全局后置守卫：设置页面标题 ==========
router.afterEach((to) => {
  const pageTitle = (to.meta.title as string) || ''
  const appTitle = 'PVM 价格验证管理系统'
  document.title = pageTitle ? `${pageTitle} - ${appTitle}` : appTitle
})

export default router
