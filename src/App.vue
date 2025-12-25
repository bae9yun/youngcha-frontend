<template>
  <div class="app-container" :class="{ 'is-dark-bg': isDarkPage }">
    <div v-if="isDarkPage" class="bg-shapes">
      <div class="shape circle-1"></div>
      <div class="shape circle-2"></div>
      <div class="shape circle-3"></div>
    </div>
    <NavBar />
    <main>
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'

const store = useUserStore()
const route = useRoute()

const isDarkPage = computed(() => {
  return ['landing', 'login', 'signup'].includes(route.name)
})

// 앱이 마운트될 때 로그인 상태라면 프로필 정보를 가져옴
onMounted(() => {
  if (store.isLogin) {
    store.fetchProfile()
  }
})
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.app-container.is-dark-bg {
  background: radial-gradient(circle at 50% 120%, #1a2a6c, #0e1a40);
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  overflow-x: hidden;
}

.bg-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 10s infinite ease-in-out alternate;
}

.circle-1 {
  width: 500px;
  height: 500px;
  background: #409E99;
  top: -100px;
  left: -100px;
  animation-duration: 12s;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: #2b5876;
  bottom: -50px;
  right: -50px;
  animation-duration: 15s;
  animation-delay: -2s;
}

.circle-3 {
  width: 300px;
  height: 300px;
  background: #20c997;
  top: 40%;
  left: 60%;
  opacity: 0.4;
  animation-duration: 18s;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 50px) scale(1.1); }
}

main {
  flex: 1;
  z-index: 1;
}
</style>