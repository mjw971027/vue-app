import type { MockMethod } from 'vite-plugin-mock'

const monthlyData = [
  { month: '1月', sales: 12000 },
  { month: '2月', sales: 15000 },
  { month: '3月', sales: 18000 },
  { month: '4月', sales: 14000 },
  { month: '5月', sales: 22000 },
  { month: '6月', sales: 26000 },
  { month: '7月', sales: 21000 },
  { month: '8月', sales: 28000 },
  { month: '9月', sales: 24000 },
  { month: '10月', sales: 32000 },
  { month: '11月', sales: 35000 },
  { month: '12月', sales: 38000 },
]

export default [
  {
    url: '/api/stats/monthly',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: monthlyData,
    }),
  },
  {
    url: '/api/stats/summary',
    method: 'get',
    response: () => ({
      code: 200,
      message: 'success',
      data: {
        totalSales: 285000,
        totalOrders: 1560,
        totalCustomers: 420,
        averageGrowthRate: 15.8,
        todaySales: 3200,
      },
    }),
  },
] as MockMethod[]