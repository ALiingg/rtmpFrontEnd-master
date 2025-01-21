// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import store from '../store/';
import Cookies from 'js-cookie';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'), // 假设首页路径为 Home.vue
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginComponents.vue'), // 登录页面组件
  },
  // 添加其他路由
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const isLogin = store.state.isLogin || !!Cookies.get('token'); // 判断是否已登录

  if (!isLogin && to.path !== '/login') {
    // 保存目标路径到 Vuex 或 sessionStorage
    store.commit('setTargetPath', to.fullPath); // 使用 Vuex 保存
    // sessionStorage.setItem('targetPath', to.fullPath); // 或者使用 sessionStorage 保存

    return next('/login'); // 跳转到登录页面
  }

  next(); // 已登录则继续访问
});

export default router;
