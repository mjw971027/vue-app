<!--
  ============================================================
  文件：src/views/Login.vue
  作用：用户登录页面
  ============================================================
-->
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'


import { useAuthStore } from '../stores/auth'
import { isAuthenticated } from '../utils/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const loginFormRef = ref<FormInstance>()
const loginForm = reactive({ username: '', password: '' })
const loginRules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})
const loading = ref(false)

/** 处理登录 */
const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (!valid) return

    try {
      loading.value = true
      await auth.login({
        username: loginForm.username,
        password: loginForm.password,
      })
      ElMessage.success('登录成功')

      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } catch (err: unknown) {
      let message = '登录失败，请重试'
      if (err instanceof Error) message = err.message
      ElMessage.error(message)
    } finally {
      loading.value = false
    }
  })
}

// 已登录则跳转
if (isAuthenticated()) {
  const redirect = (route.query.redirect as string) || '/'
  router.push(redirect)
}
</script>

<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <div class="login-header">
        <el-icon :size="48" color="#6366f1"><Lock /></el-icon>
        <h1>用户登录</h1>
        <p>欢迎回来，请登录您的账户</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        size="large"
        @keyup.enter="handleLogin(loginFormRef)"
      >
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" :prefix-icon="Key" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" :loading="loading" @click="handleLogin(loginFormRef)">
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

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

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
