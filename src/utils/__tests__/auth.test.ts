/**
 * ============================================================
 * 文件：src/utils/__tests__/auth.test.ts
 * 作用：JWT Token 管理工具的单元测试
 * ============================================================
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  setToken,
  getToken,
  getAuthHeader,
  isTokenExpired,
  isAuthenticated,
  removeToken,
  getRefreshToken,
  parseJwtPayload,
  getUserInfoFromToken,
  getUserRole,
  isAdmin,
  getStoredPermissions,
  setPagePermissions,
  hasPagePermission,
  clearPermissions,
  PAGE_PERMISSIONS,
  initTokenStorage,
  _resetTokenCacheForTesting,
} from '../auth'

// ===== 辅助函数 =====

/**
 * 生成模拟的 JWT Token
 * @param payload JWT Payload
 * @returns 模拟的 JWT 字符串
 */
function createMockJwt(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const base64Url = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

  return `${base64Url(header)}.${base64Url(payload)}.mock-signature`
}

/**
 * 快捷设置 Token 并同步缓存（测试辅助）
 */
async function setTokenAndSync(authToken: {
  token: string
  tokenType: string
  expiresIn: number
  refreshToken?: string
}) {
  await setToken(authToken)
}

/**
 * 直接设置 localStorage 中的 token 并刷新缓存（测试辅助）
 * 用于需要精确控制 token 值的场景
 */
async function setRawTokenAndSync(token: string) {
  localStorage.setItem('token', token)
  await initTokenStorage()
}

// ===== 测试套件 =====

describe('auth 工具函数', () => {
  // 每个测试前清空 localStorage 并重置缓存
  beforeEach(() => {
    localStorage.clear()
    _resetTokenCacheForTesting()
  })

  // ==================== Token 存取 ====================

  describe('setToken / getToken', () => {
    it('应正确存储和获取 Token', async () => {
      const authToken = {
        token: 'test-token-123',
        tokenType: 'Bearer',
        expiresIn: 3600,
      }

      await setTokenAndSync(authToken)

      expect(getToken()).toBe('test-token-123')
      expect(localStorage.getItem('tokenType')).toBe('Bearer')
      expect(localStorage.getItem('expiresAt')).toBeTruthy()
    })

    it('应存储 refreshToken（如果提供）', async () => {
      await setTokenAndSync({
        token: 'access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: 'refresh-token-456',
      })

      expect(getRefreshToken()).toBe('refresh-token-456')
    })

    it('不应存储 refreshToken（如果未提供）', async () => {
      await setTokenAndSync({
        token: 'access-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      })

      expect(getRefreshToken()).toBeNull()
    })

    it('Token 不存在时应返回 null', () => {
      expect(getToken()).toBeNull()
    })
  })

  // ==================== Authorization Header ====================

  describe('getAuthHeader', () => {
    it('应返回正确的 Authorization Header 格式', async () => {
      await setTokenAndSync({
        token: 'my-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      })

      expect(getAuthHeader()).toBe('Bearer my-token')
    })

    it('Token 不存在时应返回 null', () => {
      expect(getAuthHeader()).toBeNull()
    })

    it('应支持自定义 tokenType', async () => {
      await setTokenAndSync({
        token: 'my-token',
        tokenType: 'Custom',
        expiresIn: 3600,
      })

      expect(getAuthHeader()).toBe('Custom my-token')
    })
  })

  // ==================== Token 过期检查 ====================

  describe('isTokenExpired', () => {
    it('expiresAt 不存在时应返回 true', () => {
      expect(isTokenExpired()).toBe(true)
    })

    it('Token 未过期时应返回 false', () => {
      // 设置 1 小时后过期
      const futureTime = Date.now() + 3600 * 1000
      localStorage.setItem('expiresAt', futureTime.toString())

      expect(isTokenExpired()).toBe(false)
    })

    it('Token 已过期时应返回 true', () => {
      // 设置 1 小时前已过期
      const pastTime = Date.now() - 3600 * 1000
      localStorage.setItem('expiresAt', pastTime.toString())

      expect(isTokenExpired()).toBe(true)
    })
  })

  // ==================== isAuthenticated ====================

  describe('isAuthenticated', () => {
    it('Token 不存在时应返回 false', () => {
      expect(isAuthenticated()).toBe(false)
    })

    it('Token 已过期时应返回 false 并清除 Token', async () => {
      await setTokenAndSync({
        token: 'expired-token',
        tokenType: 'Bearer',
        expiresIn: -1, // 已过期
      })

      expect(isAuthenticated()).toBe(false)
      expect(getToken()).toBeNull() // Token 应被清除
    })

    it('Token 有效时应返回 true', async () => {
      await setTokenAndSync({
        token: 'valid-token',
        tokenType: 'Bearer',
        expiresIn: 3600, // 1 小时后过期
      })

      expect(isAuthenticated()).toBe(true)
    })
  })

  // ==================== removeToken ====================

  describe('removeToken', () => {
    it('应清除所有 Token 相关数据', async () => {
      await setTokenAndSync({
        token: 'test-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: 'refresh-token',
      })

      removeToken()

      expect(getToken()).toBeNull()
      expect(getRefreshToken()).toBeNull()
      expect(localStorage.getItem('tokenType')).toBeNull()
      expect(localStorage.getItem('expiresAt')).toBeNull()
    })
  })

  // ==================== JWT 解析 ====================

  describe('parseJwtPayload', () => {
    it('应正确解析有效的 JWT Payload', () => {
      const payload = {
        sub: 'testuser',
        role: 'ADMIN',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      const token = createMockJwt(payload)

      const result = parseJwtPayload(token)

      expect(result).toEqual(payload)
    })

    it('无效 Token 时应返回 null', () => {
      expect(parseJwtPayload('invalid-token')).toBeNull()
    })

    it('空字符串时应返回 null', () => {
      expect(parseJwtPayload('')).toBeNull()
    })
  })

  // ==================== getUserInfoFromToken ====================

  describe('getUserInfoFromToken', () => {
    it('Token 不存在时应返回 null', () => {
      expect(getUserInfoFromToken()).toBeNull()
    })

    it('应从存储的 Token 中提取用户信息', async () => {
      const payload = {
        sub: 'admin',
        role: 'ADMIN',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      const token = createMockJwt(payload)

      await setRawTokenAndSync(token)

      const result = getUserInfoFromToken()

      expect(result).toBeTruthy()
      expect(result?.sub).toBe('admin')
      expect(result?.role).toBe('ADMIN')
    })
  })

  // ==================== getUserRole ====================

  describe('getUserRole', () => {
    it('未登录时应返回 null', () => {
      expect(getUserRole()).toBeNull()
    })

    it('应返回用户角色', async () => {
      const payload = {
        sub: 'user1',
        role: 'USER',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      await setRawTokenAndSync(createMockJwt(payload))

      expect(getUserRole()).toBe('USER')
    })
  })

  // ==================== isAdmin ====================

  describe('isAdmin', () => {
    it('未登录时应返回 false', () => {
      expect(isAdmin()).toBe(false)
    })

    it('角色为 ADMIN 时应返回 true', async () => {
      const payload = {
        sub: 'admin',
        role: 'ADMIN',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      await setRawTokenAndSync(createMockJwt(payload))

      expect(isAdmin()).toBe(true)
    })

    it('角色为 ROLE_ADMIN 时应返回 true', async () => {
      const payload = {
        sub: 'admin',
        role: 'ROLE_ADMIN',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      await setRawTokenAndSync(createMockJwt(payload))

      expect(isAdmin()).toBe(true)
    })

    it('角色为 admin（小写）时应返回 true', async () => {
      const payload = {
        sub: 'admin',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      await setRawTokenAndSync(createMockJwt(payload))

      expect(isAdmin()).toBe(true)
    })

    it('角色为 USER 时应返回 false', async () => {
      const payload = {
        sub: 'user',
        role: 'USER',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      await setRawTokenAndSync(createMockJwt(payload))

      expect(isAdmin()).toBe(false)
    })
  })

  // ==================== 页面权限管理 ====================

  describe('页面权限管理', () => {
    it('PAGE_PERMISSIONS 应包含预期的权限项', () => {
      expect(PAGE_PERMISSIONS).toHaveLength(4)
      expect(PAGE_PERMISSIONS.map((p) => p.key)).toEqual([
        'page1',
        'page2',
        'page3',
        'page4',
      ])
    })

    it('getStoredPermissions 应返回空数组（无数据时）', () => {
      expect(getStoredPermissions()).toEqual([])
    })

    it('setPagePermissions / getStoredPermissions 应正确存取权限', () => {
      setPagePermissions(['page1', 'page3'])

      expect(getStoredPermissions()).toEqual(['page1', 'page3'])
    })

    it('clearPermissions 应清除所有权限', () => {
      setPagePermissions(['page1', 'page2'])
      clearPermissions()

      expect(getStoredPermissions()).toEqual([])
    })

    it('hasPagePermission 对 ADMIN 始终返回 true', async () => {
      const payload = {
        sub: 'admin',
        role: 'ADMIN',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      await setRawTokenAndSync(createMockJwt(payload))

      expect(hasPagePermission('page1')).toBe(true)
      expect(hasPagePermission('page999')).toBe(true) // 即使不存在的权限也应返回 true
    })

    it('hasPagePermission 对普通用户应根据权限返回', async () => {
      const payload = {
        sub: 'user',
        role: 'USER',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      await setRawTokenAndSync(createMockJwt(payload))
      setPagePermissions(['page1', 'page3'])

      expect(hasPagePermission('page1')).toBe(true)
      expect(hasPagePermission('page2')).toBe(false)
      expect(hasPagePermission('page3')).toBe(true)
      expect(hasPagePermission('page4')).toBe(false)
    })
  })
})
