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

/** 用户管理列表项 */
export interface UserManageItem {
  id: number
  username: string
  email: string
  role: string
  status: string
  createTime?: string
}

/** 用户注册参数 */
export interface UserRegisterParams {
  username: string
  password: string
  email: string
  role?: string
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

// ==================== 工装申请管理 ====================

/** 公司主体下拉选项 */
export interface CompanyOption {
  code: string
  descChn: string
}

/** 部门下拉选项 */
export interface DepartmentOption {
  orgnCd: string
  orgnDesc: string
}

/** 工程号下拉选项 */
export interface ProjectOption {
  code: string
}

/** 工装申请列表项（表格行数据） */
export interface ComponentItem {
  billNo: string
  componentsName: string
  projNo: string
  deptName: string
  appUser: string
  divDesc: string
  finalNumberNo: string
  maStatus: string
  maStatusDesc: string
  maProcessId: string
  createDate: string
  guid: string
  empNo: string
}

/** 工装申请搜索参数 */
export interface ComponentSearchParams {
  companyNo: string
  dateFrom: string
  dateTo: string
  deptNo: string
  projNo: string
  maStatus: string
  componentsName: string
  page: number
  size: number
}

/** 分页结果 */
export interface PaginatedResult<T> {
  list: T[]
  total: number
}

/** 工装申请基本信息 */
export interface ComponentBillInfo {
  billNo?: string
  companyEnDesc?: string
  deptDesc?: string
  appUser?: string
  appDate?: string
  projNo?: string
  divCd?: string
  numberNo?: string
  tel?: string
  needDate?: string
  dwgno?: string
  materialTotalCost?: number
  finalNumberNo?: string
  mhBdgt?: string
  componentsName?: string
  remark?: string
}

/** 工装申请材料 */
export interface ComponentMaterial {
  guid?: string
  componentsId?: string
  createNode?: string
  activation: string
  materialNo?: string
  materialName?: string
  unit?: string
  unitDesc?: string
  demandQty?: string | number
  finalDemandQty?: string | number
  materialCost?: string | number
  materialSources?: string
  materialSourcesDesc?: string
  remark?: string
  quality?: string
  thk1?: string
  thk2?: string
  w1?: string
  w2?: string
  l?: string
}

/** 附件文件 */
export interface ComponentFile {
  fileId?: string
  fileName: string
  fileType?: string
  createDate?: string
  createUserId?: string
}

/** 审批记录 */
export interface ComponentAudit {
  createUserId: string
  opinion: string
  stepName: string
  menuName: string
  createDate: string
}

/** 单位下拉选项 */
export interface UnitOption {
  guid: string
  unt_DESC: string
}

/** 物资来源下拉选项 */
export interface MaterialSourceOption {
  id: string
  text: string
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
