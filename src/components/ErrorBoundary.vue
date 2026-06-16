<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary-content">
      <el-icon class="error-icon" :size="64" color="#F56C6C">
        <WarningFilled />
      </el-icon>
      <h2 class="error-title">页面出现错误</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <el-button type="primary" @click="handleRetry">
          <el-icon><RefreshRight /></el-icon>
          重试
        </el-button>
        <el-button @click="handleGoHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
      </div>
      <el-collapse v-if="isDev && errorDetails" class="error-details">
        <el-collapse-item title="错误详情（开发模式）">
          <pre>{{ errorDetails }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'


import { ElMessage } from 'element-plus'

const router = useRouter()

const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const isDev = import.meta.env.DEV

/**
 * 捕获子组件错误
 * 返回 false 阻止错误继续向上传播
 */
onErrorCaptured((err, _instance, info) => {
  hasError.value = true
  errorMessage.value = err.message || '发生未知错误'
  errorDetails.value = `${err.stack}\n\nComponent: ${info}`

  // 可以上报错误到监控服务
  // reportError(err, info)

  return false
})

/** 重试：重置错误状态 */
const handleRetry = () => {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
}

/** 返回首页 */
const handleGoHome = () => {
  hasError.value = false
  router.push('/')
  ElMessage.info('已返回首页')
}
</script>

<style scoped lang="scss">
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}

.error-boundary-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  margin-bottom: 24px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.error-message {
  font-size: 14px;
  color: #606266;
  margin-bottom: 24px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.error-details {
  text-align: left;
  margin-top: 20px;

  pre {
    font-size: 12px;
    color: #909399;
    white-space: pre-wrap;
    word-break: break-all;
    background: #f5f7fa;
    padding: 12px;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>
