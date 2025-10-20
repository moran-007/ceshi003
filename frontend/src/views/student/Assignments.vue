<template>
  <div class="assignments-container">
    <el-card class="assignments-card">
      <template #header>
        <div class="card-header">
          <span>我的作业</span>
          <el-select v-model="assignmentType" placeholder="选择作业类型" @change="handleTypeChange">
            <el-option label="全部作业" value="all"></el-option>
            <el-option label="待提交" value="pending"></el-option>
            <el-option label="已提交" value="submitted"></el-option>
            <el-option label="已批改" value="graded"></el-option>
            <el-option label="已过期" value="overdue"></el-option>
          </el-select>
        </div>
      </template>

      <!-- 搜索和筛选区域 -->
      <el-card class="search-filter-card" shadow="never">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="课程名称">
            <el-input v-model="searchForm.courseName" placeholder="请输入课程名称"></el-input>
          </el-form-item>
          <el-form-item label="作业名称">
            <el-input v-model="searchForm.assignmentName" placeholder="请输入作业名称"></el-input>
          </el-form-item>
          <el-form-item label="截止日期">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 作业状态统计卡片 -->
      <div class="stats-container">
        <el-card class="stats-card">
          <el-row :gutter="20">
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-item">
                <div class="stat-value">{{ totalAssignments }}</div>
                <div class="stat-label">总作业数</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-item warning">
                <div class="stat-value">{{ pendingAssignments }}</div>
                <div class="stat-label">待提交</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-item info">
                <div class="stat-value">{{ submittedAssignments }}</div>
                <div class="stat-label">已提交</div>
              </div>
            </el-col>
            <el-col :xs="12" :sm="12" :md="6" :lg="6" :xl="6">
              <div class="stat-item success">
                <div class="stat-value">{{ gradedAssignments }}</div>
                <div class="stat-label">已批改</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </div>

      <!-- 作业列表 -->
      <el-card class="assignments-list-card">
        <el-table :data="filteredAssignments" style="width: 100%">
          <el-table-column prop="courseName" label="课程名称" width="200"></el-table-column>
          <el-table-column prop="assignmentName" label="作业名称" min-width="200">
            <template #default="scope">
              <span class="assignment-name">{{ scope.row.assignmentName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="作业描述" min-width="250"></el-table-column>
          <el-table-column prop="publishTime" label="发布时间" width="150"></el-table-column>
          <el-table-column prop="deadline" label="截止时间" width="150">
            <template #default="scope">
              <span :class="{ 'overdue-date': isOverdue(scope.row) }">
                {{ scope.row.deadline }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="得分" width="80">
            <template #default="scope">
              <span v-if="scope.row.score !== null && scope.row.score !== undefined">{{ scope.row.score }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="scope">
              <el-button-group>
                <el-button type="primary" size="small" @click="viewAssignmentDetails(scope.row)">查看</el-button>
                <el-button
                  v-if="scope.row.status === 'pending' || scope.row.status === 'overdue'"
                  type="success"
                  size="small"
                  @click="submitAssignment(scope.row)"
                >
                  提交
                </el-button>
                <el-button
                  v-else-if="scope.row.status === 'submitted'"
                  type="info"
                  size="small"
                  @click="viewSubmission(scope.row)"
                >
                  已提交
                </el-button>
                <el-button
                  v-else-if="scope.row.status === 'graded'"
                  type="warning"
                  size="small"
                  @click="viewFeedback(scope.row)"
                >
                  查看反馈
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredAssignments.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </el-card>
    </el-card>

    <!-- 作业详情对话框 -->
    <el-dialog
      v-model="showDetailsDialog"
      title="作业详情"
      width="70%"
      :before-close="handleCloseDetailsDialog"
    >
      <div v-if="selectedAssignment" class="assignment-details">
        <el-descriptions border :column="{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }">
          <el-descriptions-item label="作业名称">{{ selectedAssignment.assignmentName }}</el-descriptions-item>
          <el-descriptions-item label="课程名称">{{ selectedAssignment.courseName }}</el-descriptions-item>
          <el-descriptions-item label="发布教师">{{ selectedAssignment.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ selectedAssignment.publishTime }}</el-descriptions-item>
          <el-descriptions-item label="截止时间">{{ selectedAssignment.deadline }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTagType(selectedAssignment.status)">
              {{ getStatusText(selectedAssignment.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="满分" :span="2">{{ selectedAssignment.totalScore }}</el-descriptions-item>
          <el-descriptions-item label="已得分数" :span="2">
            {{ selectedAssignment.score !== null ? selectedAssignment.score : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="作业描述" :span="2">
            <div class="assignment-description">{{ selectedAssignment.description }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="作业要求" :span="2">
            <div class="assignment-requirements">{{ selectedAssignment.requirements }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="附件" :span="2">
            <div v-if="selectedAssignment.attachments && selectedAssignment.attachments.length > 0" class="attachments-list">
              <div
                v-for="(attachment, index) in selectedAssignment.attachments"
                :key="index"
                class="attachment-item"
                @click="downloadAttachment(attachment)"
              >
                <el-icon class="attachment-icon"><Document /></el-icon>
                <span class="attachment-name">{{ attachment.name }}</span>
                <span class="attachment-size">({{ attachment.size }})</span>
              </div>
            </div>
            <span v-else>无附件</span>
          </el-descriptions-item>
          <el-descriptions-item label="我的提交" :span="2" v-if="selectedAssignment.submission">
            <div class="submission-info">
              <div class="submission-item">
                <span class="submission-label">提交时间：</span>
                <span>{{ selectedAssignment.submission.submitTime }}</span>
              </div>
              <div class="submission-item" v-if="selectedAssignment.submission.content">
                <span class="submission-label">提交内容：</span>
                <div class="submission-content">{{ selectedAssignment.submission.content }}</div>
              </div>
              <div class="submission-item" v-if="selectedAssignment.submission.files && selectedAssignment.submission.files.length > 0">
                <span class="submission-label">提交文件：</span>
                <div class="submission-files">
                  <div
                    v-for="(file, index) in selectedAssignment.submission.files"
                    :key="index"
                    class="submission-file"
                    @click="downloadSubmissionFile(file)"
                  >
                    <el-icon class="file-icon"><Document /></el-icon>
                    <span>{{ file.name }}</span>
                    <span class="file-size">({{ file.size }})</span>
                  </div>
                </div>
              </div>
              <div class="submission-item" v-if="selectedAssignment.feedback">
                <span class="submission-label">教师反馈：</span>
                <div class="feedback-content">
                  <div class="feedback-text">{{ selectedAssignment.feedback.content }}</div>
                  <div class="feedback-score">得分：{{ selectedAssignment.feedback.score }}</div>
                  <div class="feedback-time">批改时间：{{ selectedAssignment.feedback.gradeTime }}</div>
                </div>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="dialog-footer">
          <el-button @click="handleCloseDetailsDialog">关闭</el-button>
          <el-button
            v-if="selectedAssignment.status === 'pending' || selectedAssignment.status === 'overdue'"
            type="primary"
            @click="submitAssignmentInDialog"
          >
            提交作业
          </el-button>
          <el-button
            v-else-if="selectedAssignment.status === 'submitted'"
            type="info"
            @click="viewSubmissionDetails"
          >
            查看提交
          </el-button>
          <el-button
            v-else-if="selectedAssignment.status === 'graded'"
            type="warning"
            @click="viewFeedbackDetails"
          >
            查看反馈
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 作业提交对话框 -->
    <el-dialog
      v-model="showSubmitDialog"
      title="提交作业"
      width="60%"
      :before-close="handleCloseSubmitDialog"
    >
      <div v-if="selectedAssignment" class="submit-assignment">
        <el-form :model="submitForm" :rules="submitRules" ref="submitFormRef">
          <el-form-item label="作业名称" :label-width="80">
            <el-input v-model="selectedAssignment.assignmentName" disabled></el-input>
          </el-form-item>
          <el-form-item label="提交内容" :label-width="80">
            <el-input
              v-model="submitForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入作业内容"
            ></el-input>
          </el-form-item>
          <el-form-item label="上传文件" :label-width="80">
            <el-upload
              v-model:file-list="submitForm.files"
              class="upload-demo"
              action=""
              drag
              multiple
              :on-change="handleFileChange"
              :auto-upload="false"
              :limit="5"
              :on-exceed="handleExceed"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  只能上传doc、docx、pdf、zip、rar、jpg、png格式文件，单个文件大小不超过10MB，最多上传5个文件
                </div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item label="截止时间" :label-width="80">
            <el-input v-model="selectedAssignment.deadline" disabled></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="dialog-footer">
        <el-button @click="handleCloseSubmitDialog">取消</el-button>
        <el-button type="primary" @click="confirmSubmit">确认提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { Document, UploadFilled } from '@element-plus/icons-vue'
import api from '../../services/axios'

export default {
  name: 'StudentAssignments',
  components: {
    Document,
    UploadFilled
  },
  data() {
    return {
      assignmentType: 'all',
      currentPage: 1,
      pageSize: 10,
      searchForm: {
        courseName: '',
        assignmentName: ''
      },
      dateRange: [],
      showDetailsDialog: false,
      showSubmitDialog: false,
      selectedAssignment: null,
      submitForm: {
        content: '',
        files: []
      },
      submitRules: {
        content: [
          { required: false, message: '请输入提交内容', trigger: 'blur' }
        ]
      },
      // 数据状态
      loading: false,
      // 作业数据
      assignments: []
    }
  },
  
  mounted() {
    // 页面加载时获取作业数据
    this.loadAssignments()
  },
  computed: {
    filteredAssignments() {
      let filtered = [...this.assignments]

      // 按类型筛选
      if (this.assignmentType !== 'all') {
        filtered = filtered.filter(assignment => assignment.status === this.assignmentType)
      }

      // 按课程名称搜索
      if (this.searchForm.courseName) {
        filtered = filtered.filter(assignment => 
          assignment.courseName.toLowerCase().includes(this.searchForm.courseName.toLowerCase())
        )
      }

      // 按作业名称搜索
      if (this.searchForm.assignmentName) {
        filtered = filtered.filter(assignment => 
          assignment.assignmentName.toLowerCase().includes(this.searchForm.assignmentName.toLowerCase())
        )
      }

      // 按时间范围筛选
      if (this.dateRange && this.dateRange.length === 2) {
        const startDate = this.dateRange[0]
        const endDate = this.dateRange[1]
        filtered = filtered.filter(assignment => {
          const publishDate = new Date(assignment.publishTime)
          return publishDate >= startDate && publishDate <= endDate
        })
      }

      return filtered
    },
    totalAssignments() {
      return this.assignments.length
    },
    pendingAssignments() {
      return this.assignments.filter(assignment => assignment.status === 'pending').length
    },
    submittedAssignments() {
      return this.assignments.filter(assignment => assignment.status === 'submitted').length
    },
    gradedAssignments() {
      return this.assignments.filter(assignment => assignment.status === 'graded').length
    }
  },
  methods: {
    // 加载作业数据
    async loadAssignments() {
      this.loading = true
      try {
        const params = {
          type: this.assignmentType !== 'all' ? this.assignmentType : undefined,
          courseName: this.searchForm.courseName || undefined,
          assignmentName: this.searchForm.assignmentName || undefined,
          startDate: this.dateRange && this.dateRange.length === 2 ? this.dateRange[0] : undefined,
          endDate: this.dateRange && this.dateRange.length === 2 ? this.dateRange[1] : undefined,
          page: this.currentPage,
          pageSize: this.pageSize
        }
        
        const response = await api.get('/student/assignments', { params })
        if (response.data && response.data.success) {
          this.assignments = response.data.data || []
          this.$message.success('作业列表加载成功', { duration: 1000 })
        } else {
          throw new Error(response.data?.message || 'API返回数据格式错误')
        }
      } catch (error) {
        console.error('获取作业列表失败:', error)
        this.$message.error('获取作业列表失败，请检查网络连接或稍后重试')
        // 不再使用模拟数据，保持数据为空以显示实际结果
        this.assignments = []
      } finally {
        this.loading = false
      }
    },
    
    // 使用模拟数据作为后备方案
    useMockData() {
      this.assignments = [
        {
          id: 1,
          courseName: '高等数学',
          assignmentName: '第一章习题',
          description: '完成教材第一章后的练习题1-10',
          requirements: '请独立完成作业，写出详细的解题步骤。',
          teacherName: '张老师',
          publishTime: '2025-10-15',
          deadline: '2025-10-25',
          status: 'pending',
          totalScore: 100,
          score: null,
          attachments: [
            { id: 1, name: '第一章习题.pdf', size: '2.5MB', url: '' }
          ]
        },
        {
          id: 2,
          courseName: '计算机基础',
          assignmentName: '编程基础练习',
          description: '编写一个简单的计算器程序',
          requirements: '使用Java语言实现，包含加减乘除功能。',
          teacherName: '李老师',
          publishTime: '2025-10-10',
          deadline: '2025-10-20',
          status: 'submitted',
          totalScore: 100,
          score: null,
          attachments: [],
          submission: {
            id: 1,
            content: '已完成计算器程序，实现了加减乘除功能。',
            submitTime: '2025-10-18',
            files: [
              { id: 1, name: 'Calculator.java', size: '2KB', url: '' }
            ]
          }
        },
        {
          id: 3,
          courseName: '英语',
          assignmentName: '阅读理解',
          description: '完成Unit 5的阅读理解练习',
          requirements: '仔细阅读文章，回答问题。',
          teacherName: '王老师',
          publishTime: '2025-10-05',
          deadline: '2025-10-15',
          status: 'graded',
          totalScore: 100,
          score: 85,
          attachments: [
            { id: 1, name: 'Unit5_Reading.pdf', size: '1.8MB', url: '' }
          ],
          submission: {
            id: 1,
            content: '已完成阅读理解练习。',
            submitTime: '2025-10-14',
            files: [
              { id: 1, name: 'answers.docx', size: '15KB', url: '' }
            ]
          },
          feedback: {
            id: 1,
            content: '整体表现不错，但部分理解有误，需要加强词汇积累。',
            score: 85,
            gradeTime: '2025-10-16'
          }
        },
        {
          id: 4,
          courseName: '物理',
          assignmentName: '力学实验报告',
          description: '完成力学实验的实验报告',
          requirements: '按照实验报告模板填写，包含实验目的、原理、步骤、数据记录和结论。',
          teacherName: '陈老师',
          publishTime: '2025-10-01',
          deadline: '2025-10-10',
          status: 'overdue',
          totalScore: 100,
          score: null,
          attachments: [
            { id: 1, name: '实验报告模板.docx', size: '350KB', url: '' },
            { id: 2, name: '实验指导书.pdf', size: '5MB', url: '' }
          ]
        }
      ]
    },
    
    handleTypeChange() {
      this.currentPage = 1
      this.loadAssignments()
    },
    handleSearch() {
      this.currentPage = 1
      this.loadAssignments()
    },
    resetSearch() {
      this.searchForm = {
        courseName: '',
        assignmentName: ''
      }
      this.dateRange = []
      this.assignmentType = 'all'
      this.currentPage = 1
      this.loadAssignments()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.loadAssignments()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.loadAssignments()
    },
    isOverdue(assignment) {
      return assignment.status === 'overdue'
    },
    getStatusTagType(status) {
      const statusMap = {
        pending: 'warning',
        submitted: 'info',
        graded: 'success',
        overdue: 'danger'
      }
      return statusMap[status] || 'default'
    },
    getStatusText(status) {
      const statusMap = {
        pending: '待提交',
        submitted: '已提交',
        graded: '已批改',
        overdue: '已过期'
      }
      return statusMap[status] || status
    },
    viewAssignmentDetails(assignment) {
      this.loadAssignmentDetails(assignment.id)
    },
    
    // 加载作业详情
    async loadAssignmentDetails(assignmentId) {
      this.loading = true
      try {
        const response = await api.get(`/student/assignments/${assignmentId}`)
        if (response.data && response.data.success) {
          this.selectedAssignment = response.data.data
          this.showDetailsDialog = true
        } else {
          throw new Error('获取作业详情失败')
        }
      } catch (error) {
        console.error('获取作业详情失败:', error)
        // 在API失败时，使用列表中已有的数据
        const assignment = this.assignments.find(a => a.id === assignmentId)
        if (assignment) {
          this.selectedAssignment = { ...assignment }
          this.showDetailsDialog = true
          this.$message.warning('使用缓存的作业数据')
        } else {
          this.$message.error('获取作业详情失败')
        }
      } finally {
        this.loading = false
      }
    },
    handleCloseDetailsDialog() {
      this.selectedAssignment = null
      this.showDetailsDialog = false
    },
    submitAssignment(assignment) {
      this.selectedAssignment = { ...assignment }
      this.submitForm = {
        content: '',
        files: []
      }
      this.showSubmitDialog = true
    },
    submitAssignmentInDialog() {
      this.submitForm = {
        content: '',
        files: []
      }
      this.showDetailsDialog = false
      this.showSubmitDialog = true
    },
    handleCloseSubmitDialog() {
      this.selectedAssignment = null
      this.submitForm = {
        content: '',
        files: []
      }
      this.showSubmitDialog = false
    },
    viewSubmission(assignment) {
      this.selectedAssignment = { ...assignment }
      this.showDetailsDialog = true
    },
    viewSubmissionDetails() {
      if (!this.selectedAssignment?.submission) {
        this.$message.warning('暂无提交记录')
        return
      }
      
      // 可以跳转到提交详情页面或打开新的模态框
      // 这里简单实现为提示信息
      this.$message.info(`查看作业《${this.selectedAssignment.assignmentName}》的提交详情`)
      
      // 预留API调用接口
      // api.get(`/student/assignments/${this.selectedAssignment.id}/submission`)
    },
    viewFeedback(assignment) {
      this.selectedAssignment = { ...assignment }
      this.showDetailsDialog = true
    },
    viewFeedbackDetails() {
      if (!this.selectedAssignment?.feedback) {
        this.$message.warning('暂无教师反馈')
        return
      }
      
      // 可以跳转到反馈详情页面或打开新的模态框
      // 这里简单实现为提示信息
      this.$message.info(`查看作业《${this.selectedAssignment.assignmentName}》的教师反馈`)
      
      // 预留API调用接口
      // api.get(`/student/assignments/${this.selectedAssignment.id}/feedback`)
    },
    handleFileChange(file, fileList) {
      // 限制文件类型和大小
      const validTypes = ['doc', 'docx', 'pdf', 'zip', 'rar', 'jpg', 'png']
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      const fileName = file.name.toLowerCase()
      const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1)
      
      if (!validTypes.includes(fileExtension)) {
        this.$message.error('不支持的文件类型，请上传doc、docx、pdf、zip、rar、jpg、png格式文件')
        return false
      }
      
      if (file.size > maxSize) {
        this.$message.error('文件大小超过限制，请上传小于10MB的文件')
        return false
      }
      
      this.submitForm.files = fileList
      return true
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制只能上传5个文件，请先删除已上传的文件再继续。`)
    },
    confirmSubmit() {
      // 作业提交前确认
      this.$confirm('确认提交作业吗？提交后将无法修改。', '提交确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$refs.submitFormRef.validate(async (valid) => {
          if (valid && this.selectedAssignment) {
            this.loading = true
            try {
              // 准备提交数据
              const formData = new FormData()
              formData.append('assignmentId', this.selectedAssignment.id)
              formData.append('content', this.submitForm.content)
              
              // 添加文件
              this.submitForm.files.forEach(file => {
                formData.append('files', file.raw)
              })
              
              // 调用后端API提交作业
              const response = await api.post('/student/assignments/submit', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              })
              
              if (response.data && response.data.success) {
                this.$message.success('作业提交成功')
                this.handleCloseSubmitDialog()
                this.loadAssignments() // 重新加载作业列表
              } else {
                this.$message.error(response.data?.message || '提交失败')
              }
            } catch (error) {
              console.error('提交作业失败:', error)
              this.$message.error('作业提交失败，请检查网络连接后重试')
              
              // 模拟提交成功（开发环境用）
              this.$message.warning('正在使用离线模式提交...')
              this.$message.success('模拟作业提交成功')
              this.handleCloseSubmitDialog()
              const assignmentIndex = this.assignments.findIndex(a => a.id === this.selectedAssignment.id)
              if (assignmentIndex !== -1) {
                this.assignments[assignmentIndex].status = 'submitted'
                this.assignments[assignmentIndex].submission = {
                  id: Date.now(),
                  content: this.submitForm.content,
                  submitTime: new Date().toISOString().split('T')[0],
                  files: this.submitForm.files.map(file => ({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: `${Math.round(file.size / 1024)}KB`,
                    url: ''
                  }))
                }
              }
            } finally {
              this.loading = false
            }
          }
        })
      }).catch(() => {
        this.$message.info('已取消提交')
      })
    },
    downloadAttachment(attachment) {
      // 下载附件的逻辑
      if (!attachment) {
        this.$message.warning('附件信息无效')
        return
      }
      
      // 记录下载行为
      api.post(`/student/assignments/attachments/${attachment.id}/download-log`)
        .catch(() => {})
      
      if (attachment.url) {
        // 使用a标签下载而不是window.open，避免被浏览器阻止
        const link = document.createElement('a')
        link.href = attachment.url
        link.download = attachment.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        this.$message.success(`开始下载：${attachment.name}`)
      } else if (attachment.id) {
        try {
          // 尝试获取下载链接
          api.get(`/student/assignments/attachments/${attachment.id}/download-link`)
            .then(response => {
              const downloadUrl = response.data?.url || `${api.defaults.baseURL}/student/assignments/attachments/${attachment.id}`
              const link = document.createElement('a')
              link.href = downloadUrl
              link.download = attachment.name
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              this.$message.success(`开始下载：${attachment.name}`)
            })
            .catch(error => {
              console.error('获取下载链接失败:', error)
              // 失败时直接尝试下载
              const fallbackUrl = `${api.defaults.baseURL || window.location.origin}/student/assignments/attachments/${attachment.id}`
              window.open(fallbackUrl, '_blank')
              this.$message.warning(`尝试直接下载：${attachment.name}`)
            })
        } catch (error) {
          console.error('下载附件失败:', error)
          this.$message.error('下载附件失败，请稍后重试')
        }
      } else {
        this.$message.warning('无法下载附件，缺少必要信息')
      }
    },
    downloadSubmissionFile(file) {
      // 下载提交文件的逻辑
      if (!file) {
        this.$message.warning('文件信息无效')
        return
      }
      
      if (file.url) {
        // 使用a标签下载而不是window.open，避免被浏览器阻止
        const link = document.createElement('a')
        link.href = file.url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        this.$message.success(`开始下载：${file.name}`)
      } else if (file.id) {
        try {
          // 尝试获取下载链接
          api.get(`/student/assignments/submissions/files/${file.id}/download-link`)
            .then(response => {
              const downloadUrl = response.data?.url || `${api.defaults.baseURL}/student/assignments/submissions/files/${file.id}`
              const link = document.createElement('a')
              link.href = downloadUrl
              link.download = file.name
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              this.$message.success(`开始下载：${file.name}`)
            })
            .catch(error => {
              console.error('获取下载链接失败:', error)
              // 失败时直接尝试下载
              const fallbackUrl = `${api.defaults.baseURL || window.location.origin}/student/assignments/submissions/files/${file.id}`
              window.open(fallbackUrl, '_blank')
              this.$message.warning(`尝试直接下载：${file.name}`)
            })
        } catch (error) {
          console.error('下载提交文件失败:', error)
          this.$message.error('下载提交文件失败，请稍后重试')
        }
      } else {
        this.$message.warning('无法下载文件，缺少必要信息')
      }
    }
  }
}
</script>

<style scoped>
.assignments-container {
  padding: 20px;
}

.assignments-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filter-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
}

.stats-container {
  margin-bottom: 20px;
}

.stats-card {
  margin-bottom: 0;
}

.stat-item {
  text-align: center;
  padding: 15px 0;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.stat-item.warning {
  background-color: #fdf6ec;
}

.stat-item.info {
  background-color: #edf2fc;
}

.stat-item.success {
  background-color: #f0f9eb;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.assignments-list-card {
  margin-bottom: 20px;
}

.assignment-name {
  font-weight: 500;
}

.overdue-date {
  color: #f56c6c;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 作业详情对话框样式 */
.assignment-details {
  max-height: 60vh;
  overflow-y: auto;
}

.assignment-description,
.assignment-requirements {
  white-space: pre-line;
  line-height: 1.8;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.attachment-item:hover {
  background-color: #ecf5ff;
}

.attachment-icon {
  color: #409eff;
}

.attachment-name {
  flex: 1;
}

.attachment-size {
  color: #909399;
  font-size: 12px;
}

.submission-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.submission-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.submission-label {
  font-weight: 500;
  color: #606266;
}

.submission-content {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  white-space: pre-line;
  line-height: 1.8;
}

.submission-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.submission-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background-color: #ecf5ff;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submission-file:hover {
  background-color: #d9ecff;
}

.file-icon {
  color: #66b1ff;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.feedback-content {
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border-left: 4px solid #67c23a;
}

.feedback-text {
  margin-bottom: 10px;
  white-space: pre-line;
  line-height: 1.8;
}

.feedback-score {
  font-weight: 500;
  margin-bottom: 5px;
}

.feedback-time {
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 提交作业对话框样式 */
.submit-assignment {
  max-height: 60vh;
  overflow-y: auto;
}
</style>