<template>
  <div class="cinematic-wrapper">
    <!-- Background Noise Texture -->
    <div class="noise-overlay"></div>

    <div class="container-fluid" v-if="userStore.profile">
      <div class="editorial-layout" :class="{ 'edit-mode-active': isEditing }">
        
                <!-- 1. Identity Sidebar (Left) - Clean Archive Entry -->
        
                <aside class="identity-sidebar">
        
                  <header class="sidebar-header">
        
                    
        
                    <div class="avatar-capsule" :class="{ 'is-editing': isEditing }">
        
                      <label v-if="isEditing" for="profile-upload" class="avatar-upload-trigger">
        
                        <span class="plus">+</span>
        
                        <input type="file" id="profile-upload" hidden accept="image/*" @change="onFileChange" />
        
                      </label>
        
                      <img :src="previewImageUrl || profileImageUrl" alt="profile" class="avatar-img" />
        
                    </div>
        
                  </header>
        
        
        
                  <section class="identity-body">
        
                    <template v-if="!isEditing">
        
                      <div class="name-block">
        
                        <h1 class="user-nickname">{{ userStore.profile.nickname || userStore.profile.username }}</h1>
        
                        <span class="user-email">{{ userStore.profile.email }}</span>
        
                      </div>
        
                      <div class="intro-block">
        
                        <p class="user-intro">{{ userStore.profile.intro || '영화에 대한 기록을 남겨보세요.' }}</p>
        
                      </div>
        
                    </template>
        
        
        
                    <template v-else>
        
                      <div class="edit-fields fade-in">
        
                        <div class="input-group">
        
                          <label>닉네임</label>
        
                          <input v-model="editForm.nickname" class="edit-input name-input" />
        
                        </div>
        
                        <div class="input-group">
        
                          <label>소개글</label>
        
                          <textarea v-model="editForm.intro" class="edit-input intro-input" rows="3"></textarea>
        
                        </div>
        
                      </div>
        
                    </template>
        
                  </section>
        
        
        
                  <section class="social-data">
        
                    <div class="data-row" @click="uiStore.showFollowList(userStore.profile.id, 'followers')">
        
                      <span class="data-label">팔로워</span>
        
                      <span class="data-dot"></span>
        
                      <span class="data-value">{{ userStore.profile.follower_count ?? 0 }}</span>
        
                    </div>
        
                    <div class="data-row" @click="uiStore.showFollowList(userStore.profile.id, 'following')">
        
                      <span class="data-label">팔로잉</span>
        
                      <span class="data-dot"></span>
        
                      <span class="data-value">{{ userStore.profile.following_count ?? 0 }}</span>
        
                    </div>
        
                  </section>
        
        
        
                  <footer class="action-zone">
        
                    <button v-if="!isEditing" class="btn-primary-minimal" @click="startEdit">
        
                      프로필 수정
        
                    </button>
        
                    <div v-else class="edit-btn-set">
        
                      <button class="btn-save-minimal" @click="saveEdit">저장</button>
        
                      <button class="btn-cancel-minimal" @click="cancelEdit">취소</button>
        
                    </div>
        
                  </footer>
        
                </aside>

        <!-- 2. Records Feed (Right) -->
        <main class="records-feed">
          
          <nav class="activity-nav">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              class="nav-item"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              <span class="nav-label">{{ tab.label }}</span>
              <span class="nav-count">{{ tab.count }}</span>
            </button>
          </nav>

          <div class="records-container">
            <!-- Movie Grids -->
            <div v-if="activeTab === 'collection' || activeTab === 'rating'" class="fade-in">
              <div v-if="activeTab === 'collection'">
                <div v-if="paginatedCollection.length" class="editorial-grid">
                  <div 
                    v-for="movie in paginatedCollection" 
                    :key="movie.id" 
                    class="record-card movie-record"
                    @click="goMovie(movie.id)"
                  >
                    <div class="poster-box">
                      <img :src="getPosterUrl(movie.poster_url)" alt="poster">
                    </div>
                    <div class="record-info">
                      <span class="record-title">{{ movie.title_ko || movie.title }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">컬렉션이 없습니다.</div>
                <PaginationNav 
                  v-if="collectionTotalPages > 1" 
                  :current="collectionPage" 
                  :total="collectionTotalPages" 
                  @change="(p) => collectionPage = p" 
                />
              </div>

              <div v-if="activeTab === 'rating'">
                <div v-if="paginatedRatings.length" class="editorial-grid">
                  <div 
                    v-for="r in paginatedRatings" 
                    :key="r.id" 
                    class="record-card movie-record rated"
                    @click="goMovie(r.movie)"
                  >
                    <div class="poster-box">
                      <img :src="getPosterUrl(r.movie_poster)" alt="poster">
                      <div class="rating-overlay">★ {{ r.score }}</div>
                    </div>
                    <div class="record-info">
                      <span class="record-title">{{ r.movie_title }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">평가한 영화가 없습니다.</div>
                <PaginationNav 
                  v-if="ratingTotalPages > 1" 
                  :current="ratingPage" 
                  :total="ratingTotalPages" 
                  @change="(p) => ratingPage = p" 
                />
              </div>
            </div>

            <!-- List Contents -->
            <div v-else class="fade-in">
              <div v-if="activeTab === 'comment'" class="stream-layout">
                <div v-if="paginatedComments.length" class="comment-stream">
                  <div v-for="r in paginatedComments" :key="r.id" class="stream-item" @click="goMovie(r.movie)">
                    <div class="stream-poster">
                      <img :src="getPosterUrl(r.movie_poster)" alt="poster" />
                    </div>
                    <div class="stream-body">
                      <div class="stream-header">
                        <span class="stream-title">{{ r.movie_title }}</span>
                        <span class="stream-score">★ {{ r.score }}</span>
                      </div>
                      <div class="stream-content">
                        <p class="quote-text">"{{ r.content || '...' }}"</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">작성한 코멘트가 없습니다.</div>
                <PaginationNav 
                  v-if="commentTotalPages > 1" 
                  :current="commentPage" 
                  :total="commentTotalPages" 
                  @change="(p) => commentPage = p" 
                />
              </div>

              <div v-if="activeTab === 'articles'" class="stream-layout">
                <div v-if="paginatedArticles.length" class="article-stack">
                  <div 
                    v-for="article in paginatedArticles" 
                    :key="article.id" 
                    class="article-minimal"
                    @click="goArticle(article.id)"
                  >
                    <div class="article-content-wrapper">
                      <div class="article-text">
                        <div class="article-header">
                          <span v-if="article.movie_title" class="tag">{{ article.movie_title }}</span>
                          <span class="date">{{ formatDate(article.created_at) }}</span>
                        </div>
                        <h3 class="article-title">{{ article.title }}</h3>
                        <div class="article-footer">
                          <span class="stat">조회수 {{ article.views }}</span>
                          <span class="stat">좋아요 {{ article.likes_count }}</span>
                        </div>
                      </div>
                      <div v-if="article.image" class="article-thumbnail">
                        <img :src="getArticleImageUrl(article.image)" alt="article-image">
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">작성한 게시글이 없습니다.</div>
                <PaginationNav 
                  v-if="articlesTotalPages > 1" 
                  :current="articlesPage" 
                  :total="articlesTotalPages" 
                  @change="(p) => articlesPage = p" 
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Loading Screen -->
    <div v-else class="loading-overlay">
      <div class="glitch-text" data-text="기록 열람 중">기록 열람 중</div>
    </div>

    <FollowListView
      v-if="uiStore.isFollowListVisible"
      :user-id="uiStore.followListUserId"
      :initial-tab="uiStore.followListInitialTab"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUIStore } from '@/stores/ui'
import PaginationNav from '@/components/PaginationNav.vue'
import FollowListView from '@/views/FollowListView.vue'

const API_URL = 'http://127.0.0.1:8000'
const router = useRouter()
const userStore = useUserStore()
const uiStore = useUIStore()

const activeTab = ref('collection')
const isEditing = ref(false)
const editForm = ref({ nickname: '', intro: '', profile_imageFile: null })
const previewImageUrl = ref(null)
const visibleSpoilers = reactive({})

const collectionPage = ref(1)
const ratingPage = ref(1)
const commentPage = ref(1)
const articlesPage = ref(1)

const itemsPerPageMovies = 9
const itemsPerPageList = 5

const tabs = computed(() => [
  { id: 'collection', label: 'COLLECTION', count: userStore.profile?.like_movies?.length || 0 },
  { id: 'rating', label: 'RATINGS', count: userStore.profile?.rating_count || 0 },
  { id: 'comment', label: 'COMMENTS', count: userStore.profile?.comment_count || 0 },
  { id: 'articles', label: 'ARTICLES', count: userStore.profile?.articles?.length || 0 },
])

// Pagination Logic
const paginatedCollection = computed(() => {
  const list = userStore.profile?.like_movies || []
  return list.slice((collectionPage.value - 1) * itemsPerPageMovies, collectionPage.value * itemsPerPageMovies)
})
const collectionTotalPages = computed(() => Math.ceil((userStore.profile?.like_movies?.length || 0) / itemsPerPageMovies))

const paginatedRatings = computed(() => {
  const list = userStore.userRatings || []
  return list.slice((ratingPage.value - 1) * itemsPerPageMovies, ratingPage.value * itemsPerPageMovies)
})
const ratingTotalPages = computed(() => Math.ceil((userStore.userRatings?.length || 0) / itemsPerPageMovies))

const paginatedComments = computed(() => {
  const list = userStore.userReviews || []
  return list.slice((commentPage.value - 1) * itemsPerPageList, commentPage.value * itemsPerPageList)
})
const commentTotalPages = computed(() => Math.ceil((userStore.userReviews?.length || 0) / itemsPerPageList))

const paginatedArticles = computed(() => {
  const list = userStore.profile?.articles || []
  return list.slice((articlesPage.value - 1) * itemsPerPageList, articlesPage.value * itemsPerPageList)
})
const articlesTotalPages = computed(() => Math.ceil((userStore.profile?.articles?.length || 0) / itemsPerPageList))

// Profile Logic
const startEdit = () => {
  const p = userStore.profile || {}
  editForm.value.nickname = p.nickname || p.username || ''
  editForm.value.intro = p.intro || ''
  editForm.value.profile_imageFile = null
  previewImageUrl.value = null
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  previewImageUrl.value = null
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    editForm.value.profile_imageFile = file
    previewImageUrl.value = URL.createObjectURL(file)
  }
}

const saveEdit = async () => {
  if (!editForm.value.nickname?.trim()) {
    alert('NICKNAME REQUIRED')
    return
  }
  try {
    await userStore.updateProfile({ ...editForm.value })
    isEditing.value = false
    previewImageUrl.value = null
  } catch (err) {
    console.error(err)
    alert('UPDATE FAILED')
  }
}

const initials = computed(() => {
  const name = userStore.profile?.nickname || userStore.profile?.username || '?'
  return name.slice(0, 1).toUpperCase()
})

const profileImageUrl = computed(() => {
  const path = userStore.profile?.profile_image
  if (!path) return `${API_URL}/media/images/no_actor_image.png`
  return path.startsWith('http') ? path : `${API_URL}${path}`
})

// Navigation
const goMovie = (movieId) => router.push({ name: 'movie-detail', params: { id: movieId } })
const goArticle = (articleId) => router.push({ name: 'community-detail', params: { id: articleId } })

const getArticleImageUrl = (path) => {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_URL}${path}`
}

const getPosterUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path.replace('/w500/', '/original/').replace('/w200/', '/original/')
  return `https://image.tmdb.org/t/p/original${path}`
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
}

onMounted(() => {
  if (userStore.isLogin) {
    userStore.fetchProfile().then(() => {
      if (userStore.profile) {
        userStore.fetchUserRatings(userStore.profile.id)
        userStore.fetchUserReviews(userStore.profile.id)
      }
    })
  }
})
</script>

<style scoped>
/* 1. Base Styles (Matching UserProfileView) */
.cinematic-wrapper {
  background-color: #FFFFFFD9;
  color: #1a1a1a;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', sans-serif;
}

.noise-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}

.container-fluid {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5%;
  position: relative;
  z-index: 1;
}

.editorial-layout {
  display: flex;
  gap: 100px;
  padding-top: 100px;
  padding-bottom: 120px;
  transition: all 0.5s ease;
}

/* 2. Identity Sidebar - Clean Archive Style */
.identity-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 100px;
  height: fit-content;
}

.entry-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 1px;
  color: #aaa;
  margin-bottom: 30px;
}

.entry-no { color: #1a1a1a; }

.avatar-capsule {
  width: 100%;
  aspect-ratio: 1;
  background: #f8f8f8;
  border: 1px solid #eee;
  position: relative;
  overflow: hidden;
  margin-bottom: 40px;
}

.avatar-capsule.is-editing {
  border: 1px dashed #409E99;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: sepia(20%) contrast(1.05);
}

.avatar-upload-trigger {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 10;
  transition: 0.3s;
}

.avatar-upload-trigger .plus {
  font-size: 2.5rem;
  font-weight: 200;
  color: #409E99;
}

.identity-body {
  margin-bottom: 50px;
}

.user-nickname {
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1;
  margin-bottom: 10px;
  color: #1a1a1a;
}

.user-email {
  font-size: 0.75rem;
  font-weight: 500;
  color: #aaa;
}

.intro-block {
  margin-top: 25px;
  border-top: 1px solid #f0f0f0;
  padding-top: 25px;
}

.user-intro {
  font-size: 1.2rem;
  line-height: 1.5;
  color: #1a1a1a;
  font-weight: 600;
}

/* Social Data Grid */
.social-data {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 50px;
}

.data-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: 0.2s;
}

.data-row:hover { opacity: 0.7; }

.data-label {
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 1px;
  color: #aaa;
}

.data-dot {
  flex-grow: 1;
  height: 1px;
  border-bottom: 1px dotted #ddd;
}

.data-value {
  font-size: 1.1rem;
  font-weight: 900;
  color: #1a1a1a;
}

/* Edit Mode Controls */
.edit-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group label {
  display: block;
  font-size: 0.6rem;
  font-weight: 900;
  color: #409E99;
  margin-bottom: 5px;
}

.edit-input {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #1a1a1a;
  padding: 8px 0;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
}

.edit-input:focus {
  outline: none;
  border-color: #409E99;
}

.name-input { font-size: 1.5rem; font-weight: 900; }

.action-zone {
  margin-top: 30px;
}

.btn-primary-minimal {
  width: 100%;
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 15px;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 2px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-primary-minimal:hover {
  background: #409E99;
}

.edit-btn-set {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-save-minimal {
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 12px;
  font-size: 0.65rem;
  font-weight: 900;
  cursor: pointer;
}

.btn-cancel-minimal {
  background: transparent;
  color: #aaa;
  border: 1px solid #eee;
  padding: 12px;
  font-size: 0.65rem;
  font-weight: 900;
  cursor: pointer;
}

.btn-save-minimal:hover { background: #409E99; }

/* 3. Social & Feed */
.social-box {
  display: flex; gap: 40px; margin-top: 50px;
  border-top: 2px solid #1a1a1a; padding-top: 30px;
}
.social-item { cursor: pointer; display: flex; flex-direction: column; }
.social-item .label { font-size: 0.7rem; font-weight: 900; color: #409E99; letter-spacing: 2px; }
.social-item .value { font-size: 2.2rem; font-weight: 900; color: #1a1a1a; }

.records-feed { flex-grow: 1; min-height: 1000px; }
.activity-nav { display: flex; gap: 40px; margin-bottom: 40px; border-bottom: 1px solid #eee; }
.nav-item {
  background: none; border: none; padding: 20px 0;
  cursor: pointer; position: relative;
  display: flex; align-items: baseline; gap: 8px;
  color: #bbb; transition: 0.3s;
}
.nav-item.active { color: #1a1a1a; }
.nav-item.active::after {
  content: ""; position: absolute; bottom: -1px; left: 0; width: 100%; height: 3px; background: #1a1a1a;
}
.nav-label { font-size: 1.2rem; font-weight: 800; letter-spacing: -0.5px; }
.nav-count { font-size: 0.8rem; font-weight: 700; color: #409E99; }

/* Grid Styles */
.editorial-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
.record-card { cursor: pointer; position: relative; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.poster-box {
  width: 100%; aspect-ratio: 2/3; overflow: hidden; border-radius: 2px;
  background: #f0f0f0; border: 1px solid #eee; box-shadow: 10px 10px 0px rgba(0,0,0,0.03);
  position: relative; /* 포스터 안으로 뱃지를 가두기 위해 필수 */
}

.poster-box img {
  width: 100%; height: 100%; object-fit: cover;
  filter: grayscale(20%); /* 잡지 인쇄물 느낌을 위해 채도 살짝 조절 */
  transition: all 0.6s ease;
  display: block;
}

.record-card:hover {
  transform: translateY(-10px) rotate(-1deg); /* 살짝 기울어지며 부유 */
}

.record-card:hover .poster-box {
  box-shadow: 20px 20px 0px rgba(64, 158, 153, 0.15); /* 틸 컬러 그림자 포인트 */
  border-color: #409E99;
}

.record-card:hover .poster-box img {
  transform: scale(1.05);
  filter: grayscale(0%);
}

.rating-overlay {
  position: absolute;
  bottom: 0; right: 0;
  background: rgba(26, 26, 26, 0.9);
  color: #FFD700;
  padding: 6px 12px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 2;
  line-height: 1;
}

.record-info { margin-top: 20px; border-left: 2px solid #1a1a1a; padding-left: 12px; }
.record-title { font-size: 1rem; font-weight: 900; color: #1a1a1a; display: block; }

/* Stream Items */
.stream-item { display: flex; gap: 25px; padding: 20px 0; border-bottom: 1px solid #eee; cursor: pointer; }
.stream-poster { width: 75px; height: 105px; border-radius: 2px; overflow: hidden; flex-shrink: 0; }
.stream-poster img { width: 100%; height: 100%; object-fit: cover; }
.stream-body { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
.stream-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.stream-title { font-size: 1.25rem; font-weight: 900; }
.stream-score { font-size: 0.85rem; font-weight: 800; color: #409E99; }
.quote-text { font-size: 1.05rem; line-height: 1.6; color: #555; font-style: italic; border-left: 2px solid #eee; padding-left: 15px; }

/* Spoiler Box Redesign */
.spoiler-box {
  width: 100%;
  height: 45px;
  background: #f5f5f5;
  border-radius: 2px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ddd;
  padding: 0 15px;
}

.spoiler-box p { 
  font-weight: 900; 
  letter-spacing: 2px; 
  color: #777; 
  font-size: 0.75rem; 
  margin: 0;
  margin-right: 20px;
}

.btn-reveal {
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 6px 15px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-reveal:hover { 
  background: #409E99; 
}

/* Article Minimal */
.article-minimal { padding: 40px 0; border-bottom: 1px solid #1a1a1a; cursor: pointer; transition: 0.3s; }
.article-minimal:hover { padding-left: 20px; background: rgba(64, 158, 153, 0.02); }

.article-content-wrapper {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  align-items: flex-start;
}

.article-text {
  flex-grow: 1;
}

.article-thumbnail {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #eee;
}

.article-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-minimal:hover .article-thumbnail img {
  transform: scale(1.1);
}

.article-header { display: flex; gap: 15px; align-items: center; margin-bottom: 15px; }
.tag { font-size: 0.7rem; font-weight: 900; color: #409E99; letter-spacing: 2px; text-transform: uppercase; }
.article-title { font-size: 1.8rem; font-weight: 900; margin-bottom: 15px; letter-spacing: -1px; }
.article-footer { display: flex; gap: 20px; font-size: 0.8rem; font-weight: 700; color: #aaa; }

.empty-state { padding: 100px 0; text-align: center; font-size: 0.9rem; font-weight: 900; color: #ccc; letter-spacing: 5px; }

/* Animations */
.fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.glitch-text {
  font-size: 1rem; font-weight: 900; letter-spacing: 5px; color: #1a1a1a;
  position: relative;
}

.loading-overlay { height: 100vh; display: flex; align-items: center; justify-content: center; }

@media (max-width: 1200px) {
  .editorial-layout { flex-direction: column; gap: 60px; }
  .identity-sidebar { width: 100%; position: relative; top: 0; }
  .editorial-grid { grid-template-columns: 1fr 1fr; }
}
</style>