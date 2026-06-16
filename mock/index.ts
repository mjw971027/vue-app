import type { MockMethod } from 'vite-plugin-mock'
import auth from './auth'
import user from './user'
import userManage from './userManage'
import settings from './settings'
import stats from './stats'

export default [
  ...auth,
  ...user,
  ...userManage,
  ...settings,
  ...stats,
] as MockMethod[]