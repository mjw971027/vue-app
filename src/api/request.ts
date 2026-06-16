/**
 * ============================================================
 * 文件：src/api/request.ts
 * 作用：axios 实例封装（Session Cookie 认证 + 统一错误处理）
 * ============================================================
 */
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import router from '../router'

// 创建 axios 实例，使用环境变量中的 API 地址
// withCredentials: true 使 axios 自动携带 Session Cookie
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * 请求拦截器：Session 认证下无需手动注入 Token
 * 浏览器会自动携带 Cookie
 */
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Session 认证：浏览器自动携带 Cookie，无需手动注入 Token
    return config
  },
  (error) => Promise.reject(error),
)

/**
 * 响应拦截器：统一错误处理。
 *
 * mo 后端直接返回业务数据，不需要解包 ApiResponse。
 * Session 认证下 401/403 直接跳转登录页。
 */
service.interceptors.response.use(
  // 成功响应：直接返回 response.data（mo 后端直接返回业务数据）
  (response: AxiosResponse) => response.data,

  async (error) => {
    const status = error.response?.status

    // ===== 401：Session 过期或未登录 =====
    if (status === 401) {
      const { ElMessage } = await import('element-plus')
      ElMessage.error('登录已过期，请重新登录')

      // 避免在登录页重复跳转
      const currentPath = router.currentRoute.value.path
      if (currentPath !== '/login') {
        router.push('/login')
      }

      return Promise.reject(error)
    }

    // ===== 403：无权限 =====
    if (status === 403) {
      const { ElMessage } = await import('element-plus')
      ElMessage.error('权限不足')

      const currentPath = router.currentRoute.value.path
      if (currentPath !== '/login') {
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
 *
 * 注意：mo 后端直接返回业务数据，不是 ApiResponse 包装格式，
 * 所以泛型 T 直接作为返回类型。
 */

export function get<T>(url: string, params?: unknown) {
  return service.get<unknown, T>(url, {
    params: params as Record<string, unknown> | undefined,
  })
}

export function post<T>(url: string, data?: unknown, config?: unknown) {
  return service.post<unknown, T>(url, data as Record<string, unknown> | undefined, config)
}

export function put<T>(url: string, data?: unknown) {
  return service.put<unknown, T>(url, data as Record<string, unknown> | undefined)
}

export function del<T>(url: string) {
  return service.delete<unknown, T>(url)
}

export default service
