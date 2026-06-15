<!--
  ============================================================
  文件：src/views/ComponentsCreate.vue
  作用：工装申请创建/编辑弹窗
  说明：
    - 根据 origin/Components_Create_windows.html 和 CreateWindow.js 转换
    - 使用 Element Plus 组件重构
    - 支持新增和编辑模式
  ============================================================
-->
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="90%"
    :fullscreen="false"
    :close-on-click-modal="false"
    @close="handleClose"
  >   
  
    <!-- 基本信息 -->
    <div class="form-section">
      <div class="form-section-header">
        <div class="form-section-title">
          <span class="title-accent"></span>
          <el-icon><Document /></el-icon>
          工装申请信息
        </div>
      </div>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        :disabled="isReadOnly"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="申请编号">
              <el-input v-model="formData.billNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="公司主体">
              <el-input v-model="formData.company" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="部门">
              <el-input v-model="formData.deptDesc" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="申请人">
              <el-input v-model="formData.createUserName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请日期">
              <el-date-picker
                v-model="formData.appDate"
                type="date"
                disabled
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工程号">
              <el-select
                v-model="formData.projNo"
                placeholder="请选择"
                style="width: 100%"
                :disabled="isReadOnly"
                filterable
              >
                <el-option
                  v-for="item in projectOptions"
                  :key="item.code"
                  :label="item.code"
                  :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="工装类别" prop="divCd" required>
              <el-select
                v-model="formData.divCd"
                placeholder="请选择"
                style="width: 100%"
                :disabled="isReadOnly"
              >
                <el-option label="生产通用" value="01" />
                <el-option label="生产专用" value="02" />
                <el-option label="安措" value="03" />
                <el-option label="科研通用" value="04" />
                <el-option label="科研专用" value="05" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="需求数" prop="numberNo" required>
              <el-input v-model="formData.numberNo" :disabled="isReadOnly" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系方式">
              <el-input v-model="formData.tel" :disabled="isReadOnly" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="需求日期" prop="needDate" required>
              <el-date-picker
                v-model="formData.needDate"
                type="date"
                placeholder="请选择"
                style="width: 100%"
                :disabled="isReadOnly"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="图号">
              <el-input v-model="formData.dwgno" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="材料费用/元">
              <el-input v-model="formData.materialTotalCost" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="最终下发数">
              <el-input v-model="formData.finalNumberNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预估工时/小时">
              <el-input v-model="formData.mhBdgt" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="项目名称" prop="componentsName" required>
              <el-input v-model="formData.componentsName" :disabled="isReadOnly" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                :disabled="isReadOnly"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 申请材料 -->
    <div class="form-section">
      <div class="form-section-header">
        <div class="form-section-title">
          <span class="title-accent"></span>
          <el-icon><List /></el-icon>
          申请材料
        </div>
        <div v-if="!isReadOnly">
          <el-button type="primary" size="small" :icon="Plus" @click="handleAddMaterial">新增</el-button>
          <el-button type="danger" size="small" :icon="Delete" @click="handleDeleteMaterial">删除</el-button>
        </div>
      </div>
    <el-table
      v-model:data="materialData"
      border
      style="width: 100%"
      max-height="300"
      :row-class-name="getMaterialRowClass"
      @selection-change="handleMaterialSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="activation" label="是否有效" width="100">
        <template #default="{ row }">
          <el-select
            v-if="!isReadOnly"
            v-model="row.activation"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
          <el-tag v-else :type="row.activation === 'Y' ? 'success' : 'info'">
            {{ row.activation === 'Y' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="materialNo" label="物资编码" width="170" />
      <el-table-column prop="materialName" label="物资描述" min-width="150" show-overflow-tooltip>
        <template #default="{ row }">
          <el-input v-if="!isReadOnly" v-model="row.materialName" size="small" />
          <span v-else>{{ row.materialName }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="unit" label="单位" width="100">
        <template #default="{ row }">
          <el-select
            v-if="!isReadOnly"
            v-model="row.unit"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in unitOptions"
              :key="item.guid"
              :label="item.unt_DESC"
              :value="item.guid"
            />
          </el-select>
          <span v-else>{{ row.unitDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="demandQty" label="需求数" width="100">
        <template #default="{ row }">
          <el-input
            v-if="!isReadOnly"
            v-model="row.demandQty"
            size="small"
            @change="handleDemandQtyChange(row)"
          />
          <span v-else>{{ row.demandQty }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="finalDemandQty" label="最终需求数" width="120">
        <template #default="{ row }">
          <el-input v-if="!isReadOnly" v-model="row.finalDemandQty" size="small" />
          <span v-else>{{ row.finalDemandQty }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="materialCost" label="预估金额/元" width="120">
        <template #default="{ row }">
          <el-input v-if="!isReadOnly" v-model="row.materialCost" size="small" />
          <span v-else>{{ row.materialCost }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="materialSources" label="物资来源" width="120">
        <template #default="{ row }">
          <el-select
            v-if="!isReadOnly"
            v-model="row.materialSources"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in materialSourceOptions"
              :key="item.id"
              :label="item.text"
              :value="item.id"
            />
          </el-select>
          <span v-else>{{ row.materialSourcesDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="120">
        <template #default="{ row }">
          <el-input v-if="!isReadOnly" v-model="row.remark" size="small" />
          <span v-else>{{ row.remark }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="quality" label="材质" width="120">
        <template #default="{ row }">
          <el-input v-if="!isReadOnly" v-model="row.quality" size="small" />
          <span v-else>{{ row.quality }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="thk1" label="T1" width="80">
        <template #default="{ row }">
          <el-input v-if="!isReadOnly" v-model="row.thk1" size="small" />
          <span v-else>{{ row.thk1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="thk2" label="T2" width="80">
        <template #default="{ row }">
          <el-input v-if="!isReadOnly" v-model="row.thk2" size="small" />
          <span v-else>{{ row.thk2 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="w1" label="B1" width="80">
        <template #default="{ row }">
          <el-input v-if="!isReadOnly" v-model="row.w1" size="small" />
          <span v-else>{{ row.w1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="w2" label="B2" width="80">
        <template #default="{ row }">
          <el-input v-if="!isReadOnly" v-model="row.w2" size="small" />
          <span v-else>{{ row.w2 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="l" label="L" width="80">
        <template #default="{ row }">
          <el-input v-if="!isReadOnly" v-model="row.l" size="small" />
          <span v-else>{{ row.l }}</span>
        </template>
      </el-table-column>
      <template #empty>
        <div class="table-empty">
          <el-icon :size="36" color="#c0c4cc"><List /></el-icon>
          <p>暂无申请材料</p>
        </div>
      </template>
    </el-table>
    </div>

    <!-- 附件信息和审批记录 -->
    <div class="form-section">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="form-section-header">
          <div class="form-section-title">
            <span class="title-accent"></span>
            <el-icon><FolderOpened /></el-icon>
            附件信息
          </div>
          <div v-if="!isReadOnly">
            <el-button type="primary" size="small" :icon="Upload" @click="handleUpload">上传</el-button>
            <el-button type="danger" size="small" :icon="Delete" @click="handleDeleteFile">删除</el-button>
          </div>
        </div>
        <el-table
          v-model:data="fileData"
          border
          style="width: 100%"
          max-height="200"
          @selection-change="handleFileSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="fileName" label="文件名称" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDownloadFile(row)">
                {{ row.fileName }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="fileType" label="附件类型" width="100" />
          <el-table-column prop="createDate" label="上传日期" width="120" />
          <el-table-column prop="createUserId" label="上传人" width="100" />
          <template #empty>
            <div class="table-empty">
              <el-icon :size="36" color="#c0c4cc"><FolderOpened /></el-icon>
              <p>暂无附件</p>
            </div>
          </template>
        </el-table>
      </el-col>

      <el-col :span="12">
        <div class="form-section-header">
          <div class="form-section-title">
            <span class="title-accent"></span>
            <el-icon><Checked /></el-icon>
            审批过程记录
          </div>
        </div>
        <el-table
          v-model:data="auditData"
          border
          style="width: 100%"
          max-height="200"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="createUserId" label="审核人" width="100" />
          <el-table-column prop="opinion" label="审核意见" min-width="150" show-overflow-tooltip />
          <el-table-column prop="stepName" label="审核节点" width="120" />
          <el-table-column prop="menuName" label="审核结果" width="100" />
          <el-table-column prop="createDate" label="审核时间" width="120" />
          <template #empty>
            <div class="table-empty">
              <el-icon :size="36" color="#c0c4cc"><Checked /></el-icon>
              <p>暂无审批记录</p>
            </div>
          </template>
        </el-table>
      </el-col>
    </el-row>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <div v-if="!isReadOnly" class="footer-buttons">
          <el-button :class="{ 'is-bounce': saveBounce }" :loading="saveLoading" @click="handleSave">保存</el-button>
          <el-button type="primary" :class="{ 'is-bounce': commitBounce }" :loading="commitLoading" @click="handleCommit">提交</el-button>
        </div>
        <div class="footer-buttons">
          <el-button @click="handleClose">关闭</el-button>
        </div>
      </div>
    </template>

    <!-- 上传附件弹窗 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传附件"
      width="500px"
      append-to-body
    >
      <el-upload
        ref="uploadRef"
        :action="uploadUrl"
        :headers="uploadHeaders"
        :data="uploadData"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        :auto-upload="false"
        :limit="1"
      >
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>
        <el-button type="success" @click="submitUpload">
          上传
        </el-button>
      </el-upload>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Delete, Upload, Document, List, FolderOpened, Checked } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type {
  ProjectOption,
  UnitOption,
  MaterialSourceOption,
  ComponentMaterial,
  ComponentFile,
  ComponentAudit,
} from '../api/types'
import {
  getProjectManagerProjects,
  getUnits as getUnitsApi,
  getMaterialSources as getMaterialSourcesApi,
  getBillInfo,
  getComponentsApp,
  getComponentsAppFile,
  getComponentsAppAudit,
  deleteAppInfo,
  deleteComFile,
  saveBase,
  saveAppInfo,
  saveBaseCommit,
} from '../api/components'
import request from '../api/request'
import { getAuthHeader } from '../utils/auth'

// Props
const props = defineProps<{
  billNo?: string
  guid?: string
  isReadOnly?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'close', refresh: boolean): void
}>()

// 响应式数据
const visible = ref(true)
const title = ref('工装申请')
const isReadOnly = computed(() => props.isReadOnly || false)
const uploadDialogVisible = ref(false)
const uploadRef = ref<{ submit: () => void }>()
const saveBounce = ref(false)
const commitBounce = ref(false)
const saveLoading = ref(false)
const commitLoading = ref(false)

// 表单数据
const formData = reactive({
  billNo: '',
  company: '',
  deptDesc: '',
  createUserName: '',
  appDate: '',
  projNo: '',
  divCd: '',
  numberNo: '',
  tel: '',
  needDate: '',
  dwgno: '',
  materialTotalCost: 0,
  finalNumberNo: '',
  mhBdgt: '',
  componentsName: '',
  remark: ''
})

// 表格数据
const materialData = ref<ComponentMaterial[]>([])
const fileData = ref<ComponentFile[]>([])
const auditData = ref<ComponentAudit[]>([])

// 选中的行
const selectedMaterials = ref<ComponentMaterial[]>([])
const selectedFiles = ref<ComponentFile[]>([])

// 下拉选项
const projectOptions = ref<ProjectOption[]>([])
const unitOptions = ref<UnitOption[]>([])
const materialSourceOptions = ref<MaterialSourceOption[]>([])

// 上传相关
const uploadUrl = ref('')
const uploadData = reactive({
  TypeCd: '01',
  billId: '',
  billNo: ''
})

// ========== 表单验证 ==========
const formRef = ref<FormInstance>()

/** 表单验证规则 */
const formRules = reactive<FormRules>({
  divCd: [
    { required: true, message: '请选择工装类别', trigger: 'change' },
  ],
  numberNo: [
    { required: true, message: '请输入需求数', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value === '' || value === undefined || value === null) {
          callback(new Error('请输入需求数'))
          return
        }
        const num = Number(value)
        if (isNaN(num) || num <= 0) {
          callback(new Error('需求数必须大于 0'))
          return
        }
        if (!Number.isInteger(num)) {
          callback(new Error('需求数必须为整数'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  needDate: [
    { required: true, message: '请选择需求日期', trigger: 'change' },
  ],
  componentsName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 1, max: 200, message: '项目名称长度不超过 200 个字符', trigger: 'blur' },
  ],
})
/** 注入 Authorization 请求头 */
const uploadHeaders = computed(() => {
  const auth = getAuthHeader()
  return auth ? { Authorization: auth } : {}
})

/** 初始化 */
onMounted(() => {
  loadProjects()
  loadUnits()
  loadMaterialSources()

  if (props.guid) {
    loadData()
  }
})

/** 加载工程号列表 */
const loadProjects = async () => {
  try {
    const res = await getProjectManagerProjects()
    projectOptions.value = res.data || []
  } catch {
    ElMessage.error('加载工程号列表失败')
  }
}

/** 加载单位列表 */
const loadUnits = async () => {
  try {
    const res = await getUnitsApi()
    unitOptions.value = res.data || []
  } catch {
    ElMessage.error('加载单位列表失败')
  }
}

/** 加载物资来源 */
const loadMaterialSources = async () => {
  try {
    const res = await getMaterialSourcesApi()
    materialSourceOptions.value = res.data || []
  } catch {
    ElMessage.error('加载物资来源失败')
  }
}

/** 加载数据 */
const loadData = async () => {
  try {
    // 加载基本信息
    if (props.guid) {
      const res = await getBillInfo(props.guid)
      if (res.data) {
        Object.assign(formData, {
          billNo: res.data.billNo || '',
          company: res.data.companyEnDesc || '',
          deptDesc: res.data.deptDesc || '',
          createUserName: res.data.createUserName || '',
          appDate: res.data.appDate || '',
          projNo: res.data.projNo || '',
          divCd: res.data.divCd || '',
          numberNo: res.data.numberNo || '',
          tel: res.data.tel || '',
          needDate: res.data.needDate || '',
          dwgno: res.data.dwgno || '',
          materialTotalCost: res.data.materialTotalCost || 0,
          finalNumberNo: res.data.finalNumberNo || '',
          mhBdgt: res.data.mhBdgt || '',
          componentsName: res.data.componentsName || '',
          remark: res.data.remark || ''
        })
      }
    }

    if (props.billNo) {
      // 加载申请材料
      const res2 = await getComponentsApp(props.billNo)
      materialData.value = res2.data || []

      // 加载附件
      const res3 = await getComponentsAppFile(props.billNo)
      fileData.value = res3.data || []

      // 加载审批记录
      const res4 = await getComponentsAppAudit(props.billNo)
      auditData.value = res4.data || []
    }
  } catch {
    ElMessage.error('加载数据失败')
  }
}

/** 新增申请材料 */
const handleAddMaterial = () => {
  const newRow: ComponentMaterial & { _isNew?: boolean } = {
    componentsId: props.guid,
    createNode: '01',
    activation: 'Y',
    _isNew: true
  }
  materialData.value.push(newRow)
  // 2秒后移除高亮标记
  window.setTimeout(() => {
    delete newRow._isNew
  }, 2000)
}

/** 材料行样式 */
const getMaterialRowClass = ({ row }: { row: ComponentMaterial & { _isNew?: boolean } }) => {
  return row._isNew ? 'new-row-highlight' : ''
}

/** 删除申请材料 */
const handleDeleteMaterial = async () => {
  if (selectedMaterials.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除选中的申请材料吗？', '提示', {
      type: 'warning'
    })

    const ids = selectedMaterials.value.map(item => item.guid)
    await deleteAppInfo(ids)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: unknown) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

/** 材料选择变化 */
const handleMaterialSelectionChange = (selection: ComponentMaterial[]) => {
  selectedMaterials.value = selection
}

/** 需求数变化 */
const handleDemandQtyChange = (row: ComponentMaterial) => {
  row.finalDemandQty = row.demandQty
  calculateTotalCost()
}

/** 计算总成本 */
const calculateTotalCost = () => {
  const total = materialData.value.reduce((acc, curr) => {
    return acc + (Number(curr.materialCost) || 0)
  }, 0)
  formData.materialTotalCost = total
}

/** 上传附件 */
const handleUpload = () => {
  uploadData.billId = props.guid || ''
  uploadData.billNo = props.billNo || ''
  uploadUrl.value = `/api/components/uploadAttchment`
  uploadDialogVisible.value = true
}

/** 提交上传 */
const submitUpload = () => {
  uploadRef.value?.submit()
}

/** 上传前校验 */
const beforeUpload = (_file: File) => {
  if (_file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  return true
}

/** 上传成功 */
const handleUploadSuccess = (_response: unknown) => {
  ElMessage.success('上传成功')
  uploadDialogVisible.value = false
  loadData()
}

/** 上传失败 */
const handleUploadError = () => {
  ElMessage.error('上传失败')
}

/** 删除附件 */
const handleDeleteFile = async () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请选择要删除的文件')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除选中的附件吗？', '提示', {
      type: 'warning'
    })

    const ids = selectedFiles.value.map(item => item.fileId)
    await deleteComFile(ids)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: unknown) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

/** 文件选择变化 */
const handleFileSelectionChange = (selection: ComponentFile[]) => {
  selectedFiles.value = selection
}

/** 下载文件（通过 axios 获取 Blob，避免 Token 暴露在 URL 中） */
const handleDownloadFile = async (row: ComponentFile) => {
  try {
    const res = await request.get('/components/fileDownload', {
      params: { fileId: row.fileId },
      responseType: 'blob'
    })
    const blob = res as unknown as Blob
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = row.fileName || 'download'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch {
    ElMessage.error('下载失败')
  }
}

/** 保存 */
const handleSave = async () => {
  // 先校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请正确填写表单内容')
    return
  }

  saveLoading.value = true
  try {
    const param: Record<string, unknown> = {
      guid: props.guid,
      billNo: formData.billNo,
      projNo: formData.projNo,
      divCd: formData.divCd,
      numberNo: formData.numberNo,
      tel: formData.tel,
      needDate: formData.needDate,
      dwgno: formData.dwgno,
      materialTotalCost: formData.materialTotalCost,
      finalNumberNo: formData.finalNumberNo,
      mhBdgt: formData.mhBdgt,
      componentsName: formData.componentsName,
      remark: formData.remark
    }

    const res = await saveBase(param)

    if (res.data?.flag === 1) {
      if (materialData.value.length > 0) {
        const res2 = await saveAppInfo(materialData.value)
        if (res2.data?.flag === 1) {
          ElMessage.success('保存成功')
        }
      } else {
        ElMessage.success('保存成功')
      }
      // 保存成功按钮跳动
      saveBounce.value = true
      window.setTimeout(() => { saveBounce.value = false }, 600)
      // 刷新页面数据
      await loadData()
    }
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}

/** 提交 */
const handleCommit = async () => {
  // 先校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请正确填写表单内容')
    return
  }

  if (materialData.value.length === 0) {
    ElMessage.warning('申请材料至少有一条数据')
    return
  }

  try {
    await ElMessageBox.confirm('提交会保存已编辑内容，确定要提交吗？', '提示', {
      type: 'warning'
    })

    commitLoading.value = true

    const param: Record<string, unknown> = {
      guid: props.guid,
      billNo: formData.billNo,
      projNo: formData.projNo,
      divCd: formData.divCd,
      numberNo: formData.numberNo,
      tel: formData.tel,
      needDate: formData.needDate,
      componentsName: formData.componentsName,
      remark: formData.remark
    }

    const res = await saveBaseCommit(param, materialData.value)

    if (res.data?.flag === 1) {
      ElMessage.success('提交成功')
      commitBounce.value = true
      window.setTimeout(() => { commitBounce.value = false }, 600)
      emit('close', true)
    }
  } catch (error: unknown) {
    if (error !== 'cancel') {
      ElMessage.error('提交失败')
    }
  } finally {
    commitLoading.value = false
  }
}

/** 关闭 */
const handleClose = () => {
  visible.value = false
  emit('close', false)
}
</script>

<style scoped>
/* ========== 关键帧定义 ========== */

/* 区块入场：从下方滑入 + 淡入 */
@keyframes sectionSlideIn {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 标题栏光晕流动 */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* 左侧强调条呼吸灯 */
@keyframes accentPulse {
  0%, 100% { opacity: 1; transform: scaleY(1); }
  50% { opacity: 0.7; transform: scaleY(1.2); }
}

/* 保存成功后按钮跳动 */
@keyframes btnBounce {
  0%, 100% { transform: scale(1); }
  30% { transform: scale(1.08); }
  60% { transform: scale(0.96); }
}

/* ========== 弹窗整体样式 ========== */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 50%,
    #667eea 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
  padding: 18px 24px;
  margin: 0;
}

:deep(.el-dialog__title) {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  transition: transform 0.3s ease, color 0.3s ease;
}

:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #fff;
  transform: rotate(90deg);
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
  background: #f8f9fc;
}

:deep(.el-dialog__footer) {
  padding: 12px 24px 20px;
  border-top: 1px solid #ebeef5;
  background: #fff;
}

/* ========== 表单区块 ========== */
.form-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #ebeef5;
  /* 入场动画 */
  animation: sectionSlideIn 0.5s ease-out both;
  transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.1);
  border-color: #c7d2fe;
  transform: translateY(-2px);
}

/* 各区块错开入场 */
.form-section:nth-child(1) { animation-delay: 0.05s; }
.form-section:nth-child(2) { animation-delay: 0.15s; }
.form-section:nth-child(3) { animation-delay: 0.25s; }

/* 区块标题 */
.form-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}

.form-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.form-section-title .el-icon {
  font-size: 16px;
  color: #6366f1;
  transition: transform 0.3s ease;
}

.form-section:hover .form-section-title .el-icon {
  transform: scale(1.15);
}

.title-accent {
  width: 3px;
  height: 16px;
  background: linear-gradient(180deg, #6366f1, #818cf8);
  border-radius: 2px;
  flex-shrink: 0;
  animation: accentPulse 2.5s ease-in-out infinite;
}

/* ========== 表单样式 ========== */
:deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

/* 输入框聚焦光效 */
:deep(.el-input__wrapper) {
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

:deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

:deep(.el-select__wrapper) {
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

:deep(.el-select__wrapper:focus-within) {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background: #f5f7fa;
}

:deep(.el-select.is-disabled .el-select__wrapper) {
  background: #f5f7fa;
}

/* textarea 聚焦 */
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

/* ========== 表格样式 ========== */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0;
}

:deep(.el-table__header-wrapper th.el-table__cell) {
  background: #f8f9fd !important;
  color: #303133;
  font-weight: 600;
  font-size: 13px;
  padding: 10px 0;
  transition: background 0.3s ease;
}

:deep(.el-table__body-wrapper td.el-table__cell) {
  padding: 8px 0;
  font-size: 13px;
  color: #4a4a5a;
  transition: background 0.25s ease, transform 0.2s ease;
}

:deep(.el-table__row) {
  transition: transform 0.2s ease;
}

:deep(.el-table__row:hover td.el-table__cell) {
  background: #f5f6ff !important;
}

:deep(.el-table__row:hover) {
  transform: scale(1.005);
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: #f9fafc;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped:hover td.el-table__cell) {
  background: #f0f1ff !important;
}

/* 表格选中行高亮 */
:deep(.el-table__body tr.current-row > td.el-table__cell) {
  background: #eef2ff !important;
}

/* ========== 底部按钮 ========== */
.dialog-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: sectionSlideIn 0.5s ease-out 0.35s both;
}

.footer-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.dialog-footer .el-button {
  border-radius: 8px;
  padding: 10px 28px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.dialog-footer .el-button:hover {
  transform: translateY(-2px);
}

.dialog-footer .el-button:active {
  transform: translateY(0) scale(0.97);
}

.dialog-footer .el-button--primary {
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

.dialog-footer .el-button--primary:hover {
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.45);
}

/* 按钮涟漪效果 */
.dialog-footer .el-button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.dialog-footer .el-button:hover::after {
  opacity: 1;
}

/* 操作按钮区域（新增/删除/上传） */
.form-section-header .el-button {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.form-section-header .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.form-section-header .el-button:active {
  transform: scale(0.95);
}

/* ========== 保存成功后按钮跳动 ========== */
.dialog-footer .el-button.is-bounce {
  animation: btnBounce 0.5s ease;
}

/* ========== 新增行高亮闪烁 ========== */
@keyframes newRowFlash {
  0% {
    box-shadow: inset 4px 0 0 #6366f1;
    background-color: rgba(99, 102, 241, 0.12);
  }
  50% {
    box-shadow: inset 4px 0 0 #6366f1;
    background-color: rgba(99, 102, 241, 0.05);
  }
  100% {
    box-shadow: inset 4px 0 0 transparent;
    background-color: transparent;
  }
}

:deep(.el-table .new-row-highlight) {
  animation: newRowFlash 2s ease-out forwards;
}

:deep(.el-table .new-row-highlight td.el-table__cell:first-child) {
  box-shadow: inset 4px 0 0 #6366f1;
  animation: newRowFlash 2s ease-out forwards;
}

/* ========== 表格空状态 ========== */
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  gap: 8px;
}

.table-empty p {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

/* ========== 上传弹窗样式优化 ========== */
:deep(.el-dialog__wrapper:has(.el-dialog[style*="500px"])) {
  backdrop-filter: blur(2px);
}

/* 上传拖拽区域 */
.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  transition: border-color 0.3s ease, background 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.03);
}

/* ========== 标签动效 ========== */
:deep(.el-tag) {
  transition: transform 0.2s ease;
}

:deep(.el-tag:hover) {
  transform: scale(1.05);
}

/* ========== 滚动条美化 ========== */
:deep(.el-dialog__body::-webkit-scrollbar) {
  width: 6px;
}

:deep(.el-dialog__body::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.el-dialog__body::-webkit-scrollbar-thumb) {
  background: #c4c9d4;
  border-radius: 3px;
}

:deep(.el-dialog__body::-webkit-scrollbar-thumb:hover) {
  background: #a0a5b0;
}
</style>
