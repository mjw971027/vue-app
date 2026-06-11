package com.example.service;

import com.example.entity.UserInfo;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

/**
 * 用户服务类
 * 处理用户相关的业务逻辑
 */
@Service
public class UserService {

    /**
     * 模拟数据库存储（实际项目中应使用 JPA 或 MyBatis）
     */
    private UserInfo currentUser;

    /**
     * 构造函数：初始化模拟数据
     */
    public UserService() {
        initMockData();
    }

    /**
     * 初始化模拟用户数据
     */
    private void initMockData() {
        currentUser = new UserInfo();
        currentUser.setId(1L);
        currentUser.setUsername("张三");
        currentUser.setEmail("zhangsan@example.com");
        currentUser.setRole("管理员");
        currentUser.setStatus("在线");
    }

    /**
     * 获取当前登录用户信息
     * 对应前端：src/api/user.ts → getUserInfo()
     * 对应 Controller：UserController.getUserInfo()
     *
     * 实际项目中应从 SecurityContext 或 Session 获取当前用户
     * 这里返回模拟数据
     *
     * @return 当前用户信息
     */
    public UserInfo getCurrentUser() {
        // 模拟数据库查询
        return currentUser;
    }

    /**
     * 更新用户信息（扩展方法）
     * @param user 用户更新信息
     * @return 更新后的用户信息
     */
    public UserInfo updateCurrentUser(UserInfo user) {
        // 更新字段（实际项目中应使用 JPA 的 save 方法）
        if (user.getUsername() != null) {
            currentUser.setUsername(user.getUsername());
        }
        if (user.getEmail() != null) {
            currentUser.setEmail(user.getEmail());
        }
        if (user.getRole() != null) {
            currentUser.setRole(user.getRole());
        }
        if (user.getStatus() != null) {
            currentUser.setStatus(user.getStatus());
        }

        return currentUser;
    }

    /**
     * 根据用户ID获取用户信息（扩展方法）
     * @param id 用户ID
     * @return 用户信息
     */
    public UserInfo getUserById(Long id) {
        // 模拟数据库查询
        if (id == 1L) {
            return currentUser;
        }
        throw new RuntimeException("用户不存在");
    }
}
