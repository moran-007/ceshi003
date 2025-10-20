<template>
  <div class="grades-container">
    <el-card class="grades-card">
      <template #header>
        <div class="card-header">
          <span>成绩查询</span>
          <el-select v-model="selectedTerm" placeholder="选择学期" @change="handleTermChange">
            <el-option
              v-for="term in availableTerms"
              :key="term.value"
              :label="term.label"
              :value="term.value"
            ></el-option>
          </el-select>
        </div>
      </template>

      <!-- 成绩统计卡片 -->
      <div class="stats-container">
        <el-card class="stats-card">
          <el-row :gutter="20">
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-item">
                <div class="stat-value">{{ totalCourses }}</div>
                <div class="stat-label">课程总数</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-item primary">
                <div class="stat-value">{{ averageScore.toFixed(2) }}</div>
                <div class="stat-label">平均成绩</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-item success">
                <div class="stat-value">{{ excellentCourses }}</div>
                <div class="stat-label">优秀课程</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-item warning">
                <div class="stat-value">{{ failedCourses }}</div>
                <div class="stat-label">待及格</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>

      <!-- 搜索和筛选区域 -->
      <el-card class="search-filter-card" shadow="never">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="课程名称">
            <el-input v-model="searchForm.courseName" placeholder="请输入课程名称"></el-input>
          </el-form-item>
          <el-form-item label="成绩范围">
            <el-select v-model="searchForm.scoreRange" placeholder="选择成绩范围">
              <el-option label="全部" value="all"></el-option>
              <el-option label="优秀 (90-100)" value="excellent"></el-option>
              <el-option label="良好 (80-89)" value="good"></el-option>
              <el-option label="中等 (70-79)" value="medium"></el-option>
              <el-option label="及格 (60-69)" value="pass"></el-option>
              <el-option label="不及格 (<60)" value="fail"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="成绩类型">
            <el-select v-model="searchForm.scoreType" placeholder="选择成绩类型">
              <el-option label="全部" value="all"></el-option>
              <el-option label="考试" value="exam"></el-option>
              <el-option label="考查" value="assessment"></el-option>
              <el-option label="实验" value="experiment"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 成绩列表 -->
      <el-card class="grades-list-card">
        <el-table :data="filteredGrades" style="width: 100%">
          <el-table-column prop="courseName" label="课程名称" min-width="200"></el-table-column>
          <el-table-column prop="courseCode" label="课程代码" width="120"></el-table-column>
          <el-table-column prop="credit" label="学分" width="80"></el-table-column>
          <el-table-column prop="scoreType" label="成绩类型" width="100">
            <template #default="scope">
              <el-tag :type="getScoreTypeTagType(scope.row.scoreType)">
                {{ getScoreTypeText(scope.row.scoreType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="总成绩" width="100">
            <template #default="scope">
              <span :class="{ 'failed-score': scope.row.score < 60, 'excellent-score': scope.row.score >= 90 }">
                {{ scope.row.score }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="等级" width="80">
            <template #default="scope">
              <el-tag :type="getLevelTagType(scope.row.level)">
                {{ scope.row.level }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="teacher" label="任课教师" width="120"></el-table-column>
          <el-table-column prop="examDate" label="考试日期" width="150"></el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button-group>
                <el-button type="primary" size="small" @click="viewCourseDetails(scope.row)">详情</el-button>
                <el-button type="success" size="small" @click="viewScoreDetails(scope.row)">成绩明细</el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredGrades.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </el-card>

      <!-- 成绩分析图表 -->
      <div class="analysis-container">
        <el-card class="analysis-card">
          <template #header>
            <div class="analysis-header">
              <span>成绩分析</span>
            </div>
          </template>

          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <div class="chart-card">
                <h4>成绩分布</h4>
                <div class="chart-placeholder">
                  <el-icon class="chart-icon"><PieChart /></el-icon>
                  <p>成绩分布饼图</p>
                  <p>（此处应显示实际成绩分布图表）</p>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <div class="chart-card">
                <h4>各课程成绩</h4>
                <div class="chart-placeholder">
                  <el-icon class="chart-icon"><Histogram /></el-icon>
                  <p>课程成绩柱状图</p>
                  <p>（此处应显示实际课程成绩图表）</p>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </el-card>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="showCourseDetailsDialog"
      title="课程详情"
      width="60%"
      :before-close="handleCloseCourseDetailsDialog"
    >
      <div v-if="selectedGrade" class="course-details">
        <el-descriptions border :column="{ xs: 1, sm: 2 }">
          <el-descriptions-item label="课程名称">{{ selectedGrade.courseName }}</el-descriptions-item>
          <el-descriptions-item label="课程代码">{{ selectedGrade.courseCode }}</el-descriptions-item>
          <el-descriptions-item label="学分">{{ selectedGrade.credit }}</el-descriptions-item>
          <el-descriptions-item label="成绩类型">{{ getScoreTypeText(selectedGrade.scoreType) }}</el-descriptions-item>
          <el-descriptions-item label="总学时">{{ selectedGrade.totalHours }}</el-descriptions-item>
          <el-descriptions-item label="上课地点">{{ selectedGrade.location }}</el-descriptions-item>
          <el-descriptions-item label="任课教师">{{ selectedGrade.teacher }}</el-descriptions-item>
          <el-descriptions-item label="考试日期">{{ selectedGrade.examDate }}</el-descriptions-item>
          <el-descriptions-item label="总成绩">{{ selectedGrade.score }}</el-descriptions-item>
          <el-descriptions-item label="等级">{{ selectedGrade.level }}</el-descriptions-item>
          <el-descriptions-item label="课程描述" :span="2">{{ selectedGrade.description }}</el-descriptions-item>
        </el-descriptions>

        <div class="dialog-footer">
          <el-button @click="handleCloseCourseDetailsDialog">关闭</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 成绩明细对话框 -->
    <el-dialog
      v-model="showScoreDetailsDialog"
      title="成绩明细"
      width="60%"
      :before-close="handleCloseScoreDetailsDialog"
    >
      <div v-if="selectedGrade" class="score-details">
        <h3>{{ selectedGrade.courseName }} - 成绩构成</h3>
        
        <el-card class="score-breakdown-card">
          <el-table :data="selectedGrade.scoreDetails" style="width: 100%">
            <el-table-column prop="itemName" label="成绩项" width="150"></el-table-column>
            <el-table-column prop="weight" label="权重" width="100">
              <template #default="scope">
                {{ scope.row.weight }}%
              </template>
            </el-table-column>
            <el-table-column prop="score" label="得分" width="100"></el-table-column>
            <el-table-column prop="maxScore" label="满分" width="100"></el-table-column>
            <el-table-column prop="contribution" label="贡献分" width="100">
              <template #default="scope">
                {{ scope.row.contribution }}
              </template>
            </el-table-column>
            <el-table-column prop="comment" label="备注"></el-table-column>
          </el-table>
        </el-card>

        <div class="final-score">
          <el-card class="final-score-card">
            <div class="final-score-content">
              <div class="final-score-label">最终总成绩：</div>
              <div class="final-score-value" :class="{ 'failed-score': selectedGrade.score < 60, 'excellent-score': selectedGrade.score >= 90 }">
                {{ selectedGrade.score }}
              </div>
              <div class="final-score-level">
                <el-tag :type="getLevelTagType(selectedGrade.level)">
                  {{ selectedGrade.level }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>

        <div v-if="selectedGrade.comment" class="teacher-comment">
          <el-card class="comment-card">
            <template #header>
              <div class="comment-header">
                <span>教师评语</span>
              </div>
            </template>
            <div class="comment-content">{{ selectedGrade.comment }}</div>
          </el-card>
        </div>

        <div class="dialog-footer">
          <el-button @click="handleCloseScoreDetailsDialog">关闭</el-button>
          <el-button type="primary" @click="exportScoreDetails">导出成绩明细</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { PieChart, Histogram } from '@element-plus/icons-vue'
import api from '../../services/axios'

export default {
  name: 'StudentGrades',
  components: {
    PieChart,
    Histogram
  },
  data() {
    return {
      selectedTerm: '2025-1',
      currentPage: 1,
      pageSize: 10,
      loading: false,
      searchForm: {
        courseName: '',
        scoreRange: 'all',
        scoreType: 'all'
      },
      showCourseDetailsDialog: false,
      showScoreDetailsDialog: false,
      selectedGrade: null,
      // 可用学期选项
      availableTerms: [
        { label: '2025-1学期', value: '2025-1' },
        { label: '2024-2学期', value: '2024-2' },
        { label: '2024-1学期', value: '2024-1' },
        { label: '2023-2学期', value: '2023-2' }
      ],
      grades: []
    }
  },
  mounted() {
    this.loadGrades()
  },
  computed: {
    filteredGrades() {
      let filtered = [...this.grades]

      // 按课程名称搜索
      if (this.searchForm.courseName) {
        filtered = filtered.filter(grade => 
          grade.courseName.toLowerCase().includes(this.searchForm.courseName.toLowerCase())
        )
      }

      // 按成绩范围筛选
      if (this.searchForm.scoreRange !== 'all') {
        switch (this.searchForm.scoreRange) {
          case 'excellent':
            filtered = filtered.filter(grade => grade.score >= 90)
            break
          case 'good':
            filtered = filtered.filter(grade => grade.score >= 80 && grade.score < 90)
            break
          case 'medium':
            filtered = filtered.filter(grade => grade.score >= 70 && grade.score < 80)
            break
          case 'pass':
            filtered = filtered.filter(grade => grade.score >= 60 && grade.score < 70)
            break
          case 'fail':
            filtered = filtered.filter(grade => grade.score < 60)
            break
        }
      }

      // 按成绩类型筛选
      if (this.searchForm.scoreType !== 'all') {
        filtered = filtered.filter(grade => grade.scoreType === this.searchForm.scoreType)
      }

      return filtered
    },
    totalCourses() {
      return this.grades.length
    },
    averageScore() {
      if (this.grades.length === 0) return 0
      const totalScore = this.grades.reduce((sum, grade) => sum + grade.score, 0)
      return totalScore / this.grades.length
    },
    excellentCourses() {
      return this.grades.filter(grade => grade.score >= 90).length
    },
    failedCourses() {
      return this.grades.filter(grade => grade.score < 60).length
    }
  },
  methods: {
    async loadGrades() {
      this.loading = true
      try {
        // 构建查询参数
        const params = {
          term: this.selectedTerm,
          page: this.currentPage,
          pageSize: this.pageSize,
          courseName: this.searchForm.courseName,
          scoreRange: this.searchForm.scoreRange !== 'all' ? this.searchForm.scoreRange : undefined,
          scoreType: this.searchForm.scoreType !== 'all' ? this.searchForm.scoreType : undefined
        }
        
        // 从后端API获取成绩数据
        const response = await api.get('/student/grades', { params })
        
        if (response.data && response.data.success) {
          this.grades = response.data.data.grades || []
          // 确保所有成绩对象都有必要的属性
          this.grades = this.grades.map(grade => ({
            ...grade,
            scoreDetails: grade.scoreDetails || [],
            comment: grade.comment || '',
            level: grade.level || this.calculateLevel(grade.score)
          }))
        } else {
          throw new Error('获取成绩数据失败')
        }
      } catch (error) {
        console.error('加载成绩数据失败:', error)
        this.$message.error('加载成绩数据失败，请检查网络连接或稍后重试')
        // 不再使用模拟数据，保持数据为空以显示实际结果
        this.grades = []
      } finally {
        this.loading = false
      }
    },
    // 模拟数据作为后备方案
    useMockData() {
      this.grades = [
        {
          id: 1,
          courseName: '高等数学',
          courseCode: 'MATH101',
          credit: 5,
          scoreType: 'exam',
          score: 85,
          level: '良好',
          teacher: '张老师',
          examDate: '2025-01-15',
          totalHours: 64,
          location: '教学楼A301',
          description: '本课程主要讲述微积分的基本概念、理论和方法，是理工科学生的重要基础课程。',
          scoreDetails: [
            { itemName: '平时作业', weight: 20, score: 90, maxScore: 100, contribution: 18, comment: '完成质量较高' },
            { itemName: '期中考试', weight: 30, score: 80, maxScore: 100, contribution: 24, comment: '基础扎实，但部分题目解答不完整' },
            { itemName: '期末考试', weight: 50, score: 86, maxScore: 100, contribution: 43, comment: '发挥良好' }
          ],
          comment: '该生学习态度认真，基础扎实，有较好的分析问题能力。'
        },
        {
          id: 2,
          courseName: '大学物理',
          courseCode: 'PHYS101',
          credit: 4,
          scoreType: 'exam',
          score: 78,
          level: '中等',
          teacher: '李老师',
          examDate: '2025-01-18',
          totalHours: 56,
          location: '实验楼B202',
          description: '本课程主要介绍物理学的基本概念和原理，包括力学、热学、电磁学等内容。',
          scoreDetails: [
            { itemName: '平时作业', weight: 15, score: 85, maxScore: 100, contribution: 12.75, comment: '完成情况良好' },
            { itemName: '实验成绩', weight: 25, score: 80, maxScore: 100, contribution: 20, comment: '实验操作规范' },
            { itemName: '期末考试', weight: 60, score: 76, maxScore: 100, contribution: 45.6, comment: '需要加强对概念的理解' }
          ]
        },
        {
          id: 3,
          courseName: '计算机基础',
          courseCode: 'COMP101',
          credit: 3,
          scoreType: 'assessment',
          score: 92,
          level: '优秀',
          teacher: '王老师',
          examDate: '不适用',
          totalHours: 48,
          location: '机房C401',
          description: '本课程主要介绍计算机基础知识、操作系统使用、办公软件应用等内容。',
          scoreDetails: [
            { itemName: '平时表现', weight: 20, score: 95, maxScore: 100, contribution: 19, comment: '课堂参与积极' },
            { itemName: '实操考核', weight: 30, score: 90, maxScore: 100, contribution: 27, comment: '操作熟练' },
            { itemName: '项目作业', weight: 50, score: 92, maxScore: 100, contribution: 46, comment: '项目完成质量高' }
          ],
          comment: '该生在计算机操作和应用方面表现突出，学习能力强。'
        },
        {
          id: 4,
          courseName: '英语',
          courseCode: 'ENGL101',
          credit: 4,
          scoreType: 'exam',
          score: 65,
          level: '及格',
          teacher: '陈老师',
          examDate: '2025-01-12',
          totalHours: 64,
          location: '教学楼A203',
          description: '本课程主要提高学生的英语听、说、读、写能力，培养英语综合应用能力。',
          scoreDetails: [
            { itemName: '平时成绩', weight: 20, score: 70, maxScore: 100, contribution: 14, comment: '课堂表现一般' },
            { itemName: '听力测试', weight: 20, score: 60, maxScore: 100, contribution: 12, comment: '需要加强听力练习' },
            { itemName: '笔试成绩', weight: 60, score: 65, maxScore: 100, contribution: 39, comment: '语法掌握较好，但阅读理解能力有待提高' }
          ]
        },
        {
          id: 5,
          courseName: '程序设计基础',
          courseCode: 'COMP102',
          credit: 4,
          scoreType: 'experiment',
          score: 58,
          level: '不及格',
          teacher: '赵老师',
          examDate: '2025-01-20',
          totalHours: 64,
          location: '机房C302',
          description: '本课程主要介绍程序设计的基本概念和方法，培养学生的编程能力和解决问题能力。',
          scoreDetails: [
            { itemName: '平时作业', weight: 25, score: 65, maxScore: 100, contribution: 16.25, comment: '部分作业未按时完成' },
            { itemName: '实验项目', weight: 35, score: 55, maxScore: 100, contribution: 19.25, comment: '实验报告不够规范' },
            { itemName: '期末项目', weight: 40, score: 57, maxScore: 100, contribution: 22.8, comment: '项目功能实现不完整' }
          ],
          comment: '该生需要加强编程练习，建议参加补考。'
        }
      ]
    },
    // 根据分数计算等级
    calculateLevel(score) {
      if (score >= 90) return '优秀'
      if (score >= 80) return '良好'
      if (score >= 70) return '中等'
      if (score >= 60) return '及格'
      return '不及格'
    },
    handleTermChange() {
      this.currentPage = 1
      this.loadGrades()
    },
    handleSearch() {
      this.currentPage = 1
      this.loadGrades()
    },
    resetSearch() {
      this.searchForm = {
        courseName: '',
        scoreRange: 'all',
        scoreType: 'all'
      }
      this.currentPage = 1
      this.loadGrades()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.loadGrades()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.loadGrades()
    },
    getScoreTypeTagType(scoreType) {
      const typeMap = {
        exam: 'primary',
        assessment: 'success',
        experiment: 'warning'
      }
      return typeMap[scoreType] || 'default'
    },
    getScoreTypeText(scoreType) {
      const typeMap = {
        exam: '考试',
        assessment: '考查',
        experiment: '实验'
      }
      return typeMap[scoreType] || scoreType
    },
    getLevelTagType(level) {
      const levelMap = {
        '优秀': 'success',
        '良好': 'primary',
        '中等': 'warning',
        '及格': 'info',
        '不及格': 'danger'
      }
      return levelMap[level] || 'default'
    },
    viewCourseDetails(grade) {
      this.loadGradeDetails(grade.id)
    },
    
    // 加载成绩详情
    async loadGradeDetails(gradeId) {
      this.loading = true
      try {
        // 从API获取成绩详情
        const response = await api.get(`/student/grades/${gradeId}/details`)
        if (response.data && response.data.success) {
          this.selectedGrade = response.data.data
          this.showCourseDetailsDialog = true
        } else {
          throw new Error('获取成绩详情失败')
        }
      } catch (error) {
        console.error('加载成绩详情失败:', error)
        // API失败时，使用列表中的数据
        const grade = this.grades.find(g => g.id === gradeId)
        if (grade) {
          this.selectedGrade = { ...grade }
          this.showCourseDetailsDialog = true
          this.$message.warning('使用缓存的成绩数据')
        } else {
          this.$message.error('获取成绩详情失败')
        }
      } finally {
        this.loading = false
      }
    },
    handleCloseCourseDetailsDialog() {
      this.selectedGrade = null
      this.showCourseDetailsDialog = false
    },
    viewScoreDetails(grade) {
      this.loadGradeDetails(grade.id)
      // 确保显示的是成绩明细对话框
      this.$nextTick(() => {
        this.showCourseDetailsDialog = false
        this.showScoreDetailsDialog = true
      })
    },
    handleCloseScoreDetailsDialog() {
      this.selectedGrade = null
      this.showScoreDetailsDialog = false
    },
    async exportScoreDetails() {
      if (!this.selectedGrade) return
      
      try {
        // 调用后端API导出成绩明细
        const response = await api.get(`/student/grades/${this.selectedGrade.id}/export`, {
          responseType: 'blob'
        })
        
        // 检查响应是否正确
        if (!response.data || response.data.size === 0) {
          throw new Error('导出文件为空')
        }
        
        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${this.selectedGrade.courseName}_成绩明细_${this.selectedTerm}_${new Date().getTime()}.xlsx`)
        document.body.appendChild(link)
        link.click()
        
        // 清理
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.$message.success('成绩明细导出成功')
      } catch (error) {
        console.error('导出成绩明细失败:', error)
        this.$message.error('导出成绩明细失败，请稍后重试')
        
        // 模拟导出作为后备
        this.$confirm('导出失败，是否尝试生成简单的Excel文件？', '导出失败', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          this.$message.warning('简单导出功能正在开发中')
        }).catch(() => {})
      }
    }
  }
}
</script>

<style scoped>
.grades-container {
  padding: 20px;
}

.grades-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-container {
  margin-bottom: 20px;
}

.stats-card {
  margin-bottom: 0;
}

.stat-item {
  text-align: center;
  padding: 15px 0;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.stat-item.primary {
  background-color: #edf2fc;
}

.stat-item.success {
  background-color: #f0f9eb;
}

.stat-item.warning {
  background-color: #fdf6ec;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.search-filter-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
}

.grades-list-card {
  margin-bottom: 20px;
}

.failed-score {
  color: #f56c6c;
  font-weight: 500;
}

.excellent-score {
  color: #67c23a;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.analysis-container {
  margin-bottom: 20px;
}

.analysis-card {
  margin-bottom: 0;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-card h4 {
  margin: 0 0 15px 0;
  text-align: center;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.chart-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 15px;
}

.chart-placeholder p {
  margin: 5px 0;
  color: #606266;
}

/* 课程详情对话框样式 */
.course-details {
  max-height: 60vh;
  overflow-y: auto;
}

/* 成绩明细对话框样式 */
.score-details h3 {
  margin: 0 0 20px 0;
  text-align: center;
}

.score-breakdown-card {
  margin-bottom: 20px;
}

.final-score {
  margin-bottom: 20px;
}

.final-score-card {
  text-align: center;
}

.final-score-content {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.final-score-label {
  font-size: 18px;
  font-weight: 500;
}

.final-score-value {
  font-size: 36px;
  font-weight: bold;
}

.final-score-level {
  font-size: 18px;
}

.teacher-comment {
  margin-bottom: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-content {
  line-height: 1.8;
  white-space: pre-line;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>