<template>
  <div class="teacher-performance-statistics">
    <div class="page-header">
      <button class="back-button" @click="goBack">← 返回仪表盘</button>
      <h2>业绩统计分析</h2>
    </div>

    <div class="statistics-container">
      <!-- 筛选控件 -->
      <div class="filter-controls">
        <div class="filter-group">
          <label>统计周期</label>
          <select v-model="selectedPeriod" @change="updateStatistics">
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="quarter">本季度</option>
            <option value="year">本年度</option>
            <option value="custom">自定义</option>
          </select>
        </div>
        
        <div v-if="selectedPeriod === 'custom'" class="filter-group date-range">
          <label>日期范围</label>
          <div class="date-inputs">
            <input type="date" v-model="customStartDate" @change="updateStatistics">
            <span>至</span>
            <input type="date" v-model="customEndDate" @change="updateStatistics">
          </div>
        </div>
        
        <div class="filter-group">
          <label>数据粒度</label>
          <select v-model="dataGranularity" @change="updateStatistics">
            <option value="day" :disabled="selectedPeriod !== 'week' && selectedPeriod !== 'month'">按天</option>
            <option value="week" :disabled="selectedPeriod === 'week'">按周</option>
            <option value="month" :disabled="selectedPeriod === 'month'">按月</option>
          </select>
        </div>
        
        <div class="filter-actions">
          <button class="action-button" @click="resetFilters">重置</button>
          <button class="action-button primary" @click="exportData">导出数据</button>
        </div>
      </div>

      <!-- 业绩概览卡片 -->
      <div class="overview-cards">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #e8f5e9; color: #2e7d32;">
            📚
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ summaryStats.totalClasses }}</div>
            <div class="stat-label">授课总数</div>
          </div>
          <div class="stat-trend" :class="getTrendClass(summaryStats.classesTrend)">
            {{ formatTrend(summaryStats.classesTrend) }}
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #e3f2fd; color: #1565c0;">
            👥
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ summaryStats.totalStudents }}</div>
            <div class="stat-label">学员总数</div>
          </div>
          <div class="stat-trend" :class="getTrendClass(summaryStats.studentsTrend)">
            {{ formatTrend(summaryStats.studentsTrend) }}
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #fff3e0; color: #ef6c00;">
            ⏰
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ summaryStats.totalHours }}</div>
            <div class="stat-label">授课课时</div>
          </div>
          <div class="stat-trend" :class="getTrendClass(summaryStats.hoursTrend)">
            {{ formatTrend(summaryStats.hoursTrend) }}
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #fce4ec; color: #c2185b;">
            📊
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ summaryStats.attendanceRate }}%</div>
            <div class="stat-label">平均出勤率</div>
          </div>
          <div class="stat-trend" :class="getTrendClass(summaryStats.attendanceTrend)">
            {{ formatTrend(summaryStats.attendanceTrend) }}
          </div>
        </div>
      </div>

      <!-- 授课趋势图表 -->
      <div class="chart-section">
        <div class="chart-header">
          <h3>授课趋势</h3>
          <div class="chart-legend">
            <span class="legend-item">
              <span class="legend-color" style="background-color: #667eea;"></span>
              课时数
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background-color: #48bb78;"></span>
              学生人数
            </span>
          </div>
        </div>
        <div class="chart-container">
          <div class="bar-chart">
            <div 
              v-for="item in trendData" 
              :key="item.label"
              class="bar-group"
            >
              <div class="bar-info">
                <div class="bar-label">{{ item.label }}</div>
              </div>
              <div class="bar-wrapper">
                <div 
                  class="bar hours-bar" 
                  :style="{ height: getBarHeight(item.hours) }"
                >
                  <div class="bar-tooltip">{{ item.hours }} 课时</div>
                </div>
                <div 
                  class="bar students-bar" 
                  :style="{ height: getBarHeight(item.students) }"
                >
                  <div class="bar-tooltip">{{ item.students }} 人</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 课程业绩详情 -->
      <div class="course-performance">
        <div class="section-header">
          <h3>课程业绩详情</h3>
          <div class="view-options">
            <button 
              :class="['view-button', { active: viewMode === 'table' }]"
              @click="viewMode = 'table'"
            >
              表格视图
            </button>
            <button 
              :class="['view-button', { active: viewMode === 'cards' }]"
              @click="viewMode = 'cards'"
            >
              卡片视图
            </button>
          </div>
        </div>

        <!-- 表格视图 -->
        <div v-if="viewMode === 'table'" class="performance-table">
          <div class="table-header">
            <div class="header-cell">课程名称</div>
            <div class="header-cell">授课次数</div>
            <div class="header-cell">授课课时</div>
            <div class="header-cell">学员人数</div>
            <div class="header-cell">出勤率</div>
            <div class="header-cell">满意度</div>
            <div class="header-cell">操作</div>
          </div>
          <div class="table-body">
            <div 
              v-for="course in coursePerformanceData" 
              :key="course.id"
              class="table-row"
            >
              <div class="table-cell">
                <div class="course-name">{{ course.name }}</div>
                <div class="course-code">课程代码: {{ course.code }}</div>
              </div>
              <div class="table-cell">{{ course.classCount }}</div>
              <div class="table-cell">{{ course.totalHours }}</div>
              <div class="table-cell">{{ course.studentCount }}</div>
              <div class="table-cell">
                <div class="rate-badge" :class="getAttendanceRateClass(course.attendanceRate)">
                  {{ course.attendanceRate }}%
                </div>
              </div>
              <div class="table-cell">
                <div class="rate-badge" :class="getSatisfactionClass(course.satisfaction)">
                  {{ course.satisfaction }}%
                </div>
              </div>
              <div class="table-cell">
                <button class="action-button small" @click="viewCourseDetails(course.id)">
                  详情
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 卡片视图 -->
        <div v-if="viewMode === 'cards'" class="performance-cards">
          <div 
            v-for="course in coursePerformanceData" 
            :key="course.id"
            class="course-card"
          >
            <div class="card-header">
              <h4 class="course-name">{{ course.name }}</h4>
              <span class="course-code">{{ course.code }}</span>
            </div>
            <div class="card-body">
              <div class="metrics-row">
                <div class="metric">
                  <span class="metric-value">{{ course.classCount }}</span>
                  <span class="metric-label">授课次数</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{ course.totalHours }}</span>
                  <span class="metric-label">课时</span>
                </div>
                <div class="metric">
                  <span class="metric-value">{{ course.studentCount }}</span>
                  <span class="metric-label">学员</span>
                </div>
              </div>
              <div class="progress-metrics">
                <div class="progress-item">
                  <div class="progress-header">
                    <span>出勤率</span>
                    <span>{{ course.attendanceRate }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :class="getAttendanceRateClass(course.attendanceRate)"
                      :style="{ width: course.attendanceRate + '%' }"
                    ></div>
                  </div>
                </div>
                <div class="progress-item">
                  <div class="progress-header">
                    <span>满意度</span>
                    <span>{{ course.satisfaction }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :class="getSatisfactionClass(course.satisfaction)"
                      :style="{ width: course.satisfaction + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button class="action-button small primary" @click="viewCourseDetails(course.id)">
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 学员反馈分析 -->
      <div class="feedback-analysis">
        <h3>学员反馈分析</h3>
        <div class="feedback-charts">
          <div class="feedback-item">
            <div class="feedback-header">
              <h4>评分分布</h4>
            </div>
            <div class="rating-distribution">
              <div 
                v-for="rating in ratingDistribution" 
                :key="rating.stars"
                class="rating-bar"
              >
                <div class="rating-label">
                  <span class="stars">{{ getStars(rating.stars) }}</span>
                  <span class="count">{{ rating.count }}</span>
                </div>
                <div class="rating-progress">
                  <div 
                    class="rating-fill" 
                    :style="{ width: rating.percentage + '%' }"
                  ></div>
                </div>
                <div class="rating-percentage">{{ rating.percentage }}%</div>
              </div>
            </div>
          </div>
          
          <div class="feedback-item">
            <div class="feedback-header">
              <h4>关键词分析</h4>
            </div>
            <div class="keywords-cloud">
              <span 
                v-for="keyword in keywords" 
                :key="keyword.text"
                class="keyword-tag"
                :style="{ 
                  fontSize: keyword.size + 'px',
                  opacity: keyword.opacity
                }"
              >
                {{ keyword.text }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="recent-feedback">
          <h4>近期反馈</h4>
          <div class="feedback-list">
            <div 
              v-for="feedback in recentFeedback" 
              :key="feedback.id"
              class="feedback-entry"
            >
              <div class="feedback-header">
                <div class="student-info">
                  <span class="student-name">{{ feedback.studentName }}</span>
                  <span class="course-name">{{ feedback.courseName }}</span>
                </div>
                <div class="feedback-rating">
                  {{ getStars(feedback.rating) }}
                </div>
              </div>
              <div class="feedback-content">
                {{ feedback.content }}
              </div>
              <div class="feedback-date">
                {{ formatDate(feedback.date) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'TeacherPerformanceStatistics',
  setup() {
    const router = useRouter()
    
    // 筛选条件
    const selectedPeriod = ref('month')
    const customStartDate = ref('')
    const customEndDate = ref('')
    const dataGranularity = ref('day')
    const viewMode = ref('table')
    
    // 概览数据
    const summaryStats = ref({
      totalClasses: 42,
      classesTrend: 12.5,
      totalStudents: 156,
      studentsTrend: 8.3,
      totalHours: 168,
      hoursTrend: 15.2,
      attendanceRate: 92.3,
      attendanceTrend: 2.1
    })
    
    // 趋势数据
    const trendData = ref([
      { label: '1月', hours: 32, students: 28 },
      { label: '2月', hours: 45, students: 36 },
      { label: '3月', hours: 48, students: 40 },
      { label: '4月', hours: 43, students: 38 },
      { label: '5月', hours: 40, students: 35 },
      { label: '6月', hours: 38, students: 32 }
    ])
    
    // 课程业绩数据
    const coursePerformanceData = ref([
      { id: 1, name: '数据结构', code: 'CS201', classCount: 16, totalHours: 64, studentCount: 32, attendanceRate: 94.5, satisfaction: 96 },
      { id: 2, name: '算法分析', code: 'CS202', classCount: 14, totalHours: 56, studentCount: 28, attendanceRate: 92.3, satisfaction: 94 },
      { id: 3, name: '数据库原理', code: 'CS203', classCount: 12, totalHours: 48, studentCount: 40, attendanceRate: 90.1, satisfaction: 92 },
      { id: 4, name: '操作系统', code: 'CS301', classCount: 10, totalHours: 40, studentCount: 35, attendanceRate: 89.7, satisfaction: 93 },
      { id: 5, name: '计算机网络', code: 'CS302', classCount: 8, totalHours: 32, studentCount: 30, attendanceRate: 91.2, satisfaction: 95 }
    ])
    
    // 评分分布
    const ratingDistribution = ref([
      { stars: 5, count: 48, percentage: 60 },
      { stars: 4, count: 24, percentage: 30 },
      { stars: 3, count: 6, percentage: 7.5 },
      { stars: 2, count: 2, percentage: 2.5 },
      { stars: 1, count: 0, percentage: 0 }
    ])
    
    // 关键词
    const keywords = ref([
      { text: '教学认真', size: 24, opacity: 0.9 },
      { text: '内容丰富', size: 20, opacity: 0.8 },
      { text: '讲解清晰', size: 22, opacity: 0.85 },
      { text: '生动有趣', size: 18, opacity: 0.75 },
      { text: '互动性强', size: 16, opacity: 0.7 },
      { text: '收获很大', size: 19, opacity: 0.82 },
      { text: '专业知识深厚', size: 21, opacity: 0.88 },
      { text: '作业适量', size: 15, opacity: 0.65 },
      { text: '注重实践', size: 17, opacity: 0.78 },
      { text: '耐心指导', size: 18, opacity: 0.75 }
    ])
    
    // 近期反馈
    const recentFeedback = ref([
      {
        id: 1,
        studentName: '张三',
        courseName: '数据结构',
        rating: 5,
        content: '老师讲解非常清晰，案例丰富，能够很好地理解抽象概念。',
        date: '2024-01-20'
      },
      {
        id: 2,
        studentName: '李四',
        courseName: '算法分析',
        rating: 4,
        content: '课程内容充实，作业有挑战性，对提高算法能力很有帮助。',
        date: '2024-01-19'
      },
      {
        id: 3,
        studentName: '王五',
        courseName: '数据库原理',
        rating: 5,
        content: '老师非常专业，实践环节安排合理，收获颇丰。',
        date: '2024-01-18'
      }
    ])
    
    // 获取趋势样式类
    const getTrendClass = (trend) => {
      if (trend > 0) return 'trend-up'
      if (trend < 0) return 'trend-down'
      return 'trend-neutral'
    }
    
    // 格式化趋势
    const formatTrend = (trend) => {
      const sign = trend > 0 ? '+' : ''
      return `${sign}${trend}%`
    }
    
    // 获取柱状图高度
    const getBarHeight = (value) => {
      const maxValue = Math.max(...trendData.value.map(item => Math.max(item.hours, item.students)))
      return `${(value / maxValue) * 100}%`
    }
    
    // 获取出勤率样式类
    const getAttendanceRateClass = (rate) => {
      if (rate >= 95) return 'rate-excellent'
      if (rate >= 90) return 'rate-good'
      if (rate >= 85) return 'rate-average'
      return 'rate-poor'
    }
    
    // 获取满意度样式类
    const getSatisfactionClass = (satisfaction) => {
      if (satisfaction >= 95) return 'satisfaction-excellent'
      if (satisfaction >= 90) return 'satisfaction-good'
      if (satisfaction >= 85) return 'satisfaction-average'
      return 'satisfaction-poor'
    }
    
    // 获取星级显示
    const getStars = (rating) => {
      return '★'.repeat(rating) + '☆'.repeat(5 - rating)
    }
    
    // 更新统计数据
    const updateStatistics = () => {
      // 在实际项目中，这里应该根据筛选条件调用API获取数据
      // 这里使用模拟数据
      console.log('更新统计数据', {
        period: selectedPeriod.value,
        startDate: customStartDate.value,
        endDate: customEndDate.value,
        granularity: dataGranularity.value
      })
    }
    
    // 重置筛选
    const resetFilters = () => {
      selectedPeriod.value = 'month'
      customStartDate.value = ''
      customEndDate.value = ''
      dataGranularity.value = selectedPeriod.value === 'week' || selectedPeriod.value === 'month' ? 'day' : 'month'
      updateStatistics()
    }
    
    // 导出数据
    const exportData = () => {
      alert('导出数据功能开发中...')
    }
    
    // 查看课程详情
    const viewCourseDetails = (courseId) => {
      router.push(`/home/teacher/course-details?id=${courseId}`)
    }
    
    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    
    const goBack = () => {
      router.push('/home/teacher/dashboard')
    }
    
    onMounted(() => {
      // 初始化认证信息
      if (!localStorage.getItem('userToken')) {
        localStorage.setItem('userToken', 'mock-token-teacher-789')
        localStorage.setItem('userRole', 'teacher')
      }
    })
    
    return {
      selectedPeriod,
      customStartDate,
      customEndDate,
      dataGranularity,
      viewMode,
      summaryStats,
      trendData,
      coursePerformanceData,
      ratingDistribution,
      keywords,
      recentFeedback,
      getTrendClass,
      formatTrend,
      getBarHeight,
      getAttendanceRateClass,
      getSatisfactionClass,
      getStars,
      updateStatistics,
      resetFilters,
      exportData,
      viewCourseDetails,
      formatDate,
      goBack
    }
  }
}
</script>

<style scoped>
.teacher-performance-statistics {
  padding: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 0 10px;
}

.back-button {
  padding: 10px 20px;
  background-color: #f0f2f5;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #e0e2e5;
}

.page-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.statistics-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 筛选控件 */
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
  background-color: white;
  padding: 20px 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.filter-group select,
.filter-group input {
  padding: 10px 12px;
  border: 1px solid #e0e2e5;
  border-radius: 6px;
  font-size: 14px;
}

.date-range .date-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-inputs input {
  flex: 1;
}

.filter-actions {
  display: flex;
  gap: 12px;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.stat-trend {
  font-size: 14px;
  font-weight: 500;
}

.trend-up {
  color: #2e7d32;
}

.trend-down {
  color: #c62828;
}

.trend-neutral {
  color: #666;
}

/* 图表部分 */
.chart-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.chart-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.chart-legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.chart-container {
  height: 300px;
}

.bar-chart {
  display: flex;
  height: 100%;
  align-items: flex-end;
  gap: 20px;
  padding-bottom: 30px;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.bar-info {
  margin-bottom: 10px;
}

.bar-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.bar-wrapper {
  display: flex;
  gap: 5px;
  align-items: flex-end;
  height: 100%;
}

.bar {
  width: 30px;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: opacity 0.2s ease;
}

.bar:hover {
  opacity: 0.8;
}

.bar:hover .bar-tooltip {
  display: block;
}

.hours-bar {
  background-color: #667eea;
}

.students-bar {
  background-color: #48bb78;
}

.bar-tooltip {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  margin-bottom: 5px;
}

/* 课程业绩 */
.course-performance {
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
  margin-bottom: 25px;
}

.section-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.view-options {
  display: flex;
  gap: 10px;
}

.view-button {
  padding: 8px 16px;
  border: 1px solid #e0e2e5;
  background-color: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-button.active {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}

/* 表格视图 */
.performance-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.table-body {
  max-height: 500px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f2f5;
  align-items: center;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row:last-child {
  border-bottom: none;
}

.course-code {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.rate-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.rate-excellent,
.satisfaction-excellent {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.rate-good,
.satisfaction-good {
  background-color: #e3f2fd;
  color: #1565c0;
}

.rate-average,
.satisfaction-average {
  background-color: #fff3e0;
  color: #ef6c00;
}

.rate-poor,
.satisfaction-poor {
  background-color: #ffebee;
  color: #c62828;
}

/* 卡片视图 */
.performance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.course-card {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #f0f2f5;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  background-color: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.card-header h4 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
}

.card-body {
  padding: 20px;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.metric {
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}

.metric-label {
  font-size: 12px;
  color: #666;
}

.progress-metrics {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.progress-item {
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.progress-bar {
  height: 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.card-footer {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  text-align: right;
}

/* 学员反馈分析 */
.feedback-analysis {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.feedback-analysis h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 25px 0;
}

.feedback-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.feedback-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.feedback-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
}

/* 评分分布 */
.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 15px;
}

.rating-label {
  min-width: 80px;
  font-size: 14px;
  color: #666;
  display: flex;
  justify-content: space-between;
}

.rating-progress {
  flex: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.rating-fill {
  height: 100%;
  background-color: #ffb400;
  border-radius: 4px;
}

.rating-percentage {
  min-width: 50px;
  text-align: right;
  font-size: 14px;
  color: #666;
}

/* 关键词云 */
.keywords-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  min-height: 150px;
  align-content: center;
  justify-content: center;
}

.keyword-tag {
  padding: 5px 15px;
  border-radius: 15px;
  background-color: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.keyword-tag:hover {
  transform: scale(1.1);
}

/* 近期反馈 */
.recent-feedback h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.feedback-entry {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.student-info {
  display: flex;
  gap: 15px;
  font-size: 14px;
}

.student-name {
  font-weight: 600;
  color: #333;
}

.course-name {
  color: #666;
}

.feedback-rating {
  font-size: 14px;
  color: #ffb400;
}

.feedback-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 10px;
}

.feedback-date {
  font-size: 12px;
  color: #999;
  text-align: right;
}

/* 按钮样式 */
.action-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.primary {
  background-color: #667eea;
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background-color: #5a67d8;
  transform: translateY(-1px);
}

.action-button.small {
  padding: 8px 16px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .bar-chart {
    flex-direction: column;
    height: auto;
  }
  
  .bar-group {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    height: 50px;
  }
  
  .bar-wrapper {
    flex: 1;
    height: 40px;
    margin-left: 15px;
  }
  
  .bar {
    width: 40px;
    border-radius: 0 4px 4px 0;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .performance-cards {
    grid-template-columns: 1fr;
  }
  
  .feedback-charts {
    grid-template-columns: 1fr;
  }
  
  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .metrics-row {
    grid-template-columns: 1fr;
  }
}
</style>