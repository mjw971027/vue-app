<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getAllApprovalNode,
  selectBasicPvmApprove,
  savePvmApproveData,
  deletePvmApproveData,
  getPvmStatus,
  getPvmMtType,
  type PvmMtType,
  type PvmApprovalNode,
} from '@/api/pvm'

const loading = ref(false)
const selectedType = ref('')
const tableData = ref<PvmApprovalNode[]>([])
const mtTypeOptions = ref<PvmMtType[]>([])
const statusOptions = ref<any[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => (dialogMode.value === 'add' ? '新增审批节点' : '编辑审批节点'))
const dialogFormRef = ref<FormInstance>()
const dialogForm = reactive<PvmApprovalNode>({
  dbId: '',
  nodeCd: '',
  nodeDesc: '',
  seq: 0,
  verifMtTypeCd: '',
})
const dialogRules: FormRules = {
  nodeCd: [{ required: true, message: '请输入节点编码', trigger: 'blur' }],
  nodeDesc: [{ required: true, message: '请输入节点描述', trigger: 'blur' }],
  verifMtTypeCd: [{ required: true, message: '请选择评审会类型', trigger: 'change' }],
  seq: [{ required: true, message: '请输入顺序', trigger: 'blur' }],
}

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

const fetchStatus = async () => {
  try {
    const res: any = await getPvmStatus()
    statusOptions.value = res?.data || res || []
  } catch (e) {
    statusOptions.value = []
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res: any = selectedType.value
      ? await selectBasicPvmApprove(selectedType.value)
      : await getAllApprovalNode()
    const list: any[] = res?.data?.list || res?.list || res?.data || res || []
    tableData.value = list.map((r: any) => ({
      dbId: r.dbId || r.id || '',
      nodeCd: r.nodeCd || r.code || '',
      nodeDesc: r.nodeDesc || r.desc || r.description || '',
      seq: Number(r.seq) || 0,
      verifMtTypeCd: r.verifMtTypeCd || r.mtTypeCd || '',
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
  dialogForm.nodeCd = ''
  dialogForm.nodeDesc = ''
  dialogForm.seq = (tableData.value.length || 0) + 1
  dialogForm.verifMtTypeCd = selectedType.value || ''
  dialogVisible.value = true
}

const openEditDialog = (row: PvmApprovalNode) => {
  dialogMode.value = 'edit'
  dialogForm.dbId = row.dbId || ''
  dialogForm.nodeCd = row.nodeCd || ''
  dialogForm.nodeDesc = row.nodeDesc || ''
  dialogForm.seq = row.seq || 0
  dialogForm.verifMtTypeCd = row.verifMtTypeCd || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!dialogFormRef.value) return
  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const payload = JSON.stringify({
        dbId: dialogForm.dbId || undefined,
        nodeCd: dialogForm.nodeCd,
        nodeDesc: dialogForm.nodeDesc,
        seq: dialogForm.seq,
        verifMtTypeCd: dialogForm.verifMtTypeCd,
      })
      await savePvmApproveData(dialogMode.value === 'add' ? 'A' : 'U', payload)
      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '编辑成功')
      dialogVisible.value = false
      fetchList()
    } catch (e) {
      ElMessage.error('保存失败')
    }
  })
}

const handleDelete = async (row: PvmApprovalNode) => {
  try {
    await ElMessageBox.confirm(`确认删除节点 ${row.nodeCd}？`, '提示', { type: 'warning' })
    await deletePvmApproveData(JSON.stringify([{ dbId: row.dbId, nodeCd: row.nodeCd }]))
    ElMessage.success('删除成功')
    fetchList()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchMtTypes()
  fetchStatus()
  fetchList()
})
</script>

<template>
  <div class="page">
    <h2>审批节点管理</h2>

    <el-card shadow="never" class="toolbar-card">
      <el-form inline label-width="110px">
        <el-form-item label="评审会类型">
          <el-select v-model="selectedType" placeholder="全部" clearable filterable style="width: 260px" @change="fetchList">
            <el-option v-for="t in mtTypeOptions" :key="t.verifMtTypeCd" :label="t.verifMtTypeDesc || t.verifMtTypeCd" :value="t.verifMtTypeCd" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openAddDialog">➕ 新增节点</el-button>
          <el-button @click="fetchList">🔄 刷新</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table :data="tableData" v-loading="loading" border stripe highlight-current-row style="width: 100%">
      <el-table-column prop="dbId" label="ID" width="120" />
      <el-table-column prop="nodeCd" label="节点编码" width="160" />
      <el-table-column prop="nodeDesc" label="节点描述" min-width="220" show-overflow-tooltip />
      <el-table-column prop="seq" label="顺序" width="100" />
      <el-table-column prop="verifMtTypeCd" label="评审会类型" width="180">
        <template #default="{ row }">
          <el-tag type="success" effect="plain">{{ row.verifMtTypeCd || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" destroy-on-close>
      <el-form ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="110px">
        <el-form-item label="节点编码" prop="nodeCd">
          <el-input v-model="dialogForm.nodeCd" placeholder="请输入节点编码" />
        </el-form-item>
        <el-form-item label="节点描述" prop="nodeDesc">
          <el-input v-model="dialogForm.nodeDesc" placeholder="请输入节点描述" />
        </el-form-item>
        <el-form-item label="顺序" prop="seq">
          <el-input-number v-model="dialogForm.seq" :min="1" :max="99" style="width: 100%" />
        </el-form-item>
        <el-form-item label="评审会类型" prop="verifMtTypeCd">
          <el-select v-model="dialogForm.verifMtTypeCd" placeholder="请选择评审会类型" filterable style="width: 100%">
            <el-option v-for="t in mtTypeOptions" :key="t.verifMtTypeCd" :label="t.verifMtTypeDesc || t.verifMtTypeCd" :value="t.verifMtTypeCd" />
          </el-select>
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
