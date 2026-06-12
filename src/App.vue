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
import { isAuthenticated, getToken, getUserInfoFromToken, isAdmin, getStoredPermissions, removeToken, refreshPermissions, clearPermissions } from './utils/auth'
import { logout } from './api/auth'
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isLoggedIn = ref(false)
const showTokenModal = ref(false)  // 控制 Token 弹窗显示
const tokenInfo = ref('')          // Token 信息
const activeIndex = ref('/')       // 当前激活的菜单项
const isAdminUser = ref(false)     // 是否为管理员
const pagePerms = ref<string[]>([]) // 当前用户页面权限
const isAuthPage = computed(() => ['/login', '/register'].includes(route.path))
const currentUsername = ref('')     // 当前登录用户名

/** 检查当前用户是否有权访问页面（响应式） */
const hasPerm = (key: string) => {
  if (isAdminUser.value) return true
  return pagePerms.value.includes(key)
}

/** 从 JWT 获取当前用户名 */
const getUsername = () => {
  const info = getUserInfoFromToken()
  return info?.sub || info?.username || ''
}

/** 检查登录状态并刷新权限 */
const checkAuth = () => {
  isLoggedIn.value = isAuthenticated()
  isAdminUser.value = isAdmin()
  currentUsername.value = isLoggedIn.value ? getUsername() : ''
  pagePerms.value = isLoggedIn.value ? getStoredPermissions() : []
  if (isLoggedIn.value) {
    refreshPermissions().then(() => { pagePerms.value = getStoredPermissions() })
  }
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
  // 1. 先调用后端退出接口（响应也返回 token，但我们已退出不需要处理）
  try {
    await logout()
  } catch {
    // API 调用失败继续执行
  }

  // 2. 清除本地状态
  removeToken()
  clearPermissions()
  isLoggedIn.value = false
  isAdminUser.value = false
  currentUsername.value = ''
  pagePerms.value = []

  // 3. 跳转到登录页
  window.location.href = '/login'
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
    <!-- 侧边栏布局（非登录页面） -->
    <template v-if="!isAuthPage">
      <div class="app-layout">
        <aside class="app-sidebar">
        <el-menu
          mode="vertical"
          :default-active="activeIndex"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <!-- 品牌 Logo -->
          <el-menu-item index="/" class="logo-item">
            <el-icon><HomeFilled /></el-icon>
            <span>MyVueApp</span>
          </el-menu-item>

          <el-divider class="menu-divider" />

          <!-- 导航链接（根据权限显示） -->
          <el-menu-item v-if="hasPerm('page1')" index="/page1">
            <el-icon><Document /></el-icon>
            <span>页面一</span>
          </el-menu-item>
          <el-menu-item v-if="hasPerm('page2')" index="/page2">
            <el-icon><DataAnalysis /></el-icon>
            <span>页面二</span>
          </el-menu-item>
          <el-menu-item v-if="hasPerm('page3')" index="/page3">
            <el-icon><Setting /></el-icon>
            <span>页面三</span>
          </el-menu-item>
          <el-menu-item v-if="hasPerm('page4')" index="/page4">
            <el-icon><Files /></el-icon>
            <span>工装申请</span>
          </el-menu-item>
          <el-menu-item v-if="isAdminUser" index="/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>

        <!-- 侧边栏底部按钮组 -->
        <div class="sidebar-footer">
          <template v-if="isLoggedIn">
            <div class="user-info">
              <el-icon><User /></el-icon>
              <span class="user-name">{{ currentUsername }}</span>
              <el-tag v-if="isAdminUser" size="small" type="warning" effect="dark" round>ADMIN</el-tag>
            </div>
            <el-divider class="footer-divider" />
            <el-button type="primary" link class="sidebar-btn" @click="showTokenInfo">
              <el-icon><Key /></el-icon>
              <span>Token</span>
            </el-button>
            <el-button type="danger" link class="sidebar-btn" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出</span>
            </el-button>
          </template>
          <template v-else>
            <el-menu-item index="/login">
              <el-icon><User /></el-icon>
              <span>登录</span>
            </el-menu-item>
          </template>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="main-content">
        <router-view />
      </main>
      </div>
    </template>

    <!-- 登录页面：全屏无侧边栏 -->
    <router-view v-else />

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

/* ===== 侧边栏 ===== */
.app-sidebar {
  width: 220px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e8ecf4;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.logo-item {
  font-weight: 700;
  font-size: 16px;
  color: #6366f1 !important;
  height: 56px !important;
  line-height: 56px !important;
}

.logo-item .el-icon {
  font-size: 20px;
}

.menu-divider {
  margin: 0 12px;
  border-color: #f0f0f0;
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  padding-top: 0;
}

.sidebar-menu .el-menu-item {
  height: 44px;
  line-height: 44px;
  margin: 2px 8px;
  border-radius: 8px;
  font-size: 14px;
}

.sidebar-menu .el-menu-item.is-active {
  background: #eeefff !important;
  color: #6366f1 !important;
}

.sidebar-menu .el-menu-item:hover {
  background: #f5f6ff !important;
}

/* ===== 侧边栏底部 ===== */
.sidebar-footer {
  border-top: 1px solid #f0f0f0;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: #303133;
}

.user-info .el-icon {
  font-size: 16px;
  color: #909399;
}

.user-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.footer-divider {
  margin: 4px 8px;
  border-color: #f0f0f0;
}

.sidebar-footer .sidebar-btn {
  width: 100%;
  justify-content: flex-start;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-footer .sidebar-btn:hover {
  background: #f5f6ff;
}

.sidebar-footer .el-menu-item {
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  font-size: 14px;
}

/* ===== 主内容区 ===== */
.main-content {
  margin-left: 220px;
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
