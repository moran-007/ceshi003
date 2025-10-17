/*
 * @Author: 陌
 * @Date: 2025-10-16 23:31:09
 * @LastEditors: 陌
 * @LastEditTime: 2025-10-16 23:31:13
 */
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'

// 动态导入子组件
const StudentDashboard = () => import('../components/StudentDashboard.vue')
const StudentProfile = () => import('../components/StudentProfile.vue')
const CourseDetails = () => import('../components/CourseDetails.vue')
const TeacherDashboard = () => import('../components/TeacherDashboard.vue')
const AdminDashboard = () => import('../components/AdminDashboard.vue')

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
      // 管理员路由
      {
        path: 'admin/dashboard',
        name: 'adminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, role: ['admin', 'superAdmin'] }
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