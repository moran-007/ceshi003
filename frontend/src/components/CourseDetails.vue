<template>
  <div class="course-details">
    <div class="details-header">
      <button @click="goBack" class="back-button">
        <span>← 返回仪表盘</span>
      </button>
      <h2>{{ courseDetails.courseName }}</h2>
    </div>
    
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="courseDetails" class="course-content">
      <!-- 课程基本信息卡片 -->
      <div class="course-info-card">
        <div class="info-header">
          <h3>课程信息</h3>
          <span v-if="courseDetails.status" 
                class="course-status" 
                :class="getCourseStatusClass(courseDetails.status)">
            {{ getCourseStatusText(courseDetails.status) }}
          </span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <label>授课教师:</label>
            <span>{{ courseDetails.teacherName }}</span>
          </div>
          <div class="info-item">
            <label>上课时间:</label>
            <span>{{ courseDetails.classTime }}</span>
          </div>
          <div class="info-item">
            <label>上课地点:</label>
            <span>{{ courseDetails.location }}</span>
          </div>
          <div class="info-item">
            <label>课程学分:</label>
            <span>{{ courseDetails.credits }} 学分</span>
          </div>
          <div class="info-item">
            <label>总课时:</label>
            <span>{{ courseDetails.totalHours }} 课时</span>
          </div>
          <div class="info-item">
            <label>剩余课时:</label>
            <span>{{ courseDetails.remainingHours }} 课时</span>
          </div>
        </div>
        
        <!-- 课程描述 -->
        <div v-if="courseDetails.description" class="course-description">
          <h4>课程简介</h4>
          <p>{{ courseDetails.description }}</p>
        </div>
        
        <!-- 课程进度 -->
        <div class="progress-section">
          <h4>学习进度</h4>
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: courseDetails.progressPercentage + '%' }"
              ></div>
            </div>
            <span class="progress-text">{{ courseDetails.progressPercentage }}%</span>
          </div>
        </div>
      </div>
      
      <!-- 课程大纲 -->
      <div class="syllabus-card">
        <h3>课程大纲</h3>
        <div class="syllabus-content">
          <div v-for="(chapter, index) in courseDetails.syllabus" :key="index" class="syllabus-chapter">
            <div class="chapter-header">
              <h4>{{ chapter.title }}</h4>
              <span class="chapter-status" :class="chapter.status">
                {{ chapter.status === 'completed' ? '已完成' : 
                   chapter.status === 'in-progress' ? '进行中' : '未开始' }}
              </span>
            </div>
            <div v-if="chapter.details" class="chapter-details">
              <p>{{ chapter.details }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 成绩记录卡片 -->
      <div class="grades-card">
        <h3>成绩记录</h3>
        <div class="grades-table-container">
          <table class="grades-table">
            <thead>
              <tr>
                <th>考试类型</th>
                <th>分数</th>
                <th>考试日期</th>
                <th>教师评价</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="grade in courseGrades" :key="grade.exam_type">
                <td>{{ grade.exam_type_text }}</td>
                <td :class="getGradeClass(grade.score_value)">{{ grade.score_value }}</td>
                <td>{{ grade.exam_date }}</td>
                <td>{{ grade.remarks || '无' }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="courseGrades.length === 0" class="empty-grades">
            <p>暂无成绩记录</p>
          </div>
        </div>
      </div>
      
      <!-- 课程安排卡片 -->
      <div class="schedule-card">
        <h3>近期课程安排</h3>
        <div class="schedule-list">
          <div v-for="session in courseSchedule" :key="session.id" class="schedule-item">
            <div class="schedule-header">
              <span class="session-date">{{ formatDate(session.date) }}</span>
              <span class="session-time">{{ session.time }}</span>
            </div>
            <div class="schedule-details">
              <span class="location">🏫 {{ session.location }}</span>
              <span class="teacher">👨‍🏫 {{ session.teacherName }}</span>
              <span class="content">📝 {{ session.content }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 最近上课记录 -->
      <div class="attendance-card">
        <h3>最近出勤记录</h3>
        <div class="attendance-list">
          <div v-for="(record, index) in courseDetails.recentAttendance" :key="index" class="attendance-item">
            <div class="attendance-info">
              <span class="attendance-date">{{ record.date }}</span>
              <span class="attendance-time">{{ record.time }}</span>
            </div>
            <div class="attendance-status">
              <span class="status-badge" :class="record.status">
                {{ record.status === 'present' ? '出勤' : 
                   record.status === 'late' ? '迟到' : '缺勤' }}
              </span>
              <span v-if="record.note" class="attendance-note">{{ record.note }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 学习资源卡片 -->
      <div class="resources-card">
        <h3>学习资源</h3>
        <div class="resources-list">
          <div v-for="resource in learningResources" :key="resource.id" class="resource-item">
            <div class="resource-icon">{{ getResourceIcon(resource.type) }}</div>
            <div class="resource-info">
              <div class="resource-name">{{ resource.name }}</div>
              <div class="resource-meta">
                <span class="resource-type">{{ resource.type }}</span>
                <span class="resource-size">{{ resource.size }}</span>
                <span class="resource-date">{{ resource.date }}</span>
              </div>
            </div>
            <button class="download-button" @click="downloadResource(resource)">
              下载
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="error-message">
      <p>无法加载课程详情</p>
      <button @click="loadCourseData" class="retry-button">重试</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userState } from '../store/index.js'

export default {
  name: 'CourseDetails',
  props: {
    courseId: {
      type: Number,
      default: 1
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    
    const isLoading = ref(false)
    
    // 获取课程ID，优先使用路由参数，其次使用props
    const courseId = computed(() => {
      return parseInt(route.params.id || props.courseId) || 1
    })
    
    // 获取课程详细信息
    const courseDetails = computed(() => {
      // 首先检查userState.mockData中是否有课程数据
      if (userState.mockData && userState.mockData.courses) {
        const course = userState.mockData.courses.find(c => c.courseId === courseId.value)
        if (course) {
          // 添加成绩数据
          if (userState.mockData.scores) {
            course.scores = userState.mockData.scores.filter(s => s.course_id === courseId.value)
          }
          return {
            id: course.courseId,
            courseName: course.name,
            teacherName: course.teacherName,
            classTime: '周一 08:00-10:00',
            location: 'A101',
            credits: course.credit,
            totalHours: course.totalHours,
            remainingHours: course.remainingHours,
            progressPercentage: course.progress,
            syllabus: generateSyllabus(),
            recentAttendance: generateAttendance(),
            scores: course.scores || []
          }
        }
      }
      
      // 提供默认的模拟课程数据
      const mockCourses = {
        1: {
          id: 1,
          courseName: '数据结构',
          teacherName: '张老师',
          classTime: '周一 08:00-10:00',
          location: 'A101',
          credits: 4,
          totalHours: 48,
          remainingHours: 12,
          progressPercentage: 75,
          description: '本课程主要介绍数据结构的基本概念、算法和应用。',
          syllabus: generateSyllabus(),
          recentAttendance: generateAttendance(),
          scores: [
            { exam_type: 'midterm', exam_type_text: '期中考试', score_value: 85, exam_date: '2023-10-15', remarks: '表现良好' },
            { exam_type: 'quiz', exam_type_text: '课堂测验', score_value: 92, exam_date: '2023-09-25', remarks: '优秀！' }
          ]
        },
        2: {
          id: 2,
          courseName: '操作系统',
          teacherName: '李老师',
          classTime: '周二 14:00-16:00',
          location: 'B202',
          credits: 4,
          totalHours: 48,
          remainingHours: 18,
          progressPercentage: 63,
          description: '本课程介绍操作系统的基本原理和设计方法。',
          syllabus: generateSyllabus(),
          recentAttendance: generateAttendance(),
          scores: [
            { exam_type: 'midterm', exam_type_text: '期中考试', score_value: 78, exam_date: '2023-10-10', remarks: '需要加强练习' }
          ]
        },
        3: {
          id: 3,
          courseName: '计算机网络',
          teacherName: '王老师',
          classTime: '周三 09:00-11:00',
          location: 'C303',
          credits: 3,
          totalHours: 36,
          remainingHours: 22,
          progressPercentage: 39,
          description: '本课程介绍计算机网络的基本概念、原理和技术。',
          syllabus: generateSyllabus(),
          recentAttendance: generateAttendance(),
          scores: [
            { exam_type: 'assignment', exam_type_text: '课后作业', score_value: 88, exam_date: '2023-09-30', remarks: '作业完成质量较高' }
          ]
        },
        4: {
          id: 4,
          courseName: '数据库原理',
          teacherName: '刘老师',
          classTime: '周四 10:00-12:00',
          location: 'D404',
          credits: 3,
          totalHours: 36,
          remainingHours: 8,
          progressPercentage: 78,
          description: '本课程介绍数据库系统的基本概念、原理和技术。',
          syllabus: generateSyllabus(),
          recentAttendance: generateAttendance(),
          scores: [
            { exam_type: 'midterm', exam_type_text: '期中考试', score_value: 65, exam_date: '2023-10-12', remarks: '及格，需要加强理解概念' }
          ]
        }
      }
      
      return mockCourses[courseId.value] || mockCourses[1]
    })
    
    // 获取课程安排
    const courseSchedule = computed(() => {
      // 生成未来5周的课程安排
      const schedule = []
      const today = new Date()
      
      for (let i = 0; i < 5; i++) {
        // 每周一上课
        const classDate = new Date(today)
        classDate.setDate(today.getDate() + (8 - today.getDay() + i * 7) % 7)
        
        schedule.push({
          id: i + 1,
          date: classDate,
          time: '08:00-10:00',
          location: 'A101',
          teacherName: courseDetails.value.teacherName || '张老师',
          content: `第${i + 1}章节内容: ${courseDetails.value.courseName}进阶知识`
        })
      }
      
      return schedule
    })
    
    // 获取课程成绩
    const courseGrades = computed(() => {
      // 从courseDetails中获取成绩数据
      if (courseDetails.value.scores && courseDetails.value.scores.length > 0) {
        return courseDetails.value.scores
      }
      
      return getDefaultGrades()
    })
    
    // 获取学习资源
    const learningResources = computed(() => {
      // 模拟学习资源数据
      return [
        {
          id: 1,
          name: `${courseDetails.value.courseName}课程大纲.pdf`,
          type: '文档',
          size: '1.2MB',
          date: '2023-09-01',
          url: '#'
        },
        {
          id: 2,
          name: `第1章课件.ppt`,
          type: '演示文稿',
          size: '3.5MB',
          date: '2023-09-05',
          url: '#'
        },
        {
          id: 3,
          name: `课后习题.docx`,
          type: '文档',
          size: '850KB',
          date: '2023-09-10',
          url: '#'
        },
        {
          id: 4,
          name: `实验指导书.pdf`,
          type: '文档',
          size: '2.3MB',
          date: '2023-09-15',
          url: '#'
        }
      ]
    })
    
    // 生成课程大纲
    const generateSyllabus = () => {
      return [
        {
          title: '第一章：课程概述',
          status: 'completed',
          details: '介绍课程基本内容、学习方法和考核要求'
        },
        {
          title: '第二章：基础理论',
          status: 'in-progress',
          details: '深入讲解课程核心概念和基础理论'
        },
        {
          title: '第三章：应用实践',
          status: 'not-started',
          details: '通过实际案例讲解理论知识的应用'
        },
        {
          title: '第四章：高级技巧',
          status: 'not-started',
          details: '介绍课程相关的高级应用技巧'
        }
      ]
    }
    
    // 生成出勤记录
    const generateAttendance = () => {
      return [
        {
          date: '2024-01-15',
          time: '08:00-10:00',
          status: 'present',
          note: '正常出勤'
        },
        {
          date: '2024-01-08',
          time: '08:00-10:00',
          status: 'present',
          note: '正常出勤'
        },
        {
          date: '2024-01-01',
          time: '08:00-10:00',
          status: 'late',
          note: '迟到15分钟'
        }
      ]
    }
    
    // 格式化日期
    const formatDate = (date) => {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    
    // 获取课程状态类
    const getCourseStatusClass = (status) => {
      const map = {
        ongoing: 'status-ongoing',
        completed: 'status-completed',
        upcoming: 'status-upcoming'
      }
      return map[status] || ''
    }
    
    // 获取课程状态文本
    const getCourseStatusText = (status) => {
      const map = {
        ongoing: '进行中',
        completed: '已完成',
        upcoming: '未开始'
      }
      return map[status] || '未知'
    }
    
    // 获取成绩样式类
    const getGradeClass = (score) => {
      if (score >= 90) return 'grade-excellent'
      if (score >= 80) return 'grade-good'
      if (score >= 60) return 'grade-pass'
      return 'grade-fail'
    }
    
    // 获取资源图标
    const getResourceIcon = (type) => {
      const iconMap = {
        '文档': '📄',
        '演示文稿': '📊',
        '视频': '🎬',
        '音频': '🎵',
        '图片': '🖼️',
        '代码': '💻'
      }
      return iconMap[type] || '📎'
    }
    
    // 下载资源
    const downloadResource = (resource) => {
      console.log('下载资源:', resource.name)
      alert(`正在下载: ${resource.name}`)
    }
    
    // 获取默认课程详情
    const getDefaultCourseDetails = (id) => {
      const courseNames = ['数据结构', '操作系统', '计算机网络', '数据库原理', '软件工程']
      return {
        id: id,
        courseName: courseNames[id % courseNames.length] || '未知课程',
        teacherName: '张老师',
        classTime: '周一 08:00-10:00',
        location: 'A101',
        credits: 4,
        totalHours: 40,
        remainingHours: 28,
        progressPercentage: 30,
        description: '这是一门重要的专业课程，旨在帮助学生掌握相关领域的核心知识和技能。课程内容包括理论讲解和实践操作，通过系统的学习，学生将能够应用所学知识解决实际问题。',
        syllabus: generateSyllabus(),
        recentAttendance: generateAttendance()
      }
    }
    
    // 获取默认成绩数据
    const getDefaultGrades = () => {
      return [
        {
          exam_type: 'midterm',
          exam_type_text: '期中考试',
          score_value: 85,
          exam_date: '2023-10-15',
          remarks: '表现良好，继续加油！'
        },
        {
          exam_type: 'quiz',
          exam_type_text: '课堂测验',
          score_value: 92,
          exam_date: '2023-09-25',
          remarks: '优秀！'
        },
        {
          exam_type: 'assignment',
          exam_type_text: '课后作业',
          score_value: 88,
          exam_date: '2023-09-30',
          remarks: '作业完成质量较高'
        }
      ]
    }
    
    // 返回上一页
    const goBack = () => {
      router.push('/home/student/dashboard')
    }
    
    // 加载课程数据（保留兼容性）
    const loadCourseData = () => {
      // 由于使用了computed，这里不需要实际异步加载
      console.log('Loading course data for ID:', courseId.value)
    }
    
    // 组件挂载时加载数据
    onMounted(() => {
      loadCourseData()
    })
    
    return {
      courseDetails,
      isLoading,
      courseSchedule,
      courseGrades,
      learningResources,
      loadCourseData,
      goBack,
      formatDate,
      getCourseStatusClass,
      getCourseStatusText,
      getGradeClass,
      getResourceIcon,
      downloadResource
    }
  }
}
</script>

<style scoped>
.course-details {
  padding: 20px;
  max-width: 1024px;
  margin: 0 auto;
}

.details-header {
  margin-bottom: 30px;
}

.details-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 600;
  margin: 15px 0 0 0;
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #5a67d8;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.course-content {
  display: grid;
  gap: 25px;
}

.course-info-card,
.syllabus-card,
.attendance-card,
.grades-card,
.schedule-card,
.resources-card {
  background-color: #fafbfc;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.course-info-card h3,
.syllabus-card h3,
.attendance-card h3,
.grades-card h3,
.schedule-card h3,
.resources-card h3 {
  color: #555;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 2px solid #e1e8ed;
  padding-bottom: 10px;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.info-header h3 {
  margin: 0;
  border: none;
  padding: 0;
}

.course-status {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.status-ongoing {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-completed {
  background-color: #e3f2fd;
  color: #2196f3;
}

.status-upcoming {
  background-color: #fff3e0;
  color: #ff9800;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.info-item span {
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.course-description {
  margin-bottom: 25px;
}

.course-description h4 {
  color: #555;
  margin-bottom: 10px;
  font-size: 16px;
}

.course-description p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.progress-section h4 {
  color: #555;
  margin-bottom: 15px;
  font-size: 16px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-bar {
  flex: 1;
  height: 12px;
  background-color: #e1e8ed;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.progress-text {
  color: #667eea;
  font-weight: 600;
  min-width: 40px;
}

.syllabus-chapter {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.syllabus-chapter:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chapter-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.chapter-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.chapter-status.completed {
  background-color: #e8f5e9;
  color: #4caf50;
}

.chapter-status.in-progress {
  background-color: #e3f2fd;
  color: #2196f3;
}

.chapter-status.not-started {
  background-color: #f5f5f5;
  color: #757575;
}

.chapter-details p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

/* 成绩表格样式 */
.grades-table-container {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
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
}

.grades-table tr:last-child td {
  border-bottom: none;
}

.grades-table tr:hover {
  background-color: #f8f9fa;
}

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

.empty-grades {
  text-align: center;
  padding: 30px;
  color: #999;
  font-style: italic;
}

/* 课程安排样式 */
.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.schedule-item {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.schedule-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.session-date {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.session-time {
  background-color: #e0f7fa;
  color: #00acc1;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.schedule-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: #666;
}

/* 出勤记录样式 */
.attendance-item {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attendance-info {
  display: flex;
  gap: 15px;
}

.attendance-date {
  color: #333;
  font-weight: 500;
}

.attendance-time {
  color: #666;
}

.attendance-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.present {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-badge.late {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-badge.absent {
  background-color: #ffebee;
  color: #f44336;
}

.attendance-note {
  color: #757575;
  font-size: 12px;
}

/* 学习资源样式 */
.resources-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.resource-item {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.resource-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.resource-icon {
  font-size: 24px;
  margin-right: 15px;
  flex-shrink: 0;
}

.resource-info {
  flex-grow: 1;
}

.resource-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.resource-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.download-button {
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.download-button:hover {
  background-color: #5a67d8;
}

.error-message {
  text-align: center;
  padding: 50px;
  color: #e53935;
}

.retry-button {
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #5a67d8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .details-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .info-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .attendance-item,
  .resource-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .attendance-info,
  .schedule-details {
    flex-direction: column;
    gap: 5px;
  }
  
  .resource-icon {
    align-self: center;
    margin-right: 0;
  }
  
  .download-button {
    align-self: center;
    width: 100%;
  }
  
  .schedule-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .grades-table th,
  .grades-table td {
    padding: 10px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .course-details {
    padding: 15px;
  }
  
  .details-header h2 {
    font-size: 24px;
  }
  
  .course-info-card,
  .syllabus-card,
  .attendance-card,
  .grades-card,
  .schedule-card,
  .resources-card {
    padding: 15px;
  }
}
</style>
