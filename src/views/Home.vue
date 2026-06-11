<!--
  ============================================================
  文件：src/views/Home.vue
  作用：首页视图组件（路由 '/' 对应的页面）
  说明：
    - 展示欢迎信息
  ============================================================
-->

<!-- ========== 脚本区 ========== -->
<script setup lang="ts">
</script>

<!-- ========== 模板区 ========== -->
<template>
  <div class="home">
    <h1>🏠 首页</h1>
    <p class="subtitle">欢迎使用 MyVueApp，请从左侧菜单选择功能页面。</p>
  </div>
</template>

<!-- ========== 样式区（scoped） ========== -->
<style scoped>
.home {
  width: 100%;
  padding: 40px 20px;
  text-align: center;
}

.home h1 {
  color: #18191c;
  margin-bottom: 8px;
  font-size: 32px;
}

.subtitle {
  color: #888;
  font-size: 16px;
}
</style>
