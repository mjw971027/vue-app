import type { MockMethod } from 'vite-plugin-mock'

const users = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'ADMIN', status: '在线', createTime: '2026-01-01 10:00:00' },
  { id: 2, username: 'zhangsan', email: 'zhangsan@example.com', role: 'USER', status: '在线', createTime: '2026-03-15 14:30:00' },
  { id: 3, username: 'lisi', email: 'lisi@example.com', role: 'USER', status: '离线', createTime: '2026-04-20 09:15:00' },
  { id: 4, username: 'wangwu', email: 'wangwu@example.com', role: 'USER', status: '在线', createTime: '2026-05-10 16:45:00' },
]

const permissionsMap: Record<number, string[]> = {
  1: ['page1', 'page2', 'page3', 'page4'],
  2: ['page1', 'page2'],
  3: ['page3'],
  4: ['page1', 'page3', 'page4'],
}

export default [
  {
    url: '/api/user/list',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: users,
    }),
  },
  {
    url: '/api/user/register',
    method: 'post',
    response: ({ body }) => ({
      code: 200,
      message: '注册成功',
      data: {
        id: users.length + 1,
        username: body.username,
        email: body.email,
        role: body.role || 'USER',
        status: '在线',
      },
    }),
  },
  {
    url: '/api/user/:id',
    method: 'put',
    response: ({ query, body }) => ({
      code: 200,
      message: '更新成功',
      data: {
        id: Number(query.id),
        username: body.username || 'admin',
        email: body.email || 'admin@example.com',
        role: body.role || 'USER',
        status: body.status || '在线',
      },
    }),
  },
  {
    url: '/api/user/:id',
    method: 'delete',
    response: () => ({
      code: 200,
      message: '删除成功',
      data: null,
    }),
  },
  {
    url: '/api/user/permissions',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: ['page1', 'page2', 'page3', 'page4'],
    }),
  },
  {
    url: '/api/user/permissions/:userId',
    method: 'get',
    response: ({ query }) => ({
      code: 200,
      message: 'success',
      data: permissionsMap[Number(query.userId)] || [],
    }),
  },
  {
    url: '/api/user/permissions/:userId',
    method: 'put',
    response: () => ({
      code: 200,
      message: '权限设置成功',
      data: null,
    }),
  },
] as MockMethod[]