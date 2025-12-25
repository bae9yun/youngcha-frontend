<template>
  <div class="follow-list-page">
    <div class="container">
      <div class="card">
        <div class="card-header">
          <div class="tabs">
            <button class="tab" :class="{ active: activeTab === 'followers' }" @click="activeTab = 'followers'">
              팔로워
            </button>
            <button class="tab" :class="{ active: activeTab === 'following' }" @click="activeTab = 'following'">
              팔로잉
            </button>
          </div>
          <button class="btn-close" @click="handleClose">&times;</button>
        </div>
        <div class="card-body">
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
          </div>
          <div v-else-if="users.length" class="user-list">
            <div v-for="user in users" :key="user.id" class="user-card" @click="goToProfile(user.id)">
              <div class="avatar">
                <img v-if="user.profile_image" :src="getProfileUrl(user.profile_image)" :alt="user.nickname" />
                <span v-else>{{ user.nickname?.[0] }}</span>
              </div>
              <div class="user-info">
                <span class="nickname">{{ user.nickname || user.username }}</span>
                <span v-if="user.intro" class="intro">{{ user.intro }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>{{ activeTab === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로잉하는 사용자가 없습니다.' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, defineProps } from 'vue'
import { useRouter } from 'vue-router'
// import axios from 'axios'
// const API_URL = 'http://127.0.0.1:8000'
import api from '@/apis/axios'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true,
  },
  initialTab: {
    type: String,
    default: 'followers',
  },
})

const router = useRouter()
const uiStore = useUIStore()

const activeTab = ref(props.initialTab)
const users = ref([])
const isLoading = ref(false)

const fetchUsers = () => {
  if (!props.userId) return
  isLoading.value = true
  const endpoint = activeTab.value === 'followers' ? 'followers' : 'following'
  api.get(`/api/accounts/users/${props.userId}/${endpoint}/`)
  // axios.get(`${API_URL}/api/accounts/users/${props.userId}/${endpoint}/`)
    .then(res => {
      users.value = res.data
    })
    .catch(err => {
      console.error(err)
      users.value = []
    })
    .finally(() => {
      isLoading.value = false
    })
}

const getProfileUrl = (path) => {
  if (!path) return '/assets/no-image.png'
  if (path.startsWith('http')) return path
  return path.startsWith('/media/') ? `${API_URL}${path}` : `https://image.tmdb.org/t/p/original${path}`
}

const goToProfile = (id) => {
  uiStore.hideFollowList()
  router.push({ name: 'user-profile', params: { id } })
}

const handleClose = () => {
  uiStore.hideFollowList()
}

watch(activeTab, fetchUsers)
watch(() => props.userId, fetchUsers)

onMounted(() => {
  activeTab.value = props.initialTab
  fetchUsers()
})
</script>

<style scoped>
.follow-list-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.container {
  width: 100%;
  max-width: 450px;
}
.card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.tabs {
  display: flex;
  gap: 10px;
}
.tab {
  padding: 10px 15px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #999;
  position: relative;
}
.tab.active {
  color: #333;
}
.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #409E99;
  border-radius: 2px;
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
}
.card-body {
  overflow-y: auto;
  padding: 10px 20px;
}
.user-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.user-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.user-card:hover {
  background-color: #f8f9fa;
}
.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  color: #333;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.nickname {
  font-weight: 600;
}
.intro {
  font-size: 0.9rem;
  color: #666;
}
.loading-state, .empty-state {
  padding: 50px 20px;
  text-align: center;
  color: #999;
}
.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e8f7f6;
  border-top: 3px solid #409E99;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
