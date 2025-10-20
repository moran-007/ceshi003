<template>
  <div class="super-admin-dashboard">
    <div class="page-header">
      <h2>超级管理员控制台</h2>
      <div class="admin-badge">超级管理员权限</div>
    </div>

    <!-- 系统概览 -->
    <div class="overview-section">
      <h3>系统概览</h3>
      <div class="overview-cards">
        <div class="overview-card">
          <div class="card-title">用户总数</div>
          <div class="card-number">{{ totalUsers }}</div>
        </div>
        <div class="overview-card">
          <div class="card-title">教师总数</div>
          <div class="card-number">{{ totalTeachers }}</div>
        </div>
        <div class="overview-card">
          <div class="card-title">学生总数</div>
          <div class="card-number">{{ totalStudents }}</div>
        </div>
        <div class="overview-card">
          <div class="card-title">管理员总数</div>
          <div class="card-number">{{ totalAdmins }}</div>
        </div>
        <div class="overview-card">
          <div class="card-title">活跃用户</div>
          <div class="card-number">{{ activeUsers }}</div>
        </div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <h3>快捷操作</h3>
      <div class="action-buttons">
        <button class="action-button primary" @click="navigateTo('system/users')">用户管理</button>
        <button class="action-button" @click="navigateTo('system/roles')">角色与权限管理</button>
        <button class="action-button" @click="navigateTo('system/config')">系统配置</button>
        <button class="action-button" @click="navigateTo('system/backup')">数据备份</button>
        <button class="action-button" @click="navigateTo('system/logs')">操作日志</button>
      </div>
    </div>

    <!-- 权限管理 -->
    <div class="permission-section">
      <h3>权限精细化管理</h3>
      <div class="permission-controls">
        <button class="action-button" @click="showRoleManagement = true">管理角色</button>
        <button class="action-button" @click="showPermissionManagement = true">管理权限</button>
        <button class="action-button" @click="showDataAccessControl = true">数据访问控制</button>
      </div>
    </div>

    <!-- 系统监控 -->
    <div class="monitoring-section">
      <h3>系统监控</h3>
      <div class="monitoring-cards">
        <div class="monitor-card">
          <div class="card-title">系统状态</div>
          <div class="status-indicator online">正常运行</div>
        </div>
        <div class="monitor-card">
          <div class="card-title">最近登录</div>
          <div class="last-login">{{ lastLoginTime }}</div>
        </div>
        <div class="monitor-card">
          <div class="card-title">在线用户</div>
          <div class="online-count">{{ onlineUsers }}</div>
        </div>
      </div>
    </div>

    <!-- 角色管理对话框 -->
    <div v-if="showRoleManagement" class="dialog-overlay" @click="showRoleManagement = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>角色管理</h3>
          <button class="close-button" @click="showRoleManagement = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="role-management">
            <div class="role-list">
              <h4>系统角色</h4>
              <div v-for="role in systemRoles" :key="role.id" class="role-item">
                <div class="role-info">
                  <span class="role-name">{{ role.name }}</span>
                  <span class="role-description">{{ role.description }}</span>
                </div>
                <div class="role-actions">
                  <button class="mini-button" @click="editRole(role)">编辑</button>
                  <button v-if="!role.protected" class="mini-button delete" @click="deleteRole(role.id)">删除</button>
                </div>
              </div>
            </div>
            <button class="add-role-button" @click="showAddRole = true">添加新角色</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 权限管理对话框 -->
    <div v-if="showPermissionManagement" class="dialog-overlay" @click="showPermissionManagement = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>权限管理</h3>
          <button class="close-button" @click="showPermissionManagement = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="permission-tree">
            <h4>权限树</h4>
            <div class="permission-categories">
              <div v-for="category in permissionCategories" :key="category.id" class="permission-category">
                <div class="category-header">
                  <input type="checkbox" :id="'category-'+category.id" @change="toggleCategory(category.id)">
                  <label :for="'category-'+category.id">{{ category.name }}</label>
                </div>
                <div class="category-permissions">
                  <div v-for="perm in category.permissions" :key="perm.id" class="permission-item">
                    <input type="checkbox" :id="'perm-'+perm.id" :checked="perm.enabled">
                    <label :for="'perm-'+perm.id">{{ perm.name }} - {{ perm.description }}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据访问控制对话框 -->
    <div v-if="showDataAccessControl" class="dialog-overlay" @click="showDataAccessControl = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>数据访问控制</h3>
          <button class="close-button" @click="showDataAccessControl = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="data-access-control">
            <h4>数据模块访问权限</h4>
            <div class="access-control-list">
              <div v-for="module in dataModules" :key="module.id" class="access-control-item">
                <div class="module-info">
                  <span class="module-name">{{ module.name }}</span>
                </div>
                <div class="access-levels">
                  <label>
                    <input type="radio" :name="'access-'+module.id" :value="'none'"> 无访问
                  </label>
                  <label>
                    <input type="radio" :name="'access-'+module.id" :value="'read'"> 仅读取
                  </label>
                  <label>
                    <input type="radio" :name="'access-'+module.id" :value="'write'"> 读写
                  </label>
                  <label>
                    <input type="radio" :name="'access-'+module.id" :value="'full'"> 完全控制
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { userState } from '../store/index.js'

export default {
  name: 'SuperAdminDashboard',
  setup() {
    const router = useRouter()
    
    // 对话框状态
    const showRoleManagement = ref(false)
    const showPermissionManagement = ref(false)
    const showDataAccessControl = ref(false)
    const showAddRole = ref(false)
    
    // 模拟数据
    const systemRoles = ref([
      { id: 1, name: '超级管理员', description: '系统最高权限', protected: true },
      { id: 2, name: '系统管理员', description: '系统管理权限', protected: false },
      { id: 3, name: '教师', description: '教学相关权限', protected: false },
      { id: 4, name: '学生', description: '学习相关权限', protected: false },
      { id: 5, name: '财务/行政人员', description: '财务和行政相关权限', protected: false }
    ])
    
    const permissionCategories = ref([
      {
        id: 1,
        name: '用户管理',
        permissions: [
          { id: 101, name: 'VIEW_USER', description: '查看用户', enabled: true },
          { id: 102, name: 'CREATE_USER', description: '创建用户', enabled: true },
          { id: 103, name: 'EDIT_USER', description: '编辑用户', enabled: true },
          { id: 104, name: 'DELETE_USER', description: '删除用户', enabled: true },
          { id: 105, name: 'IMPORT_USER', description: '导入用户', enabled: true }
        ]
      },
      {
        id: 2,
        name: '课程管理',
        permissions: [
          { id: 201, name: 'VIEW_COURSE', description: '查看课程', enabled: true },
          { id: 202, name: 'CREATE_COURSE', description: '创建课程', enabled: true },
          { id: 203, name: 'EDIT_COURSE', description: '编辑课程', enabled: true },
          { id: 204, name: 'DELETE_COURSE', description: '删除课程', enabled: true }
        ]
      },
      {
        id: 3,
        name: '排课管理',
        permissions: [
          { id: 301, name: 'VIEW_SCHEDULE', description: '查看排课', enabled: true },
          { id: 302, name: 'CREATE_SCHEDULE', description: '创建排课', enabled: true },
          { id: 303, name: 'EDIT_SCHEDULE', description: '编辑排课', enabled: true },
          { id: 304, name: 'DELETE_SCHEDULE', description: '删除排课', enabled: true }
        ]
      },
      {
        id: 4,
        name: '系统管理',
        permissions: [
          { id: 401, name: 'SYSTEM_CONFIG', description: '系统配置', enabled: true },
          { id: 402, name: 'DATA_BACKUP', description: '数据备份', enabled: true },
          { id: 403, name: 'DATA_RESTORE', description: '数据恢复', enabled: true },
          { id: 404, name: 'VIEW_LOGS', description: '查看日志', enabled: true },
          { id: 405, name: 'MANAGE_ROLES', description: '管理角色', enabled: true },
          { id: 406, name: 'MANAGE_PERMISSIONS', description: '管理权限', enabled: true }
        ]
      }
    ])
    
    const dataModules = ref([
      { id: 1, name: '用户数据' },
      { id: 2, name: '课程数据' },
      { id: 3, name: '教学数据' },
      { id: 4, name: '财务数据' },
      { id: 5, name: '系统配置' }
    ])
    
    // 计算属性
    const totalUsers = computed(() => 150)
    const totalTeachers = computed(() => 25)
    const totalStudents = computed(() => 120)
    const totalAdmins = computed(() => 5)
    const activeUsers = computed(() => 85)
    const onlineUsers = computed(() => 12)
    const lastLoginTime = computed(() => {
      const date = new Date()
      return date.toLocaleString('zh-CN')
    })
    
    // 方法
    const navigateTo = (path) => {
      router.push(`/home/superAdmin/${path}`)
    }
    
    const editRole = (role) => {
      console.log('编辑角色:', role)
      // 这里可以实现角色编辑功能
      alert(`编辑角色: ${role.name}`)
    }
    
    const deleteRole = (roleId) => {
      if (confirm('确定要删除这个角色吗？')) {
        systemRoles.value = systemRoles.value.filter(role => role.id !== roleId)
        alert('角色删除成功')
      }
    }
    
    const toggleCategory = (categoryId) => {
      const category = permissionCategories.value.find(c => c.id === categoryId)
      if (category) {
        const checkbox = document.getElementById(`category-${categoryId}`)
        category.permissions.forEach(perm => {
          perm.enabled = checkbox.checked
        })
      }
    }
    
    onMounted(() => {
      console.log('超级管理员控制台已加载')
      // 确保用户角色正确
      if (userState.role !== 'superAdmin') {
        console.warn('用户角色不匹配，预期superAdmin，实际为:', userState.role)
      }
    })
    
    return {
      showRoleManagement,
      showPermissionManagement,
      showDataAccessControl,
      showAddRole,
      systemRoles,
      permissionCategories,
      dataModules,
      totalUsers,
      totalTeachers,
      totalStudents,
      totalAdmins,
      activeUsers,
      onlineUsers,
      lastLoginTime,
      navigateTo,
      editRole,
      deleteRole,
      toggleCategory
    }
  }
}
</script>

<style scoped>
.super-admin-dashboard {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h2 {
  color: #333;
  font-size: 28px;
  margin: 0;
}

.admin-badge {
  background-color: #ff4d4f;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
}

/* 概览部分 */
.overview-section {
  margin-bottom: 30px;
}

.overview-section h3 {
  color: #333;
  margin-bottom: 20px;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.overview-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.card-number {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
}

/* 快捷操作 */
.quick-actions {
  margin-bottom: 30px;
}

.quick-actions h3 {
  color: #333;
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action-button {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f0f2f5;
  color: #333;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-button.primary {
  background-color: #1890ff;
  color: white;
}

/* 权限管理部分 */
.permission-section,
.monitoring-section {
  margin-bottom: 30px;
}

.permission-section h3,
.monitoring-section h3 {
  color: #333;
  margin-bottom: 20px;
}

.permission-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* 监控部分 */
.monitoring-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.monitor-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-indicator {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 500;
  margin-top: 10px;
}

.status-indicator.online {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
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
  max-width: 600px;
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
}

.close-button:hover {
  background-color: #f0f0f0;
  color: #333;
}

.dialog-body {
  padding: 20px;
}

/* 角色管理 */
.role-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 10px;
}

.role-name {
  font-weight: 600;
  color: #333;
  display: block;
}

.role-description {
  font-size: 14px;
  color: #666;
}

.mini-button {
  padding: 4px 12px;
  margin-left: 8px;
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
  background-color: #ffccc7;
}

.add-role-button {
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
  color: #1890ff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-role-button:hover {
  border-color: #1890ff;
  background: #e6f7ff;
}

/* 权限树 */
.permission-category {
  margin-bottom: 16px;
}

.category-header {
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.category-header input[type="checkbox"] {
  margin-right: 8px;
}

.category-permissions {
  padding-left: 24px;
}

.permission-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.permission-item input[type="checkbox"] {
  margin-right: 8px;
}

.permission-item label {
  font-size: 14px;
  color: #666;
}

/* 数据访问控制 */
.access-control-item {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.module-name {
  font-weight: 600;
  margin-bottom: 12px;
  display: block;
}

.access-levels {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.access-levels label {
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
}

.access-levels input[type="radio"] {
  margin-right: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .overview-cards,
  .monitoring-cards {
    grid-template-columns: 1fr;
  }
  
  .action-buttons,
  .permission-controls {
    flex-direction: column;
  }
  
  .access-levels {
    flex-direction: column;
  }
}
</style>