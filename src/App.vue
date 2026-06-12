<!--
  ============================================================
  文件：src/App.vue
  作用：Vue 应用的根组件（侧边栏布局 + 认证状态管理）
  ============================================================
-->
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const activeIndex = ref('/')
const isAuthPage = computed(() => ['/login', '/register'].includes(route.path))

// 组件挂载时 + 路由变化时刷新认证状态
auth.refreshAuth()
watch(() => route.path, (newPath) => {
  auth.refreshAuth()
  activeIndex.value = newPath
})

/** 退出登录 */
const handleLogout = async () => {
  await auth.logout()
}

/** 菜单跳转 */
const handleMenuSelect = (index: string) => {
  router.push(index)
}
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
          <el-menu-item index="/" class="logo-item">
            <el-icon><HomeFilled /></el-icon>
            <span>MyVueApp</span>
          </el-menu-item>

          <el-divider class="menu-divider" />

          <el-menu-item v-if="auth.hasPerm('page1')" index="/page1">
            <el-icon><Document /></el-icon>
            <span>页面一</span>
          </el-menu-item>
          <el-menu-item v-if="auth.hasPerm('page2')" index="/page2">
            <el-icon><DataAnalysis /></el-icon>
            <span>页面二</span>
          </el-menu-item>
          <el-menu-item v-if="auth.hasPerm('page3')" index="/page3">
            <el-icon><Setting /></el-icon>
            <span>页面三</span>
          </el-menu-item>
          <el-menu-item v-if="auth.hasPerm('page4')" index="/page4">
            <el-icon><Files /></el-icon>
            <span>工装申请</span>
          </el-menu-item>
          <el-menu-item v-if="auth.isAdminUser" index="/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>

        <div class="sidebar-footer">
          <template v-if="auth.isLoggedIn">
            <div class="user-info">
              <el-icon><User /></el-icon>
              <span class="user-name">{{ auth.currentUsername }}</span>
              <el-tag
                v-if="auth.isAdminUser"
                size="small"
                type="warning"
                effect="dark"
                round
              >
                ADMIN
              </el-tag>
            </div>
            <el-divider class="footer-divider" />
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

      <main class="main-content">
        <router-view />
      </main>
      </div>
    </template>

    <router-view v-else />
  </div>
</template>

<style lang="scss">
/* ===== 全局样式重置 ===== */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f5f6fa;
  color: #18191c;
}

#app { min-height: 100vh; }

/* ===== 侧边栏 ===== */
$sidebar-width: 220px;

.app-sidebar {
  width: $sidebar-width;
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

  .el-icon { font-size: 20px; }
}

.menu-divider {
  margin: 0 12px;
  border-color: #f0f0f0;
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  padding-top: 0;

  .el-menu-item {
    height: 44px;
    line-height: 44px;
    margin: 2px 8px;
    border-radius: 8px;
    font-size: 14px;

    &.is-active {
      background: #eeefff !important;
      color: #6366f1 !important;
    }

    &:hover { background: #f5f6ff !important; }
  }
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

  .el-icon { font-size: 16px; color: #909399; }
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

  &:hover { background: #f5f6ff; }
}

.sidebar-footer .el-menu-item {
  height: 40px;
  line-height: 40px;
  border-radius: 8px;
  font-size: 14px;
}

/* ===== 主内容区 ===== */
.main-content {
  margin-left: $sidebar-width;
  flex: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
