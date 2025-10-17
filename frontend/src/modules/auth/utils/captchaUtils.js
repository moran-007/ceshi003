/**
 * 验证码工具函数
 */

// 生成随机验证码
export const generateCaptcha = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 获取随机背景色
export const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#10AC84'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 验证验证码是否正确
export const validateCaptcha = (userInput, actualCaptcha) => {
  return userInput.toLowerCase() === actualCaptcha.toLowerCase()
}