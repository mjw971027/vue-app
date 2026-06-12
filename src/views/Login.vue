<!--
  ============================================================
  文件：src/views/Login.vue
  作用：用户登录页面
  路由：/login
  说明：
    - 使用 Element Plus 的 el-form、el-input、el-button 组件
    - 调用后端登录接口获取 JWT Token
    - 登录成功后跳转到首页
  ============================================================
-->

<!-- ========== 脚本区 ========== -->
<script setup lang="ts">
/* eslint-disable no-undef */
// ref() 创建响应式变量
import { ref, reactive } from 'vue'
// useRouter() 获取路由实例，用于页面跳转
import { useRouter, useRoute } from 'vue-router'
// 导入登录 API 函数
import { login } from '../api/auth'
// 导入 Token 管理工具
import { isAuthenticated, refreshPermissions } from '../utils/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
// 导入图标组件
import { User, Key } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

/**
 * 表单引用
 */
const loginFormRef = ref<FormInstance>()

/**
 * 表单数据
 */
const loginForm = reactive({
  username: '',
  password: ''
})

/**
 * 表单验证规则
 */
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})

/**
 * 加载状态
 */
const loading = ref(false)

/**
 * 处理登录
 */
const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        // 调用登录 API
        const response = await login({
          username: loginForm.username,
          password: loginForm.password
        })

        // 登录成功
        ElMessage.success('登录成功')
        window.console.log('登录成功', response.data)

        // 刷新页面权限
        await refreshPermissions()

        // 跳转到首页或重定向页面
        const redirect = route.query.redirect as string || '/'
        router.push(redirect)

      } catch (err: unknown) {
        // 登录失败，显示错误信息
        let message = '登录失败，请重试'
        if (err instanceof Error) {
          message = err.message
        }
        ElMessage.error(message)
      } finally {
        loading.value = false
      }
    }
  })
}

/**
 * 检查是否已经登录
 * 如果已经登录，直接跳转到首页
 */
if (isAuthenticated()) {
  const redirect = route.query.redirect as string || '/'
  router.push(redirect)
}
</script>

<!-- ========== 模板区 ========== -->
<template>
  <div class="login-container">
    <!-- 登录卡片 -->
    <el-card class="login-card" shadow="always">
      <!-- Logo / 标题 -->
      <div class="login-header">
        <el-icon :size="48" color="#6366f1"><Lock /></el-icon>
        <h1>用户登录</h1>
        <p>欢迎回来，请登录您的账户</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        size="large"
        @keyup.enter="handleLogin(loginFormRef)"
      >
        <!-- 用户名输入框 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
          />
        </el-form-item>

        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Key"
            show-password
          />
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin(loginFormRef)"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        没有账号？
        <el-button link type="primary" @click="router.push('/register')">立即注册</el-button>
      </div>
    </el-card>
  </div>
</template>

<!-- ========== 样式区（scoped） ========== -->
<style scoped>
/* 页面容器：全屏居中 */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

/* 登录卡片 */
.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* 标题区域 */
.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 28px;
  color: #18191c;
  margin: 16px 0 8px;
}

.login-header p {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* 表单项 */
.el-form-item {
  margin-bottom: 20px;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #888;
}
</style>
