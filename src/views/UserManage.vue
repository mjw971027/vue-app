<!--
  ============================================================
  文件：src/views/UserManage.vue
  作用：用户管理页面
  路由：/users
  说明：
    - 展示用户列表表格
    - 支持新增（注册）、编辑、删除用户
  ============================================================
-->

<template>
  <div class="user-manage">
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" :icon="Plus" @click="handleAddUser">新增用户</el-button>
    </div>

    <!-- 用户列表表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="userList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="role" label="角色" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '在线' ? 'success' : 'info'" size="small" effect="dark" round>
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑用户' : '新增用户'"
      width="500px"
      :close-on-click-modal="false"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        size="large"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEditing">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="管理员" value="ADMIN" />
            <el-option label="普通用户" value="USER" />
            <el-option label="访客" value="GUEST" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEditing ? '保存' : '注册' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-undef */
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { UserManageItem } from '../api/types'
import { getUserList, registerUser, updateUser, deleteUser } from '../api/userManage'

// ====== 状态 ======
const loading = ref(false)
const submitting = ref(false)
const userList = ref<UserManageItem[]>([])
const dialogVisible = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

// ====== 表单数据 ======
const form = reactive({
  username: '',
  password: '',
  email: '',
  role: '普通用户'
})

// ====== 表单验证规则 ======
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度 2~20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度 6~30 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
})

// ====== 格式化日期 ======
const formatDate = (date: string | null) => {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return date.substring(0, 10)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ====== 加载用户列表 ======
const loadUserList = async () => {
  loading.value = true
  try {
    const res = await getUserList()
    userList.value = res.data || []
  } catch {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// ====== 新增用户 ======
const handleAddUser = () => {
  isEditing.value = false
  editingId.value = null
  form.username = ''
  form.password = ''
  form.email = ''
  form.role = '普通用户'
  dialogVisible.value = true
}

// ====== 编辑用户 ======
const handleEdit = (row: UserManageItem) => {
  isEditing.value = true
  editingId.value = row.id
  form.username = row.username
  form.password = ''
  form.email = row.email
  form.role = row.role
  dialogVisible.value = true
}

// ====== 提交表单 ======
const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEditing.value && editingId.value !== null) {
      await updateUser(editingId.value, {
        username: form.username,
        email: form.email,
        role: form.role
      })
      ElMessage.success('用户信息已更新')
    } else {
      await registerUser({
        username: form.username,
        password: form.password,
        email: form.email,
        role: form.role
      })
      ElMessage.success('用户注册成功')
    }
    dialogVisible.value = false
    await loadUserList()
  } catch {
    ElMessage.error(isEditing.value ? '更新用户失败' : '注册用户失败')
  } finally {
    submitting.value = false
  }
}

// ====== 删除用户 ======
const handleDelete = async (row: UserManageItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户「${row.username}」吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
    await deleteUser(row.id)
    ElMessage.success('用户已删除')
    await loadUserList()
  } catch (err: unknown) {
    if (err !== 'cancel') {
      ElMessage.error('删除用户失败')
    }
  }
}

// ====== 重置表单 ======
const resetForm = () => {
  formRef.value?.resetFields()
  form.password = ''
}

// ====== 初始化 ======
onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.user-manage {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-bar {
  display: flex;
  justify-content: flex-start;
}

.table-card {
  border-radius: 12px;
  border: none;
  background: #fff;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.table-card :deep(.el-table__header-wrapper th.el-table__cell) {
  background: #f8f9fd !important;
  color: #303133;
  font-weight: 600;
  font-size: 13px;
  padding: 12px 0;
  border-bottom: 2px solid #e8ecf4;
}

.table-card :deep(.el-table__body-wrapper td.el-table__cell) {
  padding: 10px 0;
  font-size: 13px;
  color: #4a4a5a;
}

.table-card :deep(.el-table__row:hover td.el-table__cell) {
  background: #f5f6ff !important;
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: #f9fafc;
}
</style>
