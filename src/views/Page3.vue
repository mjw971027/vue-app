<!--
  ============================================================
  文件：src/views/Page3.vue
  作用：页面三 —— 系统设置管理
  路由：/page3
  说明：
    - 使用 Element Plus 的 el-switch、el-list、el-descriptions 等组件
    - 从后端 API 获取设置列表和系统信息
    - 点击开关时调用 API 切换状态
  ============================================================
-->

<!-- ========== 脚本区 ========== -->
<script setup lang="ts">
// ref() 创建响应式数据
// onMounted() 生命周期钩子，组件挂载后执行
import { ref, onMounted } from 'vue'
// useRouter() 获取路由实例，用于返回首页
import { useRouter } from 'vue-router'
// 导入 API 函数
import { getSettings, toggleSetting, getSystemInfo } from '../api/settings'
// 导入类型定义
import type { SettingItem, SystemInfo } from '../api/types'
import { ElMessage } from 'element-plus'

const router = useRouter()

/**
 * 设置项列表（响应式）
 */
const settings = ref<SettingItem[]>([])

/**
 * 系统信息（响应式）
 */
const systemInfo = ref<SystemInfo | null>(null)

/** 加载状态 & 错误状态 */
const loading = ref(true)
const errorMsg = ref('')

/**
 * 切换指定设置项的开关状态
 * @param id - 要切换的设置项 ID
 */
const toggle = async (id: number) => {
  const item = settings.value.find(s => s.id === id)
  if (!item) return

  // 乐观更新：先本地切换状态
  item.enabled = !item.enabled

  try {
    // 调用 API 通知后端保存状态
    await toggleSetting(id)
    ElMessage.success(`已${item.enabled ? '开启' : '关闭'} ${item.name}`)
  } catch (err: any) {
    // API 失败：回滚本地状态 + 提示错误
    item.enabled = !item.enabled
    ElMessage.error('操作失败：' + (err.message || '网络异常'))
  }
}

/**
 * 页面挂载后并行加载设置列表和系统信息
 */
onMounted(async () => {
  try {
    loading.value = true
    const [settingsRes, systemRes] = await Promise.all([
      getSettings(),
      getSystemInfo(),
    ])
    settings.value = settingsRes.data
    systemInfo.value = systemRes.data
  } catch (err: any) {
    errorMsg.value = err.message || '获取数据失败'
    ElMessage.error(errorMsg.value)
  } finally {
    loading.value = false
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
        <h1>⚙️ 页面三：系统设置</h1>
      </template>

      <!-- ========== 加载中 ========== -->
      <div v-if="loading" class="status-tip">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- ========== 错误状态 ========== -->
      <el-alert
        v-else-if="errorMsg"
        :title="errorMsg"
        type="error"
        show-icon
        :closable="false"
      />

      <!-- ========== 数据展示 ========== -->
      <template v-else>
        <!-- 设置项列表 -->
        <el-list class="settings-list">
          <el-list-item v-for="s in settings" :key="s.id" class="setting-item">
            <div class="setting-info">
              <span class="setting-name">{{ s.name }}</span>
              <span class="setting-desc">{{ s.enabled ? '已开启' : '已关闭' }}</span>
            </div>
            <el-switch
              v-model="s.enabled"
              @change="toggle(s.id)"
              active-color="#6366f1"
            />
          </el-list-item>
        </el-list>

        <!-- 底部信息区（从 API 获取） -->
        <el-descriptions
          v-if="systemInfo"
          :column="2"
          border
          class="footer-info"
        >
          <el-descriptions-item label="系统版本">
            {{ systemInfo.version }}
          </el-descriptions-item>
          <el-descriptions-item label="最后更新">
            {{ systemInfo.lastUpdate }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
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

/* 设置列表 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 单个设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-radius: 10px;
  background: #fafafa;
  transition: background 0.2s;
}

.setting-item:hover {
  background: #f0f0ff;
}

/* 设置项名称 */
.setting-name {
  font-size: 15px;
  font-weight: 500;
  color: #18191c;
}

/* 设置项描述 */
.setting-desc {
  font-size: 12px;
  color: #999;
  display: block;
  margin-top: 2px;
}

/* 底部信息区 */
.footer-info {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 状态提示 */
.status-tip {
  padding: 40px 0;
}
</style>
