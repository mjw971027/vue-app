<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAuditMtNoByMtTypeId,
  setAuditMt,
  cancelAuditMt,
  selectMeetingSortData,
  saveAuditMtData,
  getCheckData,
  setResultStatus,
  getPvmMtType,
  type PvmMtType,
} from '../../api/pvm'

interface MtNoItem {
  dbId: string
  auditMtNo: string
  auditMtDate?: string
  auditMtTime?: string
  [k: string]: any
}

interface SortItem {
  chkId: string
  chkNo: string
  programName?: string
  projNo?: string
  sortNo?: number
  selected?: boolean
  [k: string]: any
}

interface ResultItem {
  chkId: string
  chkNo: string
  programName?: string
  projNo?: string
  resultStatus: string
  approveCd: string
  remark: string
}

const loading = ref(false)
const mtTypes = ref<PvmMtType[]>([])
const mtNoList = ref<MtNoItem[]>([])

const mtForm = reactive({
  verifMtTypeCd: '',
  mtTypeId: '',
  mtDate: '',
  mtTime: '',
  timeInterval: 15,
})

const resultForm = reactive({
  verifMtTypeCd: '',
  auditMtId: '',
})

const sortList = ref<SortItem[]>([])
const resultList = ref<ResultItem[]>([])

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

const onMtTypeChange = async (val: string) => {
  const t = mtTypes.value.find((x) => x.verifMtTypeCd === val)
  mtForm.mtTypeId = t?.dbId || val
  resultForm.verifMtTypeCd = val
  resultForm.auditMtId = ''
  try {
    const res: any = await getAuditMtNoByMtTypeId(mtForm.mtTypeId)
    const list: any[] = res?.data || res || []
    mtNoList.value = list.map((r) => ({
      dbId: r.dbId || r.id || String(Math.random()),
      auditMtNo: r.auditMtNo || r.meetingNo || '',
      auditMtDate: r.auditMtDate || r.date || '',
      auditMtTime: r.auditMtTime || r.time || '',
      ...r,
    }))
  } catch (e) {
    mtNoList.value = [
      { dbId: 'm1', auditMtNo: 'MT-2026-0601', auditMtDate: '2026-06-15', auditMtTime: '09:00' },
    ]
  }
}

const handleCreateMeeting = async () => {
  if (!mtForm.mtTypeId) { ElMessage.warning('请先选择评审会类别'); return }
  if (!mtForm.mtDate) { ElMessage.warning('请选择会议日期'); return }
  if (!mtForm.mtTime) { ElMessage.warning('请选择会议时间'); return }
  try {
    await setAuditMt({
      companyEngDesc: mtForm.verifMtTypeCd,
      mtTypeCd: mtForm.verifMtTypeCd,
      mtTypeId: mtForm.mtTypeId,
      auditMtDate: mtForm.mtDate,
      auditMtTime: mtForm.mtTime,
      timeInterval: mtForm.timeInterval,
      datas: JSON.stringify(sortList.value),
    })
    ElMessage.success('会议已生成')
    onMtTypeChange(mtForm.verifMtTypeCd)
  } catch (e) {
    ElMessage.error('生成会议失败')
  }
}

const handleCancelMt = async (row: MtNoItem) => {
  try {
    await ElMessageBox.confirm(`确认取消会议 ${row.auditMtNo}？`, '提示', { type: 'warning' })
    await cancelAuditMt(row.dbId)
    ElMessage.success('已取消会议')
    onMtTypeChange(mtForm.verifMtTypeCd)
  } catch (e) { /* cancel */ }
}

const handleLoadSort = async () => {
  if (!mtForm.mtTypeId) { ElMessage.warning('请先选择评审会类别'); return }
  loading.value = true
  try {
    const res: any = await selectMeetingSortData(mtForm.mtTypeId, '')
    const list: any[] = res?.data || res || []
    sortList.value = list.map((r, i) => ({
      chkId: r.chkId || r.id || String(i),
      chkNo: r.chkNo || r.code || '',
      programName: r.programName || '',
      projNo: r.projNo || '',
      sortNo: i + 1,
      selected: false,
    }))
    ElMessage.success(`已加载 ${sortList.value.length} 条排序数据`)
  } catch (e) {
    ElMessage.error('加载排序数据失败')
  } finally {
    loading.value = false
  }
}

const moveUp = (idx: number) => {
  if (idx <= 0) return
  const a = sortList.value[idx]
  sortList.value[idx] = sortList.value[idx - 1]
  sortList.value[idx - 1] = a
  sortList.value.forEach((r, i) => (r.sortNo = i + 1))
}

const moveDown = (idx: number) => {
  if (idx >= sortList.value.length - 1) return
  const a = sortList.value[idx]
  sortList.value[idx] = sortList.value[idx + 1]
  sortList.value[idx + 1] = a
  sortList.value.forEach((r, i) => (r.sortNo = i + 1))
}

const handleSaveSort = async () => {
  try {
    await saveAuditMtData(resultForm.auditMtId || mtForm.mtTypeId, JSON.stringify(sortList.value))
    ElMessage.success('排序已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const handleLoadResult = async () => {
  if (!resultForm.verifMtTypeCd) { ElMessage.warning('请先选择评审会类别'); return }
  if (!resultForm.auditMtId) { ElMessage.warning('请先选择会议编号'); return }
  loading.value = true
  try {
    const res: any = await getCheckData(resultForm.verifMtTypeCd, resultForm.auditMtId, '', '')
    const list: any[] = res?.data || res || []
    resultList.value = list.map((r, i) => ({
      chkId: r.chkId || r.id || String(i),
      chkNo: r.chkNo || r.code || '',
      programName: r.programName || '',
      projNo: r.projNo || '',
      resultStatus: '',
      approveCd: '',
      remark: '',
    }))
    ElMessage.success(`已加载 ${resultList.value.length} 条评审数据`)
  } catch (e) {
    ElMessage.error('加载评审数据失败')
  } finally {
    loading.value = false
  }
}

const handleSaveResult = async (row: ResultItem) => {
  try {
    await setResultStatus({
      chkId: row.chkId,
      auditMtId: resultForm.auditMtId,
      statusCd: row.resultStatus,
      approveCd: row.approveCd,
      remark: row.remark,
      auditMtNo: '',
    })
    ElMessage.success(`评审 ${row.chkNo} 结果已保存`)
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

onMounted(fetchMtTypes)
</script>

<template>
  <div class="page">
    <h2>会议管理</h2>

    <el-card shadow="never" class="block">
      <template #header><b>📅 生成会议编号</b></template>
      <el-form label-width="110px" inline>
        <el-form-item label="评审会类别">
          <el-select v-model="mtForm.verifMtTypeCd" placeholder="请选择" filterable style="width: 220px" @change="onMtTypeChange">
            <el-option v-for="t in mtTypes" :key="t.dbId" :label="t.verifMtTypeDesc || t.verifMtTypeCd || ''" :value="t.verifMtTypeCd" />
          </el-select>
        </el-form-item>
        <el-form-item label="会议日期">
          <el-date-picker v-model="mtForm.mtDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 180px" />
        </el-form-item>
        <el-form-item label="会议时间">
          <el-time-picker v-model="mtForm.mtTime" format="HH:mm" value-format="HH:mm" placeholder="选择时间" style="width: 160px" />
        </el-form-item>
        <el-form-item label="时间间隔(分钟)">
          <el-input-number v-model="mtForm.timeInterval" :min="5" :max="120" :step="5" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleCreateMeeting">生成会议编号</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="mtNoList" border stripe size="small" style="width: 100%; margin-top: 10px" v-if="mtNoList.length">
        <el-table-column prop="auditMtNo" label="会议编号" width="200" />
        <el-table-column prop="auditMtDate" label="日期" width="140" />
        <el-table-column prop="auditMtTime" label="时间" width="120" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button link type="danger" @click="handleCancelMt(row)">取消会议</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="block">
      <template #header><b>🔀 会议排序管理</b></template>
      <div class="block-toolbar">
        <el-button type="primary" plain @click="handleLoadSort">加载可排序数据</el-button>
        <el-button type="success" @click="handleSaveSort">💾 保存排序</el-button>
      </div>
      <el-table :data="sortList" v-loading="loading" border stripe style="width: 100%" empty-text="请先加载排序数据">
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="chkNo" label="评审编号" width="170" />
        <el-table-column prop="programName" label="项目名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="projNo" label="工程号" width="130" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ $index }">
            <el-button link type="primary" @click="moveUp($index)">⬆ 上移</el-button>
            <el-button link type="primary" @click="moveDown($index)">⬇ 下移</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="never" class="block">
      <template #header><b>✅ 评审结果录入</b></template>
      <el-form label-width="110px" inline>
        <el-form-item label="评审会类别">
          <el-select v-model="resultForm.verifMtTypeCd" placeholder="请选择" filterable style="width: 220px">
            <el-option v-for="t in mtTypes" :key="t.dbId" :label="t.verifMtTypeDesc || t.verifMtTypeCd || ''" :value="t.verifMtTypeCd" />
          </el-select>
        </el-form-item>
        <el-form-item label="会议编号">
          <el-select v-model="resultForm.auditMtId" placeholder="请选择会议编号" filterable style="width: 260px">
            <el-option v-for="m in mtNoList" :key="m.dbId" :label="m.auditMtNo" :value="m.dbId" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLoadResult">加载评审项目</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="resultList" v-loading="loading" border stripe style="width: 100%; margin-top: 10px" empty-text="请先加载评审项目">
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="chkNo" label="评审编号" width="170" />
        <el-table-column prop="programName" label="项目名称" min-width="220" show-overflow-tooltip />
        <el-table-column prop="projNo" label="工程号" width="130" />
        <el-table-column label="评审结果" width="160">
          <template #default="{ row }">
            <el-select v-model="row.resultStatus" placeholder="请选择" style="width: 100%">
              <el-option label="通过" value="PASS" />
              <el-option label="不通过" value="REJECT" />
              <el-option label="修改" value="MODIFY" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="审批代码" width="150">
          <template #default="{ row }">
            <el-input v-model="row.approveCd" placeholder="审批代码" />
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template #default="{ row }">
            <el-input v-model="row.remark" placeholder="评审备注" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleSaveResult(row)">保存</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.page { padding: 20px; box-sizing: border-box; }
.page h2 { margin: 0 0 16px 0; font-size: 20px; color: #303133; }
.block { margin-bottom: 16px; }
.block-toolbar { margin-bottom: 10px; }
</style>
