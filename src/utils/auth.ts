/**
 * ============================================================
 * 文件：src/utils/auth.ts
 * 作用：JWT Token 管理工具
 * 说明：
 *   - 封装 localStorage 操作
 *   - 提供类型安全的 Token 存取方法
 *   - 自动处理 Token 过期检查
 * ============================================================
 */

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
 * 存储 Token 到 localStorage
 * @param authToken 认证信息
 */
export const setToken = (authToken: AuthToken): void => {
  // 存储 Token
  localStorage.setItem('token', authToken.token)
  localStorage.setItem('tokenType', authToken.tokenType)

  // 计算并存储过期时间（当前时间 + expiresIn 秒）
  const expiresAt = Date.now() + authToken.expiresIn * 1000
  localStorage.setItem('expiresAt', expiresAt.toString())

  // 存储刷新 Token（如果有）
  if (authToken.refreshToken) {
    localStorage.setItem('refreshToken', authToken.refreshToken)
  }
}

/**
 * 从 localStorage 获取 Token
 * @returns Token 字符串，不存在则返回 null
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token')
}

/**
 * 从 localStorage 获取完整的 Authorization Header 值
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
 * 获取刷新 Token
 * @returns 刷新 Token，不存在则返回 null
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken')
}

/**
 * 从 localStorage 移除 Token（退出登录）
 */
export const removeToken = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('tokenType')
  localStorage.removeItem('expiresAt')
  localStorage.removeItem('refreshToken')
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
