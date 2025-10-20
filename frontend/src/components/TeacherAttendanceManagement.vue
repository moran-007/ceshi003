<template>
  <div class="teacher-attendance-management">
    <div class="page-header">
      <button class="back-button" @click="goBack">← 返回仪表盘</button>
      <h2>学员签到管理</h2>
    </div>

    <div class="attendance-container">
      <!-- 导航选项卡 -->
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key" 
          :class="['tab', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 当前课程签到 -->
      <div v-if="activeTab === 'current'" class="tab-content">
        <div class="current-courses">
          <div 
            v-for="course in todayCourses" 
            :key="course.id" 
            class="course-card"
          >
            <div class="course-header">
              <h3 class="course-name">{{ course.name }}</h3>
              <span class="course-time">{{ course.time }}</span>
            </div>
            <div class="course-info">
              <div class="info-item">
                <span class="label">教室:</span>
                <span class="value">{{ course.classroom }}</span>
              </div>
              <div class="info-item">
                <span class="label">应到人数:</span>
                <span class="value">{{ course.totalStudents }}</span>
              </div>
              <div class="info-item">
                <span class="label">已签到:</span>
                <span class="value">{{ course.attendedCount }}</span>
              </div>
              <div class="info-item">
                <span class="label">出勤率:</span>
                <span class="value" :class="getAttendanceRateClass(course.attendanceRate)">
                  {{ course.attendanceRate }}%
                </span>
              </div>
            </div>
            <div class="course-actions">
              <button 
                class="action-button primary" 
                @click="startAttendance(course)"
                :disabled="course.isAttending"
              >
                {{ course.isAttending ? '签到中...' : '开始签到' }}
              </button>
              <button 
                class="action-button" 
                @click="viewAttendanceDetails(course.id)"
              >
                查看详情
              </button>
            </div>
            <div v-if="course.isAttending" class="attendance-qr">
              <div class="qr-code">
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgPHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSI4MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYsIGFyaWFsIiBmb250LXNpemU9IjI0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC42Ij5UQUIrRklMRVM8L3RleHQ+CiAgPHJlY3QgeD0iNDAiIHk9IjQwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0idXJsKCNwYWdlX2xpbmVhcikiIG9wYWNpdHk9IjAuMCIgLz4KICA8dGV4dCB4PSI3MCIgeT0iOTUiIGZvbnQtZmFtaWx5PSJBcmlhbCwg c2Fucy1zaGVyaWYsIGFyaWFsIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DMTAwMTwvdGV4dD4KPC9zdmc+" alt="签到二维码">
              </div>
              <div class="qr-info">
                <p>请学生扫描二维码签到</p>
                <div class="countdown">
                  <span>剩余时间: </span>
                  <span class="time">{{ course.remainingTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史签到记录 -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <div class="history-filters">
          <div class="filter-row">
            <div class="filter-group">
              <label>选择课程</label>
              <select v-model="selectedHistoryCourse" @change="loadHistoryRecords">
                <option value="">所有课程</option>
                <option v-for="course in allCourses" :key="course.id" :value="course.id">{{ course.name }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>日期范围</label>
              <div class="date-range">
                <input type="date" v-model="startDate" @change="loadHistoryRecords">
                <span class="range-separator">至</span>
                <input type="date" v-model="endDate" @change="loadHistoryRecords">
              </div>
            </div>
            <div class="filter-group">
              <label>签到状态</label>
              <select v-model="selectedAttendanceStatus" @change="loadHistoryRecords">
                <option value="">所有状态</option>
                <option value="all_attended">全勤</option>
                <option value="partial">部分出勤</option>
                <option value="none">无人出勤</option>
              </select>
            </div>
          </div>
          <div class="filter-actions">
            <button class="action-button" @click="resetFilters">重置筛选</button>
            <button class="action-button primary" @click="exportAttendanceData">导出数据</button>
          </div>
        </div>

        <div class="history-records">
          <div class="records-header">
            <div class="header-item">课程名称</div>
            <div class="header-item">上课日期</div>
            <div class="header-item">上课时间</div>
            <div class="header-item">应到人数</div>
            <div class="header-item">已签到</div>
            <div class="header-item">出勤率</div>
            <div class="header-item">操作</div>
          </div>
          <div class="records-content">
            <div 
              v-for="record in filteredHistoryRecords" 
              :key="record.id" 
              class="record-item"
            >
              <div class="record-course">{{ record.courseName }}</div>
              <div class="record-date">{{ formatDate(record.date) }}</div>
              <div class="record-time">{{ record.time }}</div>
              <div class="record-total">{{ record.totalStudents }}</div>
              <div class="record-attended">{{ record.attendedCount }}</div>
              <div class="record-rate" :class="getAttendanceRateClass(record.attendanceRate)">
                {{ record.attendanceRate }}%
              </div>
              <div class="record-actions">
                <button class="action-button small" @click="viewAttendanceDetails(record.id)">
                  查看详情
                </button>
                <button class="action-button small" @click="exportSingleRecord(record.id)">
                  导出记录
                </button>
              </div>
            </div>
          </div>
          <div v-if="filteredHistoryRecords.length === 0" class="empty-state">
            <p>没有找到匹配的签到记录</p>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="filteredHistoryRecords.length > 0">
          <button 
            class="page-button" 
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
          >
            上一页
          </button>
          <span class="page-info">
            第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <button 
            class="page-button" 
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            下一页
          </button>
        </div>
      </div>

      <!-- 手动签到 -->
      <div v-if="activeTab === 'manual'" class="tab-content">
        <div class="manual-attendance">
          <div class="manual-form">
            <h3>手动签到</h3>
            <div class="form-group">
              <label>选择课程 <span class="required">*</span></label>
              <select v-model="manualCourseId" @change="loadCourseStudents">
                <option value="">请选择课程</option>
                <option v-for="course in allCourses" :key="course.id" :value="course.id">{{ course.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>签到日期 <span class="required">*</span></label>
              <input type="date" v-model="manualDate" :max="today">
            </div>
            <div class="form-group">
              <label>签到时间 <span class="required">*</span></label>
              <input type="time" v-model="manualTime">
            </div>
            <div class="form-group">
              <label>选择学生</label>
              <div class="students-grid">
                <div 
                  v-for="student in manualCourseStudents" 
                  :key="student.id" 
                  class="student-checkbox"
                >
                  <input 
                    type="checkbox" 
                    :id="`manual-${student.id}`" 
                    :value="student.id"
                    v-model="selectedManualStudents"
                  >
                  <label :for="`manual-${student.id}`">
                    <span class="student-name">{{ student.name }}</span>
                    <span class="student-id">({{ student.studentId }})</span>
                  </label>
                </div>
              </div>
              <div class="selection-actions">
                <button class="small-button" @click="selectAllManualStudents">全选</button>
                <button class="small-button" @click="deselectAllManualStudents">取消全选</button>
                <button class="small-button" @click="selectInvertManualStudents">反选</button>
              </div>
            </div>
            <div class="form-actions">
              <button class="action-button" @click="clearManualForm">清空</button>
              <button 
                class="action-button primary" 
                @click="confirmManualAttendance"
                :disabled="!canConfirmManual"
              >
                确认签到
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 签到详情模态框 -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content details-modal" @click.stop>
        <div class="modal-header">
          <h3>签到详情 - {{ selectedAttendanceRecord?.courseName }}</h3>
          <button class="close-button" @click="closeDetailsModal">×</button>
        </div>
        <div class="modal-body">
          <div class="details-info">
            <div class="info-row">
              <span class="info-label">日期:</span>
              <span class="info-value">{{ formatDate(selectedAttendanceRecord?.date) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">时间:</span>
              <span class="info-value">{{ selectedAttendanceRecord?.time }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">教室:</span>
              <span class="info-value">{{ selectedAttendanceRecord?.classroom }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">应到人数:</span>
              <span class="info-value">{{ selectedAttendanceRecord?.totalStudents }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">已签到:</span>
              <span class="info-value">{{ selectedAttendanceRecord?.attendedCount }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">出勤率:</span>
              <span class="info-value" :class="getAttendanceRateClass(selectedAttendanceRecord?.attendanceRate)">
                {{ selectedAttendanceRecord?.attendanceRate }}%
              </span>
            </div>
          </div>
          
          <div class="students-attendance-list">
            <h4>学生签到情况</h4>
            <div class="list-header">
              <div class="header-item">学生姓名</div>
              <div class="header-item">学号</div>
              <div class="header-item">签到状态</div>
              <div class="header-item">签到时间</div>
              <div class="header-item">备注</div>
            </div>
            <div class="list-content">
              <div 
                v-for="student in selectedAttendanceRecord?.students" 
                :key="student.id" 
                class="student-attendance-item"
              >
                <div class="student-name">{{ student.name }}</div>
                <div class="student-id">{{ student.studentId }}</div>
                <div class="attendance-status" :class="getAttendanceStatusClass(student.status)">
                  {{ getAttendanceStatusText(student.status) }}
                </div>
                <div class="attendance-time">
                  {{ student.signInTime || '-' }}
                </div>
                <div class="attendance-note">
                  <input 
                    type="text" 
                    v-model="student.note" 
                    placeholder="添加备注..."
                    @blur="updateStudentNote(student)"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-button primary" @click="exportDetailsRecord">导出记录</button>
          <button class="action-button" @click="closeDetailsModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'TeacherAttendanceManagement',
  setup() {
    const router = useRouter()
    
    // 选项卡
    const activeTab = ref('current')
    const tabs = [
      { key: 'current', label: '当前课程签到' },
      { key: 'history', label: '历史签到记录' },
      { key: 'manual', label: '手动签到' }
    ]
    
    // 今天的课程
    const todayCourses = ref([
      {
        id: 1,
        name: '数据结构',
        time: '09:00-10:30',
        classroom: 'A301',
        totalStudents: 32,
        attendedCount: 0,
        attendanceRate: 0,
        isAttending: false,
        remainingTime: '05:00'
      },
      {
        id: 2,
        name: '算法分析',
        time: '14:00-15:30',
        classroom: 'B202',
        totalStudents: 28,
        attendedCount: 0,
        attendanceRate: 0,
        isAttending: false,
        remainingTime: '05:00'
      }
    ])
    
    // 所有课程
    const allCourses = ref([
      { id: 1, name: '数据结构' },
      { id: 2, name: '算法分析' },
      { id: 3, name: '数据库原理' },
      { id: 4, name: '操作系统' },
      { id: 5, name: '计算机网络' }
    ])
    
    // 历史记录筛选
    const selectedHistoryCourse = ref('')
    const startDate = ref('')
    const endDate = ref('')
    const selectedAttendanceStatus = ref('')
    const currentPage = ref(1)
    const pageSize = 10
    
    // 历史记录数据
    const historyRecords = ref([
      { id: 101, courseId: 1, courseName: '数据结构', date: '2024-01-15', time: '09:00-10:30', classroom: 'A301', totalStudents: 32, attendedCount: 29, attendanceRate: 90.6 },
      { id: 102, courseId: 2, courseName: '算法分析', date: '2024-01-15', time: '14:00-15:30', classroom: 'B202', totalStudents: 28, attendedCount: 26, attendanceRate: 92.9 },
      { id: 103, courseId: 3, courseName: '数据库原理', date: '2024-01-16', time: '10:00-11:30', classroom: 'C101', totalStudents: 40, attendedCount: 38, attendanceRate: 95.0 },
      { id: 104, courseId: 1, courseName: '数据结构', date: '2024-01-17', time: '09:00-10:30', classroom: 'A301', totalStudents: 32, attendedCount: 31, attendanceRate: 96.9 },
      { id: 105, courseId: 4, courseName: '操作系统', date: '2024-01-17', time: '14:00-15:30', classroom: 'D203', totalStudents: 35, attendedCount: 32, attendanceRate: 91.4 },
      { id: 106, courseId: 5, courseName: '计算机网络', date: '2024-01-18', time: '10:00-11:30', classroom: 'E304', totalStudents: 30, attendedCount: 27, attendanceRate: 90.0 },
      { id: 107, courseId: 2, courseName: '算法分析', date: '2024-01-18', time: '14:00-15:30', classroom: 'B202', totalStudents: 28, attendedCount: 24, attendanceRate: 85.7 },
      { id: 108, courseId: 3, courseName: '数据库原理', date: '2024-01-19', time: '10:00-11:30', classroom: 'C101', totalStudents: 40, attendedCount: 40, attendanceRate: 100.0 },
      { id: 109, courseId: 1, courseName: '数据结构', date: '2024-01-22', time: '09:00-10:30', classroom: 'A301', totalStudents: 32, attendedCount: 28, attendanceRate: 87.5 },
      { id: 110, courseId: 4, courseName: '操作系统', date: '2024-01-22', time: '14:00-15:30', classroom: 'D203', totalStudents: 35, attendedCount: 33, attendanceRate: 94.3 },
      { id: 111, courseId: 5, courseName: '计算机网络', date: '2024-01-23', time: '10:00-11:30', classroom: 'E304', totalStudents: 30, attendedCount: 29, attendanceRate: 96.7 },
      { id: 112, courseId: 2, courseName: '算法分析', date: '2024-01-23', time: '14:00-15:30', classroom: 'B202', totalStudents: 28, attendedCount: 25, attendanceRate: 89.3 }
    ])
    
    // 手动签到
    const manualCourseId = ref('')
    const manualDate = ref('')
    const manualTime = ref('')
    const selectedManualStudents = ref([])
    const manualCourseStudents = ref([])
    
    // 详情模态框
    const showDetailsModal = ref(false)
    const selectedAttendanceRecord = ref(null)
    
    // 获取今天的日期
    const today = computed(() => {
      return new Date().toISOString().split('T')[0]
    })
    
    // 过滤历史记录
    const filteredHistoryRecords = computed(() => {
      let filtered = historyRecords.value
      
      if (selectedHistoryCourse.value) {
        filtered = filtered.filter(record => record.courseId === parseInt(selectedHistoryCourse.value))
      }
      
      if (startDate.value) {
        filtered = filtered.filter(record => record.date >= startDate.value)
      }
      
      if (endDate.value) {
        filtered = filtered.filter(record => record.date <= endDate.value)
      }
      
      if (selectedAttendanceStatus.value) {
        switch (selectedAttendanceStatus.value) {
          case 'all_attended':
            filtered = filtered.filter(record => record.attendanceRate === 100)
            break
          case 'partial':
            filtered = filtered.filter(record => record.attendanceRate > 0 && record.attendanceRate < 100)
            break
          case 'none':
            filtered = filtered.filter(record => record.attendanceRate === 0)
            break
        }
      }
      
      // 按日期降序排序
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      // 分页
      const start = (currentPage.value - 1) * pageSize
      const end = start + pageSize
      return filtered.slice(start, end)
    })
    
    // 总页数
    const totalPages = computed(() => {
      const filtered = historyRecords.value.filter(record => {
        let match = true
        if (selectedHistoryCourse.value) match = match && record.courseId === parseInt(selectedHistoryCourse.value)
        if (startDate.value) match = match && record.date >= startDate.value
        if (endDate.value) match = match && record.date <= endDate.value
        if (selectedAttendanceStatus.value) {
          switch (selectedAttendanceStatus.value) {
            case 'all_attended':
              match = match && record.attendanceRate === 100
              break
            case 'partial':
              match = match && record.attendanceRate > 0 && record.attendanceRate < 100
              break
            case 'none':
              match = match && record.attendanceRate === 0
              break
          }
        }
        return match
      })
      return Math.ceil(filtered.length / pageSize)
    })
    
    // 获取出勤率样式类
    const getAttendanceRateClass = (rate) => {
      if (rate >= 90) return 'rate-excellent'
      if (rate >= 70) return 'rate-good'
      if (rate >= 50) return 'rate-average'
      return 'rate-poor'
    }
    
    // 获取签到状态样式类
    const getAttendanceStatusClass = (status) => {
      switch (status) {
        case 'attended': return 'status-attended'
        case 'late': return 'status-late'
        case 'absent': return 'status-absent'
        default: return ''
      }
    }
    
    // 获取签到状态文本
    const getAttendanceStatusText = (status) => {
      switch (status) {
        case 'attended': return '已签到'
        case 'late': return '迟到'
        case 'absent': return '缺席'
        default: return '未知'
      }
    }
    
    // 开始签到
    const startAttendance = (course) => {
      const courseIndex = todayCourses.value.findIndex(c => c.id === course.id)
      if (courseIndex !== -1) {
        todayCourses.value[courseIndex].isAttending = true
        todayCourses.value[courseIndex].remainingTime = '05:00'
        
        // 模拟倒计时（实际项目中应使用定时器）
        setTimeout(() => {
          todayCourses.value[courseIndex].isAttending = false
          todayCourses.value[courseIndex].attendedCount = Math.floor(course.totalStudents * 0.85)
          todayCourses.value[courseIndex].attendanceRate = Math.round((todayCourses.value[courseIndex].attendedCount / course.totalStudents) * 100 * 10) / 10
        }, 300000) // 5分钟后自动结束
      }
    }
    
    // 加载历史记录
    const loadHistoryRecords = () => {
      currentPage.value = 1
    }
    
    // 重置筛选
    const resetFilters = () => {
      selectedHistoryCourse.value = ''
      startDate.value = ''
      endDate.value = ''
      selectedAttendanceStatus.value = ''
      currentPage.value = 1
    }
    
    // 导出数据
    const exportAttendanceData = () => {
      alert('导出功能开发中...')
    }
    
    // 导出单条记录
    const exportSingleRecord = (recordId) => {
      alert('导出单条记录功能开发中...')
    }
    
    // 加载课程学生
    const loadCourseStudents = () => {
      selectedManualStudents.value = []
      if (manualCourseId.value) {
        // 模拟数据
        manualCourseStudents.value = [
          { id: 1, name: '张三', studentId: '20210001' },
          { id: 2, name: '李四', studentId: '20210002' },
          { id: 3, name: '王五', studentId: '20210003' },
          { id: 4, name: '赵六', studentId: '20210004' },
          { id: 5, name: '钱七', studentId: '20210005' }
        ]
      } else {
        manualCourseStudents.value = []
      }
    }
    
    // 全选
    const selectAllManualStudents = () => {
      selectedManualStudents.value = manualCourseStudents.value.map(s => s.id)
    }
    
    // 取消全选
    const deselectAllManualStudents = () => {
      selectedManualStudents.value = []
    }
    
    // 反选
    const selectInvertManualStudents = () => {
      const currentSet = new Set(selectedManualStudents.value)
      selectedManualStudents.value = manualCourseStudents.value
        .filter(s => !currentSet.has(s.id))
        .map(s => s.id)
    }
    
    // 清空手动签到表单
    const clearManualForm = () => {
      manualCourseId.value = ''
      manualDate.value = ''
      manualTime.value = ''
      selectedManualStudents.value = []
      manualCourseStudents.value = []
    }
    
    // 是否可以确认手动签到
    const canConfirmManual = computed(() => {
      return manualCourseId.value && manualDate.value && manualTime.value && selectedManualStudents.value.length > 0
    })
    
    // 确认手动签到
    const confirmManualAttendance = () => {
      if (!canConfirmManual.value) return
      
      alert(`成功为 ${selectedManualStudents.value.length} 名学生完成手动签到`)
      clearManualForm()
    }
    
    // 查看签到详情
    const viewAttendanceDetails = (recordId) => {
      // 查找记录
      const record = historyRecords.value.find(r => r.id === recordId)
      if (record) {
        // 模拟学生签到数据
        const students = []
        for (let i = 1; i <= record.totalStudents; i++) {
          const isAttended = i <= record.attendedCount
          students.push({
            id: i,
            name: `学生${i}`,
            studentId: `202100${String(i).padStart(2, '0')}`,
            status: isAttended ? 'attended' : 'absent',
            signInTime: isAttended ? `${record.time.split('-')[0]}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` : null,
            note: ''
          })
        }
        
        selectedAttendanceRecord.value = {
          ...record,
          students
        }
        showDetailsModal.value = true
      }
    }
    
    // 关闭详情模态框
    const closeDetailsModal = () => {
      showDetailsModal.value = false
      selectedAttendanceRecord.value = null
    }
    
    // 更新学生备注
    const updateStudentNote = (student) => {
      // 在实际项目中，这里应该调用API保存备注
      console.log(`更新学生 ${student.name} 的备注: ${student.note}`)
    }
    
    // 导出详情记录
    const exportDetailsRecord = () => {
      alert('导出详情记录功能开发中...')
    }
    
    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    
    const goBack = () => {
      router.push('/home/teacher/dashboard')
    }
    
    onMounted(() => {
      // 初始化认证信息
      if (!localStorage.getItem('userToken')) {
        localStorage.setItem('userToken', 'mock-token-teacher-789')
        localStorage.setItem('userRole', 'teacher')
      }
      
      // 设置默认日期为今天
      manualDate.value = today.value
    })
    
    return {
      activeTab,
      tabs,
      todayCourses,
      allCourses,
      selectedHistoryCourse,
      startDate,
      endDate,
      selectedAttendanceStatus,
      currentPage,
      filteredHistoryRecords,
      totalPages,
      manualCourseId,
      manualDate,
      manualTime,
      selectedManualStudents,
      manualCourseStudents,
      canConfirmManual,
      showDetailsModal,
      selectedAttendanceRecord,
      today,
      getAttendanceRateClass,
      getAttendanceStatusClass,
      getAttendanceStatusText,
      startAttendance,
      loadHistoryRecords,
      resetFilters,
      exportAttendanceData,
      exportSingleRecord,
      loadCourseStudents,
      selectAllManualStudents,
      deselectAllManualStudents,
      selectInvertManualStudents,
      clearManualForm,
      confirmManualAttendance,
      viewAttendanceDetails,
      closeDetailsModal,
      updateStudentNote,
      exportDetailsRecord,
      formatDate,
      goBack
    }
  }
}
</script>

<style scoped>
.teacher-attendance-management {
  padding: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 0 10px;
}

.back-button {
  padding: 10px 20px;
  background-color: #f0f2f5;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #e0e2e5;
}

.page-header h2 {
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.attendance-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 选项卡 */
.tabs {
  display: flex;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tab {
  flex: 1;
  padding: 16px 24px;
  border: none;
  background-color: transparent;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
}

.tab:hover {
  color: #333;
  background-color: #f8f9fa;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background-color: #f8f9ff;
}

.tab-content {
  min-height: 400px;
}

/* 当前课程 */
.current-courses {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 20px;
}

.course-card {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.course-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.course-time {
  padding: 6px 12px;
  background-color: #f0f2f5;
  border-radius: 16px;
  font-size: 14px;
  color: #666;
}

.course-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item .label {
  font-size: 13px;
  color: #999;
}

.info-item .value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.course-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

/* 签到二维码 */
.attendance-qr {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;
  text-align: center;
}

.qr-code {
  margin: 0 auto 15px;
  width: 200px;
  height: 200px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.qr-code img {
  max-width: 180px;
  max-height: 180px;
}

.qr-info {
  font-size: 14px;
  color: #666;
}

.countdown {
  margin-top: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
}

/* 历史记录 */
.history-filters {
  background-color: white;
  border-radius: 12px;
  padding: 20px 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.filter-group select,
.filter-group input {
  padding: 10px 12px;
  border: 1px solid #e0e2e5;
  border-radius: 6px;
  font-size: 14px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-separator {
  color: #999;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 历史记录列表 */
.history-records {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.records-header,
.records-content .record-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr;
  padding: 15px 20px;
}

.records-header {
  background-color: #f8f9fa;
  border-bottom: 2px solid #e0e2e5;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.record-item {
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.2s ease;
}

.record-item:hover {
  background-color: #f8f9fa;
}

.record-item:last-child {
  border-bottom: none;
}

.record-actions {
  display: flex;
  gap: 8px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.page-button {
  padding: 8px 16px;
  border: 1px solid #e0e2e5;
  background-color: white;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-button:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

/* 手动签到 */
.manual-attendance {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.manual-form h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 25px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.required {
  color: #f44336;
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e2e5;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
}

.student-checkbox {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.student-checkbox:hover {
  background-color: #f8f9fa;
}

.student-checkbox input {
  margin-right: 8px;
}

.student-checkbox label {
  font-size: 13px;
  color: #333;
  cursor: pointer;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}

.student-checkbox .student-id {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.selection-actions {
  display: flex;
  gap: 8px;
}

.small-button {
  padding: 6px 12px;
  background-color: #f0f2f5;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.small-button:hover {
  background-color: #e0e2e5;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

/* 详情模态框 */
.modal-overlay {
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
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.details-modal {
  max-width: 1000px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 1px solid #f0f2f5;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-button {
  width: 30px;
  height: 30px;
  border: none;
  background-color: transparent;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #f0f2f5;
  color: #333;
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 25px;
  border-top: 1px solid #f0f2f5;
}

/* 详情信息 */
.details-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* 学生签到列表 */
.students-attendance-list h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
}

.list-header {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1.5fr;
  padding: 12px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.list-content {
  max-height: 400px;
  overflow-y: auto;
}

.student-attendance-item {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr 1.5fr;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f2f5;
  align-items: center;
  font-size: 14px;
}

.student-attendance-item:last-child {
  border-bottom: none;
}

.attendance-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-attended {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-late {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status-absent {
  background-color: #ffebee;
  color: #c62828;
}

.attendance-note input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #e0e2e5;
  border-radius: 4px;
  font-size: 13px;
}

/* 按钮样式 */
.action-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.primary {
  background-color: #667eea;
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  background-color: #5a67d8;
  transform: translateY(-1px);
}

.action-button.small {
  padding: 8px 16px;
  font-size: 14px;
}

/* 出勤率样式 */
.rate-excellent {
  color: #2e7d32;
  font-weight: 600;
}

.rate-good {
  color: #388e3c;
  font-weight: 600;
}

.rate-average {
  color: #f57c00;
  font-weight: 600;
}

.rate-poor {
  color: #c62828;
  font-weight: 600;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .current-courses {
    grid-template-columns: 1fr;
  }
  
  .course-info {
    grid-template-columns: 1fr;
  }
  
  .course-actions {
    flex-direction: column;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .filter-actions {
    flex-direction: column;
  }
  
  .records-header,
  .record-item {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .record-actions {
    justify-content: center;
  }
  
  .students-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .list-header,
  .student-attendance-item {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .tabs {
    flex-direction: column;
  }
  
  .tab {
    border-bottom: 1px solid #f0f2f5;
  }
  
  .tab:last-child {
    border-bottom: none;
  }
  
  .date-range {
    flex-direction: column;
  }
  
  .selection-actions {
    flex-wrap: wrap;
  }
}
</style>