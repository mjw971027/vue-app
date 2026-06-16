<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  selectBasicApplicant,
  selectAuthorityUser,
  saveAuthorityUserData,
  deleteAuthorityUserData,
  selectPvmAuthorityProjNo,
  saveBasicAuthorityProjNoData,
  deleteAuthorityProjNoData,
  getPvmMtType,
  getEmpData,
  type PvmApplicantItem,
  type PvmMtType,
  type PvmAuthorityUserItem,
  type PvmAuthorityProjNoItem,
  type EmployeeDto,
  type ProjNoItem,
} from '@/api/pvm'

const activeTab = ref('applicant')
const loading = ref(false)
const mtTypeOptions = ref<PvmMtType[]>([])

const applicantList = ref<PvmApplicantItem[]>([])
const selectedApplicant = ref<PvmApplicantItem | null>(null)

const authorityUserList = ref<PvmAuthorityUserItem[]>([])
const selectedAuthUser = ref<PvmAuthorityUserItem | null>(null)

const projNoList = ref<PvmAuthorityProjNoItem[]>([])

const empDialogVisible = ref(false)
const empKeyword = ref('')
const empLoading = ref(false)
const empList = ref<EmployeeDto[]>([])
const empTarget = ref<'authUser' | 'applicant'>('authUser')

const projDialogVisible = ref(false)
const projList = ref<ProjNoItem[]>([])
const projKeyword = ref('')

const fetchMtTypes = async () => {
  try {
    const res: any = await getPvmMtType('')
    const list: any[] = res?.data || res || []
    mtTypeOptions.value = list
  } catch (e) {
    mtTypeOptions.value = []
  }
}

const fetchApplicant = async () => {
  loading.value = true
  try {
    const res: any = await selectBasicApplicant({})
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    applicantList.value = list.map((r: any) => ({
      dbId: r.dbId || r.id || '',
      empNo: r.empNo || r.userId || '',
      empDesc: r.empDesc || r.userName || r.name || '',
      deptId: r.deptId || '',
      deptDesc: r.deptDesc || r.dept || '',
      verifMtTypeCd: r.verifMtTypeCd || r.mtTypeCd || '',
      companyCd: r.companyCd || '',
    }))
  } catch (e) {
    ElMessage.error('加载申请人失败')
  } finally {
    loading.value = false
  }
}

const selectApplicant = (row: PvmApplicantItem) => {
  selectedApplicant.value = row
  selectedAuthUser.value = null
  fetchAuthorityUsers()
}

const fetchAuthorityUsers = async () => {
  if (!selectedApplicant.value?.dbId) {
    authorityUserList.value = []
    return
  }
  loading.value = true
  try {
    const res: any = await selectAuthorityUser(selectedApplicant.value.dbId)
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    authorityUserList.value = list.map((r: any) => ({
      dbId: r.dbId || r.id || '',
      empNo: r.empNo || r.userId || '',
      empDesc: r.empDesc || r.userName || r.name || '',
      deptDesc: r.deptDesc || r.dept || '',
      applicantDbId: selectedApplicant.value?.dbId || '',
      verifMtTypeCd: selectedApplicant.value?.verifMtTypeCd || '',
    }))
  } catch (e) {
    authorityUserList.value = []
  } finally {
    loading.value = false
  }
}

const selectAuthUser = (row: PvmAuthorityUserItem) => {
  selectedAuthUser.value = row
  fetchProjNos()
}

const fetchProjNos = async () => {
  if (!selectedAuthUser.value?.dbId) {
    projNoList.value = []
    return
  }
  loading.value = true
  try {
    const res: any = await selectPvmAuthorityProjNo(selectedAuthUser.value.dbId)
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    projNoList.value = list.map((r: any) => ({
      dbId: r.dbId || r.id || '',
      projNo: r.projNo || '',
      projDesc: r.projDesc || r.description || '',
      authorityUserDbId: selectedAuthUser.value?.dbId || '',
    }))
  } catch (e) {
    projNoList.value = []
  } finally {
    loading.value = false
  }
}

const openEmpSearch = (target: 'authUser' | 'applicant') => {
  empTarget.value = target
  empKeyword.value = ''
  empList.value = []
  empDialogVisible.value = true
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

const handleAddAuthUser = async (emp: EmployeeDto) => {
  if (!selectedApplicant.value?.dbId) {
    ElMessage.warning('请先选择申请人')
    return
  }
  try {
    const payload = JSON.stringify([
      {
        empNo: emp.empNo,
        empDesc: emp.empDesc,
        deptDesc: emp.deptDesc,
        applicantDbId: selectedApplicant.value.dbId,
      },
    ])
    await saveAuthorityUserData(selectedApplicant.value.dbId, payload)
    ElMessage.success('添加成功')
    empDialogVisible.value = false
    fetchAuthorityUsers()
  } catch (e) {
    ElMessage.error('添加失败')
  }
}

const handleDeleteAuthUser = async (row: PvmAuthorityUserItem) => {
  try {
    await ElMessageBox.confirm(`确认删除授权用户 ${row.empDesc}？`, '提示', { type: 'warning' })
    await deleteAuthorityUserData(JSON.stringify([{ dbId: row.dbId, empNo: row.empNo }]))
    ElMessage.success('删除成功')
    fetchAuthorityUsers()
    if (selectedAuthUser.value?.dbId === row.dbId) {
      selectedAuthUser.value = null
      projNoList.value = []
    }
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

const openProjDialog = () => {
  projKeyword.value = ''
  projList.value = []
  projDialogVisible.value = true
}

const searchProj = async () => {
  if (!projKeyword.value) return
  try {
    projList.value = [{
      projNo: `PROJ-${Date.now().toString().slice(-6)}`,
      projDesc: projKeyword.value,
      shipType: '',
    }]
  } catch (e) {
    projList.value = []
  }
}

const handleAddProj = async (row: ProjNoItem) => {
  if (!selectedAuthUser.value?.dbId) {
    ElMessage.warning('请先选择授权用户')
    return
  }
  try {
    const payload = JSON.stringify([
      {
        projNo: row.projNo,
        projDesc: row.projDesc,
        authorityUserDbId: selectedAuthUser.value.dbId,
      },
    ])
    await saveBasicAuthorityProjNoData(selectedAuthUser.value.dbId, payload)
    ElMessage.success('添加成功')
    projDialogVisible.value = false
    fetchProjNos()
  } catch (e) {
    ElMessage.error('添加失败')
  }
}

const handleDeleteProj = async (row: PvmAuthorityProjNoItem) => {
  try {
    await ElMessageBox.confirm(`确认删除工程号 ${row.projNo}？`, '提示', { type: 'warning' })
    await deleteAuthorityProjNoData(JSON.stringify([{ dbId: row.dbId, projNo: row.projNo }]))
    ElMessage.success('删除成功')
    fetchProjNos()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchMtTypes()
  fetchApplicant()
})
</script>

<template>
  <div class="page">
    <h2>报审申请权限配置</h2>

    <el-tabs v-model="activeTab" v-loading="loading">
      <el-tab-pane label="申请人" name="applicant">
        <el-card shadow="never">
          <div class="toolbar">
            <el-button type="primary" @click="fetchApplicant">🔄 刷新</el-button>
            <span v-if="selectedApplicant" class="selected-info">
              当前申请人：{{ selectedApplicant.empNo }} - {{ selectedApplicant.empDesc }}
            </span>
          </div>
          <el-table
            :data="applicantList"
            border
            stripe
            highlight-current-row
            style="width: 100%; margin-top: 12px"
            @row-click="selectApplicant"
          >
            <el-table-column label="选择" width="80">
              <template #default="{ row }">
                <el-radio :model-value="selectedApplicant?.dbId" :label="row.dbId" @change="selectApplicant(row)" />
              </template>
            </el-table-column>
            <el-table-column prop="empNo" label="员工号" width="140" />
            <el-table-column prop="empDesc" label="姓名" width="160" />
            <el-table-column prop="deptDesc" label="部门" min-width="200" show-overflow-tooltip />
            <el-table-column prop="verifMtTypeCd" label="评审会类型" width="160">
              <template #default="{ row }">
                <el-tag type="success" effect="plain">{{ row.verifMtTypeCd || '—' }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="授权用户" name="authUser">
        <el-card shadow="never">
          <div class="toolbar">
            <el-tag v-if="selectedApplicant" type="success">
              当前申请人：{{ selectedApplicant.empNo }} - {{ selectedApplicant.empDesc }}
            </el-tag>
            <el-button type="primary" :disabled="!selectedApplicant" @click="openEmpSearch('authUser')">➕ 新增授权用户</el-button>
            <el-button @click="fetchAuthorityUsers">🔄 刷新</el-button>
          </div>
          <el-table
            :data="authorityUserList"
            border
            stripe
            highlight-current-row
            style="width: 100%; margin-top: 12px"
            @row-click="selectAuthUser"
          >
            <el-table-column label="选择" width="80">
              <template #default="{ row }">
                <el-radio :model-value="selectedAuthUser?.dbId" :label="row.dbId" @change="selectAuthUser(row)" />
              </template>
            </el-table-column>
            <el-table-column prop="empNo" label="员工号" width="140" />
            <el-table-column prop="empDesc" label="姓名" width="160" />
            <el-table-column prop="deptDesc" label="部门" min-width="220" show-overflow-tooltip />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button link type="danger" @click="handleDeleteAuthUser(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="授权工程号" name="projNo">
        <el-card shadow="never">
          <div class="toolbar">
            <el-tag v-if="selectedAuthUser" type="warning">
              当前授权用户：{{ selectedAuthUser.empNo }} - {{ selectedAuthUser.empDesc }}
            </el-tag>
            <el-button type="primary" :disabled="!selectedAuthUser" @click="openProjDialog">➕ 新增工程号</el-button>
            <el-button @click="fetchProjNos">🔄 刷新</el-button>
          </div>
          <el-table :data="projNoList" border stripe highlight-current-row style="width: 100%; margin-top: 12px">
            <el-table-column prop="projNo" label="工程号" width="180" />
            <el-table-column prop="projDesc" label="描述" min-width="280" show-overflow-tooltip />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button link type="danger" @click="handleDeleteProj(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="empDialogVisible" title="搜索员工" width="600px" destroy-on-close>
      <el-form inline label-width="100px">
        <el-form-item label="关键字">
          <el-input v-model="empKeyword" placeholder="工号 / 姓名" clearable style="width: 240px" />
          <el-button type="primary" @click="searchEmp" :loading="empLoading">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="empList" v-loading="empLoading" border highlight-current-row style="width: 100%">
        <el-table-column prop="empNo" label="工号" width="120" />
        <el-table-column prop="empDesc" label="姓名" width="160" />
        <el-table-column prop="deptDesc" label="部门" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleAddAuthUser(row)">添加</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="projDialogVisible" title="添加工程号" width="560px" destroy-on-close>
      <el-form inline label-width="100px">
        <el-form-item label="工程号">
          <el-input v-model="projKeyword" placeholder="输入工程号关键字" clearable style="width: 260px" />
          <el-button type="primary" @click="searchProj">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="projList" border highlight-current-row style="width: 100%">
        <el-table-column prop="projNo" label="工程号" width="180" />
        <el-table-column prop="projDesc" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleAddProj(row)">添加</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<style scoped>
.page { padding: 20px; box-sizing: border-box; }
.page h2 { margin: 0 0 16px 0; font-size: 20px; color: #303133; }
.toolbar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.selected-info { color: #606266; font-size: 14px; }
</style>
