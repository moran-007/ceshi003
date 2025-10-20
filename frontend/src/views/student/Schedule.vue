<template>
  <div class="schedule-container">
    <el-card class="schedule-card">
      <template #header>
        <div class="card-header">
          <span>课程表</span>
          <div class="header-actions">
            <el-button-group>
              <el-button @click="prevWeek">&lt; 上一周</el-button>
              <el-button type="primary">{{ currentWeekRange }}</el-button>
              <el-button @click="nextWeek">下一周 &gt;</el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <div class="schedule-content">
        <div class="schedule-header">
          <div class="time-slot"></div>
          <div v-for="day in weekDays" :key="day.value" class="day-column">
            <div class="day-header">{{ day.label }}</div>
            <div class="date-header">{{ getDateByDay(day.value) }}</div>
          </div>
        </div>

        <div class="schedule-body">
          <div class="time-axis">
            <div v-for="time in timeSlots" :key="time.index" class="time-slot">
              {{ time.label }}
            </div>
          </div>

          <div class="courses-grid">
            <div v-for="day in weekDays" :key="day.value" class="day-column">
              <div class="day-grid">
                <div v-for="time in timeSlots" :key="time.index" class="course-slot">
                  <!-- 动态生成课程卡片 -->
                  <div
                    v-for="course in getCoursesByTime(day.value, time.index)"
                    :key="course.id"
                    class="course-card"
                    :style="getCourseCardStyle(course)"
                    @click="viewCourseDetail(course)"
                  >
                    <div class="course-title">{{ course.courseName }}</div>
                    <div class="course-teacher">{{ course.teacher }}</div>
                    <div class="course-classroom">{{ course.classroom }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="today-card">
      <template #header>
        <div class="card-header">
          <span>今日课程</span>
          <span class="today-date">{{ today }}</span>
        </div>
      </template>

      <div v-if="todayCourses.length > 0" class="today-courses">
        <el-timeline>
          <el-timeline-item
            v-for="course in todayCourses"
            :key="course.id"
            :timestamp="course.startTime + '-' + course.endTime"
            type="primary"
          >
            <el-card shadow="hover" class="today-course-card">
              <h4>{{ course.courseName }}</h4>
              <p>授课教师：{{ course.teacher }}</p>
              <p>上课地点：{{ course.classroom }}</p>
              <div class="course-actions">
                <el-button type="primary" size="small" @click="viewCourseDetail(course)">查看详情</el-button>
                <el-button type="success" size="small" @click="joinCourse(course)">加入课程</el-button>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div v-else class="no-courses">
        <el-empty description="今天没有课程安排"></el-empty>
      </div>
    </el-card>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`课程详情 - ${selectedCourse.courseName || ''}`"
      width="600px"
    >
      <div v-if="selectedCourse" class="course-detail">
        <el-descriptions border>
          <el-descriptions-item label="课程名称">{{ selectedCourse.courseName }}</el-descriptions-item>
          <el-descriptions-item label="授课教师">{{ selectedCourse.teacher }}</el-descriptions-item>
          <el-descriptions-item label="上课时间">{{ selectedCourse.startTime }} - {{ selectedCourse.endTime }}</el-descriptions-item>
          <el-descriptions-item label="上课地点">{{ selectedCourse.classroom }}</el-descriptions-item>
          <el-descriptions-item label="课程类型">
            <el-tag :type="getCourseTypeTag(selectedCourse.type)">{{ selectedCourse.type }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <div class="detail-actions">
          <el-button type="primary" @click="joinCourse(selectedCourse)">加入课程</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import api from '../../services/axios'

export default {
  name: 'StudentSchedule',
  components: {
  },
  data() {
    return {
      currentDate: new Date(),
      showDetailDialog: false,
      selectedCourse: {},
      loading: false,
      weekDays: [
        { label: '周一', value: 1 },
        { label: '周二', value: 2 },
        { label: '周三', value: 3 },
        { label: '周四', value: 4 },
        { label: '周五', value: 5 },
        { label: '周六', value: 6 },
        { label: '周日', value: 0 }
      ],
      timeSlots: [
        { index: 1, label: '08:00-09:40', startHour: 8, endHour: 9.666 },
        { index: 2, label: '10:00-11:40', startHour: 10, endHour: 11.666 },
        { index: 3, label: '14:00-15:40', startHour: 14, endHour: 15.666 },
        { index: 4, label: '16:00-17:40', startHour: 16, endHour: 17.666 },
        { index: 5, label: '19:00-20:40', startHour: 19, endHour: 20.666 }
      ],
      coursesData: []
    }
  },
  computed: {
    today() {
      return this.formatDate(new Date())
    },
    currentWeekRange() {
      const startDate = this.getFirstDayOfWeek(this.currentDate)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)
      return `${this.formatDate(startDate)} 至 ${this.formatDate(endDate)}`
    },
    todayCourses() {
      const todayDay = new Date().getDay() || 7
      return this.coursesData
        .filter(course => course.dayOfWeek === todayDay)
        .map(course => ({
          ...course,
          startTime: this.timeSlots[course.timeSlot - 1]?.label.split('-')[0] || '',
          endTime: this.timeSlots[course.timeSlot - 1]?.label.split('-')[1] || ''
        }))
        .sort((a, b) => a.timeSlot - b.timeSlot)
    }
  },
  mounted() {
    this.loadCoursesSchedule()
  },
  methods: {
    async loadCoursesSchedule() {
      this.loading = true
      try {
        const startDate = this.getFirstDayOfWeek(this.currentDate)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)
        
        console.log('正在请求课程表数据，时间范围:', this.formatDate(startDate), '至', this.formatDate(endDate))
        
        const response = await api.get('/student/schedule', {
          params: {
            startDate: this.formatDate(startDate),
            endDate: this.formatDate(endDate)
          }
        })
        
        console.log('课程表请求响应:', response.data)
        
        if (response.data && response.data.success) {
          this.coursesData = response.data.data || []
          console.log('成功加载课程数据，共', this.coursesData.length, '条记录')
        } else {
          console.warn('响应数据格式不正确，success字段为false或不存在')
          // 不使用模拟数据，保持数据为空以显示实际结果
          this.coursesData = []
          this.$message.warning('未获取到课程数据')
        }
      } catch (error) {
        console.error('加载课程表失败:', error)
        console.error('错误详情:', error.response || error.message)
        this.$message.error('加载课程表失败，请稍后重试')
        // 不使用模拟数据，保持数据为空以显示实际错误
        this.coursesData = []
      } finally {
        this.loading = false
      }
    },
    
    useMockData() {
      this.coursesData = [
        { id: 1, courseName: '高等数学', teacher: '张老师', classroom: 'A301', dayOfWeek: 1, timeSlot: 1, duration: 1, type: '理论课' },
        { id: 2, courseName: '数据结构', teacher: '李老师', classroom: 'B203', dayOfWeek: 1, timeSlot: 3, duration: 1, type: '实验课' },
        { id: 3, courseName: '计算机网络', teacher: '王老师', classroom: 'C105', dayOfWeek: 2, timeSlot: 2, duration: 1, type: '理论课' },
        { id: 4, courseName: '编程语言', teacher: '刘老师', classroom: 'D302', dayOfWeek: 2, timeSlot: 4, duration: 2, type: '实验课' },
        { id: 5, courseName: '数据库原理', teacher: '陈老师', classroom: 'E201', dayOfWeek: 3, timeSlot: 1, duration: 1, type: '理论课' },
        { id: 6, courseName: '高等数学', teacher: '张老师', classroom: 'A301', dayOfWeek: 3, timeSlot: 3, duration: 1, type: '理论课' },
        { id: 7, courseName: '数据结构', teacher: '李老师', classroom: 'B203', dayOfWeek: 4, timeSlot: 2, duration: 1, type: '实验课' },
        { id: 8, courseName: '计算机网络', teacher: '王老师', classroom: 'C105', dayOfWeek: 4, timeSlot: 4, duration: 1, type: '理论课' },
        { id: 9, courseName: '编程语言', teacher: '刘老师', classroom: 'D302', dayOfWeek: 5, timeSlot: 1, duration: 1, type: '实验课' },
        { id: 10, courseName: '数据库原理', teacher: '陈老师', classroom: 'E201', dayOfWeek: 5, timeSlot: 3, duration: 1, type: '理论课' }
      ]
    },
    
    prevWeek() {
      this.currentDate.setDate(this.currentDate.getDate() - 7)
      this.loadCoursesSchedule()
    },
    
    nextWeek() {
      this.currentDate.setDate(this.currentDate.getDate() + 7)
      this.loadCoursesSchedule()
    },
    getFirstDayOfWeek(date) {
      const d = new Date(date)
      const day = d.getDay() || 7
      const diff = d.getDate() - day + 1
      return new Date(d.setDate(diff))
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    getDateByDay(dayOfWeek) {
      const firstDay = this.getFirstDayOfWeek(this.currentDate)
      const targetDay = new Date(firstDay)
      targetDay.setDate(firstDay.getDate() + (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      return this.formatDate(targetDay)
    },
    getCoursesByTime(dayOfWeek, timeSlot) {
      return this.coursesData.filter(course => course.dayOfWeek === dayOfWeek && course.timeSlot === timeSlot)
    },
    getCourseCardStyle(course) {
      const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
      const colorIndex = course.id % colors.length
      
      return {
        backgroundColor: colors[colorIndex],
        color: 'white',
        height: `${course.duration * 100}%`,
        marginTop: '0'
      }
    },
    viewCourseDetail(course) {
      this.selectedCourse = {
        ...course,
        startTime: this.timeSlots[course.timeSlot - 1].label.split('-')[0],
        endTime: this.timeSlots[course.timeSlot - 1].label.split('-')[1]
      }
      this.showDetailDialog = true
    },
    async joinCourse(course) {
      try {
        const response = await api.post('/student/courses/join', { courseId: course.id })
        if (response.data && response.data.success) {
          this.$message.success(`成功加入课程：${course.courseName}`)
          this.$router.push(`/student/learning?courseId=${course.id}`)
        } else {
          this.$message.error(response.data?.message || '加入课程失败')
        }
      } catch (error) {
        console.error('加入课程失败:', error)
        this.$message.error('加入课程失败，请稍后重试')
      }
    },
    getCourseTypeTag(type) {
      const typeMap = {
        '理论课': 'primary',
        '实验课': 'success',
        '讨论课': 'warning',
        '习题课': 'info'
      }
      return typeMap[type] || 'default'
    }
  }
}
</script>

<style scoped>
.schedule-container {
  padding: 20px;
}

.schedule-card,
.today-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.today-date {
  font-size: 14px;
  color: #606266;
}

.schedule-content {
  overflow-x: auto;
}

.schedule-header {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}

.time-slot {
  width: 100px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #606266;
  background-color: #f5f7fa;
}

.day-column {
  min-width: 180px;
  flex: 1;
}

.day-header {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #303133;
  background-color: #ecf5ff;
}

.date-header {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #909399;
  background-color: #f5f7fa;
}

.schedule-body {
  display: flex;
}

.time-axis {
  width: 100px;
  background-color: #f5f7fa;
}

.courses-grid {
  display: flex;
  flex: 1;
}

.day-grid {
  position: relative;
  min-height: 500px;
}

.course-slot {
  height: 100px;
  border-bottom: 1px solid #ebeef5;
  border-right: 1px solid #ebeef5;
  position: relative;
}

.course-card {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}

.course-card:hover {
  transform: scale(1.05);
}

.course-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-teacher,
.course-classroom {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.today-courses {
  padding: 10px 0;
}

.today-course-card {
  margin: 0;
}

.course-actions {
  margin-top: 10px;
  text-align: right;
}

.no-courses {
  padding: 40px 0;
}

.course-detail {
  padding: 10px;
}

.detail-actions {
  margin-top: 20px;
  text-align: center;
}
</style>