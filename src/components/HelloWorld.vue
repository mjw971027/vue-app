<!--
  ============================================================
  文件：src/components/HelloWorld.vue
  作用：Vite 官方模板自带的示例组件）
  说明：
    - 这是一个"展示用"组件，演示 Vite + Vue 的基本功能
    - 包含：Hero 图片叠加效果、HMR 计数器、外部链接卡片
    - ⚠️ 当前项目中【未被使用】（路由指向的是 Home.vue，不是这个组件）
    - 属于模板残留文件，可以安全删除
  ============================================================
-->

<!-- ========== 脚本区 ========== -->
<script setup lang="ts">
// ref() 创建响应式变量，数据变化时视图自动更新
import { ref } from "vue";

/**
 * 通过 "import 图片路径" 的方式导入静态资源
 * Vite 会自动处理这些图片：
 *   - 开发时：返回原始路径
 *   - 构建时：图片会被复制到 dist/assets/ 并加上 hash 文件名
 * 这里的导入方式比写死路径更优，因为构建时会被正确打包
 */
import viteLogo from "../assets/vite.svg";   // Vite Logo（SVG）
import heroImg from "../assets/hero.png";    // Hero 背景图（PNG）
import vueLogo from "../assets/vue.svg";     // Vue Logo（SVG）

/**
 * 响应式计数器
 * ref(0) 创建一个初始值为 0 的响应式变量
 * 在模板中直接用 {{ count }} 读取（Vue 自动解包 .value）
 * 在 JS 中需要用 count.value 访问/修改
 * 点击按钮时 count++ 等价于 count.value++
 */
const count = ref(0);
</script>

<!-- ========== 模板区 ========== -->
<template>
  <!-- 中间内容区（Hero + 标题 + 计数器） -->
  <section id="center">
    <!-- Hero 图片叠加区域：三张图片通过 CSS 3D 变换叠加在一起 -->
    <div class="hero">
      <!-- 底层图片（背景图） -->
      <img :src="heroImg" class="base" width="170" height="179" alt="" />
      <!-- Vue Logo（中间层，通过 CSS 做 3D 透视变换） -->
      <img :src="vueLogo" class="framework" alt="Vue logo" />
      <!-- Vite Logo（顶层） -->
      <img :src="viteLogo" class="vite" alt="Vite logo" />
    </div>

    <!-- 标题和说明文字 -->
    <div>
      <h1>Get started</h1>
      <p>Edit <code>src/App.vue</code> and save to test <code>HMR</code></p>
    </div>

    <!--
      计数器按钮
      @click="count++" — 点击时计数器 +1
      HMR = Hot Module Replacement（热模块替换）
      修改 Vue 文件并保存后，页面不刷新即可更新，这就是 HMR
    -->
    <button type="button" class="counter" @click="count++">Count is {{ count }}</button>
  </section>

  <!-- 装饰性分割线（左右各有一个小三角箭头，由 CSS ::before/::after 绘制） -->
  <div class="ticks"></div>

  <!-- "下一步"区域：文档链接 + 社区链接 -->
  <section id="next-steps">
    <!-- 左侧：文档链接卡片 -->
    <div id="docs">
      <!-- SVG 图标（从 /icons.svg 精灵图中引用 #documentation-icon 符号） -->
      <svg class="icon" role="presentation" aria-hidden="true">
        <use href="/icons.svg#documentation-icon"></use>
      </svg>
      <h2>Documentation</h2>
      <p>Your questions, answered</p>
      <ul>
        <!-- 外部链接：target="_blank" 在新标签页打开 -->
        <li>
          <a href="https://vite.dev/" target="_blank">
            <img class="logo" :src="viteLogo" alt="" />
            Explore Vite
          </a>
        </li>
        <li>
          <a href="https://vuejs.org/" target="_blank">
            <img class="button-icon" :src="vueLogo" alt="" />
            Learn more
          </a>
        </li>
      </ul>
    </div>

    <!-- 右侧：社区链接卡片 -->
    <div id="social">
      <svg class="icon" role="presentation" aria-hidden="true">
        <use href="/icons.svg#social-icon"></use>
      </svg>
      <h2>Connect with us</h2>
      <p>Join the Vite community</p>
      <ul>
        <!-- GitHub 链接 -->
        <li>
          <a href="https://github.com/vitejs/vite" target="_blank">
            <!-- 内联 SVG 图标（从精灵图引用） -->
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#github-icon"></use>
            </svg>
            GitHub
          </a>
        </li>
        <!-- Discord 链接 -->
        <li>
          <a href="https://chat.vite.dev/" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#discord-icon"></use>
            </svg>
            Discord
          </a>
        </li>
        <!-- X (Twitter) 链接 -->
        <li>
          <a href="https://x.com/vite_js" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#x-icon"></use>
            </svg>
            X.com
          </a>
        </li>
        <!-- Bluesky 链接 -->
        <li>
          <a href="https://bsky.app/profile/vite.dev" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#bluesky-icon"></use>
            </svg>
            Bluesky
          </a>
        </li>
      </ul>
    </div>
  </section>

  <!-- 底部装饰分割线 + 占位区域 -->
  <div class="ticks"></div>
  <section id="spacer"></section>
</template>
