<template>
  <div class="student-profile">
    <div class="profile-header">
      <h2>个人中心</h2>
    </div>
    
    <div class="profile-content">
      <!-- 个人信息展示区域 -->
      <div class="info-card">
        <h3>个人信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>用户名:</label>
            <span>{{ userData.username }}</span>
          </div>
          <div class="info-item">
            <label>学生ID:</label>
            <span>{{ userData.studentId }}</span>
          </div>
          <div class="info-item">
            <label>角色:</label>
            <span>{{ userData.role }}</span>
          </div>
          <div class="info-item">
            <label>班级:</label>
            <span>{{ userData.class }}</span>
          </div>
        </div>
      </div>
      
      <!-- 密码修改区域 -->
      <div class="password-card">
        <h3>修改密码</h3>
        <form @submit.prevent="handlePasswordChange" class="password-form">
          <div class="form-group">
            <label for="currentPassword">当前密码</label>
            <input 
              type="password" 
              id="currentPassword" 
              v-model="currentPassword"
              required
              placeholder="请输入当前密码"
              :class="{ 'error': errors.currentPassword }"
            />
            <span v-if="errors.currentPassword" class="error-message">{{ errors.currentPassword }}</span>
          </div>
          
          <div class="form-group">
            <label for="newPassword">新密码</label>
            <input 
              type="password" 
              id="newPassword" 
              v-model="newPassword"
              required
              placeholder="请输入新密码"
              :class="{ 'error': errors.newPassword }"
            />
            <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">确认新密码</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="confirmPassword"
              required
              placeholder="请确认新密码"
              :class="{ 'error': errors.confirmPassword }"
            />
            <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? '提交中...' : '确认修改' }}
            </button>
          </div>
        </form>
        
        <!-- 密码修改成功提示 -->
        <div v-if="showSuccess" class="success-message">
          密码修改成功！
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import userState from '../store'

export default {
  name: 'StudentProfile',
  setup() {
    // 计算属性提供模拟数据支持
    const userData = computed(() => {
      // 如果userState有数据，优先使用
      if (userState.studentData || userState.username) {
        return {
          username: userState.username,
          studentId: userState.studentData?.studentId,
          role: userState.role,
          class: userState.studentData?.class
        }
      }
      
      // 提供默认模拟数据
      return {
        username: '张三',
        studentId: '20210001',
        role: '学生',
        class: '计算机科学与技术 2021级一班'
      }
    })
    
    // 密码表单数据
    const currentPassword = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    
    // 状态管理
    const isSubmitting = ref(false)
    const showSuccess = ref(false)
    const errors = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // 密码验证规则
    const validatePassword = (password) => {
      if (!password || password.length < 6) {
        return '密码长度不能少于6位'
      }
      if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        return '密码必须包含字母和数字'
      }
      return ''
    }
    
    // 表单验证
    const validateForm = () => {
      let isValid = true
      
      // 重置错误信息
      errors.currentPassword = ''
      errors.newPassword = ''
      errors.confirmPassword = ''
      
      // 验证当前密码 (这里使用模拟数据，假设当前密码为 '123456')
      if (currentPassword.value !== '123456') {
        errors.currentPassword = '当前密码错误'
        isValid = false
      }
      
      // 验证新密码
      const newPasswordError = validatePassword(newPassword.value)
      if (newPasswordError) {
        errors.newPassword = newPasswordError
        isValid = false
      }
      
      // 验证确认密码
      if (newPassword.value !== confirmPassword.value) {
        errors.confirmPassword = '两次输入的密码不一致'
        isValid = false
      }
      
      return isValid
    }
    
    // 处理密码修改
    const handlePasswordChange = async () => {
      // 表单验证
      if (!validateForm()) {
        return
      }
      
      try {
        isSubmitting.value = true
        
        // 使用模拟延迟模拟请求过程
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 显示成功消息
        showSuccess.value = true
        
        // 清空表单
        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
        
        // 3秒后隐藏成功消息
        setTimeout(() => {
          showSuccess.value = false
        }, 3000)
        
      } catch (error) {
        console.error('密码修改失败:', error)
      } finally {
        isSubmitting.value = false
      }
    }
    
    return {
      userState,
      userData,
      currentPassword,
      newPassword,
      confirmPassword,
      isSubmitting,
      showSuccess,
      errors,
      handlePasswordChange
    }
  }
}
</script>

<style scoped>
.student-profile {
  padding: 20px;
  max-width: 1024px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 30px;
}

.profile-header h2 {
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.profile-content {
  display: grid;
  gap: 25px;
}

.info-card,
.password-card {
  background-color: #fafbfc;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-card h3,
.password-card h3 {
  color: #555;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 2px solid #e1e8ed;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.info-item span {
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.password-form {
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
  color: #666;
  font-size: 14px;
}

.form-group input {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #e53935;
}

.error-message {
  color: #e53935;
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-submit {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  background-color: #e8f5e9;
  color: #4caf50;
  padding: 15px;
  border-radius: 5px;
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    justify-content: center;
  }
  
  .btn-submit {
    width: 100%;
  }
}
</style>