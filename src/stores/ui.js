// front/vue-project/src/stores/ui.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // Follow List State
  const isFollowListVisible = ref(false)
  const followListUserId = ref(null)
  const followListInitialTab = ref('followers')
  
  // Notification List State
  const isNotificationListVisible = ref(false)

  function showFollowList(userId, initialTab = 'followers') {
    isNotificationListVisible.value = false // Close notifications when opening follow list
    followListUserId.value = userId
    followListInitialTab.value = initialTab
    isFollowListVisible.value = true
  }

  function hideFollowList() {
    isFollowListVisible.value = false
    followListUserId.value = null
  }

  function toggleNotificationList() {
    isFollowListVisible.value = false // Close follow list when opening notifications
    isNotificationListVisible.value = !isNotificationListVisible.value
  }

  function hideNotificationList() {
    isNotificationListVisible.value = false
  }

  return {
    isFollowListVisible,
    followListUserId,
    followListInitialTab,
    showFollowList,
    hideFollowList,

    isNotificationListVisible,
    toggleNotificationList,
    hideNotificationList,
  }
})
