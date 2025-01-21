<script>
import index, { mapMutations, useStore } from 'vuex'
import { onMounted, ref } from 'vue'
import Cookies from 'js-cookie'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router';
import store from '@/store/index.js'
import { computed } from '../../.vite/deps/vue.js'

export default {
  computed: {
    store() {
      return store
    }
  },

  methods: {
    ...mapMutations(['checkLogin']), // Map Vuex mutation to check login status

    // Uncomment this section if you want to run checkLogin on component mount
    // async onMounted(){
    //   this.checkLogin()
    // }

    // Method to navigate to the replays page
    // pageRoute(){
    //   this.$router.push({path:'/replays'})
    // }
  },
  components: {},

  setup() {
    const isLogin = computed({
      get: () => store.state.isLogin, // 从 Vuex 中读取
      set: (value) => store.commit('setIsLogin', value), // 提交到 Vuex
    });

    const store = useStore(); // Access the Vuex store instance
    const router = useRouter()

    onMounted(async () => {
      await checkLogin();
      loginStatus()
      console.log(isLogin)

    });

    // Reactive reference for the active menu index
    const activeIndex = ref('1');

    /**
     * Checks if the user is logged in using a token stored in cookies.
     * If the token is valid, performs an automatic login.
     * @return void
     */
    const checkLogin = () => {
      console.log('accessed');
      if (Cookies.get('token') !== undefined) { // Check if token exists in cookies
        const token = Cookies.get('token'); // Retrieve token from cookies
        console.log(token);
        axios({
          method: 'post',
          url: useStore().state.baseUrl + '/user/tokenlogin', // API endpoint for token login
          headers: { "Content-Type": "text/plain" },
          data: token
        }).then(res => {
          console.log(res.data);
          if (res.data.code == 0) { // If login is successful
            successLogin(); // Commit login state changes
            ElMessage({
              message: 'Auto Logged In',
              type: 'success',
            });

          } else {
            router.push('/login'); // Navigate to /login if login is unsuccessful
            Cookies.remove('token');
            Cookies.set('isLogin', false);

          }
        });
      } else {
        router.push('/login'); // Navigate to /login if no token exists



      }
    };

    /**
     * Updates Vuex store states to reflect successful login.
     * Hides login dialog, stops loading, and marks user as logged in.
     * @return void
     */
    const successLogin = () => {
      Cookies.set('setLogin', true)
      Cookies.set('isLogin', true);
      store.commit('setLogin', true);
      console.log(store.state.isLogin);

    };
    const handleLogout = () => {
      ElMessage({
        message: 'Logout Success',
        type: 'success',
      })
      Cookies.remove('token');
      const targetPath = store.state.targetPath || '/login';
      router.push("/login"); // 登录后跳转到目标路径
      store.commit('setLogin', false)
      Cookies.set('isLogin', false);

    }
    const loginStatus = () => {
        return store.state.isLogin;
    }

    // Return data and methods to be used in the template
    return {
      activeIndex, // Currently active menu item index
      index, // Home component
      handleLogout,
      isLogin,
      loginStatus,

    };
  },
};
</script>

<template>
  <!-- Horizontal navigation menu using Element Plus -->
  <el-menu
    :default-active="1"
    class="el-menu-demo"
    mode="horizontal"
    @select="handleSelect"
  >
    <!-- Menu item for streaming page -->
    <div style="display: flex; justify-content: center;"  v-show="store.state.isLogin">
    <router-link to="/">
      <el-menu-item index="1">
        Streaming
      </el-menu-item>
    </router-link>

    <!-- Menu item for replay list page -->
    <router-link to="/replayList">
      <el-menu-item index="2">
        Replays
      </el-menu-item>
    </router-link>
    <el-button type="danger" style="position:absolute;right: 10px; top: 5px;" @click="handleLogout">Logout</el-button>
    </div>

  </el-menu>
</template>

<style scoped>
/* 去掉导航菜单下划线 */
.el-menu-demo >>> .el-me  nu-item.is-active {
  border-bottom: none !important;
}

/* 去掉鼠标悬浮时的下划线 */
.el-menu-demo >>> .el-menu-item:hover {
  border-bottom: none !important;
}
</style>
