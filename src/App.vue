<!--
  ============================================================
  文件：src/App.vue
  作用：PVM 系统根组件 - 侧边栏布局 + 路由出口
  ============================================================
-->
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, watch } from 'vue'
import { isAdmin } from './utils/auth'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const activeIndex = ref('/')
const isAuthPage = computed(() => route.path === '/login')

// 路由变化时刷新活跃项
watch(
  () => route.path,
  (newPath) => {
    activeIndex.value = newPath
  },
  { immediate: true },
)

/** 退出登录 */
const handleLogout = async () => {
  await auth.logout()
}

/** 菜单跳转 */
const handleMenuSelect = (index: string) => {
  router.push(index)
}

/** 当前登录用户名 */
const currentUsername = computed(() => {
  const username = auth.currentUsername
  return username || (isAdmin() ? '系统管理员' : '用户')
})
</script>

<template>
  <div id="app">
    <!-- 登录/注册页面：不需要侧边栏 -->
    <router-view v-if="isAuthPage" />

    <!-- 其他页面：侧边栏布局 -->
    <div v-else class="app-layout">
      <!-- ========== 左侧菜单 ========== -->
      <aside class="app-sidebar">
        <el-menu
          :default-active="activeIndex"
          class="sidebar-menu"
          mode="vertical"
          @select="handleMenuSelect"
        >
          <!-- LOGO / 项目名 -->
          <div class="app-logo">
            <el-icon :size="24" color="#6366f1"><DataBoard /></el-icon>
            <span class="logo-title">PVM 管理系统</span>
          </div>

          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-divider class="menu-divider" />

          <!-- ========== 业务模块 ========== -->
          <el-sub-menu index="business" :default-openeds="['business']">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>业务模块</span>
            </template>

            <el-menu-item index="/pvm/detail">
              <el-icon><Files /></el-icon>
              <span>报审申请</span>
            </el-menu-item>
            <el-menu-item index="/pvm/search">
              <el-icon><Search /></el-icon>
              <span>设计评标项目查询</span>
            </el-menu-item>
            <el-menu-item index="/pvm/meeting">
              <el-icon><Calendar /></el-icon>
              <span>会议管理</span>
            </el-menu-item>
            <el-menu-item index="/pvm/meeting-list">
              <el-icon><List /></el-icon>
              <span>会议编号列表</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- ========== 配置模块 ========== -->
          <el-sub-menu index="manage">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>配置模块</span>
            </template>

            <el-menu-item index="/pvm/manage/type">
              <el-icon><Collection /></el-icon>
              <span>评审会类型</span>
            </el-menu-item>
            <el-menu-item index="/pvm/manage/approve">
              <el-icon><Connection /></el-icon>
              <span>审批节点</span>
            </el-menu-item>
            <el-menu-item index="/pvm/manage/admin">
              <el-icon><UserFilled /></el-icon>
              <span>评审会管理员</span>
            </el-menu-item>
            <el-menu-item index="/pvm/applicant">
              <el-icon><Avatar /></el-icon>
              <span>申请人配置</span>
            </el-menu-item>
            <el-menu-item index="/pvm/authority">
              <el-icon><Key /></el-icon>
              <span>报审申请权限</span>
            </el-menu-item>
            <el-menu-item index="/pvm/score">
              <el-icon><TrendCharts /></el-icon>
              <span>供应商评分</span>
            </el-menu-item>
            <el-menu-item index="/pvm/sort">
              <el-icon><Sort /></el-icon>
              <span>供应商排序</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- ========== 系统管理 ========== -->
          <el-sub-menu index="system" v-if="isAdmin()">
            <template #title>
              <el-icon><Tools /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/users">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>

        <!-- 底部用户信息 -->
        <div class="sidebar-footer">
          <div class="user-info">
            <el-avatar :size="32" class="user-avatar">
              {{ (currentUsername as string).slice(0, 1).toUpperCase() }}
            </el-avatar>
            <div class="user-text">
              <div class="user-name">{{ currentUsername }}</div>
              <el-tag v-if="isAdmin()" size="small" type="warning" effect="dark" round>
                管理员
              </el-tag>
              <span v-else class="user-role-tag">普通用户</span>
            </div>
          </div>
          <el-button type="danger" link class="sidebar-btn" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-button>
        </div>
      </aside>

      <!-- ========== 主内容区 ========== -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style lang="scss">
/* ===== 全局样式重置 ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
  background: #f5f6fa;
  color: #18191c;
}

#app {
  min-height: 100vh;
}

/* ===== 侧边栏 ===== */
.app-sidebar {
  width: 240px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e8ecf4;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
}

.app-logo {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  border-bottom: 1px solid #e8ecf4;

  .logo-title {
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
  }
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  padding: 8px;
}

.menu-divider {
  margin: 4px 0;
  border-color: #f0f0f0;
}

/* ===== 侧边栏底部 ===== */
.sidebar-footer {
  border-top: 1px solid #e8ecf4;
  padding: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #f9fafb;
  border-radius: 8px;
}

.user-avatar {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  color: white;
}

.user-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 13px;
  color: #1f2937;
  font-weight: 600;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role-tag {
  font-size: 11px;
  color: #6b7280;
}

.sidebar-btn {
  width: 100%;
  justify-content: flex-start;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== 主内容区 ===== */
.main-content {
  margin-left: 240px;
  flex: 1;
  min-height: 100vh;
  padding: 20px;
  background: #f5f6fa;
}

/* ===== 页面切换动画 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
