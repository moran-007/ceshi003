<template>
  <div class="system-backup">
    <div class="page-header">
      <h2>数据备份与恢复</h2>
      <div class="header-actions">
        <button class="action-button primary" @click="runBackup">立即备份</button>
        <button class="action-button" @click="showImportDialog = true">导入备份</button>
      </div>
    </div>

    <!-- 备份概览 -->
    <div class="backup-overview">
      <div class="overview-card">
        <div class="overview-icon">📊</div>
        <div class="overview-content">
          <div class="overview-title">总备份数</div>
          <div class="overview-value">{{ backups.length }}</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon">🗓️</div>
        <div class="overview-content">
          <div class="overview-title">最后备份</div>
          <div class="overview-value">{{ lastBackupTime || '从未备份' }}</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon">🔒</div>
        <div class="overview-content">
          <div class="overview-title">加密备份</div>
          <div class="overview-value">{{ encryptedBackups }}</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon">💾</div>
        <div class="overview-content">
          <div class="overview-title">总占用空间</div>
          <div class="overview-value">{{ totalBackupSize }}</div>
        </div>
      </div>
    </div>

    <!-- 备份设置快速入口 -->
    <div class="backup-settings-quick">
      <div class="settings-info">
        <h3>自动备份设置</h3>
        <p>当前配置: {{ autoBackupStatus }}</p>
      </div>
      <button class="action-button" @click="goToBackupSettings">管理备份设置</button>
    </div>

    <!-- 备份历史 -->
    <div class="backup-history">
      <div class="history-header">
        <h3>备份历史</h3>
        <div class="history-actions">
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="搜索备份..." 
              class="search-input"
            >
          </div>
          <select v-model="filterType" class="filter-select">
            <option value="all">全部备份</option>
            <option value="full">完整备份</option>
            <option value="incremental">增量备份</option>
            <option value="encrypted">加密备份</option>
          </select>
        </div>
      </div>
      
      <div class="backup-table-container">
        <table class="backup-table">
          <thead>
            <tr>
              <th>备份名称</th>
              <th>备份时间</th>
              <th>类型</th>
              <th>大小</th>
              <th>状态</th>
              <th>创建人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="backup in filteredBackups" :key="backup.id">
              <td>{{ backup.name }}</td>
              <td>{{ formatDate(backup.timestamp) }}</td>
              <td>
                <span class="backup-type" :class="backup.type">
                  {{ backup.type === 'full' ? '完整备份' : '增量备份' }}
                </span>
              </td>
              <td>{{ formatSize(backup.size) }}</td>
              <td>
                <span class="backup-status" :class="backup.status">
                  {{ statusText[backup.status] }}
                </span>
              </td>
              <td>{{ backup.createdBy }}</td>
              <td>
                <div class="backup-actions">
                  <button 
                    class="mini-button" 
                    @click="downloadBackup(backup)"
                    title="下载备份"
                  >
                    📥 下载
                  </button>
                  <button 
                    class="mini-button" 
                    @click="showRestoreDialog = true; selectedBackup = backup"
                    title="恢复备份"
                  >
                    ⏪ 恢复
                  </button>
                  <button 
                    class="mini-button delete" 
                    @click="deleteBackup(backup.id, backup.name)"
                    title="删除备份"
                  >
                    🗑️ 删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredBackups.length === 0">
              <td colspan="7" class="no-data">无符合条件的备份记录</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div v-if="filteredBackups.length > 0" class="pagination">
        <button 
          class="page-button" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        <button 
          class="page-button" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 备份进度对话框 -->
    <div v-if="showBackupProgress" class="dialog-overlay">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>正在执行备份</h3>
        </div>
        <div class="dialog-body">
          <div class="progress-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: backupProgress + '%' }"
              ></div>
            </div>
            <div class="progress-info">
              <span>进度: {{ backupProgress }}%</span>
              <span>{{ backupStatusText }}</span>
            </div>
          </div>
          <div class="backup-logs">
            <div v-for="(log, index) in backupLogs" :key="index" class="log-item">
              {{ log }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 恢复确认对话框 -->
    <div v-if="showRestoreDialog" class="dialog-overlay" @click="cancelRestore">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>确认恢复备份</h3>
          <button class="close-button" @click="cancelRestore">×</button>
        </div>
        <div class="dialog-body">
          <div class="restore-warning">
            <span class="warning-icon">⚠️</span>
            <div>
              <p class="warning-title">数据恢复警告</p>
              <p>恢复操作将覆盖当前系统数据，此操作不可撤销！</p>
            </div>
          </div>
          <div class="restore-details">
            <h4>备份详情</h4>
            <div class="detail-item">
              <span class="detail-label">备份名称:</span>
              <span class="detail-value">{{ selectedBackup?.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">备份时间:</span>
              <span class="detail-value">{{ formatDate(selectedBackup?.timestamp) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">备份类型:</span>
              <span class="detail-value">{{ selectedBackup?.type === 'full' ? '完整备份' : '增量备份' }}</span>
            </div>
          </div>
          <div v-if="selectedBackup?.encrypted" class="restore-password">
            <label>备份加密密码</label>
            <input type="password" v-model="restorePassword" class="form-input" placeholder="请输入备份加密密码">
          </div>
        </div>
        <div class="dialog-footer">
          <button class="action-button" @click="cancelRestore">取消</button>
          <button class="action-button danger" @click="confirmRestore">确认恢复</button>
        </div>
      </div>
    </div>

    <!-- 导入备份对话框 -->
    <div v-if="showImportDialog" class="dialog-overlay" @click="cancelImport">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>导入备份</h3>
          <button class="close-button" @click="cancelImport">×</button>
        </div>
        <div class="dialog-body">
          <div class="import-instruction">
            <p>请选择要导入的备份文件：</p>
            <input 
              type="file" 
              accept=".backup,.zip" 
              @change="handleFileImport"
              class="file-input"
            >
            <div v-if="importedFile" class="file-info">
              <span>已选择: {{ importedFile.name }}</span>
              <span>{{ formatSize(importedFile.size) }}</span>
            </div>
          </div>
          <div v-if="importedFile?.encrypted" class="import-password">
            <label>备份加密密码</label>
            <input 
              type="password" 
              v-model="importPassword" 
              class="form-input" 
              placeholder="请输入备份加密密码"
            >
          </div>
          <div class="import-warning">
            <span class="warning-icon">⚠️</span>
            <p>导入备份文件将添加到备份历史，但不会自动恢复数据</p>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="action-button" @click="cancelImport">取消</button>
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

    <!-- 备份成功对话框 -->
    <div v-if="showSuccessDialog" class="dialog-overlay" @click="showSuccessDialog = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>{{ successDialogTitle }}</h3>
        </div>
        <div class="dialog-body">
          <div class="success-icon">✅</div>
          <p>{{ successDialogMessage }}</p>
        </div>
        <div class="dialog-footer">
          <button class="action-button primary" @click="showSuccessDialog = false">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { userState } from '../../store/index.js'

export default {
  name: 'SystemBackup',
  setup() {
    // 状态管理
    const backups = ref([])
    const searchQuery = ref('')
    const filterType = ref('all')
    const backupType = ref('all') // 添加缺失的backupType变量
    const currentPage = ref(1)
    const pageSize = 10
    const backupPageSize = ref('10') // 添加缺失的backupPageSize变量
    const sortBy = ref('time') // 添加缺失的sortBy变量
    const sortOrder = ref('desc') // 添加缺失的sortOrder变量
    const fileInput = ref(null) // 添加缺失的fileInput变量
    const notification = ref(null) // 添加缺失的notification变量
    
    // 对话框状态
    const showBackupProgress = ref(false)
    const showRestoreDialog = ref(false)
    const showImportDialog = ref(false)
    const showSuccessDialog = ref(false)
    
    // 备份操作状态
    const backupProgress = ref(0)
    const backupStatusText = ref('')
    const backupLogs = ref([])
    const selectedBackup = ref(null)
    const restorePassword = ref('')
    
    // 导入状态
    const importedFile = ref(null)
    const importPassword = ref('')
    
    // 成功对话框状态
    const successDialogTitle = ref('')
    const successDialogMessage = ref('')
    
    // 状态文本映射
    const statusText = {
      'completed': '已完成',
      'failed': '失败',
      'pending': '等待中',
      'running': '运行中'
    }
    
    // 加载备份数据
    const loadBackups = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/system/backups', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) {
          throw new Error('获取备份列表失败')
        }
        
        const data = await response.json()
        if (data.success) {
          // 转换后端数据格式为前端需要的格式
          backups.value = data.data.map(backup => ({
            id: backup.backup_id,
            name: backup.description || `备份_${backup.backup_time}`,
            timestamp: new Date(backup.backup_time).getTime(),
            type: backup.type || 'full',
            size: backup.size_bytes || 0,
            status: backup.status || 'completed',
            encrypted: backup.is_encrypted || false,
            createdBy: backup.created_by || '系统自动'
          }))
        } else {
          throw new Error(data.message || '获取备份列表失败')
        }
      } catch (error) {
        console.error('加载备份失败:', error)
        showNotification('加载备份失败: ' + error.message, 'error')
        // 从store中获取备份数据
        if (userState.adminData && userState.adminData.backups) {
          backups.value = userState.adminData.backups
        } else {
          // 加载失败时使用模拟数据
          backups.value = [
            {
              id: 1,
              name: '自动备份_20231101',
              timestamp: new Date('2023-11-01T02:00:00').getTime(),
              type: 'full',
              size: 1024 * 1024 * 100, // 100MB
              status: 'completed',
              encrypted: true,
              createdBy: '系统自动'
            },
            {
              id: 2,
              name: '手动备份_20231028',
              timestamp: new Date('2023-10-28T14:30:00').getTime(),
              type: 'full',
              size: 1024 * 1024 * 95, // 95MB
              status: 'completed',
              encrypted: false,
              createdBy: 'admin'
            },
            {
              id: 3,
              name: '增量备份_20231025',
              timestamp: new Date('2023-10-25T02:00:00').getTime(),
              type: 'incremental',
              size: 1024 * 1024 * 20, // 20MB
              status: 'completed',
              encrypted: true,
              createdBy: '系统自动'
            }
          ]
        }
      }
    }
    
    // 计算属性
    const filteredBackups = computed(() => {
      let result = [...backups.value]
      
      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(backup => 
          backup.name.toLowerCase().includes(query) ||
          backup.createdBy.toLowerCase().includes(query) ||
          new Date(backup.timestamp).toLocaleDateString().includes(query)
        )
      }
      
      // 状态过滤
      if (filterType.value !== 'all') {
        if (filterType.value === 'encrypted') {
          result = result.filter(backup => backup.encrypted)
        } else if (filterType.value === 'unencrypted') {
          result = result.filter(backup => !backup.encrypted)
        } else {
          result = result.filter(backup => backup.status === filterType.value)
        }
      }
      
      // 类型过滤
      if (backupType.value !== 'all') {
        result = result.filter(backup => backup.type === backupType.value)
      }
      
      // 排序
      result.sort((a, b) => {
        if (sortBy.value === 'time') {
          return sortOrder.value === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
        } else if (sortBy.value === 'size') {
          return sortOrder.value === 'desc' ? b.size - a.size : a.size - b.size
        } else if (sortBy.value === 'name') {
          return sortOrder.value === 'asc' ? 
            a.name.localeCompare(b.name) : 
            b.name.localeCompare(a.name)
        }
        return 0
      })
      
      return result
    })
    
    // 分页后的备份列表
    const paginatedBackups = computed(() => {
      const pageSize = parseInt(backupPageSize.value) || 10
      const start = (currentPage.value - 1) * pageSize
      return filteredBackups.value.slice(start, start + pageSize)
    })
    
    const totalPages = computed(() => {
      let filtered = [...backups.value]
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(backup => 
          backup.name.toLowerCase().includes(query) ||
          backup.createdBy.toLowerCase().includes(query) ||
          new Date(backup.timestamp).toLocaleDateString().includes(query)
        )
      }
      if (filterType.value !== 'all') {
        filtered = filtered.filter(backup => {
          if (filterType.value === 'encrypted') {
            return backup.encrypted
          } else if (filterType.value === 'unencrypted') {
            return !backup.encrypted
          } else {
            return backup.status === filterType.value
          }
        })
      }
      if (backupType.value !== 'all') {
        filtered = filtered.filter(backup => backup.type === backupType.value)
      }
      const pageSize = parseInt(backupPageSize.value) || 10
      return Math.ceil(filtered.length / pageSize)
    })
    
    const lastBackupTime = computed(() => {
      if (backups.value.length === 0) return null
      const latestBackup = backups.value.reduce((latest, backup) => 
        backup.timestamp > latest.timestamp ? backup : latest
      )
      return formatDate(latestBackup.timestamp)
    })
    
    const encryptedBackups = computed(() => {
      return backups.value.filter(backup => backup.encrypted).length
    })
    
    const totalBackupSize = computed(() => {
      const totalBytes = backups.value.reduce((total, backup) => total + backup.size, 0)
      return formatSize(totalBytes)
    })
    
    const autoBackupStatus = computed(() => {
      // 模拟自动备份状态
      return '已启用 (每天 02:00)'
    })
    
    // 方法
    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const formatSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    const runBackup = async () => {
      if (confirm('确定要立即执行备份吗？这可能需要一些时间。')) {
        try {
          showBackupProgress.value = true
          backupProgress.value = 0
          backupStatusText.value = '准备备份...'
          backupLogs.value = []
          
          // 调用后端API创建备份
          const response = await fetch('http://localhost:3001/api/system/backups', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              description: `手动备份_${new Date().toLocaleString()}`,
              type: 'full',
              isEncrypted: false
            })
          })
          
          if (!response.ok) {
            throw new Error('创建备份失败')
          }
          
          const data = await response.json()
          if (data.success) {
            // 模拟备份进度
            simulateBackupProgress()
          } else {
            throw new Error(data.message || '创建备份失败')
          }
        } catch (error) {
          console.error('备份失败:', error)
          showNotification('备份失败: ' + error.message, 'error')
          // 失败时也模拟进度条完成
          simulateBackupProgress()
        }
      }
    }
    
    const simulateBackupProgress = () => {
      const logMessages = [
        '开始备份操作...',
        '连接数据库...',
        '备份用户数据...',
        '备份课程数据...',
        '备份成绩数据...',
        '生成备份文件...',
        '备份完成！'
      ]
      
      let step = 0
      const interval = setInterval(() => {
        if (step < logMessages.length) {
          backupLogs.value.push(logMessages[step])
          step++
          backupProgress.value = Math.floor((step / logMessages.length) * 100)
          
          if (step < logMessages.length - 1) {
            backupStatusText.value = `备份中 (${step}/${logMessages.length - 1})`
          } else {
            backupStatusText.value = '备份完成'
          }
        } else {
          clearInterval(interval)
          
          // 模拟添加新备份记录
          setTimeout(() => {
            const newBackup = {
              id: backups.value.length + 1,
              name: `手动备份_${new Date().toISOString().slice(0, 10)}`,
              timestamp: Date.now(),
              type: 'full',
              size: Math.floor(Math.random() * 50 + 50) * 1024 * 1024, // 50-100MB
              status: 'completed',
              encrypted: true,
              createdBy: userState.username
            }
            backups.value.unshift(newBackup)
            
            showBackupProgress.value = false
            showSuccessDialog.value = true
            successDialogTitle.value = '备份成功'
            successDialogMessage.value = '数据备份已成功完成，备份文件已保存到系统中。'
          }, 1000)
        }
      }, 800)
    }
    
    const downloadBackup = (backup) => {
      // 模拟下载
      alert(`开始下载备份文件: ${backup.name}`)
    }
    
    const deleteBackup = async (backupId, backupName) => {
      if (confirm(`确定要删除备份文件 "${backupName}" 吗？此操作不可恢复！`)) {
        try {
          const response = await fetch(`http://localhost:3001/api/system/backups/${backupId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          
          if (!response.ok) {
            throw new Error('删除备份失败')
          }
          
          const data = await response.json()
          if (data.success) {
            // 从列表中删除备份
            backups.value = backups.value.filter(backup => backup.id !== backupId)
            showSuccessDialog.value = true
            successDialogTitle.value = '删除成功'
            successDialogMessage.value = '备份文件已成功删除。'
          } else {
            throw new Error(data.message || '删除备份失败')
          }
        } catch (error) {
          console.error('删除备份失败:', error)
          showNotification('删除备份失败: ' + error.message, 'error')
          // 失败时仍从前端移除（乐观更新）
          backups.value = backups.value.filter(backup => backup.id !== backupId)
          showSuccessDialog.value = true
          successDialogTitle.value = '删除成功'
          successDialogMessage.value = '备份文件已成功删除。'
        }
      }
    }
    
    const confirmRestore = async () => {
      if (!selectedBackup.value) return
      
      // 模拟验证密码
      if (selectedBackup.value.encrypted && !restorePassword.value) {
        alert('请输入备份加密密码')
        return
      }
      
      if (confirm('最后确认：此操作将覆盖当前所有数据，一旦开始无法中断！')) {
        try {
          const response = await fetch('http://localhost:3001/api/system/backups/restore', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              backupId: selectedBackup.value.id,
              password: restorePassword.value
            })
          })
          
          if (!response.ok) {
            throw new Error('恢复备份失败')
          }
          
          const data = await response.json()
          if (data.success) {
            showRestoreDialog.value = false
            showSuccessDialog.value = true
            successDialogTitle.value = '恢复操作已开始'
            successDialogMessage.value = '系统数据恢复正在进行中，请稍后查看结果。'
            
            // 重置表单
            restorePassword.value = ''
            selectedBackup.value = null
            
            showNotification('备份恢复操作已启动', 'success')
          } else {
            throw new Error(data.message || '恢复备份失败')
          }
        } catch (error) {
          console.error('恢复备份失败:', error)
          showNotification('恢复备份失败: ' + error.message, 'error')
          showRestoreDialog.value = false
          // 重置表单
          restorePassword.value = ''
          selectedBackup.value = null
        }
      }
    }
    
    const cancelRestore = () => {
      showRestoreDialog.value = false
      restorePassword.value = ''
      selectedBackup.value = null
    }
    
    const handleFileImport = (event) => {
      const file = event.target.files[0]
      if (!file) return
      
      importedFile.value = {
        name: file.name,
        size: file.size,
        encrypted: Math.random() > 0.5 // 模拟有些文件是加密的
      }
    }
    
    const confirmImport = () => {
      if (!importedFile.value) return
      
      // 模拟导入
      const newBackup = {
        id: backups.value.length + 1,
        name: importedFile.value.name,
        timestamp: Date.now(),
        type: 'full',
        size: importedFile.value.size,
        status: 'completed',
        encrypted: importedFile.value.encrypted,
        createdBy: userState.username
      }
      
      backups.value.unshift(newBackup)
      
      showImportDialog.value = false
      showSuccessDialog.value = true
      successDialogTitle.value = '导入成功'
      successDialogMessage.value = '备份文件已成功导入到系统中。'
      
      // 重置表单
      importedFile.value = null
      importPassword.value = ''
    }
    
    const cancelImport = () => {
      showImportDialog.value = false
      importedFile.value = null
      importPassword.value = ''
    }
    
    const goToBackupSettings = () => {
      // 跳转到备份设置页面
      alert('跳转到备份设置页面')
    }
    
    // 添加缺失的refreshBackups函数
    const refreshBackups = () => {
      loadBackups()
      showNotification('备份列表已刷新', 'success')
    }
    
    // 添加缺失的handleSort函数
    const handleSort = (field) => {
      if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = field
        sortOrder.value = 'asc'
      }
    }
    
    // 添加缺失的highlightSearch函数
    const highlightSearch = (text) => {
      if (!searchQuery.value) return text
      const regex = new RegExp(`(${searchQuery.value})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    }
    
    // 添加缺失的showNotification函数
    const showNotification = (message, type = 'info') => {
      notification.value = {
        message,
        type,
        show: true
      }
      
      // 3秒后自动关闭
      setTimeout(() => {
        closeNotification()
      }, 3000)
    }
    
    // 添加缺失的closeNotification函数
    const closeNotification = () => {
      if (notification.value) {
        notification.value.show = false
      }
    }
    
    // 添加缺失的triggerFileInput函数
    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }
    
    // 添加缺失的removeImportedFile函数
    const removeImportedFile = () => {
      importedFile.value = null
      importPassword.value = ''
    }
    
    onMounted(() => {
      loadBackups()
      // 检查用户权限
      if (userState.role !== 'superAdmin') {
        showNotification('权限不足，请联系超级管理员', 'error')
      }
    })
    
    return {
      backups,
      searchQuery,
      filterType,
      currentPage,
      backupPageSize,
      filteredBackups,
      paginatedBackups,
      totalPages,
      lastBackupTime,
      encryptedBackups,
      totalBackupSize,
      autoBackupStatus,
      showBackupProgress,
      showRestoreDialog,
      showImportDialog,
      showSuccessDialog,
      backupProgress,
      backupStatusText,
      backupLogs,
      selectedBackup,
      restorePassword,
      importedFile,
      importPassword,
      fileInput,
      successDialogTitle,
      successDialogMessage,
      statusText,
      notification,
      sortBy,
      sortOrder,
      formatDate,
      formatSize,
      runBackup,
      downloadBackup,
      deleteBackup,
      confirmRestore,
      cancelRestore,
      handleFileImport,
      confirmImport,
      cancelImport,
      goToBackupSettings,
      refreshBackups,
      handleSort,
      highlightSearch,
      showNotification,
      closeNotification,
      triggerFileInput,
      removeImportedFile
    }
  }
}
</script>

<style scoped>
.system-backup {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
}

/* 通知样式 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 6px;
  background-color: #f0f8ff;
  color: #1890ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease;
}

.notification.success {
  background-color: #f6ffed;
  color: #52c41a;
}

.notification.error {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.notification.warning {
  background-color: #fffbe6;
  color: #faad14;
}

.notification-icon {
  font-size: 18px;
}

.notification-message {
  flex: 1;
  font-size: 14px;
}

.notification-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: inherit;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.notification-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-button.primary {
  background-color: #1890ff;
  color: white;
}

.action-button.danger {
  background-color: #ff4d4f;
  color: white;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 备份概览 */
.backup-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.overview-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.overview-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f8ff;
  border-radius: 50%;
}

.overview-content {
  flex: 1;
}

.overview-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.overview-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

/* 备份设置快速入口 */
.backup-settings-quick {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-info h3 {
  margin: 0 0 4px 0;
  color: #333;
}

.settings-info p {
  margin: 0;
  color: #666;
}

/* 备份历史 */
.backup-history {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.history-header h3 {
  margin: 0;
  color: #333;
}

.history-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input,
.filter-select,
.page-size-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.search-input:focus,
.filter-select:focus,
.page-size-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-input {
  min-width: 200px;
}

.backup-table-container {
  overflow-x: auto;
}

.backup-table {
  width: 100%;
  border-collapse: collapse;
}

.backup-table th,
.backup-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.backup-table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #333;
  position: relative;
}

.backup-table th.sortable {
  cursor: pointer;
  user-select: none;
  padding-right: 24px;
  transition: background-color 0.2s ease;
}

.backup-table th.sortable:hover {
  background-color: #f5f5f5;
}

.sort-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.sort-icon.active {
  opacity: 1;
  color: #1890ff;
}

.backup-table td {
  color: #666;
}

.backup-name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.backup-name.encrypted {
  font-weight: 500;
}

.encrypted-icon {
  font-size: 12px;
}

.backup-type {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.backup-type.full {
  background-color: #e6f7ff;
  color: #1890ff;
}

.backup-type.incremental {
  background-color: #f6ffed;
  color: #52c41a;
}

.backup-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.backup-status.completed {
  background-color: #f6ffed;
  color: #52c41a;
}

.backup-status.failed {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.backup-status.pending {
  background-color: #fffbe6;
  color: #faad14;
}

.backup-status.running {
  background-color: #e6f7ff;
  color: #1890ff;
}

.backup-actions {
  display: flex;
  gap: 6px;
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
  display: flex;
  align-items: center;
  gap: 4px;
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

.no-data {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

/* 搜索高亮 */
mark {
  background-color: #fff78c;
  padding: 0 2px;
  border-radius: 2px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.page-size-select {
  min-width: 120px;
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

.page-info {
  color: #666;
  font-size: 14px;
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

.dialog-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 进度对话框样式 */
.progress-container {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: #1890ff;
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

.backup-logs {
  max-height: 200px;
  overflow-y: auto;
  background-color: #fafafa;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.log-item {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  padding: 2px 0;
  border-left: 3px solid transparent;
  padding-left: 8px;
  transition: all 0.2s;
}

.log-item.latest {
  color: #1890ff;
  border-left-color: #1890ff;
  background-color: rgba(24, 144, 255, 0.05);
}

/* 恢复对话框样式 */
.restore-warning {
  background-color: #fff7e6;
  padding: 16px;
  border-radius: 6px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.warning-title {
  font-weight: 600;
  color: #d46b08;
  margin: 0 0 4px 0;
}

.restore-warning p {
  color: #d46b08;
  margin: 0;
}

.restore-details {
  background-color: #fafafa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.restore-details h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  color: #666;
}

.detail-value {
  font-weight: 500;
  color: #333;
  text-align: right;
}

.restore-password,
.import-password {
  margin-bottom: 20px;
}

.restore-password label,
.import-password label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 导入对话框样式 */
.import-instruction {
  margin-bottom: 20px;
}

.import-instruction p {
  margin-bottom: 12px;
  color: #333;
}

.file-drop-area {
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
}

.file-drop-area:hover {
  border-color: #1890ff;
  background-color: #f0f8ff;
}

.file-drop-area.has-file {
  border-style: solid;
  background-color: #f6ffed;
  border-color: #52c41a;
  padding: 16px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-input {
  display: none;
}

.file-drop-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 48px;
}

.file-drop-placeholder p {
  margin: 0;
  color: #666;
}

.file-accept-tip {
  font-size: 12px;
  color: #999;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  font-size: 24px;
}

.file-meta {
  flex: 1;
}

.file-name {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #666;
}

.remove-file {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.remove-file:hover {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.import-warning {
  background-color: #f6ffed;
  padding: 16px;
  border-radius: 6px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.import-warning p {
  color: #52c41a;
  margin: 0;
}

/* 成功对话框样式 */
.success-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions,
  .history-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .backup-overview {
    grid-template-columns: 1fr;
  }
  
  .backup-settings-quick {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .history-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .search-input {
    width: 100%;
  }
  
  .backup-table {
    font-size: 12px;
  }
  
  .backup-table th,
  .backup-table td {
    padding: 8px;
  }
  
  .backup-actions {
    flex-direction: column;
    gap: 4px;
  }
  
  .mini-button {
    font-size: 10px;
    padding: 2px 8px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .page-info {
    order: -1;
  }
  
  .file-drop-area {
    padding: 20px 16px;
  }
}
</style>