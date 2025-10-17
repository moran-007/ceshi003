/**
 * 表单验证工具函数
 */

// 验证用户名字段
export const validateUsername = (username) => {
  if (!username || !username.trim()) {
    return '用户名不能为空'
  }
  // 可以添加更多的用户名验证规则，如长度限制、字符限制等
  if (username.length < 2 || username.length > 20) {
    return '用户名长度应在2-20个字符之间'
  }
  return ''
}

// 验证密码字段
export const validatePassword = (password) => {
  if (!password) {
    return '密码不能为空'
  }
  if (password.length < 6) {
    return '密码长度不能少于6位'
  }
  // 可以添加更复杂的密码验证规则
  return ''
}

// 验证验证码字段
export const validateCaptchaInput = (captcha) => {
  if (!captcha) {
    return '验证码不能为空'
  }
  if (captcha.length !== 4) {
    return '验证码应为4位'
  }
  return ''
}

// 验证整个登录表单
export const validateLoginForm = (form, captchaText) => {
  const errors = {
    username: validateUsername(form.username),
    password: validatePassword(form.password),
    captcha: validateCaptchaInput(form.captcha)
  }
  
  // 如果验证码格式正确，再验证是否匹配
  if (!errors.captcha && form.captcha.toLowerCase() !== captchaText.toLowerCase()) {
    errors.captcha = '验证码不正确'
  }
  
  // 检查是否有错误
  const hasErrors = Object.values(errors).some(error => error !== '')
  
  return {
    errors,
    isValid: !hasErrors
  }
}