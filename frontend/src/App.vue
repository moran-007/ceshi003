<template>
  <div class="app-container">
    <!-- 全局路由视图，将根据路由显示不同组件 -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  // 应用级别的逻辑可以在这里添加
}
</script>

<style>
/* CSS变量定义，方便全局样式统一管理 */
:root {
  --primary-color: #4ECDC4;
  --secondary-color: #45B7D1;
  --danger-color: #FF6B6B;
  --text-color: #333;
  --text-secondary: #666;
  --background-color: #f5f7fa;
  --card-background: #ffffff;
  --border-color: #e1e5e9;
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.1);
  --shadow-heavy: 0 8px 32px rgba(0, 0, 0, 0.1);
  --border-radius: 8px;
  --transition-normal: all 0.3s ease;
}

/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow-x: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-color);
  background-color: var(--background-color);
  line-height: 1.6;
}

#app {
  height: 100%;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 通用样式类 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 按钮基础样式 */
button {
  cursor: pointer;
  font-family: inherit;
  transition: var(--transition-normal);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 输入框基础样式 */
input, select, textarea {
  font-family: inherit;
  font-size: 16px;
  transition: var(--transition-normal);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.2);
}

/* 链接样式 */
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: var(--transition-normal);
}

a:hover {
  color: var(--secondary-color);
}

/* 响应式断点 */
@media (max-width: 768px) {
  :root {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  :root {
    font-size: 13px;
  }
}
</style>
