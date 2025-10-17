import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { initUserState } from './store'

// 初始化用户状态
initUserState()

const app = createApp(App)

// 使用路由
app.use(router)

app.mount('#app')
