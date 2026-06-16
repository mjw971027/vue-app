/**
 * ============================================================
 * 文件：src/api/components.ts
 * 作用：工装申请管理相关 API 接口（适配 mo 后端）
 * 说明：统一封装 /components/*、/comp/*、/projectManager/* 接口
 * ============================================================
 */

import { get, post } from './request'
import type {
  CompanyOption,
  DepartmentOption,
  ProjectOption,
  ComponentItem,
  ComponentSearchParams,
  PaginatedResult,
  ComponentBillInfo,
  ComponentMaterial,
  ComponentFile,
  ComponentAudit,
  UnitOption,
  MaterialSourceOption,
} from './types'

// ==================== 下拉选项 ====================

/** 获取公司主体列表 */
export function getCompanies() {
  // mo 后端路径：/comp/getComps
  return get<CompanyOption[]>('/comp/getComps')
}

/** 获取部门列表 */
export function getDepartments(superOrgnCd: string) {
  return get<DepartmentOption[]>('/components/getDeptCombobox', {
    superOrgnCd,
  })
}

/** 获取工程号列表（Page4 用） */
export function getProjects() {
  return get<ProjectOption[]>('/components/qryAllProjNo')
}

/** 获取工程号列表（ComponentsCreate 用） */
export function getProjectManagerProjects() {
  return get<ProjectOption[]>('/projectManager/qryAllProjNo')
}

/** 获取单位列表 */
export function getUnits() {
  return get<UnitOption[]>('/components/getUnit')
}

/** 获取物资来源列表 */
export function getMaterialSources() {
  return get<MaterialSourceOption[]>('/components/selectMatS')
}

// ==================== 工装申请 CRUD ====================

/** 查询工装申请数据（分页） */
export function searchComponents(params: ComponentSearchParams) {
  return get<PaginatedResult<ComponentItem>>('/components/getTComponentsData', params)
}

/** 创建工装申请基础信息 */
export function createComponent(data: { programName: string }) {
  // mo 后端 createBase 只需要 programName 参数
  return post<{ guid: string; billNo?: string }>('/components/createBase', data)
}

/** 删除工装申请 */
export function deleteComponent(guid: string) {
  return post<{ flag: number }>('/components/delApp', { guid })
}

/** 撤回工装申请 */
export function retractComponent(guid: string) {
  return post<{ flag: number }>('/components/retractApp', { guid })
}

// ==================== 工装详情 ====================

/** 获取工装申请基本信息 */
export function getBillInfo(billId: string) {
  return get<ComponentBillInfo>('/components/getBillInfo', { billId })
}

/** 获取申请材料列表 */
export function getComponentsApp(billNo: string) {
  // mo 后端路径：/components/getCompnentsApp（注意拼写：Compnents）
  return get<ComponentMaterial[]>('/components/getCompnentsApp', { billNo })
}

/** 获取附件列表 */
export function getComponentsAppFile(billNo: string) {
  // mo 后端路径：/components/getCompnentsAppFile
  return get<ComponentFile[]>('/components/getCompnentsAppFile', { billNo })
}

/** 获取审批记录 */
export function getComponentsAppAudit(billNo: string) {
  // mo 后端路径：/components/getCompnentsAppAudit
  return get<ComponentAudit[]>('/components/getCompnentsAppAudit', { billNo })
}

// ==================== 材料管理 ====================

/** 删除申请材料 */
export function deleteAppInfo(ids: (string | undefined)[]) {
  // mo 后端直接返回业务数据，不需要 ApiResponse 包装
  return post<unknown>('/components/delAppInfo', {
    data: JSON.stringify(ids),
  })
}

/** 保存申请材料 */
export function saveAppInfo(data: ComponentMaterial[]) {
  return post<{ flag: number }>('/components/saveAppInfo', {
    data: JSON.stringify(data),
  })
}

// ==================== 文件管理 ====================

/** 删除附件 */
export function deleteComFile(ids: (string | undefined)[]) {
  // mo 后端直接返回业务数据，不需要 ApiResponse 包装
  return post<unknown>('/components/delComFile', {
    data: JSON.stringify(ids),
  })
}

// ==================== 保存与提交 ====================

/** 保存工装申请基本信息 */
export function saveBase(data: Record<string, unknown>) {
  return post<{ flag: number }>('/components/saveBase', {
    data: JSON.stringify(data),
  })
}

/** 提交工装申请 */
export function saveBaseCommit(param: Record<string, unknown>, materials: ComponentMaterial[]) {
  return post<{ flag: number }>('/components/saveBaseCommit', {
    data: JSON.stringify(param),
    data2: JSON.stringify(materials),
  })
}
