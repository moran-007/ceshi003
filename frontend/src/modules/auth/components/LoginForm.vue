<template>
  <div class="login-container">
    <div class="login-card">
      <h1>登录系统</h1>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            placeholder="请输入用户名"
            required
            @blur="validateField('username')"
            :class="{ 'error': errors.username }"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            placeholder="请输入密码"
            required
            @blur="validateField('password')"
            :class="{ 'error': errors.password }"
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>
        
        <div class="form-group">
          <label for="captcha">验证码</label>
          <div class="captcha-container">
            <input
              type="text"
              id="captcha"
              v-model="form.captcha"
              placeholder="请输入验证码"
              required
              @blur="validateField('captcha')"
              :class="{ 'error': errors.captcha }"
              class="captcha-input"
            />
            <div
              class="captcha-image"
              @click="refreshCaptcha"
              :style="{ 'background-color': getRandomColor() }"
            >
              {{ captchaText }}
            </div>
          </div>
          <span v-if="errors.captcha" class="error-message">{{ errors.captcha }}</span>
        </div>
        
        <button type="submit" class="login-button" :disabled="isSubmitting">
          {{ isSubmitting ? '登录中...' : '登录' }}
        </button>
        
        <div v-if="loginError" class="login-error-message">
          {{ loginError }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import userState from '../../../store/index.js'
import { generateCaptcha, getRandomColor, validateCaptcha } from '../utils/captchaUtils.js'
import { checkAccountValidity, loginApi, mockLogin } from '../services/authService.js'
import { validateUsername, validatePassword, validateCaptchaInput } from '../utils/validationUtils.js'

export default {
  name: 'LoginForm',
  setup() {
    const router = useRouter()
    const isSubmitting = ref(false)
    const captchaText = ref('')
    
    // 表单数据
    const form = reactive({
      username: '',
      password: '',
      captcha: ''
    })
    
    // 表单验证错误
    const errors = reactive({
      username: '',
      password: '',
      captcha: ''
    })
    
    // 登录错误信息
    const loginError = computed(() => userState.loginError)
    
    // 验证单个字段
    const validateField = (fieldName) => {
      switch (fieldName) {
        case 'username':
          errors.username = validateUsername(form.username)
          break
        case 'password':
          errors.password = validatePassword(form.password)
          break
        case 'captcha':
          errors.captcha = validateCaptchaInput(form.captcha)
          if (!errors.captcha && !validateCaptcha(form.captcha, captchaText.value)) {
            errors.captcha = '验证码不正确'
          }
          break
      }
    }
    
    // 刷新验证码
    const refreshCaptcha = () => {
      captchaText.value = generateCaptcha()
      errors.captcha = ''
      form.captcha = ''
    }
    
    // 处理登录
    const handleLogin = async () => {
      // 进行表单验证
      validateField('username')
      validateField('password')
      validateField('captcha')
      
      // 如果有验证错误，不提交
      if (errors.username || errors.password || errors.captcha) {
        return
      }
      
      // 检查账号有效性
      const isAccountValid = await checkAccountValidity()
      if (!isAccountValid) {
        userState.loginError = '账号无效或已被锁定'
        return
      }
      
      isSubmitting.value = true
      
      try {
        // 尝试使用API登录
        let loginResult
        try {
          loginResult = await loginApi(form.username, form.password)
        } catch (apiError) {
          // API调用失败，使用模拟登录
          console.log('API登录失败，使用模拟登录...')
          loginResult = mockLogin(form.username, form.password)
        }
        
        if (loginResult.success) {
          // 登录成功，根据角色重定向
          console.log('登录成功，用户角色：', userState.role)
          
          if (userState.role === 'student') {
            router.push('/home/student/dashboard')
          } else if (userState.role === 'teacher') {
            router.push('/home/teacher/dashboard')
          } else if (userState.role === 'admin') {
            router.push('/home/admin/dashboard')
          } else {
            // 默认重定向到首页
            router.push('/home')
          }
        } else {
          // 登录失败，显示错误信息
          console.log('登录失败：', loginResult.message)
          userState.loginError = loginResult.message || '登录失败'
          // 刷新验证码
          refreshCaptcha()
        }
      } catch (error) {
        console.error('登录异常：', error)
        userState.loginError = error.message || '登录时发生异常，请重试'
        // 刷新验证码
        refreshCaptcha()
      } finally {
        isSubmitting.value = false
      }
    }
    
    // 组件挂载时生成验证码
    onMounted(() => {
      refreshCaptcha()
    })
    
    return {
      form,
      errors,
      loginError,
      isSubmitting,
      captchaText,
      validateField,
      refreshCaptcha,
      getRandomColor,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.login-card {
  background-color: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  transition: transform 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
}

.login-card h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #4ECDC4;
}

.form-group input.error {
  border-color: #FF6B6B;
}

.error-message {
  color: #FF6B6B;
  font-size: 14px;
  margin-top: 5px;
}

.captcha-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 100px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
  letter-spacing: 5px;
}

.captcha-image:hover {
  transform: scale(1.05);
}

.login-button {
  background-color: #4ECDC4;
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover:not(:disabled) {
  background-color: #45b7aa;
}

.login-button:disabled {
  background-color: #a5d6d1;
  cursor: not-allowed;
}

.login-error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 10px;
  }
  
  .login-card {
    padding: 30px 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  .login-card h1 {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .form-group input {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .captcha-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .captcha-image {
    width: 100%;
    height: 40px;
  }
  
  .login-button {
    padding: 12px;
    font-size: 14px;
  }
}
</style>