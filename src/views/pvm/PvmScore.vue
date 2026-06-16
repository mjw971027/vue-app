<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadProps } from 'element-plus'
import {
  selectPriceVerifMtScore,
  savePvmMtScoreData,
  deletePvmMtScoreData,
  getPvmMtType,
  type PvmMtType,
  type PvmScoreItem,
} from '@/api/pvm'

const loading = ref(false)
const filterCompany = ref('')
const filterType = ref('')
const tableData = ref<PvmScoreItem[]>([])
const mtTypeOptions = ref<PvmMtType[]>([])

const companyOptions = [
  { value: 'SEM', label: 'SEM' },
  { value: 'TIME', label: 'TIME' },
  { value: 'OTHER', label: '其他' },
]

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => (dialogMode.value === 'add' ? '新增评分' : '编辑评分'))
const dialogFormRef = ref<FormInstance>()
const dialogForm = reactive<PvmScoreItem>({
  dbId: '',
  subcCd: '',
  subcDesc: '',
  score: 0,
  remark: '',
  verifMtTypeCd: '',
})
const dialogRules: FormRules = {
  subcCd: [{ required: true, message: '请输入供应商编码', trigger: 'blur' }],
  subcDesc: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  score: [{ required: true, message: '请输入分数', trigger: 'blur' }],
}

const fetchMtTypes = async () => {
  try {
    const res: any = await getPvmMtType('')
    const list: any[] = res?.data || res || []
    mtTypeOptions.value = list
  } catch (e) {
    mtTypeOptions.value = []
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await selectPriceVerifMtScore(filterCompany.value, filterType.value)
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    tableData.value = list.map((r: any) => ({
      dbId: r.dbId || r.id || '',
      subcCd: r.subcCd || r.supplierCd || '',
      subcDesc: r.subcDesc || r.supplierDesc || r.name || '',
      score: Number(r.score) || 0,
      remark: r.remark || '',
      verifMtTypeCd: r.verifMtTypeCd || r.mtTypeCd || filterType.value,
    }))
  } catch (e) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  dialogMode.value = 'add'
  dialogForm.dbId = ''
  dialogForm.subcCd = ''
  dialogForm.subcDesc = ''
  dialogForm.score = 0
  dialogForm.remark = ''
  dialogForm.verifMtTypeCd = filterType.value || ''
  dialogVisible.value = true
}

const openEditDialog = (row: PvmScoreItem) => {
  dialogMode.value = 'edit'
  dialogForm.dbId = row.dbId || ''
  dialogForm.subcCd = row.subcCd || ''
  dialogForm.subcDesc = row.subcDesc || ''
  dialogForm.score = row.score || 0
  dialogForm.remark = row.remark || ''
  dialogForm.verifMtTypeCd = row.verifMtTypeCd || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!dialogFormRef.value) return
  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const payload = JSON.stringify([
        {
          dbId: dialogForm.dbId || undefined,
          subcCd: dialogForm.subcCd,
          subcDesc: dialogForm.subcDesc,
          score: dialogForm.score,
          remark: dialogForm.remark,
          verifMtTypeCd: dialogForm.verifMtTypeCd,
        },
      ])
      await savePvmMtScoreData(dialogMode.value === 'add' ? 'A' : 'U', payload)
      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '编辑成功')
      dialogVisible.value = false
      fetchList()
    } catch (e) {
      ElMessage.error('保存失败')
    }
  })
}

const handleDelete = async (row: PvmScoreItem) => {
  try {
    await ElMessageBox.confirm(`确认删除供应商评分 ${row.subcDesc}（${row.subcCd}）？`, '提示', { type: 'warning' })
    await deletePvmMtScoreData(JSON.stringify([{ dbId: row.dbId, subcCd: row.subcCd }]))
    ElMessage.success('删除成功')
    fetchList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const uploadBefore: UploadProps['beforeUpload'] = (file) => {
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件（.xlsx / .xls）')
    return false
  }
  ElMessage.success('文件已处理（演示模式）')
  return false
}

const downloadTemplate = () => {
  const header = '供应商编码,供应商名称,分数,备注,评审会类型\n'
  const sample = 'SUB-001,示例供应商,95,优质供应商,TYPE-A\n'
  const content = header + sample
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'pvm_score_template.csv'
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('模板已下载')
}

onMounted(() => {
  fetchMtTypes()
  fetchList()
})
</script>

<template>
  <div class="page">
    <h2>供应商评分配置</h2>

    <el-card shadow="never" class="toolbar-card">
      <el-form inline label-width="110px">
        <el-form-item label="公司">
          <el-select v-model="filterCompany" placeholder="全部" clearable style="width: 180px" @change="fetchList">
            <el-option v-for="c in companyOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="评审会类型">
          <el-select v-model="filterType" placeholder="全部" clearable filterable style="width: 220px" @change="fetchList">
            <el-option v-for="t in mtTypeOptions" :key="t.verifMtTypeCd" :label="t.verifMtTypeDesc || t.verifMtTypeCd" :value="t.verifMtTypeCd" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openAddDialog">➕ 新增评分</el-button>
          <el-button type="success" @click="downloadTemplate">📥 下载模板</el-button>
          <el-upload
            action="#"
            :before-upload="uploadBefore"
            :show-file-list="false"
            accept=".xlsx,.xls"
          >
            <el-button type="warning">📤 Excel 导入</el-button>
          </el-upload>
          <el-button @click="fetchList">🔄 刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table :data="tableData" v-loading="loading" border stripe highlight-current-row style="width: 100%">
      <el-table-column prop="dbId" label="ID" width="120" />
      <el-table-column prop="subcCd" label="供应商编码" width="160" />
      <el-table-column prop="subcDesc" label="供应商名称" min-width="220" show-overflow-tooltip />
      <el-table-column prop="score" label="分数" width="120">
        <template #default="{ row }">
          <el-tag :type="Number(row.score) >= 90 ? 'success' : Number(row.score) >= 70 ? 'warning' : 'danger'" effect="plain">
            {{ row.score }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="verifMtTypeCd" label="评审会类型" width="160">
        <template #default="{ row }">
          <el-tag type="primary" effect="plain">{{ row.verifMtTypeCd || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="110px">
        <el-form-item label="供应商编码" prop="subcCd">
          <el-input v-model="dialogForm.subcCd" placeholder="请输入供应商编码" />
        </el-form-item>
        <el-form-item label="供应商名称" prop="subcDesc">
          <el-input v-model="dialogForm.subcDesc" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="分数" prop="score">
          <el-input-number v-model="dialogForm.score" :min="0" :max="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="评审会类型">
          <el-select v-model="dialogForm.verifMtTypeCd" placeholder="请选择" filterable style="width: 100%">
            <el-option v-for="t in mtTypeOptions" :key="t.verifMtTypeCd" :label="t.verifMtTypeDesc || t.verifMtTypeCd" :value="t.verifMtTypeCd" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dialogForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page { padding: 20px; box-sizing: border-box; }
.page h2 { margin: 0 0 16px 0; font-size: 20px; color: #303133; }
.toolbar-card { margin-bottom: 12px; }
</style>
