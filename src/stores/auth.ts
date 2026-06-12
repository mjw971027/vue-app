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
    router.push('/login')
  }

  /** 刷新认证状态（路由切换时调用） */
  function refreshAuth() {
    isLoggedIn.value = isAuthenticated()
    if (isLoggedIn.value) {
      token.value = getToken()
      isAdminUser.value = checkIsAdmin()
      currentUsername.value = getUserInfoFromToken()?.sub || ''
      pagePerms.value = getStoredPermissions()
      fetchPermissions().then(() => {
        pagePerms.value = getStoredPermissions()
      })
    }
  }

  /** 刷新 Token 并存储 */
  function refreshToken(newToken: string, tokenType = 'Bearer', expiresIn = 86400) {
    saveToken({ token: newToken, tokenType, expiresIn })
    token.value = newToken
    isLoggedIn.value = true
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
