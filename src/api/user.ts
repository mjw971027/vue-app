/**
 * ============================================================
 * 文件：src/api/user.ts
 * 作用：用户相关 API 接口（对应 Page1）
 * 后端 Controller 参考路径：com.example.controller.UserController
 * ============================================================
 */

import type { UserInfo } from './types'
import { get } from './request'

/**
 * 获取用户信息
 * GET /api/user/info
 *
 * 后端 Controller 示例（Spring Boot）：
 * ```
 * @RestController
 * @RequestMapping("/api/user")
 * public class UserController {
 *     @GetMapping("/info")
 *     public ApiResponse<UserInfo> getUserInfo() {
 *         UserInfo user = userService.getCurrentUser();
 *         return ApiResponse.success(user);
 *     }
 * }
 * ```
 */
export function getUserInfo() {
  return get<UserInfo>('/user/info')
}
