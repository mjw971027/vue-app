/**
 * ============================================================
 * 文件：src/api/userManage.ts
 * 作用：用户管理相关 API 接口
 * 说明：
 *   - 用户列表、注册、编辑、删除
 * ============================================================
 */

import type { UserManageItem, UserRegisterParams } from './types'
import { get, post, put, del } from './request'

/**
 * 获取用户列表
 * GET /api/user/list
 */
export function getUserList() {
  return get<UserManageItem[]>('/user/list')
}

/**
 * 用户注册
 * POST /api/user/register
 */
export function registerUser(params: UserRegisterParams) {
  return post<UserManageItem>('/user/register', params as unknown as Record<string, unknown>)
}

/**
 * 更新用户信息
 * PUT /api/user/{id}
 */
export function updateUser(id: number, params: Partial<UserManageItem>) {
  return put<UserManageItem>(`/user/${id}`, params as unknown as Record<string, unknown>)
}

/**
 * 删除用户
 * DELETE /api/user/{id}
 */
export function deleteUser(id: number) {
  return del(`/user/${id}`)
}
