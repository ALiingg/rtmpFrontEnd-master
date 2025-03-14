import { createApp} from 'vue'
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import index from '@/components/HomeComponents.vue'
import StreamComponents from '@/components/StreamComponents.vue'
import { createRouter, createWebHistory } from 'vue-router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import axios from 'axios'
import Vue3DraggableResizable from 'vue3-draggable-resizable'
//default styles
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'

import Cookies from 'js-cookie'
import LoginComponents from '@/components/LoginComponents.vue'
import store from '@/store/index.js'
import { useStore } from 'vuex'
const app = createApp(App)

// const baseUrl = useStore().state.baseUrl;

const token = Cookies.get("token") || "";

// 创建 Axios 实例
const api = axios.create({
  headers: {
    Authorization: `${token}`, // 全局添加 Token
    "Content-Type": "application/json",
  },
});
export function setAuthToken(token: string) {
  Cookies.set("token", token); // 存入 Cookies
  api.defaults.headers.Authorization = `${token}`; // 更新 Axios Header
}
export default api;


// Set up Vue Router to handle different pages in the app
const router = createRouter({
  history: createWebHistory(), // Use HTML5 history mode for navigation
  routes: [
    {
      path: '/', // Route for the home page
      name: 'Home',
      component: index // Component to render for the home page
    },
    {
      path: '/replayList', // Route for the replay list page
      name: 'Replays',
      component: StreamComponents // Component to render for the replay list
    },
    {
      path: '/login',
      name: "Login",
      component: LoginComponents

    }
  ]
})

// Register Vue Router with the app
app.use(router)

// Register all ElementPlus icons globally
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component) // Register each icon as a component
}

// Register Vuex store and other plugins with the app
app.use(store) // Use the Vuex store for state management
app.use(Vue3DraggableResizable) // Use the draggable and resizable component
app.use(ElementPlus) // Use ElementPlus for UI components

// Mount the app to the HTML element with id 'app'
app.mount('#app')
