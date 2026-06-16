# WKB 工装管理系统 - API 接口文档

## 基础信息

| 项目 | 值 |
|------|------|
| 前缀 | `/api` |
| 认证 | JWT Bearer Token |
| 响应 | `{ code, message, data }` |

---

## 🔐 认证模块

| API | 方法 | 认证 | 请求体 | 响应体 |
|-----|------|------|--------|--------|
| `/auth/login` | POST | 否 | `{ username, password }` | `{ token, tokenType, expiresIn }` |
| `/auth/logout` | POST | 是 | - | - |
| `/auth/me` | GET | 是 | - | `{ id, username, email, role, status }` |
| `/auth/refresh` | POST | 是 | `{ refreshToken }` | `{ token, tokenType, expiresIn }` |
| `/auth/change-password` | POST | 是 | `{ oldPassword, newPassword }` | - |

---

## 👤 用户模块

| API | 方法 | 认证 | 请求体 | 响应体 |
|-----|------|------|--------|--------|
| `/user/info` | GET | 是 | - | `{ id, username, email, role, status }` |

---

## 👥 用户管理（ADMIN）

| API | 方法 | 认证 | 请求体 | 响应体 |
|-----|------|------|--------|--------|
| `/user/list` | GET | 是(ADMIN) | - | `UserManageItem[]` |
| `/user/register` | POST | 否 | `{ username, password, email, role? }` | `UserManageItem` |
| `/user/{id}` | PUT | 是(ADMIN) | `{ username?, email?, role?, status? }` | `UserManageItem` |
| `/user/{id}` | DELETE | 是(ADMIN) | - | - |
| `/user/permissions` | GET | 是 | - | `string[]` |
| `/user/permissions/{userId}` | GET | 是(ADMIN) | - | `string[]` |
| `/user/permissions/{userId}` | PUT | 是(ADMIN) | `{ permissions: string[] }` | - |

---

## ⚙️ 系统设置

| API | 方法 | 认证 | 请求体 | 响应体 |
|-----|------|------|--------|--------|
| `/settings/list` | GET | 是 | - | `SettingItem[]` |
| `/settings/toggle/{id}` | PUT | 是 | - | - |
| `/settings/system-info` | GET | 是 | - | `{ version, lastUpdate }` |

---

## 📊 统计数据

| API | 方法 | 认证 | 请求体 | 响应体 |
|-----|------|------|--------|--------|
| `/stats/monthly` | GET | 是 | - | `MonthlyStats[]` |
| `/stats/summary` | GET | 是 | - | `{ totalSales, totalOrders, totalCustomers, averageGrowthRate, todaySales }` |

---

## 类型定义

### ApiResponse
```typescript
interface ApiResponse<T> {
  code: number      // 200=成功
  message: string   // 提示信息
  data: T           // 数据
}
```

### UserManageItem
```typescript
{ id, username, email, role, status, createTime? }
```

### SettingItem
```typescript
{ id, name, enabled }
```

### MonthlyStats
```typescript
{ month, sales }
```

---

## 错误码

| 码 | 含义 |
|----|------|
| 200 | 成功 |
| 401 | 未认证 |
| 403 | 无权限 |
| 500 | 服务器错误 |

---

**生成时间**：2026-06-12  
**依据**：`src/api/*.ts`