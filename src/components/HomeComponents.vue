<template>
  <el-row :gutter="20" class="main-container">
    <!-- Left side: Real-time voice interaction container -->
    <el-col :span="6" class="real-time-voice-container">
      <div class="real-time-voice">
        <!-- Login container for user authentication -->


        <!-- Room box for real-time voice channel if user is logged in -->
        <div class="room-box">
          <h3 class="room-title">Voice Channel</h3>
          <ul class="user-list">
            <!-- Display list of users in the voice channel -->
            <li v-for="user in rooms[0].users" :key="user" :class="{ 'self-user': user === currentUser }">
              <span :style="{ 'margin-left': user === currentUser ? '0' : '20px' }">{{ user }}</span>
            </li>
          </ul>
          <div class="actions">
            <button class="join-button" @click="joinRoom('room1')">Join</button>
          </div>
          <div class="control-icons">
            <el-icon>
              <!-- Microphone icon for mute/unmute functionality -->
              <microphone v-show="!muted" @click="muteChange"/>
              <mute v-show="muted" @click="muteChange"/>
            </el-icon>
            <el-icon>
              <!-- Headset icon -->
              <headset/>
            </el-icon>
            <el-tooltip
              content="<span>HangUp</span>"
              raw-content
            >
              <el-icon><Phone @click="leaveChannel('room1')"/></el-icon>
            </el-tooltip>
          </div>
        </div>
      </div>
    </el-col>

    <!-- Right side: Live streaming video containers -->
    <el-col :span="18" class="live-container">
      <el-row :gutter="20">
        <!-- Each video element wrapped in a draggable and resizable container -->
        <el-col :span="12">
          <Vue3DraggableResizable
            :initW="600"
            :initH="400"
            v-model:x="x2"
            v-model:y="y2"
            v-model:w="w2"
            v-model:h="h2"
            v-model:active="active"
            :draggable="true"
            :resizable="true"
            @activated="console.log('activated')"
            @deactivated="console.log('deactivated')"
            @drag-start="console.log('drag-start')"
            @resize-start="console.log('resize-start')"
            @dragging="console.log('dragging')"
            @resizing="console.log('resizing')"
            @drag-end="console.log('drag-end')"
            @resize-end="console.log('resize-end')"
          >
            <div class="live-box">
              <video id="videoElement1" controls style="width:100%;height:100%;" autoplay/>
            </div>
          </Vue3DraggableResizable>

        </el-col>
        <el-col :span="12">
          <Vue3DraggableResizable
            :initW="600"
            :initH="400"
            v-model:x="x"
            v-model:y="y"
            v-model:w="w"
            v-model:h="h"
            v-model:active="active"
            :draggable="true"
            :resizable="true"
            @activated="console.log('activated')"
            @deactivated="console.log('deactivated')"
            @drag-start="console.log('drag-start')"
            @resize-start="console.log('resize-start')"
            @dragging="console.log('dragging')"
            @resizing="console.log('resizing')"
            @drag-end="console.log('drag-end')"
            @resize-end="console.log('resize-end')"
          >
            <div class="live-box">
              <video id="videoElement2" controls style="width:100%;height:100%;" autoplay/>
            </div>
          </Vue3DraggableResizable>

        </el-col>
        <el-col :span="12">
          <Vue3DraggableResizable
            :initW="600"
            :initH="400"
            v-model:x="x3"
            v-model:y="y3"
            v-model:w="w3"
            v-model:h="h3"
            v-model:active="active"
            :draggable="true"
            :resizable="true"
            @activated="console.log('activated')"
            @deactivated="console.log('deactivated')"
            @drag-start="console.log('drag-start')"
            @resize-start="console.log('resize-start')"
            @dragging="console.log('dragging')"
            @resizing="console.log('resizing')"
            @drag-end="console.log('drag-end')"
            @resize-end="console.log('resize-end')"
          >
            <div class="live-box">
              <video id="videoElement3" controls style="width:100%;height:100%;" autoplay/>
            </div>
          </Vue3DraggableResizable>

        </el-col>
        <el-col :span="12">
          <Vue3DraggableResizable
            :initW="600"
            :initH="400"
            v-model:x="x4"
            v-model:y="y4"
            v-model:w="w4"
            v-model:h="h4"
            v-model:active="active"
            :draggable="true"
            :resizable="true"
            @activated="console.log('activated')"
            @deactivated="console.log('deactivated')"
            @drag-start="console.log('drag-start')"
            @resize-start="console.log('resize-start')"
            @dragging="console.log('dragging')"
            @resizing="console.log('resizing')"
            @drag-end="console.log('drag-end')"
            @resize-end="console.log('resize-end')"
          >
            <div class="live-box">
              <video id="videoElement4" controls style="width:100%;height:100%;" autoplay/>
            </div>
          </Vue3DraggableResizable>

        </el-col>
        <!-- Additional video containers for other video feeds, duplicated as needed -->
      </el-row>
    </el-col>
  </el-row>
</template>

<style scoped src="@/components/css/HomeComponents.css">
</style>

<script>
import flvjs from 'flv.js';
import mpegtsjs from 'mpegts.js';
import Cookies from 'js-cookie';
import { onMounted, reactive, ref } from 'vue';
import { Headset, Microphone, Mute } from '@element-plus/icons-vue';
import axios from 'axios';
import { mapState, mapMutations, useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import Vue3DraggableResizable from 'vue3-draggable-resizable';

export default {
  computed: {
    // ...mapState(['isLogin']) // Retrieve login status from Vuex state
  },
  methods: {
    ...mapMutations(['setLogin']),

    /**
     * Toggles the mute state.
     * @return Updated mute state (boolean)
     */
    muteChange() {
      this.muted = !this.muted;
      console.log(this.muted);
    },

    /**
     * Leaves the specified voice channel.
     * @param roomId Unique identifier of the room
     * @return void
     */
    leaveChannel(roomId) {
      const room = this.rooms.find(room => room.id === roomId);
      if (room) {
        room.users = room.users.filter(user => user !== this.currentUser);
        console.log(`${this.currentUser} left the room ${room.name}`);
      }
    },

    /**
     * Joins the specified voice channel.
     * @param roomId Unique identifier of the room
     * @return void
     */
    joinRoom(roomId) {
      this.rooms.forEach(room => {
        if (room.id === roomId && !room.users.includes(this.currentUser)) {
          room.users.push(this.currentUser);
        }
      });
    }
  },
  components: { Mute, Headset, Microphone, Vue3DraggableResizable },
  setup() {
    // Reactive forms for login and registration
    const loginForm = reactive({ name: '', password: '', email: ''});
    const registerForm = reactive({ username: '', password: '', confirmPassword: '', email:'', code: ''});
    const loginLoading = ref(false);
    const activeTab = ref('login');
    const flvPlayers = ref([]);
    const showLoginDialog = ref(false);
    const baseUrl = useStore().state.baseUrl;
    const isLogin = ref(false);
    const loginMethod = ref();

    let urls = new Array(4);

    /**
     * Fetches video stream URLs from the server.
     * Initializes video players for each URL.
     * @return void
     */
    const getUrl = () => {
      axios.get(baseUrl + "/live").then((response) => {
        urls = response.data;
        console.log(urls)

        for (let i = 1; i <= urls.length; i++) {
          let name = 'videoElement' + i;
          flvPlayers.value.push(createVideo(name, urls[i - 1]));

        }
        // flvPlayers.value.push(createVideo('videoElement1', urls[0]));
        // flvPlayers.value.push(createVideo('videoElement2', urls[1]));
        // flvPlayers.value.push(createVideo('videoElement3', urls[2]));
        // flvPlayers.value.push(createVideo('videoElement4', urls[3]));
      });
    };
    const handelSendCode = () => {
      if(registerForm.email == null || !registerForm.email.includes('@')){
        ElMessage({
          message: "Invalid Email",
          type: "error",
        })
        return null;
      }
      axios({
        url: baseUrl + "/sendVerificationCode",
        method: 'post',
        params: {
          email: registerForm.email,
        }
      }).then(res => {
        console.log(res.data);
      })
    }
    /**
     * Handles the user login operation.
     * @return void
     */
    const handleLogin = () => {
      loginLoading.value = true;
      axios({
        method: 'post',
        url: baseUrl + '/user/login?uname=' + loginForm.name + "&password=" + loginForm.password,
      }).then(res => {
        Cookies.set('token', res.data.data.token, { expires: 1, path: '' });
        setTimeout(() => {
          ElMessage({
            message: 'Login Success',
            type: 'success',
          });
        }, 100);
        setTimeout(() => {
          successLogin();

        }, 100);
      }).catch(() => {
        setTimeout(() => {
          ElMessage({
            message: "Username or Password Incorrect",
            type: 'error'
          });
        }, 2000);
      }).finally(() => {
        loginLoading.value = false;
      });
    };
    const successLogin = () => {
      loginLoading.value = false;
      showLoginDialog.value = false;
      isLogin.value = true;
    };
    /**
     * Handles the user registration operation.
     * @return void
     */
    const handleRegister = () => {
      // Registration logic can be added here
      axios.post(baseUrl + '/user/register', {
        successLogin
      })
    };

    /**
     * Creates a video player with a specified video element ID and stream URL.
     * @param videoId ID of the video element
     * @param streamUrl URL of the video stream
     * @return Instance of the FLV player or a warning if not supported
     */
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

    /**
     * Closes the login dialog.
     * @return void
     */
    const handleClose = () => {
      showLoginDialog.value = false;
    };

    /**
     * Runs when the component is mounted.
     * Calls getUrl to initialize video streams.
     * @return void
     */
    onMounted(async () => {
      await getUrl();
    });

    return {
      loginForm,
      registerForm,
      handleLogin,
      handleRegister,
      activeTab,
      handleClose,
      showLoginDialog,
      loginLoading,
      isLogin,
      loginMethod,
      handelSendCode
    };
  },
  data() {
    return {
      // Position and dimensions for draggable and resizable video components
      x: 800,
      y: 15,
      h: 600,
      w: 400,
      x2: 15,
      y2: 15,
      h2: 600,
      w2: 400,
      x3: 800,
      y3: 400,
      h3: 600,
      w3: 400,
      x4: 15,
      y4: 400,
      h4: 600,
      w4: 400,
      active: false,
      muted: false,
      currentUser: 'You',
      // Initial room setup for the voice channel
      rooms: [
        {
          id: 'room1',
          name: 'Voice Channel',
          users: ['Test User 1', 'Test User 2'],
        }
      ]
    };
  },
};
</script>