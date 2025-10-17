<template>
  <div class="grade-analysis">
    <div class="analysis-header">
      <router-link to="/home/student/dashboard" class="back-button">
        <span>← 返回仪表盘</span>
      </router-link>
      <h2>成绩分析</h2>
    </div>
    
    <!-- 整体成绩概览卡片 -->
    <div class="overview-card">
      <h3>成绩概览</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ overallStats.average }}</div>
          <div class="stat-label">平均成绩</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ overallStats.highest }}</div>
          <div class="stat-label">最高成绩</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ overallStats.lowest }}</div>
          <div class="stat-label">最低成绩</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ overallStats.passRate }}%</div>
          <div class="stat-label">及格率</div>
        </div>
      </div>
    </div>
    
    <!-- 各科成绩雷达图 -->
    <div class="radar-chart-card">
      <h3>各科成绩对比</h3>
      <div class="chart-container">
        <div v-if="!chartData" class="chart-placeholder">暂无足够数据生成图表</div>
        <canvas v-else ref="radarChart"></canvas>
      </div>
    </div>
    
    <!-- 成绩趋势图 -->
    <div class="trend-chart-card">
      <h3>成绩趋势</h3>
      <div class="chart-container">
        <div v-if="!trendData.length" class="chart-placeholder">暂无足够数据生成图表</div>
        <canvas v-else ref="trendChart"></canvas>
      </div>
    </div>
    
    <!-- 详细成绩表格 -->
    <div class="grades-table-card">
      <h3>详细成绩记录</h3>
      <div class="table-responsive">
        <table class="grades-table">
          <thead>
            <tr>
              <th>课程名称</th>
              <th>考试类型</th>
              <th>分数</th>
              <th>等级</th>
              <th>考试日期</th>
              <th>教师评价</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="grade in allGrades" :key="`${grade.course_id}-${grade.exam_type}`">
              <td>{{ grade.course_name }}</td>
              <td>{{ grade.exam_type_text }}</td>
              <td :class="getGradeClass(grade.score_value)">{{ grade.score_value }}</td>
              <td>{{ getGradeLevel(grade.score_value) }}</td>
              <td>{{ grade.exam_date }}</td>
              <td>{{ grade.remarks || '无' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="allGrades.length === 0" class="empty-state">
          <p>暂无成绩记录</p>
        </div>
      </div>
    </div>
    
    <!-- 薄弱科目分析 -->
    <div class="weak-subjects-card">
      <h3>薄弱科目分析</h3>
      <div v-if="weakSubjects.length > 0" class="subjects-list">
        <div v-for="subject in weakSubjects" :key="subject.course_id" class="subject-card">
          <div class="subject-header">
            <h4>{{ subject.course_name }}</h4>
            <span class="subject-score">{{ subject.score_value }}</span>
          </div>
          <div class="subject-analysis">
            <p>{{ getWeakSubjectAnalysis(subject) }}</p>
          </div>
          <div class="improvement-tips">
            <h5>改进建议：</h5>
            <ul>
              <li>{{ getImprovementTips(subject)[0] }}</li>
              <li>{{ getImprovementTips(subject)[1] }}</li>
            </ul>
          </div>
        </div>
      </div>
      <div v-else class="no-weak-subjects">
        <p>所有科目表现良好，继续保持！</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { userState } from '../store/index.js'

// 动态导入 Chart.js
let Chart = null

const loadChartJS = async () => {
  if (!Chart) {
    try {
      const ChartModule = await import('chart.js/auto')
      Chart = ChartModule.default || ChartModule
    } catch (error) {
      console.error('Failed to load Chart.js:', error)
    }
  }
  return Chart
}

export default {
  name: 'GradeAnalysis',
  setup() {
    const radarChart = ref(null)
    const trendChart = ref(null)
    let radarChartInstance = null
    let trendChartInstance = null
    
    // 获取所有成绩数据
    const allGrades = computed(() => {
      const mockData = userState.mockData
      if (!mockData || !mockData.scores) {
        return generateMockGrades()
      }
      return mockData.scores
    })
    
    // 计算整体统计数据
    const overallStats = computed(() => {
      const grades = allGrades.value
      if (grades.length === 0) {
        return {
          average: 0,
          highest: 0,
          lowest: 0,
          passRate: 0
        }
      }
      
      const scores = grades.map(g => g.score_value)
      const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      const highest = Math.max(...scores)
      const lowest = Math.min(...scores)
      const passedCount = scores.filter(s => s >= 60).length
      const passRate = Math.round((passedCount / scores.length) * 100)
      
      return {
        average,
        highest,
        lowest,
        passRate
      }
    })
    
    // 准备雷达图数据
    const chartData = computed(() => {
      const grades = allGrades.value
      if (grades.length === 0) return null
      
      // 按课程分组，计算每门课程的平均分
      const courseScores = {}
      grades.forEach(grade => {
        if (!courseScores[grade.course_name]) {
          courseScores[grade.course_name] = []
        }
        courseScores[grade.course_name].push(grade.score_value)
      })
      
      const labels = Object.keys(courseScores)
      const data = labels.map(course => {
        const courseGrade = courseScores[course]
        return Math.round(courseGrade.reduce((a, b) => a + b, 0) / courseGrade.length)
      })
      
      return {
        labels,
        data
      }
    })
    
    // 准备趋势图数据
    const trendData = computed(() => {
      const grades = [...allGrades.value]
      if (grades.length === 0) return []
      
      // 按日期排序
      grades.sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
      
      // 按日期分组，计算每日平均分
      const dailyScores = {}
      grades.forEach(grade => {
        if (!dailyScores[grade.exam_date]) {
          dailyScores[grade.exam_date] = []
        }
        dailyScores[grade.exam_date].push(grade.score_value)
      })
      
      return Object.entries(dailyScores).map(([date, scores]) => ({
        date,
        average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      }))
    })
    
    // 识别薄弱科目
    const weakSubjects = computed(() => {
      const grades = allGrades.value
      if (grades.length === 0) return []
      
      // 筛选分数低于70的成绩
      return grades.filter(g => g.score_value < 70).sort((a, b) => a.score_value - b.score_value)
    })
    
    // 获取成绩样式类
    const getGradeClass = (score) => {
      if (score >= 90) return 'grade-excellent'
      if (score >= 80) return 'grade-good'
      if (score >= 60) return 'grade-pass'
      return 'grade-fail'
    }
    
    // 获取成绩等级
    const getGradeLevel = (score) => {
      if (score >= 90) return '优秀'
      if (score >= 80) return '良好'
      if (score >= 70) return '中等'
      if (score >= 60) return '及格'
      return '不及格'
    }
    
    // 获取薄弱科目分析
    const getWeakSubjectAnalysis = (subject) => {
      const score = subject.score_value
      if (score < 60) {
        return `${subject.course_name}课程的成绩未达到及格线，需要重点关注该科目的学习。`
      } else {
        return `${subject.course_name}课程的成绩处于及格边缘，有较大的提升空间。`
      }
    }
    
    // 获取改进建议
    const getImprovementTips = (subject) => {
      const tips = [
        '建议与任课老师沟通，找出具体的薄弱环节',
        '增加该科目的学习时间，重点复习基础知识',
        '参加相关的辅导课程或学习小组',
        '多做练习题，巩固知识点',
        '制定详细的学习计划，循序渐进地提升'
      ]
      
      // 随机选择两条建议
      const selectedTips = []
      while (selectedTips.length < 2) {
        const index = Math.floor(Math.random() * tips.length)
        if (!selectedTips.includes(tips[index])) {
          selectedTips.push(tips[index])
        }
      }
      
      return selectedTips
    }
    
    // 生成模拟成绩数据
    const generateMockGrades = () => {
      return [
        {
          course_id: 1,
          course_name: '数据结构',
          exam_type: 'midterm',
          exam_type_text: '期中考试',
          score_value: 85,
          exam_date: '2023-10-15',
          remarks: '表现良好，继续加油！'
        },
        {
          course_id: 1,
          course_name: '数据结构',
          exam_type: 'quiz',
          exam_type_text: '课堂测验',
          score_value: 92,
          exam_date: '2023-09-25',
          remarks: '优秀！'
        },
        {
          course_id: 2,
          course_name: '操作系统',
          exam_type: 'midterm',
          exam_type_text: '期中考试',
          score_value: 78,
          exam_date: '2023-10-10',
          remarks: '基础掌握较好，但需要加强练习'
        },
        {
          course_id: 3,
          course_name: '计算机网络',
          exam_type: 'assignment',
          exam_type_text: '课后作业',
          score_value: 88,
          exam_date: '2023-09-30',
          remarks: '作业完成质量较高'
        },
        {
          course_id: 4,
          course_name: '数据库原理',
          exam_type: 'midterm',
          exam_type_text: '期中考试',
          score_value: 65,
          exam_date: '2023-10-12',
          remarks: '及格，需要加强理解概念'
        },
        {
          course_id: 5,
          course_name: '软件工程',
          exam_type: 'quiz',
          exam_type_text: '课堂测验',
          score_value: 72,
          exam_date: '2023-10-05',
          remarks: '基本掌握，仍有提升空间'
        }
      ]
    }
    
    // 初始化雷达图
    const initRadarChart = async () => {
      if (!chartData.value || !radarChart.value) return
      
      await loadChartJS()
      
      if (!Chart) return
      
      // 销毁现有图表
      if (radarChartInstance) {
        radarChartInstance.destroy()
      }
      
      const ctx = radarChart.value.getContext('2d')
      radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: chartData.value.labels,
          datasets: [{
            label: '平均成绩',
            data: chartData.value.data,
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(102, 126, 234, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 20
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `成绩: ${context.parsed.r}`
                }
              }
            }
          }
        }
      })
    }
    
    // 初始化趋势图
    const initTrendChart = async () => {
      if (!trendData.value.length || !trendChart.value) return
      
      await loadChartJS()
      
      if (!Chart) return
      
      // 销毁现有图表
      if (trendChartInstance) {
        trendChartInstance.destroy()
      }
      
      const ctx = trendChart.value.getContext('2d')
      trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trendData.value.map(item => item.date),
          datasets: [{
            label: '平均成绩',
            data: trendData.value.map(item => item.average),
            fill: true,
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2,
            tension: 0.4,
            pointBackgroundColor: 'rgba(102, 126, 234, 1)',
            pointBorderColor: '#fff',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              min: 0,
              max: 100,
              ticks: {
                stepSize: 20
              },
              title: {
                display: true,
                text: '成绩'
              }
            },
            x: {
              title: {
                display: true,
                text: '日期'
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `平均成绩: ${context.parsed.y}`
                }
              }
            }
          }
        }
      })
    }
    
    // 监听窗口大小变化
    const handleResize = () => {
      initRadarChart()
      initTrendChart()
    }
    
    onMounted(() => {
      // 等待DOM渲染完成后初始化图表
      setTimeout(() => {
        initRadarChart()
        initTrendChart()
      }, 100)
      
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      
      // 销毁图表实例
      if (radarChartInstance) {
        radarChartInstance.destroy()
      }
      if (trendChartInstance) {
        trendChartInstance.destroy()
      }
    })
    
    return {
      radarChart,
      trendChart,
      allGrades,
      overallStats,
      chartData,
      trendData,
      weakSubjects,
      getGradeClass,
      getGradeLevel,
      getWeakSubjectAnalysis,
      getImprovementTips
    }
  }
}
</script>

<style scoped>
.grade-analysis {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.analysis-header {
  margin-bottom: 30px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  margin-bottom: 15px;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.back-button:hover {
  color: #5a67d8;
}

.analysis-header h2 {
  color: #333;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.overview-card,
.radar-chart-card,
.trend-chart-card,
.grades-table-card,
.weak-subjects-card {
  background-color: #fafbfc;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.overview-card h3,
.radar-chart-card h3,
.trend-chart-card h3,
.grades-table-card h3,
.weak-subjects-card h3 {
  color: #555;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 2px solid #e1e8ed;
  padding-bottom: 10px;
}

/* 统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 10px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

/* 图表容器样式 */
.chart-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  height: 400px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.chart-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-style: italic;
}

/* 表格样式 */
.table-responsive {
  background-color: white;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.grades-table {
  width: 100%;
  border-collapse: collapse;
}

.grades-table th,
.grades-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
}

.grades-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
  white-space: nowrap;
}

.grades-table tr:last-child td {
  border-bottom: none;
}

.grades-table tr:hover {
  background-color: #f8f9fa;
}

/* 成绩样式 */
.grade-excellent {
  color: #4caf50;
  font-weight: 600;
}

.grade-good {
  color: #2196f3;
  font-weight: 600;
}

.grade-pass {
  color: #ff9800;
  font-weight: 600;
}

.grade-fail {
  color: #f44336;
  font-weight: 600;
}

/* 薄弱科目样式 */
.subjects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.subject-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #f44336;
}

.subject-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.subject-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.subject-score {
  color: #f44336;
  font-weight: 600;
  font-size: 20px;
}

.subject-analysis p {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
}

.improvement-tips h5 {
  color: #555;
  margin-bottom: 10px;
  font-size: 14px;
}

.improvement-tips ul {
  margin: 0;
  padding-left: 20px;
}

.improvement-tips li {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
  line-height: 1.5;
}

/* 空状态样式 */
.empty-state,
.no-weak-subjects {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}

.no-weak-subjects {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grade-analysis {
    padding: 15px;
  }
  
  .analysis-header h2 {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .subjects-list {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 300px;
    padding: 15px;
  }
  
  .grades-table th,
  .grades-table td {
    padding: 10px;
    font-size: 14px;
  }
  
  .overview-card,
  .radar-chart-card,
  .trend-chart-card,
  .grades-table-card,
  .weak-subjects-card {
    padding: 20px;
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .grade-analysis {
    padding: 10px;
  }
  
  .overview-card,
  .radar-chart-card,
  .trend-chart-card,
  .grades-table-card,
  .weak-subjects-card {
    padding: 15px;
  }
  
  .chart-container {
    height: 250px;
    padding: 10px;
  }
  
  .stat-value {
    font-size: 28px;
  }
}
</style>