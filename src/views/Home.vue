<!--
  ============================================================
  文件：src/views/Home.vue
  作用：首页视图组件（路由 '/' 对应的页面）
  说明：
    - 使用 Element Plus 的 el-card、el-row、el-col 组件
    - 展示三个导航卡片，点击后跳转到对应子页面
  ============================================================
-->

<!-- ========== 脚本区 ========== -->
<script setup lang="ts">
/**
 * useRouter() 获取全局路由实例
 */
import { useRouter } from 'vue-router'
import { Document, DataAnalysis, Setting, Files } from '@element-plus/icons-vue'
const router = useRouter()
</script>

<!-- ========== 模板区 ========== -->
<template>
  <div class="home">
    <!-- 页面主标题 -->
    <h1>🏠 首页</h1>
    <p class="subtitle">选择要跳转的页面：</p>

    <!-- 三个导航卡片容器 -->
    <el-row :gutter="24" class="nav-cards">
      <!-- 卡片一：跳转到页面一 -->
      <el-col :span="8" :xs="24" :sm="12" :md="8">
        <el-card
          class="nav-card"
          shadow="hover"
          @click="router.push('/page1')"
        >
          <div class="card-content">
            <el-icon :size="48" color="#6366f1"><Document /></el-icon>
            <h3>页面一</h3>
            <p>基础信息展示</p>
          </div>
        </el-card>
      </el-col>

      <!-- 卡片二：跳转到页面二 -->
      <el-col :span="8" :xs="24" :sm="12" :md="8">
        <el-card
          class="nav-card"
          shadow="hover"
          @click="router.push('/page2')"
        >
          <div class="card-content">
            <el-icon :size="48" color="#6366f1"><DataAnalysis /></el-icon>
            <h3>页面二</h3>
            <p>数据统计分析</p>
          </div>
        </el-card>
      </el-col>

      <!-- 卡片三：跳转到页面三 -->
      <el-col :span="8" :xs="24" :sm="12" :md="8">
        <el-card
          class="nav-card"
          shadow="hover"
          @click="router.push('/page3')"
        >
          <div class="card-content">
            <el-icon :size="48" color="#6366f1"><Setting /></el-icon>
            <h3>页面三</h3>
            <p>系统设置管理</p>
          </div>
        </el-card>
      </el-col>
      <!-- 卡片四：跳转到页面四（工装申请） -->
      <el-col :span="8" :xs="24" :sm="12" :md="8">
        <el-card
          class="nav-card"
          shadow="hover"
          @click="router.push('/page4')"
        >
          <div class="card-content">
            <el-icon :size="48" color="#6366f1"><Files /></el-icon>
            <h3>工装申请</h3>
            <p>工装申请管理</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<!-- ========== 样式区（scoped） ========== -->
<style scoped>
.home {
  width: 100%;
  padding: 40px 20px;
  text-align: center;
}

.home h1 {
  color: #18191c;
  margin-bottom: 8px;
}

.subtitle {
  color: #888;
  margin-bottom: 40px;
}

.nav-cards {
  justify-content: center;
}

.nav-card {
  cursor: pointer;
  transition: all 0.25s;
  border-radius: 16px;
}

.nav-card:hover {
  transform: translateY(-6px);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.card-content h3 {
  color: #444;
  margin: 12px 0 6px;
}

.card-content p {
  color: #888;
  margin: 0;
}
</style>
