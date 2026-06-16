/**
 * ============================================================
 * 文件：src/api/auth.ts
 * 作用：认证相关 API 函数（适配 mo 后端 Session 认证）
 * 说明：
 *   - 登录使用 Spring Security 表单提交
 *   - Session Cookie 自动维持会话
 * ============================================================
 */

// 导入 axios 实例（已配置拦截器）
import { post, get } from './request'

/**
 * 登录请求参数接口
 */
export interface LoginParams {
  username: string    // 用户名
  password: string    // 密码
}

/**
 * 登录 API（Spring Security 表单登录）
 * POST /login
 *
 * mo 后端使用 Spring Security 表单登录，
 * 需要以 application/x-www-form-urlencoded 格式提交。
 *
 * @param params 登录参数（用户名 + 密码）
 * @returns 登录响应
 */
export const login = (params: LoginParams) => {
  // 构建表单数据（Spring Security 格式）
  const formData = new URLSearchParams()
  formData.append('username', params.username)
  formData.append('password', params.password)

  // 发送表单登录请求
  return post('/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
}

/**
 * 退出登录 API（Session 注销）
 * POST /logout
 *
 * @returns 退出登录响应
 */
export const logout = () => {
  return post('/logout')
}

/**
 * 获取当前登录用户信息
 * GET /userInfo
 *
 * @returns 用户信息
 */
export const getCurrentUser = () => {
  return get('/userInfo')
}

/**
 * 修改密码
 * POST /modPwd
 *
 * @param userCd 用户编码
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 * @returns 修改结果
 */
export const changePassword = (userCd: string, oldPassword: string, newPassword: string) => {
  return post('/modPwd', {
    userCd,
    oldPwd: oldPassword,
    newPwd: newPassword,
  })
}
