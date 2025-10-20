<template>
  <div class="test-container">
    <h1>StudentDashboard 组件测试</h1>
    <div class="test-info">
      <p>测试目的：验证 StudentDashboard 组件的模拟数据显示和布局效果</p>
      <p>测试环境：无后端连接，使用本地模拟数据</p>
    </div>
    
    <!-- 直接使用 StudentDashboard 组件 -->
    <StudentDashboard />
    
    <div class="test-results">
      <h3>测试结果观察</h3>
      <ul>
        <li>✓ 学习进度概览是否显示</li>
        <li>✓ 课时安排表格是否有数据</li>
        <li>✓ 上课历史记录是否生成</li>
        <li>✓ 近期成绩概览是否显示</li>
        <li>✓ 页面最大宽度是否为1024像素</li>
      </ul>
    </div>
  </div>
</template>

<script>
import StudentDashboard from '../components/StudentDashboard.vue'

export default {
  name: 'StudentDashboardTest',
  components: {
    StudentDashboard
  },
  setup() {
    return {}
  }
}
</script>

<style scoped>
.test-container {
  padding: 20px;
  max-width: 1024px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.test-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #4285f4;
}

.test-results {
  margin-top: 30px;
  padding: 20px;
  background-color: #e8f5e9;
  border-radius: 8px;
  border-left: 4px solid #34a853;
}

.test-results h3 {
  margin-top: 0;
  color: #1b5e20;
}

.test-results ul {
  margin: 0;
  padding-left: 20px;
}

.test-results li {
  margin: 8px 0;
  color: #2e7d32;
}
</style>