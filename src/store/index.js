// store/index.js
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      isLogin: false, // 用于保存登录状态
      targetPath: '/', // 用于保存用户登录后要重定向的路径
      // baseUrl: 'http://116.237.171.176:1000', // Base URL for API requests
      baseUrl: 'http://localhost:8081',
      showLoginDialog: false, // Control visibility of login dialog
      loginLoading: false, // Track loading state during login
      fileBaseUrl: 'http://116.237.171.176:8008/replays' // Base URL for file access
    };
  },
  mutations: {
    setLogin(state, status) {
      state.isLogin = status;

    },
    setTargetPath(state, path) {
      state.targetPath = path;
    },
  },
});

export default store;
