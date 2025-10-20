/*
 * @Author: 陌
 * @Date: 2025-10-16 23:31:09
 * @LastEditors: 陌
 * @LastEditTime: 2025-10-20 20:03:40
 */
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import StudentDashboardTest from '../views/StudentDashboardTest.vue'

// 动态导入子组件
const StudentDashboard = () => import('../components/StudentDashboard.vue')
const StudentProfile = () => import('../components/StudentProfile.vue')
const CourseDetails = () => import('../components/CourseDetails.vue')
const TeacherDashboard = () => import('../components/TeacherDashboard.vue')
const AdminDashboard = () => import('../components/AdminDashboard.vue')
const SuperAdminDashboard = () => import('../components/SuperAdminDashboard.vue')

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  // 测试路由 - 无需认证
  {
    path: '/test/student-dashboard',
    name: 'studentDashboardTest',
    component: StudentDashboardTest,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: false }, // 允许未登录用户访问首页
    children: [
      // 学生路由
      {
        path: 'student/dashboard',
        name: 'studentDashboard',
        component: StudentDashboard,
        meta: { requiresAuth: true, role: 'student' }
      },
      {
        path: 'student/grade-analysis',
        name: 'gradeAnalysis',
        component: () => import('../components/GradeAnalysis.vue'),
        meta: { requiresAuth: true, role: 'student' }
      },
      {
        path: 'student/profile',
        name: 'studentProfile',
        component: StudentProfile,
        meta: { requiresAuth: true, role: 'student' }
      },
      {
        path: 'student/course/:id',
        name: 'courseDetails',
        component: CourseDetails,
        meta: { requiresAuth: true, role: 'student' },
        props: true
      },
      // 教师路由
      {
        path: 'teacher/dashboard',
        name: 'teacherDashboard',
        component: TeacherDashboard,
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'teacher/profile',
        name: 'teacherProfile',
        component: () => import('../components/TeacherProfile.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'teacher/course-schedule',
        name: 'teacherCourseSchedule',
        component: () => import('../components/TeacherCourseSchedule.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'teacher/hours-deduction',
        name: 'teacherHoursDeduction',
        component: () => import('../components/TeacherHoursDeduction.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'teacher/attendance',
        name: 'teacherAttendance',
        component: () => import('../components/TeacherAttendanceManagement.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'teacher/performance',
        name: 'teacherPerformance',
        component: () => import('../components/TeacherPerformanceStatistics.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'teacher/class-consumption',
        name: 'teacherClassConsumption',
        component: () => import('../components/TeacherHoursDashboard.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'teacher/students',
        name: 'teacherStudents',
        component: () => import('../components/TeacherStudentQuery.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'teacher/archives',
        name: 'teacherArchives',
        component: () => import('../components/TeacherFileQuery.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      // 管理员路由
      {
        path: 'admin/dashboard',
        name: 'adminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, role: ['admin', 'superAdmin'] }
      },
      // 超级管理员路由
      {
        path: 'superAdmin/dashboard',
        name: 'superAdminDashboard',
        component: SuperAdminDashboard,
        meta: { requiresAuth: true, role: 'superAdmin' }
      },
      // 超级管理员系统管理功能路由
      {
        path: 'system/users',
        name: 'systemUsers',
        component: () => import('../views/home/superadmin/Users.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true }
      },
      {
        path: 'system/roles',
        name: 'systemRoles',
        component: () => import('../views/home/superadmin/Roles.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true }
      },
      {
        path: 'system/config',
        name: 'systemConfig',
        component: () => import('../components/system/SystemConfig.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true }
      },
      {
        path: 'superAdmin/system/config',
        name: 'superAdminSystemConfig',
        component: () => import('../components/system/SystemConfig.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true }
      },
      {
        path: 'system/backup',
        name: 'systemBackup',
        component: () => import('../components/system/SystemBackup.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'superAdmin/system/backup',
        name: 'superAdminSystemBackup',
        component: () => import('../components/system/SystemBackup.vue'),
        meta: { requiresAuth: true, requiresSuperAdmin: true }
      },
      {
        path: 'superAdmin/system/logs',
        name: 'systemLogs',
        component: () => import('../components/system/SystemLogs.vue'),
        meta: { requiresAuth: true, role: 'superAdmin' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userToken = localStorage.getItem('userToken')
  const userRole = localStorage.getItem('userRole')
  
  // 特殊处理首页，允许未登录用户访问
  if (to.path === '/home' || to.path === '/') {
    return next()
  }
  
  // 检查子路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth) && !userToken) {
    return next('/login')
  }
  
  // 不需要认证的页面，如果已经登录则跳转到首页
  if (!to.matched.some(record => record.meta.requiresAuth) && userToken && to.path === '/login') {
    // 根据用户角色重定向到相应的仪表盘
    if (userRole) {
      return next(`/home/${userRole}/dashboard`)
    }
    return next('/home')
  }
  
  // 检查是否需要超级管理员权限
  if (to.meta.requiresSuperAdmin && userToken) {
    // 确保用户角色是超级管理员
    if (userRole !== 'superAdmin') {
      // 没有超级管理员权限，跳转到该用户角色的仪表盘或首页
      return next(`/home/${userRole}/dashboard` || '/home')
    }
  }
  
  // 角色权限检查（仅针对需要角色的子路由）
  const requiredRole = to.meta.role
  if (requiredRole && userToken) {
    // 如果requiredRole是数组，检查用户角色是否在数组中
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(userRole)) {
        // 角色不匹配，跳转到该用户角色的仪表盘或首页
        return next(`/home/${userRole}/dashboard` || '/home')
      }
    } else if (requiredRole !== userRole) {
      // 单个角色检查
      return next(`/home/${userRole}/dashboard` || '/home')
    }
  }
  
  next()
})

export default router