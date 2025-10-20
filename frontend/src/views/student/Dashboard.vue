<template>
  <div class="dashboard-container">
    <el-card class="welcome-card">
      <h2>欢迎回来，{{ username }}！</h2>
      <p>今天是 {{ today }}，祝您学习愉快！</p>
    </el-card>

    <div class="stats-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon course-icon">
                <span class="stat-icon-text">📚</span>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ courseCount }}</div>
                <div class="stat-label">我的课程</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon homework-icon">
                <span class="stat-icon-text">📝</span>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ pendingHomework }}</div>
                <div class="stat-label">待交作业</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon attendance-icon">
                <span class="stat-icon-text">✅</span>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ attendanceRate }}%</div>
                <div class="stat-label">出勤率</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content">
              <div class="stat-icon score-icon">
                <span class="stat-icon-text">📊</span>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ averageScore }}</div>
                <div class="stat-label">平均成绩</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="content-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="content-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>近期课程安排</span>
                <el-button type="text" @click="$router.push('/student/schedule')">查看全部</el-button>
              </div>
            </template>
            <el-table :data="upcomingCourses" style="width: 100%">
              <el-table-column prop="courseName" label="课程名称"></el-table-column>
              <el-table-column prop="teacher" label="授课教师"></el-table-column>
              <el-table-column prop="date" label="上课时间"></el-table-column>
              <el-table-column prop="classroom" label="教室"></el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="content-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>最新消息通知</span>
                <el-button type="text" @click="$router.push('/student/notifications')">查看全部</el-button>
              </div>
            </template>
            <div class="message-list">
              <el-timeline>
                <el-timeline-item
                  v-for="message in recentMessages"
                  :key="message.id"
                  :timestamp="message.time"
                  type="primary"
                >
                  <div class="message-content">
                    <h4>{{ message.title }}</h4>
                    <p>{{ message.content }}</p>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudentDashboard',
  data() {
    return {
      username: '学生用户',
      today: new Date().toLocaleDateString('zh-CN'),
      courseCount: 5,
      pendingHomework: 2,
      attendanceRate: 95,
      averageScore: 88,
      upcomingCourses: [
        {
          courseName: '高等数学',
          teacher: '张老师',
          date: '2025-10-21 08:00-10:00',
          classroom: 'A301'
        },
        {
          courseName: '数据结构',
          teacher: '李老师',
          date: '2025-10-21 14:00-16:00',
          classroom: 'B203'
        }
      ],
      recentMessages: [
        {
          id: 1,
          title: '作业提交截止提醒',
          content: '数据结构第一次作业将于明天截止，请及时提交。',
          time: '10:30'
        },
        {
          id: 2,
          title: '课程时间调整通知',
          content: '下周一的高等数学课时间调整为下午2点，请知悉。',
          time: '昨天'
        }
      ]
    }
  },
  mounted() {
    // 尝试从localStorage获取用户信息
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      try {
        const userInfo = localStorage.getItem('userInfo')
        if (userInfo) {
          const parsedInfo = JSON.parse(userInfo)
          this.username = parsedInfo.name || parsedInfo.username || '学生用户'
        }
      } catch (e) {
        console.log('解析用户信息失败，使用默认名称')
      }
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
  text-align: center;
  padding: 40px;
}

.welcome-card h2 {
  color: #303133;
  margin-bottom: 10px;
}

.stats-container {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.course-icon {
  background-color: #ecf5ff;
}

.homework-icon {
  background-color: #fdf6ec;
}

.attendance-icon {
  background-color: #f0f9eb;
}

.score-icon {
  background-color: #fef0f0;
}

.stat-icon-text {
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.content-container {
  margin-top: 20px;
}

.content-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-content h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.message-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}
</style>