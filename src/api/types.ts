/**
 * ============================================================
 * 文件：src/api/types.ts
 * 作用：定义所有后端 API 的请求/响应类型（TypeScript 类型）
 * 说明：
 *   - 前后端类型统一，避免接口字段写错
 *   - 后端 Controller 的 DTO/VO 可以对照这些类型来写
 * ============================================================
 */

// ==================== 用户相关 ====================

/** 用户信息（对应 Page1 展示的数据） */
export interface UserInfo {
  id: number
  username: string       // 用户名
  email: string          // 邮箱
  role: string          // 角色（如"管理员"）
  status: '在线' | '离线' // 状态
}

// ==================== 统计数据相关 ====================

/** 月度统计数据（对应 Page2 的柱状图数据） */
export interface MonthlyStats {
  month: string         // 月份（如 "1月"）
  sales: number         // 销售额（如收入金额）
}

/** 统计摘要（对应 Page2 的卡片） */
export interface StatsSummary {
  totalSales: number    // 总销售额
  totalOrders: number   // 总订单数
  totalCustomers: number // 总客户数
  averageGrowthRate: number // 平均增长率
  todaySales: number    // 今日销售额
}

// ==================== 系统设置相关 ====================

/** 单个设置项（对应 Page3 的开关列表） */
export interface SettingItem {
  id: number
  name: string          // 设置名称（如"深色模式"）
  enabled: boolean      // 是否开启
}

/** 系统版本信息（对应 Page3 底部） */
export interface SystemInfo {
  version: string       // 系统版本（如 "v2.1.0"）
  lastUpdate: string    // 最后更新日期（如 "2026-06-02"）
}

// ==================== 通用响应封装 ====================

/**
 * 后端统一响应格式
 * Spring Boot 通常使用这种格式：
 *   { "code": 200, "message": "success", "data": {...} }
 */
export interface ApiResponse<T> {
  code: number          // 状态码（200=成功，其他=失败）
  message: string       // 提示信息
  data: T              // 实际数据（泛型，可以是任意类型）
}
