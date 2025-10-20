<template>
  <div class="users-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddUserDialog = true">
          <i class="icon icon-add"></i> 添加用户
        </button>
        <button class="btn btn-secondary" @click="refreshUsers">
          <i class="icon icon-refresh"></i> 刷新
        </button>
      </div>
    </div>

    <!-- 用户统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon user-icon">
          <i class="icon icon-user"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ totalUsers }}</div>
          <div class="stat-label">总用户数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon admin-icon">
          <i class="icon icon-admin"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ adminUsers }}</div>
          <div class="stat-label">管理员用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon teacher-icon">
          <i class="icon icon-teacher"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ teacherUsers }}</div>
          <div class="stat-label">教师用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon student-icon">
          <i class="icon icon-student"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ studentUsers }}</div>
          <div class="stat-label">学生用户</div>
        </div>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="search-input-wrapper">
          <input 
            type="text" 
            v-model="searchKeyword" 
            class="search-input"
            placeholder="搜索用户名、姓名、邮箱..."
            @input="handleSearch"
          />
          <i class="icon icon-search search-icon"></i>
        </div>
        <div class="filter-group">
          <select v-model="filterRole" class="filter-select" @change="handleFilter">
            <option value="">所有角色</option>
            <option value="superAdmin">超级管理员</option>
            <option value="admin">管理员</option>
            <option value="teacher">教师</option>
            <option value="student">学生</option>
          </select>
          <select v-model="filterStatus" class="filter-select" @change="handleFilter">
            <option value="">所有状态</option>
            <option value="active">活跃</option>
            <option value="inactive">禁用</option>
          </select>
          <button class="btn btn-outline" @click="resetFilters">重置筛选</button>
        </div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="users-table-wrapper">
      <table class="users-table">
        <thead>
          <tr>
            <th @click="handleSort('id')" class="sortable">
              <span>ID</span>
              <span v-if="sortField === 'id'" class="sort-icon" :class="sortDirection">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="handleSort('username')" class="sortable">
              <span>用户名</span>
              <span v-if="sortField === 'username'" class="sort-icon" :class="sortDirection">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>姓名</th>
            <th @click="handleSort('role')" class="sortable">
              <span>角色</span>
              <span v-if="sortField === 'role'" class="sort-icon" :class="sortDirection">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>邮箱</th>
            <th>手机号</th>
            <th @click="handleSort('createdAt')" class="sortable">
              <span>创建时间</span>
              <span v-if="sortField === 'createdAt'" class="sort-icon" :class="sortDirection">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>
              <div class="username-cell">
                <div class="avatar">{{ getAvatarText(user.username) }}</div>
                <span class="username" v-html="highlightKeyword(user.username)"></span>
              </div>
            </td>
            <td>{{ user.realName || '-' }}</td>
            <td>
              <span class="role-badge" :class="user.role">
                {{ getRoleText(user.role) }}
              </span>
            </td>
            <td>{{ user.email || '-' }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <span class="status-badge" :class="user.status">
                {{ user.status === 'active' ? '活跃' : '禁用' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  class="action-btn action-edit" 
                  @click="editUser(user)"
                  :disabled="user.role === 'superAdmin'"
                  title="编辑"
                >
                  <i class="icon icon-edit"></i>
                </button>
                <button 
                  class="action-btn action-reset" 
                  @click="resetPassword(user)"
                  title="重置密码"
                >
                  <i class="icon icon-lock"></i>
                </button>
                <button 
                  class="action-btn" 
                  :class="user.status === 'active' ? 'action-disable' : 'action-enable'"
                  @click="toggleUserStatus(user)"
                  title="{{ user.status === 'active' ? '禁用' : '启用' }}"
                >
                  <i :class="user.status === 'active' ? 'icon icon-disable' : 'icon icon-enable'"></i>
                </button>
                <button 
                  class="action-btn action-delete" 
                  @click="confirmDeleteUser(user)"
                  :disabled="user.role === 'superAdmin'"
                  title="删除"
                >
                  <i class="icon icon-delete"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="9" class="no-data">
              <div class="no-data-content">
                <i class="icon icon-empty"></i>
                <p>{{ searchKeyword ? '没有找到匹配的用户' : '暂无用户数据' }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination-container">
      <div class="pagination-info">
        共 {{ filteredUsers.length }} 条数据，第 {{ currentPage }} / {{ totalPages }} 页
      </div>
      <div class="pagination-controls">
        <button 
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage = 1"
        >
          首页
        </button>
        <button 
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <button 
          v-for="page in visiblePages" 
          :key="page"
          class="pagination-btn"
          :class="{ active: page === currentPage }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
        >
          末页
        </button>
        <select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
          <option :value="10">10条/页</option>
          <option :value="20">20条/页</option>
          <option :value="50">50条/页</option>
          <option :value="100">100条/页</option>
        </select>
      </div>
    </div>

    <!-- 添加/编辑用户对话框 -->
    <div class="dialog-overlay" v-if="showAddUserDialog || showEditUserDialog" @click.self="closeUserDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ showEditUserDialog ? '编辑用户' : '添加用户' }}</h3>
          <button class="dialog-close" @click="closeUserDialog">×</button>
        </div>
        <div class="dialog-content">
          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label>用户名 *</label>
              <input 
                type="text" 
                v-model="currentUser.username" 
                class="form-input"
                :disabled="showEditUserDialog"
                required
                placeholder="请输入用户名"
              />
            </div>
            <div class="form-group">
              <label>姓名 *</label>
              <input 
                type="text" 
                v-model="currentUser.realName" 
                class="form-input"
                required
                placeholder="请输入真实姓名"
              />
            </div>
            <div class="form-group">
              <label>角色 *</label>
              <select v-model="currentUser.role" class="form-select" required>
                <option value="admin">管理员</option>
                <option value="teacher">教师</option>
                <option value="student">学生</option>
              </select>
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input 
                type="email" 
                v-model="currentUser.email" 
                class="form-input"
                placeholder="请输入邮箱地址"
              />
            </div>
            <div class="form-group">
              <label>手机号</label>
              <input 
                type="tel" 
                v-model="currentUser.phone" 
                class="form-input"
                placeholder="请输入手机号"
              />
            </div>
            <div class="form-group" v-if="!showEditUserDialog">
              <label>密码 *</label>
              <input 
                type="password" 
                v-model="currentUser.password" 
                class="form-input"
                required
                placeholder="请输入密码"
              />
            </div>
          </form>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="closeUserDialog">取消</button>
          <button class="btn btn-primary" @click="saveUser">保存</button>
        </div>
      </div>
    </div>

    <!-- 重置密码对话框 -->
    <div class="dialog-overlay" v-if="showResetPasswordDialog" @click.self="showResetPasswordDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>重置密码</h3>
          <button class="dialog-close" @click="showResetPasswordDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <p>确定要重置用户 <strong>{{ resetPasswordUser?.username }}</strong> 的密码吗？</p>
          <p class="dialog-tip">重置后密码将变为默认值：<strong>123456</strong></p>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showResetPasswordDialog = false">取消</button>
          <button class="btn btn-primary" @click="confirmResetPassword">确定重置</button>
        </div>
      </div>
    </div>

    <!-- 删除用户确认对话框 -->
    <div class="dialog-overlay" v-if="showDeleteDialog" @click.self="showDeleteDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>删除用户</h3>
          <button class="dialog-close" @click="showDeleteDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <p class="delete-warning">
            <i class="icon icon-warning"></i>
            警告：删除用户将无法恢复，请谨慎操作！
          </p>
          <p>确定要删除用户 <strong>{{ deleteUser?.username }}</strong> 吗？</p>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showDeleteDialog = false">取消</button>
          <button class="btn btn-danger" @click="deleteUser">删除</button>
        </div>
      </div>
    </div>

    <!-- 通知消息组件 -->
    <div class="notifications-container">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification" 
        :class="notification.type"
        :style="{ animationDelay: `${notification.id * 100}ms` }"
      >
        <div class="notification-content">
          <i class="icon" :class="getNotificationIcon(notification.type)"></i>
          <span>{{ notification.message }}</span>
        </div>
        <button class="notification-close" @click="removeNotification(notification.id)">×</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { userState } from '../../../store/index.js'

export default {
  name: 'Users',
  setup() {
    // 状态管理
    const users = ref([])
    const searchKeyword = ref('')
    const filterRole = ref('')
    const filterStatus = ref('')
    const sortField = ref('createdAt')
    const sortDirection = ref('desc')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const notificationId = ref(0)
    const notifications = ref([])
    
    // 对话框状态
    const showAddUserDialog = ref(false)
    const showEditUserDialog = ref(false)
    const showResetPasswordDialog = ref(false)
    const showDeleteDialog = ref(false)
    
    // 当前操作的用户
    const currentUser = ref({})
    const resetPasswordUser = ref(null)
    const deleteUser = ref(null)

    // 初始化模拟数据
    const initMockData = () => {
      users.value = [
        { id: 1, username: 'admin', realName: '超级管理员', role: 'superAdmin', email: 'admin@example.com', phone: '13800138000', status: 'active', createdAt: new Date('2023-01-01') },
        { id: 2, username: 'system', realName: '系统管理员', role: 'admin', email: 'system@example.com', phone: '13800138001', status: 'active', createdAt: new Date('2023-01-02') },
        { id: 3, username: 'teacher1', realName: '张老师', role: 'teacher', email: 'teacher1@example.com', phone: '13800138002', status: 'active', createdAt: new Date('2023-01-03') },
        { id: 4, username: 'teacher2', realName: '李老师', role: 'teacher', email: 'teacher2@example.com', phone: '13800138003', status: 'active', createdAt: new Date('2023-01-04') },
        { id: 5, username: 'student1', realName: '张三', role: 'student', email: 'student1@example.com', phone: '13800138004', status: 'active', createdAt: new Date('2023-01-05') },
        { id: 6, username: 'student2', realName: '李四', role: 'student', email: 'student2@example.com', phone: '13800138005', status: 'active', createdAt: new Date('2023-01-06') },
        { id: 7, username: 'student3', realName: '王五', role: 'student', email: 'student3@example.com', phone: '13800138006', status: 'inactive', createdAt: new Date('2023-01-07') },
        { id: 8, username: 'student4', realName: '赵六', role: 'student', email: 'student4@example.com', phone: '13800138007', status: 'active', createdAt: new Date('2023-01-08') },
        { id: 9, username: 'teacher3', realName: '王老师', role: 'teacher', email: 'teacher3@example.com', phone: '13800138008', status: 'active', createdAt: new Date('2023-01-09') },
        { id: 10, username: 'student5', realName: '钱七', role: 'student', email: 'student5@example.com', phone: '13800138009', status: 'active', createdAt: new Date('2023-01-10') },
      ]
    }

    // 计算属性：筛选后的用户列表
    const filteredUsers = computed(() => {
      let result = [...users.value]
      
      // 关键词搜索
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        result = result.filter(user => 
          user.username.toLowerCase().includes(keyword) ||
          (user.realName && user.realName.toLowerCase().includes(keyword)) ||
          (user.email && user.email.toLowerCase().includes(keyword)) ||
          (user.phone && user.phone.includes(keyword))
        )
      }
      
      // 角色筛选
      if (filterRole.value) {
        result = result.filter(user => user.role === filterRole.value)
      }
      
      // 状态筛选
      if (filterStatus.value) {
        result = result.filter(user => user.status === filterStatus.value)
      }
      
      // 排序
      result.sort((a, b) => {
        const aValue = a[sortField.value]
        const bValue = b[sortField.value]
        
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1
        
        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection.value === 'asc' 
            ? aValue - bValue 
            : bValue - aValue
        }
        
        const compare = aValue.toString().localeCompare(bValue.toString())
        return sortDirection.value === 'asc' ? compare : -compare
      })
      
      return result
    })

    // 计算属性：分页后的用户列表
    const paginatedUsers = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredUsers.value.slice(start, end)
    })

    // 计算属性：总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredUsers.value.length / pageSize.value)
    })

    // 计算属性：可见的页码
    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      
      let startPage = Math.max(1, current - 2)
      let endPage = Math.min(total, startPage + 4)
      
      if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4)
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      
      return pages
    })

    // 计算属性：用户统计
    const totalUsers = computed(() => users.value.length)
    const adminUsers = computed(() => users.value.filter(u => u.role === 'admin' || u.role === 'superAdmin').length)
    const teacherUsers = computed(() => users.value.filter(u => u.role === 'teacher').length)
    const studentUsers = computed(() => users.value.filter(u => u.role === 'student').length)

    // 方法：格式化日期
    const formatDate = (date) => {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 方法：获取角色文本
    const getRoleText = (role) => {
      const roleMap = {
        superAdmin: '超级管理员',
        admin: '管理员',
        teacher: '教师',
        student: '学生'
      }
      return roleMap[role] || role
    }

    // 方法：获取头像文本
    const getAvatarText = (username) => {
      return username ? username.charAt(0).toUpperCase() : '?'
    }

    // 方法：高亮搜索关键词
    const highlightKeyword = (text) => {
      if (!searchKeyword.value || !text) return text
      
      const keyword = searchKeyword.value
      const regex = new RegExp(`(${keyword})`, 'gi')
      return text.replace(regex, '<span class="highlight">$1</span>')
    }

    // 方法：搜索处理
    const handleSearch = () => {
      currentPage.value = 1
    }

    // 方法：筛选处理
    const handleFilter = () => {
      currentPage.value = 1
    }

    // 方法：重置筛选
    const resetFilters = () => {
      searchKeyword.value = ''
      filterRole.value = ''
      filterStatus.value = ''
      currentPage.value = 1
    }

    // 方法：排序处理
    const handleSort = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
    }

    // 方法：页面大小变更
    const handlePageSizeChange = () => {
      currentPage.value = 1
    }

    // 方法：打开添加用户对话框
    const openAddUserDialog = () => {
      resetCurrentUser()
      showAddUserDialog.value = true
    }

    // 方法：编辑用户
    const editUser = (user) => {
      currentUser.value = { ...user }
      showEditUserDialog.value = true
    }

    // 方法：重置当前用户
    const resetCurrentUser = () => {
      currentUser.value = {
        username: '',
        realName: '',
        role: 'student',
        email: '',
        phone: '',
        password: '',
        status: 'active'
      }
    }

    // 方法：关闭用户对话框
    const closeUserDialog = () => {
      showAddUserDialog.value = false
      showEditUserDialog.value = false
      resetCurrentUser()
    }

    // 方法：保存用户
    const saveUser = () => {
      if (showAddUserDialog.value) {
        // 添加新用户
        const newUser = {
          ...currentUser.value,
          id: users.value.length + 1,
          createdAt: new Date()
        }
        users.value.push(newUser)
        addNotification('success', `用户 ${newUser.username} 添加成功`)
      } else if (showEditUserDialog.value) {
        // 更新用户
        const index = users.value.findIndex(u => u.id === currentUser.value.id)
        if (index !== -1) {
          users.value[index] = { ...currentUser.value }
          addNotification('success', `用户 ${currentUser.value.username} 更新成功`)
        }
      }
      closeUserDialog()
    }

    // 方法：重置密码
    const resetPassword = (user) => {
      resetPasswordUser.value = user
      showResetPasswordDialog.value = true
    }

    // 方法：确认重置密码
    const confirmResetPassword = () => {
      addNotification('success', `用户 ${resetPasswordUser.value.username} 密码已重置为 123456`)
      showResetPasswordDialog.value = false
      resetPasswordUser.value = null
    }

    // 方法：切换用户状态
    const toggleUserStatus = (user) => {
      const index = users.value.findIndex(u => u.id === user.id)
      if (index !== -1) {
        users.value[index].status = users.value[index].status === 'active' ? 'inactive' : 'active'
        addNotification('success', `用户 ${user.username} 状态已更改为 ${users.value[index].status === 'active' ? '活跃' : '禁用'}`)
      }
    }

    // 方法：确认删除用户
    const confirmDeleteUser = (user) => {
      if (user.role === 'superAdmin') {
        addNotification('error', '超级管理员用户不能删除')
        return
      }
      deleteUser.value = user
      showDeleteDialog.value = true
    }

    // 方法：删除用户
    const deleteUser = () => {
      const index = users.value.findIndex(u => u.id === deleteUser.value.id)
      if (index !== -1) {
        users.value.splice(index, 1)
        addNotification('success', `用户 ${deleteUser.value.username} 已删除`)
        
        // 重新计算页码
        if (currentPage.value > totalPages.value) {
          currentPage.value = Math.max(1, totalPages.value)
        }
      }
      showDeleteDialog.value = false
      deleteUser.value = null
    }

    // 方法：刷新用户列表
    const refreshUsers = () => {
      initMockData()
      resetFilters()
      addNotification('success', '用户列表已刷新')
    }

    // 方法：添加通知
    const addNotification = (type, message) => {
      const id = notificationId.value++
      notifications.value.push({ id, type, message })
      
      // 3秒后自动移除
      setTimeout(() => {
        removeNotification(id)
      }, 3000)
    }

    // 方法：移除通知
    const removeNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }
    }

    // 方法：获取通知图标
    const getNotificationIcon = (type) => {
      const iconMap = {
        success: 'icon-success',
        error: 'icon-error',
        warning: 'icon-warning',
        info: 'icon-info'
      }
      return iconMap[type] || 'icon-info'
    }

    // 组件挂载时初始化数据
    onMounted(() => {
      initMockData()
    })

    return {
      // 数据状态
      users,
      searchKeyword,
      filterRole,
      filterStatus,
      sortField,
      sortDirection,
      currentPage,
      pageSize,
      notifications,
      
      // 对话框状态
      showAddUserDialog,
      showEditUserDialog,
      showResetPasswordDialog,
      showDeleteDialog,
      currentUser,
      resetPasswordUser,
      deleteUser,
      
      // 计算属性
      filteredUsers,
      paginatedUsers,
      totalPages,
      visiblePages,
      totalUsers,
      adminUsers,
      teacherUsers,
      studentUsers,
      
      // 方法
      formatDate,
      getRoleText,
      getAvatarText,
      highlightKeyword,
      handleSearch,
      handleFilter,
      resetFilters,
      handleSort,
      handlePageSizeChange,
      openAddUserDialog,
      editUser,
      closeUserDialog,
      saveUser,
      resetPassword,
      confirmResetPassword,
      toggleUserStatus,
      confirmDeleteUser,
      deleteUser,
      refreshUsers,
      removeNotification,
      getNotificationIcon
    }
  }
}
</script>

<style scoped>
.users-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 按钮基础样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background-color: #4facfe;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #3d93e1;
}

.btn-outline {
  background-color: white;
  border: 1px solid #ddd;
  color: #666;
}

.btn-outline:hover {
  border-color: #667eea;
  color: #667eea;
}

.btn-danger {
  background-color: #f56565;
  color: white;
}

.btn-danger:hover {
  background-color: #e53e3e;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.admin-icon {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
}

.teacher-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.student-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 筛选区域样式 */
.filter-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

/* 表格样式 */
.users-table-wrapper {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background-color: #f8f9fa;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

.users-table th.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 25px;
}

.users-table th.sortable:hover {
  background-color: #f0f2f5;
}

.sort-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
}

.users-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  color: #333;
}

.users-table tr:last-child td {
  border-bottom: none;
}

.users-table tr:hover {
  background-color: #f8f9fa;
}

/* 用户名单元格 */
.username-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.username {
  font-weight: 500;
}

/* 标签样式 */
.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.superAdmin {
  background-color: #fff5f5;
  color: #c53030;
}

.role-badge.admin {
  background-color: #fff7e6;
  color: #ea8600;
}

.role-badge.teacher {
  background-color: #f0f9ff;
  color: #0284c7;
}

.role-badge.student {
  background-color: #f0fdf4;
  color: #15803d;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e6f7e9;
  color: #28a745;
}

.status-badge.inactive {
  background-color: #f8f9fa;
  color: #6c757d;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 5px;
  align-items: center;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  background-color: #f8f9fa;
  color: #666;
}

.action-btn:hover:not(:disabled) {
  background-color: #e9ecef;
}

.action-edit:hover:not(:disabled) {
  background-color: #e3f2fd;
  color: #1976d2;
}

.action-reset:hover:not(:disabled) {
  background-color: #fff8e1;
  color: #ff8f00;
}

.action-disable:hover:not(:disabled) {
  background-color: #ffebee;
  color: #f44336;
}

.action-enable:hover:not(:disabled) {
  background-color: #e8f5e8;
  color: #4caf50;
}

.action-delete:hover:not(:disabled) {
  background-color: #ffebee;
  color: #f44336;
}

/* 无数据样式 */
.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.no-data-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.no-data-content i {
  font-size: 48px;
  opacity: 0.3;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  gap: 5px;
  align-items: center;
}

.pagination-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.pagination-btn.active {
  background-color: #667eea;
  border-color: #667eea;
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-size-select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-left: 10px;
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.dialog {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s;
}

.dialog-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  color: #333;
}

.dialog-close {
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
  border-radius: 50%;
  transition: all 0.3s;
}

.dialog-close:hover {
  background-color: #f5f5f5;
  color: #666;
}

.dialog-content {
  padding: 20px;
}

.dialog-footer {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-tip {
  color: #999;
  font-size: 14px;
}

.delete-warning {
  background-color: #fff5f5;
  border-left: 4px solid #ff4d4f;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #c53030;
}

/* 表单样式 */
.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* 通知样式 */
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
}

.notification {
  background-color: white;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideInRight 0.3s ease-out forwards, fadeOut 0.3s 2.7s forwards;
  transform: translateX(100%);
}

.notification.success {
  border-left: 4px solid #52c41a;
}

.notification.error {
  border-left: 4px solid #ff4d4f;
}

.notification.warning {
  border-left: 4px solid #faad14;
}

.notification.info {
  border-left: 4px solid #1890ff;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.notification-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.notification-close:hover {
  background-color: #f5f5f5;
  color: #666;
}

/* 高亮搜索结果 */
.highlight {
  background-color: #fffacd;
  color: #000;
  padding: 0 2px;
  border-radius: 2px;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  to {
    transform: translateX(0);
  }
}

@keyframes fadeOut {
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .users-container {
    padding: 10px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input-wrapper {
    max-width: none;
  }
  
  .filter-group {
    justify-content: center;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .pagination-info {
    order: 2;
  }
  
  .pagination-controls {
    order: 1;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .users-table-wrapper {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 600px;
  }
  
  .dialog {
    width: 95%;
    margin: 10px;
  }
}
</style>