<template>
  <div class="system-logs">
    <div class="page-header">
      <h2>系统操作日志</h2>
      <div class="header-actions">
        <button class="action-button" @click="refreshLogs">刷新日志</button>
        <button class="action-button" @click="clearLogs">清空日志</button>
        <button class="action-button" @click="exportLogs">导出日志</button>
      </div>
    </div>

    <!-- 日志统计 -->
    <div class="logs-stats">
      <div class="stats-card">
        <div class="stats-icon">📝</div>
        <div class="stats-content">
          <div class="stats-title">今日日志</div>
          <div class="stats-value">{{ todayLogCount }}</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon">⚠️</div>
        <div class="stats-content">
          <div class="stats-title">警告日志</div>
          <div class="stats-value">{{ warningLogCount }}</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon">🚨</div>
        <div class="stats-content">
          <div class="stats-title">错误日志</div>
          <div class="stats-value">{{ errorLogCount }}</div>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon">👁️</div>
        <div class="stats-content">
          <div class="stats-title">总日志数</div>
          <div class="stats-value">{{ logs.length }}</div>
        </div>
      </div>
    </div>

    <!-- 日志筛选器 -->
    <div class="logs-filters">
      <div class="filter-group">
        <label>日志级别</label>
        <select v-model="filter.level" class="filter-select">
          <option value="all">全部级别</option>
          <option value="info">信息</option>
          <option value="warning">警告</option>
          <option value="error">错误</option>
          <option value="critical">严重</option>
        </select>
      </div>
      <div class="filter-group">
        <label>操作类型</label>
        <select v-model="filter.actionType" class="filter-select">
          <option value="all">全部操作</option>
          <option value="login">登录</option>
          <option value="logout">登出</option>
          <option value="create">创建</option>
          <option value="update">更新</option>
          <option value="delete">删除</option>
          <option value="query">查询</option>
          <option value="import">导入</option>
          <option value="export">导出</option>
          <option value="backup">备份</option>
          <option value="restore">恢复</option>
        </select>
      </div>
      <div class="filter-group">
        <label>操作人</label>
        <input type="text" v-model="filter.username" class="filter-input" placeholder="输入用户名">
      </div>
      <div class="filter-group">
        <label>时间范围</label>
        <div class="date-range">
          <input type="date" v-model="filter.startDate" class="filter-input">
          <span class="date-separator">至</span>
          <input type="date" v-model="filter.endDate" class="filter-input">
        </div>
      </div>
      <div class="filter-group">
        <label>IP地址</label>
        <input type="text" v-model="filter.ipAddress" class="filter-input" placeholder="输入IP地址">
      </div>
      <div class="filter-group">
        <label>关键词</label>
        <input type="text" v-model="filter.keyword" class="filter-input" placeholder="输入关键词">
      </div>
      <div class="filter-actions">
        <button class="action-button primary" @click="applyFilters">应用筛选</button>
        <button class="action-button" @click="resetFilters">重置筛选</button>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="logs-list">
      <div class="logs-header">
        <h3>日志记录</h3>
        <div class="logs-info">显示 {{ filteredLogs.length }} 条记录</div>
      </div>
      
      <div class="logs-table-container">
        <table class="logs-table">
          <thead>
            <tr>
              <th @click="sortBy('timestamp')" class="sortable">
                时间
                <span class="sort-icon" :class="getSortIcon('timestamp')">⇅</span>
              </th>
              <th @click="sortBy('level')" class="sortable">
                级别
                <span class="sort-icon" :class="getSortIcon('level')">⇅</span>
              </th>
              <th @click="sortBy('username')" class="sortable">
                操作人
                <span class="sort-icon" :class="getSortIcon('username')">⇅</span>
              </th>
              <th @click="sortBy('action')" class="sortable">
                操作
                <span class="sort-icon" :class="getSortIcon('action')">⇅</span>
              </th>
              <th>详情</th>
              <th>IP地址</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="log in paginatedLogs" 
              :key="log.id"
              :class="{ 
                'log-error': log.level === 'error' || log.level === 'critical',
                'log-warning': log.level === 'warning'
              }"
              @click="expandLog(log)"
            >
              <td>{{ formatDateTime(log.timestamp) }}</td>
              <td>
                <span class="log-level" :class="log.level">
                  {{ levelText[log.level] }}
                </span>
              </td>
              <td>{{ log.username }}</td>
              <td>{{ log.action }}</td>
              <td class="log-details">
                <div class="details-summary">{{ truncateText(log.details, 50) }}</div>
                <div v-if="expandedLogId === log.id" class="details-full">
                  <pre>{{ formatJson(log.details) }}</pre>
                </div>
              </td>
              <td>{{ log.ipAddress }}</td>
              <td>
                <span class="log-status" :class="log.status">
                  {{ statusText[log.status] }}
                </span>
              </td>
            </tr>
            <tr v-if="paginatedLogs.length === 0">
              <td colspan="7" class="no-data">无符合条件的日志记录</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div v-if="filteredLogs.length > 0" class="pagination">
        <div class="page-size-control">
          <label>每页显示:</label>
          <select v-model="pageSize" @change="currentPage = 1">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div class="page-navigation">
          <button 
            class="page-button" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            上一页
          </button>
          <div class="page-numbers">
            <button
              v-for="page in pageNumbers"
              :key="page"
              class="page-number"
              :class="{ active: page === currentPage }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>
          <button 
            class="page-button" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            下一页
          </button>
        </div>
        <div class="page-info">
          共 {{ filteredLogs.length }} 条记录，第 {{ currentPage }}/{{ totalPages }} 页
        </div>
      </div>
    </div>

    <!-- 日志详情对话框 -->
    <div v-if="showDetailDialog" class="dialog-overlay" @click="closeDetailDialog">
      <div class="dialog-content large" @click.stop>
        <div class="dialog-header">
          <h3>日志详情</h3>
          <button class="close-button" @click="closeDetailDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="log-detail-info">
            <div class="detail-row">
              <span class="detail-label">日志ID:</span>
              <span class="detail-value">{{ selectedLog?.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">时间:</span>
              <span class="detail-value">{{ formatDateTime(selectedLog?.timestamp) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">级别:</span>
              <span class="detail-value">
                <span class="log-level" :class="selectedLog?.level">
                  {{ levelText[selectedLog?.level] }}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">操作人:</span>
              <span class="detail-value">{{ selectedLog?.username }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">IP地址:</span>
              <span class="detail-value">{{ selectedLog?.ipAddress }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">操作类型:</span>
              <span class="detail-value">{{ selectedLog?.actionType }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">操作描述:</span>
              <span class="detail-value">{{ selectedLog?.action }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">状态:</span>
              <span class="detail-value">
                <span class="log-status" :class="selectedLog?.status">
                  {{ statusText[selectedLog?.status] }}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">用户代理:</span>
              <span class="detail-value">{{ selectedLog?.userAgent }}</span>
            </div>
          </div>
          <div class="log-detail-data">
            <h4>详细数据</h4>
            <pre>{{ formatJson(selectedLog?.details) }}</pre>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="action-button primary" @click="closeDetailDialog">关闭</button>
        </div>
      </div>
    </div>

    <!-- 清空日志确认对话框 -->
    <div v-if="showClearConfirm" class="dialog-overlay" @click="showClearConfirm = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>确认清空日志</h3>
          <button class="close-button" @click="showClearConfirm = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="warning-message">
            <span class="warning-icon">⚠️</span>
            <p>清空日志操作将删除所有系统日志记录，此操作不可恢复！</p>
          </div>
          <div class="clear-options">
            <label>
              <input type="radio" v-model="clearOption" value="all">
              清空所有日志
            </label>
            <label>
              <input type="radio" v-model="clearOption" value="older">
              清空指定日期之前的日志
              <input 
                v-if="clearOption === 'older'" 
                type="date" 
                v-model="clearBeforeDate" 
                class="date-input"
              >
            </label>
            <label>
              <input type="radio" v-model="clearOption" value="level">
              清空指定级别的日志
              <select v-if="clearOption === 'level'" v-model="clearLevel" class="level-select">
                <option value="info">信息</option>
                <option value="warning">警告</option>
                <option value="error">错误</option>
                <option value="critical">严重</option>
              </select>
            </label>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="action-button" @click="showClearConfirm = false">取消</button>
          <button class="action-button danger" @click="confirmClearLogs">确认清空</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { userState } from '../../store/index.js'

export default {
  name: 'SystemLogs',
  setup() {
    // 状态管理
    const logs = ref([])
    const filter = reactive({
      level: 'all',
      actionType: 'all',
      username: '',
      startDate: '',
      endDate: '',
      ipAddress: '',
      keyword: ''
    })
    const currentPage = ref(1)
    const pageSize = ref(20)
    const sortField = ref('timestamp')
    const sortDirection = ref('desc')
    const expandedLogId = ref(null)
    
    // 对话框状态
    const showDetailDialog = ref(false)
    const showClearConfirm = ref(false)
    const selectedLog = ref(null)
    
    // 清空日志选项
    const clearOption = ref('all')
    const clearBeforeDate = ref(new Date().toISOString().split('T')[0])
    const clearLevel = ref('info')
    
    // 日志级别和状态文本映射
    const levelText = {
      'info': '信息',
      'warning': '警告',
      'error': '错误',
      'critical': '严重'
    }
    
    const statusText = {
      'success': '成功',
      'failed': '失败',
      'pending': '处理中'
    }
    
    // 加载日志数据
    const loadLogs = () => {
      // 从store中获取日志数据
      if (userState.adminData && userState.adminData.logs) {
        logs.value = userState.adminData.logs
      } else {
        // 生成模拟日志数据
        generateMockLogs()
      }
    }
    
    // 生成模拟日志
    const generateMockLogs = () => {
      const mockLogs = []
      const levels = ['info', 'warning', 'error', 'critical']
      const actions = [
        { type: 'login', text: '用户登录', status: 'success' },
        { type: 'logout', text: '用户登出', status: 'success' },
        { type: 'create', text: '创建用户', status: 'success' },
        { type: 'update', text: '更新课程信息', status: 'success' },
        { type: 'delete', text: '删除学生记录', status: 'success' },
        { type: 'query', text: '查询成绩数据', status: 'success' },
        { type: 'import', text: '导入用户数据', status: 'success' },
        { type: 'export', text: '导出课程表', status: 'success' },
        { type: 'backup', text: '执行系统备份', status: 'success' },
        { type: 'login', text: '用户登录失败', status: 'failed' },
        { type: 'update', text: '更新系统配置', status: 'success' }
      ]
      const usernames = ['admin', 'teacher001', 'teacher002', 'student001', 'superadmin']
      const ipAddresses = ['192.168.1.101', '192.168.1.102', '10.0.0.5', '172.16.0.8', '10.1.1.23']
      
      // 生成最近7天的日志
      const now = Date.now()
      const dayInMillis = 24 * 60 * 60 * 1000
      
      for (let i = 0; i < 200; i++) {
        // 随机生成时间戳，分布在最近7天
        const randomTime = now - Math.floor(Math.random() * 7 * dayInMillis)
        // 随机选择操作
        const actionIndex = Math.floor(Math.random() * actions.length)
        const action = actions[actionIndex]
        // 随机选择级别，失败的操作更可能是警告或错误
        let level = levels[Math.floor(Math.random() * levels.length)]
        if (action.status === 'failed') {
          level = levels[Math.floor(Math.random() * 2) + 1] // 警告或错误
        }
        
        const log = {
          id: i + 1,
          timestamp: randomTime,
          level: level,
          username: usernames[Math.floor(Math.random() * usernames.length)],
          actionType: action.type,
          action: action.text,
          details: {
            userId: Math.floor(Math.random() * 1000),
            actionData: {
              oldValue: 'some old value',
              newValue: 'some new value'
            },
            requestParams: {
              id: Math.floor(Math.random() * 100),
              name: 'Test Name'
            },
            responseTime: `${Math.floor(Math.random() * 500)}ms`,
            errorMessage: action.status === 'failed' ? 'Invalid credentials' : null
          },
          ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
          status: action.status,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        mockLogs.push(log)
      }
      
      // 按时间倒序排列
      mockLogs.sort((a, b) => b.timestamp - a.timestamp)
      logs.value = mockLogs
    }
    
    // 计算属性
    const filteredLogs = computed(() => {
      let result = [...logs.value]
      
      // 应用筛选条件
      if (filter.level !== 'all') {
        result = result.filter(log => log.level === filter.level)
      }
      
      if (filter.actionType !== 'all') {
        result = result.filter(log => log.actionType === filter.actionType)
      }
      
      if (filter.username) {
        result = result.filter(log => 
          log.username.toLowerCase().includes(filter.username.toLowerCase())
        )
      }
      
      if (filter.startDate) {
        const startDate = new Date(filter.startDate).setHours(0, 0, 0, 0)
        result = result.filter(log => log.timestamp >= startDate)
      }
      
      if (filter.endDate) {
        const endDate = new Date(filter.endDate).setHours(23, 59, 59, 999)
        result = result.filter(log => log.timestamp <= endDate)
      }
      
      if (filter.ipAddress) {
        result = result.filter(log => 
          log.ipAddress.includes(filter.ipAddress)
        )
      }
      
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase()
        result = result.filter(log => 
          log.action.toLowerCase().includes(keyword) ||
          JSON.stringify(log.details).toLowerCase().includes(keyword)
        )
      }
      
      // 排序
      result.sort((a, b) => {
        let comparison = 0
        if (sortField.value === 'timestamp') {
          comparison = a.timestamp - b.timestamp
        } else if (sortField.value === 'level') {
          const levelOrder = { 'critical': 4, 'error': 3, 'warning': 2, 'info': 1 }
          comparison = levelOrder[a.level] - levelOrder[b.level]
        } else if (sortField.value === 'username') {
          comparison = a.username.localeCompare(b.username)
        } else if (sortField.value === 'action') {
          comparison = a.action.localeCompare(b.action)
        }
        
        return sortDirection.value === 'asc' ? comparison : -comparison
      })
      
      return result
    })
    
    const paginatedLogs = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredLogs.value.slice(start, end)
    })
    
    const totalPages = computed(() => {
      return Math.ceil(filteredLogs.value.length / pageSize.value)
    })
    
    const pageNumbers = computed(() => {
      const total = totalPages.value
      const current = currentPage.value
      const pages = []
      
      if (total <= 7) {
        // 如果总页数不超过7，显示所有页码
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // 显示当前页附近的页码
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    })
    
    const todayLogCount = computed(() => {
      const today = new Date().setHours(0, 0, 0, 0)
      return logs.value.filter(log => log.timestamp >= today).length
    })
    
    const warningLogCount = computed(() => {
      return logs.value.filter(log => log.level === 'warning').length
    })
    
    const errorLogCount = computed(() => {
      return logs.value.filter(log => log.level === 'error' || log.level === 'critical').length
    })
    
    // 方法
    const formatDateTime = (timestamp) => {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
    
    const truncateText = (text, maxLength) => {
      const textStr = typeof text === 'string' ? text : JSON.stringify(text)
      return textStr.length > maxLength ? textStr.substring(0, maxLength) + '...' : textStr
    }
    
    const formatJson = (data) => {
      try {
        return JSON.stringify(data, null, 2)
      } catch (e) {
        return String(data)
      }
    }
    
    const getSortIcon = (field) => {
      if (sortField.value !== field) return ''
      return sortDirection.value
    }
    
    const sortBy = (field) => {
      if (sortField.value === field) {
        // 切换排序方向
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        // 新字段排序，默认降序
        sortField.value = field
        sortDirection.value = 'desc'
      }
    }
    
    const expandLog = (log) => {
      expandedLogId.value = expandedLogId.value === log.id ? null : log.id
      selectedLog.value = log
      showDetailDialog.value = true
    }
    
    const closeDetailDialog = () => {
      showDetailDialog.value = false
      expandedLogId.value = null
    }
    
    const applyFilters = () => {
      currentPage.value = 1 // 重置到第一页
    }
    
    const resetFilters = () => {
      filter.level = 'all'
      filter.actionType = 'all'
      filter.username = ''
      filter.startDate = ''
      filter.endDate = ''
      filter.ipAddress = ''
      filter.keyword = ''
      currentPage.value = 1
    }
    
    const refreshLogs = () => {
      loadLogs()
      alert('日志已刷新')
    }
    
    const clearLogs = () => {
      showClearConfirm.value = true
    }
    
    const confirmClearLogs = () => {
      // 根据选项执行清空操作
      if (clearOption.value === 'all') {
        logs.value = []
      } else if (clearOption.value === 'older') {
        const clearDate = new Date(clearBeforeDate.value).setHours(0, 0, 0, 0)
        logs.value = logs.value.filter(log => log.timestamp >= clearDate)
      } else if (clearOption.value === 'level') {
        logs.value = logs.value.filter(log => log.level !== clearLevel.value)
      }
      
      showClearConfirm.value = false
      alert('日志已清空')
      currentPage.value = 1
    }
    
    const exportLogs = () => {
      // 准备导出数据
      const exportData = filteredLogs.value.map(log => ({
        日志ID: log.id,
        时间: formatDateTime(log.timestamp),
        级别: levelText[log.level],
        操作人: log.username,
        IP地址: log.ipAddress,
        操作类型: log.actionType,
        操作描述: log.action,
        状态: statusText[log.status],
        详情: JSON.stringify(log.details)
      }))
      
      // 简单CSV导出
      const headers = Object.keys(exportData[0] || {})
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => 
            `"${row[header]?.toString().replace(/"/g, '""')}"`
          ).join(',')
        )
      ].join('\n')
      
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `system_logs_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
    
    onMounted(() => {
      loadLogs()
      // 检查用户权限
      if (userState.role !== 'superAdmin' && userState.role !== 'admin') {
        alert('权限不足，请联系管理员')
      }
    })
    
    return {
      logs,
      filter,
      currentPage,
      pageSize,
      sortField,
      sortDirection,
      expandedLogId,
      showDetailDialog,
      showClearConfirm,
      selectedLog,
      clearOption,
      clearBeforeDate,
      clearLevel,
      levelText,
      statusText,
      filteredLogs,
      paginatedLogs,
      totalPages,
      pageNumbers,
      todayLogCount,
      warningLogCount,
      errorLogCount,
      formatDateTime,
      truncateText,
      formatJson,
      getSortIcon,
      sortBy,
      expandLog,
      closeDetailDialog,
      applyFilters,
      resetFilters,
      refreshLogs,
      clearLogs,
      confirmClearLogs,
      exportLogs
    }
  }
}
</script>

<style scoped>
.system-logs {
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

.action-button:hover {
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

/* 日志统计 */
.logs-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stats-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f8ff;
  border-radius: 50%;
}

.stats-content {
  flex: 1;
}

.stats-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.stats-change {
  font-size: 12px;
  font-weight: 500;
}

.stats-change.positive {
  color: #52c41a;
}

.stats-change.negative {
  color: #ff4d4f;
}

.stats-hint {
  font-size: 12px;
  color: #999;
}

/* 日志筛选器 */
.logs-filters {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.filter-select,
.filter-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.date-separator {
  color: #666;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

/* 日志列表 */
.logs-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.logs-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.logs-info {
  color: #666;
  font-size: 14px;
}

.logs-actions {
  display: flex;
  gap: 8px;
}

.mini-button {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  background-color: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.mini-button:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.logs-table-container {
  overflow-x: auto;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.logs-table th,
.logs-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.logs-table th {
  background-color: #fafafa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}

.logs-table td {
  color: #666;
}

.logs-table tr:hover {
  background-color: #fafafa;
}

.log-error {
  background-color: #fff1f0 !important;
}

.log-error td {
  color: #ff4d4f;
  font-weight: 500;
}

.log-warning {
  background-color: #fffbe6 !important;
}

.log-warning td {
  color: #faad14;
  font-weight: 500;
}

.log-info {
  background-color: #f0f8ff;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.sortable:hover {
  background-color: #f0f0f0;
}

.sort-icon {
  margin-left: 4px;
  font-size: 12px;
}

.sort-icon.asc::before {
  content: '↑ ';
}

.sort-icon.desc::before {
  content: '↓ ';
}

.log-level {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.log-level.info {
  background-color: #e6f7ff;
  color: #1890ff;
}

.log-level.warning {
  background-color: #fffbe6;
  color: #faad14;
}

.log-level.error {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.log-level.critical {
  background-color: #ffccc7;
  color: #ff4d4f;
}

.log-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.log-status.success {
  background-color: #f6ffed;
  color: #52c41a;
}

.log-status.failed {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.log-status.pending {
  background-color: #e6f7ff;
  color: #1890ff;
}

.log-details {
  max-width: 300px;
}

.details-summary {
  font-size: 12px;
  color: #666;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.details-summary:hover {
  color: #1890ff;
}

.expand-icon {
  font-size: 10px;
  transition: transform 0.3s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.details-full {
  margin-top: 8px;
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    padding: 0 12px;
  }
  to {
    opacity: 1;
    max-height: 200px;
    padding: 12px;
  }
}

.details-full pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

/* 搜索高亮 */
:deep(mark) {
  background-color: #fff7e6;
  color: #d46b08;
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: 500;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-size-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-control select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.page-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
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
  display: flex;
  gap: 4px;
  align-items: center;
}

.page-number {
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-number:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.page-number.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

.page-ellipsis {
  color: #999;
  padding: 0 4px;
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

.dialog-content.large {
  max-width: 800px;
  width: 95%;
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
  font-size: 18px;
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
  transition: all 0.2s ease;
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

/* 日志详情对话框 */
.log-detail-info {
  margin-bottom: 24px;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.detail-label {
  width: 100px;
  font-weight: 500;
  color: #333;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #666;
  word-break: break-all;
}

.log-detail-data {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
}

.log-detail-data h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #333;
}

.log-detail-data pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
}

/* 清空确认对话框 */
.warning-message {
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
}

.warning-message p {
  color: #d46b08;
  margin: 0;
}

.clear-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.clear-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-wrap: wrap;
}

.date-input,
.level-select {
  margin-left: 8px;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

/* 通知样式 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  animation: slideInRight 0.3s ease;
  max-width: 350px;
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

.notification.success {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
}

.notification.error {
  background-color: #fff1f0;
  border: 1px solid #ffa39e;
  color: #cf1322;
}

.notification.warning {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  color: #d46b08;
}

.notification.info {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #0958d9;
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* 响应式 */
@media (max-width: 768px) {
  .system-logs {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .header-actions .action-button {
    flex: 1;
    min-width: 120px;
  }
  
  .logs-stats {
    grid-template-columns: 1fr;
  }
  
  .logs-filters {
    grid-template-columns: 1fr;
    padding: 16px;
  }
  
  .filter-actions {
    justify-content: flex-start;
  }
  
  .logs-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .logs-table {
    font-size: 12px;
  }
  
  .logs-table th,
  .logs-table td {
    padding: 8px;
  }
  
  .logs-table th:last-child,
  .logs-table td:last-child {
    white-space: nowrap;
  }
  
  .pagination {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-row {
    flex-direction: column;
  }
  
  .detail-label {
    width: auto;
    margin-bottom: 4px;
  }
  
  .notification {
    right: 12px;
    left: 12px;
    max-width: none;
  }
  
  .dialog-content {
    width: 95%;
    margin: 20px;
  }
}
</style>