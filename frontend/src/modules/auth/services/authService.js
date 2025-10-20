/**
 * 认证服务
 */
import { userState, login } from '../../../store/index.js'

// 检查账号有效性
export const checkAccountValidity = async () => {
  // 这里可以添加账号有效性检查逻辑
  // 例如检查账号是否存在、是否被锁定等
  // 由于使用模拟数据，这里暂时返回true
  return true
}

// 登录API调用
export const loginApi = async (username, password) => {
  try {
    // 调用后端API进行登录验证
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })

    return await response.json()
  } catch (error) {
    console.error('Login API error:', error)
    // 返回错误信息，让调用者处理
    throw error
  }
}

// 模拟登录逻辑（API调用失败时使用）
export const mockLogin = (username, password) => {
  if (!username || !password) {
    return {
      success: false,
      message: '用户名和密码不能为空'
    }
  }

  // 根据用户名推断角色
  let role = ''
  if (username.includes('student')) {
    role = 'student'
  } else if (username.includes('teacher')) {
    role = 'teacher'
  } else if (username.includes('admin')) {
    role = 'admin'
  } else {
    // 默认角色
    role = 'student'
  }

  // 使用store中定义的login函数处理登录逻辑
  const loginSuccess = login(username, password, role)
  
  return {
    success: loginSuccess,
    data: loginSuccess ? {
      token: localStorage.getItem('userToken'),
      user: {
        username,
        roleName: role
      }
    } : null,
    message: loginSuccess ? '' : '登录失败，请重试'
  }
}