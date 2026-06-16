/**
 * ============================================================
 * 文件：src/api/request.ts
 * 作用：axios 实例封装（Session 模式 - 自动携带 Cookie）
 * 说明：
 *   - withCredentials: true  → 浏览器自动携带后端 Session Cookie
 *   - 无需手动注入 Authorization header
 *   - 401：未登录 / Session 过期 → 跳转登录页
 * ============================================================
 */
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import type { ApiResponse } from './types'
import router from '../router'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  withCredentials: true,            // Session 核心：自动携带 Cookie
  headers: { 'Content-Type': 'application/json' },
})

/**
 * 请求拦截器：Session 模式下无需注入 Token，Cookie 自动携带
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error) => Promise.reject(error),
)

/**
 * 响应拦截器：统一错误处理 + 401 跳登录
 */
service.interceptors.response.use(
  ((response: AxiosResponse<ApiResponse<unknown>>) => response.data) as any,

  async (error) => {
    const status = error.response?.status

    // ===== 401：未登录 / Session 已过期 =====
    if (status === 401) {
      const { clearAuth } = await import('../utils/auth')
      clearAuth()
      router.push('/login')
      return Promise.reject(error)
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
