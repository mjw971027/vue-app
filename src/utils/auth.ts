/**
 * ============================================================
 * 文件：src/utils/auth.ts
 * 作用：Session 模式的认证工具
 * 说明：
 *   - 认证凭证存放在后端 Session Cookie（JSESSIONID 等）
 *   - 浏览器自动携带 Cookie，前端不需要存储 Token
 *   - 本地仅存一份"用户信息缓存"，供快速判断登录状态与显示用户名
 * ============================================================
 */

const AUTH_KEY = 'pvm_user'
const PERMISSIONS_KEY = 'pvm_permissions'

/** 用户信息（从后端 /auth/me 获取） */
export interface AuthUser {
  username?: string
  role?: string
  [key: string]: any
}

/** 写入用户缓存 */
export const setAuthUser = (user: AuthUser): void => {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  } catch {
    /* ignore */
  }
}

/** 获取本地用户缓存 */
export const getAuthUser = (): AuthUser | null => {
  try {
    const data = localStorage.getItem(AUTH_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

/** 清除认证缓存（Cookie 由后端/浏览器自行管理） */
export const clearAuth = (): void => {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(PERMISSIONS_KEY)
}

/** 是否已登录（有本地缓存 → 视为已登录） */
export const isAuthenticated = (): boolean => {
  return getAuthUser() !== null
}

/** 当前用户名 */
export const getCurrentUsername = (): string => {
  return getAuthUser()?.username || ''
}

/** 是否管理员 */
export const isAdmin = (): boolean => {
  const u = getAuthUser()
  if (!u?.role) return false
  const upper = u.role.toUpperCase()
  return upper === 'ADMIN' || upper === 'ROLE_ADMIN'
}

// ==================== 页面权限 ====================

/** 可分配的页面权限列表（示例，供 UserManage 等页面使用） */
export const PAGE_PERMISSIONS = [
  { key: 'page1', label: '页面一' },
  { key: 'page2', label: '页面二' },
  { key: 'page3', label: '页面三' },
  { key: 'page4', label: '工装申请' },
] as const

/** 获取存储的页面权限 */
export const getStoredPermissions = (): string[] => {
  try {
    const data = localStorage.getItem(PERMISSIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/** 写入页面权限 */
export const setPagePermissions = (permissions: string[]): void => {
  try {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
  } catch {
    /* ignore */
  }
}

/** 清除页面权限 */
export const clearPermissions = (): void => {
  localStorage.removeItem(PERMISSIONS_KEY)
}
