<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAuditMtNoByMtTypeIdS,
  cancelAuditMt,
  getPvmMtType,
  type PvmMtType,
} from '../../api/pvm'

interface MtNoItem {
  dbId: string
  auditMtNo: string
  auditMtDate: string
  auditMtTime: string
  verifMtTypeCd?: string
  verifMtTypeDesc?: string
  [k: string]: any
}

const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(20)
const total = ref(0)
const tableData = ref<MtNoItem[]>([])
const mtTypes = ref<PvmMtType[]>([])
const allData = ref<MtNoItem[]>([])

const searchForm = reactive({
  verifMtTypeCd: '',
  mtTypeId: '',
  dateRange: [] as string[],
})

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
    const mtTypeId = searchForm.mtTypeId || searchForm.verifMtTypeCd || ''
    const res: any = await getAuditMtNoByMtTypeIdS(mtTypeId, d1, d2)
    const list: any[] = res?.data || res || []
    allData.value = list.map((r, i) => ({
      dbId: r.dbId || r.id || String(i),
      auditMtNo: r.auditMtNo || r.meetingNo || '',
      auditMtDate: r.auditMtDate || r.date || '',
      auditMtTime: r.auditMtTime || r.time || '',
      verifMtTypeCd: r.verifMtTypeCd || r.mtTypeCd || searchForm.verifMtTypeCd || '',
      verifMtTypeDesc: r.verifMtTypeDesc || '',
      ...r,
    }))
    total.value = allData.value.length
    updatePage()
  } catch (e) {
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

const updatePage = () => {
  const start = (pageNum.value - 1) * pageSize.value
  tableData.value = allData.value.slice(start, start + pageSize.value)
}

const handleSearch = () => {
  pageNum.value = 1
  fetchList()
}

const handleReset = () => {
  searchForm.verifMtTypeCd = ''
  searchForm.mtTypeId = ''
  searchForm.dateRange = []
  handleSearch()
}

const onMtTypeChange = (val: string) => {
  const t = mtTypes.value.find((x) => x.verifMtTypeCd === val)
  searchForm.mtTypeId = t?.dbId || val
}

const handleView = (row: MtNoItem) => {
  ElMessage.info(`查看会议详情: ${row.auditMtNo}`)
}

const handleCancel = async (row: MtNoItem) => {
  try {
    await ElMessageBox.confirm(`确认取消会议 ${row.auditMtNo}？取消后不可恢复。`, '警告', { type: 'warning' })
    await cancelAuditMt(row.dbId)
    ElMessage.success('已取消会议')
    fetchList()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('取消失败')
  }
}

const handleSizeChange = (v: number) => { pageSize.value = v; pageNum.value = 1; updatePage() }
const handlePageChange = (v: number) => { pageNum.value = v; updatePage() }

onMounted(() => {
  fetchMtTypes()
  fetchList()
})
</script>

<template>
  <div class="page">
    <h2>会议编号列表</h2>

    <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" inline label-width="100px">
        <el-form-item label="评审会类别">
          <el-select v-model="searchForm.verifMtTypeCd" placeholder="请选择" clearable filterable style="width: 220px" @change="onMtTypeChange">
            <el-option v-for="t in mtTypes" :key="t.dbId" :label="t.verifMtTypeDesc || t.verifMtTypeCd || ''" :value="t.verifMtTypeCd" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 280px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">🔍 搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table :data="tableData" v-loading="loading" border stripe highlight-current-row style="width: 100%">
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column prop="auditMtNo" label="会议编号" width="220" fixed />
      <el-table-column prop="auditMtDate" label="会议日期" width="140" />
      <el-table-column prop="auditMtTime" label="会议时间" width="130" />
      <el-table-column label="所属类别" width="180">
        <template #default="{ row }">
          <el-tag type="primary" effect="light">{{ row.verifMtTypeDesc || row.verifMtTypeCd || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleView(row)">查看详情</el-button>
          <el-button link type="danger" @click="handleCancel(row)">取消会议</el-button>
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
.search-card { margin-bottom: 12px; }
.pagination { margin-top: 16px; justify-content: flex-end; display: flex; }
</style>
