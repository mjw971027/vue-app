<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDataGrid, type PriceVerifMtDetailRow } from '@/api/pvm'

const router = useRouter()

const loading = ref(false)
const totalCount = ref(128)
const monthAdd = ref(24)
const pendingCount = ref(12)
const finishedCount = ref(92)

const quickLinks = [
  { title: '报审申请', desc: '新建/查询报审申请', icon: '📝', path: '/pvm/detail' },
  { title: '设计评标查询', desc: '设计评标项目查询', icon: '🔍', path: '/pvm/search' },
  { title: '会议管理', desc: '会议编号/排序/评审结果', icon: '📅', path: '/pvm/meeting' },
  { title: '评审会类型', desc: '评审会类型/审批节点管理', icon: '⚙️', path: '/pvm/manage/type' },
  { title: '申请人配置', desc: '申请人/权限配置', icon: '👥', path: '/pvm/applicant' },
  { title: '供应商评分', desc: '供应商评分/排序', icon: '⭐', path: '/pvm/score' },
]

const recentRecords = ref<PriceVerifMtDetailRow[]>([
  {
    chkNo: 'CHK20260601',
    programName: '主机采购项目',
    rgstOfficeCd: '采购部',
    auditMtDate: '2026-06-10',
    resultStatus: '已通过',
  } as any,
  {
    chkNo: 'CHK20260602',
    programName: '电气设备评标',
    rgstOfficeCd: '技术部',
    auditMtDate: '2026-06-11',
    resultStatus: '审批中',
  } as any,
  {
    chkNo: 'CHK20260603',
    programName: '船体材料技术申请',
    rgstOfficeCd: '生产部',
    auditMtDate: '2026-06-12',
    resultStatus: '待审批',
  } as any,
  {
    chkNo: 'CHK20260604',
    programName: '设计变更备忘',
    rgstOfficeCd: '设计部',
    auditMtDate: '2026-06-13',
    resultStatus: '通过',
  } as any,
])

const statusTagType = (status: string) => {
  if (!status) return 'info'
  const s = status.toLowerCase()
  if (s.includes('通过') || s === 'y' || s.includes('pass') || s.includes('ok')) return 'success'
  if (s.includes('不通过') || s.includes('拒绝') || s.includes('reject') || s.includes('n')) return 'danger'
  if (s.includes('修改') || s.includes('待') || s.includes('pending')) return 'warning'
  return 'primary'
}

const goTo = (path: string) => {
  router.push(path)
}

const fetchStats = async () => {
  loading.value = true
  try {
    const res: any = await getDataGrid({ pageNum: 0, pageSize: 20 })
    const list: any[] = Array.isArray(res) ? res : res?.data?.list || res?.list || res?.data || []
    if (list.length > 0) {
      totalCount.value = res?.data?.total ?? res?.total ?? list.length
      pendingCount.value = list.filter((r: any) => {
        const s = String(r.approvalStatus || r.resultStatus || '').toLowerCase()
        return s.includes('待') || s.includes('pending') || s.includes('审批')
      }).length || pendingCount.value
      finishedCount.value = list.filter((r: any) => {
        const s = String(r.approvalStatus || r.resultStatus || '').toLowerCase()
        return s.includes('通过') || s.includes('pass') || s.includes('已完成') || s === 'y'
      }).length || finishedCount.value
      recentRecords.value = list.slice(0, 8).map((r: any) => ({
        chkNo: r.chkNo || '-',
        programName: r.programName || '-',
        rgstOfficeCd: r.deptDesc || r.rgstOfficeCd || '-',
        auditMtDate: r.auditMtDate || '-',
        resultStatus: r.resultStatusDesc || r.resultStatus || r.approvalStatus || '-',
      }))
    }
  } catch (e: any) {
    ElMessage.warning('统计数据加载失败，使用默认演示数据')
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)
</script>

<template>
  <div class="home">
    <div class="welcome">
      <div>
        <h1>🎉 欢迎使用 PVM 价格验证管理系统</h1>
        <p class="subtitle">评审会申请 · 设计评标 · 会议管理 · 供应商评分 —— 一站式业务管理平台</p>
      </div>
      <div class="welcome-right">
        <el-button type="primary" round @click="goTo('/pvm/detail')">快速新建申请</el-button>
      </div>
    </div>

    <div class="stats">
      <el-card v-loading="loading" shadow="hover" class="stat-card total">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <div class="stat-num">{{ totalCount }}</div>
          <div class="stat-label">总评审会数</div>
        </div>
      </el-card>
      <el-card v-loading="loading" shadow="hover" class="stat-card month">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-num">{{ monthAdd }}</div>
          <div class="stat-label">本月新增</div>
        </div>
      </el-card>
      <el-card v-loading="loading" shadow="hover" class="stat-card pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <div class="stat-num">{{ pendingCount }}</div>
          <div class="stat-label">待审批</div>
        </div>
      </el-card>
      <el-card v-loading="loading" shadow="hover" class="stat-card done">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <div class="stat-num">{{ finishedCount }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </el-card>
    </div>

    <div class="section">
      <h2>🚀 快捷入口</h2>
      <div class="quick-links">
        <el-card
          v-for="link in quickLinks"
          :key="link.title"
          shadow="hover"
          class="link-card"
          @click="goTo(link.path)"
        >
          <div class="link-icon">{{ link.icon }}</div>
          <div class="link-title">{{ link.title }}</div>
          <div class="link-desc">{{ link.desc }}</div>
        </el-card>
      </div>
    </div>

    <div class="section">
      <h2>📋 最近操作记录</h2>
      <el-card shadow="never" class="recent-card">
        <el-table :data="recentRecords" border stripe highlight-current-row style="width: 100%">
          <el-table-column prop="chkNo" label="评审编号" width="160" />
          <el-table-column prop="programName" label="项目名称" />
          <el-table-column prop="rgstOfficeCd" label="申报部门" width="140" />
          <el-table-column prop="auditMtDate" label="日期" width="140" />
          <el-table-column prop="resultStatus" label="状态" width="140">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.resultStatus as string)" effect="light">{{ row.resultStatus }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
}

.welcome {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
  border-radius: 12px;
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.welcome h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.welcome .subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 40px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f5f7fa;
}

.stat-card.total .stat-icon { background: #ecf5ff; }
.stat-card.month .stat-icon { background: #f0f9eb; }
.stat-card.pending .stat-icon { background: #fdf6ec; }
.stat-card.done .stat-icon { background: #f9f0f1; }

.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.section {
  margin-bottom: 24px;
}

.section h2 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #303133;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.link-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.link-card:hover {
  transform: translateY(-4px);
}

.link-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.link-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.link-desc {
  font-size: 12px;
  color: #909399;
}

.recent-card {
  border-radius: 8px;
}

@media (max-width: 1200px) {
  .quick-links { grid-template-columns: repeat(3, 1fr); }
  .stats { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .quick-links { grid-template-columns: repeat(2, 1fr); }
  .welcome { flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>
