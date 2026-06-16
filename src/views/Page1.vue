<!--
  ============================================================
  文件：src/views/Page1.vue
  作用：页面一 —— 基础信息展示
  路由：/page1
  说明：
    - 使用 Element Plus 的 el-descriptions、el-card 等组件
   - 从后端 API 获取用户信息并展示
  ============================================================
-->

<!-- ========== 脚本区 ========== -->
<script setup lang="ts">
/**
 * useRouter() 获取路由实例，用于返回首页
 * ref() 创建响应式变量
 * onMounted() 生命周期钩子，组件挂载后自动执行
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'


import type { UserInfo } from '../api/types'   // 导入类型定义
import { getUserInfo } from '../api/user'       // 导入 API 函数
import { ElMessage } from 'element-plus'

const router = useRouter()

/**
 * 用户信息（响应式）
 */
const user = ref<UserInfo | null>(null)

/**
 * 加载状态 & 错误状态（用于 UI 展示）
 */
const loading = ref(true)
const errorMsg = ref('')

/**
 * 页面挂载后自动调用 API 获取用户信息
 */
onMounted(async () => {
  try {
    loading.value = true                    // 开始加载，显示 loading
    const res = await getUserInfo()        // 调用 API
    // res 类型：ApiResponse<UserInfo>
    // res.data 才是真正的 UserInfo 对象
    user.value = res.data
  } catch (err: any) {
    errorMsg.value = err.message || '获取用户信息失败'
    ElMessage.error(errorMsg.value)
  } finally {
    loading.value = false                 // 无论成功失败，结束 loading
  }
})
</script>

<!-- ========== 模板区 ========== -->
<template>
  <div class="page">
    <!-- 返回首页按钮 -->
    <el-button type="primary" link @click="router.push('/')" class="back-btn">
      <el-icon><ArrowLeft /></el-icon>
      返回首页
    </el-button>

    <el-card class="content" shadow="always">
      <template #header>
        <h1>📄 页面一：基础信息</h1>
      </template>

      <!-- ========== 加载中状态 ========== -->
      <div v-if="loading" class="status-tip">
        <el-skeleton :rows="4" animated />
      </div>

      <!-- ========== 错误状态 ========== -->
      <el-alert
        v-else-if="errorMsg"
        :title="errorMsg"
        type="error"
        show-icon
        :closable="false"
      />

      <!-- ========== 数据展示（数据加载成功后）========== -->
      <template v-else-if="user">
        <el-descriptions
          :column="1"
          border
          direction="vertical"
        >
          <el-descriptions-item label="用户名">
            {{ user.username }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ user.email }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            {{ user.role }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="user.status === '在线' ? 'success' : 'info'">
              {{ user.status }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- ========== 空状态（数据为空）========== -->
      <el-empty v-else description="暂无数据" />
    </el-card>
  </div>
</template>

<!-- ========== 样式区（scoped） ========== -->
<style scoped>
/* 页面容器：最大宽度 800px，水平居中，上下内边距 */
.page { width: 100%; padding: 40px 20px; }

/* 返回按钮 */
.back-btn {
  margin-bottom: 20px;
  padding-left: 0;
}

/* 内容卡片 */
.content {
  border-radius: 12px;
}

/* 标题 */
.content h1 {
  color: #18191c;
  margin: 0;
}

/* 状态提示 */
.status-tip {
  padding: 40px 0;
}
</style>
