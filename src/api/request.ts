/**
 * ============================================================
 * 文件：src/api/request.ts
 * 作用：axios 实例封装（统一配置请求/响应拦截器）
 * 说明：
 *   - 所有 API 调用都通过这个封装后的 axios 实例发出
 *   - 自动注入 JWT Token 到请求头
 *   - 统一处理 401 错误（自动刷新 Token 或跳转登录页）
 * ============================================================
 */

import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from './types'
import { getToken, getAuthHeader, removeToken } from '../utils/auth'
import router from '../router'

/**
 * 创建 axios 实例
 * baseURL — 后端服务地址
 *   你的后端端口是 8081
 */
const request: AxiosInstance = axios.create({
  // 使用相对路径，通过 Vite 代理转发到后端，解决开发环境 CORS 问题
  // Vite 代理配置在 vite.config.ts 中的 server.proxy
  baseURL: '/api',
  timeout: 10000,   // 请求超时 10 秒
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 是否正在刷新 Token 的标记
 * 防止多个请求同时触发刷新 Token
 */
let isRefreshing = false

/**
 * 等待 Token 刷新完成的请求队列
 * 刷新 Token 期间，其他请求先进入队列等待
 */
let requestsQueue: Array<(token: string) => void> = []

/**
 * 请求拦截器
 * 每次发出请求前自动执行
 * 作用：注入 JWT Token 到 Authorization 请求头
 */
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 Token
    const token = getToken()

    // 如果 Token 存在，注入到请求头
    if (token) {
      // 设置 Authorization 请求头
      // 格式：Bearer eyJhbGciOiJIUzI1NiJ9...
      const authHeader = getAuthHeader()
      if (authHeader) {
        config.headers.set('Authorization', authHeader)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 每次收到响应后自动执行
 * 作用：统一错误处理、Token 过期自动处理
 */
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // 返回 response.data（即 ApiResponse 对象：{ code, message, data }）
    return response.data
  },
  async (error) => {
    // 获取错误响应的状态码
    const status = error.response?.status
    const originalRequest = error.config

    // ===== 情况 1：401 Unauthorized（Token 过期或无效）=====
    if (status === 401 && !originalRequest._isRetry) {
      // 标记这个请求已经重试过，防止无限循环
      originalRequest._isRetry = true

      // 如果正在刷新 Token，把当前请求加入队列等待
      if (isRefreshing) {
        return new Promise((resolve) => {
          requestsQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(request(originalRequest))
          })
        })
      }

      // 设置正在刷新 Token 标记
      isRefreshing = true

      try {
        // 尝试刷新 Token（需要你后端实现 /api/auth/refresh 接口）
        // 如果后端没有刷新 Token 接口，直接跳转登录页
        // const response = await refreshToken()
        // const newToken = response.data.token
        // requestsQueue.forEach((callback) => callback(newToken))
        // requestsQueue = []
        // originalRequest.headers.Authorization = `Bearer ${newToken}`
        // return request(originalRequest)

        // 暂时不实现自动刷新，直接清除 Token 并跳转登录页
        removeToken()
        router.push('/login')
        return Promise.reject(error)

      } catch (refreshError) {
        // 刷新 Token 失败
        removeToken()
        router.push('/login')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // ===== 情况 2：403 Forbidden（无权限）=====
    if (status === 403) {
      console.error('无权限访问该资源')
    }

    // ===== 情况 3：其他错误 =====
    const message = error.response?.data?.message || error.message || '网络异常'
    console.error('[API Error]', message)

    return Promise.reject(error)
  }
)

/**
 * 封装常用 HTTP 方法（带类型支持）
 * 使用泛型 <T> 让返回值自动推断类型
 */

/** GET 请求 */
export function get<T>(url: string, params?: Record<string, unknown>) {
  return request.get<any, ApiResponse<T>>(url, { params })
}

/** POST 请求（JSON body） */
export function post<T>(url: string, data?: Record<string, unknown>) {
  return request.post<any, ApiResponse<T>>(url, data)
}

/** PUT 请求（更新资源） */
export function put<T>(url: string, data?: Record<string, unknown>) {
  return request.put<any, ApiResponse<T>>(url, data)
}

/** DELETE 请求 */
export function del<T>(url: string) {
  return request.delete<any, ApiResponse<T>>(url)
}

export default request
