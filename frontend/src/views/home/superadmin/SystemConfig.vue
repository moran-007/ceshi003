<template>
  <div class="system-config-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>系统配置管理</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="saveAllChanges" :disabled="!hasChanges">
          <i class="icon icon-save"></i> 保存更改
        </button>
        <button class="btn btn-secondary" @click="resetChanges" :disabled="!hasChanges">
          <i class="icon icon-reset"></i> 重置
        </button>
      </div>
    </div>

    <!-- 配置选项卡 -->
    <div class="config-tabs">
      <div 
        v-for="tab in configTabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <i class="icon" :class="tab.icon"></i>
        <span>{{ tab.label }}</span>
      </div>
    </div>

    <!-- 配置内容区域 -->
    <div class="config-content">
      <!-- 基础配置 -->
      <div v-if="activeTab === 'basic'" class="config-section">
        <div class="config-card">
          <div class="card-header">
            <h3>系统基本信息</h3>
            <span class="config-hint">配置系统的基本参数</span>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>系统名称 *</label>
                <input 
                  type="text" 
                  v-model="config.systemName" 
                  class="form-input"
                  placeholder="请输入系统名称"
                  @change="setChanged"
                />
              </div>
              <div class="form-group">
                <label>系统版本</label>
                <input 
                  type="text" 
                  v-model="config.systemVersion" 
                  class="form-input"
                  placeholder="请输入系统版本"
                  @change="setChanged"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>系统描述</label>
                <textarea 
                  v-model="config.systemDescription" 
                  class="form-input"
                  rows="3"
                  placeholder="请输入系统描述"
                  @change="setChanged"
                ></textarea>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>版权信息</label>
                <input 
                  type="text" 
                  v-model="config.copyright" 
                  class="form-input"
                  placeholder="请输入版权信息"
                  @change="setChanged"
                />
              </div>
              <div class="form-group">
                <label>公司名称</label>
                <input 
                  type="text" 
                  v-model="config.companyName" 
                  class="form-input"
                  placeholder="请输入公司名称"
                  @change="setChanged"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="config-card">
          <div class="card-header">
            <h3>界面设置</h3>
            <span class="config-hint">配置系统界面相关参数</span>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>默认语言</label>
                <select 
                  v-model="config.defaultLanguage" 
                  class="form-select"
                  @change="setChanged"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                </select>
              </div>
              <div class="form-group">
                <label>默认时区</label>
                <select 
                  v-model="config.defaultTimezone" 
                  class="form-select"
                  @change="setChanged"
                >
                  <option value="Asia/Shanghai">Asia/Shanghai</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>日期格式</label>
                <select 
                  v-model="config.dateFormat" 
                  class="form-select"
                  @change="setChanged"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
              <div class="form-group">
                <label>时间格式</label>
                <select 
                  v-model="config.timeFormat" 
                  class="form-select"
                  @change="setChanged"
                >
                  <option value="24h">24小时制</option>
                  <option value="12h">12小时制</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全配置 -->
      <div v-if="activeTab === 'security'" class="config-section">
        <div class="config-card">
          <div class="card-header">
            <h3>密码策略</h3>
            <span class="config-hint">配置用户密码安全策略</span>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>密码最小长度</label>
                <input 
                  type="number" 
                  v-model="config.passwordMinLength" 
                  class="form-input"
                  min="6"
                  max="32"
                  @change="setChanged"
                />
                <small class="form-hint">密码的最小长度，建议至少为8位</small>
              </div>
              <div class="form-group">
                <label>密码有效期（天）</label>
                <input 
                  type="number" 
                  v-model="config.passwordExpiryDays" 
                  class="form-input"
                  min="0"
                  max="365"
                  @change="setChanged"
                />
                <small class="form-hint">0表示永不过期</small>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="config.requireUppercase" 
                    @change="setChanged"
                  />
                  <span class="checkbox-text">必须包含大写字母</span>
                </label>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="config.requireLowercase" 
                    @change="setChanged"
                  />
                  <span class="checkbox-text">必须包含小写字母</span>
                </label>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="config.requireNumber" 
                    @change="setChanged"
                  />
                  <span class="checkbox-text">必须包含数字</span>
                </label>
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="config.requireSpecialChar" 
                    @change="setChanged"
                  />
                  <span class="checkbox-text">必须包含特殊字符</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="config-card">
          <div class="card-header">
            <h3>登录设置</h3>
            <span class="config-hint">配置用户登录相关设置</span>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>最大登录尝试次数</label>
                <input 
                  type="number" 
                  v-model="config.maxLoginAttempts" 
                  class="form-input"
                  min="1"
                  max="20"
                  @change="setChanged"
                />
              </div>
              <div class="form-group">
                <label>账户锁定时长（分钟）</label>
                <input 
                  type="number" 
                  v-model="config.accountLockMinutes" 
                  class="form-input"
                  min="1"
                  max="1440"
                  @change="setChanged"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Session超时（分钟）</label>
                <input 
                  type="number" 
                  v-model="config.sessionTimeoutMinutes" 
                  class="form-input"
                  min="5"
                  max="480"
                  @change="setChanged"
                />
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="config.enableTwoFactorAuth" 
                    @change="setChanged"
                  />
                  <span class="checkbox-text">启用双因素认证</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据配置 -->
      <div v-if="activeTab === 'data'" class="config-section">
        <div class="config-card">
          <div class="card-header">
            <h3>数据存储设置</h3>
            <span class="config-hint">配置数据存储相关参数</span>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>文件上传限制（MB）</label>
                <input 
                  type="number" 
                  v-model="config.maxFileSize" 
                  class="form-input"
                  min="1"
                  max="1024"
                  @change="setChanged"
                />
              </div>
              <div class="form-group">
                <label>允许的文件类型</label>
                <input 
                  type="text" 
                  v-model="config.allowedFileTypes" 
                  class="form-input"
                  placeholder="jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx"
                  @change="setChanged"
                />
                <small class="form-hint">使用逗号分隔多个文件类型</small>
              </div>
            </div>
          </div>
        </div>

        <div class="config-card">
          <div class="card-header">
            <h3>备份设置</h3>
            <span class="config-hint">配置数据备份相关参数</span>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="config.autoBackupEnabled" 
                    @change="setChanged"
                  />
                  <span class="checkbox-text">启用自动备份</span>
                </label>
              </div>
              <div class="form-group">
                <label>自动备份频率</label>
                <select 
                  v-model="config.backupFrequency" 
                  class="form-select"
                  :disabled="!config.autoBackupEnabled"
                  @change="setChanged"
                >
                  <option value="daily">每天</option>
                  <option value="weekly">每周</option>
                  <option value="monthly">每月</option>
                </select>
              </div>
              <div class="form-group">
                <label>保留备份数量</label>
                <input 
                  type="number" 
                  v-model="config.backupRetentionCount" 
                  class="form-input"
                  min="1"
                  max="100"
                  @change="setChanged"
                />
                <small class="form-hint">保留的最大备份文件数量</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 邮件配置 -->
      <div v-if="activeTab === 'email'" class="config-section">
        <div class="config-card">
          <div class="card-header">
            <h3>邮件服务器设置</h3>
            <span class="config-hint">配置系统邮件发送功能</span>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>SMTP 服务器</label>
                <input 
                  type="text" 
                  v-model="config.smtpServer" 
                  class="form-input"
                  placeholder="smtp.example.com"
                  @change="setChanged"
                />
              </div>
              <div class="form-group">
                <label>SMTP 端口</label>
                <input 
                  type="number" 
                  v-model="config.smtpPort" 
                  class="form-input"
                  @change="setChanged"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>SMTP 用户名</label>
                <input 
                  type="text" 
                  v-model="config.smtpUsername" 
                  class="form-input"
                  @change="setChanged"
                />
              </div>
              <div class="form-group">
                <label>SMTP 密码</label>
                <input 
                  type="password" 
                  v-model="config.smtpPassword" 
                  class="form-input"
                  @change="setChanged"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="config.smtpUseSSL" 
                    @change="setChanged"
                  />
                  <span class="checkbox-text">使用 SSL/TLS</span>
                </label>
              </div>
              <div class="form-group">
                <label>发件人邮箱</label>
                <input 
                  type="email" 
                  v-model="config.fromEmail" 
                  class="form-input"
                  placeholder="noreply@example.com"
                  @change="setChanged"
                />
              </div>
              <div class="form-group">
                <label>发件人名称</label>
                <input 
                  type="text" 
                  v-model="config.fromName" 
                  class="form-input"
                  placeholder="系统管理员"
                  @change="setChanged"
                />
              </div>
            </div>
            <div class="form-actions">
              <button class="btn btn-secondary" @click="testEmailSettings">
                <i class="icon icon-test"></i> 测试邮件设置
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 高级配置 -->
      <div v-if="activeTab === 'advanced'" class="config-section">
        <div class="config-card">
          <div class="card-header">
            <h3>性能优化</h3>
            <span class="config-hint">配置系统性能相关参数</span>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>API 请求超时（秒）</label>
                <input 
                  type="number" 
                  v-model="config.apiTimeoutSeconds" 
                  class="form-input"
                  min="5"
                  max="120"
                  @change="setChanged"
                />
              </div>
              <div class="form-group">
                <label>数据缓存时间（分钟）</label>
                <input 
                  type="number" 
                  v-model="config.cacheTimeMinutes" 
                  class="form-input"
                  min="0"
                  max="1440"
                  @change="setChanged"
                />
                <small class="form-hint">0表示禁用缓存</small>
              </div>
            </div>
          </div>
        </div>

        <div class="config-card">
          <div class="card-header">
            <h3>维护模式</h3>
            <span class="config-hint">配置系统维护相关设置</span>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="config.maintenanceMode" 
                    @change="setChanged"
                  />
                  <span class="checkbox-text">启用维护模式</span>
                </label>
              </div>
            </div>
            <div class="form-row" v-if="config.maintenanceMode">
              <div class="form-group">
                <label>维护信息</label>
                <textarea 
                  v-model="config.maintenanceMessage" 
                  class="form-input"
                  rows="3"
                  placeholder="请输入维护提示信息"
                  @change="setChanged"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="config-card">
          <div class="card-header">
            <h3>系统版本信息</h3>
            <span class="config-hint">查看系统版本和构建信息</span>
          </div>
          <div class="card-body">
            <div class="system-info">
              <div class="info-row">
                <span class="info-label">系统版本：</span>
                <span class="info-value">{{ systemInfo.version }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">构建版本：</span>
                <span class="info-value">{{ systemInfo.buildVersion }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">构建日期：</span>
                <span class="info-value">{{ systemInfo.buildDate }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">前端框架：</span>
                <span class="info-value">{{ systemInfo.frontendFramework }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">最后更新：</span>
                <span class="info-value">{{ systemInfo.lastUpdated }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认对话框 -->
    <div class="dialog-overlay" v-if="showConfirmDialog" @click.self="closeConfirmDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ confirmDialog.title }}</h3>
          <button class="dialog-close" @click="closeConfirmDialog">×</button>
        </div>
        <div class="dialog-content">
          <p>{{ confirmDialog.message }}</p>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="closeConfirmDialog">{{ confirmDialog.cancelText || '取消' }}</button>
          <button class="btn btn-primary" @click="confirmDialog.action">{{ confirmDialog.confirmText || '确定' }}</button>
        </div>
      </div>
    </div>

    <!-- 测试邮件对话框 -->
    <div class="dialog-overlay" v-if="showTestEmailDialog" @click.self="showTestEmailDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>测试邮件设置</h3>
          <button class="dialog-close" @click="showTestEmailDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>接收邮箱 *</label>
            <input 
              type="email" 
              v-model="testEmailAddress" 
              class="form-input"
              placeholder="请输入测试接收邮箱"
              required
            />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-outline" @click="showTestEmailDialog = false">取消</button>
          <button class="btn btn-primary" @click="sendTestEmail" :disabled="isSendingTestEmail">
            {{ isSendingTestEmail ? '发送中...' : '发送测试邮件' }}
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
import { ref, reactive, computed, onMounted, watch } from 'vue'

export default {
  name: 'SystemConfig',
  setup() {
    // 状态管理
    const activeTab = ref('basic')
    const hasChanges = ref(false)
    const notificationId = ref(0)
    const notifications = ref([])
    const originalConfig = ref({})
    
    // 对话框状态
    const showConfirmDialog = ref(false)
    const confirmDialog = reactive({
      title: '',
      message: '',
      confirmText: '确定',
      cancelText: '取消',
      action: null
    })
    
    const showTestEmailDialog = ref(false)
    const testEmailAddress = ref('')
    const isSendingTestEmail = ref(false)
    
    // 配置选项卡
    const configTabs = [
      { key: 'basic', label: '基础配置', icon: 'icon-settings' },
      { key: 'security', label: '安全配置', icon: 'icon-shield' },
      { key: 'data', label: '数据配置', icon: 'icon-database' },
      { key: 'email', label: '邮件配置', icon: 'icon-email' },
      { key: 'advanced', label: '高级配置', icon: 'icon-cog' }
    ]
    
    // 系统信息
    const systemInfo = reactive({
      version: '1.0.0',
      buildVersion: 'Build 20231015-01',
      buildDate: '2023-10-15',
      frontendFramework: 'Vue 3 + Vite',
      lastUpdated: '2023-10-20 14:30:00'
    })
    
    // 配置数据
    const config = reactive({
      // 基本信息
      systemName: '课程管理系统',
      systemVersion: 'v1.0.0',
      systemDescription: '一套完整的课程管理系统，支持学生、教师、管理员等角色',
      copyright: '© 2023 课程管理系统 版权所有',
      companyName: '示例科技有限公司',
      
      // 界面设置
      defaultLanguage: 'zh-CN',
      defaultTimezone: 'Asia/Shanghai',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      
      // 密码策略
      passwordMinLength: 8,
      passwordExpiryDays: 90,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
      
      // 登录设置
      maxLoginAttempts: 5,
      accountLockMinutes: 30,
      sessionTimeoutMinutes: 30,
      enableTwoFactorAuth: false,
      
      // 数据存储
      maxFileSize: 10,
      allowedFileTypes: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx',
      
      // 备份设置
      autoBackupEnabled: true,
      backupFrequency: 'weekly',
      backupRetentionCount: 10,
      
      // 邮件设置
      smtpServer: 'smtp.example.com',
      smtpPort: 465,
      smtpUsername: 'noreply@example.com',
      smtpPassword: '',
      smtpUseSSL: true,
      fromEmail: 'noreply@example.com',
      fromName: '系统管理员',
      
      // 高级设置
      apiTimeoutSeconds: 30,
      cacheTimeMinutes: 5,
      maintenanceMode: false,
      maintenanceMessage: '系统正在进行维护，请稍后再试。'
    })

    // 保存原始配置用于重置
    const saveOriginalConfig = () => {
      originalConfig.value = JSON.parse(JSON.stringify(config))
    }

    // 标记有更改
    const setChanged = () => {
      hasChanges.value = true
    }

    // 重置更改
    const resetChanges = () => {
      showConfirmDialog.value = true
      confirmDialog.title = '重置配置'
      confirmDialog.message = '确定要放弃所有未保存的更改吗？'
      confirmDialog.confirmText = '确定重置'
      confirmDialog.action = () => {
        // 复制原始配置回来
        Object.assign(config, JSON.parse(JSON.stringify(originalConfig.value)))
        hasChanges.value = false
        showConfirmDialog.value = false
        addNotification('success', '配置已重置')
      }
    }

    // 关闭确认对话框
    const closeConfirmDialog = () => {
      showConfirmDialog.value = false
    }

    // 保存所有更改
    const saveAllChanges = () => {
      showConfirmDialog.value = true
      confirmDialog.title = '保存配置'
      confirmDialog.message = '确定要保存所有配置更改吗？部分更改可能需要重新登录才能生效。'
      confirmDialog.confirmText = '保存更改'
      confirmDialog.action = () => {
        // 模拟保存操作
        setTimeout(() => {
          saveOriginalConfig() // 更新原始配置
          hasChanges.value = false
          showConfirmDialog.value = false
          addNotification('success', '所有配置已成功保存')
        }, 500)
      }
    }

    // 测试邮件设置
    const testEmailSettings = () => {
      showTestEmailDialog.value = true
      testEmailAddress.value = ''
    }

    // 发送测试邮件
    const sendTestEmail = () => {
      if (!testEmailAddress.value) {
        addNotification('error', '请输入接收邮箱地址')
        return
      }

      isSendingTestEmail.value = true
      
      // 模拟发送邮件
      setTimeout(() => {
        isSendingTestEmail.value = false
        showTestEmailDialog.value = false
        addNotification('success', `测试邮件已发送至 ${testEmailAddress.value}`)
      }, 1500)
    }

    // 添加通知
    const addNotification = (type, message) => {
      const id = notificationId.value++
      notifications.value.push({ id, type, message })
      
      // 3秒后自动移除
      setTimeout(() => {
        removeNotification(id)
      }, 3000)
    }

    // 移除通知
    const removeNotification = (id) => {
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
      }
    }

    // 获取通知图标
    const getNotificationIcon = (type) => {
      const iconMap = {
        success: 'icon-success',
        error: 'icon-error',
        warning: 'icon-warning',
        info: 'icon-info'
      }
      return iconMap[type] || 'icon-info'
    }

    // 组件挂载时保存原始配置
    onMounted(() => {
      saveOriginalConfig()
    })

    return {
      // 状态
      activeTab,
      hasChanges,
      notifications,
      
      // 配置数据
      config,
      configTabs,
      systemInfo,
      
      // 对话框
      showConfirmDialog,
      confirmDialog,
      showTestEmailDialog,
      testEmailAddress,
      isSendingTestEmail,
      
      // 方法
      setChanged,
      resetChanges,
      closeConfirmDialog,
      saveAllChanges,
      testEmailSettings,
      sendTestEmail,
      removeNotification,
      getNotificationIcon
    }
  }
}
</script>

<style scoped>
.system-config-container {
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

/* 配置选项卡样式 */
.config-tabs {
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
  color: #666;
  white-space: nowrap;
}

.tab-item:hover {
  background-color: #f8f9fa;
  color: #667eea;
}

.tab-item.active {
  background-color: #667eea;
  color: white;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

/* 配置内容区域 */
.config-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.config-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.config-hint {
  color: #999;
  font-size: 12px;
}

.card-body {
  padding: 20px;
}

/* 表单样式 */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group small {
  color: #999;
  font-size: 12px;
  margin-top: 3px;
}

.form-input,
.form-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.form-input:disabled,
.form-select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

/* 复选框样式 */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  padding: 5px 0;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.checkbox-text {
  font-weight: normal;
  color: #333;
}

/* 表单操作区域 */
.form-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

/* 系统信息样式 */
.system-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.info-label {
  color: #666;
  min-width: 100px;
}

.info-value {
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s;
}

.dialog {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 450px;
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
  .system-config-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .config-tabs {
    overflow-x: auto;
    padding-bottom: 10px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .dialog {
    width: 95%;
    margin: 10px;
  }
}
</style>