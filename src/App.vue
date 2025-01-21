<script lang="ts">
import index from '@/components/HomeComponents.vue'
import PageHeader from '@/components/PageHeader.vue'
import StreamComponents from '@/components/StreamComponents.vue'
// App.vue 或其他全局组件
import Cookies from 'js-cookie'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  components: { PageHeader },
  setup() {
    const router = useRouter()
    const store = useStore()

    onMounted(() => {
      console.log(Cookies.get('token'))
      if (!Cookies.get('token')) {
        store.commit('setLogin', false)
        router.push('/login')
      } else {
        store.commit('setLogin', true)
      }
    })
  }
}
</script>

<template>
  <PageHeader> </PageHeader>

  <router-view></router-view>
</template>
