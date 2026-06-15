---
name: vue-project-gap-analysis
overview: 对WKB工装管理系统Vue项目进行全面的生产就绪差距分析，识别出关键缺陷、功能缺失和代码质量问题
todos:
  - id: fix-security-types
    content: 修复JWT类型安全：定义JwtPayload接口，消除auth.ts/request.ts中所有any
    status: pending
  - id: fix-api-types
    content: 修复api/components.ts类型强转，post函数签名支持灵活参数
    status: pending
    dependencies:
      - fix-security-types
  - id: optimize-auth-cache
    content: 优化权限缓存：refreshAuth仅首次和Token刷新后请求权限
    status: pending
    dependencies:
      - fix-security-types
  - id: add-form-validation
    content: ComponentsCreate添加el-form rules表单验证
    status: pending
  - id: rebuild-home-page
    content: 首页Home.vue改造：统计卡片+快捷操作+最近审批
    status: pending
  - id: add-error-pages
    content: 新增404/403错误页面及路由配置
    status: pending
  - id: business-pages
    content: Page1/2/3业务化改造（引入ECharts图表库）
    status: pending
    dependencies:
      - rebuild-home-page
  - id: add-password-export
    content: 新增修改密码功能+Excel导出工具+Page4导出按钮
    status: pending
  - id: layout-enhancement
    content: App.vue布局增强：面包屑+标签页导航+通知铃铛
    status: pending
  - id: docker-deploy
    content: 新增前端Dockerfile+Nginx配置+docker-compose编排
    status: pending
---

## 产品概述

WKB 工装管理系统 — 从"可运行的 Demo"升级为"生产可用系统"的差距分析与补全方案

## 核心功能

对现有 Vue 3 项目进行全方位生产化改造，覆盖：安全加固、代码质量修复、缺失页面实现、基础设施补全、用户体验提升、业务功能完善六大维度，使项目达到可上线标准

## 差距总览（按严重程度排序）

1. **安全漏洞**：Token 明文存 localStorage、JWT 解析返回 any、无 XSS/CSRF 防护
2. **类型安全缺失**：request.ts 用 as any 绕类型、components.ts 大量 as unknown as 强转
3. **关键页面空白**：首页仅一行文字、Page1/2/3 为 Demo 页、无 404/403 页
4. **表单验证缺失**：ComponentsCreate 无 el-form rules、数字字段无校验
5. **业务功能未完成**：流程追踪 TODO、修改密码无入口、无 Excel 导出、无操作日志
6. **基础设施缺失**：零测试、无 CI/CD、无错误监控
7. **用户体验不足**：无面包屑/标签页、无消息通知、无暗色模式、无响应式适配
8. **性能问题**：refreshAuth 每次路由切换都异步请求、无请求缓存/防抖

## 技术栈

- 框架：Vue 3.5 + TypeScript 6 + Vite 8
- UI 库：Element Plus 2.14
- 状态管理：Pinia 3
- 路由：Vue Router 5
- HTTP：Axios 1.17
- 样式：SCSS
- 现有工具链：ESLint + Prettier

## 实施方案

### 第一优先级：安全与类型安全（阻塞性问题）

**1. JWT Token 安全加固**

- 当前：Token 明文存 localStorage，XSS 攻击即可窃取
- 方案：Token 仍存 localStorage（SPA 标准做法），但增加以下防护：
- 添加 `httpOnly` Cookie 存储 refreshToken（需后端配合设置 `Set-Cookie`）
- accessToken 存 localStorage + 设置短期过期（如 15 分钟）
- 在 `vite.config.ts` 中配置 CSP 头部
- 添加 XSS 防护：对 `parseJwtPayload` 添加输入校验，限制 Token 长度

**2. TypeScript 类型安全修复**

- `utils/auth.ts`：定义 `JwtPayload` 接口替代 `any` 返回值
- `api/request.ts`：消除 `as any` 绕过，正确处理响应拦截器泛型
- `api/components.ts`：将 `as unknown as Record<string, unknown>` 改为在 `post` 函数签名中支持泛型参数

**3. 路由守卫性能优化**

- 当前：`refreshAuth()` 每次路由切换都异步调用 `fetchPermissions()`
- 方案：仅在首次进入和 Token 刷新后请求权限，之后使用缓存

### 第二优先级：核心页面实现

**4. 首页（Home.vue）改造**

- 工装申请统计卡片（待审批/进行中/本月新增/已完成）
- 最近审批记录列表
- 快捷操作入口
- 调用现有 API 获取数据

**5. Page1/2/3 业务化**

- Page1 → 重新定义为真实业务页（如"工装台账查询"）或删除
- Page2 → 引入 ECharts 图表库，实现工装数据可视化分析
- Page3 → 改造为"系统设置"业务页（通知设置、审批规则配置等）

**6. 错误页面**

- 新增 `views/404.vue`、`views/403.vue`
- 路由配置中添加对应匹配规则

### 第三优先级：业务功能补全

**7. ComponentsCreate 表单验证**

- 为必填字段添加 `el-form` rules（工装类别、需求数、需求日期、项目名称）
- 数字字段校验（需求数 > 0、预估金额 >= 0）
- 保存前统一 validate

**8. 修改密码功能**

- 新增 `views/ChangePassword.vue` 或在用户下拉菜单中添加弹窗
- 调用已封装的 `changePassword` API

**9. 流程追踪实现**

- 实现 `handleShowBpm` — 新窗口打开或弹窗展示审批流程图
- 对接后端流程 API

**10. Excel 导出**

- 封装通用导出工具 `utils/export.ts`
- Page4 列表页添加"导出"按钮

### 第四优先级：用户体验与基础设施

**11. 布局组件增强**

- 面包屑导航（基于路由 meta 自动生成）
- 标签页导航（多页面切换保持状态）
- 消息通知铃铛（右上角）

**12. 响应式适配**

- 侧边栏折叠为汉堡菜单（< 768px）
- 表格横向滚动优化
- 搜索栏垂直排列适配

**13. 前端测试**

- 安装 Vitest + @vue/test-utils
- 核心工具函数单元测试（auth.ts、format.ts）
- 关键组件测试（Login、Page4）

## 实施注意事项

- 所有改造均基于现有架构，不引入新框架
- API 接口格式保持 `{ data: JSON.stringify(...) }` 不变（后端已固定）
- 分阶段实施，每阶段独立可发布
- 修改 package.json name 和 version 为正式值

## 目录结构（新增/修改文件）

```
src/
├── views/
│   ├── Home.vue              # [MODIFY] 首页改造：统计卡片+快捷入口+最近记录
│   ├── Page1.vue             # [MODIFY] 业务化改造或替换为工装台账查询
│   ├── Page2.vue             # [MODIFY] 引入ECharts实现数据可视化
│   ├── Page3.vue             # [MODIFY] 系统设置业务化
│   ├── 404.vue               # [NEW] 404页面未找到
│   ├── 403.vue               # [NEW] 403无权限页面
│   └── ChangePassword.vue   # [NEW] 修改密码弹窗/页面
├── components/
│   ├── Breadcrumb.vue        # [NEW] 面包屑导航组件
│   ├── TabsNav.vue           # [NEW] 标签页导航组件
│   └── NotificationBell.vue  # [NEW] 消息通知组件
├── api/
│   ├── request.ts            # [MODIFY] 消除as any，修复泛型
│   └── components.ts         # [MODIFY] 消除as unknown as强转
├── utils/
│   ├── auth.ts               # [MODIFY] JwtPayload接口+权限缓存优化
│   ├── format.ts             # [MODIFY] 补充金额格式化、数字千分位
│   └── export.ts             # [NEW] Excel导出工具
├── router/
│   └── index.ts              # [MODIFY] 添加404/403路由+权限缓存逻辑
├── stores/
│   └── auth.ts               # [MODIFY] 权限缓存策略优化
├── styles/
│   └── main.scss             # [MODIFY] 响应式断点+暗色模式变量
├── App.vue                   # [MODIFY] 布局增强(面包屑/标签页/通知)
package.json                  # [MODIFY] name/version正式化+添加echarts/vitest
```

## SubAgent

- **code-explorer**: 用于在实施阶段深入探查特定文件的依赖关系和调用链，确保修改不会引入回归问题。用于验证 API 类型修改的影响范围、路由配置的完整性等。