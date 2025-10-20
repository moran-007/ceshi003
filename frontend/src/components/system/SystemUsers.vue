<template>
  <div class="system-users">
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <button class="action-button primary" @click="showAddUserDialog = true">添加用户</button>
        <button class="action-button" @click="exportUsers">导出用户</button>
        <button class="action-button" @click="importUsers">导入用户</button>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter">
      <input 
        type="text" 
        placeholder="搜索用户名/ID" 
        v-model="searchQuery"
        class="search-input"
      >
      <select v-model="roleFilter" class="filter-select">
        <option value="">全部角色</option>
        <option value="student">学生</option>
        <option value="teacher">教师</option>
        <option value="admin">管理员</option>
        <option value="superAdmin">超级管理员</option>
      </select>
      <select v-model="statusFilter" class="filter-select">
        <option value="">全部状态</option>
        <option value="active">启用</option>
        <option value="inactive">禁用</option>
      </select>
      <button class="action-button" @click="resetFilters">重置筛选</button>
    </div>

    <!-- 用户列表 -->
    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th class="checkbox-column">
              <input 
                type="checkbox" 
                v-model="selectAll"
                @change="toggleSelectAll"
              >
            </th>
            <th>ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="user in filteredUsers" 
            :key="user.id"
            :class="{ 'selected': selectedUsers.includes(user.id) }"
          >
            <td class="checkbox-column">
              <input 
                type="checkbox" 
                v-model="selectedUsers"
                :value="user.id"
              >
            </td>
            <td>{{ user.id }}</td>
            <td>
              <div class="user-info">
                <span class="user-name">{{ user.username }}</span>
                <span v-if="user.realName" class="user-realname">{{ user.realName }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-tag" :class="user.role">
                {{ getRoleText(user.role) }}
              </span>
            </td>
            <td>
              <span class="status-tag" :class="user.status">
                {{ user.status === 'active' ? '启用' : '禁用' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="user-actions">
                <button 
                  class="mini-button"
                  @click="editUser(user)"
                  title="编辑用户"
                >
                  编辑
                </button>
                <button 
                  class="mini-button" 
                  :class="user.status === 'active' ? 'warning' : 'success'"
                  @click="toggleUserStatus(user.id, user.status)"
                  title="{{ user.status === 'active' ? '禁用用户' : '启用用户' }}"
                >
                  {{ user.status === 'active' ? '禁用' : '启用' }}
                </button>
                <button 
                  v-if="user.role !== 'superAdmin'"
                  class="mini-button delete"
                  @click="deleteUser(user.id, user.username)"
                  title="删除用户"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="8" class="no-data">未找到匹配的用户</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div v-if="filteredUsers.length > 0" class="pagination">
      <div class="page-info">
        共 {{ filteredUsers.length }} 条记录
      </div>
      <div class="page-controls">
        <button 
          class="page-button" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-numbers">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        <button 
          class="page-button" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
        <select v-model="pageSize" class="page-size-select">
          <option value="10">10条/页</option>
          <option value="20">20条/页</option>
          <option value="50">50条/页</option>
          <option value="100">100条/页</option>
        </select>
      </div>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedUsers.length > 0" class="batch-actions">
      <span>已选择 {{ selectedUsers.length }} 个用户</span>
      <button class="action-button warning" @click="batchToggleStatus">
        批量{{ hasInactiveSelected ? '启用' : '禁用' }}
      </button>
      <button class="action-button delete" @click="batchDeleteUsers">
        批量删除
      </button>
      <button class="action-button" @click="clearSelection">
        取消选择
      </button>
    </div>

    <!-- 添加/编辑用户对话框 -->
    <div v-if="showAddDialog || showEditDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>{{ showEditDialog ? '编辑用户' : '添加用户' }}</h3>
          <button class="close-button" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="saveUser">
            <div class="form-grid">
              <div class="form-group">
                <label>用户名 <span class="required">*</span></label>
                <input type="text" v-model="userForm.username" required class="form-input">
              </div>
              <div class="form-group">
                <label>真实姓名</label>
                <input type="text" v-model="userForm.realName" class="form-input">
              </div>
              <div class="form-group">
                <label>邮箱 <span class="required">*</span></label>
                <input type="email" v-model="userForm.email" required class="form-input">
              </div>
              <div class="form-group">
                <label>电话</label>
                <input type="tel" v-model="userForm.phone" class="form-input">
              </div>
              <div class="form-group">
                <label>角色 <span class="required">*</span></label>
                <select v-model="userForm.role" required class="form-input">
                  <option value="student">学生</option>
                  <option value="teacher">教师</option>
                  <option value="admin">系统管理员</option>
                  <option v-if="!showEditDialog" value="superAdmin">超级管理员</option>
                </select>
              </div>
              <div class="form-group">
                <label>状态</label>
                <select v-model="userForm.status" class="form-input">
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>
              <div v-if="!showEditDialog" class="form-group">
                <label>密码 <span class="required">*</span></label>
                <input type="password" v-model="userForm.password" required class="form-input">
              </div>
              <div v-if="!showEditDialog" class="form-group">
                <label>确认密码 <span class="required">*</span></label>
                <input type="password" v-model="userForm.confirmPassword" required class="form-input">
              </div>
              <div v-if="showEditDialog" class="form-group">
                <label>
                  <input type="checkbox" v-model="resetPassword">
                  重置密码
                </label>
                <input 
                  v-if="resetPassword" 
                  type="password" 
                  v-model="newPassword" 
                  class="form-input"
                  placeholder="输入新密码"
                >
              </div>
            </div>
          </form>
        </div>
        <div class="dialog-footer">
          <button class="action-button" @click="closeDialog">取消</button>
          <button class="action-button primary" @click="saveUser">保存</button>
        </div>
      </div>
    </div>

    <!-- 导入用户对话框 -->
    <div v-if="showImportDialog" class="dialog-overlay" @click="showImportDialog = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>导入用户</h3>
          <button class="close-button" @click="showImportDialog = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="import-instruction">
            <p>请选择要导入的用户数据文件（CSV或Excel格式）：</p>
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              @change="handleFileImport"
              class="file-input"
            >
            <div v-if="importedFile" class="file-info">
              <span>已选择: {{ importedFile.name }}</span>
              <span>{{ formatSize(importedFile.size) }}</span>
            </div>
            <button class="action-button" @click="downloadTemplate">下载导入模板</button>
          </div>
          <div class="import-warning">
            <span class="warning-icon">⚠️</span>
            <p>导入用户数据将添加新用户，已存在的用户将被更新。请确保数据格式正确！</p>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="action-button" @click="showImportDialog = false">取消</button>
          <button 
            class="action-button primary" 
            @click="confirmImport"
            :disabled="!importedFile"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>

    <!-- 操作结果提示 -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      <div class="notification-content">
        <span class="notification-icon">{{ notificationIcon }}</span>
        <span>{{ notificationMessage }}</span>
      </div>
      <button class="notification-close" @click="showNotification = false">×</button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { userState } from '../../store/index.js'

export default {
  name: 'SystemUsers',
  setup() {
    // 状态管理
    const users = ref([])
    const searchQuery = ref('')
    const roleFilter = ref('')
    const statusFilter = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    
    // 选择状态
    const selectedUsers = ref([])
    const selectAll = ref(false)
    
    // 对话框状态
    const showAddDialog = ref(false)
    const showEditDialog = ref(false)
    const showImportDialog = ref(false)
    
    // 通知状态
    const showNotification = ref(false)
    const notificationType = ref('success') // success, error, warning
    const notificationMessage = ref('')
    
    // 用户表单
    const userForm = reactive({
      id: null,
      username: '',
      realName: '',
      email: '',
      phone: '',
      role: 'student',
      status: 'active',
      password: '',
      confirmPassword: ''
    })
    
    // 编辑相关
    const resetPassword = ref(false)
    const newPassword = ref('')
    
    // 导入相关
    const importedFile = ref(null)
    
    // 加载用户数据
    const loadUsers = () => {
      // 从store中获取用户数据
      if (userState.adminData && userState.adminData.users) {
        users.value = userState.adminData.users
      } else {
        // 模拟数据
        users.value = [
          {
            id: 1,
            username: 'admin',
            realName: '系统管理员',
            email: 'admin@example.com',
            phone: '13800138000',
            role: 'superAdmin',
            status: 'active',
            createdAt: new Date('2023-01-01').getTime()
          },
          {
            id: 2,
            username: 'teacher1',
            realName: '张老师',
            email: 'teacher1@example.com',
            phone: '13800138001',
            role: 'teacher',
            status: 'active',
            createdAt: new Date('2023-01-02').getTime()
          },
          {
            id: 3,
            username: 'student1',
            realName: '李学生',
            email: 'student1@example.com',
            phone: '13800138002',
            role: 'student',
            status: 'active',
            createdAt: new Date('2023-01-03').getTime()
          },
          {
            id: 4,
            username: 'teacher2',
            realName: '王老师',
            email: 'teacher2@example.com',
            phone: '13800138003',
            role: 'teacher',
            status: 'inactive',
            createdAt: new Date('2023-01-04').getTime()
          },
          {
            id: 5,
            username: 'student2',
            realName: '赵学生',
            email: 'student2@example.com',
            phone: '13800138004',
            role: 'student',
            status: 'active',
            createdAt: new Date('2023-01-05').getTime()
          }
        ]
      }
    }
    
    // 计算属性
    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        // 搜索过滤
        const searchMatch = !searchQuery.value || 
          user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          user.id.toString().includes(searchQuery.value) ||
          (user.realName && user.realName.toLowerCase().includes(searchQuery.value.toLowerCase()))
        
        // 角色过滤
        const roleMatch = !roleFilter.value || user.role === roleFilter.value
        
        // 状态过滤
        const statusMatch = !statusFilter.value || user.status === statusFilter.value
        
        return searchMatch && roleMatch && statusMatch
      })
    })
    
    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      return filteredUsers.value.slice(start, start + pageSize.value)
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredUsers.value.length / pageSize.value)
    })
    
    const hasInactiveSelected = computed(() => {
      return selectedUsers.value.some(userId => {
        const user = users.value.find(u => u.id === userId)
        return user && user.status === 'inactive'
      })
    })
    
    const notificationIcon = computed(() => {
      switch (notificationType.value) {
        case 'success': return '✅'
        case 'error': return '❌'
        case 'warning': return '⚠️'
        default: return 'ℹ️'
      }
    })
    
    // 方法
    const getRoleText = (role) => {
      const roleMap = {
        'superAdmin': '超级管理员',
        'admin': '系统管理员',
        'teacher': '教师',
        'student': '学生'
      }
      return roleMap[role] || role
    }
    
    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
    
    const formatSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const showNotificationMessage = (type, message) => {
      notificationType.value = type
      notificationMessage.value = message
      showNotification.value = true
      setTimeout(() => {
        showNotification.value = false
      }, 3000)
    }
    
    const resetFilters = () => {
      searchQuery.value = ''
      roleFilter.value = ''
      statusFilter.value = ''
      currentPage.value = 1
      clearSelection()
    }
    
    const clearSelection = () => {
      selectedUsers.value = []
      selectAll.value = false
    }
    
    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedUsers.value = paginatedUsers.value.map(user => user.id)
      } else {
        selectedUsers.value = []
      }
    }
    
    const editUser = (user) => {
      Object.assign(userForm, user)
      resetPassword.value = false
      newPassword.value = ''
      showEditDialog.value = true
      showAddDialog.value = false
    }
    
    const closeDialog = () => {
      showAddDialog.value = false
      showEditDialog.value = false
      // 重置表单
      Object.keys(userForm).forEach(key => {
        userForm[key] = ''
      })
      userForm.role = 'student'
      userForm.status = 'active'
      resetPassword.value = false
      newPassword.value = ''
    }
    
    const saveUser = () => {
      // 表单验证
      if (!userForm.username || !userForm.email) {
        showNotificationMessage('error', '用户名和邮箱为必填项')
        return
      }
      
      if (!showEditDialog.value && userForm.password !== userForm.confirmPassword) {
        showNotificationMessage('error', '两次输入的密码不一致')
        return
      }
      
      if (showEditDialog.value) {
        // 编辑用户
        const index = users.value.findIndex(u => u.id === userForm.id)
        if (index !== -1) {
          users.value[index] = { ...users.value[index], ...userForm }
          if (resetPassword.value && newPassword.value) {
            // 这里可以添加密码重置逻辑
            showNotificationMessage('success', `用户 ${userForm.username} 已更新，密码已重置`)
          } else {
            showNotificationMessage('success', `用户 ${userForm.username} 已更新`)
          }
        }
      } else {
        // 添加用户
        const newId = Math.max(...users.value.map(u => u.id), 0) + 1
        const newUser = {
          ...userForm,
          id: newId,
          createdAt: Date.now()
        }
        users.value.push(newUser)
        showNotificationMessage('success', `用户 ${newUser.username} 已添加`)
      }
      
      closeDialog()
    }
    
    const toggleUserStatus = (userId, currentStatus) => {
      const user = users.value.find(u => u.id === userId)
      if (user) {
        user.status = currentStatus === 'active' ? 'inactive' : 'active'
        showNotificationMessage('success', `用户 ${user.username} 已${user.status === 'active' ? '启用' : '禁用'}`)
      }
    }
    
    const deleteUser = (userId, username) => {
      if (confirm(`确定要删除用户 ${username} 吗？此操作不可撤销！`)) {
        users.value = users.value.filter(u => u.id !== userId)
        selectedUsers.value = selectedUsers.value.filter(id => id !== userId)
        showNotificationMessage('success', `用户 ${username} 已删除`)
      }
    }
    
    const exportUsers = () => {
      // 模拟导出功能
      showNotificationMessage('success', '用户数据已成功导出')
    }
    
    const handleFileImport = (event) => {
      const file = event.target.files[0]
      if (file) {
        importedFile.value = file
      }
    }
    
    const confirmImport = () => {
      if (!importedFile.value) return
      
      // 模拟导入功能
      showImportDialog.value = false
      showNotificationMessage('success', `成功导入用户数据，共添加/更新 ${Math.floor(Math.random() * 50) + 5} 条记录`)
      importedFile.value = null
      
      // 重新加载数据
      loadUsers()
    }
    
    const downloadTemplate = () => {
      // 模拟下载模板
      showNotificationMessage('success', '导入模板已开始下载')
    }
    
    // 批量操作
    const batchToggleStatus = () => {
      const newStatus = hasInactiveSelected.value ? 'active' : 'inactive'
      selectedUsers.value.forEach(userId => {
        const user = users.value.find(u => u.id === userId)
        if (user) {
          user.status = newStatus
        }
      })
      showNotificationMessage('success', `已成功${newStatus === 'active' ? '启用' : '禁用'} ${selectedUsers.value.length} 个用户`)
      clearSelection()
    }
    
    const batchDeleteUsers = () => {
      if (confirm(`确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可撤销！`)) {
        const deletedCount = selectedUsers.value.length
        users.value = users.value.filter(u => !selectedUsers.value.includes(u.id))
        showNotificationMessage('success', `已成功删除 ${deletedCount} 个用户`)
        clearSelection()
      }
    }
    
    // 监听分页和每页条数变化，保持选中状态同步
    const syncSelectAll = () => {
      if (selectedUsers.value.length === paginatedUsers.value.length && paginatedUsers.value.length > 0) {
        selectAll.value = true
      } else {
        selectAll.value = false
      }
    }
    
    onMounted(() => {
      loadUsers()
      // 检查用户权限
      if (userState.role !== 'superAdmin' && userState.role !== 'admin') {
        showNotificationMessage('error', '权限不足，请联系管理员')
      }
    })
    
    return {
      users,
      searchQuery,
      roleFilter,
      statusFilter,
      currentPage,
      pageSize,
      filteredUsers,
      paginatedUsers,
      totalPages,
      selectedUsers,
      selectAll,
      showAddDialog,
      showEditDialog,
      showImportDialog,
      userForm,
      resetPassword,
      newPassword,
      importedFile,
      showNotification,
      notificationType,
      notificationMessage,
      notificationIcon,
      hasInactiveSelected,
      getRoleText,
      formatDate,
      formatSize,
      resetFilters,
      clearSelection,
      toggleSelectAll,
      editUser,
      closeDialog,
      saveUser,
      toggleUserStatus,
      deleteUser,
      exportUsers,
      handleFileImport,
      confirmImport,
      downloadTemplate,
      batchToggleStatus,
      batchDeleteUsers
    }
  }
}
</script>

<style scoped>
.system-users {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h2 {
  color: #333;
  font-size: 24px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f0f2f5;
  color: #333;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-button.primary {
  background-color: #1890ff;
  color: white;
}

.action-button.warning {
  background-color: #faad14;
  color: white;
}

.action-button.delete {
  background-color: #ff4d4f;
  color: white;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 搜索和筛选 */
.search-filter-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.filter-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

/* 用户表格 */
.users-table-container {
  background: white;
  border-radius: 8px;
  padding: 0;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.users-table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
}

.checkbox-column {
  width: 40px;
  text-align: center;
}

.users-table tbody tr:hover {
  background-color: #fafafa;
}

.users-table tbody tr.selected {
  background-color: #e6f7ff;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 500;
  color: #333;
}

.user-realname {
  font-size: 12px;
  color: #666;
}

.role-tag,
.status-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-tag.superAdmin {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.role-tag.admin {
  background-color: #fff7e6;
  color: #faad14;
}

.role-tag.teacher {
  background-color: #f6ffed;
  color: #52c41a;
}

.role-tag.student {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-tag.active {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-tag.inactive {
  background-color: #f5f5f5;
  color: #999;
}

.user-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.mini-button {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f0f2f5;
  color: #333;
}

.mini-button:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.mini-button.warning {
  background-color: #fff7e6;
  color: #faad14;
}

.mini-button.warning:hover {
  background-color: #fffbe6;
}

.mini-button.success {
  background-color: #f6ffed;
  color: #52c41a;
}

.mini-button.success:hover {
  background-color: #f0f9ff;
}

.mini-button.delete {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.mini-button.delete:hover {
  background-color: #fff2f0;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

/* 分页 */
.pagination {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 16px;
}

.page-info {
  color: #666;
}

.page-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.page-button {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.page-button:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.page-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-numbers {
  color: #666;
}

.page-size-select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

/* 批量操作 */
.batch-actions {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.batch-actions span {
  color: #333;
  font-weight: 500;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-header h3 {
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f0f0f0;
  color: #333;
}

.dialog-body {
  padding: 20px;
}

.dialog-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 表单样式 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.required {
  color: #ff4d4f;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 导入对话框特定样式 */
.import-instruction {
  margin-bottom: 20px;
}

.import-instruction p {
  margin-bottom: 12px;
  color: #333;
}

.file-input {
  width: 100%;
  padding: 12px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 12px;
  background-color: #fafafa;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e6f7ff;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 14px;
}

.import-warning {
  background-color: #fff7e6;
  padding: 16px;
  border-radius: 6px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.warning-icon {
  font-size: 20px;
}

.import-warning p {
  color: #d46b08;
  margin: 0;
}

/* 通知样式 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notification.success {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.notification.error {
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
}

.notification.warning {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.notification-icon {
  font-size: 20px;
}

.notification-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.notification-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #333;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions,
  .filter-options {
    width: 100%;
  }
  
  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
  
  .users-table-container {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 600px;
    font-size: 12px;
  }
  
  .users-table th,
  .users-table td {
    padding: 8px;
  }
  
  .user-actions {
    flex-direction: column;
  }
  
  .pagination {
    flex-direction: column;
    align-items: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .batch-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .notification {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>