/**
 * ============================================================
 * 文件：src/stores/auth.ts
 * 作用：Pinia 认证与权限状态管理（Session 模式）
 * 说明：
 *   - 登录成功后调用 /auth/me 获取用户信息并缓存
 *   - 真正的认证凭证由浏览器管理的 Cookie 携带
 * ============================================================
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  setAuthUser,
  getAuthUser,
  clearAuth,
  isAuthenticated,
  isAdmin as checkIsAdmin,
  getStoredPermissions,
  setPagePermissions,
  clearPermissions,
} from '../utils/auth'
import type { AuthUser } from '../utils/auth'
import { login as loginApi, logout as logoutApi, getCurrentUser } from '../api/auth'
import type { LoginParams } from '../api/auth'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // ===== 状态（初始值从本地缓存读取） =====
  const isLoggedIn = ref(isAuthenticated())
  const isAdminUser = ref(checkIsAdmin())
  const currentUser = ref<AuthUser | null>(getAuthUser())
  const currentUsername = ref(currentUser.value?.username || '')
  const pagePerms = ref<string[]>(isLoggedIn.value ? getStoredPermissions() : [])

  // ===== 方法 =====

  /** 登录：调用后端登录接口 → 拉取用户信息 → 写入本地缓存 */
  async function login(params: LoginParams) {
    const res = await loginApi(params)
    // 登录成功，拉取用户信息
    try {
      const userRes = await getCurrentUser()
      const user: AuthUser = (userRes as any).data || (userRes as any) || {}
      if (!user.username) user.username = params.username
      setAuthUser(user)
      currentUser.value = user
      currentUsername.value = user.username || ''
      isAdminUser.value = checkIsAdmin()
      pagePerms.value = getStoredPermissions()
    } catch {
      // 若 /auth/me 暂不可用，仅使用登录接口返回
      const fallback: AuthUser = (res as any).data || { username: params.username }
      if (!fallback.username) fallback.username = params.username
      setAuthUser(fallback)
      currentUser.value = fallback
      currentUsername.value = fallback.username || ''
    }
    isLoggedIn.value = true
    return res
  }

  /** 退出登录：通知后端 → 清空本地缓存 → 跳登录页 */
  async function logout() {
    try {
      await logoutApi()
    } catch {
      /* 忽略 API 错误，仍需清除本地缓存 */
    }
    clearAuth()
    clearPermissions()
    currentUser.value = null
    currentUsername.value = ''
    isLoggedIn.value = false
    isAdminUser.value = false
    pagePerms.value = []
    router.push('/login')
  }

  /** 刷新认证状态（从本地缓存 + 可选重新调用 /auth/me） */
  async function refreshAuth() {
    isLoggedIn.value = isAuthenticated()
    if (isLoggedIn.value) {
      const u = getAuthUser()
      currentUser.value = u
      currentUsername.value = u?.username || ''
      isAdminUser.value = checkIsAdmin()
      pagePerms.value = getStoredPermissions()
      try {
        const res = await getCurrentUser()
        const fresh: AuthUser = (res as any).data || (res as any) || {}
        if (fresh && (fresh.username || fresh.role)) {
          setAuthUser(fresh)
          currentUser.value = fresh
          currentUsername.value = fresh.username || currentUsername.value
          isAdminUser.value = checkIsAdmin()
        }
      } catch {
        /* /auth/me 失败不主动退出，交由 request 拦截器处理 401 */
      }
    }
  }

  /** 检查页面权限 */
  function hasPerm(key: string): boolean {
    if (isAdminUser.value) return true
    return pagePerms.value.includes(key)
  }

  /** 更新用户缓存（供业务侧手动调用，如用户修改资料后） */
  function updateUser(user: AuthUser) {
    setAuthUser(user)
    currentUser.value = user
    currentUsername.value = user.username || currentUsername.value
    isAdminUser.value = checkIsAdmin()
  }

  /** 更新页面权限 */
  function updatePermissions(perms: string[]) {
    setPagePermissions(perms)
    pagePerms.value = perms
  }

  return {
    isLoggedIn,
    isAdminUser,
    currentUser,
    currentUsername,
    pagePerms,
    login,
    logout,
    refreshAuth,
    hasPerm,
    updateUser,
    updatePermissions,
  }
})
