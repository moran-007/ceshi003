<template>
  <div class="teacher-dashboard">
    <h2>教学仪表盘</h2>
    
    <!-- 教学业绩概览 -->
    <div class="performance-overview">
      <h3>教学业绩概览</h3>
      <div class="performance-cards">
        <div class="performance-card">
          <div class="card-icon teaching-icon">📚</div>
          <div class="card-content">
            <div class="card-value">{{ performanceData.totalClasses }}</div>
            <div class="card-label">教授课程数</div>
          </div>
        </div>
        
        <div class="performance-card">
          <div class="card-icon student-icon">👥</div>
          <div class="card-content">
            <div class="card-value">{{ performanceData.studentsEnrolled }}</div>
            <div class="card-label">学生人数</div>
          </div>
        </div>
        
        <div class="performance-card">
          <div class="card-icon rating-icon">⭐</div>
          <div class="card-content">
            <div class="card-value">{{ performanceData.averageRating }}</div>
            <div class="card-label">平均评分</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 授课统计 -->
    <div class="teaching-stats">
      <div class="stat-card">
        <h3>已完成课时</h3>
        <div class="stat-circle">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#e1e8ed"
              stroke-width="10"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#4caf50"
              stroke-width="10"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="completedOffset"
              stroke-linecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div class="stat-number">{{ performanceData.completedSessions }}</div>
        </div>
      </div>

      <div class="stat-card">
        <h3>即将开始的课时</h3>
        <div class="stat-circle">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#e1e8ed"
              stroke-width="10"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#2196f3"
              stroke-width="10"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="upcomingOffset"
              stroke-linecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div class="stat-number">{{ performanceData.upcomingSessions }}</div>
        </div>
      </div>
    </div>

    <!-- 教学建议 -->
    <div class="teaching-tips">
      <h3>教学建议</h3>
      <div class="tips-content">
        <ul>
          <li>保持良好的师生互动，提高教学质量</li>
          <li>定期更新教学内容，结合实际案例</li>
          <li>关注学生的学习反馈，及时调整教学方法</li>
          <li>利用多媒体教学手段，提升学生学习兴趣</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import userState from '../store'

export default {
  name: 'TeacherDashboard',
  setup() {
    const circumference = 2 * Math.PI * 50 // 圆的周长
    
    // 计算属性，提供默认值防止数据未加载时出错
    const performanceData = computed(() => {
      if (!userState.teacherData || !userState.teacherData.teachingPerformance) {
        return {
          totalClasses: 15,
          studentsEnrolled: 240,
          averageRating: 4.8,
          completedSessions: 60,
          upcomingSessions: 30
        }
      }
      return userState.teacherData.teachingPerformance
    })
    
    const completedOffset = computed(() => {
      const totalSessions = performanceData.value.completedSessions + 
                            performanceData.value.upcomingSessions
      const ratio = totalSessions > 0 ? performanceData.value.completedSessions / totalSessions : 0
      return circumference - (ratio * circumference)
    })
    
    const upcomingOffset = computed(() => {
      const totalSessions = performanceData.value.completedSessions + 
                            performanceData.value.upcomingSessions
      const ratio = totalSessions > 0 ? performanceData.value.upcomingSessions / totalSessions : 0
      return circumference - (ratio * circumference)
    })
    
    const completedPercentage = computed(() => {
      const completed = performanceData.value.completedSessions || 0
      const upcoming = performanceData.value.upcomingSessions || 0
      const total = completed + upcoming
      return total > 0 ? Math.round((completed / total) * 100) : 0
    })
    
    // 组件挂载时检查数据
    onMounted(() => {
      console.log('TeacherDashboard mounted, data:', userState.teacherData)
      // 如果没有数据，使用默认数据
      if (!userState.teacherData || !userState.teacherData.teachingPerformance) {
        userState.teacherData = {
          teachingPerformance: {
            totalClasses: 15,
            studentsEnrolled: 240,
            averageRating: 4.8,
            completedSessions: 60,
            upcomingSessions: 30
          }
        }
      }
    })

    return {
      userState,
      performanceData,
      circumference,
      completedOffset,
      upcomingOffset,
      completedPercentage
    }
  }
}
</script>

<style scoped>
.teacher-dashboard {
  padding: 10px;
}

.teacher-dashboard h2 {
  color: #333;
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 600;
}

.performance-overview,
.teaching-stats,
.teaching-tips {
  background-color: #fafbfc;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.performance-overview h3,
.teaching-tips h3 {
  color: #555;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 2px solid #e1e8ed;
  padding-bottom: 10px;
}

.performance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.performance-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.performance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  border-radius: 50%;
}

.teaching-icon {
  background-color: #e3f2fd;
}

.student-icon {
  background-color: #e8f5e9;
}

.rating-icon {
  background-color: #fff3e0;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 5px;
}

.card-label {
  color: #666;
  font-size: 14px;
}

.teaching-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.stat-card {
  text-align: center;
}

.stat-card h3 {
  color: #555;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 500;
}

.stat-circle {
  position: relative;
  display: inline-block;
}

.stat-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.teaching-tips .tips-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
}

.teaching-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.teaching-tips li {
  padding: 10px 15px 10px 30px;
  margin-bottom: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
  position: relative;
  color: #555;
}

.teaching-tips li::before {
  content: "💡";
  position: absolute;
  left: 10px;
  top: 10px;
}

.teaching-tips li:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .performance-cards {
    grid-template-columns: 1fr;
  }
  
  .teaching-stats {
    grid-template-columns: 1fr;
  }
}
</style>