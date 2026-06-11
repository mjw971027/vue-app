/**
 * ============================================================
 * 文件：src/api/stats.ts
 * 作用：统计数据相关 API 接口（对应 Page2）
 * 后端 Controller 参考路径：com.example.controller.StatsController
 * ============================================================
 */

import type { MonthlyStats, StatsSummary } from './types'
import { get } from './request'

/**
 * 获取月度统计数据
 * GET /api/stats/monthly
 *
 * 后端 Controller 示例：
 * ```
 * @GetMapping("/monthly")
 * public ApiResponse<List<MonthlyStats>> getMonthlyStats() {
 *     List<MonthlyStats> data = statsService.getMonthlyData();
 *     return ApiResponse.success(data);
 * }
 * ```
 */
export function getMonthlyStats() {
  return get<MonthlyStats[]>('/stats/monthly')
}

/**
 * 获取统计摘要（总收入、最高月份）
 * GET /api/stats/summary
 *
 * 后端 Controller 示例：
 * ```
 * @GetMapping("/summary")
 * public ApiResponse<StatsSummary> getSummary() {
 *     StatsSummary summary = statsService.getSummary();
 *     return ApiResponse.success(summary);
 * }
 * ```
 */
export function getStatsSummary() {
  return get<StatsSummary>('/stats/summary')
}
