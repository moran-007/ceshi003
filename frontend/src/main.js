/*
 * @Author: 陌
 * @Date: 2025-10-20 21:07:40
 * @LastEditors: 陌
 * @LastEditTime: 2025-10-20 21:11:02
 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.mount('#app')
