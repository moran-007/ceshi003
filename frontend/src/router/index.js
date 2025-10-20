import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/student',
    name: 'StudentLayout',
    component: () => import('../layouts/StudentLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: () => import('../views/student/Dashboard.vue')
      },
      {
        path: 'profile',
        name: 'StudentProfile',
        component: () => import('../views/student/Profile.vue')
      },
      {
        path: 'courses',
        name: 'StudentCourses',
        component: () => import('../views/student/Courses.vue')
      },
      {
        path: 'schedule',
        name: 'StudentSchedule',
        component: () => import('../views/student/Schedule.vue')
      },
      {
        path: 'learning',
        name: 'StudentLearning',
        component: () => import('../views/student/Learning.vue')
      },
      {
        path: 'homework',
        name: 'StudentHomework',
        component: () => import('../views/student/Assignments.vue')
      },
      {
        path: 'scores',
        name: 'StudentScores',
        component: () => import('../views/student/Grades.vue')
      },
      {
        path: 'attendance',
        name: 'StudentAttendance',
        component: () => import('../views/student/Attendance.vue')
      },
      {
        path: 'progress',
        name: 'StudentProgress',
        component: () => import('../views/student/Learning.vue')
      },
      {
        path: 'messages',
        name: 'StudentMessages',
        component: () => import('../views/student/Notifications.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router