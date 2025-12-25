<template>
  <div class="page-wrapper">
    <div class="container" v-if="article">
      
      <!-- Article Header -->
      <div class="article-header">
        <div class="mb-3">
          <button @click="router.push({ name: 'community-list' })" class="btn-back">
            목록으로
          </button>
        </div>

        <h1 class="article-title">{{ article.title }}</h1>
        
        <div class="header-meta-row">
          <div class="article-meta">
            <div class="meta-item author" @click="goToUserProfile">
              <img v-if="article.user_profile_image" :src="getFormattedImage(article.user_profile_image)" class="avatar-img" alt="Author Profile">
              <span v-else class="avatar-placeholder">{{ article.user_nickname[0] }}</span>
              <span class="nickname">{{ article.user_nickname }}</span>
            </div>
            <div class="meta-divider">|</div>
            <div class="meta-item date">
               {{ new Date(article.created_at).toLocaleString() }}
            </div>
            <div class="meta-divider">|</div>
            <div class="meta-item views">
              조회수 {{ article.views }}
            </div>
          </div>

          <div v-if="isOwner" class="owner-actions">
            <button @click="goToUpdate" class="btn-action edit">수정</button>
            <button @click="handleDeleteArticle" class="btn-action delete">삭제</button>
          </div>
        </div>
      </div>

      <div class="content-card">
        <!-- Article Content -->
        <div class="article-body">
          <div v-if="article.image" class="image-wrapper">
            <img :src="article.image" class="article-image" alt="Article Image">
          </div>
          <p class="article-text">{{ article.content }}</p>
        </div>

        
        <!-- Tagged Movie Section -->
        <div v-if="article.movie" class="tagged-movie-section">
          <h4 class="tagged-label">🎬 태그된 영화</h4>
          <div class="tagged-movie-card" @click="goToMovieDetail(article.movie.id)">
            <img :src="getPosterUrl(article.movie.poster_url)" alt="poster" class="tagged-poster">
            <div class="tagged-info">
              <h5 class="tagged-title">{{ article.movie.title_ko }}</h5>
              <span class="tagged-year">{{ article.movie.year }}</span>
            </div>
            <!-- <span class="tagged-arrow">→</span> -->
          </div>
        </div>
        <!-- Like Action -->
        <div class="article-footer">
          <button @click="handleLikeArticle" class="btn-like" :class="{ 'liked': article.is_like }">
            <span class="heart-icon">♥</span>
            <span class="like-count">{{ article.likes_count }}</span>
          </button>
        </div>
      </div>

      <!-- Comment Section -->
      <div class="comment-section">
        <h3 class="section-title">댓글 <span class="comment-count">{{ article.comments.length }}</span></h3>
        
        <!-- Comment Form -->
        <form @submit.prevent="handleCreateComment" class="comment-form">
          <div class="input-wrapper">
            <input type="text" v-model="newComment" class="comment-input" placeholder="영화에 대한 이야기를 나눠보세요...">
            <button type="submit" class="btn-comment-submit">등록</button>
          </div>
        </form>

        <!-- Comment List -->
        <div class="comment-list">
          <div v-for="comment in paginatedComments" :key="comment.id" class="comment-item">
            <!-- 일반 모드 -->
            <div v-if="editingCommentId !== comment.id" class="comment-view">
              <div class="comment-avatar" @click="goToCommenterProfile(comment.user)" style="cursor: pointer;">
                <img v-if="comment.user_profile_image" :src="getFormattedImage(comment.user_profile_image)" class="avatar-img" alt="Commenter Profile">
                <template v-else>
                  {{ comment.user_nickname[0] }}
                </template>
              </div>
              <div class="comment-body">
                <div class="comment-header">
                  <span class="comment-author" @click="goToCommenterProfile(comment.user)" style="cursor: pointer;">{{ comment.user_nickname }}</span>
                  <span class="comment-date">{{ new Date(comment.created_at).toLocaleString() }}</span>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
              </div>
              
              <div v-if="comment.user === userStore.userId" class="comment-actions">
                <button @click="startEditComment(comment)" class="btn-text">수정</button>
                <button @click="handleDeleteComment(comment.id)" class="btn-text delete">삭제</button>
              </div>
            </div>

            <!-- 수정 모드 -->
            <div v-else class="comment-edit-form">
              <input type="text" v-model="editingContent" class="edit-input">
              <div class="edit-actions">
                <button @click="cancelEditComment" class="btn-small cancel">취소</button>
                <button @click="handleUpdateComment(comment.id)" class="btn-small save">저장</button>
              </div>
            </div>
          </div>
        </div>
        <PaginationNav 
          v-if="totalPages > 1" 
          :current="currentPage" 
          :total="totalPages" 
          @change="(p) => currentPage = p" 
        />
      </div>

      <!-- Other Articles Section -->
      <div class="other-articles-section">
        <h3 class="section-title">다른 게시글</h3>
        <div class="article-list">
          <div v-for="otherArticle in paginatedOtherArticles" :key="otherArticle.id" @click="goToDetail(otherArticle.id)" class="article-row-card">
            <div class="article-thumbnail">
              <img v-if="otherArticle.image" :src="getFormattedImage(otherArticle.image)" alt="Article Thumbnail" class="thumb-img" @error="onImageError">
              <span v-else class="thumb-icon">🎬</span>
            </div>

            <div class="article-content">
              <!-- 1. Tag -->
              <div class="content-line">
                <div v-if="otherArticle.movie_title" class="tagged-movie-badge">
                  <i class="bi bi-camera-reels-fill"></i> {{ otherArticle.movie_title }}
                </div>
                <div v-else class="tag-placeholder"></div>
              </div>
              
              <!-- 2. Title -->
              <h4 class="other-article-title text-truncate">
                {{ otherArticle.title }}
              </h4>

              <!-- 3. Info -->
              <div class="article-info"> 
                <span class="author">{{ otherArticle.user_nickname }}</span>
                <span class="date">{{ formatCreatedAt(otherArticle.created_at) }}</span>
              </div>
            </div>

            <div class="article-stats">
              <div class="stat-item heart">
                <span>❤️</span> {{ otherArticle.likes_count }}
              </div>
              <div class="stat-item comment">
                <span>💬</span> {{ otherArticle.comments_count }}
              </div>
            </div>
          </div>
        </div>
        <PaginationNav 
          v-if="totalOtherPages > 1" 
          :current="currentOtherPage" 
          :total="totalOtherPages" 
          @change="(p) => currentOtherPage = p" 
        />
      </div>

    </div>
    <div v-else class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommunityStore } from '@/stores/community'
import { useUserStore } from '@/stores/user'
import PaginationNav from '@/components/PaginationNav.vue'

const route = useRoute()
const router = useRouter()
const communityStore = useCommunityStore()
const userStore = useUserStore()

const newComment = ref('')

// 댓글 수정 상태 관리
const editingCommentId = ref(null)
const editingContent = ref('')

// Pagination state for Comments
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Pagination state for Other Articles
const currentOtherPage = ref(1)
const otherItemsPerPage = ref(3)

const article = computed(() => communityStore.article)
const isOwner = computed(() => {
  return article.value && userStore.userId === article.value.user
})

// Other Articles Logic
const filteredOtherArticles = computed(() => {
  if (!communityStore.articles) return []
  // Filter out current article
  return communityStore.articles.filter(a => a.id !== (article.value?.id))
})

const paginatedOtherArticles = computed(() => {
  const start = (currentOtherPage.value - 1) * otherItemsPerPage.value
  const end = start + otherItemsPerPage.value
  return filteredOtherArticles.value.slice(start, end)
})

const totalOtherPages = computed(() => {
  return Math.ceil(filteredOtherArticles.value.length / otherItemsPerPage.value)
})

const paginatedComments = computed(() => {
  if (!article.value || !article.value.comments) return []
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return article.value.comments.slice(start, end)
})

const totalPages = computed(() => {
  if (!article.value || !article.value.comments) return 0
  return Math.ceil(article.value.comments.length / itemsPerPage.value)
})

const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Helper Functions (Declared early)
const getPosterUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `https://image.tmdb.org/t/p/original${path}`
}

const getFormattedImage = (imagePath) => {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  return `http://127.0.0.1:8000${imagePath}`
}

const formatCreatedAt = (createdAt) => {
  const d = new Date(createdAt)
  const now = new Date()
  const isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString()
}

const onImageError = (e) => e.target.style.display = 'none'

const goToMovieDetail = (movieId) => {
  router.push({ name: 'movie-detail', params: { id: movieId } })
}

const goToDetail = (articleId) => {
  router.push({ name: 'community-detail', params: { id: articleId } })
}

const goToUserProfile = () => {
  if (article.value && article.value.user) {
    if (userStore.userId === article.value.user) {
      router.push({ name: 'mypage' })
    } else {
      router.push({ name: 'user-profile', params: { id: article.value.user } })
    }
  }
}

const goToCommenterProfile = (userId) => {
  if (userId) {
    if (userStore.userId === userId) {
      router.push({ name: 'mypage' })
    } else {
      router.push({ name: 'user-profile', params: { id: userId } })
    }
  }
}

const fetchArticleData = (id) => {
  communityStore.fetchArticle(id)
  communityStore.fetchArticles() // Fetch list for "Other Articles"
}

onMounted(() => {
  fetchArticleData(route.params.id)
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchArticleData(newId)
    window.scrollTo(0, 0)
  }
})

const handleDeleteArticle = async () => {
  if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
    try {
      await communityStore.deleteArticle(route.params.id)
      router.push({ name: 'community-list' })
    } catch (err) {
      console.error('Failed to delete article:', err)
    }
  }
}

const goToUpdate = () => {
  router.push({ name: 'community-update', params: { id: route.params.id } })
}

const handleLikeArticle = () => {
  if (!userStore.isLogin) {
    alert('로그인이 필요합니다.')
    router.push({ name: 'login' })
    return
  }
  communityStore.likeArticle(route.params.id)
}

const handleCreateComment = async () => {
  if (!userStore.isLogin) {
    alert('로그인이 필요합니다.')
    router.push({ name: 'login' })
    return
  }
  if (!newComment.value.trim()) {
    alert('댓글 내용을 입력해주세요.')
    return
  }
  try {
    await communityStore.createComment({ articleId: route.params.id, content: newComment.value })
    newComment.value = ''
    // Re-fetch article to show the new comment
    await communityStore.fetchArticle(route.params.id)
    // After creating a comment, reset to the first page to see the new comment
    currentPage.value = 1
  } catch (err) {
    console.error('Failed to create comment:', err)
  }
}

const handleDeleteComment = async (commentId) => {
  if (confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
    try {
      await communityStore.deleteComment({ articleId: route.params.id, commentId })
      await communityStore.fetchArticle(route.params.id)
      // After deleting a comment, re-evaluate current page
      if (paginatedComments.value.length === 0 && currentPage.value > 1) {
        currentPage.value--
      }
    } catch (err) {
      console.error('Failed to delete comment:', err)
    }
  }
}

// 댓글 수정 시작
const startEditComment = (comment) => {
  editingCommentId.value = comment.id
  editingContent.value = comment.content
}

// 댓글 수정 취소
const cancelEditComment = () => {
  editingCommentId.value = null
  editingContent.value = ''
}

// 댓글 수정 저장
const handleUpdateComment = async (commentId) => {
  if (!editingContent.value.trim()) {
    alert('내용을 입력해주세요.')
    return
  }
  try {
    await communityStore.updateComment({ commentId, content: editingContent.value })
    await communityStore.fetchArticle(route.params.id)
    cancelEditComment()
  } catch (err) {
    console.error('Failed to update comment:', err)
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page-wrapper {
  background: #FFFFFFD9;
  min-height: 100vh;
  width: 100%;
  padding-bottom: 50px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #333;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

/* Header */
.article-header {
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 20px;
}

.header-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.btn-back {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #666;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 50px;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-back:hover {
  background: rgba(255, 255, 255, 0.8);
  color: #409E99;
  transform: translateX(-3px);
}

.btn-action {
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 8px;
  transition: all 0.2s;
  cursor: pointer;
  backdrop-filter: blur(5px);
}

.btn-action.edit {
  background: rgba(255, 255, 255, 0.6);
  color: #495057;
}

.btn-action.edit:hover {
  background: rgba(64, 158, 153, 0.1);
  color: #409E99;
}

.btn-action.delete {
  background: rgba(255, 245, 245, 0.6);
  color: #fa5252;
}

.btn-action.delete:hover {
  background: rgba(250, 82, 82, 0.1);
}

.article-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #222;
  margin-bottom: 15px;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 0.95rem;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-item.author {
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
}

.meta-item.author:hover {
  color: #409E99;
  transform: translateY(-1px);
}

.avatar-placeholder, .avatar-img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
}

.avatar-placeholder {
  background: #409E99;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
}

.avatar-img {
  object-fit: cover;
}

.nickname {
  font-weight: 600;
}

.meta-divider {
  margin: 0 12px;
  color: #dee2e6;
}

.owner-actions {
  display: flex;
  align-items: center;
}

/* Content Card */
.content-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin-bottom: 50px;
}

.article-body {
  margin-bottom: 40px;
}

.image-wrapper {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.article-image {
  max-width: 100%;
  max-height: 600px;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.article-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

/* Tagged Movie */
.tagged-movie-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.tagged-label {
  font-size: 1rem;
  font-weight: bold;
  color: #409E99;
  margin-bottom: 15px;
}

.tagged-movie-card {
  display: inline-flex;
  align-items: center;
  background: rgba(64, 158, 153, 0.05);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(64, 158, 153, 0.2);
  border-radius: 16px;
  padding: 12px 24px 12px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tagged-movie-card:hover {
  transform: translateY(-3px);
  background: rgba(64, 158, 153, 0.1);
  box-shadow: 0 8px 20px rgba(64, 158, 153, 0.15);
  border-color: #409E99;
}

.tagged-poster {
  width: 45px;
  height: 65px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tagged-info {
  display: flex;
  flex-direction: column;
}

.tagged-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #222;
}

.tagged-year {
  font-size: 0.85rem;
  color: #666;
}

.article-footer {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.btn-like {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border: 2px solid #ff6b6b;
  color: #ff6b6b;
  padding: 12px 35px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.1);
  cursor: pointer;
}

.btn-like:hover, .btn-like.liked {
  background: #ff6b6b;
  color: white;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}

.heart-icon {
  font-size: 1.3rem;
}

/* Comments Section */
.comment-section {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
}

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 25px;
  color: #222;
}

.comment-count {
  color: #409E99;
}

.comment-form {
  margin-bottom: 35px;
}

.input-wrapper {
  position: relative;
  display: flex;
  gap: 12px;
}

.comment-input {
  flex-grow: 1;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 50px;
  padding: 14px 25px;
  font-size: 1rem;
  transition: all 0.3s;
}

.comment-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.95);
  border-color: #409E99;
  box-shadow: 0 0 0 4px rgba(64, 158, 153, 0.1);
}

.btn-comment-submit {
  background: rgba(64, 158, 153, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 50px;
  padding: 0 30px;
  font-weight: 700;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-comment-submit:hover {
  background: rgba(64, 158, 153, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 153, 0.2);
}

/* Comment List */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: transform 0.2s;
}

.comment-item:hover {
  transform: translateX(5px);
  border-color: rgba(64, 158, 153, 0.3);
}

.comment-view {
  display: flex;
  gap: 15px;
}

.comment-avatar {
  width: 42px;
  height: 42px;
  background: #f1f3f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #888;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.comment-avatar .avatar-img {
  width: 100%;
  height: 100%;
  margin-right: 0;
}

.comment-body {
  flex-grow: 1;
}

.comment-header {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-author {
  font-weight: 800;
  font-size: 0.95rem;
  color: #222;
}

.comment-date {
  font-size: 0.8rem;
  color: #999;
}

.comment-content {
  font-size: 1rem;
  color: #444;
  line-height: 1.6;
  margin: 0;
}

.comment-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn-text {
  background: none;
  border: none;
  font-size: 0.8rem;
  color: #adb5bd;
  padding: 4px;
  text-align: right;
  transition: all 0.2s;
  cursor: pointer;
  border-radius: 4px;
}

.btn-text:hover {
  color: #409E99;
  background: rgba(64, 158, 153, 0.05);
}

.btn-text.delete:hover {
  color: #fa5252;
  background: rgba(250, 82, 82, 0.05);
}

/* Comment Edit Mode */
.comment-edit-form {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.edit-input {
  flex-grow: 1;
  background: white;
  border: 1px solid #409E99;
  border-radius: 12px;
  padding: 12px 15px;
  font-size: 1rem;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  border: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small.save {
  background: #409E99;
  color: white;
}

.btn-small.cancel {
  background: #f1f3f5;
  color: #666;
}

/* Other Articles Section */
.other-articles-section {
  margin-top: 60px;
}

.article-list { display: flex; flex-direction: column; gap: 15px; }
.article-row-card { 
  display: flex; 
  align-items: center; 
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 16px; 
  padding: 15px; 
  cursor: pointer; 
  transition: all 0.3s ease; 
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02); 
  height: 110px;
}
.article-row-card:hover { 
  transform: translateY(-3px);
  border-color: rgba(64, 158, 153, 0.4); 
  box-shadow: 0 8px 25px rgba(64, 158, 153, 0.1); 
  background: rgba(255, 255, 255, 0.8);
}

.article-thumbnail { 
  width: 80px; 
  height: 80px; 
  background: rgba(0, 0, 0, 0.03); 
  border-radius: 10px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin-right: 20px; 
  flex-shrink: 0; 
  overflow: hidden; 
}
.thumb-img { width: 100%; height: 100%; object-fit: cover; }
.thumb-icon { font-size: 1.8rem; color: #ccc; }

.article-content { 
  flex-grow: 1; 
  min-width: 0; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  height: 80px; 
}

.content-line { display: flex; align-items: center; height: 1.2rem; }
.tag-placeholder { height: 1.2rem; } 

.tagged-movie-badge {
  display: inline-block;
  font-size: 0.65rem; 
  color: #409E99; 
  font-weight: 800; 
  background: rgba(64, 158, 153, 0.08); 
  padding: 2px 8px; 
  border-radius: 6px; 
  border: 1px solid rgba(64, 158, 153, 0.15);
  margin: 0;
}

.other-article-title { font-size: 1.1rem; font-weight: 800; margin: 0; color: #222; line-height: 1.2; }
.article-info { display: flex; align-items: center; gap: 12px; font-size: 0.8rem; color: #777; }

/* Stats */
.article-stats { margin-left: 20px; text-align: right; min-width: 80px; }
.stat-item { font-size: 0.85rem; color: #666; margin-bottom: 4px; }
.heart { color: #ff6b6b; font-weight: 700; }
</style>