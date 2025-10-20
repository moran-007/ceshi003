<template>
  <div class="teacher-profile">
    <div class="page-header">
      <button class="back-button" @click="goBack">← 返回仪表盘</button>
      <h2>个人中心</h2>
    </div>

    <div class="profile-container">
      <!-- 基本信息卡片 -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar">
            <span class="avatar-icon">👤</span>
          </div>
          <div class="profile-info">
            <h3 class="teacher-name">{{ teacherInfo.name }}</h3>
            <div class="teacher-details">
              <span class="detail-item">工号: {{ teacherInfo.employeeId }}</span>
              <span class="detail-item">职称: {{ teacherInfo.title }}</span>
              <span class="detail-item">入职时间: {{ teacherInfo.joinDate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细信息部分 -->
      <div class="info-sections">
        <!-- 个人信息 -->
        <div class="info-section">
          <h3 class="section-title">个人信息</h3>
          <div class="info-form">
            <div class="form-row">
              <div class="form-group">
                <label>姓名</label>
                <input type="text" v-model="teacherInfo.name" readonly>
              </div>
              <div class="form-group">
                <label>性别</label>
                <input type="text" :value="teacherInfo.gender" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>出生日期</label>
                <input type="text" :value="teacherInfo.birthDate" readonly>
              </div>
              <div class="form-group">
                <label>联系电话</label>
                <input type="text" v-model="teacherInfo.phone" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>电子邮箱</label>
                <input type="text" v-model="teacherInfo.email" readonly>
              </div>
              <div class="form-group">
                <label>所属部门</label>
                <input type="text" :value="teacherInfo.department" readonly>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group full-width">
                <label>个人简介</label>
                <textarea v-model="teacherInfo.bio" readonly></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 教学专长 -->
        <div class="info-section">
          <h3 class="section-title">教学专长</h3>
          <div class="expertise-tags">
            <div v-for="skill in teacherInfo.skills" :key="skill" class="skill-tag">
              {{ skill }}
            </div>
          </div>
        </div>

        <!-- 教学成果 -->
        <div class="info-section">
          <h3 class="section-title">教学成果</h3>
          <div class="achievements-list">
            <div v-for="achievement in teacherInfo.achievements" :key="achievement.id" class="achievement-item">
              <div class="achievement-icon">{{ achievement.icon }}</div>
              <div class="achievement-content">
                <div class="achievement-title">{{ achievement.title }}</div>
                <div class="achievement-description">{{ achievement.description }}</div>
                <div class="achievement-date">{{ achievement.date }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 账户设置 -->
        <div class="info-section">
          <h3 class="section-title">账户设置</h3>
          <div class="account-settings">
            <button class="settings-button" @click="changePassword">修改密码</button>
            <button class="settings-button" @click="updateProfile">更新个人资料</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userState } from '../store/index.js'

export default {
  name: 'TeacherProfile',
  setup() {
    const router = useRouter()
    const teacherInfo = ref({
      name: '张教授',
      employeeId: 'TEA20230001',
      title: '副教授',
      joinDate: '2020-09-01',
      gender: '男',
      birthDate: '1985-06-15',
      phone: '138****5678',
      email: 'zhang@example.com',
      department: '计算机科学与技术学院',
      bio: '计算机科学博士，主要研究方向为人工智能和机器学习。拥有10年教学经验，曾获得校级优秀教师称号。',
      skills: ['数据结构', '算法分析', '人工智能', '机器学习', '数据库原理'],
      achievements: [
        {
          id: 1,
          title: '校级优秀教师',
          description: '获得2022年度校级优秀教师称号',
          date: '2022-12-15',
          icon: '🏆'
        },
        {
          id: 2,
          title: '教学成果奖',
          description: '《数据结构》课程改革获得校级教学成果一等奖',
          date: '2021-10-20',
          icon: '🎖️'
        },
        {
          id: 3,
          title: '科研项目',
          description: '主持省级科研项目《基于机器学习的智能教学系统研究》',
          date: '2023-01-05',
          icon: '📚'
        }
      ]
    })

    const goBack = () => {
      router.push('/home/teacher/dashboard')
    }

    const changePassword = () => {
      alert('修改密码功能开发中...')
    }

    const updateProfile = () => {
      alert('更新个人资料功能开发中...')
    }

    onMounted(() => {
      // 初始化认证信息
      if (!localStorage.getItem('userToken')) {
        localStorage.setItem('userToken', 'mock-token-teacher-789')
        localStorage.setItem('userRole', 'teacher')
      }
      
      // 这里可以从store或API获取实际数据
      console.log('TeacherProfile mounted')
    })

    return {
      teacherInfo,
      goBack,
      changePassword,
      updateProfile
    }
  }
}
</script>

<style scoped>
.teacher-profile {
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

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 基本信息卡片 */
.profile-card {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 30px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 60px;
}

.profile-info h3 {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 15px 0;
}

.teacher-details {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
}

.detail-item {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

/* 信息部分 */
.info-sections {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
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

/* 表单样式 */
.info-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1px solid #e0e2e5;
  border-radius: 6px;
  font-size: 16px;
  color: #333;
  background-color: #fafbfc;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-group input:read-only,
.form-group textarea:read-only {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

/* 教学专长 */
.expertise-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.skill-tag {
  padding: 8px 16px;
  background-color: #e3f2fd;
  color: #1976d2;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

/* 教学成果 */
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.achievement-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.achievement-item:hover {
  transform: translateX(5px);
}

.achievement-icon {
  font-size: 32px;
  min-width: 32px;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.achievement-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.achievement-date {
  font-size: 12px;
  color: #999;
}

/* 账户设置 */
.account-settings {
  display: flex;
  gap: 20px;
}

.settings-button {
  padding: 12px 30px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-button:hover {
  background-color: #5a67d8;
  transform: translateY(-1px);
}

.settings-button:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .teacher-details {
    justify-content: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .account-settings {
    flex-direction: column;
  }
  
  .settings-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .profile-card,
  .info-section {
    padding: 20px;
  }
}
</style>