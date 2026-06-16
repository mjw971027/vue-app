/**
 * ============================================================
 * 文件：src/utils/auth.ts
 * 作用：Session 认证工具（适配 mo 后端）
 * 说明：
 *   - Session 认证由浏览器 Cookie 自动管理
 *   - 无需手动存储/刷新 Token
 * ============================================================
 */

// ==================== Session 认证工具 ====================
// mo 后端使用 Session-based 认证，浏览器自动管理 Cookie
// 前端无需手动处理 Token 存储和刷新

/**
 * 页面权限配置
 * mo 后端没有权限管理 API，暂时全部开放
 */
export const PAGE_PERMISSIONS = [
  { key: 'page1', label: '页面一' },
  { key: 'page2', label: '页面二' },
  { key: 'page3', label: '页面三' },
  { key: 'page4', label: '工装申请' },
] as const

/**
 * 检查页面权限（Session 认证下暂时全部允许）
 * mo 后端没有独立的权限管理 API，依赖 Session 认证
 */
export const hasPagePermission = (_pageKey: string): boolean => {
  // Session 认证下，只要登录就能访问所有页面
  return true
}
