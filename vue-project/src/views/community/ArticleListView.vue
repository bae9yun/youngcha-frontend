<template>
  <div class="page-wrapper">
    <div class="container">
      <div class="section-title">
        <h3><i class="bi bi-graph-up-arrow"></i> 인기 게시글</h3>
      </div>

      <div class="popular-section mb-5">
        <div v-if="store.popularArticles.length > 0" class="popular-grid">
          <div v-for="article in store.popularArticles.slice(0, 4)" :key="article.id" class="popular-item">
            <div class="card popular-card" @click="goToDetail(article.id)" :class="{ 'has-image': article.image }">
              <!-- 배경 이미지 (있을 경우) -->
              <img v-if="article.image" :src="getFormattedImage(article.image)" class="card-bg-img" alt="Background" @error="onImageError">
              <div class="card-bg-overlay"></div>

              <div class="card-body">
                <!-- Popular Movie Tag -->
                <div v-if="article.movie_title" class="tagged-movie-badge">
                  {{ article.movie_title }}
                </div>
                <h5 class="card-title text-truncate">
                  {{ article.title }}
                </h5>
                <div class="card-meta">
                  <div class="user-info">
                    <img v-if="article.user_profile_image" :src="getFormattedImage(article.user_profile_image)" class="mini-avatar" alt="User Profile">
                    <span v-else class="mini-placeholder">{{ article.user_nickname[0] }}</span>
                    <span class="user">{{ article.user_nickname }}</span>
                  </div>
                  <div class="stats">
                    <span>❤️ {{ article.likes_count }}</span>
                    <span>💬 {{ article.comments_count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-muted empty-msg">아직 인기 게시글이 없습니다.</p>
      </div>
      <br>
      <div class="section-title">
        <h3>전체 게시글</h3>
      </div>

      <div class="search-bar-container mb-4">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" class="form-control custom-input" placeholder="게시글 검색..." v-model="searchQuery"
            @input="onSearchInput">
        </div>
        <button @click="handleCreateClick" class="btn btn-create">
          글쓰기
        </button>
      </div>

      <!-- Sorting Options -->
      <div class="sort-options mb-4">
        <button 
          class="btn-sort" 
          :class="{ active: currentSort === 'latest' || !currentSort }"
          @click="changeSort('latest')"
        >
          최신순
        </button>
        <button 
          class="btn-sort" 
          :class="{ active: currentSort === 'likes' }"
          @click="changeSort('likes')"
        >
          좋아요순
        </button>
        <button 
          class="btn-sort" 
          :class="{ active: currentSort === 'comments' }"
          @click="changeSort('comments')"
        >
          댓글순
        </button>
        <button 
          class="btn-sort" 
          :class="{ active: currentSort === 'views' }"
          @click="changeSort('views')"
        >
          조회수순
        </button>
      </div>
      <br>
      <div v-if="filteredArticles.length > 0" class="article-list">

        <div v-for="article in paginatedArticles" :key="article.id" @click="goToDetail(article.id)"
          class="article-row-card">
          <div class="article-thumbnail">
            <img v-if="article.image" :src="getFormattedImage(article.image)" alt="Article Thumbnail" class="thumb-img" @error="onImageError">
            <span v-else class="thumb-icon">🎬</span>
          </div>

          <div class="article-content">
            <!-- 1. Tag -->
            <div class="content-line">
              <div v-if="article.movie_title" class="tagged-movie-badge">
                <i class="bi bi-camera-reels-fill"></i> {{ article.movie_title }}
              </div>
              <div v-else class="tag-placeholder"></div> <!-- 높이 유지를 위한 빈 공간 -->
            </div>
            
            <!-- 2. Title -->
            <h4 class="article-title text-truncate">
              {{ article.title }}
            </h4>

            <!-- 3. Preview (Fixed) -->
            <p class="article-preview text-truncate">
              {{ article.content }}
            </p>

            <!-- 4. Info (Nickname etc) -->
            <div class="article-info"> 
              <div class="author-wrap">
                <img v-if="article.user_profile_image" :src="getFormattedImage(article.user_profile_image)" class="row-avatar" alt="User Profile">
                <span v-else class="row-placeholder">{{ article.user_nickname[0] }}</span>
                <span class="author">{{ article.user_nickname }}</span>
              </div>
              <span class="date">{{ formatCreatedAt(article.created_at) }}</span>
            </div>
          </div>

          <div class="article-stats">
            <div class="stat-item heart">
              <span>❤️</span> {{ article.likes_count }}
            </div>
            <div class="stat-item comment">
              <span>💬</span> {{ article.comments_count }}
            </div>
            <div class="stat-item view">
              <span>👀</span> {{ article.views }}
            </div>
          </div>
        </div>

        <nav aria-label="Page navigation" class="pagination-container" v-if="totalPages > 0">
          <ul class="pagination">
            <!-- First Page -->
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(1)">&lt;&lt;</a>
            </li>
            <!-- Previous Page -->
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">&lt;</a>
            </li>
            <!-- Page Numbers -->
            <li v-for="page in visiblePageNumbers" :key="page" class="page-item" :class="{ active: currentPage === page }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <!-- Next Page -->
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">&gt;</a>
            </li>
            <!-- Last Page -->
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(totalPages)">&gt;&gt;</a>
            </li>
          </ul>
        </nav>

      </div>
      <div v-else-if="store.articles.length > 0" class="text-center py-5 text-muted">
        검색 결과가 없습니다.
      </div>
      <div v-else class="text-center py-5 text-muted">
        게시글이 없습니다.
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useCommunityStore } from '@/stores/community'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const store = useCommunityStore()
const userStore = useUserStore()
const router = useRouter()

const currentPage = ref(1)
const itemsPerPage = 5
const searchQuery = ref('')
const currentSort = ref('latest')

onMounted(() => {
  store.fetchArticles()
  store.fetchPopularArticles()
})

const changeSort = (option) => {
  currentSort.value = option
  store.fetchArticles(option)
  currentPage.value = 1 
}

const filteredArticles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return store.articles
  }
  return store.articles.filter(article =>
    article.title.toLowerCase().includes(query) ||
    article.user_nickname.toLowerCase().includes(query)
  )
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredArticles.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredArticles.value.length / itemsPerPage)
})

const visiblePageNumbers = computed(() => {
  const maxPageButtons = 10
  const currentGroup = Math.ceil(currentPage.value / maxPageButtons)
  const start = (currentGroup - 1) * maxPageButtons + 1
  const end = Math.min(currentGroup * maxPageButtons, totalPages.value)
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const onSearchInput = () => {
  currentPage.value = 1
}

const goToDetail = (articleId) => {
  router.push({ name: 'community-detail', params: { id: articleId } })
}

const handleCreateClick = () => {
  if (!userStore.isLogin) {
    alert('로그인이 필요합니다.')
    router.push({ name: 'login' })
    return
  }
  router.push({ name: 'community-create' })
}

const formatCreatedAt = (createdAt) => {
  const d = new Date(createdAt)
  const now = new Date()
  const isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString()
}

const getFormattedImage = (imagePath) => {
  if (!imagePath) return ''
  return imagePath.startsWith('http') ? imagePath : `http://127.0.0.1:8000${imagePath}`
}

const onImageError = (e) => e.target.style.display = 'none'

</script>

<style scoped>
* { box-sizing: border-box; }

.page-wrapper { background-color: #FFFFFFD9; min-height: 100vh; width: 100%; padding-bottom: 50px; }
.container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; color: #333; }

.section-title h3 { font-size: 1.2rem; font-weight: bold; color: #222; margin-bottom: 15px; border-left: 4px solid #409E99; padding-left: 10px; }

/* Popular Grid */
.popular-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.popular-card { background: #f8f9fa; border: 1px solid #eee; border-radius: 12px; min-height: 180px; position: relative; overflow: hidden; cursor: pointer; transition: 0.3s; display: flex; flex-direction: column; justify-content: flex-end; }
.popular-card:hover { transform: translateY(-5px); box-shadow: 0 5px 20px rgba(64, 158, 153, 0.1); border-color: #409E99; }
.card-bg-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; }
.card-bg-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.1) 100%); z-index: 2; display: none; }
.popular-card.has-image .card-bg-overlay { display: block; }
.popular-card.has-image .card-title, .popular-card.has-image .card-meta { color: white; }
.popular-card .card-body { position: relative; padding: 20px; z-index: 3; }
.popular-card .card-title { font-weight: bold; margin-bottom: 8px; white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; color: #666; }
.card-meta .user-info { display: flex; align-items: center; gap: 6px; }
.card-meta .stats { display: flex; gap: 10px; }

/* Article List - Perfect Spacing Implementation */
.article-list { display: flex; flex-direction: column; gap: 12px; }
.article-row-card { 
  display: flex; 
  align-items: center; 
  background: #fff; 
  border: 1px solid #eee; 
  border-radius: 12px; 
  padding: 15px; 
  cursor: pointer; 
  transition: 0.2s; 
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02); 
  height: 130px; /* 늘어난 높이 */
}
.article-row-card:hover { border-color: #409E99; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }

.article-thumbnail { width: 90px; height: 90px; background: #f1f3f5; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 20px; flex-shrink: 0; overflow: hidden; }
.thumb-img { width: 100%; height: 100%; object-fit: cover; }
.thumb-icon { font-size: 2rem; color: #ccc; }

/* Content Area with Equal Spacing */
.article-content { 
  flex-grow: 1; 
  min-width: 0; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; /* 요소들 사이 간격을 동일하게 배분 */
  height: 100px; /* 늘어난 영역 */
}

.content-line { display: flex; align-items: center; height: 1.2rem; }
.tag-placeholder { height: 1.2rem; } /* 태그가 없어도 공간 유지 */

.tagged-movie-badge {
  display: inline-block;
  font-size: 0.7rem; 
  color: #409E99; 
  font-weight: 700; 
  background: rgba(255, 255, 255, 0.6); 
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 2px 8px; 
  border-radius: 6px; 
  border: 1px solid rgba(64, 158, 153, 0.2);
  margin: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.article-title { font-size: 1.05rem; font-weight: bold; margin: 0; color: #333; line-height: 1.2; }
.article-preview { font-size: 0.85rem; color: #666; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4; }
.article-info { display: flex; align-items: center; gap: 15px; font-size: 0.75rem; color: #888; }
.author-wrap { display: flex; align-items: center; gap: 6px; }

/* Avatars */
.mini-avatar, .mini-placeholder, .row-avatar, .row-placeholder { width: 20px; height: 20px; border-radius: 50%; }
.mini-placeholder, .row-placeholder { background: #409E99; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: bold; }
.mini-avatar, .row-avatar { object-fit: cover; }
.row-avatar, .row-placeholder { width: 22px; height: 22px; }

/* Stats */
.article-stats { margin-left: 20px; text-align: right; min-width: 80px; }
.stat-item { font-size: 0.85rem; color: #666; margin-bottom: 3px; }
.heart { color: #ff6b6b; }

/* Rest of the UI */
.search-bar-container { display: flex; gap: 15px; align-items: center; }
.search-wrapper { position: relative; flex-grow: 1; }
.search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #888; }
.custom-input { background: #f1f3f5; border: 1px solid #dee2e6; color: #333; border-radius: 50px; padding: 12px 15px 12px 45px; width: 100%; transition: 0.3s; }
.custom-input:focus { background: #fff; border-color: #409E99; box-shadow: 0 0 10px rgba(64, 158, 153, 0.1); outline: none; }
.btn-create {
  background: rgba(64, 158, 153, 0.7);
  color: white;
  border-radius: 50px;
  padding: 10px 25px;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.btn-create:hover {
  background: rgba(64, 158, 153, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(64, 158, 153, 0.3);
}

.sort-options { display: flex; gap: 10px; margin-top: 10px; }
.btn-sort {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #555;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition: all 0.2s ease;
}
.btn-sort:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #ccc;
}
.btn-sort.active {
  background: rgba(64, 158, 153, 0.8);
  color: white;
  border-color: rgba(64, 158, 153, 0.5);
  box-shadow: 0 4px 10px rgba(64, 158, 153, 0.2);
}

.pagination-container { margin-top: 40px; display: flex; justify-content: center; }
.pagination { display: flex; gap: 8px; list-style: none; padding: 0; }
.page-link { display: flex; align-items: center; justify-content: center; width: 35px; height: 35px; border-radius: 50%; background: #fff; border: 1px solid #ddd; color: #555; text-decoration: none; }
.page-item.active .page-link { background: #409E99; border-color: #409E99; color: white; }
</style>