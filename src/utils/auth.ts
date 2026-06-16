/**
 * ============================================================
 * 文件：src/utils/auth.ts
 * 作用：JWT Token 管理工具
 * 说明：
 *   - 封装 localStorage 操作
 *   - 提供类型安全的 Token 存取方法
 *   - 自动处理 Token 过期检查
 *   - Token 存储使用 AES-GCM 加密（通过 crypto.ts）
 * ============================================================
 */

import { encryptData, decryptData } from './crypto'

// ==================== 加密 Token 缓存 ====================
// 模块级缓存：Token 在 localStorage 中以 AES-GCM 加密存储，
// 首次访问时解密并缓存到内存，后续同步读取。
let cachedToken: string | null = null
let cachedRefreshToken: string | null = null

/**
 * 重置 Token 缓存（仅用于测试环境）
 * 将模块级缓存清空，使 getToken/getRefreshToken 重新从 localStorage 读取
 */
export const _resetTokenCacheForTesting = (): void => {
  cachedToken = null
  cachedRefreshToken = null
}

/**
 * 用户认证信息接口
 * 对应后端登录接口返回的数据结构
 */
export interface AuthToken {
  token: string        // JWT Token
  tokenType: string    // Token 类型（通常是 "Bearer"）
  expiresIn: number    // 过期时间（秒）
  refreshToken?: string // 刷新 Token（可选）
}

/**
 * JWT Token Payload 结构
 * 标准 JWT Claims (RFC 7519) + 自定义字段
 */
export interface JwtPayload {
  /** 签发者 */
  iss?: string
  /** 主题（用户唯一标识，通常是用户名或用户ID） */
  sub: string
  /** 受众 */
  aud?: string | string[]
  /** 过期时间（Unix 时间戳） */
  exp?: number
  /** 生效时间（Unix 时间戳） */
  nbf?: number
  /** 签发时间（Unix 时间戳） */
  iat?: number
  /** JWT ID */
  jti?: string
  /** 用户角色（如 "ADMIN" / "USER"） */
  role?: string
}

/**
 * 初始化 Token 缓存
 * 从 localStorage 读取加密的 Token 并解密到内存缓存。
 * **必须在 app.mount() 之前调用**，确保后续同步读取正常工作。
 */
export const initTokenStorage = async (): Promise<void> => {
  const encryptedToken = localStorage.getItem('token')
  const encryptedRefresh = localStorage.getItem('refreshToken')

  cachedToken = encryptedToken ? await decryptData(encryptedToken) : null
  cachedRefreshToken = encryptedRefresh ? await decryptData(encryptedRefresh) : null
}

/**
 * 存储 Token 到 localStorage（AES-GCM 加密）
 * @param authToken 认证信息
 */
export const setToken = async (authToken: AuthToken): Promise<void> => {
  // 加密后存储 Token
  const encryptedToken = await encryptData(authToken.token)
  localStorage.setItem('token', encryptedToken)
  localStorage.setItem('tokenType', authToken.tokenType)

  // 计算并存储过期时间（当前时间 + expiresIn 秒）
  const expiresAt = Date.now() + authToken.expiresIn * 1000
  localStorage.setItem('expiresAt', expiresAt.toString())

  // 更新内存缓存
  cachedToken = authToken.token

  // 加密后存储刷新 Token（如果有）
  if (authToken.refreshToken) {
    const encryptedRefresh = await encryptData(authToken.refreshToken)
    localStorage.setItem('refreshToken', encryptedRefresh)
    cachedRefreshToken = authToken.refreshToken
  }
}

/**
 * 获取 Token（从内存缓存同步读取）
 * @returns Token 字符串，不存在则返回 null
 */
export const getToken = (): string | null => {
  return cachedToken
}

/**
 * 获取完整的 Authorization Header 值
 * @returns "Bearer xxx" 格式，不存在则返回 null
 */
export const getAuthHeader = (): string | null => {
  const token = getToken()
  const tokenType = localStorage.getItem('tokenType') || 'Bearer'

  if (!token) {
    return null
  }

  return `${tokenType} ${token}`
}

/**
 * 检查 Token 是否过期
 * @returns true 表示已过期，false 表示未过期
 */
export const isTokenExpired = (): boolean => {
  const expiresAt = localStorage.getItem('expiresAt')

  // 如果不存在过期时间，视为已过期
  if (!expiresAt) {
    return true
  }

  // 比较当前时间和过期时间
  const expiryTime = parseInt(expiresAt, 10)
  return Date.now() > expiryTime
}

/**
 * 检查是否已登录（Token 存在且未过期）
 * @returns true 表示已登录，false 表示未登录
 */
export const isAuthenticated = (): boolean => {
  const token = getToken()
  if (!token) {
    return false
  }

  // 检查是否过期
  if (isTokenExpired()) {
    // 如果过期，清除 Token
    removeToken()
    return false
  }

  return true
}

/**
 * 获取刷新 Token（从内存缓存同步读取）
 * @returns 刷新 Token，不存在则返回 null
 */
export const getRefreshToken = (): string | null => {
  return cachedRefreshToken
}

/**
 * 从 localStorage 移除 Token 并清空缓存（退出登录）
 */
export const removeToken = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('tokenType')
  localStorage.removeItem('expiresAt')
  localStorage.removeItem('refreshToken')
  // 清空内存缓存
  cachedToken = null
  cachedRefreshToken = null
}

/**
 * 解析 JWT Token 的 Payload 部分
 * @param token JWT Token
 * @returns Payload 对象，解析失败返回 null
 */
export const parseJwtPayload = (token: string): JwtPayload | null => {
  try {
    // JWT 格式：header.payload.signature
    // 取第二部分（payload），Base64 解码
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('解析 JWT Payload 失败：', error)
    return null
  }
}

/**
 * 从 Token 中获取用户信息
 * @returns 用户信息对象，不存在则返回 null
 */
export const getUserInfoFromToken = (): JwtPayload | null => {
  const token = getToken()
  if (!token) {
    return null
  }

  return parseJwtPayload(token)
}

/**
 * 获取当前用户的角色（每次从 JWT 重新解析，避免缓存问题）
 * @returns 角色字符串，如 "ADMIN" / "USER"，未登录返回 null
 */
export const getUserRole = (): string | null => {
  const info = getUserInfoFromToken()
  return info?.role || null
}

/**
 * 检查当前用户是否为 ADMIN
 * - 支持 "ADMIN" / "ROLE_ADMIN" / "admin" 等多种格式
 */
export const isAdmin = (): boolean => {
  const role = getUserRole()
  if (!role) return false
  const upper = role.toUpperCase()
  return upper === 'ADMIN' || upper === 'ROLE_ADMIN'
}

// ==================== 页面权限管理 ====================

const PERMISSIONS_KEY = 'pagePermissions'

/** 可分配的页面列表（不含 /users，ADMIN 专属） */
export const PAGE_PERMISSIONS = [
  { key: 'page1', label: '页面一' },
  { key: 'page2', label: '页面二' },
  { key: 'page3', label: '页面三' },
  { key: 'page4', label: '工装申请' },
] as const

/** 获取当前用户存储的页面权限 */
export const getStoredPermissions = (): string[] => {
  try {
    const data = localStorage.getItem(PERMISSIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/** 存储页面权限 */
export const setPagePermissions = (permissions: string[]): void => {
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
}

/** 检查当前用户是否有权访问指定页面（ADMIN 始终有权限） */
export const hasPagePermission = (pageKey: string): boolean => {
  if (isAdmin()) return true
  return getStoredPermissions().includes(pageKey)
}

/** 从 API 刷新当前用户的页面权限并存储 */
export const refreshPermissions = async (): Promise<void> => {
  try {
    const { getCurrentPermissions } = await import('../api/userManage')
    const res = await getCurrentPermissions()
    setPagePermissions(res.data || [])
  } catch {
    setPagePermissions([])
  }
}

/** 清除页面权限（退出登录时调用） */
export const clearPermissions = (): void => {
  localStorage.removeItem(PERMISSIONS_KEY)
}
