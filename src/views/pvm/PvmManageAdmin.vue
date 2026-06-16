<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  selectBasicPvmAdminUser,
  savePvmAdminUserData,
  deletePvmAdminUserData,
  getEmpData,
  getPvmMtType,
  type PvmMtType,
  type EmployeeDto,
} from '@/api/pvm'

interface AdminRow {
  dbId: string
  empNo: string
  empDesc: string
  deptDesc: string
  verifMtTypeCd: string
}

const loading = ref(false)
const selectedType = ref('')
const tableData = ref<AdminRow[]>([])
const mtTypeOptions = ref<PvmMtType[]>([])

const addDialogVisible = ref(false)
const empKeyword = ref('')
const empLoading = ref(false)
const empList = ref<EmployeeDto[]>([])
const empSelected = ref<EmployeeDto | null>(null)

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
    const res: any = await selectBasicPvmAdminUser(selectedType.value)
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    tableData.value = list.map((r: any) => ({
      dbId: r.dbId || r.id || '',
      empNo: r.empNo || r.userId || '',
      empDesc: r.empDesc || r.userName || r.name || '',
      deptDesc: r.deptDesc || r.dept || '',
      verifMtTypeCd: r.verifMtTypeCd || r.mtTypeCd || selectedType.value,
    }))
  } catch (e) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  if (!selectedType.value) {
    ElMessage.warning('请先选择评审会类别')
    return
  }
  empKeyword.value = ''
  empList.value = []
  empSelected.value = null
  addDialogVisible.value = true
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

const handleAddAdmin = async () => {
  if (!empSelected.value) {
    ElMessage.warning('请先选择员工')
    return
  }
  try {
    const payload = JSON.stringify([
      {
        empNo: empSelected.value.empNo,
        empDesc: empSelected.value.empDesc,
        deptDesc: empSelected.value.deptDesc,
        verifMtTypeCd: selectedType.value,
      },
    ])
    await savePvmAdminUserData(selectedType.value, payload)
    ElMessage.success('添加成功')
    addDialogVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('添加失败')
  }
}

const handleDelete = async (row: AdminRow) => {
  try {
    await ElMessageBox.confirm(`确认删除管理员 ${row.empDesc}（${row.empNo}）？`, '提示', { type: 'warning' })
    await deletePvmAdminUserData(JSON.stringify([{ dbId: row.dbId, empNo: row.empNo, verifMtTypeCd: row.verifMtTypeCd }]))
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
    <h2>评审会管理员配置</h2>

    <el-card shadow="never" class="toolbar-card">
      <el-form inline label-width="110px">
        <el-form-item label="评审会类别">
          <el-select v-model="selectedType" placeholder="全部" clearable filterable style="width: 260px" @change="fetchList">
            <el-option v-for="t in mtTypeOptions" :key="t.verifMtTypeCd" :label="t.verifMtTypeDesc || t.verifMtTypeCd" :value="t.verifMtTypeCd" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openAddDialog">➕ 新增管理员</el-button>
          <el-button @click="fetchList">🔄 刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table :data="tableData" v-loading="loading" border stripe highlight-current-row style="width: 100%">
      <el-table-column prop="empNo" label="员工号" width="140" />
      <el-table-column prop="empDesc" label="员工姓名" width="180" />
      <el-table-column prop="deptDesc" label="部门" min-width="220" show-overflow-tooltip />
      <el-table-column prop="verifMtTypeCd" label="评审会类别" width="180">
        <template #default="{ row }">
          <el-tag type="warning" effect="plain">{{ row.verifMtTypeCd || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="addDialogVisible" title="选择管理员" width="600px" destroy-on-close>
      <el-form inline label-width="100px">
        <el-form-item label="员工搜索">
          <el-input v-model="empKeyword" placeholder="工号 / 姓名" clearable style="width: 240px" />
          <el-button type="primary" @click="searchEmp" :loading="empLoading">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="empList" v-loading="empLoading" border highlight-current-row style="width: 100%" @current-change="(row: EmployeeDto) => (empSelected = row)">
        <el-table-column type="radio" width="55" />
        <el-table-column prop="empNo" label="工号" width="120" />
        <el-table-column prop="empDesc" label="姓名" width="160" />
        <el-table-column prop="deptDesc" label="部门" min-width="200" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddAdmin">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page { padding: 20px; box-sizing: border-box; }
.page h2 { margin: 0 0 16px 0; font-size: 20px; color: #303133; }
.toolbar-card { margin-bottom: 12px; }
</style>
