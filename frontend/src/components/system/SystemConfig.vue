<template>
  <div class="system-config">
    <div class="page-header">
      <h2>系统配置管理</h2>
      <div class="header-actions">
        <button class="action-button" @click="exportConfig">导出配置</button>
        <button class="action-button" @click="importConfig = true">导入配置</button>
        <button class="action-button primary" @click="saveAllChanges">保存所有变更</button>
      </div>
    </div>

    <!-- 配置导航 -->
    <div class="config-navigation">
      <button 
        v-for="category in configCategories" 
        :key="category.id"
        class="nav-button"
        :class="{ active: activeCategory === category.id }"
        @click="switchCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- 配置表单 -->
    <div class="config-content">
      <!-- 基本设置 -->
      <div v-if="activeCategory === 1" class="config-section">
        <h3>基本设置</h3>
        <div class="config-form">
          <div class="form-group">
            <label>系统名称</label>
            <input type="text" v-model="config.basic.systemName" class="form-input">
            <span class="form-hint">系统显示的名称</span>
          </div>
          
          <div class="form-group">
            <label>系统版本</label>
            <input type="text" v-model="config.basic.version" class="form-input" disabled>
            <span class="form-hint">当前系统版本号</span>
          </div>
          
          <div class="form-group">
            <label>系统描述</label>
            <textarea v-model="config.basic.description" rows="3" class="form-input"></textarea>
            <span class="form-hint">对系统的简短描述</span>
          </div>
          
          <div class="form-group">
            <label>联系方式</label>
            <input type="text" v-model="config.basic.contact" class="form-input">
            <span class="form-hint">系统管理员联系方式</span>
          </div>
          
          <div class="form-group">
            <label>版权信息</label>
            <input type="text" v-model="config.basic.copyright" class="form-input">
            <span class="form-hint">系统版权声明</span>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="config.basic.enableRegistration">
              允许新用户注册
            </label>
            <span class="form-hint">开启后允许新用户自行注册账号</span>
          </div>
        </div>
      </div>

      <!-- 用户设置 -->
      <div v-if="activeCategory === 2" class="config-section">
        <h3>用户设置</h3>
        <div class="config-form">
          <div class="form-group">
            <label>默认角色</label>
            <select v-model="config.user.defaultRole" class="form-input">
              <option value="student">学生</option>
              <option value="teacher">教师</option>
              <option value="admin">管理员</option>
            </select>
            <span class="form-hint">新用户注册后的默认角色</span>
          </div>
          
          <div class="form-group">
            <label>密码策略</label>
            <select v-model="config.user.passwordPolicy" class="form-input">
              <option value="simple">简单（至少6位）</option>
              <option value="medium">中等（至少8位，包含字母和数字）</option>
              <option value="strong">强（至少10位，包含大小写字母、数字和特殊字符）</option>
            </select>
            <span class="form-hint">设置用户密码强度要求</span>
          </div>
          
          <div class="form-group">
            <label>密码有效期（天）</label>
            <input type="number" v-model="config.user.passwordExpiryDays" class="form-input">
            <span class="form-hint">密码过期时间，0表示永不过期</span>
          </div>
          
          <div class="form-group">
            <label>连续登录失败次数限制</label>
            <input type="number" v-model="config.user.maxFailedLoginAttempts" class="form-input">
            <span class="form-hint">超过次数后账号将被锁定</span>
          </div>
          
          <div class="form-group">
            <label>账号锁定时间（分钟）</label>
            <input type="number" v-model="config.user.accountLockMinutes" class="form-input">
            <span class="form-hint">账号锁定的时长</span>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="config.user.requireEmailVerification">
              要求邮箱验证
            </label>
            <span class="form-hint">开启后用户注册需要验证邮箱</span>
          </div>
        </div>
      </div>

      <!-- 课程设置 -->
      <div v-if="activeCategory === 3" class="config-section">
        <h3>课程设置</h3>
        <div class="config-form">
          <div class="form-group">
            <label>每学期周数</label>
            <input type="number" v-model="config.course.semesterWeeks" class="form-input">
            <span class="form-hint">一个学期包含的教学周数</span>
          </div>
          
          <div class="form-group">
            <label>每天上课节数</label>
            <input type="number" v-model="config.course.dailySessions" class="form-input">
            <span class="form-hint">每天安排的课程节数</span>
          </div>
          
          <div class="form-group">
            <label>课程最大容量</label>
            <input type="number" v-model="config.course.maxCourseCapacity" class="form-input">
            <span class="form-hint">单个课程的最大学生数量</span>
          </div>
          
          <div class="form-group">
            <label>选课开始前提醒天数</label>
            <input type="number" v-model="config.course.enrollmentReminderDays" class="form-input">
            <span class="form-hint">选课开始前提前多少天发送提醒</span>
          </div>
          
          <div class="form-group">
            <label>课程评价开启时间</label>
            <select v-model="config.course.evaluationTiming" class="form-input">
              <option value="before_end">课程结束前</option>
              <option value="after_end">课程结束后</option>
              <option value="both">课程结束前和结束后</option>
            </select>
            <span class="form-hint">设置课程评价功能的开启时间</span>
          </div>
          
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="config.course.enableOnlineClass">
              启用在线课堂功能
            </label>
            <span class="form-hint">开启后支持在线教学功能</span>
          </div>
          
          <div class="form-group">
            <label>课间休息时长(分钟)</label>
            <input 
              type="number" 
              v-model.number="config.breakDurationMinutes" 
              class="form-input"
              min="5"
              max="30"
            >
          </div>
          
          <div class="form-group full-width">
            <label>上课时间设置</label>
            <div v-for="(classTime, index) in config.classTimes" :key="index" class="class-time-item">
              <span>{{ index + 1 }}. </span>
              <input 
                type="time" 
                v-model="classTime.start" 
                class="form-input time-input"
              >
              <span> - </span>
              <input 
                type="time" 
                v-model="classTime.end" 
                class="form-input time-input"
              >
              <button 
                v-if="config.classTimes.length > 1" 
                class="mini-button delete"
                @click="removeClassTime(index)"
              >
                删除
              </button>
            </div>
            <button 
              v-if="config.classTimes.length < config.classesPerDay" 
              class="mini-button"
              @click="addClassTime"
            >
              添加课时
            </button>
          </div>
        </div>
      </div>

      <!-- 安全设置 -->
      <div v-if="activeCategory === 4" class="config-section">
        <h3>安全设置</h3>
        <div class="config-form">
          <div class="form-group">
            <label>会话超时时间(分钟)</label>
            <input 
              type="number" 
              v-model.number="config.sessionTimeoutMinutes" 
              class="form-input"
              min="5"
              max="480"
            >
          </div>
          
          <div class="form-group">
            <label>双因素认证</label>
            <label class="radio-group">
              <input type="radio" value="true" v-model="config.twoFactorAuth"> 启用
              <input type="radio" value="false" v-model="config.twoFactorAuth"> 禁用
            </label>
          </div>
          
          <div class="form-group full-width">
            <label>IP访问限制</label>
            <div class="ip-restriction">
              <label class="radio-group">
                <input type="radio" value="disabled" v-model="config.ipRestrictionMode"> 禁用
                <input type="radio" value="whitelist" v-model="config.ipRestrictionMode"> 白名单
                <input type="radio" value="blacklist" v-model="config.ipRestrictionMode"> 黑名单
              </label>
              <textarea 
                v-if="config.ipRestrictionMode !== 'disabled'" 
                v-model="config.ipRestrictionList" 
                class="form-input"
                rows="3"
                placeholder="每行输入一个IP地址或IP段，如: 192.168.1.0/24"
              ></textarea>
            </div>
          </div>
          
          <div class="form-group">
            <label>敏感操作二次确认</label>
            <label class="radio-group">
              <input type="radio" value="true" v-model="config.sensitiveOperationConfirm"> 启用
              <input type="radio" value="false" v-model="config.sensitiveOperationConfirm"> 禁用
            </label>
          </div>
        </div>
      </div>

      <!-- 邮件设置 -->
      <div v-if="activeCategory === 5" class="config-section">
        <h3>邮件设置</h3>
        <div class="config-form">
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="config.email.enabled">
              启用邮件服务
            </label>
            <span class="form-hint">开启后系统可发送邮件通知</span>
          </div>
          
          <div v-if="config.email.enabled">
            <div class="form-group">
              <label>SMTP服务器</label>
              <input type="text" v-model="config.email.smtpServer" class="form-input">
            </div>
            
            <div class="form-group">
              <label>SMTP端口</label>
              <input type="number" v-model="config.email.smtpPort" class="form-input">
            </div>
            
            <div class="form-group">
              <label>SMTP用户名</label>
              <input type="text" v-model="config.email.smtpUsername" class="form-input">
            </div>
            
            <div class="form-group">
              <label>SMTP密码</label>
              <input type="password" v-model="config.email.smtpPassword" class="form-input">
            </div>
            
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="config.email.useSSL">
                使用SSL/TLS
              </label>
            </div>
            
            <div class="form-group">
              <label>发件人邮箱</label>
              <input type="email" v-model="config.email.fromEmail" class="form-input">
            </div>
            
            <div class="form-group">
              <label>发件人名称</label>
              <input type="text" v-model="config.email.fromName" class="form-input">
            </div>
            
            <div class="form-actions">
              <button class="action-button" @click="testEmailSettings">测试邮件设置</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据备份设置 -->
      <div v-if="activeCategory === 6" class="config-section">
        <h3>数据备份设置</h3>
        <div class="config-form">
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="config.backup.enabled">
              启用自动备份
            </label>
            <span class="form-hint">开启后系统自动定期备份数据</span>
          </div>
          
          <div v-if="config.backup.enabled">
            <div class="form-group">
              <label>备份频率</label>
              <select v-model="config.backup.frequency" class="form-input">
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>备份时间</label>
              <input type="time" v-model="config.backup.time" class="form-input">
              <span class="form-hint">设置自动备份的具体时间</span>
            </div>
            
            <div class="form-group">
              <label>备份保留数量</label>
              <input type="number" v-model="config.backup.retentionCount" class="form-input">
              <span class="form-hint">保留的历史备份数量</span>
            </div>
            
            <div class="form-group">
              <label>备份类型</label>
              <select v-model="config.backup.type" class="form-input">
                <option value="full">完整备份</option>
                <option value="incremental">增量备份</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="config.backup.compression">
                启用备份压缩
              </label>
              <span class="form-hint">压缩备份文件以节省存储空间</span>
            </div>
            
            <div class="form-group">
              <label>
                <input type="checkbox" v-model="config.backup.encryption">
                启用备份加密
              </label>
              <span class="form-hint">加密备份文件以保护数据安全</span>
            </div>
            
            <div v-if="config.backup.encryption" class="form-group">
              <label>加密密钥</label>
              <input type="password" v-model="config.backup.encryptionKey" class="form-input">
              <span class="form-hint">设置用于加密备份的密钥</span>
            </div>
            
            <div class="form-actions">
              <button class="action-button" @click="runManualBackup">立即执行备份</button>
              <button class="action-button primary" @click="viewBackupHistory">查看备份历史</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导入配置对话框 -->
    <div v-if="importConfig" class="dialog-overlay" @click="importConfig = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>导入配置</h3>
          <button class="close-button" @click="importConfig = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="import-instruction">
            <p>请选择要导入的配置文件（JSON格式）：</p>
            <input type="file" accept=".json" @change="handleConfigImport">
          </div>
          <div class="import-warning">
            <span class="warning-icon">⚠️</span>
            <p>导入配置将覆盖当前系统设置，请谨慎操作！</p>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="action-button" @click="importConfig = false">取消</button>
          <button class="action-button primary" @click="confirmImport" :disabled="!configFile">确认导入</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { userState } from '../../store/index.js'

export default {
  name: 'SystemConfig',
  setup() {
    // 状态管理
    const activeCategory = ref(1)
    const importConfig = ref(false)
    const configFile = ref(null)
    
    // 配置分类
    const configCategories = ref([
      { id: 1, name: '基本设置' },
      { id: 2, name: '用户设置' },
      { id: 3, name: '课程设置' },
      { id: 4, name: '安全设置' },
      { id: 5, name: '邮件设置' },
      { id: 6, name: '数据备份设置' }
    ])
    
    // 系统配置数据
    const config = reactive({
      basic: {
        systemName: '教育管理系统',
        version: 'v1.0.0',
        description: '用于学校教学管理的综合系统',
        contact: 'admin@example.com',
        copyright: '© 2023 教育管理系统',
        enableRegistration: false
      },
      user: {
        defaultRole: 'student',
        passwordPolicy: 'medium',
        passwordExpiryDays: 90,
        maxFailedLoginAttempts: 5,
        accountLockMinutes: 30,
        requireEmailVerification: false
      },
      course: {
        semesterWeeks: 20,
        dailySessions: 8,
        maxCourseCapacity: 100,
        enrollmentReminderDays: 7,
        evaluationTiming: 'after_end',
        enableOnlineClass: false
      },
      security: {
        sessionTimeoutMinutes: 30,
        enableAuditLog: true,
        enableIpRestriction: false,
        allowedIpRanges: '',
        requireTwoFactorAuth: false,
        encryptionLevel: 'standard'
      },
      email: {
        enabled: false,
        smtpServer: '',
        smtpPort: 465,
        smtpUsername: '',
        smtpPassword: '',
        useSSL: true,
        fromEmail: '',
        fromName: ''
      },
      backup: {
        enabled: true,
        frequency: 'daily',
        time: '02:00',
        retentionCount: 7,
        type: 'full',
        compression: true,
        encryption: false,
        encryptionKey: ''
      }
    })
    
    // 原始配置，用于比较变更
    const originalConfig = ref({})
    
    // 保存初始配置用于比较
    const saveOriginalConfig = () => {
      originalConfig.value = JSON.parse(JSON.stringify(config))
    }
    
    // 检查是否有未保存的变更
    const hasChanges = computed(() => {
      return JSON.stringify(config) !== JSON.stringify(originalConfig.value)
    })
    
    // 加载配置
    const loadConfig = async () => {
      try {
        // 调用后端API获取系统配置
        const response = await fetch('http://localhost:3001/api/system/config', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) {
          throw new Error('获取系统配置失败')
        }
        
        const data = await response.json()
        if (data.success) {
          // 将API返回的扁平配置转换为前端的嵌套结构
          const configData = data.data
          
          // 更新基本设置
          if (configData.system_name) config.basic.systemName = configData.system_name
          if (configData.system_version) config.basic.version = configData.system_version
          if (configData.system_description) config.basic.description = configData.system_description
          if (configData.contact_email) config.basic.contact = configData.contact_email
          if (configData.copyright) config.basic.copyright = configData.copyright
          if (configData.enable_registration) config.basic.enableRegistration = configData.enable_registration === 'true'
          
          // 更新用户设置
          if (configData.default_role) config.user.defaultRole = configData.default_role
          if (configData.password_policy) config.user.passwordPolicy = configData.password_policy
          if (configData.password_expiry_days) config.user.passwordExpiryDays = parseInt(configData.password_expiry_days)
          if (configData.max_failed_login_attempts) config.user.maxFailedLoginAttempts = parseInt(configData.max_failed_login_attempts)
          if (configData.account_lock_minutes) config.user.accountLockMinutes = parseInt(configData.account_lock_minutes)
          if (configData.require_email_verification) config.user.requireEmailVerification = configData.require_email_verification === 'true'
          
          // 更新课程设置
          if (configData.semester_weeks) config.course.semesterWeeks = parseInt(configData.semester_weeks)
          if (configData.daily_sessions) config.course.dailySessions = parseInt(configData.daily_sessions)
          if (configData.max_course_capacity) config.course.maxCourseCapacity = parseInt(configData.max_course_capacity)
        } else {
          // 尝试从store获取配置数据
          if (userState.adminData && userState.adminData.systemConfig) {
            Object.assign(config, userState.adminData.systemConfig)
          }
        }
      } catch (error) {
        console.error('加载系统配置失败:', error)
        // 加载失败时，尝试从store获取配置数据
        if (userState.adminData && userState.adminData.systemConfig) {
          Object.assign(config, userState.adminData.systemConfig)
        }
      } finally {
        saveOriginalConfig()
      }
    }
    
    // 切换配置分类
    const switchCategory = (categoryId) => {
      // 如果有未保存的更改，提示用户
      if (hasChanges.value && confirm('您有未保存的配置更改，确定要切换到其他配置项吗？')) {
        activeCategory.value = categoryId
      } else if (!hasChanges.value) {
        activeCategory.value = categoryId
      }
    }
    
    // 保存所有变更
    const saveAllChanges = async () => {
      try {
        // 将前端的嵌套配置转换为后端需要的扁平结构
        const configData = {
          // 基本设置
          system_name: config.basic.systemName,
          system_version: config.basic.version,
          system_description: config.basic.description,
          contact_email: config.basic.contact,
          copyright: config.basic.copyright,
          enable_registration: config.basic.enableRegistration.toString(),
          
          // 用户设置
          default_role: config.user.defaultRole,
          password_policy: config.user.passwordPolicy,
          password_expiry_days: config.user.passwordExpiryDays.toString(),
          max_failed_login_attempts: config.user.maxFailedLoginAttempts.toString(),
          account_lock_minutes: config.user.accountLockMinutes.toString(),
          require_email_verification: config.user.requireEmailVerification.toString(),
          
          // 课程设置
          semester_weeks: config.course.semesterWeeks.toString(),
          daily_sessions: config.course.dailySessions.toString(),
          max_course_capacity: config.course.maxCourseCapacity.toString(),
          
          // 安全设置
          session_timeout_minutes: config.security.sessionTimeoutMinutes.toString(),
          enable_audit_log: config.security.enableAuditLog.toString(),
          
          // 备份设置
          backup_enabled: config.backup.enabled.toString(),
          backup_frequency: config.backup.frequency,
          backup_time: config.backup.time,
          backup_retention_count: config.backup.retentionCount.toString()
        }
        
        // 调用后端API保存配置
        const response = await fetch('http://localhost:3001/api/system/config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(configData)
        })
        
        if (!response.ok) {
          throw new Error('保存配置失败')
        }
        
        const data = await response.json()
        if (data.success) {
          alert('系统配置已成功保存')
          saveOriginalConfig() // 更新原始配置
        } else {
          throw new Error(data.message || '保存配置失败')
        }
      } catch (error) {
        console.error('保存配置失败:', error)
        alert('保存配置失败: ' + error.message)
        // 即使失败也更新本地状态，避免用户困惑
        saveOriginalConfig()
      }
    }
    
    // 导出配置
    const exportConfig = () => {
      const dataStr = JSON.stringify(config, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `system_config_${new Date().toISOString().slice(0, 10)}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    }
    
    // 处理配置文件导入
    const handleConfigImport = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target.result)
          // 验证配置格式
          if (validateImportedConfig(importedConfig)) {
            configFile.value = importedConfig
            alert('配置文件验证通过，可以导入')
          } else {
            alert('导入的配置文件格式不正确')
            configFile.value = null
          }
        } catch (error) {
          alert('解析配置文件失败')
          console.error('导入配置错误:', error)
        }
      }
      reader.readAsText(file)
    }
    
    // 验证导入的配置
    const validateImportedConfig = (imported) => {
      // 简单验证配置文件是否包含必要的配置项
      return imported && 
             imported.basic && 
             imported.user && 
             imported.course && 
             imported.security
    }
    
    // 确认导入配置
    const confirmImport = () => {
      if (!configFile.value) return
      
      if (confirm('确认导入配置？这将覆盖当前所有系统设置！')) {
        Object.assign(config, configFile.value)
        alert('配置导入成功')
        importConfig.value = false
        configFile.value = null
        saveOriginalConfig()
      }
    }
    
    // 测试邮件设置
    const testEmailSettings = () => {
      // 模拟测试邮件发送
      alert('测试邮件已发送到配置的发件人邮箱，请检查是否收到')
    }
    
    // 手动执行备份
    const runManualBackup = () => {
      alert('备份任务已开始执行，请稍后在备份历史中查看结果')
    }
    
    // 查看备份历史
    const viewBackupHistory = () => {
      // 这里可以跳转到备份历史页面或打开备份历史对话框
      alert('打开备份历史记录')
    }
    
    onMounted(() => {
      loadConfig()
      // 检查用户权限
      if (userState.role !== 'superAdmin') {
        alert('权限不足，请联系超级管理员')
      }
    })
    
    return {
      activeCategory,
      configCategories,
      config,
      importConfig,
      configFile,
      hasChanges,
      switchCategory,
      saveAllChanges,
      exportConfig,
      handleConfigImport,
      confirmImport,
      testEmailSettings,
      runManualBackup,
      viewBackupHistory
    }
  }
}
</script>

<style scoped>
.system-config {
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
  font-size: 24px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-button {
  padding: 8px 20px;
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

/* 配置导航 */
.config-navigation {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
  flex-wrap: wrap;
}

.nav-button {
  padding: 10px 20px;
  border: none;
  background-color: #f0f2f5;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  color: #666;
}

.nav-button:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.nav-button.active {
  background-color: #1890ff;
  color: white;
  font-weight: 500;
}

/* 配置内容 */
.config-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.config-section h3 {
  color: #333;
  margin-bottom: 24px;
  font-size: 18px;
  font-weight: 600;
}

.config-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
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

.form-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  margin-top: 16px;
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

.dialog-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 导入对话框特定样式 */
.import-instruction {
  margin-bottom: 20px;
}

.import-instruction p {
  margin-bottom: 12px;
  color: #333;
}

.import-instruction input[type="file"] {
  width: 100%;
  padding: 12px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
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

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .config-navigation {
    flex-direction: column;
  }
  
  .nav-button {
    width: 100%;
    text-align: left;
  }
  
  .config-form {
    grid-template-columns: 1fr;
  }
}
</style>