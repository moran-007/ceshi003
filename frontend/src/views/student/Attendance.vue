<template>
  <div class="attendance-container">
    <el-card class="attendance-card">
      <template #header>
        <div class="card-header">
          <span>签到管理</span>
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

      <!-- 签到统计卡片 -->
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
                <div class="stat-value">{{ totalSessions }}</div>
                <div class="stat-label">总课时数</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-item success">
                <div class="stat-value">{{ attendedSessions }}</div>
                <div class="stat-label">出勤课时</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-item info">
                <div class="stat-value">{{ attendanceRate.toFixed(1) }}%</div>
                <div class="stat-label">出勤率</div>
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
          <el-form-item label="签到状态">
            <el-select v-model="searchForm.status" placeholder="选择签到状态">
              <el-option label="全部" value="all"></el-option>
              <el-option label="已签到" value="attended"></el-option>
              <el-option label="未签到" value="absent"></el-option>
              <el-option label="迟到" value="late"></el-option>
              <el-option label="请假" value="leave"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="签到时间">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 课程签到概览 -->
      <el-card class="overview-card">
        <template #header>
          <div class="overview-header">
            <span>课程签到概览</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col
            v-for="course in courseAttendanceOverview"
            :key="course.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
          >
            <el-card class="course-attendance-card" shadow="hover">
              <div class="course-attendance-header">
                <h4>{{ course.courseName }}</h4>
                <el-tag :type="getCourseAttendanceTagType(course.rate)">{{ course.rate.toFixed(1) }}%</el-tag>
              </div>
              <div class="course-attendance-body">
                <div class="course-attendance-stats">
                  <div class="attendance-stat-item">
                    <div class="stat-item-label">出勤</div>
                    <div class="stat-item-value success">{{ course.attended }}</div>
                  </div>
                  <div class="attendance-stat-item">
                    <div class="stat-item-label">缺勤</div>
                    <div class="stat-item-value danger">{{ course.absent }}</div>
                  </div>
                  <div class="attendance-stat-item">
                    <div class="stat-item-label">迟到</div>
                    <div class="stat-item-value warning">{{ course.late }}</div>
                  </div>
                  <div class="attendance-stat-item">
                    <div class="stat-item-label">请假</div>
                    <div class="stat-item-value info">{{ course.leave }}</div>
                  </div>
                </div>
                <el-progress
                  :percentage="course.rate"
                  :status="getCourseAttendanceStatus(course.rate)"
                  :stroke-width="10"
                  :text-inside="false"
                ></el-progress>
                <div class="view-details-button">
                  <el-button type="primary" size="small" @click="viewCourseAttendanceDetails(course)">
                    查看详情
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-card>

      <!-- 签到记录列表 -->
      <el-card class="attendance-list-card">
        <template #header>
          <div class="list-header">
            <span>签到记录明细</span>
            <el-button type="primary" @click="exportAttendance">导出记录</el-button>
          </div>
        </template>

        <el-table :data="filteredAttendanceRecords" style="width: 100%">
          <el-table-column prop="courseName" label="课程名称" min-width="150"></el-table-column>
          <el-table-column prop="date" label="签到日期" width="120"></el-table-column>
          <el-table-column prop="time" label="签到时间" width="120"></el-table-column>
          <el-table-column prop="location" label="签到地点" width="150"></el-table-column>
          <el-table-column prop="session" label="课次" width="80"></el-table-column>
          <el-table-column prop="type" label="签到方式" width="100">
            <template #default="scope">
              <el-tag :type="getAttendanceTypeTagType(scope.row.type)">
                {{ getAttendanceTypeText(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="签到状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注"></el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewAttendanceDetails(scope.row)">
                详情
              </el-button>
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
            :total="filteredAttendanceRecords.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </el-card>
    </el-card>

    <!-- 课程签到详情对话框 -->
    <el-dialog
      v-model="showCourseAttendanceDialog"
      :title="`${selectedCourse?.courseName} - 签到详情`"
      width="70%"
      :before-close="handleCloseCourseAttendanceDialog"
    >
      <div v-if="selectedCourse" class="course-attendance-details">
        <div class="course-attendance-summary">
          <el-card class="summary-card">
            <el-descriptions border :column="{ xs: 1, sm: 2, md: 4, lg: 4, xl: 4 }">
              <el-descriptions-item label="课程名称">{{ selectedCourse.courseName }}</el-descriptions-item>
              <el-descriptions-item label="总课时">{{ selectedCourse.totalSessions }}</el-descriptions-item>
              <el-descriptions-item label="出勤率">{{ selectedCourse.rate.toFixed(1) }}%</el-descriptions-item>
              <el-descriptions-item label="任课教师">{{ selectedCourse.teacher }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </div>

        <div class="course-attendance-stats">
          <el-card class="stats-card">
            <el-row :gutter="20">
              <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
                <div class="stat-item success">
                  <div class="stat-value">{{ selectedCourse.attended }}</div>
                  <div class="stat-label">出勤</div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
                <div class="stat-item danger">
                  <div class="stat-value">{{ selectedCourse.absent }}</div>
                  <div class="stat-label">缺勤</div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
                <div class="stat-item warning">
                  <div class="stat-value">{{ selectedCourse.late }}</div>
                  <div class="stat-label">迟到</div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
                <div class="stat-item info">
                  <div class="stat-value">{{ selectedCourse.leave }}</div>
                  <div class="stat-label">请假</div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </div>

        <div class="course-attendance-records">
          <el-card class="records-card">
            <el-table :data="getCourseAttendanceRecords(selectedCourse.id)" style="width: 100%">
              <el-table-column prop="date" label="日期" width="120"></el-table-column>
              <el-table-column prop="time" label="时间" width="120"></el-table-column>
              <el-table-column prop="session" label="课次" width="80"></el-table-column>
              <el-table-column prop="location" label="地点" width="150"></el-table-column>
              <el-table-column prop="type" label="签到方式" width="100">
                <template #default="scope">
                  <el-tag :type="getAttendanceTypeTagType(scope.row.type)">
                    {{ getAttendanceTypeText(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusTagType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="remark" label="备注"></el-table-column>
            </el-table>
          </el-card>
        </div>

        <div class="dialog-footer">
          <el-button @click="handleCloseCourseAttendanceDialog">关闭</el-button>
          <el-button type="primary" @click="exportCourseAttendance(selectedCourse)">导出记录</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 签到详情对话框 -->
    <el-dialog
      v-model="showAttendanceDetailsDialog"
      title="签到详情"
      width="60%"
      :before-close="handleCloseAttendanceDetailsDialog"
    >
      <div v-if="selectedAttendance" class="attendance-details">
        <el-descriptions border :column="{ xs: 1, sm: 2 }">
          <el-descriptions-item label="课程名称">{{ selectedAttendance.courseName }}</el-descriptions-item>
          <el-descriptions-item label="课次">{{ selectedAttendance.session }}</el-descriptions-item>
          <el-descriptions-item label="签到日期">{{ selectedAttendance.date }}</el-descriptions-item>
          <el-descriptions-item label="签到时间">{{ selectedAttendance.time }}</el-descriptions-item>
          <el-descriptions-item label="签到地点">{{ selectedAttendance.location }}</el-descriptions-item>
          <el-descriptions-item label="签到方式">{{ getAttendanceTypeText(selectedAttendance.type) }}</el-descriptions-item>
          <el-descriptions-item label="签到状态">
            <el-tag :type="getStatusTagType(selectedAttendance.status)">
              {{ getStatusText(selectedAttendance.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="签到设备">{{ selectedAttendance.device }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ selectedAttendance.ipAddress }}</el-descriptions-item>
          <el-descriptions-item label="教师确认">{{ selectedAttendance.teacherConfirmed ? '已确认' : '未确认' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ selectedAttendance.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div class="dialog-footer">
          <el-button @click="handleCloseAttendanceDetailsDialog">关闭</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 实时签到提醒对话框 -->
    <el-dialog
      v-model="showSignInDialog"
      title="实时签到提醒"
      width="40%"
      :show-close="false"
      :close-on-click-modal="false"
    >
      <div class="sign-in-dialog">
        <div class="sign-in-header">
          <el-icon class="sign-in-icon"><Bell /></el-icon>
          <h3>您有一个正在进行的签到</h3>
        </div>
        <div class="sign-in-info" v-if="currentSignIn">
          <p class="sign-in-course">{{ currentSignIn.courseName }}</p>
          <p class="sign-in-time">签到时间：{{ currentSignIn.startTime }} - {{ currentSignIn.endTime }}</p>
          <p class="sign-in-location">签到地点：{{ currentSignIn.location }}</p>
          <p class="sign-in-type">签到方式：{{ getAttendanceTypeText(currentSignIn.type) }}</p>
          <div class="sign-in-countdown">
            <p>剩余时间：<span class="countdown-time">{{ remainingTime }}</span></p>
          </div>
        </div>
        <div class="dialog-footer">
          <el-button type="primary" @click="confirmSignIn">立即签到</el-button>
          <el-button @click="ignoreSignIn">稍后签到</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Bell } from '@element-plus/icons-vue'
import api from '../../services/axios'

export default {
  name: 'StudentAttendance',
  components: {
    Bell
  },
  computed: {
    filteredAttendanceRecords() {
      let filtered = [...this.attendanceRecords]

      // 按课程名称搜索
      if (this.searchForm.courseName) {
        filtered = filtered.filter(record => 
          record.courseName.toLowerCase().includes(this.searchForm.courseName.toLowerCase())
        )
      }

      // 按签到状态筛选
      if (this.searchForm.status !== 'all') {
        filtered = filtered.filter(record => record.status === this.searchForm.status)
      }

      // 按时间范围筛选
      if (this.dateRange && this.dateRange.length === 2) {
        const startDate = this.dateRange[0]
        const endDate = this.dateRange[1]
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.date)
          return recordDate >= startDate && recordDate <= endDate
        })
      }

      return filtered
    },
    totalCourses() {
      return this.courseAttendanceOverview.length
    },
    totalSessions() {
      return this.courseAttendanceOverview.reduce((sum, course) => sum + course.totalSessions, 0)
    },
    attendedSessions() {
      return this.courseAttendanceOverview.reduce((sum, course) => sum + course.attended, 0)
    },
    attendanceRate() {
      const total = this.totalSessions
      const attended = this.attendedSessions
      return total > 0 ? (attended / total) * 100 : 0
    }
  },
  methods: {
    handleTermChange() {
      // 切换学期时重新加载数据
      this.currentPage = 1
      this.fetchInitialData()
    },
    handleSearch() {
      this.currentPage = 1
    },
    resetSearch() {
      this.searchForm = {
        courseName: '',
        status: 'all'
      }
      this.dateRange = []
      this.currentPage = 1
    },
    handleSizeChange(size) {
      this.pageSize = size
    },
    handleCurrentChange(current) {
      this.currentPage = current
    },
    getCourseAttendanceTagType(rate) {
      if (rate >= 90) return 'success'
      if (rate >= 70) return 'primary'
      if (rate >= 60) return 'warning'
      return 'danger'
    },
    getCourseAttendanceStatus(rate) {
      if (rate >= 90) return 'success'
      if (rate >= 70) return 'primary'
      if (rate >= 60) return 'warning'
      return 'danger'
    },
    getAttendanceTypeTagType(type) {
      const typeMap = {
        face: 'primary',
        qr_code: 'success',
        location: 'warning',
        id_card: 'info',
        manual: 'default'
      }
      return typeMap[type] || 'default'
    },
    getAttendanceTypeText(type) {
      const typeMap = {
        face: '人脸识别',
        qr_code: '二维码',
        location: '位置签到',
        id_card: '刷卡',
        manual: '手动'
      }
      return typeMap[type] || type
    },
    getStatusTagType(status) {
      const statusMap = {
        attended: 'success',
        absent: 'danger',
        late: 'warning',
        leave: 'info'
      }
      return statusMap[status] || 'default'
    },
    getStatusText(status) {
      const statusMap = {
        attended: '已签到',
        absent: '未签到',
        late: '迟到',
        leave: '请假'
      }
      return statusMap[status] || status
    },
    viewCourseAttendanceDetails(course) {
      this.selectedCourse = { ...course }
      this.showCourseAttendanceDialog = true
    },
    handleCloseCourseAttendanceDialog() {
      this.selectedCourse = null
      this.showCourseAttendanceDialog = false
    },
    viewAttendanceDetails(record) {
      this.selectedAttendance = { ...record }
      this.showAttendanceDetailsDialog = true
    },
    handleCloseAttendanceDetailsDialog() {
      this.selectedAttendance = null
      this.showAttendanceDetailsDialog = false
    },
    getCourseAttendanceRecords(courseId) {
      return this.attendanceRecords.filter(record => record.courseId === courseId)
    },
    async exportAttendance() {
      try {
        // 调用API导出签到记录
        const response = await api.get('/student/attendance/export', { 
          params: { ...this.searchForm, term: this.selectedTerm },
          responseType: 'blob'
        })
        // 创建下载链接
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `签到记录_${new Date().toLocaleDateString('zh-CN')}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        this.$message.success('签到记录导出成功')
      } catch (error) {
        console.error('导出签到记录失败:', error)
        this.$message.error('导出签到记录失败')
      }
    },
    async exportCourseAttendance(course) {
      try {
        // 调用API导出课程签到记录
        const response = await api.get(`/student/attendance/export/${course.id}`, {
          params: { term: this.selectedTerm },
          responseType: 'blob'
        })
        // 创建下载链接
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${course.courseName}_签到记录_${new Date().toLocaleDateString('zh-CN')}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        this.$message.success(`${course.courseName}签到记录导出成功`)
      } catch (error) {
        console.error('导出课程签到记录失败:', error)
        this.$message.error(`导出${course.courseName}签到记录失败`)
      }
    },
    
    // 获取课程出勤概览数据
    async fetchCourseAttendanceOverview() {
      try {
        const response = await api.get('/student/attendance/overview', { params: { term: this.selectedTerm } })
        if (response.data && response.data.success) {
          this.courseAttendanceOverview = response.data.data || []
          return response
        } else {
          throw new Error('API返回数据格式错误')
        }
      } catch (error) {
        console.error('获取课程出勤概览失败:', error)
        this.$message.error('获取课程出勤概览失败')
        throw error
      }
    },
    
    // 获取签到记录数据
    async fetchAttendanceRecords() {
      try {
        const response = await api.get('/student/attendance/records', { 
          params: { 
            ...this.searchForm,
            term: this.selectedTerm,
            page: this.currentPage,
            pageSize: this.pageSize
          } 
        })
        if (response.data && response.data.success) {
          this.attendanceRecords = response.data.data || []
          return response
        } else {
          throw new Error('API返回数据格式错误')
        }
      } catch (error) {
        console.error('获取签到记录失败:', error)
        this.$message.error('获取签到记录失败')
        throw error
      }
    },
    
    // 检查是否有正在进行的签到
    async checkActiveSignIn() {
      try {
        const response = await api.get('/student/attendance/active-signin')
        if (response.data && response.data.success && response.data.data.active) {
          this.currentSignIn = response.data.data.signInInfo
          this.showSignInDialog = true
        }
      } catch (error) {
        console.error('检查签到状态失败:', error)
      }
    },
    async confirmSignIn() {
      try {
        // 调用API进行签到
        const response = await api.post(`/student/attendance/sign-in/${this.currentSignIn.id}`)
        if (response.data && response.data.success) {
          this.$message.success('签到成功')
          // 重新获取签到记录
          await this.fetchAttendanceRecords()
          await this.fetchCourseAttendanceOverview()
        } else {
          this.$message.error(response.data?.message || '签到失败')
        }
      } catch (error) {
        console.error('签到失败:', error)
        this.$message.error('签到失败，请稍后重试')
      }
      this.showSignInDialog = false
      this.currentSignIn = null
    },
    ignoreSignIn() {
      // 忽略签到
      this.showSignInDialog = false
    }
  },
  data() {
    return {
      selectedTerm: '2025-1',
      currentPage: 1,
      pageSize: 10,
      loading: false,
      searchForm: {
        courseName: '',
        status: 'all'
      },
      dateRange: [],
      showCourseAttendanceDialog: false,
      showAttendanceDetailsDialog: false,
      showSignInDialog: false,
      selectedCourse: null,
      selectedAttendance: null,
      remainingTime: '05:00',
      currentSignIn: null,
      // 可用学期选项
      availableTerms: [
        { label: '2025-1学期', value: '2025-1' },
        { label: '2024-2学期', value: '2024-2' },
        { label: '2024-1学期', value: '2024-1' },
        { label: '2023-2学期', value: '2023-2' }
      ],
      // 从后端获取的数据
      courseAttendanceOverview: [],
      attendanceRecords: []
    },
    mounted() {
      // 组件挂载时自动加载数据
      this.fetchInitialData();
    },
    methods: {
      // 初始化加载所有必要数据
      async fetchInitialData() {
      this.loading = true
      try {
        // 并行请求所有初始数据
        const [overviewRes, recordsRes] = await Promise.all([
          this.fetchCourseAttendanceOverview(),
          this.fetchAttendanceRecords()
        ])
        
        // 检查活动签到
        this.checkActiveSignIn()
        
        // 定时检查活动签到
        setInterval(() => {
          this.checkActiveSignIn()
        }, 60000)
      } catch (error) {
        console.error('初始化数据加载失败:', error)
        this.$message.error('数据加载失败，请检查网络连接或稍后重试')
        // 不再使用模拟数据，直接显示API请求的实际状态
      } finally {
        this.loading = false
      }
    },
    
    // 使用模拟数据作为后备方案
    useMockData() {
      // 模拟课程出勤概览数据
      this.courseAttendanceOverview = [
        {
          id: 1,
          courseName: '高等数学',
          teacher: '张老师',
          totalSessions: 16,
          attended: 15,
          absent: 0,
          late: 1,
          leave: 0,
          rate: 93.75
        },
        {
          id: 2,
          courseName: '数据结构',
          teacher: '李老师',
          totalSessions: 12,
          attended: 10,
          absent: 1,
          late: 1,
          leave: 0,
          rate: 83.33
        },
        {
          id: 3,
          courseName: '计算机网络',
          teacher: '王老师',
          totalSessions: 14,
          attended: 13,
          absent: 1,
          late: 0,
          leave: 0,
          rate: 92.86
        },
        {
          id: 4,
          courseName: '编程语言',
          teacher: '刘老师',
          totalSessions: 18,
          attended: 16,
          absent: 0,
          late: 2,
          leave: 0,
          rate: 88.89
        }
      ]
      
      // 模拟签到记录数据
      this.attendanceRecords = [
        {
          id: 1,
          courseId: 1,
          courseName: '高等数学',
          date: '2025-10-18',
          time: '08:30',
          location: 'A301',
          session: 15,
          type: 'face',
          status: 'attended',
          device: '浏览器',
          ipAddress: '192.168.1.101',
          teacherConfirmed: true,
          remark: '正常签到'
        },
        {
          id: 2,
          courseId: 2,
          courseName: '数据结构',
          date: '2025-10-17',
          time: '14:35',
          location: 'B203',
          session: 11,
          type: 'qr_code',
          status: 'late',
          device: '手机',
          ipAddress: '192.168.1.102',
          teacherConfirmed: true,
          remark: '迟到5分钟'
        },
        {
          id: 3,
          courseId: 3,
          courseName: '计算机网络',
          date: '2025-10-16',
          time: '09:00',
          location: 'C105',
          session: 12,
          type: 'location',
          status: 'attended',
          device: '手机',
          ipAddress: '192.168.1.103',
          teacherConfirmed: true,
          remark: ''
        },
        {
          id: 4,
          courseId: 4,
          courseName: '编程语言',
          date: '2025-10-15',
          time: '16:05',
          location: 'D302',
          session: 16,
          type: 'face',
          status: 'attended',
          device: '浏览器',
          ipAddress: '192.168.1.104',
          teacherConfirmed: true,
          remark: ''
        },
        {
          id: 5,
          courseId: 1,
          courseName: '高等数学',
          date: '2025-10-14',
          time: '08:25',
          location: 'A301',
          session: 14,
          type: 'face',
          status: 'attended',
          device: '浏览器',
          ipAddress: '192.168.1.101',
          teacherConfirmed: true,
          remark: ''
        },
        {
          id: 6,
          courseId: 2,
          courseName: '数据结构',
          date: '2025-10-12',
          time: '',
          location: 'B203',
          session: 10,
          type: 'qr_code',
          status: 'absent',
          device: '',
          ipAddress: '',
          teacherConfirmed: true,
          remark: '无故缺勤'
        },
        {
          id: 7,
          courseId: 3,
          courseName: '计算机网络',
          date: '2025-10-10',
          time: '',
          location: 'C105',
          session: 11,
          type: 'location',
          status: 'absent',
          device: '',
          ipAddress: '',
          teacherConfirmed: true,
          remark: '请假未批准'
        },
        {
          id: 8,
          courseId: 4,
          courseName: '编程语言',
          date: '2025-10-09',
          time: '16:10',
          location: 'D302',
          session: 15,
          type: 'face',
          status: 'late',
          device: '浏览器',
          ipAddress: '192.168.1.104',
          teacherConfirmed: true,
          remark: '迟到10分钟'
        }
      ]
    }
</script>

<style scoped>
.attendance-container {
  padding: 20px;
}

.attendance-card {
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

.stat-item.info {
  background-color: #ecf5ff;
}

.stat-item.danger {
  background-color: #fef0f0;
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

.overview-card {
  margin-bottom: 20px;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-attendance-card {
  margin-bottom: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.course-attendance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.course-attendance-header h4 {
  margin: 0;
}

.course-attendance-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-attendance-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.attendance-stat-item {
  text-align: center;
}

.stat-item-label {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-item-value {
  font-weight: 500;
}

.stat-item-value.success {
  color: #67c23a;
}

.stat-item-value.danger {
  color: #f56c6c;
}

.stat-item-value.warning {
  color: #e6a23c;
}

.stat-item-value.info {
  color: #909399;
}

.view-details-button {
  margin-top: 15px;
  text-align: center;
}

.attendance-list-card {
  margin-bottom: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 课程签到详情对话框样式 */
.course-attendance-details {
  max-height: 70vh;
  overflow-y: auto;
}

.course-attendance-summary {
  margin-bottom: 20px;
}

.course-attendance-stats {
  margin-bottom: 20px;
}

.records-card {
  margin-bottom: 0;
}

/* 签到详情对话框样式 */
.attendance-details {
  max-height: 60vh;
  overflow-y: auto;
}

/* 实时签到提醒对话框样式 */
.sign-in-dialog {
  text-align: center;
}

.sign-in-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.sign-in-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 15px;
}

.sign-in-header h3 {
  margin: 0;
}

.sign-in-info {
  margin-bottom: 20px;
}

.sign-in-course {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 10px;
}

.sign-in-time,
.sign-in-location,
.sign-in-type {
  margin-bottom: 8px;
  color: #606266;
}

.sign-in-countdown {
  margin-top: 20px;
  padding: 10px;
  background-color: #fdf6ec;
  border-radius: 4px;
}

.countdown-time {
  font-size: 24px;
  font-weight: bold;
  color: #e6a23c;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>