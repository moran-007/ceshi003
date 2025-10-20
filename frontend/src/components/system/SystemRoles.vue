<template>
  <div class="system-roles">
    <div class="page-header">
      <h2>角色管理</h2>
      <div class="header-actions">
        <button class="action-button primary" @click="showAddRoleDialog = true">添加角色</button>
      </div>
    </div>

    <div class="roles-main-container">
      <!-- 角色列表区域 -->
      <div class="roles-sidebar">
        <div class="roles-list">
          <div 
            v-for="role in roles" 
            :key="role.id"
            :class="['role-card', { 'selected': selectedRoleId === role.id }]"
            @click="selectRole(role)"
          >
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-desc">{{ role.description || '无描述' }}</div>
              <div class="role-count">用户数: {{ getUserCountByRole(role.id) }}</div>
            </div>
            <div class="role-actions">
              <button 
                class="mini-button"
                @click.stop="editRole(role)"
                title="编辑角色"
              >
                编辑
              </button>
              <button 
                v-if="!isDefaultRole(role.id)"
                class="mini-button delete"
                @click.stop="deleteRole(role)"
                title="删除角色"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 权限配置区域 -->
      <div class="permissions-container">
        <div v-if="!selectedRoleId" class="no-role-selected">
          <div class="placeholder-icon">👥</div>
          <p>请从左侧选择一个角色进行权限配置</p>
        </div>
        
        <div v-else-if="selectedRole" class="permissions-content">
          <div class="permissions-header">
            <h3>{{ selectedRole.name }} - 权限配置</h3>
            <button 
              class="action-button"
              @click="savePermissions"
              :disabled="isSaving"
            >
              {{ isSaving ? '保存中...' : '保存权限配置' }}
            </button>
          </div>

          <!-- 权限树 -->
          <div class="permissions-tree">
            <div v-for="(category, categoryKey) in permissionCategories" :key="categoryKey" class="permission-category">
              <div class="category-header">
                <div class="category-checkbox">
                  <input 
                    type="checkbox" 
                    :id="`category-${categoryKey}`"
                    v-model="categoryChecked[categoryKey]"
                    @change="toggleCategorySelection(categoryKey)"
                  >
                  <label :for="`category-${categoryKey}`">{{ category.name }}</label>
                </div>
                <button 
                  class="category-toggle"
                  @click="toggleCategory(categoryKey)"
                >
                  {{ expandedCategories[categoryKey] ? '▼' : '▶' }}
                </button>
              </div>
              
              <div v-if="expandedCategories[categoryKey]" class="permission-items">
                <div 
                  v-for="permission in category.permissions" 
                  :key="permission.key"
                  class="permission-item"
                >
                  <input 
                    type="checkbox" 
                    :id="permission.key"
                    v-model="selectedPermissions"
                    :value="permission.key"
                    :disabled="permission.disabled"
                  >
                  <label 
                    :for="permission.key"
                    :class="{ 'disabled': permission.disabled }"
                    class="permission-label"
                  >
                    <span class="permission-name">{{ permission.name }}</span>
                    <span v-if="permission.description" class="permission-desc">{{ permission.description }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 权限信息 -->
          <div class="permissions-summary">
            <div class="summary-item">
              <span class="summary-label">已配置权限数：</span>
              <span class="summary-value">{{ selectedPermissions.length }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">可用权限数：</span>
              <span class="summary-value">{{ getAllPermissionCount() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑角色对话框 -->
    <div v-if="showAddRoleDialog || showEditRoleDialog" class="dialog-overlay" @click="closeRoleDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>{{ showEditRoleDialog ? '编辑角色' : '添加角色' }}</h3>
          <button class="close-button" @click="closeRoleDialog">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="saveRole">
            <div class="form-group">
              <label>角色名称 <span class="required">*</span></label>
              <input 
                type="text" 
                v-model="roleForm.name" 
                required 
                class="form-input"
                :disabled="isDefaultRole(roleForm.id)"
              >
            </div>
            <div class="form-group">
              <label>角色描述</label>
              <textarea 
                v-model="roleForm.description" 
                class="form-input"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>角色权限集</label>
              <select v-model="roleForm.presetPermissions" class="form-input">
                <option value="">自定义权限</option>
                <option value="none">无权限</option>
                <option value="student">学生权限</option>
                <option value="teacher">教师权限</option>
                <option value="admin">管理员权限</option>
                <option value="superAdmin">超级管理员权限</option>
              </select>
              <p class="form-hint">选择预设权限集将自动配置对应的权限</p>
            </div>
          </form>
        </div>
        <div class="dialog-footer">
          <button class="action-button" @click="closeRoleDialog">取消</button>
          <button 
            class="action-button primary" 
            @click="saveRole"
            :disabled="!roleForm.name"
          >
            保存
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
import { ref, computed, onMounted, reactive } from 'vue'
import { userState } from '../../store/index.js'

export default {
  name: 'SystemRoles',
  setup() {
    // 状态管理
    const roles = ref([])
    const selectedRoleId = ref(null)
    const showAddRoleDialog = ref(false)
    const showEditRoleDialog = ref(false)
    const isSaving = ref(false)
    
    // 通知状态
    const showNotification = ref(false)
    const notificationType = ref('success') // success, error, warning
    const notificationMessage = ref('')
    
    // 角色表单
    const roleForm = reactive({
      id: null,
      name: '',
      description: '',
      presetPermissions: ''
    })
    
    // 权限相关状态
    const selectedPermissions = ref([])
    const expandedCategories = ref({})
    const categoryChecked = ref({})
    
    // 权限分类定义
    const permissionCategories = ref([
      {
        key: 'user',
        name: '用户管理',
        permissions: [
          { key: 'user:view', name: '查看用户', description: '查看系统用户列表' },
          { key: 'user:create', name: '创建用户', description: '添加新用户账号' },
          { key: 'user:edit', name: '编辑用户', description: '修改用户信息' },
          { key: 'user:delete', name: '删除用户', description: '删除系统用户' },
          { key: 'user:export', name: '导出用户', description: '导出用户数据' },
          { key: 'user:import', name: '导入用户', description: '批量导入用户数据' }
        ]
      },
      {
        key: 'course',
        name: '课程管理',
        permissions: [
          { key: 'course:view', name: '查看课程', description: '查看课程列表和详情' },
          { key: 'course:create', name: '创建课程', description: '添加新课程' },
          { key: 'course:edit', name: '编辑课程', description: '修改课程信息' },
          { key: 'course:delete', name: '删除课程', description: '删除已有课程' },
          { key: 'course:schedule', name: '排课管理', description: '管理课程时间表' }
        ]
      },
      {
        key: 'schedule',
        name: '排课管理',
        permissions: [
          { key: 'schedule:view', name: '查看排课', description: '查看排课信息' },
          { key: 'schedule:create', name: '创建排课', description: '添加新的排课记录' },
          { key: 'schedule:edit', name: '编辑排课', description: '修改排课信息' },
          { key: 'schedule:delete', name: '删除排课', description: '删除排课记录' },
          { key: 'schedule:conflict', name: '冲突检测', description: '检测排课冲突' }
        ]
      },
      {
        key: 'score',
        name: '成绩管理',
        permissions: [
          { key: 'score:view', name: '查看成绩', description: '查看学生成绩' },
          { key: 'score:input', name: '录入成绩', description: '录入学生考试成绩' },
          { key: 'score:edit', name: '编辑成绩', description: '修改已录入的成绩' },
          { key: 'score:export', name: '导出成绩', description: '导出成绩数据' },
          { key: 'score:statistics', name: '成绩统计', description: '查看成绩统计分析' }
        ]
      },
      {
        key: 'system',
        name: '系统管理',
        permissions: [
          { key: 'system:role', name: '角色管理', description: '管理系统角色和权限' },
          { key: 'system:config', name: '系统配置', description: '配置系统参数' },
          { key: 'system:backup', name: '数据备份', description: '备份和恢复系统数据' },
          { key: 'system:log', name: '系统日志', description: '查看系统操作日志' },
          { key: 'system:update', name: '系统更新', description: '更新系统版本', disabled: true }
        ]
      }
    ])
    
    // 预设权限集
    const presetPermissions = {
      'none': [],
      'student': ['user:view', 'course:view', 'schedule:view', 'score:view'],
      'teacher': [
        'user:view', 
        'course:view', 'course:edit', 'course:schedule',
        'schedule:view', 'schedule:create', 'schedule:edit', 'schedule:conflict',
        'score:view', 'score:input', 'score:edit', 'score:statistics'
      ],
      'admin': [
        'user:view', 'user:create', 'user:edit', 'user:delete', 'user:export', 'user:import',
        'course:view', 'course:create', 'course:edit', 'course:delete', 'course:schedule',
        'schedule:view', 'schedule:create', 'schedule:edit', 'schedule:delete', 'schedule:conflict',
        'score:view', 'score:input', 'score:edit', 'score:export', 'score:statistics',
        'system:role', 'system:config', 'system:backup', 'system:log'
      ],
      'superAdmin': [
        'user:view', 'user:create', 'user:edit', 'user:delete', 'user:export', 'user:import',
        'course:view', 'course:create', 'course:edit', 'course:delete', 'course:schedule',
        'schedule:view', 'schedule:create', 'schedule:edit', 'schedule:delete', 'schedule:conflict',
        'score:view', 'score:input', 'score:edit', 'score:export', 'score:statistics',
        'system:role', 'system:config', 'system:backup', 'system:log', 'system:update'
      ]
    }
    
    // 默认角色ID列表
    const defaultRoleIds = ['student', 'teacher', 'admin', 'superAdmin']
    
    // 加载角色数据
    const loadRoles = () => {
      if (userState.adminData && userState.adminData.roles) {
        roles.value = userState.adminData.roles
      } else {
        // 模拟数据
        roles.value = [
          {
            id: 'student',
            name: '学生',
            description: '基础学生角色',
            permissions: presetPermissions['student']
          },
          {
            id: 'teacher',
            name: '教师',
            description: '教师角色',
            permissions: presetPermissions['teacher']
          },
          {
            id: 'admin',
            name: '管理员',
            description: '系统管理员角色',
            permissions: presetPermissions['admin']
          },
          {
            id: 'superAdmin',
            name: '超级管理员',
            description: '最高权限角色',
            permissions: presetPermissions['superAdmin']
          },
          {
            id: '1001',
            name: '财务人员',
            description: '负责财务相关工作',
            permissions: ['user:view', 'score:view', 'score:export']
          }
        ]
      }
    }
    
    // 计算属性
    const selectedRole = computed(() => {
      return roles.value.find(role => role.id === selectedRoleId.value)
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
    const getUserCountByRole = (roleId) => {
      // 模拟数据
      const roleUserCount = {
        'student': 256,
        'teacher': 32,
        'admin': 5,
        'superAdmin': 1,
        '1001': 2
      }
      return roleUserCount[roleId] || 0
    }
    
    const isDefaultRole = (roleId) => {
      return defaultRoleIds.includes(roleId)
    }
    
    const showNotificationMessage = (type, message) => {
      notificationType.value = type
      notificationMessage.value = message
      showNotification.value = true
      setTimeout(() => {
        showNotification.value = false
      }, 3000)
    }
    
    const selectRole = (role) => {
      selectedRoleId.value = role.id
      selectedPermissions.value = [...role.permissions]
      
      // 初始化展开状态和分类选择状态
      permissionCategories.value.forEach(category => {
        expandedCategories.value[category.key] = true
        updateCategoryChecked(category.key)
      })
    }
    
    const updateCategoryChecked = (categoryKey) => {
      const category = permissionCategories.value.find(c => c.key === categoryKey)
      if (!category) return
      
      const categoryPermissions = category.permissions
        .filter(p => !p.disabled)
        .map(p => p.key)
      
      const enabledPermissions = categoryPermissions.length
      const selectedInCategory = categoryPermissions.filter(p => selectedPermissions.value.includes(p)).length
      
      categoryChecked.value[categoryKey] = enabledPermissions > 0 && selectedInCategory === enabledPermissions
    }
    
    const toggleCategory = (categoryKey) => {
      expandedCategories.value[categoryKey] = !expandedCategories.value[categoryKey]
    }
    
    const toggleCategorySelection = (categoryKey) => {
      const category = permissionCategories.value.find(c => c.key === categoryKey)
      if (!category) return
      
      const categoryPermissionKeys = category.permissions
        .filter(p => !p.disabled)
        .map(p => p.key)
      
      if (categoryChecked.value[categoryKey]) {
        // 选中该分类的所有权限
        categoryPermissionKeys.forEach(key => {
          if (!selectedPermissions.value.includes(key)) {
            selectedPermissions.value.push(key)
          }
        })
      } else {
        // 取消选中该分类的所有权限
        selectedPermissions.value = selectedPermissions.value.filter(key => 
          !categoryPermissionKeys.includes(key)
        )
      }
      
      // 更新其他分类的选中状态
      permissionCategories.value.forEach(cat => {
        if (cat.key !== categoryKey) {
          updateCategoryChecked(cat.key)
        }
      })
    }
    
    const getAllPermissionCount = () => {
      let count = 0
      permissionCategories.value.forEach(category => {
        count += category.permissions.filter(p => !p.disabled).length
      })
      return count
    }
    
    const savePermissions = async () => {
      if (!selectedRole.value) return
      
      isSaving.value = true
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        selectedRole.value.permissions = [...selectedPermissions.value]
        
        showNotificationMessage('success', `角色 ${selectedRole.value.name} 的权限配置已保存`)
      } catch (error) {
        showNotificationMessage('error', '保存失败，请重试')
      } finally {
        isSaving.value = false
      }
    }
    
    const editRole = (role) => {
      Object.assign(roleForm, role)
      // 查找匹配的预设权限集
      for (const [key, value] of Object.entries(presetPermissions)) {
        if (JSON.stringify(value.sort()) === JSON.stringify(role.permissions.sort())) {
          roleForm.presetPermissions = key
          break
        }
      }
      showEditRoleDialog.value = true
      showAddRoleDialog.value = false
    }
    
    const closeRoleDialog = () => {
      showAddRoleDialog.value = false
      showEditRoleDialog.value = false
      // 重置表单
      roleForm.id = null
      roleForm.name = ''
      roleForm.description = ''
      roleForm.presetPermissions = ''
    }
    
    const saveRole = () => {
      if (!roleForm.name) {
        showNotificationMessage('error', '角色名称不能为空')
        return
      }
      
      if (showEditRoleDialog.value) {
        // 编辑角色
        const index = roles.value.findIndex(r => r.id === roleForm.id)
        if (index !== -1) {
          const updatedRole = { ...roles.value[index] }
          
          // 如果不是默认角色，允许修改名称
          if (!isDefaultRole(roleForm.id)) {
            updatedRole.name = roleForm.name
          }
          updatedRole.description = roleForm.description
          
          // 如果选择了预设权限集，应用权限
          if (roleForm.presetPermissions && presetPermissions[roleForm.presetPermissions]) {
            updatedRole.permissions = [...presetPermissions[roleForm.presetPermissions]]
          }
          
          roles.value[index] = updatedRole
          
          // 如果正在编辑当前选中的角色，更新权限显示
          if (selectedRoleId.value === roleForm.id) {
            selectedPermissions.value = [...updatedRole.permissions]
            permissionCategories.value.forEach(category => {
              updateCategoryChecked(category.key)
            })
          }
          
          showNotificationMessage('success', `角色 ${updatedRole.name} 已更新`)
        }
      } else {
        // 添加角色
        const newId = Math.max(...roles.value.filter(r => !isDefaultRole(r.id)).map(r => parseInt(r.id) || 0), 1000) + 1
        
        const permissions = roleForm.presetPermissions && presetPermissions[roleForm.presetPermissions]
          ? [...presetPermissions[roleForm.presetPermissions]]
          : []
          
        const newRole = {
          id: newId.toString(),
          name: roleForm.name,
          description: roleForm.description,
          permissions
        }
        
        roles.value.push(newRole)
        showNotificationMessage('success', `角色 ${newRole.name} 已添加`)
      }
      
      closeRoleDialog()
    }
    
    const deleteRole = (role) => {
      if (getUserCountByRole(role.id) > 0) {
        showNotificationMessage('warning', `角色 ${role.name} 下还有用户，无法删除`)
        return
      }
      
      if (confirm(`确定要删除角色 ${role.name} 吗？此操作不可撤销！`)) {
        roles.value = roles.value.filter(r => r.id !== role.id)
        
        // 如果删除的是当前选中的角色，清空选择
        if (selectedRoleId.value === role.id) {
          selectedRoleId.value = null
          selectedPermissions.value = []
        }
        
        showNotificationMessage('success', `角色 ${role.name} 已删除`)
      }
    }
    
    onMounted(() => {
      loadRoles()
      
      // 初始化所有分类为展开状态
      permissionCategories.value.forEach(category => {
        expandedCategories.value[category.key] = true
      })
      
      // 检查用户权限
      if (userState.role !== 'superAdmin' && userState.role !== 'admin') {
        showNotificationMessage('error', '权限不足，请联系管理员')
      }
    })
    
    return {
      roles,
      selectedRoleId,
      selectedRole,
      selectedPermissions,
      expandedCategories,
      categoryChecked,
      permissionCategories,
      showAddRoleDialog,
      showEditRoleDialog,
      roleForm,
      isSaving,
      showNotification,
      notificationType,
      notificationMessage,
      notificationIcon,
      getUserCountByRole,
      isDefaultRole,
      selectRole,
      toggleCategory,
      toggleCategorySelection,
      getAllPermissionCount,
      savePermissions,
      editRole,
      closeRoleDialog,
      saveRole,
      deleteRole
    }
  }
}
</script>

<style scoped>
.system-roles {
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

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 主要容器 */
.roles-main-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

/* 角色列表 */
.roles-sidebar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.roles-list {
  padding: 12px;
}

.role-card {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.role-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.role-card.selected {
  background: #e6f7ff;
  border-color: #1890ff;
  box-shadow: 0 2px 12px rgba(24, 144, 255, 0.25);
}

.role-info {
  flex: 1;
}

.role-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.role-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.role-count {
  font-size: 12px;
  color: #999;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.role-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mini-button {
  padding: 4px 8px;
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

.mini-button.delete {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.mini-button.delete:hover {
  background-color: #fff2f0;
}

/* 权限配置区域 */
.permissions-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.no-role-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #999;
  text-align: center;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-role-selected p {
  font-size: 16px;
  margin: 0;
}

.permissions-content {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.permissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.permissions-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

/* 权限树 */
.permissions-tree {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.permission-category {
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.category-header {
  background: #fafafa;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.category-header:hover {
  background: #f5f5f5;
}

.category-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.category-checkbox input[type="checkbox"] {
  margin: 0;
}

.category-checkbox label {
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.category-toggle {
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  color: #999;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.category-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.permission-items {
  padding: 8px 0;
}

.permission-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 16px 8px 36px;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
}

.permission-item:hover {
  background-color: #fafafa;
}

.permission-item input[type="checkbox"] {
  margin: 3px 10px 0 0;
  flex-shrink: 0;
}

.permission-label {
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.permission-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.permission-name {
  font-weight: 500;
  color: #333;
}

.permission-desc {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

/* 权限汇总 */
.permissions-summary {
  background: #fafafa;
  padding: 16px;
  border-radius: 6px;
  display: flex;
  gap: 32px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-label {
  color: #666;
  font-size: 14px;
}

.summary-value {
  font-weight: 600;
  color: #1890ff;
  font-size: 16px;
  min-width: 30px;
  text-align: center;
  background: white;
  padding: 4px 12px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
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
  max-width: 500px;
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
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
}

.required {
  color: #ff4d4f;
}

.form-input {
  width: 100%;
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

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
  margin-bottom: 0;
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
  
  .roles-main-container {
    grid-template-columns: 1fr;
  }
  
  .roles-sidebar {
    max-height: 300px;
  }
  
  .permissions-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .permissions-summary {
    flex-direction: column;
    gap: 16px;
  }
  
  .summary-item {
    justify-content: space-between;
  }
  
  .notification {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>