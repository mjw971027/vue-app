# WKB 工装管理系统 - API 接口文档

## 📋 文档说明

| 项目 | 内容 |
|------|------|
| **API 前缀** | `/api` |
| **认证方式** | JWT Token（Bearer） |
| **响应格式** | `{ code, message, data }` |
| **生成依据** | `src/api/*.ts` 前端 API 封装文件 |

---

## 🔐 认证模块（Auth）

### 1. 用户登录

| 属性 | 值 |
|------|------|
| **路径** | `/auth/login` |
| **方法** | `POST` |
| **认证** | 无需 |

**请求体：**
```json
{
  "username": "string (必填，用户名)",
  "password": "string (必填，密码)"
}
```

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "string (JWT Token)",
    "tokenType": "string (默认 Bearer)",
    "expiresIn": "number (过期时间，秒)"
  }
}
```

---

### 2. 退出登录

| 属性 | 值 |
|------|------|
| **路径** | `/auth/logout` |
| **方法** | `POST` |
| **认证** | 需要 |

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

---

### 3. 获取当前用户信息

| 属性 | 值 |
|------|------|
| **路径** | `/auth/me` |
| **方法** | `GET` |
| **认证** | 需要 |

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "number",
    "username": "string",
    "email": "string",
    "role": "string",
    "status": "在线 | 离线"
  }
}
```

---

### 4. 刷新 Token

| 属性 | 值 |
|------|------|
| **路径** | `/auth/refresh` |
| **方法** | `POST` |
| **认证** | 需要 |

**请求体：**
```json
{
  "refreshToken": "string (必填，刷新 Token)"
}
```

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "string (新的 accessToken)",
    "tokenType": "string",
    "expiresIn": "number"
  }
}
```

---

### 5. 修改密码

| 属性 | 值 |
|------|------|
| **路径** | `/auth/change-password` |
| **方法** | `POST` |
| **认证** | 需要 |

**请求体：**
```json
{
  "oldPassword": "string (必填，旧密码)",
  "newPassword": "string (必填，新密码)"
}
```

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

---

## 👤 用户模块（User）

### 1. 获取用户信息

| 属性 | 值 |
|------|------|
| **路径** | `/user/info` |
| **方法** | `GET` |
| **认证** | 需要 |

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "number",
    "username": "string",
    "email": "string",
    "role": "string (如：管理员)",
    "status": "在线 | 离线"
  }
}
```

---

## 👥 用户管理模块（User Management）

### 1. 获取用户列表

| 属性 | 值 |
|------|------|
| **路径** | `/user/list` |
| **方法** | `GET` |
| **认证** | 需要 |
| **权限** | ADMIN |

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "number",
      "username": "string",
      "email": "string",
      "role": "string",
      "status": "string",
      "createTime": "string (可选，创建时间)"
    }
  ]
}
```

---

### 2. 用户注册

| 属性 | 值 |
|------|------|
| **路径** | `/user/register` |
| **方法** | `POST` |
| **认证** | 无需 |

**请求体：**
```json
{
  "username": "string (必填，用户名)",
  "password": "string (必填，密码)",
  "email": "string (必填，邮箱)",
  "role": "string (可选，角色)"
}
```

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": "number",
    "username": "string",
    "email": "string",
    "role": "string",
    "status": "string"
  }
}
```

---

### 3. 更新用户信息

| 属性 | 值 |
|------|------|
| **路径** | `/user/{id}` |
| **方法** | `PUT` |
| **认证** | 需要 |
| **权限** | ADMIN |

**路径参数：**
- `id`: 用户ID（number）

**请求体（部分字段更新）：**
```json
{
  "username": "string (可选)",
  "email": "string (可选)",
  "role": "string (可选)",
  "status": "string (可选)"
}
```

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": "number",
    "username": "string",
    "email": "string",
    "role": "string",
    "status": "string"
  }
}
```

---

### 4. 删除用户

| 属性 | 值 |
|------|------|
| **路径** | `/user/{id}` |
| **方法** | `DELETE` |
| **认证** | 需要 |
| **权限** | ADMIN |

**路径参数：**
- `id`: 用户ID（number）

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 5. 获取当前用户页面权限

| 属性 | 值 |
|------|------|
| **路径** | `/user/permissions` |
| **方法** | `GET` |
| **认证** | 需要 |

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": ["page1", "page2", "page3", "page4"]
}
```

---

### 6. 获取指定用户页面权限

| 属性 | 值 |
|------|------|
| **路径** | `/user/permissions/{userId}` |
| **方法** | `GET` |
| **认证** | 需要 |
| **权限** | ADMIN |

**路径参数：**
- `userId`: 用户ID（number）

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": ["page1", "page2"]
}
```

---

### 7. 设置用户页面权限

| 属性 | 值 |
|------|------|
| **路径** | `/user/permissions/{userId}` |
| **方法** | `PUT` |
| **认证** | 需要 |
| **权限** | ADMIN |

**路径参数：**
- `userId`: 用户ID（number）

**请求体：**
```json
{
  "permissions": ["string[] (页面权限列表，如：page1, page2)"]
}
```

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "权限设置成功",
  "data": null
}
```

---

## ⚙️ 系统设置模块（Settings）

### 1. 获取所有设置项

| 属性 | 值 |
|------|------|
| **路径** | `/settings/list` |
| **方法** | `GET` |
| **认证** | 需要 |

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "number",
      "name": "string (设置名称，如：深色模式)",
      "enabled": "boolean (是否开启)"
    }
  ]
}
```

---

### 2. 切换设置项开关状态

| 属性 | 值 |
|------|------|
| **路径** | `/settings/toggle/{id}` |
| **方法** | `PUT` |
| **认证** | 需要 |

**路径参数：**
- `id`: 设置项ID（number）

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": null
}
```

---

### 3. 获取系统版本信息

| 属性 | 值 |
|------|------|
| **路径** | `/settings/system-info` |
| **方法** | `GET` |
| **认证** | 需要 |

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "version": "string (版本号，如：v2.1.0)",
    "lastUpdate": "string (最后更新日期，如：2026-06-02)"
  }
}
```

---

## 📊 统计数据模块（Stats）

### 1. 获取月度统计数据

| 属性 | 值 |
|------|------|
| **路径** | `/stats/monthly` |
| **方法** | `GET` |
| **认证** | 需要 |

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "month": "string (月份，如：1月)",
      "sales": "number (销售额)"
    }
  ]
}
```

---

### 2. 获取统计摘要

| 属性 | 值 |
|------|------|
| **路径** | `/stats/summary` |
| **方法** | `GET` |
| **认证** | 需要 |

**成功响应（200）：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalSales": "number (总销售额)",
    "totalOrders": "number (总订单数)",
    "totalCustomers": "number (总客户数)",
    "averageGrowthRate": "number (平均增长率)",
    "todaySales": "number (今日销售额)"
  }
}
```

---

## 📦 通用类型定义

### ApiResponse（统一响应格式）

```typescript
interface ApiResponse<T> {
  code: number      // 状态码：200=成功，其他=失败
  message: string   // 提示信息
  data: T           // 实际数据（泛型）
}
```

### 错误码说明

| 错误码 | 含义 |
|--------|------|
| `200` | 成功 |
| `401` | 未认证（Token 无效或过期） |
| `403` | 无权限 |
| `500` | 服务器内部错误 |

---

**文档生成时间**：2026-06-12  
**生成依据**：`src/api/auth.ts`、`src/api/user.ts`、`src/api/userManage.ts`、`src/api/settings.ts`、`src/api/stats.ts`、`src/api/types.ts`