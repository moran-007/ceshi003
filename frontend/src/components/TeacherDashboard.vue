<template>
  <div class="teacher-dashboard">
    <div class="dashboard-header">
      <h2>教学仪表盘</h2>
      <div class="header-actions">
        <router-link to="/home/teacher/profile" class="profile-button" aria-label="个人中心">
          <span class="profile-icon">👤</span>
          <span>个人中心</span>
        </router-link>
      </div>
    </div>

    <!-- 功能模块导航 -->
    <div class="dashboard-nav">
      <div class="nav-grid">
        <router-link to="/home/teacher/course-schedule" class="nav-card" aria-label="课程安排管理">
          <div class="nav-icon">📅</div>
          <div class="nav-title">课程安排管理</div>
        </router-link>
        <router-link to="/home/teacher/hours-deduction" class="nav-card" aria-label="课时扣除操作">
          <div class="nav-icon">✂️</div>
          <div class="nav-title">课时扣除操作</div>
        </router-link>
        <router-link to="/home/teacher/attendance" class="nav-card" aria-label="学员签到管理">
          <div class="nav-icon">✅</div>
          <div class="nav-title">学员签到管理</div>
        </router-link>
        <router-link to="/home/teacher/performance" class="nav-card" aria-label="业绩统计分析">
          <div class="nav-icon">📊</div>
          <div class="nav-title">业绩统计分析</div>
        </router-link>
        <router-link to="/home/teacher/class-consumption" class="nav-card" aria-label="课消数据仪表盘">
          <div class="nav-icon">📈</div>
          <div class="nav-title">课消数据仪表盘</div>
        </router-link>
        <router-link to="/home/teacher/students" class="nav-card" aria-label="所属学员信息查询">
          <div class="nav-icon">👥</div>
          <div class="nav-title">所属学员信息查询</div>
        </router-link>
        <router-link to="/home/teacher/archives" class="nav-card" aria-label="档案资料查询">
          <div class="nav-icon">📋</div>
          <div class="nav-title">档案资料查询</div>
        </router-link>
      </div>
    </div>

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
        <div class="performance-card">
          <div class="card-icon hours-icon">⏰</div>
          <div class="card-content">
            <div class="card-value">{{ performanceData.totalHours }}</div>
            <div class="card-label">总授课时长(小时)</div>
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

    <!-- 今日课程安排 -->
    <div class="today-schedule">
      <div class="section-header">
        <h3>今日课程安排</h3>
        <router-link to="/home/teacher/course-schedule" class="view-all-link">查看全部</router-link>
      </div>
      <div class="schedule-list">
        <div v-for="course in todayCourses" :key="course.id" class="schedule-item">
          <div class="schedule-time">{{ course.time }}</div>
          <div class="schedule-info">
            <div class="course-name">{{ course.courseName }}</div>
            <div class="course-detail">教室：{{ course.classroom }}</div>
            <div class="course-detail">学生：{{ course.studentCount }}人</div>
          </div>
          <div class="schedule-actions">
            <router-link :to="`/home/teacher/attendance?courseId=${course.id}`" class="action-button primary">
              签到管理
            </router-link>
          </div>
        </div>
        <div v-if="todayCourses.length === 0" class="empty-state">
          <p>今日暂无课程安排</p>
        </div>
      </div>
    </div>

    <!-- 待处理事项 -->
    <div class="pending-tasks">
      <div class="section-header">
        <h3>待处理事项</h3>
      </div>
      <div class="tasks-list">
        <div v-for="task in pendingTasks" :key="task.id" class="task-item" :class="{ 'urgent': task.urgent }">
          <div class="task-icon">{{ task.icon }}</div>
          <div class="task-content">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-description">{{ task.description }}</div>
            <div class="task-time">{{ task.time }}</div>
          </div>
          <div class="task-action">
            <button class="action-button small" @click="completeTask(task.id)">处理</button>
          </div>
        </div>
        <div v-if="pendingTasks.length === 0" class="empty-state">
          <p>暂无待处理事项</p>
        </div>
      </div>
    </div>

    <!-- 学生出勤统计 -->
    <div class="attendance-stats">
      <div class="section-header">
        <h3>学生出勤统计</h3>
        <router-link to="/home/teacher/attendance" class="view-all-link">查看全部</router-link>
      </div>
      <div class="attendance-chart">
        <div class="attendance-item">
          <div class="attendance-label">出勤</div>
          <div class="attendance-bar">
            <div class="attendance-fill present" :style="{ width: attendanceStats.present + '%' }"></div>
          </div>
          <div class="attendance-percentage">{{ attendanceStats.present }}%</div>
        </div>
        <div class="attendance-item">
          <div class="attendance-label">迟到</div>
          <div class="attendance-bar">
            <div class="attendance-fill late" :style="{ width: attendanceStats.late + '%' }"></div>
          </div>
          <div class="attendance-percentage">{{ attendanceStats.late }}%</div>
        </div>
        <div class="attendance-item">
          <div class="attendance-label">缺勤</div>
          <div class="attendance-bar">
            <div class="attendance-fill absent" :style="{ width: attendanceStats.absent + '%' }"></div>
          </div>
          <div class="attendance-percentage">{{ attendanceStats.absent }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { userState } from '../store/index.js'

export default {
  name: 'TeacherDashboard',
  setup() {
    const router = useRouter()
    const circumference = 2 * Math.PI * 50 // 圆的周长
    const pendingTasks = ref([
      {
        id: 1,
        title: '批改学生作业',
        description: '数据结构课程第3章节作业',
        time: '今天 18:00前',
        icon: '📝',
        urgent: true
      },
      {
        id: 2,
        title: '更新课程进度',
        description: '操作系统课程进度更新',
        time: '今天 20:00前',
        icon: '📊',
        urgent: false
      },
      {
        id: 3,
        title: '提交教学日志',
        description: '本周教学工作总结',
        time: '明天 10:00前',
        icon: '📋',
        urgent: false
      }
    ])
    
    // 计算属性，提供默认值防止数据未加载时出错
    const performanceData = computed(() => {
      if (!userState.teacherData || !userState.teacherData.teachingPerformance) {
        return {
          totalClasses: 15,
          studentsEnrolled: 240,
          averageRating: 4.8,
          completedSessions: 60,
          upcomingSessions: 30,
          totalHours: 180
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
    
    // 今日课程数据
    const todayCourses = computed(() => {
      return [
        {
          id: 101,
          courseName: '数据结构',
          time: '08:30-10:00',
          classroom: 'A101',
          studentCount: 35
        },
        {
          id: 102,
          courseName: '算法分析',
          time: '14:00-15:30',
          classroom: 'B202',
          studentCount: 28
        }
      ]
    })
    
    // 出勤统计数据
    const attendanceStats = computed(() => {
      return {
        present: 85,
        late: 10,
        absent: 5
      }
    })
    
    // 完成任务
    const completeTask = (taskId) => {
      pendingTasks.value = pendingTasks.value.filter(task => task.id !== taskId)
      // 这里可以添加任务完成的逻辑，如API调用等
    }
    
    // 组件挂载时检查数据
    onMounted(() => {
      console.log('TeacherDashboard mounted, data:', userState.teacherData)
      
      // 确保用户角色正确
      if (userState.role !== 'teacher') {
        console.warn('用户角色不匹配，预期teacher，实际为:', userState.role)
        // 这里不直接修改角色，而是建议用户重新登录
      }
      
      // 如果没有数据，使用默认数据
      if (!userState.teacherData || !userState.teacherData.teachingPerformance) {
        userState.teacherData = {
          teachingPerformance: {
            totalClasses: 15,
            studentsEnrolled: 240,
            averageRating: 4.8,
            completedSessions: 60,
            upcomingSessions: 30,
            totalHours: 180
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
      todayCourses,
      pendingTasks,
      attendanceStats,
      completeTask
    }
  }
}
</script>

<style scoped>
.teacher-dashboard {
  padding: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 头部样式 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 10px;
}

.dashboard-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.profile-button:hover {
  background-color: #5a67d8;
  transform: translateY(-1px);
}

.profile-button:active {
  transform: translateY(0);
}

.profile-icon {
  font-size: 20px;
}

/* 导航网格 */
.dashboard-nav {
  margin-bottom: 30px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.nav-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  text-decoration: none;
  color: #333;
}

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  background-color: #f8f9fa;
}

.nav-card:active {
  transform: translateY(-2px);
}

.nav-icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.nav-title {
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

/* 通用卡片样式 */
.performance-overview,
.teaching-stats,
.today-schedule,
.pending-tasks,
.attendance-stats {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f2f5;
}

.section-header h3 {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.view-all-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #5a67d8;
}

/* 业绩卡片 */
.performance-overview h3 {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f2f5;
}

.performance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.performance-card {
  background-color: #fafbfc;
  border-radius: 10px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.performance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 36px;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.hours-icon {
  background-color: #f3e5f5;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 5px;
}

.card-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

/* 统计卡片 */
.teaching-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.stat-card {
  text-align: center;
}

.stat-card h3 {
  color: #333;
  margin-bottom: 25px;
  font-size: 18px;
  font-weight: 600;
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
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

/* 今日课程 */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.schedule-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  transition: background-color 0.2s ease;
}

.schedule-item:hover {
  background-color: #f0f2f5;
}

.schedule-time {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
  margin-right: 25px;
  min-width: 100px;
}

.schedule-info {
  flex: 1;
}

.course-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.course-detail {
  font-size: 14px;
  color: #666;
  margin-bottom: 3px;
}

.schedule-actions {
  margin-left: 20px;
}

/* 待处理事项 */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #e0e0e0;
  transition: all 0.2s ease;
}

.task-item.urgent {
  border-left-color: #f56565;
  background-color: #fff5f5;
}

.task-item:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.task-icon {
  font-size: 24px;
  margin-top: 2px;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.task-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.task-time {
  font-size: 12px;
  color: #999;
}

/* 出勤统计 */
.attendance-chart {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.attendance-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.attendance-label {
  width: 60px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.attendance-bar {
  flex: 1;
  height: 20px;
  background-color: #f0f2f5;
  border-radius: 10px;
  overflow: hidden;
}

.attendance-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.attendance-fill.present {
  background-color: #4caf50;
}

.attendance-fill.late {
  background-color: #ff9800;
}

.attendance-fill.absent {
  background-color: #f44336;
}

.attendance-percentage {
  width: 50px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-align: right;
}

/* 按钮样式 */
.action-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.action-button.primary {
  background-color: #667eea;
  color: white;
}

.action-button.primary:hover {
  background-color: #5a67d8;
}

.action-button.primary:active {
  transform: scale(0.98);
}

.action-button.small {
  padding: 8px 16px;
  font-size: 13px;
  background-color: #4caf50;
  color: white;
}

.action-button.small:hover {
  background-color: #45a049;
}

.action-button.small:active {
  transform: scale(0.96);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  background-color: #f8f9fa;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .nav-grid {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  .performance-cards {
    grid-template-columns: 1fr;
  }
  
  .teaching-stats {
    grid-template-columns: 1fr;
  }
  
  .schedule-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .schedule-time {
    margin-right: 0;
  }
  
  .schedule-actions {
    margin-left: 0;
    width: 100%;
  }
  
  .action-button {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .nav-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-card {
    padding: 20px 15px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .attendance-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .attendance-label {
    width: auto;
  }
  
  .attendance-percentage {
    width: auto;
  }
}
</style>