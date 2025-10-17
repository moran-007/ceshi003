import { reactive, computed } from 'vue'
import mockDataGenerator from '../utils/mockDataGenerator.js'

// 用户状态管理
const userState = reactive({
  isLoggedIn: false,
  username: 'student1',
  role: 'student',
  userId: '101',
  loginError: '',
  // 学生相关数据
  studentData: {
    classSchedule: [],
    learningProgress: {},
    studentId: '2022001',
    class: '2022级计算机1班'
  },
  // 教师相关数据
  teacherData: {
    teachingPerformance: {}
  },
  // 管理员相关数据
  adminData: {
    users: [],
    teachers: []
  },
  
  // 完整数据模型
  dataModel: null,
  
  // 添加mockData属性，提供给组件使用的模拟数据
  get mockData() {
    if (!this.dataModel) {
      // 提供默认的模拟数据
      return {
        learningProgress: {
          totalCourses: 8,
          completedCourses: 3,
          ongoingCourses: 5,
          progressPercentage: 38,
          remainingHours: 42,
          avgScore: 82
        },
        classSchedule: [
          {
            id: 1,
            courseId: 1,
            name: '数据结构',
            courseName: '数据结构',
            teacherName: '张老师',
            time: '周一 08:00-10:00',
            location: 'A101',
            remainingHours: 12,
            credit: 4,
            totalHours: 48,
            progress: 75
          },
          {
            id: 2,
            courseId: 2,
            name: '操作系统',
            courseName: '操作系统',
            teacherName: '李老师',
            time: '周三 14:00-16:00',
            location: 'B202',
            remainingHours: 18,
            credit: 4,
            totalHours: 48,
            progress: 63
          },
          {
            id: 3,
            courseId: 3,
            name: '计算机网络',
            courseName: '计算机网络',
            teacherName: '王老师',
            time: '周五 10:00-12:00',
            location: 'C303',
            remainingHours: 22,
            credit: 3,
            totalHours: 36,
            progress: 39
          },
          {
            id: 4,
            courseId: 4,
            name: '数据库原理',
            courseName: '数据库原理',
            teacherName: '刘老师',
            time: '周二 09:00-11:00',
            location: 'D404',
            remainingHours: 8,
            credit: 3,
            totalHours: 36,
            progress: 78
          }
        ],
        scores: [
          {
            score_id: 1,
            course_id: 1,
            course_name: '数据结构',
            exam_type: 'midterm',
            exam_type_text: '期中考试',
            score_value: 85,
            exam_date: '2023-10-15',
            remarks: '表现良好，继续加油！'
          },
          {
            score_id: 2,
            course_id: 1,
            course_name: '数据结构',
            exam_type: 'quiz',
            exam_type_text: '课堂测验',
            score_value: 92,
            exam_date: '2023-09-25',
            remarks: '优秀！'
          },
          {
            score_id: 3,
            course_id: 2,
            course_name: '操作系统',
            exam_type: 'midterm',
            exam_type_text: '期中考试',
            score_value: 78,
            exam_date: '2023-10-10',
            remarks: '基础掌握较好，但需要加强练习'
          },
          {
            score_id: 4,
            course_id: 3,
            course_name: '计算机网络',
            exam_type: 'assignment',
            exam_type_text: '课后作业',
            score_value: 88,
            exam_date: '2023-09-30',
            remarks: '作业完成质量较高'
          },
          {
            score_id: 5,
            course_id: 4,
            course_name: '数据库原理',
            exam_type: 'midterm',
            exam_type_text: '期中考试',
            score_value: 65,
            exam_date: '2023-10-12',
            remarks: '及格，需要加强理解概念'
          },
          {
            score_id: 6,
            course_id: 2,
            course_name: '操作系统',
            exam_type: 'quiz',
            exam_type_text: '课堂测验',
            score_value: 83,
            exam_date: '2023-10-05',
            remarks: '表现不错'
          }
        ],
        courses: [
          {
            courseId: 1,
            name: '数据结构',
            course_name: '数据结构',
            teacherName: '张老师',
            classTime: '周一 08:00-10:00',
            location: 'A101',
            credit: 4,
            totalHours: 48,
            remainingHours: 12,
            progress: 75,
            description: '数据结构是计算机科学的基础课程，主要介绍数据的逻辑结构、存储结构以及相关操作算法。',
            status: 'ongoing'
          },
          {
            courseId: 2,
            name: '操作系统',
            course_name: '操作系统',
            teacherName: '李老师',
            classTime: '周三 14:00-16:00',
            location: 'B202',
            credit: 4,
            totalHours: 48,
            remainingHours: 18,
            progress: 63,
            description: '操作系统是管理计算机硬件与软件资源的系统软件，本课程介绍操作系统的基本原理和实现技术。',
            status: 'ongoing'
          },
          {
            courseId: 3,
            name: '计算机网络',
            course_name: '计算机网络',
            teacherName: '王老师',
            classTime: '周五 10:00-12:00',
            location: 'C303',
            credit: 3,
            totalHours: 36,
            remainingHours: 22,
            progress: 39,
            description: '计算机网络课程介绍计算机网络的基本概念、协议体系和网络应用开发。',
            status: 'ongoing'
          },
          {
            courseId: 4,
            name: '数据库原理',
            course_name: '数据库原理',
            teacherName: '刘老师',
            classTime: '周二 09:00-11:00',
            location: 'D404',
            credit: 3,
            totalHours: 36,
            remainingHours: 8,
            progress: 78,
            description: '数据库原理课程介绍数据库系统的基本概念、关系数据库理论、SQL语言和数据库设计方法。',
            status: 'ongoing'
          }
        ]
      }
    }
    // 从dataModel中提取需要的数据
    return {
      learningProgress: this.studentData.learningProgress,
      classSchedule: this.studentData.classSchedule,
      scores: this.dataModel.scores || [],
      courses: this.dataModel.courses || []
    }
  },
  
  // 添加userRole作为role的别名
  get userRole() {
    return this.role
  },
  
  // 登录函数
  async login(username, password) {
    try {
      // 重置登录错误
      this.loginError = ''
      
      // 调用后端API进行登录验证
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()
      
      if (data.success) {
        // 登录成功
        this.isLoggedIn = true
        this.username = data.data.user.username
        this.role = data.data.user.roleName || ''
        this.userId = data.data.user.userId || ''
        
        // 保存到localStorage
        localStorage.setItem('userToken', data.data.token)
        localStorage.setItem('username', data.data.user.username)
        localStorage.setItem('userRole', data.data.user.roleName || '')
        localStorage.setItem('userId', data.data.user.userId || '')
        
        // 生成模拟数据
        this.generateMockData(this.role)
        
        return true
      } else {
        // 登录失败
        console.error('Login failed:', data.message)
        this.loginError = data.message || '登录失败'
        return false
      }
    } catch (error) {
      console.error('Login API error:', error)
      // 如果API调用失败，使用备用的模拟登录逻辑
      console.log('Using fallback mock login...')
      let role = ''
      if (username.includes('student')) {
        role = 'student'
      } else if (username.includes('teacher')) {
        role = 'teacher'
      } else if (username.includes('admin')) {
        role = 'admin'
      }

      if (username && password) {
        this.isLoggedIn = true
        this.username = username
        this.role = role
        
        // 保存到localStorage
        localStorage.setItem('userToken', 'mock-token-' + Date.now())
        localStorage.setItem('username', username)
        localStorage.setItem('userRole', role)
        
        // 生成模拟数据
        this.generateMockData(role)
        
        return true
      }
      this.loginError = error.message || '登录失败'
      return false
    }
  },
  
  // 登出函数
  logout() {
    this.isLoggedIn = false
    this.username = ''
    this.role = ''
    this.loginError = ''
    this.dataModel = null
    
    // 清除localStorage
    localStorage.removeItem('userToken')
    localStorage.removeItem('username')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
  },
  
  // 生成模拟数据 - 使用mockDataGenerator
  generateMockData(role) {
    try {
      // 生成完整的数据模型
      this.dataModel = mockDataGenerator.generateCompleteData()
    } catch (error) {
      console.log('Using fallback mock data structure')
      // 如果生成器出错，使用备用数据结构
      this.dataModel = {
        students: [
          {
            student_id: 1,
            student_no: '2022001',
            name: '张三',
            user_id: 101
          }
        ],
        teachers: [
          {
            teacher_id: 1,
            name: '张老师'
          }
        ],
        courses: [
          {
            course_id: 1,
            course_name: '数据结构',
            description: '数据结构是计算机科学的基础课程',
            credit: 4,
            total_hours: 48,
            status: 'published'
          },
          {
            course_id: 2,
            course_name: '操作系统',
            description: '操作系统课程介绍',
            credit: 4,
            total_hours: 48,
            status: 'published'
          }
        ],
        schedules: [],
        scores: [],
        studentCourses: []
      }
    }
    
    if (role === 'student') {
      // 使用丰富的模拟数据，确保学生页面可以正常显示
      this.studentData = {
        studentId: '2022001',
        class: '2022级计算机1班',
        classSchedule: [
          {
            id: 1,
            courseId: 1,
            name: '数据结构',
            courseName: '数据结构',
            teacherName: '张老师',
            time: '周一 08:00-10:00',
            location: 'A101',
            remainingHours: 12,
            credit: 4,
            totalHours: 48,
            progress: 75
          },
          {
            id: 2,
            courseId: 2,
            name: '操作系统',
            courseName: '操作系统',
            teacherName: '李老师',
            time: '周三 14:00-16:00',
            location: 'B202',
            remainingHours: 18,
            credit: 4,
            totalHours: 48,
            progress: 63
          },
          {
            id: 3,
            courseId: 3,
            name: '计算机网络',
            courseName: '计算机网络',
            teacherName: '王老师',
            time: '周五 10:00-12:00',
            location: 'C303',
            remainingHours: 22,
            credit: 3,
            totalHours: 36,
            progress: 39
          },
          {
            id: 4,
            courseId: 4,
            name: '数据库原理',
            courseName: '数据库原理',
            teacherName: '刘老师',
            time: '周二 09:00-11:00',
            location: 'D404',
            remainingHours: 8,
            credit: 3,
            totalHours: 36,
            progress: 78
          }
        ],
        learningProgress: {
          totalCourses: 8,
          completedCourses: 3,
          ongoingCourses: 5,
          progressPercentage: 38,
          remainingHours: 42,
          avgScore: 82
        }
      }
      
      // 确保dataModel中包含必要的成绩数据
      this.dataModel.scores = [
        {
          score_id: 1,
          course_id: 1,
          course_name: '数据结构',
          exam_type: 'midterm',
          exam_type_text: '期中考试',
          score_value: 85,
          exam_date: '2023-10-15',
          remarks: '表现良好，继续加油！'
        },
        {
          score_id: 2,
          course_id: 1,
          course_name: '数据结构',
          exam_type: 'quiz',
          exam_type_text: '课堂测验',
          score_value: 92,
          exam_date: '2023-09-25',
          remarks: '优秀！'
        },
        {
          score_id: 3,
          course_id: 2,
          course_name: '操作系统',
          exam_type: 'midterm',
          exam_type_text: '期中考试',
          score_value: 78,
          exam_date: '2023-10-10',
          remarks: '基础掌握较好，但需要加强练习'
        },
        {
          score_id: 4,
          course_id: 3,
          course_name: '计算机网络',
          exam_type: 'assignment',
          exam_type_text: '课后作业',
          score_value: 88,
          exam_date: '2023-09-30',
          remarks: '作业完成质量较高'
        },
        {
          score_id: 5,
          course_id: 4,
          course_name: '数据库原理',
          exam_type: 'midterm',
          exam_type_text: '期中考试',
          score_value: 65,
          exam_date: '2023-10-12',
          remarks: '及格，需要加强理解概念'
        }
      ]
    } else if (role === 'teacher') {
      this.teacherData = {
        teachingPerformance: {
          totalClasses: this.dataModel.courses.length || 15,
          studentsEnrolled: this.dataModel.students.length || 240,
          averageRating: 4.8,
          completedSessions: 60,
          upcomingSessions: 30
        }
      }
    } else if (role === 'admin') {
      this.adminData = {
        users: this.dataModel.students.map(student => ({
          id: student.student_id,
          username: student.name,
          role: 'student',
          status: 'active'
        })).slice(0, 4),
        teachers: this.dataModel.teachers.slice(0, 3).map(teacher => ({
          id: teacher.teacher_id,
          name: teacher.name,
          courses: Math.floor(Math.random() * 3) + 2,
          students: Math.floor(Math.random() * 40) + 60
        }))
      }
    }
  },
  
  // 获取学生数据
  getStudentData(studentId) {
    if (!this.dataModel) return null
    return mockDataGenerator.generateStudentData(
      studentId, 
      this.dataModel.students, 
      this.dataModel.courses, 
      this.dataModel.studentCourses || [], 
      this.dataModel.scores || []
    )
  }
})

// 初始化用户状态
export function initUserState() {
  const token = localStorage.getItem('userToken')
  if (token) {
    userState.isLoggedIn = true
    userState.username = localStorage.getItem('username')
    userState.role = localStorage.getItem('userRole')
    userState.userId = localStorage.getItem('userId')
    userState.generateMockData(userState.role)
  } else {
    // 默认使用学生角色和模拟数据，方便开发和测试
    console.log('Using default student role for testing')
    userState.isLoggedIn = true
    userState.username = 'student1'
    userState.role = 'student'
    userState.userId = '101'
    userState.generateMockData('student')
    // 保存默认测试用户到localStorage
    localStorage.setItem('userToken', 'mock-token-for-testing')
    localStorage.setItem('username', 'student1')
    localStorage.setItem('userRole', 'student')
    localStorage.setItem('userId', '101')
  }
}

export default userState