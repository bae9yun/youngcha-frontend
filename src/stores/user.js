// src/stores/user.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
// import axios from 'axios'
// const API_URL = 'http://127.0.0.1:8000'
import api from '@/apis/axios'

export const useUserStore = defineStore('user', () => {
  const token = ref(null)
  const userId = ref(null)
  const username = ref(null)
  const email = ref(null)
  const last_name_ko = ref(null)
  const first_name_ko = ref(null)
  const nickname = ref(null)
  const profile = ref(null)
  const userReviews = ref([])
  const userRatings = ref([])
  const unreadCount = ref(0)
  let pollingId = null

  const signUpErrors = ref(null)
  const logInErrors = ref(null)

  const isLogin = computed(() => token.value !== null)

  const fetchProfile = function () {
    if (!isLogin.value) {
      return Promise.resolve(null)
    }

    return api.get('/api/accounts/profile/', {
      headers: { Authorization: `Token ${token.value}` },
    })
      .then((res) => {
        profile.value = res.data
        userId.value = res.data.id
        username.value = res.data.username
        email.value = res.data.email
        last_name_ko.value = res.data.last_name_ko
        first_name_ko.value = res.data.first_name_ko
        nickname.value = res.data.nickname
        console.log('User Store: Profile fetched and updated', profile.value)
        return fetchUnreadCount()
      })
      .catch((err) => {
        console.error('프로필 정보를 가져오는 데 실패했습니다.', err)
        profile.value = null
      })
  }

  const fetchUnreadCount = function () {
    if (!isLogin.value) return
    return api.get('/api/notifications/unread-count/', {
      headers: { Authorization: `Token ${token.value}` },
    })
      .then((res) => {
        unreadCount.value = res.data.count
      })
      .catch((err) => {
        console.error('Unread count fetch failed:', err)
      })
  }

  const startUnreadCountPolling = () => {
    if (pollingId) return
    fetchUnreadCount()
    pollingId = setInterval(fetchUnreadCount, 30000)
  }

  const stopUnreadCountPolling = () => {
    if (pollingId) {
      clearInterval(pollingId)
      pollingId = null
    }
  }

  const fetchUserReviews = function (userIdParam) {
    return api.get(`/api/movies/users/${userIdParam}/reviews/`)
      .then((res) => {
        userReviews.value = res.data
      })
      .catch((err) => {
        console.error('유저 리뷰 목록을 가져오는 데 실패했습니다.', err)
        userReviews.value = []
      })
  }

  const fetchUserRatings = function (userIdParam) {
    return api.get(`/api/movies/users/${userIdParam}/ratings/`)
      .then((res) => {
        userRatings.value = res.data
      })
      .catch((err) => {
        console.error('유저 평점 목록을 가져오는 데 실패했습니다.', err)
        userRatings.value = []
      })
  }

  // 프로필 수정
  const updateProfile = function (payload) {
    const formData = new FormData()
    if (payload.nickname !== undefined) formData.append('nickname', payload.nickname)
    if (payload.intro !== undefined) formData.append('intro', payload.intro)
    if (payload.profile_imageFile) {
      formData.append('profile_image', payload.profile_imageFile)
    }

    return api.put('/api/accounts/profile/', formData, {
      headers: {
        Authorization: `Token ${token.value}`,
        'Content-Type': 'multipart/form-data',
      },
    }).then((res) => {
      profile.value = res.data
      nickname.value = res.data.nickname
    })
  }

  const signUp = function (payload) {
    signUpErrors.value = null

    return api.post('/accounts/signup/', payload)
      .catch((err) => {
        signUpErrors.value = err.response?.data || null
        throw err
      })
  }

  const logIn = function (payload) {
    logInErrors.value = null

    return api.post('/accounts/login/', payload)
      .then((res) => {
        token.value = res.data.key
        console.log('User Store: Token updated', token.value ? 'Present' : 'Not Present')
        return fetchProfile()
      })
      .catch((err) => {
        logInErrors.value = err.response?.data || null
        console.error('User Store: Login failed', err)
        throw err
      })
  }

  const logOut = function () {
    token.value = null
    userId.value = null
    username.value = null
    email.value = null
    last_name_ko.value = null
    first_name_ko.value = null
    nickname.value = null
    profile.value = null
    signUpErrors.value = null
    logInErrors.value = null
    unreadCount.value = 0
    userReviews.value = []
    userRatings.value = []
    stopUnreadCountPolling()
  }

  return {
    // API_URL,  // 이제 불필요
    token,
    userId,
    username,
    email,
    last_name_ko,
    first_name_ko,
    nickname,
    profile,
    userReviews,
    userRatings,
    unreadCount,
    isLogin,
    signUpErrors,
    logInErrors,
    signUp,
    logIn,
    logOut,
    fetchProfile,
    updateProfile,
    fetchUserReviews,
    fetchUserRatings,
    fetchUnreadCount,
    startUnreadCountPolling,
    stopUnreadCountPolling,
  }
}, {
  persist: true,
})
