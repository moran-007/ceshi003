<template>
  <div class="teacher-hours-dashboard">
    <div class="page-header">
      <button class="back-button" @click="goBack">← 返回仪表盘</button>
      <h2>课消数据仪表盘</h2>
    </div>

    <div class="dashboard-container">
      <!-- 筛选控件 -->
      <div class="filter-controls">
        <div class="filter-group">
          <label>统计周期</label>
          <select v-model="selectedPeriod" @change="updateDashboard">
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
            <input type="date" v-model="customStartDate" @change="updateDashboard">
            <span>至</span>
            <input type="date" v-model="customEndDate" @change="updateDashboard">
          </div>
        </div>
        
        <div class="filter-group">
          <label>课程筛选</label>
          <select v-model="selectedCourse" @change="updateDashboard">
            <option value="all">所有课程</option>
            <option v-for="course in availableCourses" :key="course.id" :value="course.id">
              {{ course.name }}
            </option>
          </select>
        </div>
        
        <div class="filter-actions">
          <button class="action-button" @click="resetFilters">重置</button>
          <button class="action-button primary" @click="exportDashboardData">导出数据</button>
        </div>
      </div>

      <!-- 课消概览卡片 -->
      <div class="overview-cards">
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #e8f5e9; color: #2e7d32;">
            ⏰
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ summaryData.totalHoursConsumed }}</div>
            <div class="stat-label">总消耗课时</div>
          </div>
          <div class="stat-details">
            <div class="detail-item">
              <span class="detail-label">计划课时</span>
              <span class="detail-value">{{ summaryData.plannedHours }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">完成率</span>
              <span class="detail-value">{{ summaryData.completionRate }}%</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #e3f2fd; color: #1565c0;">
            👥
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ summaryData.activeStudents }}</div>
            <div class="stat-label">活跃学员</div>
          </div>
          <div class="stat-details">
            <div class="detail-item">
              <span class="detail-label">平均课时</span>
              <span class="detail-value">{{ summaryData.averageHoursPerStudent }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">新增学员</span>
              <span class="detail-value">{{ summaryData.newStudents }}</span>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #fff3e0; color: #ef6c00;">
            📊
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ summaryData.revenueGenerated }}</div>
            <div class="stat-label">产生收入</div>
          </div>
          <div class="stat-details">
            <div class="detail-item">
              <span class="detail-label">课时单价</span>
              <span class="detail-value">¥{{ summaryData.pricePerHour }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">同比增长</span>
              <span class="detail-value" :class="summaryData.revenueGrowth > 0 ? 'growth-positive' : 'growth-negative'">
                {{ summaryData.revenueGrowth > 0 ? '+' : '' }}{{ summaryData.revenueGrowth }}%
              </span>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #fce4ec; color: #c2185b;">
            📈
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ summaryData.pendingHours }}</div>
            <div class="stat-label">待消耗课时</div>
          </div>
          <div class="stat-details">
            <div class="detail-item">
              <span class="detail-label">预计消耗</span>
              <span class="detail-value">{{ summaryData.expectedConsumption }}%</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">风险预警</span>
              <span class="detail-value" :class="warningCount > 0 ? 'warning' : 'normal'">
                {{ warningCount }}个
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 课消趋势图 -->
      <div class="chart-section">
        <div class="chart-header">
          <h3>课消趋势</h3>
          <div class="chart-options">
            <select v-model="trendChartType" @change="updateDashboard">
              <option value="line">折线图</option>
              <option value="bar">柱状图</option>
            </select>
          </div>
        </div>
        <div class="chart-container">
          <div v-if="trendChartType === 'line'" class="line-chart">
            <div class="chart-grid">
              <div class="y-axis">
                <div 
                  v-for="tick in yAxisTicks" 
                  :key="tick.value"
                  class="y-axis-tick"
                  :style="{ bottom: (tick.percentage * 100) + '%' }"
                >
                  {{ tick.value }}
                </div>
              </div>
              <div class="chart-area">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline 
                    :points="lineChartPoints" 
                    fill="none" 
                    stroke="#667eea" 
                    stroke-width="2"
                  />
                  <path 
                    :d="areaPath"
                    fill="rgba(102, 126, 234, 0.1)"
                  />
                  <!-- 数据点 -->
                  <circle 
                    v-for="(point, index) in lineChartData" 
                    :key="index"
                    :cx="point.x"
                    :cy="point.y"
                    r="2"
                    fill="#667eea"
                  />
                </svg>
              </div>
            </div>
            <div class="x-axis">
              <div 
                v-for="(point, index) in lineChartData" 
                :key="index"
                class="x-axis-tick"
                :style="{ left: point.x + '%' }"
              >
                {{ point.label }}
              </div>
            </div>
          </div>
          
          <div v-else class="bar-chart">
            <div class="bar-chart-container">
              <div 
                v-for="(item, index) in barChartData" 
                :key="index"
                class="bar-group"
              >
                <div class="bar-wrapper">
                  <div 
                    class="bar" 
                    :style="{ height: (item.value / maxBarValue * 100) + '%' }"
                  >
                    <div class="bar-tooltip">{{ item.value }} 课时</div>
                  </div>
                </div>
                <div class="bar-label">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 课程课消分析 -->
      <div class="courses-analysis">
        <div class="section-header">
          <h3>课程课消分析</h3>
          <div class="view-options">
            <button 
              :class="['view-button', { active: courseViewMode === 'table' }]"
              @click="courseViewMode = 'table'"
            >
              表格视图
            </button>
            <button 
              :class="['view-button', { active: courseViewMode === 'cards' }]"
              @click="courseViewMode = 'cards'"
            >
              卡片视图
            </button>
          </div>
        </div>

        <!-- 表格视图 -->
        <div v-if="courseViewMode === 'table'" class="courses-table">
          <div class="table-header">
            <div class="header-cell">课程名称</div>
            <div class="header-cell">消耗课时</div>
            <div class="header-cell">计划课时</div>
            <div class="header-cell">完成率</div>
            <div class="header-cell">学员人数</div>
            <div class="header-cell">平均课时</div>
            <div class="header-cell">剩余课时</div>
            <div class="header-cell">操作</div>
          </div>
          <div class="table-body">
            <div 
              v-for="course in courseConsumptionData" 
              :key="course.id"
              class="table-row"
            >
              <div class="table-cell">
                <div class="course-name">{{ course.name }}</div>
                <div class="course-code">课程代码: {{ course.code }}</div>
              </div>
              <div class="table-cell">
                <div class="hours-consumed">{{ course.hoursConsumed }}</div>
              </div>
              <div class="table-cell">{{ course.plannedHours }}</div>
              <div class="table-cell">
                <div class="completion-rate">
                  <div class="rate-bar">
                    <div 
                      class="rate-fill" 
                      :style="{ width: course.completionRate + '%' }"
                      :class="getCompletionRateClass(course.completionRate)"
                    ></div>
                  </div>
                  <span class="rate-text">{{ course.completionRate }}%</span>
                </div>
              </div>
              <div class="table-cell">{{ course.studentCount }}</div>
              <div class="table-cell">{{ course.averageHoursPerStudent }}</div>
              <div class="table-cell">{{ course.remainingHours }}</div>
              <div class="table-cell">
                <button class="action-button small" @click="viewCourseDetails(course.id)">
                  详情
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 卡片视图 -->
        <div v-else class="courses-cards">
          <div 
            v-for="course in courseConsumptionData" 
            :key="course.id"
            class="course-card"
          >
            <div class="card-header">
              <div class="course-info">
                <h4 class="course-name">{{ course.name }}</h4>
                <span class="course-code">{{ course.code }}</span>
              </div>
              <div class="completion-badge" :class="getCompletionRateClass(course.completionRate)">
                {{ course.completionRate }}%
              </div>
            </div>
            <div class="card-body">
              <div class="progress-section">
                <div class="progress-labels">
                  <span>已消耗: {{ course.hoursConsumed }}课时</span>
                  <span>剩余: {{ course.remainingHours }}课时</span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: course.completionRate + '%' }"
                    :class="getCompletionRateClass(course.completionRate)"
                  ></div>
                </div>
              </div>
              <div class="metrics-section">
                <div class="metric">
                  <span class="metric-label">学员人数</span>
                  <span class="metric-value">{{ course.studentCount }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">平均课时</span>
                  <span class="metric-value">{{ course.averageHoursPerStudent }}</span>
                </div>
                <div class="metric">
                  <span class="metric-label">计划课时</span>
                  <span class="metric-value">{{ course.plannedHours }}</span>
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

      <!-- 学员课时消耗排行 -->
      <div class="students-ranking">
        <h3>学员课时消耗排行</h3>
        <div class="ranking-tabs">
          <button 
            :class="['tab-button', { active: rankingType === 'top' }]"
            @click="rankingType = 'top'"
          >
            消耗最多
          </button>
          <button 
            :class="['tab-button', { active: rankingType === 'low' }]"
            @click="rankingType = 'low'"
          >
            消耗最少
          </button>
        </div>
        
        <div class="ranking-list">
          <div 
            v-for="(student, index) in studentsRankingData" 
            :key="student.id"
            class="ranking-item"
          >
            <div class="rank-number" :class="getRankClass(index)">
              {{ index + 1 }}
            </div>
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-details">
                <span class="student-id">ID: {{ student.studentId }}</span>
                <span class="student-level">等级: {{ student.level }}</span>
                <span class="student-since">注册: {{ student.registerDate }}</span>
              </div>
            </div>
            <div class="student-stats">
              <div class="stat-item">
                <span class="stat-label">已消耗</span>
                <span class="stat-value hours">{{ student.hoursConsumed }}课时</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">剩余</span>
                <span class="stat-value remaining">{{ student.remainingHours }}课时</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">学习进度</span>
                <div class="progress-mini">
                  <div 
                    class="progress-fill" 
                    :style="{ width: student.progress + '%' }"
                    :class="getProgressClass(student.progress)"
                  ></div>
                </div>
                <span class="progress-text">{{ student.progress }}%</span>
              </div>
            </div>
            <div class="student-actions">
              <button class="action-button small" @click="viewStudentDetails(student.id)">
                查看
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 风险预警 -->
      <div class="warning-section">
        <h3>课时风险预警</h3>
        <div class="warning-stats">
          <div class="warning-stat-item">
            <div class="warning-icon">⚠️</div>
            <div class="warning-content">
              <div class="warning-value">{{ warningStats.lowActivityStudents }}</div>
              <div class="warning-label">低活跃度学员</div>
            </div>
          </div>
          <div class="warning-stat-item">
            <div class="warning-icon">⏰</div>
            <div class="warning-content">
              <div class="warning-value">{{ warningStats.expiringPackages }}</div>
              <div class="warning-label">即将过期套餐</div>
            </div>
          </div>
          <div class="warning-stat-item">
            <div class="warning-icon">📉</div>
            <div class="warning-content">
              <div class="warning-value">{{ warningStats.underperformingCourses }}</div>
              <div class="warning-label">低效课程</div>
            </div>
          </div>
          <div class="warning-stat-item">
            <div class="warning-icon">🔔</div>
            <div class="warning-content">
              <div class="warning-value">{{ warningStats.pendingRenewals }}</div>
              <div class="warning-label">待续费学员</div>
            </div>
          </div>
        </div>
        
        <div class="warning-details">
          <h4>低活跃度学员列表</h4>
          <div class="warning-table">
            <div class="table-header">
              <div class="header-cell">学员姓名</div>
              <div class="header-cell">学员ID</div>
              <div class="header-cell">最近上课</div>
              <div class="header-cell">剩余课时</div>
              <div class="header-cell">风险等级</div>
              <div class="header-cell">建议操作</div>
            </div>
            <div class="table-body">
              <div 
                v-for="student in lowActivityStudents" 
                :key="student.id"
                class="table-row"
              >
                <div class="table-cell">{{ student.name }}</div>
                <div class="table-cell">{{ student.studentId }}</div>
                <div class="table-cell">{{ formatDate(student.lastClassDate) }}</div>
                <div class="table-cell">{{ student.remainingHours }}</div>
                <div class="table-cell">
                  <span class="risk-badge" :class="getRiskLevelClass(student.riskLevel)">
                    {{ getRiskLevelText(student.riskLevel) }}
                  </span>
                </div>
                <div class="table-cell">
                  <button class="action-button small" @click="contactStudent(student.id)">
                    联系学员
                  </button>
                </div>
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
  name: 'TeacherHoursDashboard',
  setup() {
    const router = useRouter()
    
    // 筛选条件
    const selectedPeriod = ref('month')
    const customStartDate = ref('')
    const customEndDate = ref('')
    const selectedCourse = ref('all')
    const trendChartType = ref('line')
    const courseViewMode = ref('table')
    const rankingType = ref('top')
    
    // 可用课程
    const availableCourses = ref([
      { id: 1, name: '数据结构', code: 'CS201' },
      { id: 2, name: '算法分析', code: 'CS202' },
      { id: 3, name: '数据库原理', code: 'CS203' },
      { id: 4, name: '操作系统', code: 'CS301' },
      { id: 5, name: '计算机网络', code: 'CS302' }
    ])
    
    // 概览数据
    const summaryData = ref({
      totalHoursConsumed: 1680,
      plannedHours: 2000,
      completionRate: 84,
      activeStudents: 120,
      averageHoursPerStudent: 14,
      newStudents: 25,
      revenueGenerated: 84000,
      pricePerHour: 500,
      revenueGrowth: 12.5,
      pendingHours: 320,
      expectedConsumption: 95,
      riskLevel: 'normal'
    })
    
    // 折线图数据
    const lineChartData = ref([
      { label: '1月', value: 120 },
      { label: '2月', value: 150 },
      { label: '3月', value: 180 },
      { label: '4月', value: 160 },
      { label: '5月', value: 210 },
      { label: '6月', value: 240 },
      { label: '7月', value: 220 },
      { label: '8月', value: 250 },
      { label: '9月', value: 280 },
      { label: '10月', value: 300 },
      { label: '11月', value: 270 },
      { label: '12月', value: 320 }
    ])
    
    // 柱状图数据
    const barChartData = ref([
      { label: '第1周', value: 80 },
      { label: '第2周', value: 95 },
      { label: '第3周', value: 120 },
      { label: '第4周', value: 110 }
    ])
    
    // 课程课消数据
    const courseConsumptionData = ref([
      { id: 1, name: '数据结构', code: 'CS201', hoursConsumed: 320, plannedHours: 400, completionRate: 80, studentCount: 40, averageHoursPerStudent: 8, remainingHours: 80 },
      { id: 2, name: '算法分析', code: 'CS202', hoursConsumed: 280, plannedHours: 350, completionRate: 80, studentCount: 35, averageHoursPerStudent: 8, remainingHours: 70 },
      { id: 3, name: '数据库原理', code: 'CS203', hoursConsumed: 400, plannedHours: 500, completionRate: 80, studentCount: 50, averageHoursPerStudent: 8, remainingHours: 100 },
      { id: 4, name: '操作系统', code: 'CS301', hoursConsumed: 350, plannedHours: 400, completionRate: 87.5, studentCount: 45, averageHoursPerStudent: 7.8, remainingHours: 50 },
      { id: 5, name: '计算机网络', code: 'CS302', hoursConsumed: 330, plannedHours: 350, completionRate: 94.3, studentCount: 40, averageHoursPerStudent: 8.3, remainingHours: 20 }
    ])
    
    // 学员排名数据
    const studentsRankingData = ref([
      { id: 1, name: '张三', studentId: '2023001', level: 'VIP', registerDate: '2023-01-15', hoursConsumed: 45, remainingHours: 5, progress: 90 },
      { id: 2, name: '李四', studentId: '2023002', level: '高级', registerDate: '2023-02-20', hoursConsumed: 42, remainingHours: 8, progress: 84 },
      { id: 3, name: '王五', studentId: '2023003', level: '中级', registerDate: '2023-03-10', hoursConsumed: 40, remainingHours: 10, progress: 80 },
      { id: 4, name: '赵六', studentId: '2023004', level: 'VIP', registerDate: '2023-01-05', hoursConsumed: 38, remainingHours: 12, progress: 76 },
      { id: 5, name: '孙七', studentId: '2023005', level: '初级', registerDate: '2023-04-15', hoursConsumed: 35, remainingHours: 15, progress: 70 }
    ])
    
    // 风险预警数据
    const warningStats = ref({
      lowActivityStudents: 15,
      expiringPackages: 8,
      underperformingCourses: 2,
      pendingRenewals: 12
    })
    
    // 低活跃度学员
    const lowActivityStudents = ref([
      { id: 101, name: '陈晨', studentId: '2023050', lastClassDate: '2024-01-05', remainingHours: 30, riskLevel: 'high' },
      { id: 102, name: '林琳', studentId: '2023051', lastClassDate: '2024-01-10', remainingHours: 25, riskLevel: 'medium' },
      { id: 103, name: '黄华', studentId: '2023052', lastClassDate: '2024-01-12', remainingHours: 40, riskLevel: 'medium' },
      { id: 104, name: '刘洋', studentId: '2023053', lastClassDate: '2024-01-08', remainingHours: 15, riskLevel: 'high' },
      { id: 105, name: '周舟', studentId: '2023054', lastClassDate: '2024-01-15', remainingHours: 20, riskLevel: 'low' }
    ])
    
    // 计算属性
    const maxBarValue = computed(() => {
      return Math.max(...barChartData.value.map(item => item.value))
    })
    
    const warningCount = computed(() => {
      return warningStats.value.lowActivityStudents + warningStats.value.expiringPackages
    })
    
    // Y轴刻度
    const yAxisTicks = computed(() => {
      const maxValue = Math.max(...lineChartData.value.map(item => item.value))
      const step = Math.ceil(maxValue / 5)
      return Array.from({ length: 6 }, (_, i) => ({
        value: i * step,
        percentage: 1 - (i * step) / maxValue
      })).reverse()
    })
    
    // 折线图数据点
    const lineChartPoints = computed(() => {
      const maxValue = Math.max(...lineChartData.value.map(item => item.value))
      const stepX = 100 / (lineChartData.value.length - 1)
      
      return lineChartData.value.map((point, index) => {
        const x = index * stepX
        const y = 100 - (point.value / maxValue * 100)
        return `${x},${y}`
      }).join(' ')
    })
    
    // 区域填充路径
    const areaPath = computed(() => {
      const maxValue = Math.max(...lineChartData.value.map(item => item.value))
      const stepX = 100 / (lineChartData.value.length - 1)
      
      let points = lineChartData.value.map((point, index) => {
        const x = index * stepX
        const y = 100 - (point.value / maxValue * 100)
        return `${x},${y}`
      }).join(' ')
      
      // 添加底部两个点形成闭合区域
      points += ` 100,100 0,100`
      
      return `M ${points} Z`
    })
    
    // 获取完成率样式类
    const getCompletionRateClass = (rate) => {
      if (rate >= 90) return 'rate-excellent'
      if (rate >= 80) return 'rate-good'
      if (rate >= 70) return 'rate-average'
      return 'rate-poor'
    }
    
    // 获取排名样式类
    const getRankClass = (index) => {
      if (index === 0) return 'rank-gold'
      if (index === 1) return 'rank-silver'
      if (index === 2) return 'rank-bronze'
      return 'rank-normal'
    }
    
    // 获取进度样式类
    const getProgressClass = (progress) => {
      if (progress >= 90) return 'progress-excellent'
      if (progress >= 80) return 'progress-good'
      if (progress >= 70) return 'progress-average'
      return 'progress-poor'
    }
    
    // 获取风险等级样式类
    const getRiskLevelClass = (level) => {
      return `risk-${level}`
    }
    
    // 获取风险等级文本
    const getRiskLevelText = (level) => {
      const map = {
        high: '高风险',
        medium: '中风险',
        low: '低风险'
      }
      return map[level] || '未知'
    }
    
    // 更新仪表盘数据
    const updateDashboard = () => {
      // 在实际项目中，这里应该根据筛选条件调用API获取数据
      console.log('更新仪表盘数据', {
        period: selectedPeriod.value,
        startDate: customStartDate.value,
        endDate: customEndDate.value,
        courseId: selectedCourse.value
      })
    }
    
    // 重置筛选
    const resetFilters = () => {
      selectedPeriod.value = 'month'
      customStartDate.value = ''
      customEndDate.value = ''
      selectedCourse.value = 'all'
      updateDashboard()
    }
    
    // 导出数据
    const exportDashboardData = () => {
      alert('导出数据功能开发中...')
    }
    
    // 查看课程详情
    const viewCourseDetails = (courseId) => {
      router.push(`/home/teacher/course-details?id=${courseId}`)
    }
    
    // 查看学员详情
    const viewStudentDetails = (studentId) => {
      router.push(`/home/teacher/student-details?id=${studentId}`)
    }
    
    // 联系学员
    const contactStudent = (studentId) => {
      alert(`联系学员 ${studentId} 功能开发中...`)
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
      selectedCourse,
      trendChartType,
      courseViewMode,
      rankingType,
      availableCourses,
      summaryData,
      lineChartData,
      barChartData,
      courseConsumptionData,
      studentsRankingData,
      warningStats,
      lowActivityStudents,
      maxBarValue,
      warningCount,
      yAxisTicks,
      lineChartPoints,
      areaPath,
      getCompletionRateClass,
      getRankClass,
      getProgressClass,
      getRiskLevelClass,
      getRiskLevelText,
      updateDashboard,
      resetFilters,
      exportDashboardData,
      viewCourseDetails,
      viewStudentDetails,
      contactStudent,
      formatDate,
      goBack
    }
  }
}
</script>

<style scoped>
.teacher-hours-dashboard {
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

.dashboard-container {
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 100px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.detail-label {
  font-size: 12px;
  color: #999;
}

.detail-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.growth-positive {
  color: #2e7d32;
}

.growth-negative {
  color: #c62828;
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

.chart-options select {
  padding: 8px 12px;
  border: 1px solid #e0e2e5;
  border-radius: 6px;
  font-size: 14px;
}

.chart-container {
  height: 350px;
  position: relative;
}

/* 折线图 */
.line-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-grid {
  flex: 1;
  display: flex;
  position: relative;
  margin-bottom: 20px;
}

.y-axis {
  width: 50px;
  position: relative;
}

.y-axis-tick {
  position: absolute;
  right: 10px;
  font-size: 12px;
  color: #999;
  transform: translateY(50%);
}

.chart-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid #e0e2e5;
  border-right: 1px solid #e0e2e5;
}

.chart-area svg {
  width: 100%;
  height: 100%;
}

.x-axis {
  display: flex;
  height: 20px;
}

.x-axis-tick {
  position: absolute;
  font-size: 12px;
  color: #999;
  transform: translateX(-50%);
  text-align: center;
  width: 40px;
}

/* 柱状图 */
.bar-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.bar-chart-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding: 20px;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  align-items: flex-end;
  width: 100%;
  min-height: 100px;
}

.bar {
  width: 40px;
  background-color: #667eea;
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

.bar-label {
  font-size: 12px;
  color: #666;
  margin-top: 10px;
}

/* 课程课消分析 */
.courses-analysis {
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
.courses-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
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
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
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

.completion-rate {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rate-bar {
  flex: 1;
  height: 8px;
  background-color: #e0e2e5;
  border-radius: 4px;
  overflow: hidden;
  min-width: 60px;
}

.rate-fill {
  height: 100%;
  border-radius: 4px;
}

.rate-text {
  font-size: 12px;
  font-weight: 600;
  min-width: 40px;
}

.rate-excellent {
  background-color: #48bb78;
}

.rate-good {
  background-color: #4299e1;
}

.rate-average {
  background-color: #ed8936;
}

.rate-poor {
  background-color: #f56565;
}

/* 卡片视图 */
.courses-cards {
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.course-info h4 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
}

.completion-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.card-body {
  padding: 20px;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.progress-bar {
  height: 8px;
  background-color: #e0e2e5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.card-footer {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  text-align: right;
}

/* 学员排名 */
.students-ranking {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.students-ranking h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.ranking-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.tab-button {
  padding: 10px 20px;
  border: 1px solid #e0e2e5;
  background-color: white;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button.active {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.ranking-item:hover {
  background-color: #e9ecef;
}

.rank-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.rank-gold {
  background-color: #ffb400;
}

.rank-silver {
  background-color: #cbd5e0;
}

.rank-bronze {
  background-color: #ed8936;
}

.rank-normal {
  background-color: #667eea;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.student-details {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.student-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value.hours {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.stat-value.remaining {
  font-size: 16px;
  font-weight: 600;
  color: #718096;
}

.progress-mini {
  width: 60px;
  height: 6px;
  background-color: #e0e2e5;
  border-radius: 3px;
  overflow: hidden;
  margin: 5px 0;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

/* 风险预警 */
.warning-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.warning-section h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
}

.warning-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.warning-stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background-color: #fff5f5;
  border-radius: 8px;
  border: 1px solid #fed7d7;
}

.warning-icon {
  font-size: 32px;
}

.warning-content {
  flex: 1;
}

.warning-value {
  font-size: 24px;
  font-weight: 700;
  color: #c53030;
}

.warning-label {
  font-size: 14px;
  color: #742a2a;
}

.warning-details h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
}

.warning-table .table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.warning-table .table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f2f5;
  align-items: center;
}

.risk-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.risk-high {
  background-color: #fed7d7;
  color: #c53030;
}

.risk-medium {
  background-color: #feebc8;
  color: #c05621;
}

.risk-low {
  background-color: #e6fffa;
  color: #285e61;
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
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-details {
    flex-direction: row;
    justify-content: space-around;
    width: 100%;
  }
  
  .detail-item {
    text-align: center;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .table-header,
  .table-row,
  .warning-table .table-header,
  .warning-table .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .courses-cards {
    grid-template-columns: 1fr;
  }
  
  .metrics-section {
    grid-template-columns: 1fr;
  }
  
  .ranking-item {
    flex-direction: column;
    text-align: center;
  }
  
  .student-stats {
    width: 100%;
    justify-content: space-around;
  }
  
  .warning-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .chart-container {
    height: 250px;
  }
  
  .y-axis {
    width: 40px;
  }
  
  .y-axis-tick {
    font-size: 10px;
  }
  
  .x-axis-tick {
    font-size: 10px;
    width: 30px;
  }
  
  .student-details {
    flex-direction: column;
    gap: 5px;
  }
  
  .student-stats {
    flex-direction: column;
    gap: 15px;
  }
}
</style>