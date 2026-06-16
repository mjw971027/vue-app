/**
 * ============================================================
 * 文件：src/api/pvm.ts
 * 作用：PVM（价格验证/评审会管理系统）- 所有后端 API 封装
 * 说明：
 *   - 对应后端 Java Controller 的所有接口
 *   - 基础路径：后端路径以 /pvm 开头（Spring @RequestMapping）
 *   - request.ts 已配置 baseURL = /api，且 vite 代理将 /api 转发到后端
 *   - 由于原 Java 后端不是统一 ApiResponse 格式（直接返回 DTO/List/Map），
 *     这里直接返回 response.data 原数据
 * ============================================================
 */

import request from './request'

// ==================== 分页通用类型 ====================
export interface PageInfo<T> {
  list: T[]
  total: number
  pageSize: number
  pageNum: number
  pages: number
}

// ==================== 通用实体类型 ====================

/** 评审会类型 */
export interface PvmMtType {
  dbId?: string
  verifMtTypeCd?: string
  verifMtTypeDesc?: string
  companyCd?: string
  companyEn?: string
  declarType?: string // 1: 技术申请 2: 备忘申请
  remark?: string
}

/** 评审会状态/节点 */
export interface PvmApprovalNode {
  dbId?: string
  nodeCd?: string
  nodeDesc?: string
  verifMtTypeCd?: string
  seq?: number
}

/** 员工信息 */
export interface EmployeeDto {
  empNo?: string
  empId?: string
  empDesc?: string
  deptId?: string
  deptDesc?: string
  officeCd?: string
  compCd?: string
  compDesc?: string
}

/** 工程号 */
export interface ProjNoItem {
  projNo: string
  projDesc?: string
  shipType?: string
}

/** 会议编号 */
export interface AuditMeetingDto {
  dbId?: string
  auditMtNo?: string
  auditMtDate?: string
  auditMtTime?: string
  verifMtTypeCd?: string
  companyCd?: string
  statusCd?: string
  remark?: string
}

/** 评审会数据行（DataGrid 主要数据） */
export interface PriceVerifMtDetailRow {
  chkId?: string
  chkNo: string
  programName?: string
  projNo?: string
  shipType?: string
  declarType?: string // 1: 技术申请 2: 备忘申请
  declarDesc?: string
  verifMtTypeCd?: string
  mtTypeId?: string
  compCd?: string
  compCh?: string
  companyEn?: string
  rgstUserId?: string
  rgstOfficeCd?: string
  deptDesc?: string
  approvalNode?: string
  approvalStatus?: string
  resultStatus?: string
  resultStatusDesc?: string
  resultStatus1?: string
  resultRemark?: string
  auditMtNo?: string
  auditMtDate?: string
  auditMtTime?: string
  resultTime?: number
  consistent?: string // Y/N
  consistentDesc?: string
}

/** 会议排序数据 */
export interface MeetingSortItem {
  chkId?: string
  chkNo: string
  auditMtNo?: string
  sortNo?: number
  selected?: boolean
}

/** 供应商评分 */
export interface PvmScoreItem {
  dbId?: string
  subcCd?: string
  subcDesc?: string
  score?: number
  remark?: string
  verifMtTypeCd?: string
  mtTypeId?: string
}

/** 申请人配置 */
export interface PvmApplicantItem {
  dbId?: string
  empNo?: string
  empDesc?: string
  deptId?: string
  deptDesc?: string
  verifMtTypeCd?: string
  companyCd?: string
}

/** 权限用户配置 */
export interface PvmAuthorityUserItem {
  dbId?: string
  empNo?: string
  empDesc?: string
  deptDesc?: string
  verifMtTypeCd?: string
  applicantDbId?: string
}

/** 授权工程号 */
export interface PvmAuthorityProjNoItem {
  dbId?: string
  projNo?: string
  projDesc?: string
  authorityUserDbId?: string
}

// ==================== 1. 基础数据 API (/pvm/basic) ====================

/** 获取评审会属性类别（申请类别） */
export const getReqType = () =>
  request.get('/mam/pvm/basic/getReqType')

/** 获取评审会类型列表 */
export const getPvmMtType = (company: string = '') =>
  request.get('/mam/pvm/basic/getPvmMtType', { params: { company } })

/** 获取状态列表 */
export const getStatusLstByType = (statusType: string = '') =>
  request.get('/mam/pvm/basic/getStatusLstByType', { params: { statusType } })

/** 获取员工数据（分页） */
export const getEmpData = (
  pageNum: number = 0,
  pageSize: number = 10,
  deptId: string = '',
  officeId: string = '',
  empNoOrDesc: string = ''
) =>
  request.get('/mam/pvm/basic/getEmpData', {
    params: { pageIndex: pageNum, pageSize, deptId, officeId, empNoOrDesc },
  })

/** 获取 SEM 工程号（分页） */
export const getSemProjNo = (
  pageNum: number = 0,
  pageSize: number = 10,
  projNoDesc: string = '',
  verifCd: string = '',
  appEmpNo: string = '',
  authorEmpNo: string = '',
  realflag: string = 'T'
) =>
  request.get('/mam/pvm/basic/getSemProjNo', {
    params: {
      pageIndex: pageNum,
      pageSize,
      projNoDesc,
      verifCd,
      appEmpNo,
      authorEmpNo,
      realflag,
    },
  })

/** 获取所有审批节点 */
export const getAllApprovalNode = () =>
  request.get('/mam/pvm/basic/getAllApprovalNode')

// ==================== 2. 报审申请 API (/pvm/PriceVerifMtDetail) ====================

/** 获取 DataGrid 列表（评审会主数据查询） */
export const getDataGrid = (params: {
  pageNum?: number
  pageSize?: number
  code?: string
  verifMtTypeCd?: string
  empNo?: string
  projNo?: string
  projectCd?: string
  date1?: string
  date2?: string
  nodeCd?: string
  approvalStatus?: string
  resultApprove?: string
  porNo?: string
  auditMtNo?: string
  consistent?: string
}) =>
  request.get('/mam/pvm/PriceVerifMtDetail/getDataGrid', {
    params: {
      pageIndex: params.pageNum ?? 0,
      pageSize: params.pageSize ?? 50,
      code: params.code ?? '',
      verifMtTypeCd: params.verifMtTypeCd ?? '',
      empNo: params.empNo ?? '',
      projNo: params.projNo ?? '',
      projectCd: params.projectCd ?? '',
      date1: params.date1 ?? '',
      date2: params.date2 ?? '',
      nodeCd: params.nodeCd ?? '',
      approvalStatus: params.approvalStatus ?? '',
      resultApprove: params.resultApprove ?? '',
      porNo: params.porNo ?? '',
      auditMtNo: params.auditMtNo ?? '',
      consistent: params.consistent ?? '',
    },
  })

/** 获取当前登录用户信息 */
export const getDefaultEmp = () =>
  request.get('/mam/pvm/PriceVerifMtDetail/getDafaultEmp')

/** 获取工程号列表（申请人下拉联动） */
export const getAllProjNoBasic = (
  empNo: string,
  verifMtTypeCd: string,
  projNoDesc: string = '',
  pageNum: number = 0,
  pageSize: number = 100
) =>
  request.get('/mam/pvm/PriceVerifMtDetail/getAllProjNoBasic', {
    params: { empNo, verifMtTypeCd, projNoDesc, pageIndex: pageNum, pageSize },
  })

/** 删除数据 */
export const deleteData = (data: string) =>
  request.get('/mam/pvm/PriceVerifMtDetail/deleteData', { params: { data } })

/** 取消审批 */
export const updateNode = (data: string) =>
  request.get('/mam/pvm/PriceVerifMtDetail/updateNode', { params: { data } })

/** 判断是否可以打开（权限） */
export const canOpen = (auUserId: string, projNo: string, verifMtTypeCd: string) =>
  request.get('/mam/pvm/PriceVerifMtDetail/CanOpen', { params: { auUserId, projNo, verifMtTypeCd } })

/** 导出 Excel */
export const exportPvmData = (params: Record<string, string>) =>
  request.get('/mam/pvm/PriceVerifMtDetail/ExportPvmData', {
    params,
    responseType: 'blob' as const,
  })

// ==================== 3. 新增评审会 API (/pvm/PriceverifMtCreate) ====================

/** 通过工号/用户ID获取员工信息 */
export const getEmpDataByUserId = (userId: string) =>
  request.get('/mam/pvm/PriceverifMtCreate/getEmpData', { params: { userId } })

/** 创建新的评审会（新增） */
export const createPriceVerifMt = (params: {
  compCd: string
  compEn: string
  VeriTypeCd: string
  priceVerifCd: string
  programName?: string
  projNo?: string
  shipType?: string
  reMark?: string
  mtTypeId: string
  declarType: string // 1: 技术申请 2: 备忘申请
}) =>
  request.get('/mam/pvm/PriceverifMtCreate/CreatePriceVerifMt', { params })

/** 获取工程号与描述 */
export const getProjNoDesc = (projNo: string) =>
  request.get('/mam/pvm/PriceverifMtCreate/getProjNoDesc', { params: { ProjNo: projNo } })

/** 获取船型 */
export const getShipType = (projNo: string) =>
  request.get('/mam/pvm/PriceverifMtCreate/getShipType', { params: { ProjNo: projNo } })

// ==================== 4. 评审会信息/会议管理 API (/pvm/info) ====================

/** 按评审会类型获取会议编号 */
export const getAuditMtNoByMtTypeId = (mtTypeId: string) =>
  request.get('/mam/pvm/info/getAuditMtNoByMtTypeId', { params: { mtTypeId } })

/** 按时间范围查询会议编号 */
export const getAuditMtNoByMtTypeIdS = (mtTypeId: string, date1: string, date2: string) =>
  request.get('/mam/pvm/info/getAuditMtNoByMtTypeIdS', { params: { mtTypeId, date1, date2 } })

/** 设置会议（新增会议） */
export const setAuditMt = (params: {
  companyEngDesc: string
  mtTypeCd: string
  mtTypeId: string
  auditMtDate: string
  auditMtTime: string
  timeInterval: number
  datas: string // JSON 字符串
}) => request.get('/mam/pvm/info/setAuditMt', { params })

/** 取消会议 */
export const cancelAuditMt = (auditMtId: string) =>
  request.get('/mam/pvm/info/cancelAuditMt', { params: { auditMtId } })

/** 退回数据 */
export const toBackData = (chkIds: string) =>
  request.get('/mam/pvm/info/toBackData', { params: { chkIds } })

/** 查询报审排序数据 */
export const selectMeetingSortData = (mtTypeId: string, auditMtId: string) =>
  request.get('/mam/pvm/info/selectMeetingSortData', { params: { mtTypeId, auditMtId } })

/** 保存排序数据 */
export const saveAuditMtData = (auditMtId: string, datas: string) =>
  request.get('/mam/pvm/info/saveAuditMtData', { params: { auditMtId, datas } })

/** 获取排序后的会议数据（checkData） */
export const getCheckData = (
  mtTypeId: string,
  auditMtId: string,
  date1: string,
  date2: string
) =>
  request.get('/mam/pvm/info/getCheckData', { params: { mtTypeId, auditMtId, date1, date2 } })

/** 设置评审结果 */
export const setResultStatus = (params: {
  chkId: string
  auditMtId: string
  statusCd: string
  approveCd: string
  remark: string
  auditMtNo: string
}) => request.get('/mam/pvm/info/setResultStatus', { params })

/** 获取历史记录（分页） */
export const getHistory = (params: {
  pageNum?: number
  pageSize?: number
  projectCd?: string
  EmpId: string
  date2: string
  date1: string
  caseNo?: string
  shipType?: string
  verifMtTypeCd?: string
}) =>
  request.get('/mam/pvm/info/getHistory', {
    params: {
      pageIndex: params.pageNum ?? 0,
      pageSize: params.pageSize ?? 50,
      projectCd: params.projectCd ?? '',
      EmpId: params.EmpId,
      date2: params.date2,
      date1: params.date1,
      caseNo: params.caseNo ?? '',
      shipType: params.shipType ?? '',
      verifMtTypeCd: params.verifMtTypeCd ?? '',
    },
  })

/** 获取单条评审的历史 */
export const getOwnHistory = (chkId: string, pageNum: number = 0, pageSize: number = 10) =>
  request.get('/mam/pvm/info/getOwnHistory', {
    params: { pageIndex: pageNum, pageSize, chkId },
  })

/** 按 ID 查询供应商（评分相关） */
export const getSubcTitleListByChkId = (chkId: string) =>
  request.get('/mam/pvm/info/getSubcTitleListByChkId', { params: { chkId } })

/** 获取供应商 DataGrid */
export const getSubcData = (params: {
  pageNum?: number
  pageSize?: number
  subcCds?: string
  subcCd?: string
  subcDesc?: string
}) =>
  request.get('/mam/pvm/info/getSubcData', {
    params: {
      pageIndex: params.pageNum ?? 0,
      pageSize: params.pageSize ?? 100,
      subcCds: params.subcCds ?? '',
      subcCd: params.subcCd ?? '',
      subcDesc: params.subcDesc ?? '',
    },
  })

// ==================== 5. 评审会更新/详情 API (/pvm/PriceverifMtUpdate) ====================

/** 获取头表信息 */
export const getHeadInfo = (chkNo: string) =>
  request.get('/mam/pvm/PriceverifMtUpdate/getHeadInfo', { params: { ChekNo: chkNo } })

/** 更新头表信息 */
export const updateHead = (params: {
  ChkNo: string
  projNo?: string
  shipType?: string
  programName?: string
  remark?: string
  consistent?: string
}) => request.get('/mam/pvm/PriceverifMtUpdate/updateHead', { params })

/** 获取附件列表 */
export const getAttchmentDataGrid1 = (attchmentTypeId: string, chkNo: string) =>
  request.get('/mam/pvm/PriceverifMtUpdate/getAttchmentDataGrid1', {
    params: { attchmentTypeId, chkNo },
  })

/** 获取附件（不区分类型） */
export const getAttchmentDataGrid2WithoutType = (chkNo: string) =>
  request.get('/mam/pvm/PriceverifMtUpdate/getAttchmentDataGrid2WithoutType', {
    params: { ChekNo: chkNo },
  })

/** 提交审批 */
export const commitData = (params: {
  chkId: string
  auditEmp: string
  ChkNo: string
  projNo?: string
  shipType?: string
  programName?: string
  remark?: string
  consistent?: string
}) => request.get('/mam/pvm/PriceverifMtUpdate/commitData', { params })

/** 紧急提交 */
export const urgentCommitData = (params: {
  chkId: string
  ChkNo: string
  projNo?: string
  shipType?: string
  programName?: string
  remark?: string
  consistent?: string
}) => request.get('/mam/pvm/PriceverifMtUpdate/UrgentcommitData', { params })

/** 获取部门审批人员 */
export const sectionAuditPerson = () =>
  request.get('/mam/pvm/PriceverifMtUpdate/sectionAuditPerson')

/** 获取部门审批人员（按 empNo） */
export const deptAuditPerson = (empNo: string) =>
  request.get('/mam/pvm/PriceverifMtUpdate/deptAuditPerson', { params: { empNo } })

/** 第一级审批（办理科室同意） */
export const firstAudit = (params: {
  bpId: string
  opinion?: string
  menuName: string
  taskId: string
  chkId: string
  deptAuditEmp: string
  userCd: string
}) => request.get('/mam/pvm/PriceverifMtUpdate/firstAudit', { params })

/** 第一级退回 */
export const firstReturn = (params: {
  bpId: string
  opinion?: string
  menuName: string
  taskId: string
  chkId: string
  userCd: string
}) => request.get('/mam/pvm/PriceverifMtUpdate/firstReturn', { params })

/** 第二级审批（办理部门同意） */
export const secondAudit = (params: {
  bpId: string
  opinion?: string
  menuName: string
  taskId: string
  chkId: string
  userCd: string
}) => request.get('/mam/pvm/PriceverifMtUpdate/secondAudit', { params })

/** 第二级退回 */
export const secondReturn = (params: {
  bpId: string
  opinion?: string
  menuName: string
  taskId: string
  chkId: string
  userCd: string
}) => request.get('/mam/pvm/PriceverifMtUpdate/secondReturn', { params })

/** 获取审批意见信息 */
export const getOpinionInfo = (chkId: string) =>
  request.get('/mam/pvm/PriceverifMtUpdate/getOpinionInfo', { params: { chkId } })

// ==================== 6. 评审会管理 API (/pvm/pvmManage) ====================

/** 获取评审会类型数据 */
export const getPvmMtTypeDataByCompany = (company: string = '') =>
  request.get('/mam/pvm/pvmManage/getPvmMtTypeDataByCompany', { params: { company } })

/** 保存/新增评审会类型 */
export const savePvmMtData = (iuFlag: string, data: string) =>
  request.get('/mam/pvm/pvmManage/savePvmMtData', { params: { iuFlag, data } })

/** 删除评审会类型 */
export const delPvmMtData = (datas: string) =>
  request.get('/mam/pvm/pvmManage/delPvmMtData', { params: { datas } })

/** 获取评审会审批节点 */
export const selectBasicPvmApprove = (verifMtTypeCd: string = '') =>
  request.get('/mam/pvm/pvmManage/selectBasicPvmApprove', { params: { verifMtTypeCd } })

/** 获取评审会状态 */
export const getPvmStatus = () =>
  request.get('/mam/pvm/pvmManage/getStatus')

/** 保存审批节点 */
export const savePvmApproveData = (iuFlag: string, data: string) =>
  request.get('/mam/pvm/pvmManage/savePvmApproveData', { params: { iuFlag, data } })

/** 删除审批节点 */
export const deletePvmApproveData = (datas: string) =>
  request.get('/mam/pvm/pvmManage/deletePvmApproveData', { params: { datas } })

/** 获取评审会管理员 */
export const selectBasicPvmAdminUser = (verifMtTypeCd: string = '') =>
  request.get('/mam/pvm/pvmManage/selectBasicPvmAdminUser', { params: { verifMtTypeCd } })

/** 保存评审会管理员 */
export const savePvmAdminUserData = (verifMtTypeCd: string, datas: string) =>
  request.get('/mam/pvm/pvmManage/savePvmAdminUserData', { params: { verifMtTypeCd, datas } })

/** 删除评审会管理员 */
export const deletePvmAdminUserData = (datas: string) =>
  request.get('/mam/pvm/pvmManage/deletePvmAdminUserData', { params: { datas } })

// ==================== 7. 申请人管理 API (/pvm/pvmApplicant) ====================

/** 获取申请人列表 */
export const selectBasicApplicant = (params: {
  company?: string
  verifMtTypeCd?: string
  deptDesc?: string
}) =>
  request.get('/mam/pvm/pvmApplicant/selectBasicApplicant', {
    params: {
      company: params.company ?? '',
      verifMtTypeCd: params.verifMtTypeCd ?? '',
      deptDesc: params.deptDesc ?? '',
    },
  })

/** 保存申请人数据 */
export const saveBasicApplicantData = (verifMtTypeCd: string, datas: string) =>
  request.get('/mam/pvm/pvmApplicant/saveBasicApplicantData', { params: { verifMtTypeCd, datas } })

/** 删除申请人 */
export const deletePvmApplicantData = (datas: string) =>
  request.get('/mam/pvm/pvmApplicant/deletePvmApplicantData', { params: { datas } })

/** 更新申请人 */
export const updateBasicApplicantData = (datas: string) =>
  request.get('/mam/pvm/pvmApplicant/updateBasicApplicantData', { params: { datas } })

// ==================== 8. 权限管理 API (/pvm/pvmAuthority) ====================

/** 获取权限用户列表（查询范围） */
export const selectAuthorityUser = (applicantDbId: string = '') =>
  request.get('/mam/pvm/pvmAuthority/selectAuthorityUser', { params: { applicantDbId } })

/** 保存权限用户 */
export const saveAuthorityUserData = (dbId: string, datas: string) =>
  request.get('/mam/pvm/pvmAuthority/saveAuthorityUserData', { params: { dbId, datas } })

/** 删除权限用户 */
export const deleteAuthorityUserData = (datas: string) =>
  request.get('/mam/pvm/pvmAuthority/deleteAuthorityUserData', { params: { datas } })

/** 获取授权工程号列表 */
export const selectPvmAuthorityProjNo = (authorityUserDbId: string = '') =>
  request.get('/mam/pvm/pvmAuthority/selectPvmAuthorityProjNo', { params: { authorityUserDbId } })

/** 保存授权工程号 */
export const saveBasicAuthorityProjNoData = (dbId: string, datas: string) =>
  request.get('/mam/pvm/pvmAuthority/saveBasicAuthorityProjNoData', { params: { dbId, datas } })

/** 删除授权工程号 */
export const deleteAuthorityProjNoData = (datas: string) =>
  request.get('/mam/pvm/pvmAuthority/deleteAuthorityProjNoData', { params: { datas } })

// ==================== 9. 评分管理 API (/pvm/pvmScore) ====================

/** 获取供应商评分数据 */
export const selectPriceVerifMtScore = (company: string = '', verifMtTypeCd: string = '') =>
  request.get('/mam/pvm/pvmScore/selectPriceVerifMtScore', { params: { company, verifMtTypeCd } })

/** 保存评分数据 */
export const savePvmMtScoreData = (iuFlag: string, data: string) =>
  request.get('/mam/pvm/pvmScore/savePvmMtScoreData', { params: { iuFlag, data } })

/** 删除评分 */
export const deletePvmMtScoreData = (datas: string) =>
  request.get('/mam/pvm/pvmScore/deletePvmMtScoreData', { params: { datas } })

/** 获取排序部门次序 */
export const getSortSeq = (mtTypeId: string = '') =>
  request.get('/mam/pvm/pvmScore/getSortSeq', { params: { mtTypeId } })

/** 保存排序 */
export const saveSort = (data: string) =>
  request.get('/mam/pvm/pvmScore/saveSort', { params: { data } })

/** 删除排序 */
export const delSort = (data: string) =>
  request.get('/mam/pvm/pvmScore/delSort', { params: { data } })

// ==================== 10. 技术协议 API (/pvmTA) ====================

/** 获取技术协议工程号 */
export const getProjNoByUserRule = () =>
  request.get('/pvmTA/getProjNoByUserRule')

/** 获取 SEM 工程号 */
export const getTASEMProjNo = () =>
  request.get('/pvmTA/getSemProjNo')

/** 获取 SEM 技术协议 DataGrid */
export const getListForSEM = (
  projNo: string,
  proNo: string = '',
  pageNum: number = 0,
  pageSize: number = 20
) =>
  request.get('/pvmTA/getListForSEM', {
    params: { pageIndex: pageNum, pageSize, projNo, proNo },
  })

/** 获取备忘申请的 SEM 协议 */
export const getMListForSEM = (
  projNo: string,
  proNo: string = '',
  pageNum: number = 0,
  pageSize: number = 20
) =>
  request.get('/pvmTA/getMListForSEM', {
    params: { pageIndex: pageNum, pageSize, projNo, proNo },
  })

/** 获取 TIME 技术协议 */
export const getListForTIME = (
  projNo: string = '',
  proNo: string = '',
  pageNum: number = 0,
  pageSize: number = 20
) =>
  request.get('/pvmTA/getListForTIME', {
    params: { pageIndex: pageNum, pageSize, projNo, proNo },
  })

/** 获取备忘申请的 TIME 技术协议 */
export const getMListForTIME = (
  projNo: string = '',
  proNo: string = '',
  pageNum: number = 0,
  pageSize: number = 20
) =>
  request.get('/pvmTA/getMListForTIME', {
    params: { pageIndex: pageNum, pageSize, projNo, proNo },
  })

/** 提交 SEM 技术协议 */
export const submitSEMData = (data: string, chkId: string) =>
  request.get('/pvmTA/submitSEMData', { params: { data, chkId } })

/** 提交备忘申请 SEM 数据 */
export const submitSEMDataM = (data: string, chkId: string) =>
  request.get('/pvmTA/submitSEMDataM', { params: { data, chkId } })

/** 提交 TIME 技术协议 */
export const submitTIMEData = (data: string, chkId: string) =>
  request.get('/pvmTA/submitTIMEData', { params: { data, chkId } })

/** 提交备忘申请 TIME 数据 */
export const submitTIMEDataM = (data: string, chkId: string) =>
  request.get('/pvmTA/submitTIMEDataM', { params: { data, chkId } })

/** 获取技术协议 DataGrid */
export const getPADataGrid = (chkNo: string) =>
  request.get('/pvmTA/getPADataGrid', { params: { chkNo } })

/** 按 chkId 获取技术协议 */
export const getPADataGridByChkId = (chkId: string) =>
  request.get('/pvmTA/getPADataGridBYChkId', { params: { chkId } })

/** 判断技术协议类型（SEM/TIME） */
export const isSemOrTime = (chkId: string) =>
  request.get('/pvmTA/isSemOrTime', { params: { chkId } })

/** 删除技术协议行 */
export const deleteTech = (id: string) =>
  request.get('/pvmTA/deleteTech', { params: { Id: id } })

/** 删除备忘技术协议行 */
export const deleteTechM = (id: string) =>
  request.get('/pvmTA/deleteTechM', { params: { Id: id } })

// ==================== 11. BPM / 审批流程 API ====================

/** 获取审批菜单 */
export const getAuditMenus = (processTaskInstanceId: number) =>
  request.get('/mam/bpmService/getAuditMenus', { params: { processTaskInstanceId } })

/** 获取下一步审批人 */
export const getNextPersons = (params: {
  processInstanceId: number
  processTaskInstanceId: number
  menuName: string
  menuType: number
  opinion?: string
  variables?: string
}) => request.get('/mam/bpmService/getNextPersonsByAuditMenuAndVariables', { params })

/** 获取流程跟踪 URL */
export const getFlowTrackURL = (processInstanceId: number, lang: string = 'cn') =>
  request.get('/mam/bpmService/getFlowTrackURL', { params: { processInstanceId, lang } })
