<!--
  ============================================================
  文件：src/views/Page3.vue
  作用：页面三 —— 系统设置管理（暂时禁用）
  路由：/page3
  说明：
    - mo 后端没有系统设置 API，暂时展示占位内容
  ============================================================
-->

<!-- ========== 脚本区 ========== -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Warning } from '@element-plus/icons-vue'

const router = useRouter()
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
        <h1>⚙️ 页面三：系统设置</h1>
      </template>

      <!-- ========== 占位内容 ========== -->
      <div class="placeholder">
        <el-icon :size="64" color="#e6a23c"><Warning /></el-icon>
        <h2>功能暂未开放</h2>
        <p>mo 后端暂无系统设置接口，此功能暂时不可用。</p>
        <el-button type="primary" @click="router.push('/')">返回首页</el-button>
      </div>
    </el-card>
  </div>
</template>

<!-- ========== 样式区（scoped） ========== -->
<style scoped>
/* 页面容器 */
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

/* 占位内容 */
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.placeholder h2 {
  margin: 20px 0 10px;
  color: #606266;
  font-size: 20px;
}

.placeholder p {
  color: #909399;
  margin-bottom: 30px;
}
</style>
