/**
 * ============================================================
 * 文件：src/stores/auth.ts
 * 作用：Pinia 认证与权限状态管理（适配 mo 后端 Session 认证）
 * ============================================================
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, logout as logoutApi, getCurrentUser } from '../api/auth'
import type { LoginParams } from '../api/auth'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // ===== 状态 =====
  const isLoggedIn = ref(false)
  const currentUsername = ref('')
  const currentUserInfo = ref<Record<string, unknown> | null>(null)

  // ===== 方法 =====

  /** 登录（Session 表单提交） */
  async function login(params: LoginParams) {
    await loginApi(params)
    // 登录成功后获取用户信息
    await fetchUserInfo()
    isLoggedIn.value = true
  }

  /** 退出登录（Session 注销） */
  async function logout() {
    try {
      await logoutApi()
    } catch { /* 忽略 API 错误 */ }
    isLoggedIn.value = false
    currentUsername.value = ''
    currentUserInfo.value = null
    router.push('/login')
  }

  /** 获取当前用户信息 */
  async function fetchUserInfo() {
    try {
      const userInfo = await getCurrentUser()
      currentUserInfo.value = userInfo as Record<string, unknown>
      currentUsername.value = (userInfo as Record<string, unknown>)?.userCd as string || ''
      isLoggedIn.value = true
    } catch {
      // 获取用户信息失败，可能未登录
      isLoggedIn.value = false
      currentUsername.value = ''
      currentUserInfo.value = null
    }
  }

  /**
   * 检查登录状态（页面刷新时调用）
   * 通过请求 /userInfo 接口验证 Session 是否有效
   */
  async function checkAuth() {
    await fetchUserInfo()
  }

  return {
    isLoggedIn,
    currentUsername,
    currentUserInfo,
    login,
    logout,
    fetchUserInfo,
    checkAuth,
  }
})
