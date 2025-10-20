<template>
  <div class="student-layout">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="sidebar">
      <div class="logo-container">
        <h3 class="logo-text">学生系统</h3>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
      >
        <el-menu-item index="/student/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/student/profile">
          <el-icon><User /></el-icon>
          <span>个人信息</span>
        </el-menu-item>
        <el-menu-item index="/student/courses">
          <el-icon><Menu /></el-icon>
          <span>我的课程</span>
        </el-menu-item>
        <el-menu-item index="/student/schedule">
          <el-icon><Calendar /></el-icon>
          <span>课程表</span>
        </el-menu-item>
        <el-menu-item index="/student/learning">
          <el-icon><Book /></el-icon>
          <span>在线学习</span>
        </el-menu-item>
        <el-menu-item index="/student/homework">
          <el-icon><Document /></el-icon>
          <span>作业管理</span>
        </el-menu-item>
        <el-menu-item index="/student/scores">
          <el-icon><DataAnalysis /></el-icon>
          <span>成绩查询</span>
        </el-menu-item>
        <el-menu-item index="/student/attendance">
          <el-icon><Check /></el-icon>
          <span>出勤记录</span>
        </el-menu-item>
        <el-menu-item index="/student/progress">
          <el-icon><TrendCharts /></el-icon>
          <span>学习进度</span>
        </el-menu-item>
        <el-menu-item index="/student/messages">
          <el-icon><Message /></el-icon>
          <span>消息通知</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button type="text" class="menu-toggle" @click="toggleMenu">
            <el-icon><Menu /></el-icon>
          </el-button>
          <span class="breadcrumb">{{ currentBreadcrumb }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar size="small" icon="el-icon-user"></el-avatar>
              <span>{{ username || '学生用户' }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { 
  HomeFilled, User, Menu as MenuIcon, Calendar, 
  Document, DataAnalysis, Check, TrendCharts, 
  Message, ArrowDown 
} from '@element-plus/icons-vue'

export default {
  name: 'StudentLayout',
  components: {
    HomeFilled,
    User,
    MenuIcon,
    Calendar,
    Document,
    DataAnalysis,
    Check,
    TrendCharts,
    Message,
    ArrowDown
  },
  data() {
    return {
      username: '',
      isCollapse: false
    }
  },
  computed: {
    activeMenu() {
      return this.$route.path
    },
    currentBreadcrumb() {
      const routeName = this.$route.meta.title || this.$route.name
      return routeName.replace('Student', '')
    }
  },
  mounted() {
    // 模拟获取用户信息
    this.username = '学生用户'
  },
  methods: {
    toggleMenu() {
      this.isCollapse = !this.isCollapse
    },
    handleCommand(command) {
      if (command === 'profile') {
        this.$router.push('/student/profile')
      } else if (command === 'logout') {
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        this.$router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
.student-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  background-color: #545c64;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.3);
  transition: width 0.3s;
}

.logo-container {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #666;
}

.logo-text {
  color: white;
  margin: 0;
  font-size: 18px;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
}

.header {
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.menu-toggle {
  font-size: 20px;
}

.breadcrumb {
  font-size: 16px;
  color: #606266;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.content {
  padding: 20px;
  overflow-y: auto;
}
</style>