package com.example.controller;

import com.example.common.ApiResponse;
import com.example.entity.UserInfo;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 用户相关 Controller
 * 对应前端：src/api/user.ts → getUserInfo()
 */
@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")  // 允许前端开发服务器跨域
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * GET /api/user/info
     * 获取当前登录用户信息
     */
    @GetMapping("/info")
    public ApiResponse<UserInfo> getUserInfo() {
        UserInfo user = userService.getCurrentUser();
        return ApiResponse.success(user);
    }
}
