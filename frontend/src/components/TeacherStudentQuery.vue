<template>
  <div class="teacher-student-query">
    <div class="page-header">
      <button class="back-button" @click="goBack">← 返回仪表盘</button>
      <h2>学员信息查询</h2>
    </div>

    <div class="query-container">
      <!-- 搜索和筛选区域 -->
      <div class="search-filter-section">
        <div class="search-controls">
          <div class="search-input-wrapper">
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="debouncedSearch"
              placeholder="搜索学员姓名/ID/手机号"
              class="search-input"
            >
            <div class="search-icon">🔍</div>
          </div>
          
          <div class="filter-dropdowns">
            <select v-model="selectedCourse" @change="applyFilters" class="filter-select">
              <option value="all">所有课程</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.name }}
              </option>
            </select>
            
            <select v-model="selectedLevel" @change="applyFilters" class="filter-select">
              <option value="all">所有等级</option>
              <option value="vip">VIP学员</option>
              <option value="senior">高级学员</option>
              <option value="intermediate">中级学员</option>
              <option value="beginner">初级学员</option>
            </select>
            
            <select v-model="selectedStatus" @change="applyFilters" class="filter-select">
              <option value="all">所有状态</option>
              <option value="active">活跃</option>
              <option value="inactive">不活跃</option>
              <option value="graduated">已毕业</option>
            </select>
          </div>
          
          <div class="action-buttons">
            <button class="action-button" @click="resetFilters">重置筛选</button>
            <button class="action-button primary" @click="exportStudentData">导出数据</button>
          </div>
        </div>
        
        <!-- 高级筛选面板 -->
        <div class="advanced-filters" v-if="showAdvancedFilters">
          <div class="filter-grid">
            <div class="filter-item">
              <label>剩余课时范围</label>
              <div class="range-inputs">
                <input type="number" v-model="minRemainingHours" placeholder="最小值">
                <span>至</span>
                <input type="number" v-model="maxRemainingHours" placeholder="最大值">
              </div>
            </div>
            
            <div class="filter-item">
              <label>注册日期</label>
              <div class="date-inputs">
                <input type="date" v-model="registerStartDate">
                <span>至</span>
                <input type="date" v-model="registerEndDate">
              </div>
            </div>
            
            <div class="filter-item">
              <label>最近上课日期</label>
              <div class="date-inputs">
                <input type="date" v-model="lastClassStartDate">
                <span>至</span>
                <input type="date" v-model="lastClassEndDate">
              </div>
            </div>
            
            <div class="filter-item">
              <label>学员标签</label>
              <div class="tag-selector">
                <label 
                  v-for="tag in availableTags" 
                  :key="tag"
                  class="tag-option"
                >
                  <input 
                    type="checkbox" 
                    :value="tag" 
                    v-model="selectedTags"
                    @change="applyFilters"
                  >
                  <span class="tag-text">{{ tag }}</span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="advanced-actions">
            <button class="action-button secondary" @click="applyFilters">应用筛选</button>
          </div>
        </div>
        
        <button class="advanced-filter-toggle" @click="toggleAdvancedFilters">
          {{ showAdvancedFilters ? '收起高级筛选' : '展开高级筛选' }}
        </button>
      </div>

      <!-- 统计概览 -->
      <div class="statistics-overview">
        <div class="stat-item">
          <div class="stat-value">{{ totalStudents }}</div>
          <div class="stat-label">总学员数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ activeStudents }}</div>
          <div class="stat-label">活跃学员</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalRemainingHours }}</div>
          <div class="stat-label">总剩余课时</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ avgRemainingHours }}</div>
          <div class="stat-label">平均剩余课时</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ vipStudents }}</div>
          <div class="stat-label">VIP学员</div>
        </div>
      </div>

      <!-- 学员列表 -->
      <div class="students-list">
        <div class="list-header">
          <div class="header-info">
            <h3>学员列表</h3>
            <span class="result-count">共 {{ filteredStudents.length }} 条结果</span>
          </div>
          
          <div class="sort-controls">
            <label>排序方式：</label>
            <select v-model="sortBy" @change="sortStudents" class="sort-select">
              <option value="name">按姓名</option>
              <option value="studentId">按学号</option>
              <option value="remainingHours">按剩余课时</option>
              <option value="lastClassDate">按最近上课</option>
              <option value="registerDate">按注册日期</option>
            </select>
            
            <button class="sort-order-button" @click="toggleSortOrder">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>
        
        <!-- 列表视图或卡片视图 -->
        <div class="view-toggle">
          <button 
            :class="['view-button', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            列表视图
          </button>
          <button 
            :class="['view-button', { active: viewMode === 'cards' }]"
            @click="viewMode = 'cards'"
          >
            卡片视图
          </button>
        </div>

        <!-- 列表视图 -->
        <div v-if="viewMode === 'list'" class="students-table">
          <div class="table-header">
            <div class="header-cell">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
            </div>
            <div class="header-cell">学员信息</div>
            <div class="header-cell">学员ID</div>
            <div class="header-cell">等级</div>
            <div class="header-cell">课程</div>
            <div class="header-cell">剩余课时</div>
            <div class="header-cell">最后上课</div>
            <div class="header-cell">注册日期</div>
            <div class="header-cell">状态</div>
            <div class="header-cell">操作</div>
          </div>
          
          <div class="table-body">
            <div 
              v-for="student in paginatedStudents" 
              :key="student.id"
              class="table-row"
              :class="{ 'selected': selectedStudents.includes(student.id) }"
            >
              <div class="table-cell">
                <input 
                  type="checkbox" 
                  :value="student.id" 
                  v-model="selectedStudents"
                >
              </div>
              <div class="table-cell">
                <div class="student-basic-info">
                  <div class="student-avatar" :style="{ backgroundColor: getAvatarColor(student.name) }">
                    {{ getInitial(student.name) }}
                  </div>
                  <div class="student-name-info">
                    <div class="student-name">{{ student.name }}</div>
                    <div class="student-phone">{{ student.phone }}</div>
                  </div>
                </div>
              </div>
              <div class="table-cell">{{ student.studentId }}</div>
              <div class="table-cell">
                <span class="level-badge" :class="`level-${student.level.toLowerCase()}`">
                  {{ student.level }}
                </span>
              </div>
              <div class="table-cell">
                <div 
                  v-for="(course, index) in student.courses.slice(0, 2)" 
                  :key="course.id"
                  class="course-tag"
                >
                  {{ course.name }}
                </div>
                <div v-if="student.courses.length > 2" class="more-courses">
                  +{{ student.courses.length - 2 }} 更多
                </div>
              </div>
              <div class="table-cell">
                <div class="remaining-hours">
                  <span class="hours-value">{{ student.remainingHours }}</span>
                  <span class="hours-label">课时</span>
                </div>
              </div>
              <div class="table-cell">{{ formatDate(student.lastClassDate) }}</div>
              <div class="table-cell">{{ formatDate(student.registerDate) }}</div>
              <div class="table-cell">
                <span class="status-badge" :class="`status-${student.status}`">
                  {{ getStatusText(student.status) }}
                </span>
              </div>
              <div class="table-cell">
                <div class="action-buttons-group">
                  <button class="action-button small" @click="viewStudentProfile(student.id)">
                    查看
                  </button>
                  <button class="action-button small" @click="viewStudentAttendance(student.id)">
                    出勤
                  </button>
                  <button class="action-button small" @click="contactStudent(student.id)">
                    联系
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div class="pagination">
            <div class="page-info">
              显示 {{ Math.min((currentPage - 1) * pageSize + 1, filteredStudents.length) }} - 
              {{ Math.min(currentPage * pageSize, filteredStudents.length) }} 条，共 {{ filteredStudents.length }} 条
            </div>
            <div class="page-controls">
              <button 
                class="page-button" 
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                上一页
              </button>
              <button 
                v-for="page in visiblePages" 
                :key="page"
                class="page-button" 
                :class="{ active: page === currentPage }"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button 
                class="page-button" 
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                下一页
              </button>
            </div>
          </div>
        </div>

        <!-- 卡片视图 -->
        <div v-else class="students-cards">
          <div 
            v-for="student in paginatedStudents" 
            :key="student.id"
            class="student-card"
            :class="{ 'selected': selectedStudents.includes(student.id) }"
          >
            <div class="card-header">
              <div class="student-avatar-large" :style="{ backgroundColor: getAvatarColor(student.name) }">
                {{ getInitial(student.name) }}
              </div>
              <div class="student-card-header-info">
                <div class="student-name-large">{{ student.name }}</div>
                <div class="student-id-large">ID: {{ student.studentId }}</div>
              </div>
              <div class="card-header-actions">
                <input 
                  type="checkbox" 
                  :value="student.id" 
                  v-model="selectedStudents"
                  class="card-checkbox"
                >
              </div>
            </div>
            
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">电话</span>
                  <span class="info-value">{{ student.phone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">等级</span>
                  <span class="level-badge" :class="`level-${student.level.toLowerCase()}`">
                    {{ student.level }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">状态</span>
                  <span class="status-badge" :class="`status-${student.status}`">
                    {{ getStatusText(student.status) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">剩余课时</span>
                  <span class="hours-badge">{{ student.remainingHours }}课时</span>
                </div>
              </div>
              
              <div class="courses-section">
                <h4 class="section-title">已报名课程</h4>
                <div class="courses-list">
                  <div 
                    v-for="course in student.courses" 
                    :key="course.id"
                    class="course-item"
                  >
                    <div class="course-name">{{ course.name }}</div>
                    <div class="course-progress">
                      <div class="progress-bar">
                        <div 
                          class="progress-fill" 
                          :style="{ width: course.progress + '%' }"
                        ></div>
                      </div>
                      <span class="progress-text">{{ course.progress }}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="dates-section">
                <div class="date-item">
                  <span class="date-label">最后上课：</span>
                  <span class="date-value">{{ formatDate(student.lastClassDate) }}</span>
                </div>
                <div class="date-item">
                  <span class="date-label">注册日期：</span>
                  <span class="date-value">{{ formatDate(student.registerDate) }}</span>
                </div>
              </div>
              
              <div class="tags-section" v-if="student.tags.length > 0">
                <span 
                  v-for="tag in student.tags" 
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="card-actions">
                <button class="action-button small primary" @click="viewStudentProfile(student.id)">
                  查看详情
                </button>
                <button class="action-button small" @click="viewStudentAttendance(student.id)">
                  出勤记录
                </button>
                <button class="action-button small" @click="contactStudent(student.id)">
                  联系学员
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 批量操作面板 -->
      <div class="batch-operations" v-if="selectedStudents.length > 0">
        <div class="selected-info">
          已选择 {{ selectedStudents.length }} 名学员
        </div>
        <div class="batch-actions">
          <button class="action-button" @click="batchContact">批量联系</button>
          <button class="action-button" @click="exportSelected">导出选中</button>
          <button class="action-button danger" @click="clearSelection">取消选择</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'TeacherStudentQuery',
  setup() {
    const router = useRouter()
    
    // 搜索和筛选
    const searchQuery = ref('')
    const selectedCourse = ref('all')
    const selectedLevel = ref('all')
    const selectedStatus = ref('all')
    const showAdvancedFilters = ref(false)
    const minRemainingHours = ref('')
    const maxRemainingHours = ref('')
    const registerStartDate = ref('')
    const registerEndDate = ref('')
    const lastClassStartDate = ref('')
    const lastClassEndDate = ref('')
    const availableTags = ref(['优秀学员', '进步明显', '需重点关注', '经常请假', '按时完成作业'])
    const selectedTags = ref([])
    
    // 排序和分页
    const sortBy = ref('name')
    const sortOrder = ref('asc')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const viewMode = ref('list')
    
    // 多选
    const selectedStudents = ref([])
    const selectAll = ref(false)
    
    // 课程数据
    const courses = ref([
      { id: 1, name: '数据结构', code: 'CS201' },
      { id: 2, name: '算法分析', code: 'CS202' },
      { id: 3, name: '数据库原理', code: 'CS203' },
      { id: 4, name: '操作系统', code: 'CS301' },
      { id: 5, name: '计算机网络', code: 'CS302' }
    ])
    
    // 学员数据
    const students = ref([
      {
        id: 1,
        name: '张三',
        studentId: '2023001',
        phone: '13800138001',
        level: 'VIP',
        status: 'active',
        remainingHours: 45,
        lastClassDate: '2024-01-20',
        registerDate: '2023-01-15',
        tags: ['优秀学员'],
        courses: [
          { id: 1, name: '数据结构', progress: 80 },
          { id: 2, name: '算法分析', progress: 65 }
        ]
      },
      {
        id: 2,
        name: '李四',
        studentId: '2023002',
        phone: '13800138002',
        level: '高级',
        status: 'active',
        remainingHours: 30,
        lastClassDate: '2024-01-19',
        registerDate: '2023-02-20',
        tags: ['进步明显'],
        courses: [
          { id: 2, name: '算法分析', progress: 90 },
          { id: 3, name: '数据库原理', progress: 70 }
        ]
      },
      {
        id: 3,
        name: '王五',
        studentId: '2023003',
        phone: '13800138003',
        level: '中级',
        status: 'inactive',
        remainingHours: 20,
        lastClassDate: '2024-01-10',
        registerDate: '2023-03-10',
        tags: ['需重点关注'],
        courses: [
          { id: 1, name: '数据结构', progress: 50 },
          { id: 3, name: '数据库原理', progress: 40 }
        ]
      },
      {
        id: 4,
        name: '赵六',
        studentId: '2023004',
        phone: '13800138004',
        level: 'VIP',
        status: 'active',
        remainingHours: 60,
        lastClassDate: '2024-01-21',
        registerDate: '2023-01-05',
        tags: ['优秀学员', '按时完成作业'],
        courses: [
          { id: 4, name: '操作系统', progress: 85 },
          { id: 5, name: '计算机网络', progress: 75 }
        ]
      },
      {
        id: 5,
        name: '孙七',
        studentId: '2023005',
        phone: '13800138005',
        level: '初级',
        status: 'active',
        remainingHours: 15,
        lastClassDate: '2024-01-18',
        registerDate: '2023-04-15',
        tags: [],
        courses: [
          { id: 1, name: '数据结构', progress: 30 }
        ]
      },
      {
        id: 6,
        name: '周八',
        studentId: '2023006',
        phone: '13800138006',
        level: '高级',
        status: 'inactive',
        remainingHours: 5,
        lastClassDate: '2024-01-05',
        registerDate: '2023-02-10',
        tags: ['经常请假'],
        courses: [
          { id: 2, name: '算法分析', progress: 60 },
          { id: 4, name: '操作系统', progress: 55 }
        ]
      },
      {
        id: 7,
        name: '吴九',
        studentId: '2023007',
        phone: '13800138007',
        level: '中级',
        status: 'active',
        remainingHours: 35,
        lastClassDate: '2024-01-20',
        registerDate: '2023-03-20',
        tags: ['进步明显'],
        courses: [
          { id: 3, name: '数据库原理', progress: 75 },
          { id: 5, name: '计算机网络', progress: 65 }
        ]
      },
      {
        id: 8,
        name: '郑十',
        studentId: '2023008',
        phone: '13800138008',
        level: 'VIP',
        status: 'graduated',
        remainingHours: 0,
        lastClassDate: '2024-01-15',
        registerDate: '2022-12-01',
        tags: ['优秀学员'],
        courses: [
          { id: 1, name: '数据结构', progress: 100 },
          { id: 2, name: '算法分析', progress: 100 },
          { id: 3, name: '数据库原理', progress: 100 }
        ]
      }
    ])
    
    // 计算属性
    const filteredStudents = computed(() => {
      let result = [...students.value]
      
      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(student => 
          student.name.toLowerCase().includes(query) ||
          student.studentId.toLowerCase().includes(query) ||
          student.phone.includes(query)
        )
      }
      
      // 课程过滤
      if (selectedCourse.value !== 'all') {
        result = result.filter(student => 
          student.courses.some(course => course.id === parseInt(selectedCourse.value))
        )
      }
      
      // 等级过滤
      if (selectedLevel.value !== 'all') {
        const levelMap = {
          vip: 'VIP',
          senior: '高级',
          intermediate: '中级',
          beginner: '初级'
        }
        result = result.filter(student => student.level === levelMap[selectedLevel.value])
      }
      
      // 状态过滤
      if (selectedStatus.value !== 'all') {
        result = result.filter(student => student.status === selectedStatus.value)
      }
      
      // 剩余课时过滤
      if (minRemainingHours.value !== '') {
        result = result.filter(student => student.remainingHours >= parseInt(minRemainingHours.value))
      }
      if (maxRemainingHours.value !== '') {
        result = result.filter(student => student.remainingHours <= parseInt(maxRemainingHours.value))
      }
      
      // 注册日期过滤
      if (registerStartDate.value) {
        result = result.filter(student => student.registerDate >= registerStartDate.value)
      }
      if (registerEndDate.value) {
        result = result.filter(student => student.registerDate <= registerEndDate.value)
      }
      
      // 最后上课日期过滤
      if (lastClassStartDate.value) {
        result = result.filter(student => student.lastClassDate >= lastClassStartDate.value)
      }
      if (lastClassEndDate.value) {
        result = result.filter(student => student.lastClassDate <= lastClassEndDate.value)
      }
      
      // 标签过滤
      if (selectedTags.value.length > 0) {
        result = result.filter(student => 
          selectedTags.value.some(tag => student.tags.includes(tag))
        )
      }
      
      return result
    })
    
    // 排序后的学员列表
    const sortedStudents = computed(() => {
      const students = [...filteredStudents.value]
      
      students.sort((a, b) => {
        let aValue, bValue
        
        switch (sortBy.value) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'studentId':
            aValue = a.studentId;
            bValue = b.studentId;
            break;
          case 'remainingHours':
            aValue = a.remainingHours;
            bValue = b.remainingHours;
            break;
          case 'lastClassDate':
            aValue = a.lastClassDate;
            bValue = b.lastClassDate;
            break;
          case 'registerDate':
            aValue = a.registerDate;
            bValue = b.registerDate;
            break;
          default:
            return 0;
        }
        
        if (sortOrder.value === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      })
      
      return students
    })
    
    // 分页学员列表
    const paginatedStudents = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return sortedStudents.value.slice(start, end)
    })
    
    // 总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredStudents.value.length / pageSize.value)
    })
    
    // 可见页码
    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      
      // 显示当前页前后3页
      for (let i = Math.max(1, current - 3); i <= Math.min(total, current + 3); i++) {
        pages.push(i)
      }
      
      return pages
    })
    
    // 统计数据
    const totalStudents = computed(() => students.value.length)
    const activeStudents = computed(() => students.value.filter(s => s.status === 'active').length)
    const totalRemainingHours = computed(() => students.value.reduce((sum, s) => sum + s.remainingHours, 0))
    const avgRemainingHours = computed(() => totalStudents.value > 0 ? Math.round(totalRemainingHours.value / totalStudents.value) : 0)
    const vipStudents = computed(() => students.value.filter(s => s.level === 'VIP').length)
    
    // 防抖搜索
    let searchTimeout = null
    const debouncedSearch = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      searchTimeout = setTimeout(() => {
        applyFilters()
      }, 300)
    }
    
    // 应用筛选
    const applyFilters = () => {
      currentPage.value = 1
      selectAll.value = false
      selectedStudents.value = []
    }
    
    // 重置筛选
    const resetFilters = () => {
      searchQuery.value = ''
      selectedCourse.value = 'all'
      selectedLevel.value = 'all'
      selectedStatus.value = 'all'
      minRemainingHours.value = ''
      maxRemainingHours.value = ''
      registerStartDate.value = ''
      registerEndDate.value = ''
      lastClassStartDate.value = ''
      lastClassEndDate.value = ''
      selectedTags.value = []
      currentPage.value = 1
      selectAll.value = false
      selectedStudents.value = []
    }
    
    // 切换高级筛选
    const toggleAdvancedFilters = () => {
      showAdvancedFilters.value = !showAdvancedFilters.value
    }
    
    // 切换排序顺序
    const toggleSortOrder = () => {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    }
    
    // 排序学员
    const sortStudents = () => {
      currentPage.value = 1
    }
    
    // 全选/取消全选
    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedStudents.value = sortedStudents.value.map(s => s.id)
      } else {
        selectedStudents.value = []
      }
    }
    
    // 清除选择
    const clearSelection = () => {
      selectedStudents.value = []
      selectAll.value = false
    }
    
    // 导出数据
    const exportStudentData = () => {
      alert('导出所有学员数据功能开发中...')
    }
    
    // 导出选中
    const exportSelected = () => {
      alert(`导出选中 ${selectedStudents.value.length} 名学员数据功能开发中...`)
    }
    
    // 批量联系
    const batchContact = () => {
      alert(`批量联系 ${selectedStudents.value.length} 名学员功能开发中...`)
    }
    
    // 查看学员详情
    const viewStudentProfile = (studentId) => {
      router.push(`/home/teacher/student-details?id=${studentId}`)
    }
    
    // 查看学员出勤
    const viewStudentAttendance = (studentId) => {
      router.push(`/home/teacher/attendance-management?studentId=${studentId}`)
    }
    
    // 联系学员
    const contactStudent = (studentId) => {
      const student = students.value.find(s => s.id === studentId)
      if (student) {
        alert(`联系学员 ${student.name} (${student.phone}) 功能开发中...`)
      }
    }
    
    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const map = {
        active: '活跃',
        inactive: '不活跃',
        graduated: '已毕业'
      }
      return map[status] || '未知'
    }
    
    // 获取头像颜色
    const getAvatarColor = (name) => {
      const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#00f5d4', '#43e97b',
        '#38f9d7', '#fb7185', '#34d399', '#60a5fa'
      ]
      const index = name.charCodeAt(0) % colors.length
      return colors[index]
    }
    
    // 获取姓名首字母
    const getInitial = (name) => {
      return name.charAt(0)
    }
    
    // 监听选中状态变化
    watch(selectedStudents, (newSelected) => {
      if (newSelected.length === sortedStudents.value.length && sortedStudents.value.length > 0) {
        selectAll.value = true
      } else {
        selectAll.value = false
      }
    })
    
    const goBack = () => {
      router.push('/home/teacher/dashboard')
    }
    
    onMounted(() => {
      // 初始化认证信息
      if (!localStorage.getItem('userToken')) {
        localStorage.setItem('userToken', 'mock-token-teacher-789')
        localStorage.setItem('userRole', 'teacher')
      }
    })
    
    return {
      searchQuery,
      selectedCourse,
      selectedLevel,
      selectedStatus,
      showAdvancedFilters,
      minRemainingHours,
      maxRemainingHours,
      registerStartDate,
      registerEndDate,
      lastClassStartDate,
      lastClassEndDate,
      availableTags,
      selectedTags,
      sortBy,
      sortOrder,
      currentPage,
      pageSize,
      viewMode,
      selectedStudents,
      selectAll,
      courses,
      students,
      filteredStudents,
      sortedStudents,
      paginatedStudents,
      totalPages,
      visiblePages,
      totalStudents,
      activeStudents,
      totalRemainingHours,
      avgRemainingHours,
      vipStudents,
      debouncedSearch,
      applyFilters,
      resetFilters,
      toggleAdvancedFilters,
      toggleSortOrder,
      sortStudents,
      toggleSelectAll,
      clearSelection,
      exportStudentData,
      exportSelected,
      batchContact,
      viewStudentProfile,
      viewStudentAttendance,
      contactStudent,
      formatDate,
      getStatusText,
      getAvatarColor,
      getInitial,
      goBack
    }
  }
}
</script>

<style scoped>
.teacher-student-query {
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

.query-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 搜索和筛选区域 */
.search-filter-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 20px;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 50px 12px 20px;
  border: 1px solid #e0e2e5;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-icon {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #999;
}

.filter-dropdowns {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #e0e2e5;
  border-radius: 8px;
  font-size: 16px;
  min-width: 150px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.advanced-filters {
  border-top: 1px solid #e0e2e5;
  padding-top: 20px;
  margin-bottom: 20px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.range-inputs,
.date-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-inputs input,
.date-inputs input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e2e5;
  border-radius: 6px;
  font-size: 14px;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.tag-text {
  font-size: 14px;
  color: #666;
}

.advanced-actions {
  text-align: right;
}

.advanced-filter-toggle {
  width: 100%;
  padding: 12px;
  background-color: #f8f9fa;
  border: 1px solid #e0e2e5;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.advanced-filter-toggle:hover {
  background-color: #e9ecef;
}

/* 统计概览 */
.statistics-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

/* 学员列表 */
.students-list {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
}

.result-count {
  font-size: 14px;
  color: #666;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-controls label {
  font-size: 14px;
  color: #666;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e0e2e5;
  border-radius: 6px;
  font-size: 14px;
}

.sort-order-button {
  width: 36px;
  height: 36px;
  border: 1px solid #e0e2e5;
  background-color: white;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.view-button {
  padding: 10px 20px;
  border: 1px solid #e0e2e5;
  background-color: white;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-button.active {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}

/* 表格样式 */
.students-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 40px 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 40px 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f2f5;
  align-items: center;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.selected {
  background-color: #edf2f7;
}

/* 学员基本信息 */
.student-basic-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
}

.student-name-info .student-name {
  font-weight: 600;
  color: #333;
}

.student-name-info .student-phone {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* 徽章样式 */
.level-badge,
.status-badge,
.hours-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.level-vip {
  background-color: #fefcbf;
  color: #d69e2e;
}

.level-高级 {
  background-color: #ebf8ff;
  color: #3182ce;
}

.level-中级 {
  background-color: #e6fffa;
  color: #319795;
}

.level-初级 {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-active {
  background-color: #e6fffa;
  color: #319795;
}

.status-inactive {
  background-color: #faf5ff;
  color: #805ad5;
}

.status-graduated {
  background-color: #fef5e7;
  color: #ed8936;
}

.hours-badge {
  background-color: #e3f2fd;
  color: #1565c0;
}

/* 课程标签 */
.course-tag {
  display: inline-block;
  padding: 4px 10px;
  background-color: #f0f2f5;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.more-courses {
  font-size: 12px;
  color: #667eea;
  cursor: pointer;
}

/* 剩余课时 */
.remaining-hours {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hours-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.hours-label {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* 操作按钮组 */
.action-buttons-group {
  display: flex;
  gap: 8px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #e0e2e5;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.page-controls {
  display: flex;
  gap: 10px;
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

.page-button.active {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 卡片视图 */
.students-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.student-card {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #e0e2e5;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.student-card.selected {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e2e5;
}

.student-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 20px;
}

.student-card-header-info .student-name-large {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.student-card-header-info .student-id-large {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.card-checkbox {
  width: 20px;
  height: 20px;
}

.card-body {
  padding: 20px;
}

.info-grid {
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

.info-label {
  font-size: 12px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
}

.courses-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.course-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.course-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: #e0e2e5;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #667eea;
  border-radius: 3px;
}

.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 30px;
}

.dates-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.date-item {
  display: flex;
  gap: 10px;
  font-size: 14px;
}

.date-label {
  color: #666;
  min-width: 80px;
}

.date-value {
  color: #333;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  background-color: #f0f2f5;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.card-footer {
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e2e5;
}

.card-actions {
  display: flex;
  gap: 10px;
}

/* 批量操作 */
.batch-operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #667eea;
  color: white;
  padding: 15px 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selected-info {
  font-size: 16px;
  font-weight: 500;
}

.batch-actions {
  display: flex;
  gap: 15px;
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

.action-button.secondary {
  background-color: #e0e2e5;
  color: #333;
}

.action-button.secondary:hover:not(:disabled) {
  background-color: #d0d2d5;
}

.action-button.danger {
  background-color: #f56565;
  color: white;
}

.action-button.danger:hover:not(:disabled) {
  background-color: #e53e3e;
}

.action-button.small {
  padding: 8px 16px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-dropdowns {
    justify-content: center;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 40px 2fr 1fr 1fr 1fr;
  }
  
  .students-cards {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .statistics-overview {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .sort-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
  }
  
  .students-cards {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .batch-operations {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .batch-actions {
    justify-content: center;
  }
  
  .card-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
  
  .range-inputs,
  .date-inputs {
    flex-direction: column;
  }
  
  .student-basic-info {
    flex-direction: column;
    text-align: center;
  }
  
  .card-header {
    flex-direction: column;
    text-align: center;
  }
  
  .course-progress {
    flex-direction: column;
    align-items: stretch;
  }
  
  .progress-text {
    text-align: right;
  }
  
  .date-item {
    flex-direction: column;
  }
}
</style>