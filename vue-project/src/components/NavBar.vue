<template>
  <nav class="main-nav" :class="{ 'is-dark-bg': isDarkPage }">
    <div class="nav-container">
      <div class="nav-left">
        <router-link :to="{ name: 'home' }" class="brand-link">
          <img src="@/assets/youngcha_logo.png" alt="영차" class="brand-logo" />
        </router-link>
        <ul class="nav-links">
          <li>
            <router-link :to="{ name: 'movies' }" class="nav-item">영화</router-link>
          </li>
          <li>
            <router-link :to="{ name: 'community-list' }" class="nav-item">커뮤니티</router-link>
          </li>
        </ul>
      </div>
      <div class="nav-right">
        <!-- Search Section -->
        <div class="search-section" ref="searchSectionRef">
          <div class="search-input-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              class="search-input" 
              placeholder="영화 검색..." 
              @focus="isSearchFocused = true"
            >
          </div>
          <!-- Search Results Dropdown -->
          <transition name="fade">
            <div v-if="searchResults.length > 0 && isSearchFocused" class="search-results">
              <div 
                v-for="movie in searchResults" 
                :key="movie.id" 
                class="search-result-item"
                @click="goToMovieDetail(movie.id)"
              >
                <img :src="getPosterUrl(movie.poster_url)" alt="poster" class="result-poster">
                <div class="result-info">
                  <span class="result-title">{{ movie.title_ko }}</span>
                  <span class="result-year">{{ movie.year }}</span>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <ul v-if="!isLogin" class="nav-links">
          <li>
            <router-link 
              :to="{ 
                name: 'login', 
                query: { redirect: route.fullPath } 
              }" 
              class="nav-item"
            >
              로그인
            </router-link>
          </li>
          <li>
            <router-link :to="{ name: 'signup' }" class="nav-item">회원가입</router-link>
          </li>
        </ul>
        <div v-else class="nav-user-section">
          <div class="notification-section">
            <button @click="toggleNotification" class="nav-item notification-trigger">
              <i class="bi bi-bell-fill"></i>
              <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
            </button>
            <div v-if="uiStore.isNotificationListVisible" class="notification-list" ref="notificationListRef">
              <NotificationList />
            </div>
          </div>
          <div class="profile-dropdown">
            <button @click="toggleDropdown" class="nav-item user-profile-trigger">
              <img v-if="profile?.profile_image" :src="getFormattedImage(profile.profile_image)" class="avatar" alt="User Profile">
              <span v-else class="avatar-placeholder">{{ nickname ? nickname[0] : '' }}</span>
              <span>{{ nickname }}</span>
            </button>
            <div v-if="isDropdownOpen" class="dropdown-menu" ref="dropdownMenuRef">
              <router-link :to="{ name: 'mypage' }" class="dropdown-item">나의 프로필</router-link>
              <button @click="logOut" class="dropdown-item logout-btn">로그아웃</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useUIStore } from '@/stores/ui' // Import UI store
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import NotificationList from './NotificationList.vue'
import axios from 'axios'
import api from '@/apis/axios'

const userStore = useUserStore()
const uiStore = useUIStore() // Use UI store
const { isLogin, nickname, profile } = storeToRefs(userStore)
const router = useRouter()
const route = useRoute()

const isDropdownOpen = ref(false)
const dropdownMenuRef = ref(null)
const notificationListRef = ref(null)

const isDarkPage = computed(() => {
  return ['landing', 'login', 'signup'].includes(route.name)
})

// Search Logic
const searchQuery = ref('')
const searchResults = ref([])
const isSearchFocused = ref(false)
const searchSectionRef = ref(null)
let searchDebounce = null

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  uiStore.hideNotificationList() // Close notification list
}

const toggleNotification = () => {
  uiStore.toggleNotificationList()
  isDropdownOpen.value = false
}

const closeDropdown = (event) => {
  if (dropdownMenuRef.value && !dropdownMenuRef.value.contains(event.target)) {
    const trigger = document.querySelector('.user-profile-trigger');
    if (trigger && !trigger.contains(event.target)) {
      isDropdownOpen.value = false
    }
  }
}

const closeNotification = (event) => {
  if (notificationListRef.value && !notificationListRef.value.contains(event.target)) {
    const trigger = document.querySelector('.notification-trigger');
    if (trigger && !trigger.contains(event.target)) {
      uiStore.hideNotificationList()
    }
  }
}

const closeSearch = (event) => {
  if (searchSectionRef.value && !searchSectionRef.value.contains(event.target)) {
    isSearchFocused.value = false
  }
}

watch(isDropdownOpen, (isOpen) => {
  if (isOpen) {
    window.addEventListener('click', closeDropdown)
  } else {
    window.removeEventListener('click', closeDropdown)
  }
})

watch(() => uiStore.isNotificationListVisible, (isOpen) => {
  if (isOpen) {
    window.addEventListener('click', closeNotification)
  } else {
    window.removeEventListener('click', closeNotification)
  }
})

// Search Watcher
watch(searchQuery, (newVal) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  if (!newVal.trim()) {
    searchResults.value = []
    return
  }
  searchDebounce = setTimeout(async () => {
    try {
      // const res = await axios.get(`${userStore.API_URL}/api/movies/`, {
      const res = await api.get(`/api/movies/`, {
        params: { query: newVal }
      })
      searchResults.value = res.data.results.slice(0, 5) // Limit to 5 results
    } catch (err) {
      console.error('Search error:', err)
    }
  }, 300)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeDropdown)
  window.removeEventListener('click', closeNotification)
  window.removeEventListener('click', closeSearch)
  userStore.stopUnreadCountPolling()
})

// Add listener for closing search
watch(isSearchFocused, (focused) => {
  if (focused) {
    window.addEventListener('click', closeSearch)
  } else {
    window.removeEventListener('click', closeSearch)
  }
})

const logOut = () => {
  isDropdownOpen.value = false
  userStore.logOut()
  alert('로그아웃 되었습니다.')
  router.push({ name: 'landing' })
}

const getFormattedImage = (imagePath) => {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  return `${userStore.API_URL}${imagePath}`
}

const getPosterUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) {
    return path.replace('/w500/', '/original/').replace('/w200/', '/original/')
  }
  return `https://image.tmdb.org/t/p/w92${path}` // Small poster for dropdown
}

const goToMovieDetail = (movieId) => {
  router.push({ name: 'movie-detail', params: { id: movieId } })
  searchQuery.value = ''
  searchResults.value = []
  isSearchFocused.value = false
}

const unreadCount = computed(() => userStore.unreadCount)

userStore.startUnreadCountPolling()
</script>

<style scoped>
.main-nav {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
  padding: 0 40px;
  height: 70px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  box-sizing: border-box; /* 너비 계산 정확하게 */
}

/* Dark Background Page Styles */
.main-nav.is-dark-bg {
  background-color: transparent;
  border-bottom: none;
  box-shadow: none;
  position: absolute;
  width: 100%;
  left: 0;
}

.main-nav.is-dark-bg .nav-item {
  color: rgba(255, 255, 255, 0.9);
}

.main-nav.is-dark-bg .nav-item:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.15);
}

.main-nav.is-dark-bg .nav-item.router-link-exact-active {
  color: #ffffff;
  background-color: #409E99;
}

.nav-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left, .nav-right, .nav-links, .nav-user-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: 20px;
}

.brand-link {
  display: flex;
  align-items: center;
  margin-right: 25px;
  text-decoration: none;
}

.brand-logo {
  height: 38px; /* Navbar is 70px, so 50px gives 10px padding top/bottom */
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  transition: transform 0.3s ease;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  color: #343a40;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-item:hover,
.nav-item.router-link-exact-active {
  color: #409E99;
  background-color: #e8f7f6;
}

/* Search Section Styles */
.search-section {
  position: relative;
  margin-right: 10px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #adb5bd;
  font-size: 0.9rem;
}

.search-input {
  padding: 8px 12px 8px 36px;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  background-color: #f8f9fa;
  font-size: 0.9rem;
  width: 200px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  background-color: white;
  border-color: #409E99;
  box-shadow: 0 0 0 3px rgba(64, 158, 153, 0.1);
  width: 240px;
}

.search-results {
  position: absolute;
  top: 120%;
  right: 0;
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border: 1px solid #f1f3f5;
  overflow: hidden;
  z-index: 1002;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  transition: background 0.2s;
  gap: 12px;
}

.search-result-item:hover {
  background-color: #f8f9fa;
}

.result-poster {
  width: 32px;
  height: 48px;
  object-fit: cover;
  border-radius: 4px;
  background-color: #eee;
}

.result-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.result-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-year {
  font-size: 0.75rem;
  color: #999;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Notification Section */
.notification-section {
  position: relative;
}

.notification-trigger {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #343a40;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #c92a2a;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.notification-list {
  position: absolute;
  top: 120%;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f3f5;
  width: 300px;
  z-index: 1001;
  overflow: hidden;
}

.notification-header {
  padding: 12px 20px;
  border-bottom: 1px solid #f1f3f5;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.notification-body {
  padding: 12px 20px;
  max-height: 400px;
  overflow-y: auto;
}

/* New Dropdown Styles */
.profile-dropdown {
  position: relative;
}

.user-profile-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.avatar, .avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  background-color: #409E99;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.dropdown-menu {
  position: absolute;
  top: 120%;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #f1f3f5;
  min-width: 160px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dropdown-item {
  padding: 12px 20px;
  text-decoration: none;
  color: #343a40;
  font-size: 0.95rem;
  background: none;
  border: none;
  text-align: left;
  width: 100%;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.logout-btn {
  color: #c92a2a;
}
</style>