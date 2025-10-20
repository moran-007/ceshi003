import axios from 'axios'
import router from '../router'

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      // 添加Authorization头
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误和token过期
api.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response
  },
  error => {
    // 处理错误响应
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 401:
          // 未授权 - token过期或无效
          // 清除本地存储的认证信息
          localStorage.removeItem('token')
          localStorage.removeItem('role')
          localStorage.removeItem('userInfo')
          // 跳转到登录页
          router.push('/login')
          break
        case 403:
          // 禁止访问
          console.error('无权限访问此资源')
          break
        case 404:
          // 资源未找到
          console.error('请求的资源不存在')
          break
        case 500:
          // 服务器错误
          console.error('服务器内部错误')
          break
        default:
          console.error(`请求失败: ${error.response.status}`)
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误，请检查您的网络连接')
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api