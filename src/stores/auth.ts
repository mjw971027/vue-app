/**
 * ============================================================
 * 文件：src/stores/auth.ts
 * 作用：Pinia 认证与权限状态管理
 * ============================================================
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  setToken as saveToken,
  getToken,
  getRefreshToken,
  removeToken,
  isAuthenticated,
  getUserInfoFromToken,
  isAdmin as checkIsAdmin,
  setPagePermissions as savePagePerms,
  getStoredPermissions,
  clearPermissions,
  refreshPermissions as fetchPermissions,
} from '../utils/auth'
import { login as loginApi, logout as logoutApi } from '../api/auth'
import type { LoginParams } from '../api/auth'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // ===== 状态 =====
  const token = ref<string | null>(getToken())
  const isLoggedIn = ref(isAuthenticated())
  const isAdminUser = ref(checkIsAdmin())
  const pagePerms = ref<string[]>(isLoggedIn.value ? getStoredPermissions() : [])
  const currentUsername = ref(
    isLoggedIn.value ? getUserInfoFromToken()?.sub || '' : '',
  )

  /**
   * 会话级权限已获取标记
   * - true:  已从 API 获取过权限，后续路由切换直接读 localStorage 缓存
   * - false: 初始状态或 Token 刷新后，需要重新从 API 同步
   */
  const permissionsFetchedThisSession = ref(false)

  // ===== 计算属性 =====
  const authHeader = computed(() => (token.value ? `Bearer ${token.value}` : null))

  // ===== 方法 =====

  /** 登录 */
  async function login(params: LoginParams) {
    const res = await loginApi(params)
    token.value = getToken()
    isLoggedIn.value = true
    isAdminUser.value = checkIsAdmin()
    currentUsername.value = getUserInfoFromToken()?.sub || ''
    await fetchPermissions()
    pagePerms.value = getStoredPermissions()
    permissionsFetchedThisSession.value = true
    return res
  }

  /** 退出登录 */
  async function logout() {
    try {
      await logoutApi()
    } catch { /* 忽略 API 错误 */ }
    removeToken()
    clearPermissions()
    token.value = null
    isLoggedIn.value = false
    isAdminUser.value = false
    currentUsername.value = ''
    pagePerms.value = []
    permissionsFetchedThisSession.value = false
    router.push('/login')
  }

  /**
   * 刷新认证状态（路由切换时调用）
   *
   * 优化：权限数据不从 API 重复获取
   * - 首次加载 / Token 刷新后：从 API 同步最新权限
   * - 普通路由切换：仅从 localStorage 缓存读取，不发起 HTTP 请求
   */
  function refreshAuth() {
    isLoggedIn.value = isAuthenticated()
    if (isLoggedIn.value) {
      token.value = getToken()
      isAdminUser.value = checkIsAdmin()
      currentUsername.value = getUserInfoFromToken()?.sub || ''
      // 1) 先同步从缓存加载，保证侧边栏立即渲染
      pagePerms.value = getStoredPermissions()

      // 2) 仅首次进入时从 API 同步（登录流程已同步，这里处理页面刷新场景）
      if (!permissionsFetchedThisSession.value) {
        permissionsFetchedThisSession.value = true
        fetchPermissions().then(() => {
          pagePerms.value = getStoredPermissions()
        })
      }
    } else {
      // 未登录 → 重置会话标记
      permissionsFetchedThisSession.value = false
    }
  }

  /** 刷新 Token 并存储，同时从 API 刷新权限 */
  function refreshToken(newToken: string, tokenType = 'Bearer', expiresIn = 86400) {
    saveToken({ token: newToken, tokenType, expiresIn })
    token.value = newToken
    isLoggedIn.value = true
    // Token 刷新后标记为未同步，下次 refreshAuth 会从 API 获取
    permissionsFetchedThisSession.value = false
    // 主动触发一次权限刷新（fire-and-forget，不阻塞调用方）
    fetchPermissions().then(() => {
      pagePerms.value = getStoredPermissions()
    })
  }

  /** 检查页面权限 */
  function hasPerm(key: string): boolean {
    if (isAdminUser.value) return true
    return pagePerms.value.includes(key)
  }

  /** 获取存储的 refreshToken（供 axios 拦截器使用） */
  function getStoredRefreshToken(): string | null {
    return getRefreshToken()
  }

  return {
    token,
    isLoggedIn,
    isAdminUser,
    pagePerms,
    currentUsername,
    authHeader,
    login,
    logout,
    refreshAuth,
    refreshToken,
    hasPerm,
    getStoredRefreshToken,
  }
})
