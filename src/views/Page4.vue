<!--
  ============================================================
  文件：src/views/Page4.vue
  作用：工装申请管理页面
  说明：
    - 查询、新增、删除、撤回、打印工装申请单
    - 使用 Element Plus 组件重构原 MiniUI 页面
  ============================================================
-->
<template>
  <div class="page4-container">
    <!-- 搜索栏 -->
    <el-card class="search-card" shadow="never">
      <div class="card-header-row">
        <div class="card-title">
          <el-icon><Search /></el-icon>
          查询条件
        </div>
      </div>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="公司主体">
          <el-select v-model="searchForm.companyNo" placeholder="请选择" style="width: 200px" @change="handleCompanyChange">
            <el-option
              v-for="item in companyOptions"
              :key="item.code"
              :label="item.descChn"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请部门">
          <el-select v-model="searchForm.deptNo" placeholder="请选择" style="width: 200px" clearable filterable>
            <el-option
              v-for="item in departmentOptions"
              :key="item.orgnCd"
              :label="item.orgnDesc"
              :value="item.orgnCd"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工程号">
          <el-select
            v-model="searchForm.projNo"
            placeholder="请选择"
            style="width: 200px"
            clearable
            filterable
          >
            <el-option
              v-for="item in projectOptions"
              :key="item.code"
              :label="item.code"
              :value="item.code"
            />
            <template #prefix>
              <span>{{ searchForm.projNo }}</span>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="申请状态">
          <el-select v-model="searchForm.maStatus" placeholder="请选择" style="width: 150px" clearable>
            <el-option label="编制" value="01" />
            <el-option label="审批" value="02" />
            <el-option label="设计出图" value="04" />
            <el-option label="设计出图审批" value="05" />
            <el-option label="完成" value="03" />
            <el-option label="退回" value="00" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请日期">
          <el-date-picker
            v-model="searchForm.dateFrom"
            type="date"
            placeholder="开始日期"
            style="width: 140px"
            format="YYYY-MM-DD"
          />
          <span class="date-separator">至</span>
          <el-date-picker
            v-model="searchForm.dateTo"
            type="date"
            placeholder="结束日期"
            style="width: 140px"
            format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="项目名称/申请单号">
          <el-input v-model="searchForm.componentsName" placeholder="请输入" style="width: 200px" clearable />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮栏 -->
    <div class="action-bar">
      <div class="action-left">
        <el-button type="primary" :icon="Search" class="action-btn" @click="handleSearch">查询</el-button>
        <el-button type="success" :icon="Plus" class="action-btn" plain @click="handleAdd">新增</el-button>
      </div>
      <div class="action-right">
        <el-button :icon="Delete" class="action-btn" :disabled="!currentRow" @click="handleDelete">删除</el-button>
        <el-button :icon="RefreshLeft" class="action-btn" :disabled="!currentRow" @click="handleRetract">撤回</el-button>
        <el-button :icon="Printer" class="action-btn" :disabled="!currentRow" @click="handlePrint">打印</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="tableLoading"
        :data="tableData"
        border
        stripe
        highlight-current-row
        style="width: 100%"
        @current-change="handleRowChange"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="billNo" label="申请单号" width="200" align="center">
          <template #default="{ row }">
            <el-button link type="primary" class="link-btn" @click="handleShowDetail(row)">{{ row.billNo }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="componentsName" label="项目名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="projNo" label="工程号" width="100" align="center" />
        <el-table-column prop="deptName" label="申请部门" width="100" align="center" />
        <el-table-column prop="appUser" label="申请人" width="100" align="center" />
        <el-table-column prop="divDesc" label="工装类别" width="100" align="center" />
        <el-table-column prop="finalNumberNo" label="最终审核数" width="100" align="center" />
        <el-table-column label="申请状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.maStatus)" size="small" effect="dark" round>
              {{ row.maStatusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="流程跟踪" width="100" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.maProcessId"
              link
              type="primary"
              class="link-btn"
              @click="handleShowBpm(row.maProcessId)"
            >
              追踪
            </el-button>
            <span v-else class="no-data">—</span>
          </template>
        </el-table-column>
        <el-table-column prop="createDate" label="创建时间" width="130" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createDate) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[50, 100, 200]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增项目对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新增项目"
      width="600px"
      @close="handleCancelCreate"
    >
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="项目名称" required>
          <el-input v-model="createForm.programName" placeholder="请输入项目名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCancelCreate">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 工装申请弹窗 -->
    <ComponentsCreate
      v-if="createDialogVisible2"
      :bill-no="currentBillNo"
      :guid="currentGuid"
      :is-read-only="isReadOnly"
      @close="handleCreateDialogClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus, Delete, RefreshLeft, Printer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type {
  CompanyOption,
  DepartmentOption,
  ProjectOption,
  ComponentItem,
  ComponentSearchParams,
} from '../api/types'
import {
  getCompanies,
  getDepartments,
  getProjects,
  searchComponents,
  createComponent,
  deleteComponent,
  retractComponent,
} from '../api/components'
import { formatDate } from '../utils/format'
import request from '../api/request'
import ComponentsCreate from './ComponentsCreate.vue'

// 搜索表单
const searchForm = reactive({
  companyNo: '',
  deptNo: '',
  projNo: '',
  maStatus: '',
  dateFrom: null as Date | null,
  dateTo: null as Date | null,
  componentsName: ''
})

// 弹窗相关
const createDialogVisible = ref(false)
const createDialogVisible2 = ref(false)
const currentBillNo = ref('')
const currentGuid = ref('')
const isReadOnly = ref(false)

// 表格数据
const tableData = ref<ComponentItem[]>([])
const tableLoading = ref(false)
const currentRow = ref<ComponentItem | null>(null)

// 下拉选项
const companyOptions = ref<CompanyOption[]>([])
const departmentOptions = ref<DepartmentOption[]>([])
const projectOptions = ref<ProjectOption[]>([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 50,
  total: 0
})

// 新增对话框
const createForm = reactive({
  programName: ''
})

/** 获取公司列表 */
const loadCompanies = async () => {
  try {
    const res = await getCompanies()
    companyOptions.value = res.data || []
    if (companyOptions.value.length > 0) {
      searchForm.companyNo = companyOptions.value[0].code
      await loadDepartments()
      await loadProjects()
    }
  } catch {
    ElMessage.error('加载公司列表失败')
  }
}

/** 获取部门列表 */
const loadDepartments = async () => {
  if (!searchForm.companyNo) return
  try {
    const res = await getDepartments(searchForm.companyNo)
    departmentOptions.value = res.data || []
  } catch {
    ElMessage.error('加载部门列表失败')
  }
}

/** 获取工程号列表 */
const loadProjects = async () => {
  try {
    const res = await getProjects()
    projectOptions.value = res.data || []
  } catch {
    ElMessage.error('加载工程号列表失败')
  }
}

/** 公司变化 */
const handleCompanyChange = () => {
  searchForm.deptNo = ''
  loadDepartments()
}

/** 获取状态标签类型 */
const getStatusType = (status: string): string => {
  const map: Record<string, string> = {
    '01': 'info',
    '02': 'warning',
    '04': 'primary',
    '05': 'warning',
    '03': 'success',
    '00': 'danger'
  }
  return map[status] || 'info'
}

/** 格式化日期为 API 格式（YYYYMMDD） */
const formatDateForApi = (date: Date | string | null): string => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

/** 查询数据 */
const handleSearch = async () => {
  if (!searchForm.companyNo) {
    ElMessage.warning('请选择公司主体')
    return
  }

  tableLoading.value = true
  try {
    const param: ComponentSearchParams = {
      companyNo: searchForm.companyNo,
      dateFrom: searchForm.dateFrom ? formatDateForApi(searchForm.dateFrom) : '',
      dateTo: searchForm.dateTo ? formatDateForApi(searchForm.dateTo) : '',
      deptNo: searchForm.deptNo,
      projNo: searchForm.projNo,
      maStatus: searchForm.maStatus,
      componentsName: searchForm.componentsName,
      page: pagination.currentPage,
      size: pagination.pageSize
    }
    const res = await searchComponents(param)
    tableData.value = res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch {
    ElMessage.error('查询失败')
  } finally {
    tableLoading.value = false
  }
}

/** 新增 */
const handleAdd = () => {
  createForm.programName = ''
  createDialogVisible.value = true
}

/** 创建项目 */
const handleCreate = async () => {
  if (!createForm.programName) {
    ElMessage.warning('必须填写项目名称')
    return
  }

  if (!searchForm.companyNo) {
    ElMessage.warning('请选择公司主体')
    return
  }

  try {
    const res = await createComponent({
      programName: createForm.programName,
      companyNo: searchForm.companyNo
    })
    if (res.data?.guid) {
      createDialogVisible.value = false
      ElMessage.success('创建成功')
      handleShowDetail(res.data as unknown as ComponentItem)
    }
  } catch {
    ElMessage.error('创建失败')
  }
}

/** 取消创建 */
const handleCancelCreate = () => {
  createDialogVisible.value = false
  createForm.programName = ''
}

/** 删除 */
const handleDelete = async () => {
  if (!currentRow.value) {
    ElMessage.warning('请选择一条数据进行删除')
    return
  }

  if (currentRow.value.appUser !== currentRow.value.empNo) {
    ElMessage.warning('不可删除他人项目')
    return
  }

  if (currentRow.value.maStatus !== '01') {
    ElMessage.warning('必须是"编制"才可以删除')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除该记录吗？', '提示', {
      type: 'warning'
    })
    const res = await deleteComponent(currentRow.value.guid)
    if (res.data?.flag === 1) {
      ElMessage.success('删除成功')
      handleSearch()
    }
  } catch (error: unknown) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

/** 撤回 */
const handleRetract = async () => {
  if (!currentRow.value) {
    ElMessage.warning('请选择一条数据进行退回')
    return
  }

  if (currentRow.value.appUser !== currentRow.value.empNo) {
    ElMessage.warning('不可撤回他人项目')
    return
  }

  if (['01', '00', '03'].includes(currentRow.value.maStatus)) {
    ElMessage.warning('必须是在流程中才可以退回')
    return
  }

  try {
    await ElMessageBox.confirm('确定要撤回该记录吗？', '提示', {
      type: 'warning'
    })
    const res = await retractComponent(currentRow.value.guid)
    if (res.data?.flag === 1) {
      ElMessage.success('退回成功')
      handleSearch()
    }
  } catch (error: unknown) {
    if (error !== 'cancel') {
      ElMessage.error('退回失败')
    }
  }
}

/** 打印（通过 axios 获取 PDF Blob，避免 Token 暴露在 URL 中） */
const handlePrint = async () => {
  if (!currentRow.value) {
    ElMessage.warning('请选择一条数据进行打印')
    return
  }

  try {
    const res = await request.get('/components/printPdf', {
      params: { billNo: currentRow.value.billNo },
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(res as unknown as Blob)
    window.open(url)
  } catch {
    ElMessage.error('打印失败')
  }
}

/** 查看详情 */
const handleShowDetail = (row: ComponentItem) => {
  currentBillNo.value = row.billNo || ''
  currentGuid.value = row.guid || ''
  // maStatus 为 01(编制) 或 00(退回) 时可编辑，否则只读
  const status = row.maStatus || '01'
  isReadOnly.value = !(status === '01' || status === '00')
  createDialogVisible2.value = true
}

/** 查看流程 */
const handleShowBpm = (_pid: string) => {
  // TODO: 打开流程追踪窗口
  ElMessage.info('流程追踪功能待实现')
}

/** 处理弹窗关闭 */
const handleCreateDialogClose = (refresh: boolean) => {
  createDialogVisible2.value = false
  if (refresh) {
    handleSearch()
  }
}

/** 表格行选择变化 */
const handleRowChange = (row: ComponentItem | null) => {
  currentRow.value = row
}

/** 分页大小变化 */
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  handleSearch()
}

/** 当前页变化 */
const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  handleSearch()
}

/** 初始化 */
onMounted(() => {
  loadCompanies()
  // 设置默认日期范围为最近一个月
  const now = new Date()
  const lastMonth = new Date(now.getTime())
  lastMonth.setMonth(now.getMonth() - 1)
  searchForm.dateFrom = lastMonth
  searchForm.dateTo = now
})
</script>

<style scoped>
/* ========== 页面容器 ========== */
.page4-container {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 0 16px 0;
  background: #f0f2f5;
}

/* ========== 搜索栏 ========== */
.search-card {
  margin-bottom: 12px;
  width: 100%;
  border-radius: 12px;
  border: none;
  background: #fff;
}

.search-card :deep(.el-card__body) {
  padding: 16px 20px 6px 20px;
}

.card-header-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-title .el-icon {
  font-size: 16px;
  color: #6366f1;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.search-form :deep(.el-form-item) {
  margin-right: 16px;
  margin-bottom: 14px;
}

.search-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.date-separator {
  margin: 0 8px;
  color: #909399;
  font-size: 13px;
}

/* ========== 操作按钮栏 ========== */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 2px;
}

.action-left,
.action-right {
  display: flex;
  gap: 8px;
}

.action-left .action-btn {
  border-radius: 8px;
  font-weight: 500;
}

.action-right .action-btn {
  border-radius: 8px;
  font-weight: 500;
  color: #606266;
  border-color: #dcdfe6;
}

.action-right .action-btn:not(:disabled):hover {
  color: #6366f1;
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

/* 各按钮主色调 */
.action-btn.is-primary {
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

/* ========== 表格卡片 ========== */
.table-card {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: none;
  background: #fff;
  overflow: hidden;
}

.table-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* 表格头部 */
.table-card :deep(.el-table__header-wrapper th.el-table__cell) {
  background: #f8f9fd !important;
  color: #303133;
  font-weight: 600;
  font-size: 13px;
  padding: 12px 0;
  border-bottom: 2px solid #e8ecf4;
}

.table-card :deep(.el-table__body-wrapper td.el-table__cell) {
  padding: 10px 0;
  font-size: 13px;
  color: #4a4a5a;
  transition: background 0.15s;
}

.table-card :deep(.el-table__row:hover td.el-table__cell) {
  background: #f5f6ff !important;
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: #f9fafc;
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped:hover td.el-table__cell) {
  background: #f0f1ff !important;
}

.table-card :deep(.el-table__body tr.current-row > td.el-table__cell) {
  background: #eeefff !important;
}

/* 表格内部边框颜色 */
.table-card :deep(.el-table--border th.el-table__cell),
.table-card :deep(.el-table--border td.el-table__cell) {
  border-right-color: #ebeef5;
}

.table-card :deep(.el-table--border) {
  border-color: #ebeef5;
}

/* 链接按钮 */
.link-btn {
  font-weight: 500;
}

/* 空数据占位 */
.no-data {
  color: #c0c4cc;
}

/* ========== 分页 ========== */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 14px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafbfc;
}

.pagination-container :deep(.el-pagination) {
  font-weight: 400;
}

.pagination-container :deep(.el-pagination .el-pagination__total) {
  color: #606266;
}

/* ========== 表格加载动画 ========== */
.table-card :deep(.el-loading-mask) {
  border-radius: 0 0 12px 12px;
}
</style>
