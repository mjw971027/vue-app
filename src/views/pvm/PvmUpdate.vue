<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadProps } from 'element-plus'
import {
  getHeadInfo,
  updateHead,
  isSemOrTime,
  getPADataGridByChkId,
  commitData,
  urgentCommitData,
  getOpinionInfo,
  sectionAuditPerson,
  deptAuditPerson,
  getAttchmentDataGrid2WithoutType,
  deleteTech,
  type EmployeeDto,
} from '@/api/pvm'

const route = useRoute()
const router = useRouter()

const chkNo = computed(() => String(route.params.chkNo || ''))
const chkId = ref('')
const loading = ref(false)
const activeTab = ref('basic')

const headForm = reactive({
  chkNo: '',
  projNo: '',
  programName: '',
  remark: '',
  consistent: '',
  rgstUserId: '',
  deptDesc: '',
})
const headFormRef = ref<FormInstance>()
const headRules: FormRules = {
  programName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
}

const semOrTime = ref('SEM')
const paDataList = ref<any[]>([])

const attachmentList = ref<any[]>([])

const opinionList = ref<any[]>([])
const sectionAuditorList = ref<EmployeeDto[]>([])
const deptAuditorList = ref<EmployeeDto[]>([])
const selectedSectionAuditor = ref('')
const selectedDeptAuditor = ref('')

const fetchHeadInfo = async () => {
  loading.value = true
  try {
    const res: any = await getHeadInfo(chkNo.value)
    const d: any = res?.data || res || {}
    chkId.value = d.chkId || d.Id || ''
    headForm.chkNo = d.chkNo || chkNo.value
    headForm.projNo = d.projNo || ''
    headForm.programName = d.programName || ''
    headForm.remark = d.remark || ''
    headForm.consistent = d.consistent || ''
    headForm.rgstUserId = d.rgstUserId || ''
    headForm.deptDesc = d.deptDesc || d.rgstOfficeCd || ''
  } catch (e) {
    ElMessage.error('加载评审信息失败')
  } finally {
    loading.value = false
  }
}

const fetchSemOrTime = async () => {
  try {
    const res: any = await isSemOrTime(chkId.value)
    semOrTime.value = String(res?.data || res || 'SEM').toUpperCase()
  } catch (e) {
    semOrTime.value = 'SEM'
  }
}

const fetchPAData = async () => {
  try {
    const res: any = await getPADataGridByChkId(chkId.value)
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    paDataList.value = list
  } catch (e) {
    paDataList.value = []
  }
}

const fetchAttachment = async () => {
  try {
    const res: any = await getAttchmentDataGrid2WithoutType(chkNo.value)
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    attachmentList.value = list.map((r: any) => ({
      id: r.id || r.Id || r.dbId || '',
      fileName: r.fileName || r.name || '',
      uploadTime: r.uploadTime || r.createTime || '',
      size: r.size || '',
      url: r.url || r.downloadUrl || '',
    }))
  } catch (e) {
    attachmentList.value = []
  }
}

const fetchAuditors = async () => {
  try {
    const r1: any = await sectionAuditPerson()
    const list1: any[] = r1?.data || r1 || []
    sectionAuditorList.value = list1.map((r: any) => ({
      empNo: r.empNo || r.id || '',
      empDesc: r.empDesc || r.name || '',
      deptDesc: r.deptDesc || '',
    }))
  } catch (e) {
    sectionAuditorList.value = []
  }
}

const fetchDeptAuditors = async (empNo: string) => {
  if (!empNo) {
    deptAuditorList.value = []
    return
  }
  try {
    const r: any = await deptAuditPerson(empNo)
    const list: any[] = r?.data || r || []
    deptAuditorList.value = list.map((x: any) => ({
      empNo: x.empNo || x.id || '',
      empDesc: x.empDesc || x.name || '',
    }))
  } catch (e) {
    deptAuditorList.value = []
  }
}

const fetchOpinion = async () => {
  try {
    const res: any = await getOpinionInfo(chkId.value)
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    opinionList.value = list
  } catch (e) {
    opinionList.value = []
  }
}

const handleUpdateHead = async () => {
  if (!headFormRef.value) return
  await headFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      await updateHead({
        ChkNo: headForm.chkNo,
        projNo: headForm.projNo,
        shipType: '',
        programName: headForm.programName,
        remark: headForm.remark,
        consistent: headForm.consistent,
      })
      ElMessage.success('更新成功')
    } catch (e) {
      ElMessage.error('更新失败')
    }
  })
}

const handleDeleteTech = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除当前技术协议行？', '提示', { type: 'warning' })
    await deleteTech(row.id || row.Id || row.dbId || '')
    ElMessage.success('删除成功')
    fetchPAData()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleDownload = (row: any) => {
  if (row.url) {
    window.open(row.url, '_blank')
  } else {
    ElMessage.info('暂无下载链接')
  }
}

const handleDeleteAttachment = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认删除附件 ${row.fileName}？`, '提示', { type: 'warning' })
    ElMessage.success('删除成功')
    fetchAttachment()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const uploadBefore: UploadProps['beforeUpload'] = (file) => {
  const isOk = file.size / 1024 / 1024 < 20
  if (!isOk) ElMessage.warning('文件大小不能超过 20MB')
  return isOk
}

const uploadChange: UploadProps['onSuccess'] = () => {
  ElMessage.success('附件上传成功')
  fetchAttachment()
}

const handleSectionCommit = async () => {
  if (!selectedSectionAuditor.value) {
    ElMessage.warning('请选择科室审批人')
    return
  }
  try {
    await ElMessageBox.confirm('确认提交至科室审批？', '提示', { type: 'warning' })
    await commitData({
      chkId: chkId.value,
      auditEmp: selectedSectionAuditor.value,
      ChkNo: headForm.chkNo,
      projNo: headForm.projNo,
      programName: headForm.programName,
      remark: headForm.remark,
      consistent: headForm.consistent,
    })
    ElMessage.success('已提交科室审批')
    fetchOpinion()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('提交失败')
  }
}

const handleDeptCommit = async () => {
  if (!selectedDeptAuditor.value) {
    ElMessage.warning('请选择部门审批人')
    return
  }
  try {
    await ElMessageBox.confirm('确认提交至部门审批？', '提示', { type: 'warning' })
    ElMessage.success('已提交部门审批')
    fetchOpinion()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('提交失败')
  }
}

const handleUrgentCommit = async () => {
  try {
    await ElMessageBox.confirm('确认紧急提交？将跳过部分审批节点。', '提示', { type: 'warning' })
    await urgentCommitData({
      chkId: chkId.value,
      ChkNo: headForm.chkNo,
      projNo: headForm.projNo,
      programName: headForm.programName,
      remark: headForm.remark,
      consistent: headForm.consistent,
    })
    ElMessage.success('已紧急提交')
    fetchOpinion()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('提交失败')
  }
}

const backToList = () => router.push('/pvm/detail')

onMounted(() => {
  fetchHeadInfo()
  fetchAuditors()
})
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h2>评审会详情 / 编辑 - {{ chkNo }}</h2>
      <el-button @click="backToList">← 返回列表</el-button>
    </div>

    <el-tabs v-model="activeTab" v-loading="loading" @tab-change="(name: string) => {
      if (name === 'tech') { fetchSemOrTime(); fetchPAData() }
      if (name === 'attach') fetchAttachment()
      if (name === 'approval') fetchOpinion()
    }">
      <el-tab-pane label="基本信息" name="basic">
        <el-card shadow="never">
          <el-form ref="headFormRef" :model="headForm" :rules="headRules" label-width="120px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="评审编号">
                  <el-input v-model="headForm.chkNo" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工程号">
                  <el-input v-model="headForm.projNo" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="项目名称" prop="programName">
                  <el-input v-model="headForm.programName" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="备注">
                  <el-input v-model="headForm.remark" type="textarea" :rows="3" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否与前船一致">
                  <el-radio-group v-model="headForm.consistent">
                    <el-radio value="Y">是</el-radio>
                    <el-radio value="N">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="申请人">
                  <el-input v-model="headForm.rgstUserId" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="申报部门">
                  <el-input v-model="headForm.deptDesc" disabled />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button type="primary" @click="handleUpdateHead">更新</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="技术协议" name="tech">
        <el-card shadow="never">
          <div class="tech-header">
            <el-tag :type="semOrTime === 'SEM' ? 'primary' : 'success'" effect="dark">当前类型：{{ semOrTime }}</el-tag>
            <el-button type="primary" size="small" @click="fetchPAData">🔄 刷新</el-button>
          </div>
          <el-table :data="paDataList" border stripe highlight-current-row style="width: 100%; margin-top: 12px">
            <el-table-column prop="projNo" label="工程号" width="140" />
            <el-table-column prop="techDesc" label="说明" min-width="220" show-overflow-tooltip />
            <el-table-column prop="taNo" label="技术协议编号" width="180" />
            <el-table-column prop="attachment" label="附件" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button link type="danger" @click="handleDeleteTech(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="附件管理" name="attach">
        <el-card shadow="never">
          <div class="attach-header">
            <el-upload
              action="#"
              :before-upload="uploadBefore"
              :on-success="uploadChange"
              :show-file-list="false"
            >
              <el-button type="primary">📤 上传附件</el-button>
            </el-upload>
            <el-button @click="fetchAttachment">🔄 刷新</el-button>
          </div>
          <el-table :data="attachmentList" border stripe highlight-current-row style="width: 100%; margin-top: 12px">
            <el-table-column prop="fileName" label="文件名" min-width="240" show-overflow-tooltip />
            <el-table-column prop="uploadTime" label="上传时间" width="180" />
            <el-table-column prop="size" label="大小" width="120" />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
                <el-button link type="danger" @click="handleDeleteAttachment(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="审批流程" name="approval">
        <el-card shadow="never" class="approval-card">
          <div class="commit-bar">
            <el-select v-model="selectedSectionAuditor" placeholder="选择科室审批人" filterable style="width: 220px" @change="fetchDeptAuditors(selectedSectionAuditor)">
              <el-option v-for="p in sectionAuditorList" :key="p.empNo" :label="`${p.empNo} - ${p.empDesc || ''}`" :value="p.empNo" />
            </el-select>
            <el-button type="primary" @click="handleSectionCommit">科室提交</el-button>
            <el-select v-model="selectedDeptAuditor" placeholder="选择部门审批人" filterable style="width: 220px" :disabled="!selectedSectionAuditor">
              <el-option v-for="p in deptAuditorList" :key="p.empNo" :label="`${p.empNo} - ${p.empDesc || ''}`" :value="p.empNo" />
            </el-select>
            <el-button type="success" @click="handleDeptCommit">部门提交</el-button>
            <el-button type="danger" @click="handleUrgentCommit">紧急提交</el-button>
          </div>

          <el-table :data="opinionList" border stripe highlight-current-row style="width: 100%; margin-top: 16px">
            <el-table-column prop="nodeName" label="节点" width="160" />
            <el-table-column prop="approver" label="审批人" width="140" />
            <el-table-column prop="status" label="状态" width="120">
              <template #default="{ row }">
                <el-tag type="primary" effect="light">{{ row.status || '—' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="opinion" label="审批意见" min-width="300" show-overflow-tooltip />
            <el-table-column prop="time" label="时间" width="180" />
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.page { padding: 20px; box-sizing: border-box; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-header h2 { margin: 0; font-size: 20px; color: #303133; }
.tech-header { display: flex; align-items: center; gap: 12px; }
.attach-header { display: flex; gap: 8px; }
.commit-bar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
</style>
