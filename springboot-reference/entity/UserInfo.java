package com.example.entity;

/**
 * 用户信息实体类
 * 对应前端：src/api/types.ts → UserInfo 接口
 *
 * 前端 JSON 字段名必须与这里一致（或通过 @JsonProperty 指定）
 * 例如后端字段 userName，前端收到 userName（驼峰）
 */
public class UserInfo {

    private Long id;
    private String username;   // 用户名
    private String email;       // 邮箱
    private String role;        // 角色
    private String status;      // 状态："在线" / "离线"

    // getter / setter

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
