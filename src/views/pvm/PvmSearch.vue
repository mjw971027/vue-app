<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDataGrid,
  getPvmMtType,
  deleteData,
  updateNode,
  exportPvmData,
  type PriceVerifMtDetailRow,
  type PvmMtType,
} from '../../api/pvm'

const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const tableData = ref<PriceVerifMtDetailRow[]>([])
const mtTypes = ref<PvmMtType[]>([])

const searchForm = reactive({
  compCd: '',
  verifMtTypeCd: '',
  empNo: '',
  dateRange: [] as string[],
  resultApprove: '',
  auditMtNo: '',
  consistent: '',
  porNo: '',
  keyword: '',
})

const resultOptions = [
  { label: '通过', value: 'PASS' },
  { label: '不通过', value: 'REJECT' },
  { label: '修改', value: 'MODIFY' },
]

const statusTagType = (status: string) => {
  if (!status) return 'info'
  const s = String(status).toLowerCase()
  if (s.includes('通过') || s === 'y' || s.includes('pass') || s.includes('finished')) return 'success'
  if (s.includes('不通过') || s.includes('拒绝') || s.includes('reject') || s === 'n') return 'danger'
  if (s.includes('修改') || s.includes('待') || s.includes('pending')) return 'warning'
  return 'primary'
}

const fetchMtTypes = async () => {
  try {
    const res: any = await getPvmMtType('')
    const list: any[] = res?.data || res || []
    mtTypes.value = list
  } catch (e) {
    mtTypes.value = [
      { dbId: '1', verifMtTypeCd: 'SEM', verifMtTypeDesc: 'SEM 技术评审会' },
      { dbId: '2', verifMtTypeCd: 'TIME', verifMtTypeDesc: 'TIME 技术评审会' },
    ]
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const [d1, d2] = searchForm.dateRange && searchForm.dateRange.length === 2 ? [searchForm.dateRange[0], searchForm.dateRange[1]] : ['', '']
    const res: any = await getDataGrid({
      pageNum: pageNum.value - 1,
      pageSize: pageSize.value,
      code: searchForm.keyword,
      verifMtTypeCd: searchForm.verifMtTypeCd,
      empNo: searchForm.empNo,
      date1: d1,
      date2: d2,
      resultApprove: searchForm.resultApprove,
      auditMtNo: searchForm.auditMtNo,
      consistent: searchForm.consistent,
      porNo: searchForm.porNo,
    })
    const list: any[] = res?.data?.list || res?.list || []
    tableData.value = list.map((r) => ({
      chkId: r.chkId ?? '',
      chkNo: r.chkNo ?? '',
      programName: r.programName ?? '',
      projNo: r.projNo ?? '',
      declarType: r.declarType ?? '',
      declarDesc: r.declarDesc ?? '',
      verifMtTypeCd: r.verifMtTypeCd ?? '',
      compCh: r.compCh ?? r.companyEn ?? '',
      rgstUserId: r.rgstUserId ?? '',
      deptDesc: r.deptDesc ?? r.rgstOfficeCd ?? '',
      approvalStatus: r.approvalStatus ?? '',
      resultStatus: r.resultStatus ?? '',
      resultStatusDesc: r.resultStatusDesc ?? r.resultStatus ?? '',
      auditMtNo: r.auditMtNo ?? '',
      auditMtDate: r.auditMtDate ?? '',
      auditMtTime: r.auditMtTime ?? '',
      resultTime: r.resultTime ?? '',
      consistent: r.consistent ?? '',
      consistentDesc: r.consistentDesc ?? r.consistent ?? '',
    }))
    total.value = res?.data?.total ?? res?.total ?? list.length
  } catch (e: any) {
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageNum.value = 1
  fetchList()
}

const handleReset = () => {
  Object.keys(searchForm).forEach((k) => {
    if (k === 'dateRange') (searchForm as any)[k] = []
    else (searchForm as any)[k] = ''
  })
  handleSearch()
}

const handleSizeChange = (v: number) => { pageSize.value = v; pageNum.value = 1; fetchList() }
const handlePageChange = (v: number) => { pageNum.value = v; fetchList() }

const handleDelete = async (row: PriceVerifMtDetailRow) => {
  try {
    await ElMessageBox.confirm(`确认删除 ${row.chkNo}？`, '警告', { type: 'warning' })
    await deleteData(row.chkId || row.chkNo)
    ElMessage.success('删除成功')
    fetchList()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleCancelApproval = async (row: PriceVerifMtDetailRow) => {
  try {
    await ElMessageBox.confirm(`确认取消 ${row.chkNo} 的审批？`, '提示', { type: 'warning' })
    await updateNode(row.chkId || row.chkNo)
    ElMessage.success('已取消审批')
    fetchList()
  } catch (e) { /* cancel */ }
}

const handleExport = async () => {
  try {
    await exportPvmData({})
    ElMessage.success('导出请求已提交')
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

const handleGeneratePdf = () => {
  ElMessage.info('生成 PDF 功能已触发')
}

onMounted(() => {
  fetchMtTypes()
  fetchList()
})
</script>

<template>
  <div class="page">
    <h2>设计评标项目查询</h2>

    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" inline label-width="100px">
        <el-form-item label="合同主体">
          <el-input v-model="searchForm.compCd" placeholder="合同主体" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="评审会类别">
          <el-select v-model="searchForm.verifMtTypeCd" placeholder="请选择" clearable style="width: 180px">
            <el-option v-for="t in mtTypes" :key="t.dbId" :label="t.verifMtTypeDesc || t.verifMtTypeCd || ''" :value="t.verifMtTypeCd" />
          </el-select>
        </el-form-item>
        <el-form-item label="申报人">
          <el-input v-model="searchForm.empNo" placeholder="工号/姓名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" style="width: 260px" />
        </el-form-item>
        <el-form-item label="评审会结果">
          <el-select v-model="searchForm.resultApprove" placeholder="请选择" clearable style="width: 150px">
            <el-option v-for="o in resultOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="会议编号">
          <el-input v-model="searchForm.auditMtNo" placeholder="会议编号" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="是否一致">
          <el-select v-model="searchForm.consistent" placeholder="请选择" clearable style="width: 130px">
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
        </el-form-item>
        <el-form-item label="POR NO">
          <el-input v-model="searchForm.porNo" placeholder="POR NO" clearable style="width: 160px" />
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="searchForm.keyword" placeholder="评审编号/项目名称" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">🔍 搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="toolbar-card">
      <el-button type="primary" plain @click="handleGeneratePdf">📄 生成 PDF</el-button>
      <el-button type="info" plain @click="handleExport">📤 导出 Excel</el-button>
    </el-card>

    <el-table :data="tableData" v-loading="loading" border stripe highlight-current-row style="width: 100%">
      <el-table-column prop="auditMtNo" label="会议编号" width="150" fixed />
      <el-table-column prop="chkNo" label="评审编号" width="160" />
      <el-table-column prop="programName" label="项目名称" min-width="220" show-overflow-tooltip />
      <el-table-column prop="projNo" label="工程号" width="130" />
      <el-table-column prop="declarDesc" label="申请类别" width="120" />
      <el-table-column prop="rgstUserId" label="申请人" width="110" />
      <el-table-column prop="deptDesc" label="申报科室" width="130" />
      <el-table-column label="项目状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.approvalStatus)" effect="light">{{ row.approvalStatus || '待处理' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="评审会结果" width="130">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.resultStatusDesc || row.resultStatus || '')" effect="light">{{ row.resultStatusDesc || row.resultStatus || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="verifMtTypeCd" label="评审会类别" width="140" />
      <el-table-column prop="compCh" label="合同主体" width="130" />
      <el-table-column label="评审次数" width="100">
        <template #default="{ row }">
          <el-tag type="info" effect="plain">{{ (row as any).resultTime || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="是否与前船一致" width="140">
        <template #default="{ row }">
          <el-tag v-if="row.consistent === 'Y'" type="success" effect="light">是</el-tag>
          <el-tag v-else-if="row.consistent === 'N'" type="danger" effect="light">否</el-tag>
          <el-tag v-else type="info" effect="plain">—</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          <el-button link type="warning" @click="handleCancelApproval(row)">取消审批</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      background
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<style scoped>
.page { padding: 20px; box-sizing: border-box; }
.page h2 { margin: 0 0 16px 0; font-size: 20px; color: #303133; }
.search-card, .toolbar-card { margin-bottom: 12px; }
.pagination { margin-top: 16px; justify-content: flex-end; display: flex; }
</style>
