<!--
  ============================================================
  文件：src/App.vue
  作用：Vue 应用的根组件（Root Component）
  说明：
    - 是整个应用的最顶层组件，所有页面都在这个组件内渲染
    - 使用 Element Plus 的 el-menu 组件作为顶部导航栏
    - 包含 Token 显示弹窗（使用 el-dialog）
  ============================================================
-->

<script setup lang="ts">
/* eslint-disable no-undef */
/**
 * 顶部导航栏逻辑
 * - 检查登录状态，显示/隐藏退出按钮
 * - 退出登录功能
 * - 显示当前 Token
 */
import { useRouter, useRoute } from 'vue-router'
import { isAuthenticated, getToken, getUserInfoFromToken } from './utils/auth'
import { logout } from './api/auth'
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isLoggedIn = ref(false)
const showTokenModal = ref(false)  // 控制 Token 弹窗显示
const tokenInfo = ref('')          // Token 信息
const activeIndex = ref('/')       // 当前激活的菜单项

/** 检查登录状态 */
const checkAuth = () => {
  isLoggedIn.value = isAuthenticated()
}

// 初始检查
checkAuth()

// 监听路由变化，每次路由切换时重新检查登录状态
watch(() => route.path, (newPath) => {
  checkAuth()
  activeIndex.value = newPath
})

/** 退出登录 */
const handleLogout = async () => {
  try {
    await logout()
    ElMessage.success('已退出登录')
  } catch {
    ElMessage.warning('后端退出失败，但已清除本地登录状态')
  } finally {
    isLoggedIn.value = false
    router.push('/login')
  }
}

/** 显示 Token 信息 */
const showTokenInfo = () => {
  const token = getToken()
  if (!token) {
    tokenInfo.value = '未找到 Token'
  } else {
    const userInfo = getUserInfoFromToken()
    tokenInfo.value = `Token: ${token}\n\n解析后的用户信息:\n${userInfo ? JSON.stringify(userInfo, null, 2) : '解析失败'}`
  }
  showTokenModal.value = true
}

/** 关闭 Token 弹窗 */
const closeTokenModal = () => {
  showTokenModal.value = false
  tokenInfo.value = ''
}

/** 复制 Token 到剪贴板 */
const copyToken = async () => {
  const token = getToken()
  if (token) {
    try {
      await window.navigator.clipboard.writeText(token)
      ElMessage.success('Token 已复制到剪贴板')
    } catch (err: unknown) {
      window.console.error('复制失败:', err)
      ElMessage.error('复制失败')
    }
  }
}

/** 处理菜单跳转 */
const handleMenuSelect = (index: string) => {
  router.push(index)
}
/* eslint-enable no-undef */
</script>

<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <el-menu
      mode="horizontal"
      :default-active="activeIndex"
      class="top-nav"
      @select="handleMenuSelect"
    >
      <!-- 品牌 Logo -->
      <el-menu-item index="/" class="logo-item">
        <el-icon><HomeFilled /></el-icon>
        MyVueApp
      </el-menu-item>

      <!-- 导航链接 -->
      <el-menu-item index="/page1">
        <el-icon><Document /></el-icon>
        页面一
      </el-menu-item>
      <el-menu-item index="/page2">
        <el-icon><DataAnalysis /></el-icon>
        页面二
      </el-menu-item>
      <el-menu-item index="/page3">
        <el-icon><Setting /></el-icon>
        页面三
      </el-menu-item>
      <el-menu-item index="/page4">
        <el-icon><Files /></el-icon>
        工装申请
      </el-menu-item>

      <!-- 右侧按钮组 -->
      <div class="nav-right">
        <template v-if="isLoggedIn">
          <el-button type="primary" link @click="showTokenInfo">
            <el-icon><Key /></el-icon>
            Token
          </el-button>
          <el-button type="danger" link @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </template>
        <template v-else>
          <el-menu-item index="/login">
            <el-icon><User /></el-icon>
            登录
          </el-menu-item>
        </template>
      </div>
    </el-menu>

    <!-- 主内容区 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Token 信息弹窗 -->
    <el-dialog
      v-model="showTokenModal"
      title="当前 Token 信息"
      width="600px"
    >
      <el-input
        type="textarea"
        :model-value="tokenInfo"
        :rows="10"
        readonly
      />
      <template #footer>
        <el-button @click="copyToken">复制 Token</el-button>
        <el-button type="primary" @click="closeTokenModal">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style>
/* ===== 全局样式重置 ===== */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f5f6fa;
  color: #18191c;
}

#app { min-height: 100vh; }

/* ===== 顶部导航栏 ===== */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 8px rgba(0,0,0,0.06);
}

.logo-item {
  font-weight: 700;
  font-size: 16px;
  color: #6366f1 !important;
}

.nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== 主内容区 ===== */
.main-content {
  width: 100%;
  max-width: 100%;
  margin: 0;
  min-height: calc(100vh - 60px); /* 减去导航栏高度 */
  display: flex;
  flex-direction: column;
}
</style>
