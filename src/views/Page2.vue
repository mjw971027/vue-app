<!--
  ============================================================
  文件：src/views/Page2.vue
  作用：页面二 —— 数据统计分析
  路由：/page2
  说明：
    - 使用 Element Plus 的 el-card、el-statistic、el-table 等组件
    - 从后端 API 获取月度统计数据
    - 显示月度销售额柱状图
  ============================================================
-->

<!-- ========== 脚本区 ========== -->
<script setup lang="ts">
// ref() 创建响应式变量
// onMounted() 生命周期钩子，组件挂载后自动执行
import { ref, onMounted } from 'vue'
// useRouter() 获取路由实例，用于返回首页
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'


// 导入 API 函数
import { getMonthlyStats, getStatsSummary } from '../api/stats'
// 导入类型定义
import type { MonthlyStats, StatsSummary } from '../api/types'

const router = useRouter()

/**
 * 月度收入数据（响应式）
 */
const monthlyData = ref<MonthlyStats[]>([])

/**
 * 统计摘要（响应式）
 */
const summary = ref<StatsSummary | null>(null)

/** 加载状态 & 错误状态 */
const loading = ref(true)
const errorMsg = ref('')

/**
 * 计算总销售额
 */
const total = () => {
  if (summary.value && summary.value.totalSales !== undefined) {
    return summary.value.totalSales
  }
  if (monthlyData.value.length > 0) {
    return monthlyData.value.reduce((sum, item) => sum + (item.sales || 0), 0)
  }
  return 0
}

/**
 * 获取最大值（用于计算柱状图百分比宽度）
 */
const maxValue = () => {
  if (monthlyData.value.length === 0) return 7000
  return Math.max(...monthlyData.value.map(d => d.sales || 0))
}

/**
 * 页面挂载后自动调用两个 API
 */
onMounted(async () => {
  try {
    loading.value = true
    const [statsRes, summaryRes] = await Promise.all([
      getMonthlyStats(),
      getStatsSummary(),
    ])
    monthlyData.value = statsRes.data || []
    summary.value = summaryRes.data || null
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
        <h1>📊 页面二：数据统计</h1>
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
        <!-- 统计摘要卡片区 -->
        <el-row :gutter="16" class="summary">
          <!-- 卡片一：总收入 -->
          <el-col :span="12" :xs="24">
            <el-card shadow="hover" class="stat-card">
              <el-statistic
                title="总收入"
                :value="total()"
                prefix="¥"
              />
            </el-card>
          </el-col>
          <!-- 卡片二：总订单数 -->
          <el-col :span="12" :xs="24" v-if="summary && summary.totalOrders !== undefined">
            <el-card shadow="hover" class="stat-card green">
              <el-statistic
                title="总订单数"
                :value="summary.totalOrders"
                suffix="单"
              />
            </el-card>
          </el-col>
        </el-row>

        <!-- 柱状图区 -->
        <div class="chart" v-if="monthlyData.length > 0">
          <div class="bar" v-for="d in monthlyData" :key="d.month">
            <div class="bar-label">{{ d.month }}</div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ width: (d.sales / maxValue() * 100) + '%' }"
              >
                ¥{{ d.sales.toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <!-- 统计汇总详情 -->
        <el-descriptions
          v-if="summary && summary.totalSales !== undefined"
          :column="2"
          border
          class="detail"
        >
          <el-descriptions-item label="总销售额">
            ¥{{ summary.totalSales.toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="总订单数">
            {{ summary.totalOrders }} 单
          </el-descriptions-item>
          <el-descriptions-item label="总客户数">
            {{ summary.totalCustomers }} 人
          </el-descriptions-item>
          <el-descriptions-item label="平均增长率">
            {{ summary.averageGrowthRate }}%
          </el-descriptions-item>
          <el-descriptions-item label="今日销售额">
            ¥{{ summary.todaySales.toLocaleString() }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 空数据提示 -->
        <el-empty v-else description="暂无统计数据" />
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

/* 统计卡片容器 */
.summary {
  margin-bottom: 32px;
}

/* 单个统计卡片 */
.stat-card {
  border-radius: 10px;
}

/* 柱状图容器 */
.chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

/* 单行柱形 */
.bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 月份标签 */
.bar-label {
  width: 60px;
  font-size: 13px;
  color: #666;
  text-align: right;
}

/* 柱形轨道 */
.bar-track {
  flex: 1;
  height: 32px;
  background: #f5f5f5;
  border-radius: 6px;
  overflow: hidden;
}

/* 柱形填充 */
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #818cf8);
  border-radius: 6px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  font-size: 13px;
  color: #fff;
  font-weight: 600;
  transition: width 0.6s ease;
}

/* 统计汇总详情 */
.detail {
  margin-top: 20px;
}

/* 状态提示 */
.status-tip {
  padding: 40px 0;
}
</style>
