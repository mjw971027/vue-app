/**
 * ============================================================
 * 文件：src/api/auth.ts
 * 作用：Session 模式的认证 API
 * 说明：
 *   - 登录 / 登出 / 获取当前用户信息
 *   - axios 已配置 withCredentials: true，Cookie 自动携带
 * ============================================================
 */
import request from './request'

/** 登录请求参数 */
export interface LoginParams {
  username: string
  password: string
}

/**
 * 登录 API
 * POST /api/mam/login
 * 成功后后端会 Set-Cookie，浏览器自动保存
 */
export const login = (params: LoginParams) =>
  request.post('/mam/login', params)

/**
 * 登出 API
 * POST /api/auth/logout
 * 通知后端销毁 Session
 */
export const logout = () =>
  request.post('/auth/logout')

/**
 * 获取当前登录用户信息
 * GET /api/auth/me
 * 用于刷新本地用户缓存、验证 Session 是否有效
 */
export const getCurrentUser = () =>
  request.get('/auth/me')

/**
 * 修改密码
 * POST /api/auth/change-password
 */
export const changePassword = (oldPassword: string, newPassword: string) =>
  request.post('/auth/change-password', { oldPassword, newPassword })
