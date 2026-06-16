<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  selectBasicApplicant,
  saveBasicApplicantData,
  deletePvmApplicantData,
  updateBasicApplicantData,
  getEmpData,
  getPvmMtType,
  type PvmMtType,
  type PvmApplicantItem,
  type EmployeeDto,
} from '@/api/pvm'

const loading = ref(false)
const filterCompany = ref('')
const filterType = ref('')
const tableData = ref<PvmApplicantItem[]>([])
const mtTypeOptions = ref<PvmMtType[]>([])

const companyOptions = [
  { value: 'SEM', label: 'SEM' },
  { value: 'TIME', label: 'TIME' },
  { value: 'OTHER', label: '其他' },
]

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => (dialogMode.value === 'add' ? '新增申请人' : '编辑申请人'))
const dialogFormRef = ref<FormInstance>()
const dialogForm = reactive<PvmApplicantItem & { companyCd?: string }>({
  dbId: '',
  empNo: '',
  empDesc: '',
  deptId: '',
  deptDesc: '',
  verifMtTypeCd: '',
  companyCd: '',
})
const dialogRules: FormRules = {
  empNo: [{ required: true, message: '请选择员工', trigger: 'change' }],
  verifMtTypeCd: [{ required: true, message: '请选择评审会类型', trigger: 'change' }],
  companyCd: [{ required: true, message: '请选择公司', trigger: 'change' }],
}

const empKeyword = ref('')
const empLoading = ref(false)
const empList = ref<EmployeeDto[]>([])
const empSearchVisible = ref(false)

const fetchMtTypes = async () => {
  try {
    const res: any = await getPvmMtType('')
    const list: any[] = res?.data || res || []
    mtTypeOptions.value = list.map((r: any) => ({
      dbId: r.dbId || r.id || '',
      verifMtTypeCd: r.verifMtTypeCd || r.code || '',
      verifMtTypeDesc: r.verifMtTypeDesc || r.description || '',
    }))
  } catch (e) {
    mtTypeOptions.value = []
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await selectBasicApplicant({
      company: filterCompany.value,
      verifMtTypeCd: filterType.value,
    })
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    tableData.value = list.map((r: any) => ({
      dbId: r.dbId || r.id || '',
      empNo: r.empNo || r.userId || '',
      empDesc: r.empDesc || r.userName || r.name || '',
      deptId: r.deptId || '',
      deptDesc: r.deptDesc || r.dept || '',
      verifMtTypeCd: r.verifMtTypeCd || r.mtTypeCd || '',
      companyCd: r.companyCd || r.company || '',
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
  dialogForm.empNo = ''
  dialogForm.empDesc = ''
  dialogForm.deptId = ''
  dialogForm.deptDesc = ''
  dialogForm.verifMtTypeCd = filterType.value || ''
  dialogForm.companyCd = filterCompany.value || ''
  dialogVisible.value = true
}

const openEditDialog = (row: PvmApplicantItem & { companyCd?: string }) => {
  dialogMode.value = 'edit'
  dialogForm.dbId = row.dbId || ''
  dialogForm.empNo = row.empNo || ''
  dialogForm.empDesc = row.empDesc || ''
  dialogForm.deptId = row.deptId || ''
  dialogForm.deptDesc = row.deptDesc || ''
  dialogForm.verifMtTypeCd = row.verifMtTypeCd || ''
  dialogForm.companyCd = row.companyCd || ''
  dialogVisible.value = true
}

const openEmpSearch = () => {
  empKeyword.value = ''
  empList.value = []
  empSearchVisible.value = true
}

const searchEmp = async () => {
  empLoading.value = true
  try {
    const res: any = await getEmpData(0, 20, '', '', empKeyword.value)
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    empList.value = list.map((r: any) => ({
      empNo: r.empNo || r.userId || '',
      empId: r.empId || r.id || '',
      empDesc: r.empDesc || r.userName || r.name || '',
      deptId: r.deptId || '',
      deptDesc: r.deptDesc || r.dept || '',
    }))
  } catch (e) {
    empList.value = []
  } finally {
    empLoading.value = false
  }
}

const selectEmp = (row: EmployeeDto) => {
  dialogForm.empNo = row.empNo || ''
  dialogForm.empDesc = row.empDesc || ''
  dialogForm.deptId = row.deptId || ''
  dialogForm.deptDesc = row.deptDesc || ''
  empSearchVisible.value = false
}

const handleSubmit = async () => {
  if (!dialogFormRef.value) return
  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const payload = JSON.stringify([
        {
          dbId: dialogForm.dbId || undefined,
          empNo: dialogForm.empNo,
          empDesc: dialogForm.empDesc,
          deptId: dialogForm.deptId,
          deptDesc: dialogForm.deptDesc,
          verifMtTypeCd: dialogForm.verifMtTypeCd,
          companyCd: dialogForm.companyCd,
        },
      ])
      if (dialogMode.value === 'add') {
        await saveBasicApplicantData(dialogForm.verifMtTypeCd || '', payload)
      } else {
        await updateBasicApplicantData(payload)
      }
      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '编辑成功')
      dialogVisible.value = false
      fetchList()
    } catch (e) {
      ElMessage.error('保存失败')
    }
  })
}

const handleDelete = async (row: PvmApplicantItem & { companyCd?: string }) => {
  try {
    await ElMessageBox.confirm(`确认删除申请人 ${row.empDesc}（${row.empNo}）？`, '提示', { type: 'warning' })
    await deletePvmApplicantData(JSON.stringify([{ dbId: row.dbId, empNo: row.empNo }]))
    ElMessage.success('删除成功')
    fetchList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchMtTypes()
  fetchList()
})
</script>

<template>
  <div class="page">
    <h2>申请人配置</h2>

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
          <el-button type="primary" @click="openAddDialog">➕ 新增申请人</el-button>
          <el-button @click="fetchList">🔄 刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table :data="tableData" v-loading="loading" border stripe highlight-current-row style="width: 100%">
      <el-table-column prop="empNo" label="员工号" width="140" />
      <el-table-column prop="empDesc" label="姓名" width="160" />
      <el-table-column prop="deptDesc" label="部门" min-width="200" show-overflow-tooltip />
      <el-table-column prop="verifMtTypeCd" label="评审会类型" width="160">
        <template #default="{ row }">
          <el-tag type="success" effect="plain">{{ row.verifMtTypeCd || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="companyCd" label="公司" width="120">
        <template #default="{ row }">
          <el-tag type="primary" effect="plain">{{ (row as any).companyCd || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="110px">
        <el-form-item label="员工" prop="empNo">
          <el-input v-model="dialogForm.empNo" placeholder="点击右侧按钮搜索员工" readonly style="width: 70%" />
          <el-button type="primary" @click="openEmpSearch">选择员工</el-button>
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="dialogForm.empDesc" readonly />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="dialogForm.deptDesc" readonly />
        </el-form-item>
        <el-form-item label="评审会类型" prop="verifMtTypeCd">
          <el-select v-model="dialogForm.verifMtTypeCd" placeholder="请选择" filterable style="width: 100%">
            <el-option v-for="t in mtTypeOptions" :key="t.verifMtTypeCd" :label="t.verifMtTypeDesc || t.verifMtTypeCd" :value="t.verifMtTypeCd" />
          </el-select>
        </el-form-item>
        <el-form-item label="公司" prop="companyCd">
          <el-select v-model="dialogForm.companyCd" placeholder="请选择" style="width: 100%">
            <el-option v-for="c in companyOptions" :key="c.value" :label="c.label" :value="c.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="empSearchVisible" title="搜索员工" width="600px" destroy-on-close>
      <el-form inline label-width="100px">
        <el-form-item label="关键字">
          <el-input v-model="empKeyword" placeholder="工号 / 姓名" clearable style="width: 240px" />
          <el-button type="primary" @click="searchEmp" :loading="empLoading">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="empList" v-loading="empLoading" border highlight-current-row style="width: 100%" @row-click="(row: EmployeeDto) => selectEmp(row)">
        <el-table-column prop="empNo" label="工号" width="120" />
        <el-table-column prop="empDesc" label="姓名" width="160" />
        <el-table-column prop="deptDesc" label="部门" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="selectEmp(row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<style scoped>
.page { padding: 20px; box-sizing: border-box; }
.page h2 { margin: 0 0 16px 0; font-size: 20px; color: #303133; }
.toolbar-card { margin-bottom: 12px; }
</style>
