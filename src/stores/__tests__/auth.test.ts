/**
 * ============================================================
 * 文件：src/stores/__tests__/auth.test.ts
 * 作用：Pinia 认证 Store 的单元测试
 * ============================================================
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

// ===== 模拟依赖 =====

// 模拟 utils/auth 模块
vi.mock('../../utils/auth', () => ({
  setToken: vi.fn().mockResolvedValue(undefined),
  getToken: vi.fn(),
  getRefreshToken: vi.fn(),
  removeToken: vi.fn(),
  isAuthenticated: vi.fn(),
  getUserInfoFromToken: vi.fn(),
  isAdmin: vi.fn(),
  getStoredPermissions: vi.fn(),
  clearPermissions: vi.fn(),
  refreshPermissions: vi.fn().mockResolvedValue(undefined),
  initTokenStorage: vi.fn().mockResolvedValue(undefined),
  _resetTokenCacheForTesting: vi.fn(),
}))

// 模拟 api/auth 模块
vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}))

// 模拟 router
vi.mock('../../router', () => ({
  default: {
    push: vi.fn(),
  },
}))

// ===== 导入被模拟的模块 =====
import {
  setToken,
  getToken,
  getRefreshToken,
  removeToken,
  isAuthenticated,
  getUserInfoFromToken,
  isAdmin,
  getStoredPermissions,
  clearPermissions,
  refreshPermissions,
} from '../../utils/auth'
import { login as loginApi, logout as logoutApi } from '../../api/auth'
import router from '../../router'

// ===== 辅助函数 =====

/** 生成模拟的 JWT Token */
function createMockJwt(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const base64Url = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

  return `${base64Url(header)}.${base64Url(payload)}.mock-signature`
}

// ===== 测试套件 =====

describe('auth store', () => {
  beforeEach(() => {
    // 每个测试前重置 Pinia 和所有模拟
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ==================== 初始状态 ====================

  describe('初始状态', () => {
    it('未登录时应有正确的初始状态', () => {
      vi.mocked(isAuthenticated).mockReturnValue(false)
      vi.mocked(getToken).mockReturnValue(null)
      vi.mocked(isAdmin).mockReturnValue(false)
      vi.mocked(getStoredPermissions).mockReturnValue([])

      const store = useAuthStore()

      expect(store.isLoggedIn).toBe(false)
      expect(store.isAdminUser).toBe(false)
      expect(store.token).toBeNull()
      expect(store.currentUsername).toBe('')
      expect(store.pagePerms).toEqual([])
    })

    it('已登录时应有正确的初始状态', () => {
      const mockToken = 'existing-token'
      vi.mocked(isAuthenticated).mockReturnValue(true)
      vi.mocked(getToken).mockReturnValue(mockToken)
      vi.mocked(isAdmin).mockReturnValue(true)
      vi.mocked(getStoredPermissions).mockReturnValue(['page1', 'page2'])
      vi.mocked(getUserInfoFromToken).mockReturnValue({
        sub: 'testuser',
        role: 'ADMIN',
      })

      const store = useAuthStore()

      expect(store.isLoggedIn).toBe(true)
      expect(store.isAdminUser).toBe(true)
      expect(store.token).toBe(mockToken)
      expect(store.currentUsername).toBe('testuser')
      expect(store.pagePerms).toEqual(['page1', 'page2'])
    })
  })

  // ==================== authHeader 计算属性 ====================

  describe('authHeader', () => {
    it('有 token 时应返回 Bearer 格式', () => {
      vi.mocked(isAuthenticated).mockReturnValue(false)
      vi.mocked(getToken).mockReturnValue(null)
      vi.mocked(isAdmin).mockReturnValue(false)
      vi.mocked(getStoredPermissions).mockReturnValue([])

      const store = useAuthStore()

      // 手动设置 token 以测试 computed
      store.token = 'test-token-123'

      expect(store.authHeader).toBe('Bearer test-token-123')
    })

    it('无 token 时应返回 null', () => {
      vi.mocked(isAuthenticated).mockReturnValue(false)
      vi.mocked(getToken).mockReturnValue(null)
      vi.mocked(isAdmin).mockReturnValue(false)
      vi.mocked(getStoredPermissions).mockReturnValue([])

      const store = useAuthStore()

      expect(store.authHeader).toBeNull()
    })
  })

  // ==================== login 方法 ====================

  describe('login', () => {
    it('登录成功后应更新状态', async () => {
      // 初始状态：未登录
      vi.mocked(isAuthenticated).mockReturnValue(false)
      vi.mocked(getToken).mockReturnValue(null)
      vi.mocked(isAdmin).mockReturnValue(false)
      vi.mocked(getStoredPermissions).mockReturnValue([])

      // 模拟登录 API 成功
      const mockResponse = { code: 200, message: 'success', data: { token: 'new-token' } }
      vi.mocked(loginApi).mockResolvedValue(mockResponse as any)

      // 模拟登录后的状态
      vi.mocked(getToken).mockReturnValue('new-token')
      vi.mocked(isAdmin).mockReturnValue(true)
      vi.mocked(getUserInfoFromToken).mockReturnValue({
        sub: 'newuser',
        role: 'ADMIN',
      })
      vi.mocked(getStoredPermissions).mockReturnValue(['page1', 'page2', 'page3'])

      const store = useAuthStore()
      await store.login({ username: 'newuser', password: 'password123' })

      // 验证状态更新
      expect(store.isLoggedIn).toBe(true)
      expect(store.isAdminUser).toBe(true)
      expect(store.token).toBe('new-token')
      expect(store.currentUsername).toBe('newuser')
      expect(store.pagePerms).toEqual(['page1', 'page2', 'page3'])

      // 验证 API 调用
      expect(loginApi).toHaveBeenCalledWith({
        username: 'newuser',
        password: 'password123',
      })
      expect(refreshPermissions).toHaveBeenCalled()
    })
  })

  // ==================== logout 方法 ====================

  describe('logout', () => {
    it('退出登录后应清除状态并跳转', async () => {
      // 初始状态：已登录
      vi.mocked(isAuthenticated).mockReturnValue(true)
      vi.mocked(getToken).mockReturnValue('current-token')
      vi.mocked(isAdmin).mockReturnValue(true)
      vi.mocked(getStoredPermissions).mockReturnValue(['page1'])
      vi.mocked(getUserInfoFromToken).mockReturnValue({
        sub: 'admin',
        role: 'ADMIN',
      })

      // 模拟 logout API
      vi.mocked(logoutApi).mockResolvedValue(undefined as any)

      const store = useAuthStore()
      await store.logout()

      // 验证状态清除
      expect(store.isLoggedIn).toBe(false)
      expect(store.isAdminUser).toBe(false)
      expect(store.token).toBeNull()
      expect(store.currentUsername).toBe('')
      expect(store.pagePerms).toEqual([])

      // 验证 API 调用
      expect(logoutApi).toHaveBeenCalled()
      expect(removeToken).toHaveBeenCalled()
      expect(clearPermissions).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith('/login')
    })

    it('logout API 失败时仍应清除本地状态', async () => {
      vi.mocked(isAuthenticated).mockReturnValue(true)
      vi.mocked(getToken).mockReturnValue('current-token')
      vi.mocked(isAdmin).mockReturnValue(false)
      vi.mocked(getStoredPermissions).mockReturnValue([])
      vi.mocked(getUserInfoFromToken).mockReturnValue({
        sub: 'user',
        role: 'USER',
      })

      // 模拟 logout API 失败
      vi.mocked(logoutApi).mockRejectedValue(new Error('Network error'))

      const store = useAuthStore()
      await store.logout()

      // 即使 API 失败，本地状态仍应清除
      expect(store.isLoggedIn).toBe(false)
      expect(store.token).toBeNull()
      expect(removeToken).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith('/login')
    })
  })

  // ==================== refreshAuth 方法 ====================

  describe('refreshAuth', () => {
    it('已登录时应刷新状态', () => {
      vi.mocked(isAuthenticated).mockReturnValue(true)
      vi.mocked(getToken).mockReturnValue('valid-token')
      vi.mocked(isAdmin).mockReturnValue(true)
      vi.mocked(getStoredPermissions).mockReturnValue(['page1'])
      vi.mocked(getUserInfoFromToken).mockReturnValue({
        sub: 'admin',
        role: 'ADMIN',
      })

      const store = useAuthStore()
      store.refreshAuth()

      expect(store.isLoggedIn).toBe(true)
      expect(store.isAdminUser).toBe(true)
      expect(store.token).toBe('valid-token')
      expect(store.currentUsername).toBe('admin')
    })

    it('未登录时应重置状态', () => {
      vi.mocked(isAuthenticated).mockReturnValue(false)
      vi.mocked(getToken).mockReturnValue(null)
      vi.mocked(isAdmin).mockReturnValue(false)
      vi.mocked(getStoredPermissions).mockReturnValue([])

      const store = useAuthStore()
      store.refreshAuth()

      expect(store.isLoggedIn).toBe(false)
      expect(store.isAdminUser).toBe(false)
    })
  })

  // ==================== refreshToken 方法 ====================

  describe('refreshToken', () => {
    it('应存储新 Token 并更新状态', async () => {
      vi.mocked(isAuthenticated).mockReturnValue(false)
      vi.mocked(getToken).mockReturnValue(null)
      vi.mocked(isAdmin).mockReturnValue(false)
      vi.mocked(getStoredPermissions).mockReturnValue([])

      const store = useAuthStore()
      await store.refreshToken('new-refreshed-token', 'Bearer', 7200)

      expect(store.token).toBe('new-refreshed-token')
      expect(store.isLoggedIn).toBe(true)
      expect(setToken).toHaveBeenCalledWith({
        token: 'new-refreshed-token',
        tokenType: 'Bearer',
        expiresIn: 7200,
      })
    })
  })

  // ==================== hasPerm 方法 ====================

  describe('hasPerm', () => {
    it('ADMIN 用户应有所有权限', () => {
      vi.mocked(isAuthenticated).mockReturnValue(true)
      vi.mocked(getToken).mockReturnValue('admin-token')
      vi.mocked(isAdmin).mockReturnValue(true)
      vi.mocked(getStoredPermissions).mockReturnValue([])
      vi.mocked(getUserInfoFromToken).mockReturnValue({
        sub: 'admin',
        role: 'ADMIN',
      })

      const store = useAuthStore()

      expect(store.hasPerm('page1')).toBe(true)
      expect(store.hasPerm('page2')).toBe(true)
      expect(store.hasPerm('page999')).toBe(true) // 即使不存在的权限也应返回 true
    })

    it('普通用户应根据 pagePerms 返回权限', () => {
      vi.mocked(isAuthenticated).mockReturnValue(true)
      vi.mocked(getToken).mockReturnValue('user-token')
      vi.mocked(isAdmin).mockReturnValue(false)
      vi.mocked(getStoredPermissions).mockReturnValue(['page1', 'page3'])
      vi.mocked(getUserInfoFromToken).mockReturnValue({
        sub: 'user',
        role: 'USER',
      })

      const store = useAuthStore()

      expect(store.hasPerm('page1')).toBe(true)
      expect(store.hasPerm('page2')).toBe(false)
      expect(store.hasPerm('page3')).toBe(true)
      expect(store.hasPerm('page4')).toBe(false)
    })
  })

  // ==================== getStoredRefreshToken 方法 ====================

  describe('getStoredRefreshToken', () => {
    it('应返回存储的 refreshToken', () => {
      vi.mocked(isAuthenticated).mockReturnValue(false)
      vi.mocked(getToken).mockReturnValue(null)
      vi.mocked(isAdmin).mockReturnValue(false)
      vi.mocked(getStoredPermissions).mockReturnValue([])
      vi.mocked(getRefreshToken).mockReturnValue('stored-refresh-token')

      const store = useAuthStore()

      expect(store.getStoredRefreshToken()).toBe('stored-refresh-token')
    })

    it('refreshToken 不存在时应返回 null', () => {
      vi.mocked(isAuthenticated).mockReturnValue(false)
      vi.mocked(getToken).mockReturnValue(null)
      vi.mocked(isAdmin).mockReturnValue(false)
      vi.mocked(getStoredPermissions).mockReturnValue([])
      vi.mocked(getRefreshToken).mockReturnValue(null)

      const store = useAuthStore()

      expect(store.getStoredRefreshToken()).toBeNull()
    })
  })
})
