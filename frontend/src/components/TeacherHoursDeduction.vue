<template>
  <div class="teacher-hours-deduction">
    <div class="page-header">
      <button class="back-button" @click="goBack">← 返回仪表盘</button>
      <h2>课时扣除操作</h2>
    </div>

    <div class="deduction-container">
      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <div class="search-section">
          <div class="search-input">
            <input 
              type="text" 
              v-model="searchQuery" 
              @input="handleSearch" 
              placeholder="搜索学生姓名或学号"
            >
            <span class="search-icon">🔍</span>
          </div>
        </div>
        <div class="filter-section">
          <select v-model="selectedCourse" @change="filterStudents">
            <option value="">所有课程</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.name }}</option>
          </select>
          <select v-model="selectedStatus" @change="filterStudents">
            <option value="">所有状态</option>
            <option value="active">正常</option>
            <option value="paused">已暂停</option>
            <option value="expired">已过期</option>
          </select>
        </div>
      </div>

      <!-- 学生列表 -->
      <div class="students-list">
        <div class="list-header">
          <div class="header-item">学生信息</div>
          <div class="header-item">课程</div>
          <div class="header-item">剩余课时</div>
          <div class="header-item">操作</div>
        </div>
        <div class="list-content">
          <div 
            v-for="student in filteredStudents" 
            :key="student.id" 
            class="student-item"
          >
            <div class="student-info">
              <div class="student-name">{{ student.name }}</div>
              <div class="student-id">学号: {{ student.studentId }}</div>
            </div>
            <div class="student-course">
              {{ student.courseName }}
            </div>
            <div class="student-hours">
              <div class="hours-display" :class="getHoursStatusClass(student.remainingHours)">
                {{ student.remainingHours }} 课时
              </div>
            </div>
            <div class="student-actions">
              <button class="action-button small primary" @click="openDeductionModal(student)">
                扣除课时
              </button>
              <button class="action-button small" @click="viewStudentDetails(student.id)">
                查看详情
              </button>
            </div>
          </div>
        </div>
        <div v-if="filteredStudents.length === 0" class="empty-state">
          <p>没有找到匹配的学生</p>
        </div>
      </div>

      <!-- 批量扣除 -->
      <div class="batch-section">
        <h3 class="section-title">批量扣除课时</h3>
        <div class="batch-actions">
          <button class="action-button primary" @click="openBatchModal">批量扣除</button>
          <button class="action-button" @click="importAttendance">导入出勤记录</button>
        </div>
      </div>
    </div>

    <!-- 课时扣除模态框 -->
    <div v-if="showDeductionModal" class="modal-overlay" @click="closeDeductionModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>扣除课时 - {{ selectedStudent?.name }}</h3>
          <button class="close-button" @click="closeDeductionModal">×</button>
        </div>
        <div class="modal-body">
          <div class="deduction-form">
            <div class="form-group">
              <label>学生信息</label>
              <div class="info-display">
                <span>{{ selectedStudent?.name }}</span>
                <span>({{ selectedStudent?.studentId }})</span>
              </div>
            </div>
            <div class="form-group">
              <label>课程名称</label>
              <div class="info-display">{{ selectedStudent?.courseName }}</div>
            </div>
            <div class="form-group">
              <label>当前剩余课时</label>
              <div class="info-display">{{ selectedStudent?.remainingHours }} 课时</div>
            </div>
            <div class="form-group">
              <label>扣除课时数 <span class="required">*</span></label>
              <input 
                type="number" 
                v-model.number="deductionHours" 
                min="1" 
                :max="selectedStudent?.remainingHours"
                placeholder="请输入扣除课时数"
              >
              <div v-if="deductionError" class="error-message">{{ deductionError }}</div>
            </div>
            <div class="form-group">
              <label>扣除原因 <span class="required">*</span></label>
              <select v-model="deductionReason">
                <option value="">请选择扣除原因</option>
                <option value="normal_class">正常上课</option>
                <option value="makeup_class">补课</option>
                <option value="special_training">特训课程</option>
                <option value="other">其他原因</option>
              </select>
            </div>
            <div class="form-group">
              <label>备注</label>
              <textarea v-model="deductionRemark" placeholder="请输入备注信息（选填）"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-button" @click="closeDeductionModal">取消</button>
          <button 
            class="action-button primary" 
            @click="confirmDeduction" 
            :disabled="!canConfirmDeduction"
          >
            确认扣除
          </button>
        </div>
      </div>
    </div>

    <!-- 批量扣除模态框 -->
    <div v-if="showBatchModal" class="modal-overlay" @click="closeBatchModal">
      <div class="modal-content batch-modal" @click.stop>
        <div class="modal-header">
          <h3>批量扣除课时</h3>
          <button class="close-button" @click="closeBatchModal">×</button>
        </div>
        <div class="modal-body">
          <div class="batch-form">
            <div class="form-group">
              <label>选择课程 <span class="required">*</span></label>
              <select v-model="batchCourseId" @change="loadCourseStudents">
                <option value="">请选择课程</option>
                <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>扣除课时数 <span class="required">*</span></label>
              <input 
                type="number" 
                v-model.number="batchDeductionHours" 
                min="1" 
                placeholder="请输入扣除课时数"
              >
            </div>
            <div class="form-group">
              <label>扣除原因 <span class="required">*</span></label>
              <select v-model="batchDeductionReason">
                <option value="">请选择扣除原因</option>
                <option value="normal_class">正常上课</option>
                <option value="makeup_class">补课</option>
                <option value="special_training">特训课程</option>
              </select>
            </div>
            <div class="form-group">
              <label>选择学生</label>
              <div class="students-selection">
                <div 
                  v-for="student in courseStudents" 
                  :key="student.id" 
                  class="student-checkbox"
                >
                  <input 
                    type="checkbox" 
                    :id="`student-${student.id}`" 
                    :value="student.id"
                    v-model="selectedStudentsIds"
                  >
                  <label :for="`student-${student.id}`">
                    <span class="student-name">{{ student.name }}</span>
                    <span class="student-hours">(剩余: {{ student.remainingHours }}课时)</span>
                  </label>
                </div>
              </div>
              <div class="selection-actions">
                <button class="small-button" @click="selectAllStudents">全选</button>
                <button class="small-button" @click="deselectAllStudents">取消全选</button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-button" @click="closeBatchModal">取消</button>
          <button 
            class="action-button primary" 
            @click="confirmBatchDeduction" 
            :disabled="!canConfirmBatchDeduction"
          >
            确认批量扣除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'TeacherHoursDeduction',
  setup() {
    const router = useRouter()
    
    // 搜索和筛选
    const searchQuery = ref('')
    const selectedCourse = ref('')
    const selectedStatus = ref('')
    
    // 模态框状态
    const showDeductionModal = ref(false)
    const showBatchModal = ref(false)
    const selectedStudent = ref(null)
    const deductionHours = ref(1)
    const deductionReason = ref('')
    const deductionRemark = ref('')
    const deductionError = ref('')
    
    // 批量扣除
    const batchCourseId = ref('')
    const batchDeductionHours = ref(1)
    const batchDeductionReason = ref('')
    const selectedStudentsIds = ref([])
    
    // 课程数据
    const courses = ref([
      { id: 1, name: '数据结构' },
      { id: 2, name: '算法分析' },
      { id: 3, name: '数据库原理' },
      { id: 4, name: '操作系统' },
      { id: 5, name: '计算机网络' }
    ])
    
    // 学生数据
    const students = ref([
      { id: 1, name: '张三', studentId: '20210001', courseId: 1, courseName: '数据结构', remainingHours: 32, status: 'active' },
      { id: 2, name: '李四', studentId: '20210002', courseId: 2, courseName: '算法分析', remainingHours: 28, status: 'active' },
      { id: 3, name: '王五', studentId: '20210003', courseId: 1, courseName: '数据结构', remainingHours: 15, status: 'active' },
      { id: 4, name: '赵六', studentId: '20210004', courseId: 3, courseName: '数据库原理', remainingHours: 40, status: 'active' },
      { id: 5, name: '钱七', studentId: '20210005', courseId: 2, courseName: '算法分析', remainingHours: 5, status: 'active' },
      { id: 6, name: '孙八', studentId: '20210006', courseId: 4, courseName: '操作系统', remainingHours: 25, status: 'paused' },
      { id: 7, name: '周九', studentId: '20210007', courseId: 5, courseName: '计算机网络', remainingHours: 0, status: 'expired' },
      { id: 8, name: '吴十', studentId: '20210008', courseId: 3, courseName: '数据库原理', remainingHours: 30, status: 'active' }
    ])
    
    // 根据筛选条件过滤学生
    const filteredStudents = computed(() => {
      return students.value.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                             student.studentId.includes(searchQuery.value)
        const matchesCourse = !selectedCourse.value || student.courseId === parseInt(selectedCourse.value)
        const matchesStatus = !selectedStatus.value || student.status === selectedStatus.value
        return matchesSearch && matchesCourse && matchesStatus
      })
    })
    
    // 获取课时状态类名
    const getHoursStatusClass = (hours) => {
      if (hours <= 5) return 'hours-low'
      if (hours <= 15) return 'hours-medium'
      return 'hours-normal'
    }
    
    // 处理搜索
    const handleSearch = () => {
      deductionError.value = ''
    }
    
    // 过滤学生
    const filterStudents = () => {
      // 过滤逻辑已在computed中处理
    }
    
    // 打开扣除模态框
    const openDeductionModal = (student) => {
      selectedStudent.value = student
      deductionHours.value = 1
      deductionReason.value = ''
      deductionRemark.value = ''
      deductionError.value = ''
      showDeductionModal.value = true
    }
    
    // 关闭扣除模态框
    const closeDeductionModal = () => {
      showDeductionModal.value = false
      selectedStudent.value = null
      deductionError.value = ''
    }
    
    // 确认扣除
    const confirmDeduction = () => {
      // 验证
      if (!deductionHours.value || deductionHours.value <= 0) {
        deductionError.value = '请输入有效的扣除课时数'
        return
      }
      if (!selectedStudent.value) {
        deductionError.value = '未选择学生'
        return
      }
      if (deductionHours.value > selectedStudent.value.remainingHours) {
        deductionError.value = '扣除课时数不能大于剩余课时数'
        return
      }
      if (!deductionReason.value) {
        deductionError.value = '请选择扣除原因'
        return
      }
      
      // 执行扣除操作
      const studentIndex = students.value.findIndex(s => s.id === selectedStudent.value.id)
      if (studentIndex !== -1) {
        students.value[studentIndex].remainingHours -= deductionHours.value
        
        // 检查是否需要更新状态
        if (students.value[studentIndex].remainingHours <= 0) {
          students.value[studentIndex].status = 'expired'
        }
      }
      
      alert(`成功扣除 ${deductionHours.value} 课时`)
      closeDeductionModal()
    }
    
    // 计算是否可以确认扣除
    const canConfirmDeduction = computed(() => {
      return deductionHours.value > 0 && 
             selectedStudent.value && 
             deductionHours.value <= selectedStudent.value.remainingHours &&
             !!deductionReason.value
    })
    
    // 查看学生详情
    const viewStudentDetails = (studentId) => {
      router.push(`/home/teacher/students?id=${studentId}`)
    }
    
    // 批量扣除相关
    const loadCourseStudents = () => {
      selectedStudentsIds.value = []
    }
    
    const courseStudents = computed(() => {
      if (!batchCourseId.value) return []
      return students.value.filter(s => s.courseId === parseInt(batchCourseId.value) && s.status === 'active')
    })
    
    const selectAllStudents = () => {
      selectedStudentsIds.value = courseStudents.value.map(s => s.id)
    }
    
    const deselectAllStudents = () => {
      selectedStudentsIds.value = []
    }
    
    const openBatchModal = () => {
      batchCourseId.value = ''
      batchDeductionHours.value = 1
      batchDeductionReason.value = ''
      selectedStudentsIds.value = []
      showBatchModal.value = true
    }
    
    const closeBatchModal = () => {
      showBatchModal.value = false
    }
    
    const confirmBatchDeduction = () => {
      if (!batchCourseId.value || !batchDeductionHours.value || batchDeductionHours.value <= 0 || 
          !batchDeductionReason.value || selectedStudentsIds.value.length === 0) {
        alert('请填写完整信息并选择学生')
        return
      }
      
      // 验证所有选中学生的课时是否足够
      const invalidStudents = selectedStudentsIds.value.filter(id => {
        const student = students.value.find(s => s.id === id)
        return !student || student.remainingHours < batchDeductionHours.value
      })
      
      if (invalidStudents.length > 0) {
        alert('部分学生剩余课时不足，无法完成批量扣除')
        return
      }
      
      // 执行批量扣除
      selectedStudentsIds.value.forEach(id => {
        const index = students.value.findIndex(s => s.id === id)
        if (index !== -1) {
          students.value[index].remainingHours -= batchDeductionHours.value
          if (students.value[index].remainingHours <= 0) {
            students.value[index].status = 'expired'
          }
        }
      })
      
      alert(`成功批量扣除 ${selectedStudentsIds.value.length} 名学生的课时，每人 ${batchDeductionHours.value} 课时`)
      closeBatchModal()
    }
    
    const canConfirmBatchDeduction = computed(() => {
      return batchCourseId.value && 
             batchDeductionHours.value > 0 && 
             batchDeductionReason.value && 
             selectedStudentsIds.value.length > 0
    })
    
    const importAttendance = () => {
      alert('导入出勤记录功能开发中...')
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
    })
    
    return {
      searchQuery,
      selectedCourse,
      selectedStatus,
      filteredStudents,
      getHoursStatusClass,
      handleSearch,
      filterStudents,
      showDeductionModal,
      selectedStudent,
      deductionHours,
      deductionReason,
      deductionRemark,
      deductionError,
      canConfirmDeduction,
      openDeductionModal,
      closeDeductionModal,
      confirmDeduction,
      viewStudentDetails,
      showBatchModal,
      batchCourseId,
      batchDeductionHours,
      batchDeductionReason,
      selectedStudentsIds,
      courseStudents,
      canConfirmBatchDeduction,
      openBatchModal,
      closeBatchModal,
      confirmBatchDeduction,
      selectAllStudents,
      deselectAllStudents,
      loadCourseStudents,
      importAttendance,
      courses,
      goBack
    }
  }
}
</script>

<style scoped>
.teacher-hours-deduction {
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

.deduction-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 搜索和筛选 */
.search-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 20px 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-section {
  flex: 1;
  max-width: 400px;
}

.search-input {
  position: relative;
}

.search-input input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #e0e2e5;
  border-radius: 8px;
  font-size: 16px;
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.filter-section {
  display: flex;
  gap: 15px;
}

.filter-section select {
  padding: 12px 20px;
  border: 1px solid #e0e2e5;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
}

/* 学生列表 */
.students-list {
  background-color: white;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1.5fr;
  padding: 20px 25px;
  background-color: #f8f9fa;
  border-bottom: 2px solid #e0e2e5;
}

.header-item {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.list-content {
  max-height: 600px;
  overflow-y: auto;
}

.student-item {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1.5fr;
  padding: 20px 25px;
  border-bottom: 1px solid #f0f2f5;
  align-items: center;
  transition: background-color 0.2s ease;
}

.student-item:hover {
  background-color: #f8f9fa;
}

.student-item:last-child {
  border-bottom: none;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.student-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.student-id {
  font-size: 14px;
  color: #666;
}

.student-course {
  font-size: 14px;
  color: #333;
}

.student-hours {
  display: flex;
  align-items: center;
}

.hours-display {
  font-size: 16px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
}

.hours-normal {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.hours-medium {
  background-color: #fff3e0;
  color: #ef6c00;
}

.hours-low {
  background-color: #ffebee;
  color: #c62828;
}

.student-actions {
  display: flex;
  gap: 10px;
}

/* 批量扣除 */
.batch-section {
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f2f5;
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
}

.modal-content.batch-modal {
  max-width: 800px;
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

/* 表单样式 */
.deduction-form,
.batch-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.required {
  color: #f44336;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 1px solid #e0e2e5;
  border-radius: 6px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.info-display {
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  font-size: 16px;
  color: #333;
}

.error-message {
  color: #f44336;
  font-size: 14px;
}

/* 批量选择学生 */
.students-selection {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e0e2e5;
  border-radius: 6px;
  padding: 10px;
}

.student-checkbox {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.student-checkbox:hover {
  background-color: #f8f9fa;
}

.student-checkbox input {
  margin-right: 10px;
}

.student-checkbox label {
  font-size: 14px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-checkbox .student-hours {
  color: #666;
  font-size: 13px;
}

.selection-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
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

.action-button.small.primary {
  background-color: #667eea;
  color: white;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-filter {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .search-section {
    max-width: none;
  }
  
  .filter-section {
    justify-content: space-between;
  }
  
  .list-header {
    display: none;
  }
  
  .student-item {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 20px;
  }
  
  .student-actions {
    flex-direction: column;
  }
  
  .batch-actions {
    flex-direction: column;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer .action-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .filter-section select {
    width: 100%;
  }
}
</style>