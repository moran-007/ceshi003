<template>
  <div class="courses-container">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="课程名称">
          <el-input v-model="searchForm.courseName" placeholder="请输入课程名称"></el-input>
        </el-form-item>
        <el-form-item label="课程状态">
          <el-select v-model="searchForm.status" placeholder="选择课程状态">
            <el-option label="全部" value=""></el-option>
            <el-option label="进行中" value="ongoing"></el-option>
            <el-option label="已结束" value="finished"></el-option>
            <el-option label="未开始" value="notStarted"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="courses-card">
      <template #header>
        <div class="card-header">
          <span>我的课程列表</span>
        </div>
      </template>

      <el-table :data="coursesData" style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="courseName" label="课程名称" width="200">
          <template #default="scope">
            <el-tag type="primary" effect="dark" @click="viewCourseDetail(scope.row)" style="cursor: pointer;">
              {{ scope.row.courseName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="课程描述">
          <template #default="scope">
            <div class="course-desc" :title="scope.row.description">
              {{ scope.row.description }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="teacher" label="授课教师" width="120"></el-table-column>
        <el-table-column prop="totalHours" label="总课时" width="100"></el-table-column>
        <el-table-column prop="remainingHours" label="剩余课时" width="100"></el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120"></el-table-column>
        <el-table-column prop="endDate" label="结束日期" width="120"></el-table-column>
        <el-table-column prop="status" label="课程状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" size="small" @click="viewCourseDetail(scope.row)">
                详情
              </el-button>
              <el-dropdown>
                <el-button type="info" size="small">
                  更多 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="viewLearningMaterials(scope.row)">学习资料</el-dropdown-item>
                    <el-dropdown-item @click="viewHomework(scope.row)">作业管理</el-dropdown-item>
                    <el-dropdown-item @click="viewScores(scope.row)">成绩查询</el-dropdown-item>
                    <el-dropdown-item @click="viewAttendance(scope.row)">出勤记录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`课程详情 - ${selectedCourse.courseName || ''}`"
      width="700px"
    >
      <div v-if="selectedCourse" class="course-detail">
        <el-descriptions border :column="2">
          <el-descriptions-item label="课程名称">{{ selectedCourse.courseName }}</el-descriptions-item>
          <el-descriptions-item label="课程编号">{{ selectedCourse.courseCode }}</el-descriptions-item>
          <el-descriptions-item label="授课教师">{{ selectedCourse.teacher }}</el-descriptions-item>
          <el-descriptions-item label="总课时">{{ selectedCourse.totalHours }}</el-descriptions-item>
          <el-descriptions-item label="剩余课时">{{ selectedCourse.remainingHours }}</el-descriptions-item>
          <el-descriptions-item label="已用课时">{{ selectedCourse.usedHours }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ selectedCourse.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ selectedCourse.endDate }}</el-descriptions-item>
          <el-descriptions-item label="课程状态">
            <el-tag :type="getStatusType(selectedCourse.status)">
              {{ getStatusText(selectedCourse.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="课程类型">{{ selectedCourse.courseType || '理论课' }}</el-descriptions-item>
          <el-descriptions-item label="课程描述" :span="2">
            <div class="detail-description">{{ selectedCourse.description }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="学习进度">
            <el-progress
              :percentage="selectedCourse.progress || 0"
              :status="getProgressStatus(selectedCourse.progress || 0)"
              :stroke-width="15"
              text-inside
            ></el-progress>
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-actions">
          <el-button type="primary" @click="startLearning">开始学习</el-button>
          <el-button @click="viewLearningMaterials(selectedCourse)">查看学习资料</el-button>
          <el-button @click="viewHomework(selectedCourse)">查看作业</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ArrowDown } from '@element-plus/icons-vue'
import api from '../../services/axios'

export default {
  name: 'StudentCourses',
  components: {
    ArrowDown
  },
  data() {
    return {
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      searchForm: {
        courseName: '',
        status: ''
      },
      coursesData: [],
      showDetailDialog: false,
      selectedCourse: {}
    }
  },
  mounted() {
    this.loadCourses()
  },
  methods: {
    async loadCourses() {
      this.loading = true
      try {
        // 从后端API获取课程数据
        const response = await api.get('/student/courses', {
          params: {
            page: this.currentPage,
            pageSize: this.pageSize,
            courseName: this.searchForm.courseName,
            status: this.searchForm.status
          }
        })
        
        if (response.data && response.data.success) {
          this.coursesData = response.data.data.courses || []
          this.total = response.data.data.total || 0
        } else {
          throw new Error('获取课程数据失败')
        }
      } catch (error) {
        console.error('加载课程数据失败:', error)
        this.$message.error('加载课程数据失败，请检查网络连接或稍后重试')
        // 不再使用模拟数据，保持数据为空以显示实际结果
        this.coursesData = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    // 模拟数据作为后备方案
    useMockData() {
      this.coursesData = [
        {
          id: 1,
          courseCode: 'CS001',
          courseName: '高等数学',
          description: '本课程主要讲解微积分、线性代数等数学基础知识，为计算机专业学生提供必要的数学工具。',
          teacher: '张老师',
          totalHours: 64,
          remainingHours: 24,
          usedHours: 40,
          startDate: '2025-09-01',
          endDate: '2026-01-15',
          status: 'ongoing',
          progress: 65
        },
        {
          id: 2,
          courseCode: 'CS002',
          courseName: '数据结构',
          description: '介绍数据的逻辑结构、存储结构以及基本操作，包括线性表、栈、队列、树、图等数据结构。',
          teacher: '李老师',
          totalHours: 48,
          remainingHours: 30,
          usedHours: 18,
          startDate: '2025-09-15',
          endDate: '2026-01-08',
          status: 'ongoing',
          progress: 40
        },
        {
          id: 3,
          courseCode: 'CS003',
          courseName: '计算机网络',
          description: '讲解计算机网络的基本概念、体系结构、协议原理以及网络应用开发等内容。',
          teacher: '王老师',
          totalHours: 56,
          remainingHours: 12,
          usedHours: 44,
          startDate: '2025-09-01',
          endDate: '2025-12-25',
          status: 'ongoing',
          progress: 80
        },
        {
          id: 4,
          courseCode: 'CS004',
          courseName: '编程语言',
          description: '系统学习Java编程语言的语法、面向对象特性、异常处理、集合框架等核心内容。',
          teacher: '刘老师',
          totalHours: 72,
          remainingHours: 18,
          usedHours: 54,
          startDate: '2025-08-20',
          endDate: '2026-01-20',
          status: 'ongoing',
          progress: 75
        },
        {
          id: 5,
          courseCode: 'CS005',
          courseName: '数据库原理',
          description: '介绍数据库系统的基本概念、关系模型、SQL语言、数据库设计和事务管理等内容。',
          teacher: '陈老师',
          totalHours: 48,
          remainingHours: 22,
          usedHours: 26,
          startDate: '2025-09-10',
          endDate: '2026-01-10',
          status: 'ongoing',
          progress: 55
        }
      ]
      this.total = this.coursesData.length
    },
    handleSearch() {
      // 模拟搜索功能
      this.currentPage = 1
      this.loadCourses()
    },
    resetSearch() {
      this.searchForm = {
        courseName: '',
        status: ''
      }
      this.currentPage = 1
      this.loadCourses()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.loadCourses()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.loadCourses()
    },
    viewCourseDetail(course) {
      this.loadCourseDetail(course.id)
    },
    
    // 加载课程详情
    async loadCourseDetail(courseId) {
      this.loading = true
      try {
        // 从API获取课程详情
        const response = await api.get(`/student/courses/${courseId}`)
        if (response.data && response.data.success) {
          this.selectedCourse = response.data.data
          this.showDetailDialog = true
        } else {
          throw new Error('获取课程详情失败')
        }
      } catch (error) {
        console.error('加载课程详情失败:', error)
        // API失败时，使用列表中的数据
        const course = this.coursesData.find(c => c.id === courseId)
        if (course) {
          this.selectedCourse = JSON.parse(JSON.stringify(course))
          this.showDetailDialog = true
          this.$message.warning('使用缓存的课程数据')
        } else {
          this.$message.error('获取课程详情失败')
        }
      } finally {
        this.loading = false
      }
    },
    startLearning() {
      this.$router.push(`/student/learning?courseId=${this.selectedCourse.id}`)
    },
    viewLearningMaterials(course) {
      this.$router.push(`/student/learning?courseId=${course.id}&tab=materials`)
    },
    viewHomework(course) {
      // 跳转到作业页面
      this.$router.push(`/student/assignments?courseId=${course.id}`)
    },
    viewScores(course) {
      this.$router.push(`/student/scores?courseId=${course.id}`)
    },
    viewAttendance(course) {
      this.$router.push(`/student/attendance?courseId=${course.id}`)
    },
    getStatusType(status) {
      const statusMap = {
        ongoing: 'success',
        finished: 'info',
        notStarted: 'warning'
      }
      return statusMap[status] || 'default'
    },
    getStatusText(status) {
      const statusMap = {
        ongoing: '进行中',
        finished: '已结束',
        notStarted: '未开始'
      }
      return statusMap[status] || status
    },
    getProgressStatus(progress) {
      if (progress >= 80) return 'success'
      if (progress >= 60) return 'primary'
      if (progress >= 40) return 'warning'
      return 'danger'
    }
  }
}
</script>

<style scoped>
.courses-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
}

.courses-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.course-desc {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-detail {
  padding: 10px;
}

.detail-description {
  white-space: pre-wrap;
  line-height: 1.8;
}

.detail-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}
</style>