import flvjs from 'flv.js';
import mpegtsjs from 'mpegts.js';
import Cookies from 'js-cookie';
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import { Headset, Microphone, Mute } from '@element-plus/icons-vue'
import axios  from 'axios'
import { mapState, mapMutations, useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { eventBus } from '@/components/ts/Store.ts';
export default {
  computed: {
    ...mapState(['isLogin'])
  },
  methods: {
    ...mapMutations(['setLogin']),
  },
  components: { Mute, Headset, Microphone },
  setup() {
    const loginForm = reactive({
      name: '',
      password: ''

    })
    const registerForm = reactive({
      username: '',
      password: '',
      confirmPassword:''
    })
    const loginLoading = ref(false);
    const activeTab = ref('login');
    const flvPlayers = ref([]);
    const showLoginDialog = ref(useStore().state.showLoginDialog);
    const baseUrl = useStore().state.baseUrl
    // const isLogin = ref(false);
    let urls = new Array(4);
    const getUrl = () => {
      axios.get( baseUrl + "/live").then((response) => {
        console.log(response.data);
        urls = response.data;
        flvPlayers.value.push(createVideo('videoElement1', urls[0]));
        flvPlayers.value.push(createVideo('videoElement2', urls[1]));
        flvPlayers.value.push(createVideo('videoElement3', urls[2]));
        flvPlayers.value.push(createVideo('videoElement4', urls[3]));
        console.log(urls[0]);
      })

    }
    const successLogin = () => {
      showLoginDialog.value = false;
      useStore().commit('setLogin', true);
      loginLoading.value = false;
    }

    const handleLogin = () => {
      loginLoading.value = true;
      axios({
        method: 'post',
        url: baseUrl + '/user/login?uname=' + loginForm.name + "&password=" + loginForm.password,

      }).then(res => {
        console.log(res.data);
        Cookies.set('token', res.data.data.token, { expires: 1, path: '' })
        setTimeout(function() {
          ElMessage({
            message: 'Login Success',
            type: 'success',
          })
          loginLoading.value = false;
        }, 1000)
        setTimeout(function() {
          successLogin();
        }, 2000)

      }).catch(error => {
        setTimeout(function() {
          ElMessage({
            message: "Username or Password Incorrect",
            type: 'error'
          })
          loginLoading.value = false;
        },2000)



      })

      // Cookies.set('test','123', {expires: 3, path:''});
    }
    const handleRegister = () => {

    }

    const createVideo = (videoId, streamUrl) => {
      const videoElement = document.getElementById(videoId);
      if (mpegtsjs.isSupported()) {
        try {
          const flvPlayer = mpegtsjs.createPlayer({
            type: 'flv',
            url: streamUrl,
            isLive: true,
            hasAudio: true,
          });
          flvPlayer.attachMediaElement(videoElement);
          flvPlayer.load();
          flvPlayer.play();
          return flvPlayer;
        } catch (error) {
          console.error(`Error creating FLV player: ${error}`);
        }
      } else {
        console.warn('FLV.js not supported on this browser.');
      }
    };

    onMounted(async () => {
      await getUrl();
      // await checkLogin();
    });

    const handleClose = () => {
      showLoginDialog.value = false;
    }
    return {
      loginForm,
      registerForm,
      handleLogin,
      handleRegister,
      activeTab,
      handleClose,
      showLoginDialog,
      loginLoading,
    };
  },
  data() {
    return {

      muted: false,
      currentUser: 'You',
      rooms: [
        {
          id: 'room1',
          name: 'Voice Channel',
          users: ['Test User 1', 'Test User 2'],
        }
      ]
    };
  },
  methods: {
    eventBus,

    muteChange() {
      this.muted = !this.muted;
      console.log(this.muted);
    },
    leaveChannel(roomId) {
      // 找到当前的房间
      const room = this.rooms.find(room => room.id === roomId);

      if (room) {
        // 移除当前用户
        room.users = room.users.filter(user => user !== this.currentUser);

        // 如果需要执行离开房间后的操作，可以在这里添加
        console.log(`${this.currentUser} 离开了房间 ${room.name}`);
      }
    },
    joinRoom(roomId) {
      this.rooms.forEach(room => {
        if (room.id === roomId && !room.users.includes(this.currentUser)) {
          room.users.push(this.currentUser);
        }
      });
    }
  }

};