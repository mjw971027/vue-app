import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/user/info',
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
] as MockMethod[]