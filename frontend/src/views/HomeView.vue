<template>
  <div class="home-container">
    <header class="header">
      <div class="header-content">
        <h1>课程管理系统</h1>
        <div class="user-info">
          <span>欢迎，{{ userState.username }}</span>
          <span class="user-role">{{ roleText }}</span>
          <button @click="handleLogout" class="logout-button">退出登录</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="sidebar">
        <nav class="sidebar-nav">
          <ul>
            <!-- 学生导航 -->
            <template v-if="userState.role === 'student'">
              <li class="nav-heading">学生功能</li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/student/dashboard') }">
                <router-link to="/home/student/dashboard">学习仪表盘</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/student/grade-analysis') }">
                <router-link to="/home/student/grade-analysis">成绩分析</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/student/profile') }">
                <router-link to="/home/student/profile">个人信息</router-link>
              </li>
            </template>
            
            <!-- 教师导航 -->
            <template v-else-if="userState.role === 'teacher'">
              <li class="nav-heading">教师功能</li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/teacher/dashboard') }">
                <router-link to="/home/teacher/dashboard">教学仪表盘</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/teacher/course-schedule') }">
                <router-link to="/home/teacher/course-schedule">课程安排</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/teacher/hours-deduction') }">
                <router-link to="/home/teacher/hours-deduction">课时扣除</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/teacher/attendance') }">
                <router-link to="/home/teacher/attendance">签到管理</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/teacher/performance') }">
                <router-link to="/home/teacher/performance">业绩统计</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/teacher/class-consumption') }">
                <router-link to="/home/teacher/class-consumption">课消数据</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/teacher/students') }">
                <router-link to="/home/teacher/students">学员查询</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/teacher/archives') }">
                <router-link to="/home/teacher/archives">档案资料</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/teacher/profile') }">
                <router-link to="/home/teacher/profile">个人中心</router-link>
              </li>
            </template>
            
            <!-- 超级管理员导航 -->
            <template v-else-if="userState.role === 'superAdmin'">
              <li class="nav-heading">超级管理员功能</li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/superadmin/dashboard') }">
                <router-link to="/home/superadmin/dashboard">超级管理员控制台</router-link>
              </li>
              <li class="nav-heading">系统管理</li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/system/users') }">
                <router-link to="/system/users">用户管理</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/system/roles') }">
                <router-link to="/system/roles">角色权限管理</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/system/config') }">
                <router-link to="/system/config">系统配置</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/system/backup') }">
                <router-link to="/system/backup">数据备份</router-link>
              </li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/superadmin/logs') }">
                <router-link to="/home/superadmin/logs">系统操作日志</router-link>
              </li>
            </template>
            
            <!-- 管理员导航 -->
            <template v-else-if="userState.role === 'admin'">
              <li class="nav-heading">管理员功能</li>
              <li class="nav-item" :class="{ active: currentPath.startsWith('/home/admin/dashboard') }">
                <router-link to="/home/admin/dashboard">管理员控制台</router-link>
              </li>
              <li class="nav-item">
                <a href="#" @click.prevent="showMockData('users')">用户管理</a>
              </li>
              <li class="nav-item">
                <a href="#" @click.prevent="showMockData('courses')">课程管理</a>
              </li>
              <li class="nav-item">
                <a href="#" @click.prevent="showMockData('teachers')">教师管理</a>
              </li>
              <li class="nav-item">
                <a href="#" @click.prevent="showMockData('students')">学生管理</a>
              </li>
            </template>
            
            <!-- 未登录时的演示导航 -->
            <template v-else>
              <li class="nav-heading">系统演示</li>
              <li class="nav-item">
                <a href="#" @click.prevent="showStudentDemo">学生角色演示</a>
              </li>
              <li class="nav-item">
                <a href="#" @click.prevent="showTeacherDemo">教师角色演示</a>
              </li>
              <li class="nav-item">
                <a href="#" @click.prevent="showAdminDemo">管理员角色演示</a>
              </li>
              <li class="nav-item">
                <a href="#" @click.prevent="showSuperAdminDemo">超级管理员演示</a>
              </li>
            </template>
          </ul>
        </nav>
      </div>

      <div class="content-area">
        <!-- 演示模式下的内容 -->
        <div v-if="!userState.isLoggedIn && !demoContent" class="demo-welcome">
          <div class="welcome-card">
            <h2>欢迎使用课程管理系统</h2>
            <p>这是一个完整的课程管理系统演示，支持学生、教师和管理员三种角色。</p>
            <div class="demo-buttons">
              <button class="demo-btn student-btn" @click="showStudentDemo">学生角色演示</button>
              <button class="demo-btn teacher-btn" @click="showTeacherDemo">教师角色演示</button>
              <button class="demo-btn admin-btn" @click="showAdminDemo">管理员角色演示</button>
              <button class="demo-btn superadmin-btn" @click="showSuperAdminDemo">超级管理员演示</button>
            </div>
            <p class="login-tip">或者 <router-link to="/login">登录系统</router-link> 访问完整功能</p>
          </div>
        </div>
        
        <!-- 模拟数据展示 -->
        <div v-else-if="demoContent" class="mock-data-container">
          <h3>{{ demoContent.title }}</h3>
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th v-for="(header, index) in Object.keys(demoContent.data[0])" :key="index">
                    {{ formatHeader(header) }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in demoContent.data" :key="item.id">
                  <td v-for="(value, key) in item" :key="key">
                    {{ value }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 正常的路由视图 -->
        <router-view v-else v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script>
import { computed, onMounted, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userState, logout } from '../store/index.js'

export default {
  name: 'HomeView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const demoContent = ref(null)
    
    // 模拟数据
    const mockData = {
      courses: [
        { id: 1, name: '数据结构', credit: 3, teacher: '张老师', students: 45 },
        { id: 2, name: '操作系统', credit: 3, teacher: '李老师', students: 38 },
        { id: 3, name: '计算机网络', credit: 4, teacher: '王老师', students: 52 },
        { id: 4, name: '数据库原理', credit: 4, teacher: '刘老师', students: 42 },
        { id: 5, name: '软件工程', credit: 3, teacher: '陈老师', students: 36 }
      ],
      students: [
        { id: 1, name: '张三', studentId: '20210001', className: '计算机科学与技术1班', major: '计算机科学与技术' },
        { id: 2, name: '李四', studentId: '20210002', className: '计算机科学与技术1班', major: '计算机科学与技术' },
        { id: 3, name: '王五', studentId: '20210003', className: '软件工程2班', major: '软件工程' },
        { id: 4, name: '赵六', studentId: '20210004', className: '人工智能3班', major: '人工智能' },
        { id: 5, name: '钱七', studentId: '20210005', className: '计算机科学与技术1班', major: '计算机科学与技术' }
      ],
      teachers: [
        { id: 1, name: '张老师', teacherId: 'T1001', department: '计算机系', courses: 3 },
        { id: 2, name: '李老师', teacherId: 'T1002', department: '计算机系', courses: 2 },
        { id: 3, name: '王老师', teacherId: 'T1003', department: '网络工程系', courses: 4 },
        { id: 4, name: '刘老师', teacherId: 'T1004', department: '软件工程系', courses: 3 },
        { id: 5, name: '陈老师', teacherId: 'T1005', department: '人工智能系', courses: 2 }
      ],
      grades: [
        { id: 1, studentName: '张三', courseName: '数据结构', score: 85, examDate: '2023-10-15' },
        { id: 2, studentName: '李四', courseName: '操作系统', score: 92, examDate: '2023-10-10' },
        { id: 3, studentName: '王五', courseName: '计算机网络', score: 78, examDate: '2023-10-12' },
        { id: 4, studentName: '赵六', courseName: '数据库原理', score: 65, examDate: '2023-10-14' },
        { id: 5, studentName: '钱七', courseName: '软件工程', score: 88, examDate: '2023-10-11' }
      ]
    }

    const currentPath = computed(() => route.path)

    const roleText = computed(() => {
      const roleMap = {
        'student': '学生',
        'teacher': '教师',
        'admin': '管理员',
        'superAdmin': '超级管理员'
      }
      return roleMap[userState.role] || '游客'
    })

    const handleLogout = () => {
      logout()
      router.push('/login')
    }

    // 显示模拟数据
    const showMockData = (type) => {
      demoContent.value = {
        type,
        data: mockData[type],
        title: getMockDataTitle(type)
      }
    }

    // 获取模拟数据标题
    const getMockDataTitle = (type) => {
      const titles = {
        courses: '课程列表',
        students: '学生列表',
        teachers: '教师列表',
        grades: '成绩列表',
        users: '用户列表'
      }
      return titles[type] || '数据列表'
    }

    // 格式化表格头部
    const formatHeader = (header) => {
      const headerMap = {
        id: 'ID',
        name: '姓名',
        studentId: '学号',
        teacherId: '工号',
        className: '班级',
        major: '专业',
        department: '部门',
        courses: '课程数',
        credit: '学分',
        teacher: '教师',
        students: '学生数',
        studentName: '学生姓名',
        courseName: '课程名称',
        score: '成绩',
        examDate: '考试日期'
      }
      return headerMap[header] || header
    }

    // 显示学生演示
    const showStudentDemo = () => {
      userState.role = 'student'
      userState.username = '学生演示账号'
      userState.isLoggedIn = true
      router.push('/home/student/dashboard')
    }

    // 显示教师演示
    const showTeacherDemo = () => {
      userState.role = 'teacher'
      userState.username = '教师演示账号'
      userState.isLoggedIn = true
      router.push('/home/teacher/dashboard')
    }

    // 显示管理员演示
    const showAdminDemo = () => {
      userState.role = 'admin'
      userState.username = '管理员演示账号'
      userState.isLoggedIn = true
      router.push('/home/admin/dashboard')
    }
    
    // 显示超级管理员演示
    const showSuperAdminDemo = () => {
      userState.role = 'superAdmin'
      userState.username = '超级管理员演示账号'
      userState.isLoggedIn = true
      router.push('/home/superadmin/dashboard')
    }

    // 监听路由变化，更新当前路径
    watch(
      () => route.path,
      (newPath) => {
        // 路由变化时清除演示内容
        demoContent.value = null
      }
    )

    // 组件挂载时，如果没有登录，显示演示模式
    onMounted(() => {
      // 不再强制跳转到登录页，允许未登录用户浏览
      if (!userState.isLoggedIn) {
        // 可以在这里初始化演示数据
      }
    })

    return {
        userState,
        currentPath,
        roleText,
        handleLogout,
        showMockData,
        showStudentDemo,
        showTeacherDemo,
        showAdminDemo,
        showSuperAdminDemo,
        demoContent,
        formatHeader
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  width: 100%;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.user-role {
  padding: 5px 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 14px;
}

.logout-button {
  padding: 8px 15px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  padding: 20px;
  gap: 20px;
  box-sizing: border-box;
}

.sidebar {
  width: 200px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px 0;
  flex-shrink: 0;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin: 0;
}

.nav-item a {
  display: block;
  padding: 12px 20px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.nav-item a:hover {
  background-color: #f0f2f5;
  color: #667eea;
}

.nav-heading {
  padding: 15px 20px 5px;
  color: #999;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-item.active a {
  background-color: #f0f2f5;
  color: #667eea;
  border-left-color: #667eea;
  font-weight: 500;
}

/* 演示欢迎页面样式 */
.demo-welcome {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.welcome-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 15px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 28px;
}

.welcome-card p {
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.demo-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.demo-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
}

.student-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.teacher-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.admin-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.superadmin-btn {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
}

.demo-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.login-tip {
  font-size: 14px;
}

.login-tip a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.login-tip a:hover {
  text-decoration: underline;
}

/* 模拟数据表格样式 */
.mock-data-container {
  padding: 20px;
}

.mock-data-container h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 20px;
}

.data-table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.data-table th {
  background-color: #f8f9fa;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e9ecef;
}

.data-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  color: #333;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover {
  background-color: #f8f9fa;
}

.content-area {
  flex: 1;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  min-height: 400px;
  box-sizing: border-box;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .header-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>