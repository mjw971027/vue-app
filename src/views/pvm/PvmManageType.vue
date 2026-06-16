<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getPvmMtTypeDataByCompany, savePvmMtData, delPvmMtData, type PvmMtType } from '@/api/pvm'

const loading = ref(false)
const selectedCompany = ref('')
const tableData = ref<PvmMtType[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => (dialogMode.value === 'add' ? '新增评审会类型' : '编辑评审会类型'))
const dialogFormRef = ref<FormInstance>()
const dialogForm = reactive<PvmMtType>({
  dbId: '',
  verifMtTypeCd: '',
  verifMtTypeDesc: '',
  companyCd: '',
  remark: '',
})
const dialogRules: FormRules = {
  verifMtTypeCd: [{ required: true, message: '请输入类型编码', trigger: 'blur' }],
  verifMtTypeDesc: [{ required: true, message: '请输入类型描述', trigger: 'blur' }],
  companyCd: [{ required: true, message: '请选择公司主体', trigger: 'change' }],
}

const companyOptions = [
  { value: 'SEM', label: 'SEM' },
  { value: 'TIME', label: 'TIME' },
  { value: 'OTHER', label: '其他' },
]

const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await getPvmMtTypeDataByCompany(selectedCompany.value)
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    tableData.value = list.map((r: any) => ({
      dbId: r.dbId || r.id || r.Id || '',
      verifMtTypeCd: r.verifMtTypeCd || r.code || '',
      verifMtTypeDesc: r.verifMtTypeDesc || r.desc || r.description || '',
      companyCd: r.companyCd || r.company || r.companyEn || '',
      companyEn: r.companyEn || r.companyDesc || '',
      remark: r.remark || '',
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
  dialogForm.verifMtTypeCd = ''
  dialogForm.verifMtTypeDesc = ''
  dialogForm.companyCd = ''
  dialogForm.remark = ''
  dialogVisible.value = true
}

const openEditDialog = (row: PvmMtType) => {
  dialogMode.value = 'edit'
  dialogForm.dbId = row.dbId || ''
  dialogForm.verifMtTypeCd = row.verifMtTypeCd || ''
  dialogForm.verifMtTypeDesc = row.verifMtTypeDesc || ''
  dialogForm.companyCd = row.companyCd || ''
  dialogForm.remark = row.remark || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!dialogFormRef.value) return
  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const payload = JSON.stringify({
        dbId: dialogForm.dbId || undefined,
        verifMtTypeCd: dialogForm.verifMtTypeCd,
        verifMtTypeDesc: dialogForm.verifMtTypeDesc,
        companyCd: dialogForm.companyCd,
        remark: dialogForm.remark,
      })
      await savePvmMtData(dialogMode.value === 'add' ? 'A' : 'U', payload)
      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '编辑成功')
      dialogVisible.value = false
      fetchList()
    } catch (e) {
      ElMessage.error('保存失败')
    }
  })
}

const handleDelete = async (row: PvmMtType) => {
  try {
    await ElMessageBox.confirm(`确认删除评审会类型 ${row.verifMtTypeCd}？`, '提示', { type: 'warning' })
    await delPvmMtData(JSON.stringify([{ dbId: row.dbId, verifMtTypeCd: row.verifMtTypeCd }]))
    ElMessage.success('删除成功')
    fetchList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => fetchList())
</script>

<template>
  <div class="page">
    <h2>评审会类型管理</h2>

    <el-card shadow="never" class="toolbar-card">
      <el-form inline label-width="80px">
        <el-form-item label="公司主体">
          <el-select v-model="selectedCompany" placeholder="全部" clearable style="width: 200px" @change="fetchList">
            <el-option v-for="c in companyOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openAddDialog">➕ 新增</el-button>
          <el-button @click="fetchList">🔄 刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table :data="tableData" v-loading="loading" border stripe highlight-current-row style="width: 100%">
      <el-table-column prop="dbId" label="ID" width="120" />
      <el-table-column prop="verifMtTypeCd" label="类型编码" width="160" />
      <el-table-column prop="verifMtTypeDesc" label="类型描述" min-width="220" show-overflow-tooltip />
      <el-table-column prop="companyCd" label="公司主体" width="140">
        <template #default="{ row }">
          <el-tag type="primary" effect="plain">{{ row.companyCd || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="110px">
        <el-form-item label="类型编码" prop="verifMtTypeCd">
          <el-input v-model="dialogForm.verifMtTypeCd" placeholder="请输入类型编码" />
        </el-form-item>
        <el-form-item label="类型描述" prop="verifMtTypeDesc">
          <el-input v-model="dialogForm.verifMtTypeDesc" placeholder="请输入类型描述" />
        </el-form-item>
        <el-form-item label="公司主体" prop="companyCd">
          <el-select v-model="dialogForm.companyCd" placeholder="请选择公司主体" style="width: 100%">
            <el-option v-for="c in companyOptions" :key="c.value" :label="c.label" :value="c.value" />
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
