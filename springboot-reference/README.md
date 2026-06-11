# Spring Boot 后端对接说明

## 项目结构对照

```
前端（my-vue-app/src/）           后端（Spring Boot/）
─────────────────────────          ─────────────────────────────
api/types.ts                      entity/  （实体类）
api/request.ts                    —（axios 封装，后端无需对应）
api/user.ts                       controller/UserController.java
api/stats.ts                      controller/StatsController.java
api/settings.ts                   controller/SettingsController.java
views/Page1.vue                  service/UserService.java
views/Page2.vue                  service/StatsService.java
views/Page3.vue                  service/SettingsService.java
```

---

## 一、后端项目创建

### 1. 用 Spring Initializr 创建项目

访问 https://start.spring.io，选择：

- **Project**：Maven
- **Language**：Java
- **Spring Boot**：3.x（推荐）
- **Group**：`com.example`
- **Artifact**：`my-backend`
- **Name**：`my-backend`
- **Dependencies** 添加：
  - Spring Web（必选）
  - Spring Data JPA（操作数据库，可选）
  - MySQL Driver / H2 Database（数据库驱动）

下载解压后导入 IDE（IntelliJ IDEA 推荐）。

---

## 二、后端目录结构

```
src/main/java/com/example/
├── controller/
│   ├── UserController.java
│   ├── StatsController.java
│   └── SettingsController.java
├── entity/
│   ├── UserInfo.java
│   ├── MonthlyStats.java
│   ├── StatsSummary.java
│   ├── SettingItem.java
│   └── SystemInfo.java
├── service/
│   ├── UserService.java
│   ├── StatsService.java
│   └── SettingsService.java
├── common/
│   └── ApiResponse.java        ← 统一响应封装
└── MyBackendApplication.java   ← 启动类
```

---

## 三、关键配置

### `application.properties`（或 `application.yml`）

```properties
# 端口（Spring Boot 默认 8080，前端 axios 配置要对应）
server.port=8080

# 数据库配置（如果用 JPA + MySQL）
spring.datasource.url=jdbc:mysq1://localhost:3306/my_db
spring.datasource.username=root
spring.datasource.password=123456
spring.jpa.hibernate.ddl-auto=update
```

---

## 四、跨域问题（重要！）

### 方式一：`@CrossOrigin` 注解（简单，已写在参考代码里）

```java
@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")  // ← Vue 开发服务器地址
public class UserController { ... }
```

### 方式二：全局 CORS 配置（推荐，一次配置所有接口）

```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:5173");  // 前端地址
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

---

## 五、字段名对照表（前后端必须一致）

| 前端 TypeScript 类型 | 后端 Java 实体类 | JSON 字段名 |
|---|---|---|
| `UserInfo.username` | `UserInfo.userName` | `username`（需加 `@JsonProperty("username")`） |
| `UserInfo.email` | `UserInfo.email` | `email` |
| `UserInfo.role` | `UserInfo.role` | `role` |
| `UserInfo.status` | `UserInfo.status` | `status` |
| `MonthlyStats.month` | `MonthlyStats.month` | `month` |
| `MonthlyStats.value` | `MonthlyStats.value` | `value` |
| `StatsSummary.total` | `StatsSummary.total` | `total` |
| `SettingItem.enabled` | `SettingItem.enabled` | `enabled` |

> ⚠️ **注意**：Java 的驼峰字段名（`userName`）在 JSON 序列化时默认变为 `user_name`（snake_case），
> 需要在 `application.properties` 中配置：
> ```properties
> spring.jackson.property-naming-strategy=SNAKE_CASE
> ```
> 或者直接在字段上加 `@JsonProperty("username")` 指定名称。

---

## 六、前端调用流程图

```
用户打开 Page1          axios GET /api/user/info
     │                         │
     ├─ onMounted() ───► request 拦截器（加 token）
     │                         ├─ 发送 HTTP 请求
     │                         └─ 到达 Spring Boot Controller
     │                               │
     │                         ├─ Service 处理业务逻辑
     │                         └─ 返回 ApiResponse<UserInfo>
     │                         │
     └─ 响应拦截器处理 ◄──  JSON 响应
               │
               ├─ 成功：user.value = res.data
               └─ 失败：errorMsg.value = res.message
```

---

## 七、快速测试接口（不写前端，先用 Postman/curl 测）

```bash
# 测试获取用户信息
curl http://localhost:8080/api/user/info

# 测试获取月度统计
curl http://localhost:8080/api/stats/monthly

# 测试切换设置（PUT 请求）
curl -X PUT http://localhost:8080/api/settings/toggle/1
```

---

## 八、前端开发服务器代理（备选方案，不用 CORS）

如果不想在后端配置 CORS，可以在 `vite.config.ts` 中配置代理：

```ts
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      // 将以 /api 开头的请求代理到后端
      '/api': {
        target: 'http://localhost:8080',  // Spring Boot 地址
        changeOrigin: true,
      }
    }
  },
})
```

配置后，前端 `request.ts` 中的 `baseURL` 改为：
```ts
const request = axios.create({
  baseURL: '/api',  // 相对路径，Vite 代理会转发到后端
  // ...
})
```
