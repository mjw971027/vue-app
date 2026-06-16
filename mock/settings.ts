import type { MockMethod } from 'vite-plugin-mock'

const settings = [
  { id: 1, name: '深色模式', enabled: false },
  { id: 2, name: '消息通知', enabled: true },
  { id: 3, name: '自动保存', enabled: true },
  { id: 4, name: '数据缓存', enabled: false },
  { id: 5, name: '操作日志', enabled: true },
]

export default [
  {
    url: '/api/settings/list',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: settings,
    }),
  },
  {
    url: '/api/settings/toggle/:id',
    method: 'put',
    response: ({ query }) => {
      const item = settings.find((s) => s.id === Number(query.id))
      if (item) item.enabled = !item.enabled
      return {
        code: 200,
        message: 'success',
        data: null,
      }
    },
  },
  {
    url: '/api/settings/system-info',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        version: 'v2.1.0',
        lastUpdate: '2026-06-12',
      },
    }),
  },
] as MockMethod[]