<template>
  <div class="teacher-course-schedule">
    <div class="page-header">
      <button class="back-button" @click="goBack">← 返回仪表盘</button>
      <h2>课程安排管理</h2>
    </div>

    <div class="schedule-container">
      <!-- 筛选和控制栏 -->
      <div class="filter-bar">
        <div class="filter-section">
          <label>周次:</label>
          <select v-model="currentWeek" @change="loadSchedule">
            <option v-for="week in totalWeeks" :key="week" :value="week">第{{ week }}周</option>
          </select>
        </div>
        <div class="filter-section">
          <label>日期:</label>
          <input type="date" v-model="selectedDate" @change="onDateChange">
        </div>
        <div class="filter-actions">
          <button class="action-button export-button" @click="exportSchedule">导出课表</button>
          <button class="action-button primary" @click="showAddCourseDialog = true">添加课程</button>
        </div>
      </div>

      <!-- 课程表视图 -->
      <div class="schedule-calendar">
        <div class="calendar-header">
          <div class="time-column"></div>
          <div class="day-column" v-for="day in weekDays" :key="day.name">
            <div class="day-name">{{ day.name }}</div>
            <div class="day-date">{{ day.date }}</div>
          </div>
        </div>
        <div class="calendar-body">
          <div v-for="(timeSlot, index) in timeSlots" :key="index" class="schedule-row">
            <div class="time-cell">
              <div class="time-range">{{ timeSlot.time }}</div>
            </div>
            <div v-for="(day, dayIndex) in weekDays" :key="day.name" class="schedule-cell">
              <div 
                v-for="course in getCoursesForSlot(dayIndex, index)" 
                :key="course.id"
                class="course-item"
                :class="{ 'single-class': course.duration === 1, 'double-class': course.duration === 2 }"
                :style="{ 
                  backgroundColor: course.color,
                  height: course.duration === 2 ? 'calc(200% - 4px)' : '100%',
                  top: course.duration === 2 ? '0' : '0'
                }"
              >
                <div class="course-name">{{ course.courseName }}</div>
                <div class="course-info">
                  <span>{{ course.classroom }}</span>
                  <span>{{ course.studentCount }}人</span>
                </div>
                <div class="course-actions">
                  <button class="mini-button" @click.stop="viewCourseDetails(course.id)">详情</button>
                  <button class="mini-button" @click.stop="goToAttendance(course.id)">签到</button>
                  <button class="mini-button" @click.stop="openEditCourseDialog(course)">编辑</button>
                  <button class="mini-button" @click.stop="deleteCourse(course.id)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 今日课程 -->
      <div class="today-section">
        <h3 class="section-title">今日课程 ({{ formatTodayDate() }})</h3>
        <div class="today-courses">
          <div v-for="course in todayCourses" :key="course.id" class="today-course-item">
            <div class="course-time">{{ course.time }}</div>
            <div class="course-main">
              <div class="course-title">{{ course.courseName }}</div>
              <div class="course-detail">教室: {{ course.classroom }} | 学生: {{ course.studentCount }}人</div>
            </div>
            <div class="course-actions">
              <button class="action-button small primary" @click="goToAttendance(course.id)">
                {{ isCourseStarted(course.time) ? '开始签到' : '课程未开始' }}
              </button>
            </div>
          </div>
          <div v-if="todayCourses.length === 0" class="empty-state">
            <p>今日暂无课程安排</p>
          </div>
        </div>
      </div>

      <!-- 即将到来的课程 -->
      <div class="upcoming-section">
        <h3 class="section-title">即将到来的课程</h3>
        <div class="upcoming-courses">
          <div v-for="course in upcomingCourses" :key="course.id" class="upcoming-course-item">
            <div class="course-date">{{ course.date }}</div>
            <div class="course-info">
              <div class="course-time">{{ course.time }}</div>
              <div class="course-name">{{ course.courseName }}</div>
              <div class="course-detail">教室: {{ course.classroom }}</div>
            </div>
            <div class="course-actions">
              <button class="action-button small" @click="viewCourseDetails(course.id)">详情</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 添加/编辑课程对话框 -->
    <div v-if="showAddCourseDialog" class="dialog-overlay" @click="showAddCourseDialog = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>{{ editCourseId ? '编辑课程' : '添加课程' }}</h3>
          <button class="close-button" @click="showAddCourseDialog = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>课程名称:</label>
            <input type="text" v-model="courseForm.courseName" placeholder="请输入课程名称">
          </div>
          <div class="form-group">
            <label>教室:</label>
            <input type="text" v-model="courseForm.classroom" placeholder="请输入教室">
          </div>
          <div class="form-group">
            <label>学生人数:</label>
            <input type="number" v-model.number="courseForm.studentCount" min="1" placeholder="请输入学生人数">
          </div>
          <div class="form-group">
            <label>星期:</label>
            <select v-model="courseForm.weekDay">
              <option value="0">周一</option>
              <option value="1">周二</option>
              <option value="2">周三</option>
              <option value="3">周四</option>
              <option value="4">周五</option>
            </select>
          </div>
          <div class="form-group">
            <label>时间段:</label>
            <select v-model="courseForm.timeSlot">
              <option v-for="(slot, index) in timeSlots" :key="index" :value="index">{{ slot.time }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>课程时长:</label>
            <select v-model="courseForm.duration">
              <option value="1">1节 (90分钟)</option>
              <option value="2">2节 (180分钟)</option>
            </select>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="action-button" @click="showAddCourseDialog = false">取消</button>
          <button class="action-button primary" @click="saveCourse">{{ editCourseId ? '更新' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'TeacherCourseSchedule',
  setup() {
    const router = useRouter()
    const currentWeek = ref(1)
    const totalWeeks = 20
    const selectedDate = ref('')
    const showAddCourseDialog = ref(false)
    const editCourseId = ref(null)
    
    // 课程表单数据
    const courseForm = reactive({
      courseName: '',
      classroom: '',
      studentCount: 0,
      weekDay: 0,
      timeSlot: 0,
      duration: 1
    })
    
    // 课程颜色列表
    const courseColors = [
      '#e3f2fd', '#e8f5e9', '#fff3e0', '#f3e5f5', '#e0f7fa',
      '#fff8e1', '#f1f8e9', '#fafafa', '#e1f5fe', '#fce4ec'
    ]
    
    // 模拟课程数据
    const courses = ref([
      // 周一课程
      { id: 101, courseName: '数据结构', classroom: 'A101', studentCount: 35, weekDay: 0, timeSlot: 0, duration: 2, color: '#e3f2fd' },
      { id: 102, courseName: '算法分析', classroom: 'B202', studentCount: 28, weekDay: 0, timeSlot: 3, duration: 2, color: '#e8f5e9' },
      
      // 周二课程
      { id: 103, courseName: '数据库原理', classroom: 'C303', studentCount: 42, weekDay: 1, timeSlot: 1, duration: 2, color: '#fff3e0' },
      
      // 周三课程
      { id: 104, courseName: '操作系统', classroom: 'D404', studentCount: 38, weekDay: 2, timeSlot: 0, duration: 2, color: '#f3e5f5' },
      { id: 105, courseName: '计算机网络', classroom: 'A102', studentCount: 45, weekDay: 2, timeSlot: 4, duration: 1, color: '#e0f7fa' },
      
      // 周四课程
      { id: 106, courseName: '人工智能', classroom: 'E505', studentCount: 30, weekDay: 3, timeSlot: 2, duration: 2, color: '#fff8e1' },
      
      // 周五课程
      { id: 107, courseName: '机器学习', classroom: 'B203', studentCount: 25, weekDay: 4, timeSlot: 1, duration: 2, color: '#f1f8e9' },
      { id: 108, courseName: '软件工程', classroom: 'C304', studentCount: 32, weekDay: 4, timeSlot: 4, duration: 1, color: '#fafafa' }
    ])
    
    // 时间段定义
    const timeSlots = [
      { time: '08:30-10:00', index: 0 },
      { time: '10:20-11:50', index: 1 },
      { time: '14:00-15:30', index: 2 },
      { time: '15:50-17:20', index: 3 },
      { time: '19:00-20:30', index: 4 }
    ]
    
    // 计算本周日期
    const weekDays = computed(() => {
      const today = new Date()
      const currentDay = today.getDay() || 7
      const monday = new Date(today)
      monday.setDate(today.getDate() - currentDay + 1)
      
      return [
        { name: '周一', date: formatDate(monday) },
        { name: '周二', date: formatDate(new Date(monday.getTime() + 86400000)) },
        { name: '周三', date: formatDate(new Date(monday.getTime() + 86400000 * 2)) },
        { name: '周四', date: formatDate(new Date(monday.getTime() + 86400000 * 3)) },
        { name: '周五', date: formatDate(new Date(monday.getTime() + 86400000 * 4)) }
      ]
    })
    
    // 获取指定时间段的课程
    const getCoursesForSlot = (dayIndex, timeSlotIndex) => {
      return courses.value.filter(course => 
        course.weekDay === dayIndex && course.timeSlot === timeSlotIndex
      )
    }
    
    // 今日课程
    const todayCourses = computed(() => {
      const todayIndex = new Date().getDay() || 1 // 转换为0-4的索引
      const today = todayIndex - 1
      
      if (today < 0 || today > 4) return []
      
      return courses.value
        .filter(course => course.weekDay === today)
        .map(course => ({
          ...course,
          time: timeSlots[course.timeSlot].time
        }))
        .sort((a, b) => a.timeSlot - b.timeSlot)
    })
    
    // 即将到来的课程
    const upcomingCourses = computed(() => {
      // 模拟未来3天的课程
      return [
        {
          id: 201,
          courseName: '高级编程技术',
          classroom: 'F606',
          date: '明天 周三',
          time: '14:00-15:30'
        },
        {
          id: 202,
          courseName: '云计算基础',
          classroom: 'G707',
          date: '后天 周四',
          time: '10:20-11:50'
        }
      ]
    })
    
    // 格式化日期
    const formatDate = (date) => {
      const month = date.getMonth() + 1
      const day = date.getDate()
      return `${month}/${day}`
    }
    
    // 格式化今日日期
    const formatTodayDate = () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth() + 1
      const day = today.getDate()
      return `${year}年${month}月${day}日`
    }
    
    // 检查课程是否已开始
    const isCourseStarted = (courseTime) => {
      const [startTime] = courseTime.split('-')
      const [startHour, startMinute] = startTime.split(':').map(Number)
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      
      return currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)
    }
    
    // 加载课表
    const loadSchedule = () => {
      console.log('加载第', currentWeek.value, '周课表')
      // 这里可以根据周次加载不同的数据
    }
    
    // 日期改变处理
    const onDateChange = () => {
      console.log('选择日期:', selectedDate.value)
      // 这里可以根据选择的日期更新课表显示
    }
    
    // 检查课程时间冲突
    const checkCourseConflict = (weekDay, timeSlot, duration, excludeId = null) => {
      for (let i = 0; i < duration; i++) {
        const slotIndex = timeSlot + i
        if (slotIndex >= timeSlots.length) return true // 超出时间段范围
        
        const conflict = courses.value.some(course => 
          course.id !== excludeId && 
          course.weekDay === weekDay && 
          ((course.timeSlot <= slotIndex && course.timeSlot + course.duration > slotIndex) ||
           (slotIndex <= course.timeSlot && slotIndex + 1 > course.timeSlot))
        )
        
        if (conflict) return true
      }
      return false
    }
    
    // 重置课程表单
    const resetCourseForm = () => {
      courseForm.courseName = ''
      courseForm.classroom = ''
      courseForm.studentCount = 0
      courseForm.weekDay = 0
      courseForm.timeSlot = 0
      courseForm.duration = 1
      editCourseId.value = null
    }
    
    // 打开编辑课程对话框
    const openEditCourseDialog = (course) => {
      courseForm.courseName = course.courseName
      courseForm.classroom = course.classroom
      courseForm.studentCount = course.studentCount
      courseForm.weekDay = course.weekDay
      courseForm.timeSlot = course.timeSlot
      courseForm.duration = course.duration
      editCourseId.value = course.id
      showAddCourseDialog.value = true
    }
    
    // 保存课程
    const saveCourse = () => {
      // 表单验证
      if (!courseForm.courseName || !courseForm.classroom || courseForm.studentCount <= 0) {
        alert('请填写完整的课程信息')
        return
      }
      
      // 检查时间冲突
      if (checkCourseConflict(courseForm.weekDay, courseForm.timeSlot, courseForm.duration, editCourseId.value)) {
        alert('所选时间段存在课程冲突，请重新选择')
        return
      }
      
      // 随机选择一个颜色
      const randomColor = courseColors[Math.floor(Math.random() * courseColors.length)]
      
      if (editCourseId.value) {
        // 编辑现有课程
        const index = courses.value.findIndex(c => c.id === editCourseId.value)
        if (index !== -1) {
          courses.value[index] = {
            ...courses.value[index],
            ...courseForm,
            color: randomColor
          }
        }
      } else {
        // 添加新课程
        const newCourse = {
          id: Date.now(), // 使用时间戳作为临时ID
          ...courseForm,
          color: randomColor
        }
        courses.value.push(newCourse)
      }
      
      // 关闭对话框并重置表单
      showAddCourseDialog.value = false
      resetCourseForm()
      alert(editCourseId.value ? '课程更新成功' : '课程添加成功')
    }
    
    // 删除课程
    const deleteCourse = (courseId) => {
      if (confirm('确定要删除这门课程吗？')) {
        courses.value = courses.value.filter(course => course.id !== courseId)
        alert('课程删除成功')
      }
    }
    
    // 导出课表
    const exportSchedule = () => {
      alert('课表导出功能开发中...')
    }
    
    // 查看课程详情
    const viewCourseDetails = (courseId) => {
      router.push(`/home/teacher/course-details?id=${courseId}`)
    }
    
    // 前往签到页面
    const goToAttendance = (courseId) => {
      router.push(`/home/teacher/attendance?courseId=${courseId}`)
    }
    
    // 返回仪表盘
    const goBack = () => {
      router.push('/home/teacher/dashboard')
    }
    
    onMounted(() => {
      // 初始化认证信息
      if (!localStorage.getItem('userToken')) {
        localStorage.setItem('userToken', 'mock-token-teacher-789')
        localStorage.setItem('userRole', 'teacher')
      }
      
      // 设置当前日期
      const today = new Date()
      const formatted = today.toISOString().split('T')[0]
      selectedDate.value = formatted
    })
    
    return {
      currentWeek,
      totalWeeks,
      selectedDate,
      timeSlots,
      weekDays,
      courses,
      courseForm,
      showAddCourseDialog,
      getCoursesForSlot,
      todayCourses,
      upcomingCourses,
      formatTodayDate,
      isCourseStarted,
      loadSchedule,
      onDateChange,
      exportSchedule,
      viewCourseDetails,
      goToAttendance,
      goBack,
      saveCourse,
      resetCourseForm,
      openEditCourseDialog,
      deleteCourse
    }
  }
}
</script>

<style scoped>
.teacher-course-schedule {
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

.back-button:active {
  transform: scale(0.98);
}

.page-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.schedule-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 20px 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
  background-color: #f0f2f5;
  color: #333;
}

.action-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.action-button:active {
  transform: translateY(0);
}

.action-button.primary {
  background-color: #1890ff;
  color: white;
}

.action-button.export-button {
  background-color: #52c41a;
  color: white;
}

.action-button.small {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  /* 对话框样式 */
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .dialog-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.2s ease;
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .dialog-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  
  .close-button:hover {
    background-color: #f0f0f0;
    color: #333;
  }
  
  .dialog-body {
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
  
  .form-group input,
  .form-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s;
  }
  
  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
    background-color: #fafafa;
    border-radius: 0 0 8px 8px;
  }
  
  /* 课程操作按钮 */
  .mini-button {
    padding: 4px 8px;
    margin: 2px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    background-color: rgba(255, 255, 255, 0.8);
    color: #333;
  }
  
  .mini-button:hover {
    background-color: rgba(255, 255, 255, 1);
    transform: scale(1.05);
  }

.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-section label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.filter-section select,
.filter-section input {
  padding: 8px 12px;
  border: 1px solid #e0e2e5;
  border-radius: 6px;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  gap: 15px;
}

/* 课程表 */
.schedule-calendar {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.calendar-header {
  display: grid;
  grid-template-columns: 100px repeat(5, 1fr);
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.time-column {
  font-weight: 600;
  color: #333;
}

.day-column {
  text-align: center;
}

.day-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.day-date {
  font-size: 14px;
  color: #666;
}

.calendar-body {
  display: grid;
  grid-template-rows: repeat(5, 120px);
}

.schedule-row {
  display: grid;
  grid-template-columns: 100px repeat(5, 1fr);
  border-bottom: 1px solid #f0f2f5;
  position: relative;
}

.schedule-row:last-child {
  border-bottom: none;
}

.time-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e2e5;
}

.schedule-cell {
  border-right: 1px solid #f0f2f5;
  position: relative;
  min-width: 180px;
}

.schedule-cell:last-child {
  border-right: none;
}

/* 课程项 */
.course-item {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: 10px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.course-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-info {
  font-size: 12px;
  color: #666;
  display: flex;
  justify-content: space-between;
}

.course-actions {
  display: flex;
  gap: 5px;
  margin-top: auto;
}

.mini-button {
  padding: 4px 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.mini-button:hover {
  background-color: white;
}

/* 今日课程 */
.today-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f2f5;
}

.today-courses {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.today-course-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.today-course-item:hover {
  background-color: #f0f2f5;
  transform: translateX(5px);
}

.course-time {
  font-size: 18px;
  font-weight: 600;
  color: #667eea;
  margin-right: 30px;
  min-width: 100px;
}

.course-main {
  flex: 1;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.course-detail {
  font-size: 14px;
  color: #666;
}

/* 即将到来的课程 */
.upcoming-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.upcoming-courses {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.upcoming-course-item {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.upcoming-course-item:hover {
  background-color: #f0f2f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.course-date {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 10px;
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
}

.action-button.primary {
  background-color: #667eea;
  color: white;
}

.action-button.primary:hover {
  background-color: #5a67d8;
}

.action-button.export-button {
  background-color: #4caf50;
  color: white;
}

.action-button.export-button:hover {
  background-color: #45a049;
}

.action-button.small {
  padding: 8px 16px;
  font-size: 13px;
  background-color: #f0f2f5;
  color: #333;
}

.action-button.small:hover {
  background-color: #e0e2e5;
}

.action-button.small.primary {
  background-color: #667eea;
  color: white;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  background-color: #f0f2f5;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .today-course-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .course-time {
    margin-right: 0;
  }
  
  .course-actions {
    width: 100%;
  }
  
  .action-button {
    width: 100%;
    text-align: center;
  }
  
  .upcoming-courses {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .schedule-calendar,
  .today-section,
  .upcoming-section {
    padding: 20px;
  }
}
</style>