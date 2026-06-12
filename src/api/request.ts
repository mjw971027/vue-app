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
 * 响应拦截器：Token 刷新 + 统一错误处理
 * 注意：拦截器将 AxiosResponse 转换为其 .data 字段，需要用 as any 绕开 axios 严格泛型
 */
service.interceptors.response.use(
  ((response: AxiosResponse<ApiResponse<unknown>>) => response.data) as any,

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
            authStore.refreshToken(
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

    // ===== 403：无权限 =====
    if (status === 403) {
      const { ElMessage } = await import('element-plus')
      ElMessage.error('无权限访问该资源')
    }

    // ===== 其他错误 =====
    const message =
      error.response?.data?.message || error.message || '网络异常'
    console.error(`[API Error ${status || ''}] ${message}`)
    return Promise.reject(error)
  },
)

// ===== 封装常用 HTTP 方法 =====
export function get<T>(url: string, params?: Record<string, unknown>) {
  return service.get<any, ApiResponse<T>>(url, { params })
}

export function post<T>(url: string, data?: Record<string, unknown>) {
  return service.post<any, ApiResponse<T>>(url, data)
}

export function put<T>(url: string, data?: Record<string, unknown>) {
  return service.put<any, ApiResponse<T>>(url, data)
}

export function del<T>(url: string) {
  return service.delete<any, ApiResponse<T>>(url)
}

export default service
