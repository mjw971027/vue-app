/**
 * ============================================================
 * 文件：src/api/request.ts
 * 作用：axios 实例封装（Token 自动刷新 + 统一错误处理）
 * ============================================================
 */
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import type { ApiResponse } from './types'
import { getToken, getAuthHeader, removeToken } from '../utils/auth'
import { refreshToken as refreshTokenApi } from './auth'
import router from '../router'
import pinia from '../stores'
import { useAuthStore } from '../stores/auth'

// 创建 axios 实例，使用环境变量中的 API 地址
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ===== Token 刷新队列 =====
let isRefreshing = false
let requestsQueue: Array<(token: string) => void> = []

/**
 * 处理队列中的请求
 */
function processQueue(token: string) {
  requestsQueue.forEach((callback) => callback(token))
  requestsQueue = []
}

/**
 * 请求拦截器：自动注入 Authorization 头
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token) {
      const authHeader = getAuthHeader()
      if (authHeader) {
        config.headers.set('Authorization', authHeader)
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

/**
 * 响应拦截器：Token 刷新 + 统一错误处理。
 *
 * 将 AxiosResponse 解包为 response.data，使 get/post 等方法
 * 直接返回 ApiResponse<T> 而非 AxiosResponse。
 *
 * 注意：TypeScript 的 axios 拦截器类型要求 onFulfilled 返回 V，
 * 但我们实际返回的是 stringify 后的 data，属于合法运行时转换，
 * 用 as never 绕过类型检查，返回值通过 get/post 的泛型 R 确保类型安全。
 */
function onResponseFulfilled(response: AxiosResponse<ApiResponse<unknown>>) {
  return response.data
}

service.interceptors.response.use(
  onResponseFulfilled as never,

  async (error) => {
    const status = error.response?.status
    const originalRequest = error.config

    // ===== 401：Token 过期，尝试刷新 =====
    if (status === 401 && !originalRequest._isRetry) {
      originalRequest._isRetry = true

      if (isRefreshing) {
        // 正在刷新中，加入等待队列
        return new Promise((resolve) => {
          requestsQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(service(originalRequest))
          })
        })
      }

      isRefreshing = true

      try {
        const authStore = useAuthStore(pinia)
        const refreshTok = authStore.getStoredRefreshToken()

        if (refreshTok) {
          const res = await refreshTokenApi(refreshTok)
          const newToken = res.data?.token || res.data?.accessToken
          if (newToken) {
            await authStore.refreshToken(
              newToken,
              res.data?.tokenType || 'Bearer',
              res.data?.expiresIn || 86400,
            )
            processQueue(newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return service(originalRequest)
          }
        }

        // 无法刷新，清除状态并跳登录
        removeToken()
        router.push('/login')
        return Promise.reject(error)
      } catch {
        removeToken()
        router.push('/login')
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    // ===== 403：无权限（Token 无效/过期 或 角色权限不足）=====
    if (status === 403) {
      const { ElMessage } = await import('element-plus')
      ElMessage.error('身份验证失败，请重新登录')

      // 清除本地 Token
      removeToken()

      // 避免在登录页/注册页重复跳转
      const currentPath = router.currentRoute.value.path
      if (currentPath !== '/login' && currentPath !== '/register') {
        router.push('/login')
      }

      return Promise.reject(error)
    }

    // ===== 其他错误 =====
    const message =
      error.response?.data?.message || error.message || '网络异常'
    console.error(`[API Error ${status || ''}] ${message}`)
    return Promise.reject(error)
  },
)

// ===== 封装常用 HTTP 方法 =====
/**
 * 参数类型设计说明：
 * params/data 使用 unknown 而非 Record<string, unknown>，
 * 这样调用方（如 components.ts）可以直接传递任意对象字面量，
 * 无需在每一处调用时做 as unknown as Record<string, unknown> 强转。
 * 内部只做一次集中的类型断言传给 axios。
 */

export function get<T>(url: string, params?: unknown) {
  return service.get<unknown, ApiResponse<T>>(url, {
    params: params as Record<string, unknown> | undefined,
  })
}

export function post<T>(url: string, data?: unknown) {
  return service.post<unknown, ApiResponse<T>>(url, data as Record<string, unknown> | undefined)
}

export function put<T>(url: string, data?: unknown) {
  return service.put<unknown, ApiResponse<T>>(url, data as Record<string, unknown> | undefined)
}

export function del<T>(url: string) {
  return service.delete<unknown, ApiResponse<T>>(url)
}

export default service
