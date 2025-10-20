<template>
  <div class="teacher-file-query">
    <div class="page-header">
      <button class="back-button" @click="goBack">← 返回仪表盘</button>
      <h2>档案资料查询</h2>
    </div>

    <div class="file-query-container">
      <!-- 搜索和筛选区域 -->
      <div class="search-filter-section">
        <div class="search-controls">
          <div class="search-input-wrapper">
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="debouncedSearch"
              placeholder="搜索档案名称/编号/相关学员"
              class="search-input"
            >
            <div class="search-icon">🔍</div>
          </div>
          
          <div class="filter-dropdowns">
            <select v-model="selectedFileType" @change="applyFilters" class="filter-select">
              <option value="all">所有类型</option>
              <option value="student_profile">学员档案</option>
              <option value="attendance_record">出勤记录</option>
              <option value="performance_report">成绩报告</option>
              <option value="contract">合同文件</option>
              <option value="certificate">证书文件</option>
              <option value="other">其他文件</option>
            </select>
            
            <select v-model="selectedCourse" @change="applyFilters" class="filter-select">
              <option value="all">所有课程</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.name }}
              </option>
            </select>
            
            <select v-model="selectedYear" @change="applyFilters" class="filter-select">
              <option value="all">所有年份</option>
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}年
              </option>
            </select>
          </div>
          
          <div class="action-buttons">
            <button class="action-button" @click="resetFilters">重置筛选</button>
            <button class="action-button primary" @click="uploadNewFile">上传文件</button>
          </div>
        </div>
        
        <!-- 高级筛选面板 -->
        <div class="advanced-filters" v-if="showAdvancedFilters">
          <div class="filter-grid">
            <div class="filter-item">
              <label>创建日期范围</label>
              <div class="date-inputs">
                <input type="date" v-model="createStartDate">
                <span>至</span>
                <input type="date" v-model="createEndDate">
              </div>
            </div>
            
            <div class="filter-item">
              <label>更新日期范围</label>
              <div class="date-inputs">
                <input type="date" v-model="updateStartDate">
                <span>至</span>
                <input type="date" v-model="updateEndDate">
              </div>
            </div>
            
            <div class="filter-item">
              <label>文件状态</label>
              <div class="checkbox-group">
                <label class="checkbox-item">
                  <input type="checkbox" v-model="selectedStatuses" value="active"> 活跃
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="selectedStatuses" value="archived"> 已归档
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="selectedStatuses" value="draft"> 草稿
                </label>
              </div>
            </div>
            
            <div class="filter-item">
              <label>文件格式</label>
              <div class="checkbox-group">
                <label class="checkbox-item">
                  <input type="checkbox" v-model="selectedFormats" value="pdf"> PDF
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="selectedFormats" value="doc"> Word
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="selectedFormats" value="xls"> Excel
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="selectedFormats" value="jpg"> 图片
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" v-model="selectedFormats" value="other"> 其他
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
          <div class="stat-value">{{ totalFiles }}</div>
          <div class="stat-label">总文件数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ totalSizeFormatted }}</div>
          <div class="stat-label">总文件大小</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ studentProfiles }}</div>
          <div class="stat-label">学员档案</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ attendanceRecords }}</div>
          <div class="stat-label">出勤记录</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ performanceReports }}</div>
          <div class="stat-label">成绩报告</div>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="files-list">
        <div class="list-header">
          <div class="header-info">
            <h3>档案列表</h3>
            <span class="result-count">共 {{ filteredFiles.length }} 条结果</span>
          </div>
          
          <div class="sort-controls">
            <label>排序方式：</label>
            <select v-model="sortBy" @change="sortFiles" class="sort-select">
              <option value="name">按名称</option>
              <option value="createDate">按创建日期</option>
              <option value="updateDate">按更新日期</option>
              <option value="size">按文件大小</option>
              <option value="fileType">按文件类型</option>
            </select>
            
            <button class="sort-order-button" @click="toggleSortOrder">
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>
        
        <!-- 列表视图或网格视图 -->
        <div class="view-toggle">
          <button 
            :class="['view-button', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            列表视图
          </button>
          <button 
            :class="['view-button', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
          >
            网格视图
          </button>
        </div>

        <!-- 列表视图 -->
        <div v-if="viewMode === 'list'" class="files-table">
          <div class="table-header">
            <div class="header-cell">
              <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
            </div>
            <div class="header-cell">文件信息</div>
            <div class="header-cell">文件类型</div>
            <div class="header-cell">相关课程</div>
            <div class="header-cell">相关学员</div>
            <div class="header-cell">文件大小</div>
            <div class="header-cell">创建日期</div>
            <div class="header-cell">更新日期</div>
            <div class="header-cell">状态</div>
            <div class="header-cell">操作</div>
          </div>
          
          <div class="table-body">
            <div 
              v-for="file in paginatedFiles" 
              :key="file.id"
              class="table-row"
              :class="{ 'selected': selectedFiles.includes(file.id) }"
            >
              <div class="table-cell">
                <input 
                  type="checkbox" 
                  :value="file.id" 
                  v-model="selectedFiles"
                >
              </div>
              <div class="table-cell">
                <div class="file-basic-info" @click="viewFileDetails(file)">
                  <div class="file-icon">
                    {{ getFileIcon(file.fileType, file.format) }}
                  </div>
                  <div class="file-name-info">
                    <div class="file-name clickable">{{ file.name }}</div>
                    <div class="file-code">编号: {{ file.code }}</div>
                  </div>
                </div>
              </div>
              <div class="table-cell">
                <span class="type-badge clickable" @click="filterByFileType(file.fileType)">
                  {{ getFileTypeText(file.fileType) }}
                </span>
              </div>
              <div class="table-cell">
                <div 
                  v-for="(course, index) in file.courses.slice(0, 2)" 
                  :key="course.id"
                  class="course-tag clickable"
                  @click.stop="viewCourseDetails(course.id, course.name)"
                >
                  {{ course.name }}
                </div>
                <div 
                  v-if="file.courses.length > 2" 
                  class="more-courses clickable"
                  @click.stop="viewAllCourses(file.courses)"
                >
                  +{{ file.courses.length - 2 }} 更多
                </div>
              </div>
              <div class="table-cell">
                <div 
                  v-for="(student, index) in file.students.slice(0, 2)" 
                  :key="student.id"
                  class="student-tag clickable"
                  @click.stop="viewStudentDetails(student.id, student.name)"
                >
                  {{ student.name }}
                </div>
                <div 
                  v-if="file.students.length > 2" 
                  class="more-students clickable"
                  @click.stop="viewAllStudents(file.students)"
                >
                  +{{ file.students.length - 2 }} 更多
                </div>
              </div>
              <div class="table-cell clickable" @click="sortByColumn('size')">
                {{ formatFileSize(file.size) }}
              </div>
              <div class="table-cell clickable" @click="sortByColumn('createDate')">
                {{ formatDate(file.createDate) }}
              </div>
              <div class="table-cell clickable" @click="sortByColumn('updateDate')">
                {{ formatDate(file.updateDate) }}
              </div>
              <div class="table-cell">
                <span 
                  class="status-badge clickable" 
                  :class="`status-${file.status}`"
                  @click="filterByStatus(file.status)"
                >
                  {{ getStatusText(file.status) }}
                </span>
              </div>
              <div class="table-cell">
                <div class="action-buttons-group">
                  <button class="action-button small" @click="viewFile(file.id)">
                    查看
                  </button>
                  <button class="action-button small" @click="downloadFile(file.id)">
                    下载
                  </button>
                  <button class="action-button small" @click="updateFile(file.id)">
                    更新
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div class="pagination">
            <div class="page-info">
              显示 {{ Math.min((currentPage - 1) * pageSize + 1, filteredFiles.length) }} - 
              {{ Math.min(currentPage * pageSize, filteredFiles.length) }} 条，共 {{ filteredFiles.length }} 条
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

        <!-- 网格视图 -->
        <div v-else class="files-grid">
          <div 
            v-for="file in paginatedFiles" 
            :key="file.id"
            class="file-card"
            :class="{ 'selected': selectedFiles.includes(file.id) }"
          >
            <div class="card-header">
              <div class="file-icon-large">
                {{ getFileIcon(file.fileType, file.format) }}
              </div>
              <div class="file-card-header-info">
                <div class="file-name-large">{{ file.name }}</div>
                <div class="file-code-large">编号: {{ file.code }}</div>
              </div>
              <div class="card-header-actions">
                <input 
                  type="checkbox" 
                  :value="file.id" 
                  v-model="selectedFiles"
                  class="card-checkbox"
                >
              </div>
            </div>
            
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">文件类型</span>
                  <span class="type-badge">{{ getFileTypeText(file.fileType) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">文件大小</span>
                  <span class="info-value">{{ formatFileSize(file.size) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">状态</span>
                  <span class="status-badge" :class="`status-${file.status}`">
                    {{ getStatusText(file.status) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">格式</span>
                  <span class="info-value">{{ getFormatText(file.format) }}</span>
                </div>
              </div>
              
              <div v-if="file.courses.length > 0" class="courses-section">
                <h4 class="section-title">相关课程</h4>
                <div class="courses-list">
                  <div 
                    v-for="course in file.courses" 
                    :key="course.id"
                    class="course-item"
                  >
                    {{ course.name }}
                  </div>
                </div>
              </div>
              
              <div v-if="file.students.length > 0" class="students-section">
                <h4 class="section-title">相关学员</h4>
                <div class="students-avatars">
                  <div 
                    v-for="student in file.students.slice(0, 4)" 
                    :key="student.id"
                    class="student-avatar-small"
                    :style="{ backgroundColor: getAvatarColor(student.name) }"
                    :title="student.name"
                  >
                    {{ getInitial(student.name) }}
                  </div>
                  <div v-if="file.students.length > 4" class="more-avatars">
                    +{{ file.students.length - 4 }}
                  </div>
                </div>
              </div>
              
              <div class="dates-section">
                <div class="date-item">
                  <span class="date-label">创建日期：</span>
                  <span class="date-value">{{ formatDate(file.createDate) }}</span>
                </div>
                <div class="date-item">
                  <span class="date-label">更新日期：</span>
                  <span class="date-value">{{ formatDate(file.updateDate) }}</span>
                </div>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="card-actions">
                <button class="action-button small primary" @click="viewFile(file.id)">
                  查看
                </button>
                <button class="action-button small" @click="downloadFile(file.id)">
                  下载
                </button>
                <button class="action-button small" @click="updateFile(file.id)">
                  更新
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 批量操作面板 -->
      <div class="batch-operations" v-if="selectedFiles.length > 0">
        <div class="selected-info">
          已选择 {{ selectedFiles.length }} 个文件
        </div>
        <div class="batch-actions">
          <button class="action-button" @click="batchDownload">批量下载</button>
          <button class="action-button" @click="batchArchive">批量归档</button>
          <button class="action-button danger" @click="clearSelection">取消选择</button>
        </div>
      </div>

      <!-- 上传文件模态框 -->
      <div class="modal-overlay" v-if="showUploadModal" @click.self="closeUploadModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>上传新文件</h3>
            <button class="close-button" @click="closeUploadModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>文件名称 *</label>
              <input type="text" v-model="uploadForm.fileName" placeholder="请输入文件名称">
            </div>
            <div class="form-group">
              <label>文件类型 *</label>
              <select v-model="uploadForm.fileType">
                <option value="student_profile">学员档案</option>
                <option value="attendance_record">出勤记录</option>
                <option value="performance_report">成绩报告</option>
                <option value="contract">合同文件</option>
                <option value="certificate">证书文件</option>
                <option value="other">其他文件</option>
              </select>
            </div>
            <div class="form-group">
              <label>选择课程</label>
              <select v-model="uploadForm.selectedCourses" multiple>
                <option v-for="course in courses" :key="course.id" :value="course.id">
                  {{ course.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>选择学员</label>
              <select v-model="uploadForm.selectedStudents" multiple>
                <option v-for="student in students" :key="student.id" :value="student.id">
                  {{ student.name }} ({{ student.studentId }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>文件描述</label>
              <textarea v-model="uploadForm.description" placeholder="请输入文件描述（可选）"></textarea>
            </div>
            <div class="form-group">
              <label>选择文件 *</label>
              <div class="file-upload-area">
                <input type="file" ref="fileInput" @change="handleFileSelect" style="display: none;">
                <button type="button" class="upload-button" @click="triggerFileSelect">
                  点击选择文件
                </button>
                <span class="upload-text" v-if="uploadForm.selectedFile">
                  {{ uploadForm.selectedFile.name }}
                </span>
                <span class="upload-text" v-else>
                  或拖拽文件到此处
                </span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="action-button" @click="closeUploadModal">取消</button>
            <button 
              class="action-button primary" 
              @click="submitUpload"
              :disabled="!isUploadFormValid"
            >
              确认上传
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'TeacherFileQuery',
  setup() {
    const router = useRouter()
    
    // 搜索和筛选
    const searchQuery = ref('')
    const selectedFileType = ref('all')
    const selectedCourse = ref('all')
    const selectedYear = ref('all')
    const showAdvancedFilters = ref(false)
    const createStartDate = ref('')
    const createEndDate = ref('')
    const updateStartDate = ref('')
    const updateEndDate = ref('')
    const selectedStatuses = ref(['active', 'archived'])
    const selectedFormats = ref(['pdf', 'doc', 'xls', 'jpg'])
    
    // 排序和分页
    const sortBy = ref('createDate')
    const sortOrder = ref('desc')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const viewMode = ref('list')
    
    // 多选
    const selectedFiles = ref([])
    const selectAll = ref(false)
    
    // 上传模态框
    const showUploadModal = ref(false)
    const fileInput = ref(null)
    const uploadForm = ref({
      fileName: '',
      fileType: 'student_profile',
      selectedCourses: [],
      selectedStudents: [],
      description: '',
      selectedFile: null
    })
    
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
      { id: 1, name: '张三', studentId: '2023001' },
      { id: 2, name: '李四', studentId: '2023002' },
      { id: 3, name: '王五', studentId: '2023003' },
      { id: 4, name: '赵六', studentId: '2023004' },
      { id: 5, name: '孙七', studentId: '2023005' },
      { id: 6, name: '周八', studentId: '2023006' },
      { id: 7, name: '吴九', studentId: '2023007' },
      { id: 8, name: '郑十', studentId: '2023008' }
    ])
    
    // 可用年份
    const availableYears = ref([2024, 2023, 2022, 2021, 2020])
    
    // 文件数据
    const files = ref([
      {
        id: 1,
        name: '张三学员档案',
        code: 'SD-2023001-001',
        fileType: 'student_profile',
        format: 'pdf',
        size: 2048000, // 2MB
        createDate: '2023-01-15',
        updateDate: '2023-06-20',
        status: 'active',
        courses: [
          { id: 1, name: '数据结构' },
          { id: 2, name: '算法分析' }
        ],
        students: [
          { id: 1, name: '张三' }
        ]
      },
      {
        id: 2,
        name: '数据结构课程出勤记录',
        code: 'AR-CS201-2023',
        fileType: 'attendance_record',
        format: 'xls',
        size: 512000, // 0.5MB
        createDate: '2023-01-10',
        updateDate: '2023-12-30',
        status: 'active',
        courses: [
          { id: 1, name: '数据结构' }
        ],
        students: [
          { id: 1, name: '张三' },
          { id: 3, name: '王五' },
          { id: 5, name: '孙七' },
          { id: 7, name: '吴九' }
        ]
      },
      {
        id: 3,
        name: '第一学期成绩报告',
        code: 'PR-2023-01',
        fileType: 'performance_report',
        format: 'pdf',
        size: 3072000, // 3MB
        createDate: '2023-07-05',
        updateDate: '2023-07-05',
        status: 'active',
        courses: [
          { id: 1, name: '数据结构' },
          { id: 2, name: '算法分析' },
          { id: 3, name: '数据库原理' }
        ],
        students: [
          { id: 1, name: '张三' },
          { id: 2, name: '李四' },
          { id: 3, name: '王五' },
          { id: 4, name: '赵六' },
          { id: 5, name: '孙七' }
        ]
      },
      {
        id: 4,
        name: 'VIP学员服务合同',
        code: 'CT-2023001',
        fileType: 'contract',
        format: 'pdf',
        size: 1536000, // 1.5MB
        createDate: '2023-01-01',
        updateDate: '2023-01-01',
        status: 'archived',
        courses: [],
        students: [
          { id: 1, name: '张三' },
          { id: 4, name: '赵六' }
        ]
      },
      {
        id: 5,
        name: '算法课程结课证书',
        code: 'CF-2023-001',
        fileType: 'certificate',
        format: 'jpg',
        size: 4096000, // 4MB
        createDate: '2023-12-25',
        updateDate: '2023-12-25',
        status: 'active',
        courses: [
          { id: 2, name: '算法分析' }
        ],
        students: [
          { id: 2, name: '李四' },
          { id: 4, name: '赵六' }
        ]
      },
      {
        id: 6,
        name: '课程教学大纲',
        code: 'OT-CS203-2023',
        fileType: 'other',
        format: 'doc',
        size: 768000, // 0.75MB
        createDate: '2023-02-01',
        updateDate: '2023-02-10',
        status: 'active',
        courses: [
          { id: 3, name: '数据库原理' }
        ],
        students: []
      },
      {
        id: 7,
        name: '李四学员档案',
        code: 'SD-2023002-001',
        fileType: 'student_profile',
        format: 'pdf',
        size: 2560000, // 2.5MB
        createDate: '2023-02-20',
        updateDate: '2023-09-15',
        status: 'active',
        courses: [
          { id: 2, name: '算法分析' },
          { id: 3, name: '数据库原理' }
        ],
        students: [
          { id: 2, name: '李四' }
        ]
      },
      {
        id: 8,
        name: '操作系统课程出勤记录',
        code: 'AR-CS301-2023',
        fileType: 'attendance_record',
        format: 'xls',
        size: 409600, // 0.4MB
        createDate: '2023-03-01',
        updateDate: '2023-11-10',
        status: 'active',
        courses: [
          { id: 4, name: '操作系统' }
        ],
        students: [
          { id: 4, name: '赵六' },
          { id: 6, name: '周八' },
          { id: 8, name: '郑十' }
        ]
      },
      {
        id: 9,
        name: '第二学期成绩报告',
        code: 'PR-2023-02',
        fileType: 'performance_report',
        format: 'pdf',
        size: 3584000, // 3.5MB
        createDate: '2023-12-20',
        updateDate: '2023-12-20',
        status: 'draft',
        courses: [
          { id: 4, name: '操作系统' },
          { id: 5, name: '计算机网络' }
        ],
        students: [
          { id: 2, name: '李四' },
          { id: 4, name: '赵六' },
          { id: 6, name: '周八' },
          { id: 8, name: '郑十' }
        ]
      },
      {
        id: 10,
        name: '计算机网络课程教学计划',
        code: 'OT-CS302-2023',
        fileType: 'other',
        format: 'doc',
        size: 1024000, // 1MB
        createDate: '2023-01-15',
        updateDate: '2023-01-20',
        status: 'active',
        courses: [
          { id: 5, name: '计算机网络' }
        ],
        students: []
      }
    ])
    
    // 计算属性
    const filteredFiles = computed(() => {
      let result = [...files.value]
      
      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(file => 
          file.name.toLowerCase().includes(query) ||
          file.code.toLowerCase().includes(query) ||
          file.students.some(student => student.name.toLowerCase().includes(query))
        )
      }
      
      // 文件类型过滤
      if (selectedFileType.value !== 'all') {
        result = result.filter(file => file.fileType === selectedFileType.value)
      }
      
      // 课程过滤
      if (selectedCourse.value !== 'all') {
        result = result.filter(file => 
          file.courses.some(course => course.id === parseInt(selectedCourse.value))
        )
      }
      
      // 年份过滤
      if (selectedYear.value !== 'all') {
        const year = selectedYear.value
        result = result.filter(file => {
          const createYear = new Date(file.createDate).getFullYear()
          return createYear === year
        })
      }
      
      // 状态过滤
      if (selectedStatuses.value.length > 0) {
        result = result.filter(file => selectedStatuses.value.includes(file.status))
      }
      
      // 格式过滤
      if (selectedFormats.value.length > 0) {
        result = result.filter(file => selectedFormats.value.includes(file.format))
      }
      
      // 创建日期过滤
      if (createStartDate.value) {
        result = result.filter(file => file.createDate >= createStartDate.value)
      }
      if (createEndDate.value) {
        result = result.filter(file => file.createDate <= createEndDate.value)
      }
      
      // 更新日期过滤
      if (updateStartDate.value) {
        result = result.filter(file => file.updateDate >= updateStartDate.value)
      }
      if (updateEndDate.value) {
        result = result.filter(file => file.updateDate <= updateEndDate.value)
      }
      
      return result
    })
    
    // 排序后的文件列表
    const sortedFiles = computed(() => {
      const fileList = [...filteredFiles.value]
      
      fileList.sort((a, b) => {
        let aValue, bValue
        
        switch (sortBy.value) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'createDate':
            aValue = a.createDate;
            bValue = b.createDate;
            break;
          case 'updateDate':
            aValue = a.updateDate;
            bValue = b.updateDate;
            break;
          case 'size':
            aValue = a.size;
            bValue = b.size;
            break;
          case 'fileType':
            aValue = a.fileType;
            bValue = b.fileType;
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
      
      return fileList
    })
    
    // 分页文件列表
    const paginatedFiles = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return sortedFiles.value.slice(start, end)
    })
    
    // 总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredFiles.value.length / pageSize.value)
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
    const totalFiles = computed(() => files.value.length)
    const totalSize = computed(() => files.value.reduce((sum, file) => sum + file.size, 0))
    const totalSizeFormatted = computed(() => formatFileSize(totalSize.value))
    const studentProfiles = computed(() => files.value.filter(f => f.fileType === 'student_profile').length)
    const attendanceRecords = computed(() => files.value.filter(f => f.fileType === 'attendance_record').length)
    const performanceReports = computed(() => files.value.filter(f => f.fileType === 'performance_report').length)
    
    // 上传表单验证
    const isUploadFormValid = computed(() => {
      return uploadForm.value.fileName && 
             uploadForm.value.selectedFile &&
             uploadForm.value.fileType
    })
    
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
      selectedFiles.value = []
    }
    
    // 重置筛选
    const resetFilters = () => {
      searchQuery.value = ''
      selectedFileType.value = 'all'
      selectedCourse.value = 'all'
      selectedYear.value = 'all'
      createStartDate.value = ''
      createEndDate.value = ''
      updateStartDate.value = ''
      updateEndDate.value = ''
      currentPage.value = 1
      selectAll.value = false
      selectedFiles.value = []
    }
    
    // 切换高级筛选
    const toggleAdvancedFilters = () => {
      showAdvancedFilters.value = !showAdvancedFilters.value
    }
    
    // 切换排序顺序
    const toggleSortOrder = () => {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    }
    
    // 排序文件
    const sortFiles = () => {
      currentPage.value = 1
    }
    
    // 全选/取消全选
    const toggleSelectAll = () => {
      if (selectAll.value) {
        selectedFiles.value = sortedFiles.value.map(f => f.id)
      } else {
        selectedFiles.value = []
      }
    }
    
    // 清除选择
    const clearSelection = () => {
      selectedFiles.value = []
      selectAll.value = false
    }
    
    // 查看文件
    const viewFile = (fileId) => {
      alert(`查看文件功能开发中... 选中文件ID: ${fileId}`)
    }
    
    // 查看文件详情
    const viewFileDetails = (file) => {
      alert(`文件详情：\n名称: ${file.name}\n编号: ${file.code}\n类型: ${getFileTypeText(file.fileType)}\n大小: ${formatFileSize(file.size)}\n创建日期: ${formatDate(file.createDate)}\n状态: ${getStatusText(file.status)}`)
    }
    
    // 按文件类型筛选
    const filterByFileType = (fileType) => {
      selectedFileType.value = fileType
      applyFilters()
    }
    
    // 按状态筛选
    const filterByStatus = (status) => {
      if (!selectedStatuses.value.includes(status)) {
        selectedStatuses.value = [status]
        applyFilters()
      }
    }
    
    // 查看课程详情
    const viewCourseDetails = (courseId, courseName) => {
      alert(`查看课程详情：\n课程ID: ${courseId}\n课程名称: ${courseName}`)
    }
    
    // 查看所有相关课程
    const viewAllCourses = (courses) => {
      const courseNames = courses.map(c => c.name).join('\n')
      alert(`所有相关课程：\n${courseNames}`)
    }
    
    // 查看学员详情
    const viewStudentDetails = (studentId, studentName) => {
      alert(`查看学员详情：\n学员ID: ${studentId}\n学员姓名: ${studentName}`)
    }
    
    // 查看所有相关学员
    const viewAllStudents = (students) => {
      const studentNames = students.map(s => s.name).join('\n')
      alert(`所有相关学员：\n${studentNames}`)
    }
    
    // 按列排序
    const sortByColumn = (column) => {
      if (sortBy.value === column) {
        toggleSortOrder()
      } else {
        sortBy.value = column
        sortOrder.value = 'asc'
      }
    }
    
    // 下载文件
    const downloadFile = (fileId) => {
      alert(`下载文件功能开发中... 选中文件ID: ${fileId}`)
    }
    
    // 更新文件
    const updateFile = (fileId) => {
      alert(`更新文件功能开发中... 选中文件ID: ${fileId}`)
    }
    
    // 批量下载
    const batchDownload = () => {
      alert(`批量下载 ${selectedFiles.value.length} 个文件功能开发中...`)
    }
    
    // 批量归档
    const batchArchive = () => {
      alert(`批量归档 ${selectedFiles.value.length} 个文件功能开发中...`)
    }
    
    // 打开上传模态框
    const uploadNewFile = () => {
      showUploadModal.value = true
      // 重置表单
      uploadForm.value = {
        fileName: '',
        fileType: 'student_profile',
        selectedCourses: [],
        selectedStudents: [],
        description: '',
        selectedFile: null
      }
    }
    
    // 关闭上传模态框
    const closeUploadModal = () => {
      showUploadModal.value = false
      uploadForm.value.selectedFile = null
    }
    
    // 触发文件选择
    const triggerFileSelect = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }
    
    // 处理文件选择
    const handleFileSelect = (event) => {
      if (event.target.files && event.target.files[0]) {
        uploadForm.value.selectedFile = event.target.files[0]
      }
    }
    
    // 提交上传
    const submitUpload = () => {
      if (!isUploadFormValid.value) return
      
      // 模拟上传成功
      alert(`文件 "${uploadForm.value.fileName}" 上传成功！`)
      closeUploadModal()
    }
    
    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }
    
    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
    
    // 获取文件类型文本
    const getFileTypeText = (fileType) => {
      const map = {
        student_profile: '学员档案',
        attendance_record: '出勤记录',
        performance_report: '成绩报告',
        contract: '合同文件',
        certificate: '证书文件',
        other: '其他文件'
      }
      return map[fileType] || '未知类型'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const map = {
        active: '活跃',
        archived: '已归档',
        draft: '草稿'
      }
      return map[status] || '未知'
    }
    
    // 获取格式文本
    const getFormatText = (format) => {
      const map = {
        pdf: 'PDF',
        doc: 'Word',
        xls: 'Excel',
        jpg: '图片',
        other: '其他'
      }
      return map[format] || '未知'
    }
    
    // 获取文件图标
    const getFileIcon = (fileType, format) => {
      const iconMap = {
        pdf: '📄',
        doc: '📝',
        xls: '📊',
        jpg: '🖼️',
        student_profile: '👤',
        attendance_record: '📅',
        performance_report: '📈',
        contract: '📑',
        certificate: '🏆',
        other: '📁'
      }
      
      return iconMap[format] || iconMap[fileType] || '📄'
    }
    
    // 获取头像颜色
    const getAvatarColor = (name) => {
      const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#00f5d4', '#43e97b'
      ]
      const index = name.charCodeAt(0) % colors.length
      return colors[index]
    }
    
    // 获取姓名首字母
    const getInitial = (name) => {
      return name.charAt(0)
    }
    
    // 监听选中状态变化
    watch(selectedFiles, (newSelected) => {
      if (newSelected.length === sortedFiles.value.length && sortedFiles.value.length > 0) {
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
      selectedFileType,
      selectedCourse,
      selectedYear,
      showAdvancedFilters,
      createStartDate,
      createEndDate,
      updateStartDate,
      updateEndDate,
      selectedStatuses,
      selectedFormats,
      sortBy,
      sortOrder,
      currentPage,
      pageSize,
      viewMode,
      selectedFiles,
      selectAll,
      showUploadModal,
      fileInput,
      uploadForm,
      courses,
      students,
      availableYears,
      files,
      filteredFiles,
      sortedFiles,
      paginatedFiles,
      totalPages,
      visiblePages,
      totalFiles,
      totalSizeFormatted,
      studentProfiles,
      attendanceRecords,
      performanceReports,
      isUploadFormValid,
      debouncedSearch,
      applyFilters,
      resetFilters,
      toggleAdvancedFilters,
      toggleSortOrder,
      sortFiles,
      toggleSelectAll,
      clearSelection,
      viewFile,
      viewFileDetails,
      filterByFileType,
      filterByStatus,
      viewCourseDetails,
      viewAllCourses,
      viewStudentDetails,
      viewAllStudents,
      sortByColumn,
      downloadFile,
      updateFile,
      batchDownload,
      batchArchive,
      uploadNewFile,
      closeUploadModal,
      triggerFileSelect,
      handleFileSelect,
      submitUpload,
      formatDate,
      formatFileSize,
      getFileTypeText,
      getStatusText,
      getFormatText,
      getFileIcon,
      getAvatarColor,
      getInitial,
      goBack
    }
  }
}
</script>

<style scoped>
.teacher-file-query {
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

.file-query-container {
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

.date-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-inputs input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e2e5;
  border-radius: 6px;
  font-size: 14px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
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

/* 文件列表 */
.files-list {
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
.files-table {
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

/* 文件基本信息 */
.file-basic-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.file-icon {
  font-size: 32px;
}

.file-icon-large {
  font-size: 48px;
}

.file-name-info .file-name {
  font-weight: 600;
  color: #333;
}

.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable:hover {
  color: #667eea;
  text-decoration: underline;
}

.type-badge.clickable:hover,
.course-tag.clickable:hover,
.student-tag.clickable:hover,
.status-badge.clickable:hover {
  transform: scale(1.05);
  text-decoration: none;
}

.more-courses.clickable:hover,
.more-students.clickable:hover {
  color: #667eea;
  text-decoration: underline;
}

.file-name-info .file-code {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* 徽章样式 */
.type-badge,
.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.type-badge {
  background-color: #ebf8ff;
  color: #3182ce;
}

.status-active {
  background-color: #e6fffa;
  color: #319795;
}

.status-archived {
  background-color: #faf5ff;
  color: #805ad5;
}

.status-draft {
  background-color: #fef5e7;
  color: #ed8936;
}

/* 标签样式 */
.course-tag,
.student-tag {
  display: inline-block;
  padding: 4px 10px;
  background-color: #f0f2f5;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.more-courses,
.more-students {
  font-size: 12px;
  color: #667eea;
  cursor: pointer;
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

/* 网格视图 */
.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.file-card {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #e0e2e5;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.file-card.selected {
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

.file-card-header-info .file-name-large {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.file-card-header-info .file-code-large {
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

.courses-section,
.students-section {
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
  flex-wrap: wrap;
  gap: 8px;
}

.students-avatars {
  display: flex;
  gap: -10px;
}

.student-avatar-small {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
  border: 2px solid white;
  position: relative;
  z-index: 1;
}

.student-avatar-small:nth-child(2) {
  margin-left: -10px;
  z-index: 2;
}

.student-avatar-small:nth-child(3) {
  margin-left: -10px;
  z-index: 3;
}

.student-avatar-small:nth-child(4) {
  margin-left: -10px;
  z-index: 4;
}

.more-avatars {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e0e2e5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-weight: 600;
  font-size: 10px;
  margin-left: -10px;
  border: 2px solid white;
}

.dates-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* 模态框 */
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e0e2e5;
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
  color: #666;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-button:hover {
  background-color: #f0f2f5;
  color: #333;
}

.modal-body {
  padding: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e2e5;
  border-radius: 8px;
  font-size: 16px;
}

.form-group select[multiple] {
  min-height: 120px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.file-upload-area {
  border: 2px dashed #e0e2e5;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  transition: all 0.2s ease;
}

.file-upload-area:hover {
  border-color: #667eea;
}

.upload-button {
  padding: 10px 20px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 10px;
  transition: background-color 0.2s ease;
}

.upload-button:hover {
  background-color: #5a67d8;
}

.upload-text {
  font-size: 14px;
  color: #666;
  display: block;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 25px;
  border-top: 1px solid #e0e2e5;
}

/* 操作按钮样式 */
.action-button {
  padding: 10px 20px;
  border: 1px solid #e0e2e5;
  background-color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #f0f2f5;
}

.action-button.primary {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}

.action-button.primary:hover {
  background-color: #5a67d8;
}

.action-button.secondary {
  background-color: #e0e2e5;
  color: #333;
  border-color: #e0e2e5;
}

.action-button.secondary:hover {
  background-color: #d1d5db;
}

.action-button.danger {
  background-color: #f56565;
  color: white;
  border-color: #f56565;
}

.action-button.danger:hover {
  background-color: #e53e3e;
}

.action-button.small {
  padding: 6px 12px;
  font-size: 14px;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-dropdowns {
    justify-content: space-between;
  }

  .filter-select {
    flex: 1;
    min-width: auto;
  }

  .statistics-overview {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .table-header,
  .table-row {
    grid-template-columns: 40px 2fr 1fr 1fr;
    font-size: 14px;
  }

  .table-row > .table-cell:nth-child(n+5) {
    display: none;
  }

  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .search-filter-section {
    padding: 20px;
  }

  .filter-dropdowns {
    flex-direction: column;
    gap: 10px;
  }

  .statistics-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .sort-controls {
    justify-content: space-between;
  }

  .table-header,
  .table-row {
    grid-template-columns: 40px 1fr;
  }

  .table-row > .table-cell:nth-child(n+3) {
    display: none;
  }

  .file-card {
    width: 100%;
  }

  .batch-operations {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-body {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .page-header h2 {
    font-size: 24px;
  }

  .statistics-overview {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .file-card-header-info {
    width: 100%;
  }

  .card-checkbox {
    align-self: flex-start;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-wrap: wrap;
  }

  .action-button {
    flex: 1;
  }
}

</style>