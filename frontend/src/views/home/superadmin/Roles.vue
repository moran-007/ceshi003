<template>
  <div class="roles-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>角色与权限管理</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddRoleDialog = true">
          <i class="icon icon-add"></i> 创建角色
        </button>
        <button class="btn btn-secondary" @click="refreshRoles">
          <i class="icon icon-refresh"></i> 刷新
        </button>
      </div>
    </div>

    <!-- 角色统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ roles.length }}</div>
          <div class="stat-label">角色总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ defaultRolesCount }}</div>
          <div class="stat-label">系统默认角色</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ customRolesCount }}</div>
          <div class="stat-label">自定义角色</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-number">{{ totalPermissions }}</div>
          <div class="stat-label">权限总数</div>
        </div>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <div class="filter-section">
      <div class="search-input-wrapper">
        <input 
          type="text" 
          v-model="searchKeyword" 
          class="search-input"
          placeholder="搜索角色名称..."
          @input="handleSearch"
        />
        <i class="icon icon-search search-icon"></i>
      </div>
    </div>

    <!-- 角色列表 -->
    <div class="roles-table-wrapper">
      <table class="roles-table">
        <thead>
          <tr>
            <th>角色名称</th>
            <th>角色描述</th>
            <th>权限数量</th>
            <th>使用用户数</th>
            <th>创建时间</th>
            <th>类型</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in filteredRoles" :key="role.id">
            <td>
              <div class="role-name-cell">
                <div class="role-avatar" :style="{ backgroundColor: getRoleColor(role.name) }">{{ role.name.charAt(0).toUpperCase() }}</div>
                <span v-html="highlightKeyword(role.name)"></span>
              </div>
            </td>
            <td>{{ role.description || '-' }}</td>
            <td>{{ role.permissions.length }}</td>
            <td>{{ role.userCount }}</td>
            <td>{{ formatDate(role.createdAt) }}</td>
            <td>
              <span class="type-badge" :class="role.isDefault ? 'default' : 'custom'">
                {{ role.isDefault ? '系统默认' : '自定义' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  class="action-btn action-edit" 
                  @click="editRole(role)"
                  :disabled="role.isDefault"
                  title="编辑"
                >
                  <i class="icon icon-edit"></i>
                </button>
                <button 
                  class="action-btn action-permission" 
                  @click="managePermissions(role)"
                  title="权限管理"
                >
                  <i class="icon icon-shield"></i>
                </button>
                <button 
                  class="action-btn action-delete" 
                  @click="confirmDeleteRole(role)"
                  :disabled="role.isDefault || role.userCount > 0"
                  :title="role.isDefault ? '系统默认角色不能删除' : role.userCount > 0 ? '有用户正在使用此角色，无法删除' : '删除'"
                >
                  <i class="icon icon-delete"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredRoles.length === 0">
            <td colspan="7" class="no-data">
              <div class="no-data-content">
                <i class="icon icon-empty"></i>
                <p>{{ searchKeyword ? '没有找到匹配的角色' : '暂无角色数据' }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加/编辑角色对话框 -->
    <div class="dialog-overlay" v-if="showAddRoleDialog || showEditRoleDialog" @click.self="closeRoleDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ showEditRoleDialog ? '编辑角色' : '创建角色' }}</h3>
          <button class="dialog-close" @click="closeRoleDialog">×</button>
        </div>
        <div class="dialog-content">
          <form @submit.prevent="saveRole">
            <div class="form-group">
              <label>角色名称 *</label>
              <input 
                type="text" 
                v-model="currentRole.name" 
                class="form-input"
                required
                placeholder="请输入角色名称"
              />
            </div>
            <div class="form-group">
              <label>角色描述</label>
              <textarea 
                v-model="currentRole.description" 
                class="form-input"
                rows="3"
                placeholder="请输入角色描述"
              ></textarea>
            </div>
          </form>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="closeRoleDialog">取消</button>
          <button class="btn btn-primary" @click="saveRole">保存</button>
        </div>
      </div>
    </div>

    <!-- 权限管理对话框 -->
    <div class="dialog-overlay" v-if="showPermissionDialog" @click.self="showPermissionDialog = false">
      <div class="dialog dialog-large">
        <div class="dialog-header">
          <h3>角色权限管理 - {{ selectedRole?.name }}</h3>
          <button class="dialog-close" @click="showPermissionDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="permission-tabs">
            <div 
              v-for="tab in permissionTabs" 
              :key="tab.key"
              class="tab-item"
              :class="{ active: activePermissionTab === tab.key }"
              @click="activePermissionTab = tab.key"
            >
              {{ tab.label }}
            </div>
          </div>
          
          <div class="permission-content">
            <div v-if="activePermissionTab === 'all'" class="permission-categories">
              <div v-for="category in permissionCategories" :key="category.name" class="permission-category">
                <div class="category-header">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      :checked="isCategoryChecked(category.name)"
                      :indeterminate="isCategoryIndeterminate(category.name)"
                      @change="toggleCategory(category.name)"
                    />
                    <span class="checkbox-text">{{ category.label }}</span>
                  </label>
                </div>
                <div class="permission-items">
                  <label 
                    v-for="permission in category.permissions" 
                    :key="permission.name"
                    class="checkbox-label permission-item"
                  >
                    <input 
                      type="checkbox" 
                      :checked="isPermissionChecked(permission.name)"
                      @change="togglePermission(permission.name)"
                    />
                    <span class="checkbox-text">
                      <strong>{{ permission.label }}</strong>
                      <small>{{ permission.description }}</small>
                    </span>
                  </label>
                </div>
              </div>
            </div>
            
            <div v-else-if="activePermissionTab === 'assigned'" class="permission-categories">
              <div v-if="selectedRole?.permissions.length === 0" class="no-permissions">
                <p>当前角色暂无分配权限</p>
              </div>
              <div v-else class="permission-list">
                <div 
                  v-for="permission in getAssignedPermissions()" 
                  :key="permission.name"
                  class="assigned-permission"
                >
                  <div class="permission-info">
                    <strong>{{ permission.label }}</strong>
                    <small>{{ permission.description }}</small>
                  </div>
                  <button class="remove-permission" @click="togglePermission(permission.name)">
                    <i class="icon icon-remove"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-else-if="activePermissionTab === 'history'" class="permission-history">
              <table class="history-table">
                <thead>
                  <tr>
                    <th>操作时间</th>
                    <th>操作人</th>
                    <th>操作内容</th>
                    <th>变更权限</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in permissionHistory" :key="record.id">
                    <td>{{ formatDateTime(record.time) }}</td>
                    <td>{{ record.operator }}</td>
                    <td>{{ record.action }}</td>
                    <td>{{ record.permissions }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showPermissionDialog = false">关闭</button>
          <button class="btn btn-primary" @click="savePermissions">保存更改</button>
        </div>
      </div>
    </div>

    <!-- 删除角色确认对话框 -->
    <div class="dialog-overlay" v-if="showDeleteDialog" @click.self="showDeleteDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>删除角色</h3>
          <button class="dialog-close" @click="showDeleteDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <p class="delete-warning">
            <i class="icon icon-warning"></i>
            警告：删除角色将无法恢复，请谨慎操作！
          </p>
          <p>确定要删除角色 <strong>{{ deleteRole?.name }}</strong> 吗？</p>
          <p v-if="deleteRole?.userCount > 0" class="delete-error">
            错误：该角色正在被 {{ deleteRole.userCount }} 个用户使用，无法删除！
          </p>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showDeleteDialog = false">取消</button>
          <button 
            class="btn btn-danger" 
            @click="deleteRole"
            :disabled="deleteRole?.isDefault || deleteRole?.userCount > 0"
          >
            删除
          </button>
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

export default {
  name: 'Roles',
  setup() {
    // 状态管理
    const roles = ref([])
    const searchKeyword = ref('')
    const notificationId = ref(0)
    const notifications = ref([])
    
    // 对话框状态
    const showAddRoleDialog = ref(false)
    const showEditRoleDialog = ref(false)
    const showPermissionDialog = ref(false)
    const showDeleteDialog = ref(false)
    
    // 当前操作的角色
    const currentRole = ref({})
    const selectedRole = ref(null)
    const deleteRole = ref(null)
    
    // 权限管理相关
    const activePermissionTab = ref('all')
    const permissionTabs = [
      { key: 'all', label: '所有权限' },
      { key: 'assigned', label: '已分配权限' },
      { key: 'history', label: '变更历史' }
    ]
    
    // 权限分类和列表
    const permissionCategories = ref([
      {
        name: 'user',
        label: '用户管理',
        permissions: [
          { name: 'user:view', label: '查看用户', description: '查看用户列表和详情' },
          { name: 'user:create', label: '创建用户', description: '创建新用户账户' },
          { name: 'user:edit', label: '编辑用户', description: '编辑用户信息' },
          { name: 'user:delete', label: '删除用户', description: '删除用户账户' },
          { name: 'user:resetPassword', label: '重置密码', description: '重置用户密码' },
          { name: 'user:status', label: '修改状态', description: '启用/禁用用户账户' }
        ]
      },
      {
        name: 'role',
        label: '角色权限管理',
        permissions: [
          { name: 'role:view', label: '查看角色', description: '查看角色列表和详情' },
          { name: 'role:create', label: '创建角色', description: '创建新角色' },
          { name: 'role:edit', label: '编辑角色', description: '编辑角色信息' },
          { name: 'role:delete', label: '删除角色', description: '删除角色' },
          { name: 'permission:manage', label: '管理权限', description: '分配和管理权限' }
        ]
      },
      {
        name: 'teacher',
        label: '教师管理',
        permissions: [
          { name: 'teacher:view', label: '查看教师', description: '查看教师列表和详情' },
          { name: 'teacher:create', label: '创建教师', description: '创建教师信息' },
          { name: 'teacher:edit', label: '编辑教师', description: '编辑教师信息' },
          { name: 'teacher:delete', label: '删除教师', description: '删除教师信息' }
        ]
      },
      {
        name: 'student',
        label: '学生管理',
        permissions: [
          { name: 'student:view', label: '查看学生', description: '查看学生列表和详情' },
          { name: 'student:create', label: '创建学生', description: '创建学生信息' },
          { name: 'student:edit', label: '编辑学生', description: '编辑学生信息' },
          { name: 'student:delete', label: '删除学生', description: '删除学生信息' },
          { name: 'student:import', label: '批量导入', description: '批量导入学生数据' }
        ]
      },
      {
        name: 'course',
        label: '课程管理',
        permissions: [
          { name: 'course:view', label: '查看课程', description: '查看课程列表和详情' },
          { name: 'course:create', label: '创建课程', description: '创建新课程' },
          { name: 'course:edit', label: '编辑课程', description: '编辑课程信息' },
          { name: 'course:delete', label: '删除课程', description: '删除课程' }
        ]
      },
      {
        name: 'system',
        label: '系统管理',
        permissions: [
          { name: 'system:config', label: '系统配置', description: '配置系统参数' },
          { name: 'system:backup', label: '数据备份', description: '执行数据备份和恢复' },
          { name: 'system:log', label: '查看日志', description: '查看系统操作日志' },
          { name: 'system:monitor', label: '系统监控', description: '监控系统运行状态' }
        ]
      }
    ])
    
    // 权限历史记录（模拟）
    const permissionHistory = ref([
      { id: 1, time: new Date('2023-06-10 10:30'), operator: 'admin', action: '添加权限', permissions: 'user:view, user:edit' },
      { id: 2, time: new Date('2023-06-05 14:20'), operator: 'admin', action: '移除权限', permissions: 'user:delete' },
      { id: 3, time: new Date('2023-05-28 09:15'), operator: 'admin', action: '批量更新', permissions: 'course:view, course:create, course:edit' }
    ])

    // 初始化模拟数据
    const initMockData = () => {
      roles.value = [
        { 
          id: 1, 
          name: '超级管理员', 
          description: '系统最高权限，拥有所有功能权限', 
          permissions: getAllPermissionNames(),
          userCount: 1,
          isDefault: true,
          createdAt: new Date('2023-01-01')
        },
        { 
          id: 2, 
          name: '管理员', 
          description: '系统管理员，拥有大部分管理权限', 
          permissions: ['user:view', 'user:create', 'user:edit', 'user:resetPassword', 'user:status', 'teacher:view', 'teacher:create', 'teacher:edit', 'student:view', 'student:create', 'student:edit', 'student:import', 'course:view', 'course:create', 'course:edit', 'system:log'],
          userCount: 3,
          isDefault: true,
          createdAt: new Date('2023-01-01')
        },
        { 
          id: 3, 
          name: '教师', 
          description: '普通教师权限', 
          permissions: ['student:view', 'course:view'],
          userCount: 15,
          isDefault: true,
          createdAt: new Date('2023-01-01')
        },
        { 
          id: 4, 
          name: '学生', 
          description: '学生权限', 
          permissions: ['course:view'],
          userCount: 200,
          isDefault: true,
          createdAt: new Date('2023-01-01')
        },
        { 
          id: 5, 
          name: '财务管理员', 
          description: '财务管理相关权限', 
          permissions: ['user:view', 'system:log'],
          userCount: 2,
          isDefault: false,
          createdAt: new Date('2023-02-15')
        }
      ]
    }

    // 获取所有权限名称
    const getAllPermissionNames = () => {
      return permissionCategories.value.flatMap(category => 
        category.permissions.map(permission => permission.name)
      )
    }

    // 计算属性：筛选后的角色列表
    const filteredRoles = computed(() => {
      if (!searchKeyword.value) return roles.value
      
      const keyword = searchKeyword.value.toLowerCase()
      return roles.value.filter(role => 
        role.name.toLowerCase().includes(keyword) ||
        (role.description && role.description.toLowerCase().includes(keyword))
      )
    })

    // 计算属性：统计数据
    const defaultRolesCount = computed(() => roles.value.filter(r => r.isDefault).length)
    const customRolesCount = computed(() => roles.value.filter(r => !r.isDefault).length)
    const totalPermissions = computed(() => getAllPermissionNames().length)

    // 方法：格式化日期
    const formatDate = (date) => {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleDateString('zh-CN')
    }

    // 方法：格式化日期时间
    const formatDateTime = (date) => {
      if (!date) return ''
      const d = new Date(date)
      return d.toLocaleString('zh-CN')
    }

    // 方法：获取角色颜色
    const getRoleColor = (roleName) => {
      const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', 
        '#00f2fe', '#43e97b', '#38f9d7', '#ff9a9e', '#fad0c4'
      ]
      let hash = 0
      for (let i = 0; i < roleName.length; i++) {
        hash = roleName.charCodeAt(i) + ((hash << 5) - hash)
      }
      return colors[Math.abs(hash % colors.length)]
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
      // 搜索逻辑已在computed中处理
    }

    // 方法：重置当前角色
    const resetCurrentRole = () => {
      currentRole.value = {
        name: '',
        description: '',
        permissions: [],
        userCount: 0,
        isDefault: false
      }
    }

    // 方法：关闭角色对话框
    const closeRoleDialog = () => {
      showAddRoleDialog.value = false
      showEditRoleDialog.value = false
      resetCurrentRole()
    }

    // 方法：编辑角色
    const editRole = (role) => {
      currentRole.value = { ...role }
      showEditRoleDialog.value = true
    }

    // 方法：保存角色
    const saveRole = () => {
      if (showAddRoleDialog.value) {
        // 添加新角色
        const newRole = {
          ...currentRole.value,
          id: roles.value.length + 1,
          permissions: [],
          userCount: 0,
          createdAt: new Date()
        }
        roles.value.push(newRole)
        addNotification('success', `角色 ${newRole.name} 创建成功`)
      } else if (showEditRoleDialog.value) {
        // 更新角色
        const index = roles.value.findIndex(r => r.id === currentRole.value.id)
        if (index !== -1) {
          // 保留原有权限和用户数
          roles.value[index] = {
            ...currentRole.value,
            permissions: roles.value[index].permissions,
            userCount: roles.value[index].userCount
          }
          addNotification('success', `角色 ${currentRole.value.name} 更新成功`)
        }
      }
      closeRoleDialog()
    }

    // 方法：管理权限
    const managePermissions = (role) => {
      selectedRole.value = { ...role }
      showPermissionDialog.value = true
      activePermissionTab.value = 'all'
    }

    // 方法：检查权限是否已分配
    const isPermissionChecked = (permissionName) => {
      return selectedRole.value?.permissions.includes(permissionName)
    }

    // 方法：切换权限
    const togglePermission = (permissionName) => {
      if (!selectedRole.value) return
      
      const index = selectedRole.value.permissions.indexOf(permissionName)
      if (index === -1) {
        selectedRole.value.permissions.push(permissionName)
      } else {
        selectedRole.value.permissions.splice(index, 1)
      }
    }

    // 方法：检查分类权限状态
    const isCategoryChecked = (categoryName) => {
      if (!selectedRole.value) return false
      
      const category = permissionCategories.value.find(c => c.name === categoryName)
      if (!category) return false
      
      return category.permissions.every(perm => 
        selectedRole.value.permissions.includes(perm.name)
      )
    }

    // 方法：检查分类权限是否部分选中
    const isCategoryIndeterminate = (categoryName) => {
      if (!selectedRole.value) return false
      
      const category = permissionCategories.value.find(c => c.name === categoryName)
      if (!category) return false
      
      const checkedCount = category.permissions.filter(perm => 
        selectedRole.value.permissions.includes(perm.name)
      ).length
      
      return checkedCount > 0 && checkedCount < category.permissions.length
    }

    // 方法：切换分类权限
    const toggleCategory = (categoryName) => {
      if (!selectedRole.value) return
      
      const category = permissionCategories.value.find(c => c.name === categoryName)
      if (!category) return
      
      const isAllChecked = isCategoryChecked(categoryName)
      
      if (isAllChecked) {
        // 取消选中该分类所有权限
        category.permissions.forEach(perm => {
          const index = selectedRole.value.permissions.indexOf(perm.name)
          if (index !== -1) {
            selectedRole.value.permissions.splice(index, 1)
          }
        })
      } else {
        // 选中该分类所有权限
        category.permissions.forEach(perm => {
          if (!selectedRole.value.permissions.includes(perm.name)) {
            selectedRole.value.permissions.push(perm.name)
          }
        })
      }
    }

    // 方法：获取已分配的权限详情
    const getAssignedPermissions = () => {
      if (!selectedRole.value) return []
      
      const allPermissions = permissionCategories.value.flatMap(category => category.permissions)
      return selectedRole.value.permissions.map(permName => 
        allPermissions.find(p => p.name === permName)
      ).filter(Boolean)
    }

    // 方法：保存权限设置
    const savePermissions = () => {
      if (!selectedRole.value) return
      
      const index = roles.value.findIndex(r => r.id === selectedRole.value.id)
      if (index !== -1) {
        roles.value[index].permissions = [...selectedRole.value.permissions]
        addNotification('success', `角色 ${selectedRole.value.name} 权限设置已保存`)
        
        // 模拟添加历史记录
        permissionHistory.value.unshift({
          id: permissionHistory.value.length + 1,
          time: new Date(),
          operator: 'admin',
          action: '更新权限',
          permissions: selectedRole.value.permissions.slice(0, 5).join(', ') + (selectedRole.value.permissions.length > 5 ? '...' : '')
        })
      }
      
      showPermissionDialog.value = false
    }

    // 方法：确认删除角色
    const confirmDeleteRole = (role) => {
      if (role.isDefault) {
        addNotification('error', '系统默认角色不能删除')
        return
      }
      deleteRole.value = role
      showDeleteDialog.value = true
    }

    // 方法：删除角色
    const deleteRole = () => {
      if (!deleteRole.value || deleteRole.value.isDefault || deleteRole.value.userCount > 0) {
        return
      }
      
      const index = roles.value.findIndex(r => r.id === deleteRole.value.id)
      if (index !== -1) {
        roles.value.splice(index, 1)
        addNotification('success', `角色 ${deleteRole.value.name} 已删除`)
      }
      
      showDeleteDialog.value = false
      deleteRole.value = null
    }

    // 方法：刷新角色列表
    const refreshRoles = () => {
      initMockData()
      searchKeyword.value = ''
      addNotification('success', '角色列表已刷新')
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
      roles,
      searchKeyword,
      notifications,
      
      // 对话框状态
      showAddRoleDialog,
      showEditRoleDialog,
      showPermissionDialog,
      showDeleteDialog,
      currentRole,
      selectedRole,
      deleteRole,
      
      // 权限管理相关
      activePermissionTab,
      permissionTabs,
      permissionCategories,
      permissionHistory,
      
      // 计算属性
      filteredRoles,
      defaultRolesCount,
      customRolesCount,
      totalPermissions,
      
      // 方法
      formatDate,
      formatDateTime,
      getRoleColor,
      highlightKeyword,
      handleSearch,
      resetCurrentRole,
      closeRoleDialog,
      editRole,
      saveRole,
      managePermissions,
      isPermissionChecked,
      togglePermission,
      isCategoryChecked,
      isCategoryIndeterminate,
      toggleCategory,
      getAssignedPermissions,
      savePermissions,
      confirmDeleteRole,
      deleteRole,
      refreshRoles,
      removeNotification,
      getNotificationIcon
    }
  }
}
</script>

<style scoped>
.roles-container {
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

.btn-danger:hover:not(:disabled) {
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
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 搜索区域样式 */
.filter-section {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input-wrapper {
  position: relative;
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

/* 表格样式 */
.roles-table-wrapper {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.roles-table {
  width: 100%;
  border-collapse: collapse;
}

.roles-table th {
  background-color: #f8f9fa;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e9ecef;
  white-space: nowrap;
}

.roles-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  color: #333;
}

.roles-table tr:last-child td {
  border-bottom: none;
}

.roles-table tr:hover {
  background-color: #f8f9fa;
}

/* 角色名称单元格 */
.role-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

/* 标签样式 */
.type-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.default {
  background-color: #e6f7ff;
  color: #1890ff;
}

.type-badge.custom {
  background-color: #f0f9ff;
  color: #0284c7;
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

.action-permission:hover:not(:disabled) {
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

.dialog-large {
  max-width: 800px;
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
  max-height: 60vh;
  overflow-y: auto;
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

.delete-error {
  color: #ff4d4f;
  font-size: 14px;
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
  resize: vertical;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* 权限标签样式 */
.permission-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab-item {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  color: #666;
}

.tab-item:hover {
  color: #667eea;
}

.tab-item.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 500;
}

/* 权限列表样式 */
.permission-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.permission-category {
  background-color: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
}

.category-header {
  padding: 15px;
  background-color: #f0f2f5;
  border-bottom: 1px solid #e0e0e0;
}

.permission-items {
  padding: 10px 0;
}

.permission-item {
  display: block;
  padding: 10px 25px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.permission-item:hover {
  background-color: rgba(102, 126, 234, 0.05);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.checkbox-text {
  flex: 1;
}

.checkbox-text small {
  display: block;
  color: #999;
  font-weight: normal;
  margin-top: 2px;
}

/* 已分配权限样式 */
.permission-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.assigned-permission {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f0f9ff;
  border-radius: 6px;
  border-left: 4px solid #0284c7;
}

.permission-info {
  flex: 1;
}

.permission-info small {
  display: block;
  color: #666;
  margin-top: 2px;
}

.remove-permission {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.remove-permission:hover {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.no-permissions {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 历史记录表格 */
.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  background-color: #f8f9fa;
  padding: 10px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e9ecef;
}

.history-table td {
  padding: 10px;
  border-bottom: 1px solid #e9ecef;
  color: #333;
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
  .roles-container {
    padding: 10px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .search-input-wrapper {
    max-width: none;
  }
  
  .roles-table-wrapper {
    overflow-x: auto;
  }
  
  .roles-table {
    min-width: 600px;
  }
  
  .dialog {
    width: 95%;
    margin: 10px;
  }
  
  .dialog-large {
    width: 95%;
  }
  
  .permission-tabs {
    flex-wrap: wrap;
  }
  
  .tab-item {
    padding: 8px 12px;
  }
}
</style>