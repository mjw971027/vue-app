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
export const parseJwtPayload = (token: string): any => {
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
export const getUserInfoFromToken = (): any => {
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
