import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: () => ({
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock_jwt_token_' + Date.now(),
        tokenType: 'Bearer',
        expiresIn: 86400,
        refreshToken: 'mock_refresh_token_' + Date.now(),
      },
    }),
  },
  {
    url: '/api/auth/logout',
    method: 'post',
    response: () => ({
      code: 200,
      message: '退出成功',
      data: null,
    }),
  },
  {
    url: '/api/auth/me',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        status: '在线',
      },
    }),
  },
  {
    url: '/api/auth/refresh',
    method: 'post',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        token: 'mock_jwt_token_' + Date.now(),
        tokenType: 'Bearer',
        expiresIn: 86400,
      },
    }),
  },
  {
    url: '/api/auth/change-password',
    method: 'post',
    response: () => ({
      code: 200,
      message: '密码修改成功',
      data: null,
    }),
  },
] as MockMethod[]