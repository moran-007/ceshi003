<template>
  <LoginForm />
</template>

<script>
import LoginForm from '../modules/auth/components/LoginForm.vue'

export default {
  name: 'LoginView',
  components: {
    LoginForm
  }
}
</script>

<style scoped>
/* 登录视图级别的样式可以在这里添加 */
</style>