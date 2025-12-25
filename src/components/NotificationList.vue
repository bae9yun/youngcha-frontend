<template>
  <div class="notification-list-wrapper">
    <div class="notification-header">
      <h3>알림</h3>
    </div>
    <div v-if="isLoading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    <div v-else-if="notifications.length === 0" class="notification-body empty">
      <p>새로운 알림이 없습니다.</p>
    </div>
    <div v-else class="notification-body">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.read }"
      >
        <div class="notification-main-content">
          <p class="notification-verb" @click="handleNotificationClick(notification)">{{ notification.verb }}</p>
          <div class="notification-meta">
            <span class="notification-timestamp">{{ timeSince(notification.timestamp) }}</span>
            <button @click.stop="handleDeleteNotification(notification.id)" class="delete-btn">&times;</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// import axios from 'axios';
import api from '@/apis/axios' 
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';
import { useUIStore } from '@/stores/ui';

const userStore = useUserStore();
const router = useRouter();
const uiStore = useUIStore();
const notifications = ref([]);
const isLoading = ref(false);

const fetchNotifications = async () => {
  isLoading.value = true;
  try {
    // const response = await axios.get(`${userStore.API_URL}/api/notifications/`, {
    const response = await api.get(`/api/notifications/`, {
      headers: { Authorization: `Token ${userStore.token}` },
    });
    notifications.value = response.data;
  } catch (error) {
    console.error('알림을 불러오는 데 실패했습니다.', error);
  } finally {
    isLoading.value = false;
  }
};

const handleDeleteNotification = async (notificationId) => {
  try {
    const notificationToDelete = notifications.value.find(n => n.id === notificationId);
    // await axios.delete(`${userStore.API_URL}/api/notifications/${notificationId}/delete/`, {
    await api.delete(`/api/notifications/${notificationId}/delete/`, {
      headers: { Authorization: `Token ${userStore.token}` },
    });
    notifications.value = notifications.value.filter(n => n.id !== notificationId);
    if (notificationToDelete && !notificationToDelete.read) {
      userStore.fetchUnreadCount(); // Only refresh if the deleted one was unread
    }
  } catch (error) {
    console.error('알림 삭제에 실패했습니다.', error);
    alert('알림 삭제에 실패했습니다.');
  }
};

const handleNotificationClick = async (notification) => {
  if (!notification.read) {
    try {
      // await axios.post(`${userStore.API_URL}/api/notifications/${notification.id}/read/`, {}, {
      await api.post(`/api/notifications/${notification.id}/read/`, {}, {
        headers: { Authorization: `Token ${userStore.token}` },
      });
      notification.read = true; // Optimistic update
      userStore.fetchUnreadCount(); // Refresh unread count
    } catch (error) {
      console.error('알림을 읽음 처리하는 데 실패했습니다.', error);
    }
  }

  uiStore.hideNotificationList(); // Always hide the notification modal on click

  // Navigate to the target if it exists
  if (notification.notification_type === 'new_follower') {
    if (notification.related_object_id) { // This is sender.id
      router.push({ name: 'user-profile', params: { id: notification.related_object_id } });
    }
  } else if (notification.notification_type === 'new_comment') {
    if (notification.related_object_id) { // This is article.id
      router.push({ name: 'community-detail', params: { id: notification.related_object_id } });
    }
  } else if (notification.notification_type === 'new_like') {
    if (notification.related_object_id) { // This is article.id
      router.push({ name: 'community-detail', params: { id: notification.related_object_id } });
    }
  }
};

const timeSince = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "년 전";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "달 전";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "일 전";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "시간 전";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "분 전";
  return Math.floor(seconds) + "초 전";
};

onMounted(fetchNotifications);
</script>

<style scoped>
.notification-list-wrapper {
  color: #333;
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
  max-height: 400px;
  overflow-y: auto;
}
.notification-body.empty {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* Align items to the top in case verb is long */
  padding: 12px 20px;
  border-bottom: 1px solid #f1f3f5;
  transition: background-color 0.2s;
}

.notification-main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.notification-verb {
  margin: 0 0 4px;
  cursor: pointer; /* Make verb clickable for navigation */
}

.notification-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px; /* Space between timestamp and delete button */
  font-size: 0.8rem;
  color: #999;
}

.delete-btn {
  background: none;
  border: none;
  color: #ccc;
  font-size: 1rem;
  cursor: pointer;
  padding: 0 5px; /* Adjust padding for 'x' */
  transition: color 0.2s;
}

.delete-btn:hover {
  color: #c92a2a;
}
.notification-item:last-child {
  border-bottom: none;
}
.notification-item:hover {
  background-color: #f8f9fa;
}
.notification-item.unread {
  background-color: #e8f7f6;
}
.notification-verb {
  margin: 0 0 4px;
}
.notification-timestamp {
  font-size: 0.8rem;
  color: #999;
}
.loading-spinner {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e8f7f6;
  border-top: 3px solid #409E99;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>