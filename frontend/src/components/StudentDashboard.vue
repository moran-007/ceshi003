<template>
  <div class="student-dashboard">
    <div class="dashboard-header">
      <h2>学习仪表盘</h2>
      <div class="header-actions">
        <router-link to="/home/student/grade-analysis" class="profile-button">
          <i class="icon-bar-chart"></i>
          <span>成绩分析</span>
        </router-link>
        <router-link to="/home/student/profile" class="profile-button">
          <span class="profile-icon">👤</span>
          <span>个人中心</span>
        </router-link>
      </div>
    </div>
    
    <!-- 学习进度卡片 -->
    <div class="progress-card">
      <h3>学习进度概览</h3>
      <div class="progress-stats">
        <div class="stat-item">
          <div class="stat-value">{{ progressData.totalCourses }}</div>
          <div class="stat-label">总课程数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ progressData.completedCourses }}</div>
          <div class="stat-label">已完成课程</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ progressData.ongoingCourses }}</div>
          <div class="stat-label">进行中课程</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ progressData.remainingHours }}</div>
          <div class="stat-label">剩余课时</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ progressData.avgScore }}</div>
          <div class="stat-label">平均分</div>
        </div>
      </div>
      
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progressData.progressPercentage + '%' }"
        ></div>
        <div class="progress-text">{{ progressData.progressPercentage }}%</div>
      </div>
    </div>

    <!-- 课时安排表格 -->
    <div class="schedule-card">
      <h3>课时安排</h3>
      <div class="table-responsive">
        <table class="schedule-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>课程名称</th>
              <th>授课教师</th>
              <th>上课时间</th>
              <th>上课地点</th>
              <th>剩余课时</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in scheduleData" :key="course.id">
              <td>{{ course.id }}</td>
              <td>{{ course.courseName }}</td>
              <td>{{ course.teacherName }}</td>
              <td>{{ course.time }}</td>
              <td>{{ course.location }}</td>
              <td>
                <span :class="getRemainingHoursClass(course.remainingHours)">
                  {{ course.remainingHours }}
                </span>
              </td>
              <td>
                <router-link :to="'/home/student/course/' + course.id" class="details-link">
                  查看详情
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 本周课程提醒 -->
      <div class="week-reminder">
        <h4>本周课程提醒</h4>
        <div class="reminder-content">
          <p>您本周共有 {{ scheduleData.length }} 门课程，请合理安排学习时间。</p>
        </div>
      </div>
    </div>

    <!-- 上课历史记录 -->
    <div class="history-card">
      <h3>最近上课历史</h3>
      <div class="history-list">
        <div v-for="(record, index) in recentClassHistory" :key="index" class="history-item">
          <div class="history-header">
            <span class="course-name">{{ record.courseName }}</span>
            <span class="attendance-badge" :class="record.attendance">
              {{ getAttendanceText(record.attendance) }}
            </span>
          </div>
          <div class="history-details">
            <span>{{ record.date }} {{ record.time }}</span>
            <span>{{ record.location }}</span>
            <span>{{ record.teacherName }}</span>
          </div>
        </div>
        <div v-if="recentClassHistory.length === 0" class="empty-history">
          <p>暂无上课历史记录</p>
        </div>
      </div>
    </div>

    <!-- 成绩概览 -->
    <div class="grades-card">
      <h3>近期成绩概览</h3>
      <div class="grades-list">
        <div v-for="grade in recentGrades" :key="grade.score_id" class="grade-item">
          <div class="grade-header">
            <span class="course-name">{{ grade.course_name }}</span>
            <span class="exam-type">{{ grade.exam_type_text }}</span>
          </div>
          <div class="grade-value" :class="getGradeClass(grade.score_value)">
            {{ grade.score_value }}
          </div>
          <div class="grade-date">{{ grade.exam_date }}</div>
        </div>
        <div v-if="recentGrades.length === 0" class="empty-grades">
          <p>暂无成绩记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userState } from '../store/index.js'

export default {
  name: 'StudentDashboard',
  setup() {
    const router = useRouter()
    
    // 计算属性，提供默认值防止数据未加载时出错
    const progressData = computed(() => {
      const mockData = userState.mockData
      if (!mockData || !mockData.learningProgress) {
        return {
          totalCourses: 0,
          completedCourses: 0,
          ongoingCourses: 0,
          progressPercentage: 0,
          remainingHours: 0,
          avgScore: 0
        }
      }
      
      const baseProgress = mockData.learningProgress
      return {
        ...baseProgress,
        remainingHours: baseProgress.remainingHours || 0,
        avgScore: baseProgress.avgScore || 0
      }
    })
    
    // 获取课程安排数据
    const scheduleData = computed(() => {
      const mockData = userState.mockData
      if (!mockData || !mockData.classSchedule) {
        return []
      }
      return mockData.classSchedule
    })
    
    // 获取最近成绩数据
    const recentGrades = computed(() => {
      const mockData = userState.mockData
      if (!mockData || !mockData.scores || mockData.scores.length === 0) {
        return []
      }
      // 按考试日期排序，取最近的5条
      return [...mockData.scores]
        .sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date))
        .slice(0, 5)
    })
    
    // 最近上课历史记录
    const recentClassHistory = computed(() => {
      // 从模拟数据中生成一些上课历史记录
      const courses = scheduleData.value
      if (courses.length === 0) {
        return []
      }
      
      const attendanceTypes = ['present', 'present', 'present', 'present', 'late', 'late', 'absent']
      const history = []
      
      // 生成过去7天的模拟记录
      for (let i = 0; i < 7; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        // 随机选择一天是否有课
        if (Math.random() > 0.5) {
          const course = courses[Math.floor(Math.random() * courses.length)]
          const timeParts = course.time.split(' ')[1].split('-')
          
          history.push({
            courseName: course.courseName,
            date: date.toISOString().split('T')[0],
            time: timeParts[0] + '-' + timeParts[1],
            location: course.location,
            teacherName: course.teacherName,
            attendance: attendanceTypes[Math.floor(Math.random() * attendanceTypes.length)]
          })
        }
      }
      
      // 按日期排序，取最近的5条
      return history.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    })
    
    // 获取剩余课时的样式类
    const getRemainingHoursClass = (hours) => {
      if (hours <= 5) return 'hours-low'
      if (hours <= 10) return 'hours-medium'
      return 'hours-high'
    }
    
    // 获取出勤率文本
    const getAttendanceText = (attendance) => {
      const map = {
        present: '出勤',
        late: '迟到',
        absent: '缺勤'
      }
      return map[attendance] || '未知'
    }
    
    // 获取成绩样式类
    const getGradeClass = (score) => {
      if (score >= 90) return 'grade-excellent'
      if (score >= 80) return 'grade-good'
      if (score >= 60) return 'grade-pass'
      return 'grade-fail'
    }
    
    // 组件挂载时检查数据
    onMounted(() => {
      console.log('StudentDashboard mounted, mockData:', userState.mockData)
    })
    
    return {
      userState,
      progressData,
      scheduleData,
      recentClassHistory,
      recentGrades,
      getRemainingHoursClass,
      getAttendanceText,
      getGradeClass
    }
  }
}
</script>

<style scoped>
.student-dashboard {
  padding: 10px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
  }
  
  .header-actions {
    display: flex;
    gap: 10px;
  }

.student-dashboard h2 {
  color: #333;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.profile-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 5px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .profile-button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

.profile-icon {
  font-size: 16px;
}

.progress-card,
.schedule-card,
.history-card,
.grades-card {
  background-color: #fafbfc;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.progress-card h3,
.schedule-card h3,
.history-card h3,
.grades-card h3 {
  color: #555;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 2px solid #e1e8ed;
  padding-bottom: 10px;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.progress-bar {
  height: 10px;
  background-color: #e1e8ed;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 10px;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.table-responsive {
  overflow-x: auto;
  margin-bottom: 20px;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.schedule-table th,
.schedule-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
}

.schedule-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.schedule-table tr:last-child td {
  border-bottom: none;
}

.schedule-table tr:hover {
  background-color: #f8f9fa;
}

.details-link {
  color: #667eea;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 3px;
  transition: background-color 0.3s;
}

.details-link:hover {
  background-color: #f0f2f5;
}

/* 剩余课时样式 */
.hours-high {
  color: #4caf50;
  font-weight: 500;
}

.hours-medium {
  color: #ff9800;
  font-weight: 500;
}

.hours-low {
  color: #f44336;
  font-weight: 500;
}

.week-reminder {
  background-color: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 15px;
  border-radius: 5px;
}

.week-reminder h4 {
  color: #1976d2;
  margin-bottom: 10px;
  font-size: 16px;
}

.reminder-content p {
  color: #333;
  margin: 0;
}

.history-list {
  display: grid;
  gap: 15px;
}

.history-item {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.history-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.course-name {
  font-weight: 500;
  color: #333;
  font-size: 16px;
}

.attendance-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.attendance-badge.present {
  background-color: #e8f5e9;
  color: #4caf50;
}

.attendance-badge.late {
  background-color: #fff3e0;
  color: #ff9800;
}

.attendance-badge.absent {
  background-color: #ffebee;
  color: #f44336;
}

.history-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: #666;
}

.empty-history,
.empty-grades {
  text-align: center;
  padding: 30px;
  color: #999;
  font-style: italic;
}

/* 成绩卡片样式 */
.grades-list {
  display: grid;
  gap: 15px;
}

.grade-item {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.grade-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.grade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.exam-type {
  background-color: #e0f7fa;
  color: #00acc1;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.grade-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
}

.grade-excellent {
  color: #4caf50;
}

.grade-good {
  color: #2196f3;
}

.grade-pass {
  color: #ff9800;
}

.grade-fail {
  color: #f44336;
}

.grade-date {
  font-size: 12px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .progress-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .schedule-table th,
  .schedule-table td {
    padding: 10px;
    font-size: 14px;
  }
  
  .history-header,
  .grade-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .history-details {
    flex-direction: column;
    gap: 5px;
  }
}

@media (max-width: 480px) {
  .progress-stats {
    grid-template-columns: 1fr;
  }
  
  .student-dashboard {
    padding: 5px;
  }
  
  .progress-card,
  .schedule-card,
  .history-card,
  .grades-card {
    padding: 15px;
  }
}
</style>