<template>
  <div class="admin-dashboard">
    <h2>管理员控制台</h2>
    
    <!-- 数据概览 -->
    <div class="overview-section">
      <h3>系统概览</h3>
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-title">用户总数</div>
          <div class="card-number">{{ usersData.length }}</div>
        </div>
        <div class="overview-card">
          <div class="card-title">教师总数</div>
          <div class="card-number">{{ teachersData.length }}</div>
        </div>
        <div class="overview-card">
          <div class="card-title">活跃用户</div>
          <div class="card-number">{{ activeUsersCount }}</div>
        </div>
      </div>
    </div>

    <!-- 用户管理 -->
    <div class="management-section">
      <h3>用户管理</h3>
      <div class="table-responsive">
        <table class="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>角色</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in usersData" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>
                <span class="role-badge" :class="user.role">
                  {{ roleMap[user.role] }}
                </span>
              </td>
              <td>
                <span class="status-badge" :class="user.status">
                  {{ user.status === 'active' ? '活跃' : '禁用' }}
                </span>
              </td>
              <td>
                <button 
                  @click="toggleUserStatus(user)" 
                  class="action-button"
                  :class="user.status === 'active' ? 'deactivate' : 'activate'"
                >
                  {{ user.status === 'active' ? '禁用' : '启用' }}
                </button>
                <button 
                  @click="editUser(user)" 
                  class="action-button edit"
                >
                  编辑
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <button class="add-button">添加用户</button>
    </div>

    <!-- 教师管理 -->
    <div class="management-section">
      <h3>教师管理</h3>
      <div class="table-responsive">
        <table class="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>教师姓名</th>
              <th>教授课程数</th>
              <th>学生人数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in teachersData" :key="teacher.id">
              <td>{{ teacher.id }}</td>
              <td>{{ teacher.name }}</td>
              <td>{{ teacher.courses }}</td>
              <td>{{ teacher.students }}</td>
              <td>
                <button @click="viewTeacherDetails(teacher)" class="action-button view">
                  查看详情
                </button>
                <button @click="editTeacher(teacher)" class="action-button edit">
                  编辑
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <button class="add-button">添加教师</button>
    </div>

    <!-- 权限管理提示 -->
    <div class="admin-tips">
      <h3>权限管理提示</h3>
      <div class="tips-content">
        <ul>
          <li>请谨慎修改用户角色和状态，避免影响系统正常运行</li>
          <li>管理员账号拥有最高权限，请妥善保管</li>
          <li>定期检查用户状态，清理不活跃账号</li>
          <li>为教师分配合理的课程数量，确保教学质量</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import userState from '../store'

export default {
  name: 'AdminDashboard',
  setup() {
    const roleMap = {
      'student': '学生',
      'teacher': '教师',
      'admin': '管理员'
    }

    // 计算属性，提供默认值防止数据未加载时出错
    const usersData = computed(() => {
      if (!userState.adminData || !userState.adminData.users) {
        return [
          { id: 1, username: 'student1', role: 'student', status: 'active' },
          { id: 2, username: 'student2', role: 'student', status: 'active' },
          { id: 3, username: 'teacher1', role: 'teacher', status: 'active' },
          { id: 4, username: 'admin1', role: 'admin', status: 'active' }
        ]
      }
      return userState.adminData.users
    })
    
    const teachersData = computed(() => {
      if (!userState.adminData || !userState.adminData.teachers) {
        return [
          { id: 1, name: '张老师', courses: 3, students: 85 },
          { id: 2, name: '李老师', courses: 2, students: 60 },
          { id: 3, name: '王老师', courses: 4, students: 95 }
        ]
      }
      return userState.adminData.teachers
    })
    
    const activeUsersCount = computed(() => {
      return usersData.value.filter(user => user.status === 'active').length
    })

    const toggleUserStatus = (user) => {
      // 模拟切换用户状态
      user.status = user.status === 'active' ? 'inactive' : 'active'
      console.log(`用户 ${user.username} 状态已切换为: ${user.status}`)
      
      // 同步更新到store中
      if (userState.adminData && userState.adminData.users) {
        const storeUser = userState.adminData.users.find(u => u.id === user.id)
        if (storeUser) {
          storeUser.status = user.status
        }
      }
    }

    const editUser = (user) => {
      console.log('编辑用户:', user)
      // 这里可以打开编辑用户的对话框
    }

    const viewTeacherDetails = (teacher) => {
      console.log('查看教师详情:', teacher)
      // 这里可以打开教师详情页面
    }

    const editTeacher = (teacher) => {
      console.log('编辑教师:', teacher)
      // 这里可以打开编辑教师的对话框
    }
    
    // 组件挂载时检查数据
    onMounted(() => {
      console.log('AdminDashboard mounted, data:', userState.adminData)
      // 如果没有数据，使用默认数据
      if (!userState.adminData || (!userState.adminData.users || userState.adminData.users.length === 0)) {
        userState.adminData = {
          users: [
            { id: 1, username: 'student1', role: 'student', status: 'active' },
            { id: 2, username: 'student2', role: 'student', status: 'active' },
            { id: 3, username: 'teacher1', role: 'teacher', status: 'active' },
            { id: 4, username: 'admin1', role: 'admin', status: 'active' }
          ],
          teachers: [
            { id: 1, name: '张老师', courses: 3, students: 85 },
            { id: 2, name: '李老师', courses: 2, students: 60 },
            { id: 3, name: '王老师', courses: 4, students: 95 }
          ]
        }
      }
    })

    return {
      userState,
      roleMap,
      usersData,
      teachersData,
      activeUsersCount,
      toggleUserStatus,
      editUser,
      viewTeacherDetails,
      editTeacher
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 10px;
}

.admin-dashboard h2 {
  color: #333;
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 600;
}

.overview-section,
.management-section,
.admin-tips {
  background-color: #fafbfc;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.overview-section h3,
.management-section h3,
.admin-tips h3 {
  color: #555;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 2px solid #e1e8ed;
  padding-bottom: 10px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.overview-card {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
}

.overview-card:hover {
  transform: translateY(-2px);
}

.card-title {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
}

.card-number {
  font-size: 32px;
  font-weight: 600;
  color: #667eea;
}

.table-responsive {
  overflow-x: auto;
  margin-bottom: 20px;
}

.management-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.management-table th,
.management-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e1e8ed;
}

.management-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.management-table tr:last-child td {
  border-bottom: none;
}

.management-table tr:hover {
  background-color: #f8f9fa;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.student {
  background-color: #e3f2fd;
  color: #1976d2;
}

.role-badge.teacher {
  background-color: #e8f5e9;
  color: #388e3c;
}

.role-badge.admin {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-badge.inactive {
  background-color: #ffebee;
  color: #d32f2f;
}

.action-button {
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 5px;
  transition: background-color 0.3s;
}

.action-button.deactivate {
  background-color: #ff5252;
  color: white;
}

.action-button.activate {
  background-color: #4caf50;
  color: white;
}

.action-button.edit {
  background-color: #2196f3;
  color: white;
}

.action-button.view {
  background-color: #9c27b0;
  color: white;
}

.action-button:hover {
  opacity: 0.9;
}

.add-button {
  padding: 10px 20px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #5a67d8;
}

.admin-tips .tips-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
}

.admin-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin-tips li {
  padding: 10px 15px 10px 30px;
  margin-bottom: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
  position: relative;
  color: #555;
}

.admin-tips li::before {
  content: "⚠️";
  position: absolute;
  left: 10px;
  top: 10px;
}

.admin-tips li:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .management-table th,
  .management-table td {
    padding: 10px;
    font-size: 14px;
  }
  
  .action-button {
    padding: 4px 8px;
    font-size: 11px;
    margin-bottom: 5px;
  }
}
</style>