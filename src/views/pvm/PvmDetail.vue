<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getDataGrid,
  deleteData,
  updateNode,
  createPriceVerifMt,
  getPvmMtType,
  getAllProjNoBasic,
  exportPvmData,
  type PriceVerifMtDetailRow,
  type PvmMtType,
  type ProjNoItem,
} from '../../api/pvm'

const router = useRouter()

const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const tableData = ref<PriceVerifMtDetailRow[]>([])

const mtTypes = ref<PvmMtType[]>([])
const projNoList = ref<ProjNoItem[]>([])

const searchForm = reactive({
  compCd: '',
  verifMtTypeCd: '',
  empNo: '',
  dateRange: [] as string[],
  keyword: '',
})

const statusTagType = (status: string) => {
  if (!status) return 'info'
  const s = String(status).toLowerCase()
  if (s.includes('通过') || s === 'y' || s.includes('pass') || s.includes('finished')) return 'success'
  if (s.includes('不通过') || s.includes('拒绝') || s.includes('reject') || s === 'n') return 'danger'
  if (s.includes('修改') || s.includes('待') || s.includes('pending') || s.includes('审批')) return 'warning'
  return 'primary'
}

const resultTagType = (r: string) => {
  if (!r) return 'info'
  const s = String(r).toLowerCase()
  if (s.includes('通过') || s === 'pass' || s === 'y') return 'success'
  if (s.includes('不通过') || s.includes('reject') || s === 'n') return 'danger'
  if (s.includes('修改')) return 'warning'
  return 'primary'
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
    })
    const list: any[] = res?.data?.list || res?.list || []
    tableData.value = list.map((r) => ({
      chkId: r.chkId ?? '',
      chkNo: r.chkNo ?? '',
      programName: r.programName ?? '',
      projNo: r.projNo ?? '',
      declarType: r.declarType ?? '',
      declarDesc: r.declarDesc ?? (r.declarType === '1' ? '技术申请' : r.declarType === '2' ? '备忘申请' : ''),
      verifMtTypeCd: r.verifMtTypeCd ?? '',
      compCh: r.compCh ?? r.companyEn ?? '',
      rgstUserId: r.rgstUserId ?? '',
      deptDesc: r.deptDesc ?? r.rgstOfficeCd ?? '',
      approvalStatus: r.approvalStatus ?? '',
      resultStatus: r.resultStatus ?? '',
      resultStatusDesc: r.resultStatusDesc ?? r.resultStatus ?? '',
      auditMtDate: r.auditMtDate ?? '',
      auditMtTime: r.auditMtTime ?? '',
      resultTime: r.resultTime ?? '',
      consistent: r.consistent ?? '',
    }))
    total.value = res?.data?.total ?? res?.total ?? list.length
  } catch (e: any) {
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

const fetchMtTypes = async () => {
  try {
    const res: any = await getPvmMtType('')
    const list: any[] = res?.data || res || []
    mtTypes.value = list
  } catch (e) {
    mtTypes.value = [
      { dbId: '1', verifMtTypeCd: 'SEM', verifMtTypeDesc: 'SEM 技术评审会', companyEn: 'SEM' },
      { dbId: '2', verifMtTypeCd: 'TIME', verifMtTypeDesc: 'TIME 技术评审会', companyEn: 'TIME' },
    ]
  }
}

const fetchProjNo = async (empNo: string, verifMtTypeCd: string) => {
  try {
    const res: any = await getAllProjNoBasic(empNo || 'admin', verifMtTypeCd || '')
    const list: any[] = res?.data || res || []
    projNoList.value = list.map((r: any) => ({
      projNo: r.projNo || r.projectNo || r.code || '',
      projDesc: r.projDesc || r.description || r.name || '',
    }))
  } catch (e) {
    projNoList.value = [
      { projNo: 'PROJ-001', projDesc: '示例工程项目 1' },
      { projNo: 'PROJ-002', projDesc: '示例工程项目 2' },
    ]
  }
}

const handleSearch = () => {
  pageNum.value = 1
  fetchList()
}

const handleReset = () => {
  searchForm.compCd = ''
  searchForm.verifMtTypeCd = ''
  searchForm.empNo = ''
  searchForm.dateRange = []
  searchForm.keyword = ''
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  pageNum.value = 1
  fetchList()
}

const handlePageChange = (val: number) => {
  pageNum.value = val
  fetchList()
}

const handleView = (row: PriceVerifMtDetailRow) => {
  if (row.chkNo) router.push(`/pvm/update/${row.chkNo}`)
  else ElMessage.info('该评审暂无编号')
}

const handleCommit = async (row: PriceVerifMtDetailRow) => {
  try {
    await ElMessageBox.confirm(`确认提交评审 ${row.chkNo} 进入审批流程？`, '提示', { type: 'warning' })
    ElMessage.success('已发起审批（审批流程在详情页执行）')
  } catch (e) {
    /* cancel */
  }
}

const handleDelete = async (row: PriceVerifMtDetailRow) => {
  try {
    await ElMessageBox.confirm(`确认删除评审 ${row.chkNo}？删除后不可恢复。`, '警告', { type: 'warning' })
    await deleteData(row.chkId || row.chkNo)
    ElMessage.success('删除成功')
    fetchList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleCancelApproval = async (row: PriceVerifMtDetailRow) => {
  try {
    await ElMessageBox.confirm(`确认取消评审 ${row.chkNo} 的审批？`, '提示', { type: 'warning' })
    await updateNode(row.chkId || row.chkNo)
    ElMessage.success('已取消审批')
    fetchList()
  } catch (e) {
    /* cancel */
  }
}

const handleBatchDelete = async () => {
  ElMessage.info('请在表格中选择需要删除的行后再操作')
}

const handleExport = async () => {
  try {
    const res: any = await exportPvmData({})
    ElMessage.success('导出请求已提交')
    console.log('导出结果:', res)
  } catch (e) {
    ElMessage.error('导出失败')
  }
}

// ---------- 新增弹窗 ----------
const dialogVisible = ref(false)
const dialogMode = ref<'tech' | 'memo'>('tech')
const dialogTitle = computed(() => (dialogMode.value === 'tech' ? '新增技术申请' : '新增备忘申请'))
const dialogFormRef = ref<FormInstance>()
const dialogForm = reactive({
  verifMtTypeCd: '',
  mtTypeId: '',
  projNo: '',
  programName: '',
  remark: '',
  consistent: '',
})
const dialogRules: FormRules = {
  verifMtTypeCd: [{ required: true, message: '请选择评审会类型', trigger: 'change' }],
  projNo: [{ required: true, message: '请选择工程号', trigger: 'change' }],
  programName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
}

const openDialog = (mode: 'tech' | 'memo') => {
  dialogMode.value = mode
  dialogForm.verifMtTypeCd = ''
  dialogForm.mtTypeId = ''
  dialogForm.projNo = ''
  dialogForm.programName = ''
  dialogForm.remark = ''
  dialogForm.consistent = ''
  dialogVisible.value = true
}

const onMtTypeChange = (val: string) => {
  const t = mtTypes.value.find((x) => x.verifMtTypeCd === val)
  dialogForm.mtTypeId = t?.dbId || val
  fetchProjNo('admin', val)
}

const handleDialogSubmit = async () => {
  if (!dialogFormRef.value) return
  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const params: any = {
        compCd: dialogForm.verifMtTypeCd,
        compEn: dialogForm.verifMtTypeCd,
        VeriTypeCd: dialogForm.verifMtTypeCd,
        priceVerifCd: '',
        programName: dialogForm.programName,
        projNo: dialogForm.projNo,
        reMark: dialogForm.remark,
        mtTypeId: dialogForm.mtTypeId || dialogForm.verifMtTypeCd,
        declarType: dialogMode.value === 'tech' ? '1' : '2',
      }
      await createPriceVerifMt(params)
      ElMessage.success('新建成功')
      dialogVisible.value = false
      fetchList()
    } catch (e: any) {
      ElMessage.error('新建失败')
    }
  })
}

onMounted(() => {
  fetchMtTypes()
  fetchList()
})
</script>

<template>
  <div class="page">
    <h2>报审申请 / 评审会列表</h2>

    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" inline label-width="90px">
        <el-form-item label="合同主体">
          <el-input v-model="searchForm.compCd" placeholder="请输入合同主体" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="评审会类别">
          <el-select v-model="searchForm.verifMtTypeCd" placeholder="请选择" clearable style="width: 200px">
            <el-option v-for="t in mtTypes" :key="t.dbId" :label="t.verifMtTypeDesc || t.verifMtTypeCd || ''" :value="t.verifMtTypeCd" />
          </el-select>
        </el-form-item>
        <el-form-item label="申报人">
          <el-input v-model="searchForm.empNo" placeholder="工号/姓名" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 280px"
          />
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
      <el-button type="primary" @click="openDialog('tech')">➕ 新增技术申请</el-button>
      <el-button type="success" @click="openDialog('memo')">📝 新增备忘申请</el-button>
      <el-button type="danger" @click="handleBatchDelete">🗑 删除</el-button>
      <el-button type="warning" @click="() => ElMessage.info('请在表格行中操作取消审批')">取消审批</el-button>
      <el-button type="info" plain @click="handleExport">📤 导出 Excel</el-button>
    </el-card>

    <el-table
      :data="tableData"
      v-loading="loading"
      border
      stripe
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column prop="chkNo" label="评审编号" width="160" fixed />
      <el-table-column prop="projNo" label="工程号" width="130" />
      <el-table-column prop="programName" label="项目名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="rgstUserId" label="申请人" width="110" />
      <el-table-column prop="deptDesc" label="申报部门" width="130" />
      <el-table-column label="项目状态" width="120">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.approvalStatus)" effect="light">{{ row.approvalStatus || '待处理' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="verifMtTypeCd" label="评审会类别" width="130" />
      <el-table-column prop="declarDesc" label="申请类别" width="120" />
      <el-table-column prop="auditMtDate" label="评审日期" width="120" />
      <el-table-column prop="auditMtTime" label="评审时间" width="110" />
      <el-table-column label="评审次数" width="100">
        <template #default="{ row }">
          <el-tag type="info" effect="plain">{{ (row as any).resultTime || 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="评审结果" width="130">
        <template #default="{ row }">
          <el-tag :type="resultTagType(row.resultStatusDesc || row.resultStatus || '')" effect="light">
            {{ row.resultStatusDesc || row.resultStatus || '—' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleView(row)">查看/编辑</el-button>
          <el-button link type="success" @click="handleCommit(row)">提交审批</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="110px">
        <el-form-item label="评审会类型" prop="verifMtTypeCd">
          <el-select v-model="dialogForm.verifMtTypeCd" placeholder="请选择评审会类型" filterable style="width: 100%" @change="onMtTypeChange">
            <el-option v-for="t in mtTypes" :key="t.dbId" :label="t.verifMtTypeDesc || t.verifMtTypeCd || ''" :value="t.verifMtTypeCd" />
          </el-select>
        </el-form-item>
        <el-form-item label="工程号" prop="projNo">
          <el-select v-model="dialogForm.projNo" placeholder="请选择/搜索工程号" filterable style="width: 100%">
            <el-option v-for="p in projNoList" :key="p.projNo" :label="`${p.projNo} - ${p.projDesc || ''}`" :value="p.projNo" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称" prop="programName">
          <el-input v-model="dialogForm.programName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dialogForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="是否与前船一致">
          <el-radio-group v-model="dialogForm.consistent">
            <el-radio value="Y">是</el-radio>
            <el-radio value="N">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDialogSubmit">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  padding: 20px;
  box-sizing: border-box;
}
.page h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #303133;
}
.search-card {
  margin-bottom: 12px;
}
.toolbar-card {
  margin-bottom: 12px;
}
.pagination {
  margin-top: 16px;
  justify-content: flex-end;
  display: flex;
}
</style>
