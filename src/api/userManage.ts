/**
 * ============================================================
 * 文件：src/api/userManage.ts
 * 作用：用户管理相关 API 接口
 * 说明：
 *   - 用户列表、注册、编辑、删除
 *   - 页面权限管理
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
  return post<UserManageItem>('/user/register', params)
}

/**
 * 更新用户信息
 * PUT /api/user/{id}
 */
export function updateUser(id: number, params: Partial<UserManageItem>) {
  return put<UserManageItem>(`/user/${id}`, params)
}

/**
 * 删除用户
 * DELETE /api/user/{id}
 */
export function deleteUser(id: number) {
  return del(`/user/${id}`)
}

// ==================== 页面权限 API ====================

/**
 * 获取当前登录用户的页面权限
 * GET /api/user/permissions
 */
export function getCurrentPermissions() {
  return get<string[]>('/user/permissions')
}

/**
 * 获取指定用户的页面权限
 * GET /api/user/permissions/{userId}
 */
export function getUserPermissions(userId: number) {
  return get<string[]>(`/user/permissions/${userId}`)
}

/**
 * 设置指定用户的页面权限
 * PUT /api/user/permissions/{userId}
 * body: { permissions: ["page1","page2"] }
 */
export function setUserPermissions(userId: number, permissions: string[]) {
  return put(`/user/permissions/${userId}`, { permissions: permissions })
}
