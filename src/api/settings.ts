/**
 * ============================================================
 * 文件：src/api/settings.ts
 * 作用：系统设置相关 API 接口（对应 Page3）
 * 后端 Controller 参考路径：com.example.controller.SettingsController
 * ============================================================
 */

import type { SettingItem, SystemInfo } from './types'
import { get, put } from './request'

/**
 * 获取所有设置项
 * GET /api/settings/list
 *
 * 后端 Controller 示例：
 * ```
 * @GetMapping("/list")
 * public ApiResponse<List<SettingItem>> getSettings() {
 *     List<SettingItem> list = settingsService.getAllSettings();
 *     return ApiResponse.success(list);
 * }
 * ```
 */
export function getSettings() {
  return get<SettingItem[]>('/settings/list')
}

/**
 * 切换单个设置项的开关状态
 * PUT /api/settings/toggle/{id}
 *
 * 后端 Controller 示例：
 * ```
 * @PutMapping("/toggle/{id}")
 * public ApiResponse<Void> toggleSetting(@PathVariable Long id) {
 *     settingsService.toggle(id);
 *     return ApiResponse.success(null);
 * }
 * ```
 */
export function toggleSetting(id: number) {
  return put<void>(`/settings/toggle/${id}`)
}

/**
 * 获取系统版本信息
 * GET /api/settings/system-info
 *
 * 后端 Controller 示例：
 * ```
 * @GetMapping("/system-info")
 * public ApiResponse<SystemInfo> getSystemInfo() {
 *     SystemInfo info = settingsService.getSystemInfo();
 *     return ApiResponse.success(info);
 * }
 * ```
 */
export function getSystemInfo() {
  return get<SystemInfo>('/settings/system-info')
}
