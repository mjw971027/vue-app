/**
 * ============================================================
 * 文件：src/api/auth.ts
 * 作用：认证相关 API 函数
 * 说明：
 *   - 登录、退出登录等接口
 *   - 自动处理 Token 存储
 * ============================================================
 */

// 导入 axios 实例（已配置拦截器）
import request from './request'
// 导入 Token 管理工具
import { setToken, removeToken } from '../utils/auth'
// 导入密码哈希工具
import { hashPassword } from '../utils/crypto'

/**
 * 登录请求参数接口
 * 对应后端登录接口的 RequestBody
 */
export interface LoginParams {
  username: string    // 用户名
  password: string    // 密码
}

/**
 * 登录 API
 * POST /api/auth/login
 *
 * @param params 登录参数（用户名 + 密码）
 * @returns 登录响应（包含 Token）
 */
export const login = async (params: LoginParams) => {
  // 对密码进行 SHA-256 哈希后再传输，降低明文泄露风险
  const hashedParams = {
    ...params,
    password: await hashPassword(params.password),
  }

  // 发送登录请求
  const response = await request.post('/auth/login', hashedParams)

  // 登录成功，存储 Token
  // 假设后端返回格式：{ token: "xxx", tokenType: "Bearer", expiresIn: 86400 }
  if (response.data) {
    setToken({
      token: response.data.token,
      tokenType: response.data.tokenType || 'Bearer',
      expiresIn: response.data.expiresIn || 86400
    })
  }

  return response
}

/**
 * 退出登录 API
 * POST /api/auth/logout
 *
 * @returns 退出登录响应
 */
export const logout = async () => {
  try {
    // 调用后端退出登录接口（可选）
    await request.post('/auth/logout')
  } finally {
    // 无论后端是否成功，都清除本地 Token
    removeToken()
  }
}

/**
 * 获取当前登录用户信息
 * GET /api/auth/me
 *
 * @returns 用户信息
 */
export const getCurrentUser = async () => {
  return request.get('/auth/me')
}

/**
 * 刷新 Token API
 * POST /api/auth/refresh
 *
 * @param refreshToken 刷新 Token
 * @returns 刷新后的 Token
 */
export const refreshToken = async (refreshToken: string) => {
  return request.post('/auth/refresh', { refreshToken })
}

/**
 * 修改密码
 * POST /api/auth/change-password
 *
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 * @returns 修改结果
 */
export const changePassword = async (oldPassword: string, newPassword: string) => {
  // 对新旧密码都进行哈希处理
  return request.post('/auth/change-password', {
    oldPassword: await hashPassword(oldPassword),
    newPassword: await hashPassword(newPassword),
  })
}
