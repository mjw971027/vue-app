/**
 * ============================================================
 * 文件：eslint.config.js
 * 作用：ESLint 代码规范配置（Flat Config 格式）
 * 说明：
 *   - ESLint 10+ 推荐使用的新配置格式（替代 .eslintrc.*）
 *   - 执行顺序：从上到下，后面的配置可以覆盖前面的
 *   - Prettier 必须放在最后，否则会被其他规则覆盖
 * ============================================================
 */

// 导入各个 ESLint 相关包
import js from "@eslint/js";                     // JS 核心规则
import tseslint from "typescript-eslint";        // TS 规则 + TS 解析器
import pluginVue from "eslint-plugin-vue";       // Vue SFC 规则
import prettierConfig from "eslint-config-prettier"; // 关闭与 Prettier 冲突的规则

/**
 * tseslint.config(...）— 创建 ESLint 配置数组
 * 每个元素是一个配置对象，按顺序合并
 */
export default tseslint.config(

  /* ========== 1. 全局忽略目录 ==========
     这些目录不会被 ESLint 扫描（提升性能） */
  { ignores: ["dist/", "node_modules/"] },

  /* ========== 2. JavaScript 推荐规则 ==========
     js.configs.recommended 包含：
     - no-unused-vars（未使用变量警告）
     - no-console（禁止 console.log，可配置）
     - eqeqeq（强制 === 而非 ==）
     等 50+ 条最佳实践规则 */
  js.configs.recommended,

  /* ========== 3. TypeScript 推荐规则 ==========
     ...展开运算符：将数组中的每个配置对象展开到顶层
     tseslint.configs.recommended 包含：
     - @typescript-eslint/no-explicit-any（禁止 any 类型）
     - @typescript-eslint/explicit-function-return-type（建议显式返回类型）
     等 TS 专属规则 */
  ...tseslint.configs.recommended,

  /* ========== 4. Vue 3 推荐规则 ==========
     ...pluginVue.configs["flat/recommended"] 包含：
     - vue/component-api-style（检查 Composition API 使用规范）
     - vue/no-unused-components（未使用组件警告）
     - vue/require-prop-types（props 必须有类型声明）
     等 Vue 最佳实践规则 */
  ...pluginVue.configs["flat/recommended"],

  /* ========== 5. Vue + TypeScript 解析器配置 ==========
     让 ESLint 在检查 .vue 文件时使用 TypeScript 解析器
     这样 <script setup lang="ts"> 中的 TS 代码才能被正确解析 */
  {
    files: ["*.vue", "**/*.vue"],  // 只对 .vue 文件生效
    languageOptions: {
      parserOptions: {
        /* 使用 TypeScript 解析器来解析 <script setup lang="ts"> 中的代码
           vue-eslint-parser 负责解析 .vue 的模板部分（<template>）
           tseslint.parser 负责解析 <script> 中的 TypeScript */
        parser: tseslint.parser,
      },
    },
  },

  /* ========== 6. Prettier 配置（必须放最后）==========
     eslint-config-prettier 会关闭所有与 Prettier 冲突的 ESLint 规则
     例如：ESLint 的 indent 规则与 Prettier 的缩进规则冲突
     放最后确保它能覆盖前面的规则 */
  prettierConfig,

  /* ========== 7. 自定义规则微调 ========== */
  {
    rules: {
      /* 关闭 Vue 多单词组件名强制规则
         Vue 官方建议组件名用多单词（避免与 HTML 元素冲突）
         但单单词组件名（如 Page1.vue）在小项目中也可以接受
         "off" = 关闭此规则 */
      "vue/multi-word-component-names": "off",

      /* 未使用变量/参数：从 error 降为 warn（警告不报错）
         argsIgnorePattern: "^_" — 以下划线开头的参数忽略未使用检查
         例如：function fn(a, _b) { return a } → _b 不会报警告 */
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
);
