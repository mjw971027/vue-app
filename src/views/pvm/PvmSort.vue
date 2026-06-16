<!--
  ============================================================
  文件: PvmSort.vue - 供应商排序配置
  说明: 按评审会类别管理供应商排序顺序（部门排序）
  ============================================================
-->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSortSeq,
  saveSort,
  delSort,
  getPvmMtType,
} from '@/api/pvm'

// ========== 响应式数据 ==========
const loading = ref(false)
const mtTypeList = ref<any[]>([])
const selectedMtType = ref('')

const sortList = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增排序')
const form = reactive({
  dbId: '',
  mtTypeId: '',
  orgnCd: '',
  orgnDesc: '',
  seqNo: '',
})

// ========== 方法 ==========
const loadMtType = async () => {
  try {
    const res = await getPvmMtType()
    if (Array.isArray(res)) {
      mtTypeList.value = res
    } else if (res && (res as any).list) {
      mtTypeList.value = (res as any).list
    } else if (res && (res as any).data && Array.isArray((res as any).data)) {
      mtTypeList.value = (res as any).data
    } else {
      // 后端直接返回 JSON 对象时，尝试提取数组
      mtTypeList.value = []
    }
  } catch (e: any) {
    ElMessage.error('获取评审会类型失败: ' + (e?.message || ''))
  }
}

const loadSortData = async () => {
  if (!selectedMtType.value) {
    sortList.value = []
    return
  }
  loading.value = true
  try {
    const res = await getSortSeq(selectedMtType.value)
    if (Array.isArray(res)) {
      sortList.value = res
    } else if (res && (res as any).list) {
      sortList.value = (res as any).list
    } else if (res && (res as any).data && Array.isArray((res as any).data)) {
      sortList.value = (res as any).data
    } else {
      sortList.value = []
    }
  } catch (e: any) {
    ElMessage.error('加载排序数据失败: ' + (e?.message || ''))
  } finally {
    loading.value = false
  }
}

const openDialog = (row?: any) => {
  if (row) {
    dialogTitle.value = '编辑排序'
    form.dbId = row.dbId || row.id || ''
    form.mtTypeId = selectedMtType.value
    form.orgnCd = row.orgnCd || row.subcCd || ''
    form.orgnDesc = row.orgnDesc || row.subcDesc || ''
    form.seqNo = row.seqNo || ''
  } else {
    dialogTitle.value = '新增排序'
    form.dbId = ''
    form.mtTypeId = selectedMtType.value
    form.orgnCd = ''
    form.orgnDesc = ''
    form.seqNo = String(sortList.value.length + 1)
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!form.orgnCd) {
    ElMessage.warning('请输入供应商/部门编码')
    return
  }
  if (!form.seqNo) {
    ElMessage.warning('请输入序号')
    return
  }
  try {
    const data = JSON.stringify([
      {
        dbId: form.dbId || undefined,
        mtTypeId: form.mtTypeId || selectedMtType.value,
        orgnCd: form.orgnCd,
        orgnDesc: form.orgnDesc,
        seqNo: form.seqNo,
      },
    ])
    await saveSort(data)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadSortData()
  } catch (e: any) {
    ElMessage.error('保存失败: ' + (e?.message || ''))
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定删除该排序记录吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    const data = JSON.stringify([row])
    await delSort(data)
    ElMessage.success('删除成功')
    loadSortData()
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败: ' + (e?.message || ''))
    }
  }
}

// 上移 / 下移
const moveUp = (index: number) => {
  if (index <= 0) return
  const list = sortList.value
  const tmp = list[index - 1]
  list[index - 1] = list[index]
  list[index] = tmp
  updateSeqFromList()
}

const moveDown = (index: number) => {
  const list = sortList.value
  if (index >= list.length - 1) return
  const tmp = list[index + 1]
  list[index + 1] = list[index]
  list[index] = tmp
  updateSeqFromList()
}

const updateSeqFromList = () => {
  sortList.value.forEach((item, idx) => {
    if (item && typeof item === 'object') {
      (item as any).seqNo = String(idx + 1)
    }
  })
}

const handleSaveAll = async () => {
  if (sortList.value.length === 0) {
    ElMessage.warning('暂无数据可保存')
    return
  }
  try {
    const data = JSON.stringify(sortList.value)
    await saveSort(data)
    ElMessage.success('排序已保存')
  } catch (e: any) {
    ElMessage.error('保存失败: ' + (e?.message || ''))
  }
}

// ========== 初始化 ==========
onMounted(() => {
  loadMtType()
})
</script>

<template>
  <div class="page-wrapper">
    <el-card class="page-card" shadow="never">
      <!-- 标题 + 筛选 -->
      <div class="page-header">
        <h2 class="page-title">
          <el-icon><Sort /></el-icon>
          <span>供应商排序配置</span>
        </h2>
        <div class="filter-bar">
          <el-select
            v-model="selectedMtType"
            placeholder="请选择评审会类别"
            style="width: 260px"
            clearable
            @change="loadSortData"
          >
            <el-option
              v-for="item in mtTypeList"
              :key="item.dbId || item.verifMtTypeCd || item.dBId"
              :label="item.verifMtTypeDesc || item.verifMtTypeCd || item.verif_mt_type_cd"
              :value="item.dbId || item.verifMtTypeCd || item.dBId || ''"
            />
          </el-select>
          <el-button type="primary" @click="loadSortData">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button type="success" :disabled="!selectedMtType" @click="openDialog()">
            <el-icon><Plus /></el-icon>新增
          </el-button>
          <el-button type="primary" plain :disabled="!selectedMtType" @click="handleSaveAll">
            <el-icon><Check /></el-icon>保存排序
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table
        :data="sortList"
        border
        stripe
        highlight-current-row
        v-loading="loading"
        style="width: 100%; margin-top: 16px"
        empty-text="暂无数据，请选择评审会类别后点击查询"
      >
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="seqNo" label="排序序号" width="100" align="center" />
        <el-table-column prop="orgnCd" label="供应商/部门编码" width="180" align="center" />
        <el-table-column prop="orgnDesc" label="名称/描述" min-width="200" />
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row, $index }">
            <el-button size="small" @click="moveUp($index)" :disabled="$index === 0">
              <el-icon><Top /></el-icon>上移
            </el-button>
            <el-button size="small" @click="moveDown($index)" :disabled="$index === sortList.length - 1">
              <el-icon><Bottom /></el-icon>下移
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="评审会类别">
          <el-input :value="selectedMtType" disabled />
        </el-form-item>
        <el-form-item label="排序序号" required>
          <el-input v-model="form.seqNo" placeholder="请输入排序序号（数字）" />
        </el-form-item>
        <el-form-item label="供应商/部门编码" required>
          <el-input v-model="form.orgnCd" placeholder="请输入编码" />
        </el-form-item>
        <el-form-item label="名称/描述">
          <el-input v-model="form.orgnDesc" placeholder="请输入名称或描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-wrapper {
  width: 100%;
}

.page-card {
  border-radius: 8px;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
