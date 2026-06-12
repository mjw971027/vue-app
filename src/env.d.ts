/// <reference types="vite/client" />

/** 环境变量类型声明，与 .env.* 文件中的变量保持一致 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
