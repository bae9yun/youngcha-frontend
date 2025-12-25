<template>
  <div class="cinematic-wrapper">
    <!-- Background Noise Texture -->
    <div class="noise-overlay"></div>

    <div class="container-fluid">
      <div class="editorial-layout">
        
        <!-- 1. Sticky Sidebar (Left): Search & Filters -->
        <aside class="filter-sidebar">
          <header class="sidebar-header">
            <h1 class="page-title">영화 검색</h1>
          </header>

          <div class="search-block">
            <div class="input-capsule">
              <input 
                v-model.trim="localSearchQuery" 
                type="text" 
                placeholder="SEARCH TITLES..." 
                class="search-input"
              >
              <span class="search-icon">🔍</span>
            </div>
            <button class="btn-reset-minimal" @click="resetFilters">필터 초기화</button>
          </div>

          <nav class="filter-nav">
            <div class="nav-section">
              <span class="nav-label">GENRES</span>
              <div class="genre-list">
                <button 
                  class="genre-link all-link" 
                  :class="{ active: !selectedGenre }"
                  @click="selectGenre('')"
                >
                  ALL
                </button>
                <button 
                  class="genre-link upcoming-link" 
                  :class="{ active: selectedGenre === '개봉예정' }"
                  @click="selectGenre('개봉예정')"
                >
                  UPCOMING
                </button>
                <button 
                  v-for="g in store.genres" 
                  :key="g" 
                  class="genre-link"
                  :class="{ active: selectedGenre === g }"
                  @click="selectGenre(g)"
                >
                  {{ g.toUpperCase() }}
                </button>
              </div>
            </div>
          </nav>
        </aside>

        <!-- 2. Scrolling Content (Right): Movie Grid -->
        <main class="records-feed">
          <div v-if="store.movies && store.movies.length > 0">
            <!-- Feed Header: Sorting Tabs -->
            <header class="feed-header">
              <div class="sort-tabs">
                <button 
                  v-for="opt in sorts" 
                  :key="opt.value"
                  class="sort-tab-item" 
                  :class="{ active: sortOption === opt.value }"
                  @click="changeSort(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
            </header>

            <div class="editorial-grid">
              <div 
                v-for="movie in store.movies" 
                :key="movie.id" 
                class="record-card movie-entry"
                @click="goToDetail(movie.id)"
              >
                <div class="poster-box">
                  <img 
                    v-if="movie.poster_url" 
                    :src="getImageUrl(movie.poster_url)" 
                    alt="Poster" 
                    class="poster-img"
                    @error="onImageError"
                  >
                  <div v-else class="no-poster-minimal">🎬</div>
                  <div class="rating-badge">★ {{ movie.vote_average ? movie.vote_average.toFixed(1) : '0.0' }}</div>
                </div>
                
                <div class="record-info">
                  <h3 class="record-title">{{ movie.title_ko }}</h3>
                  <div class="record-meta">
                    <span class="year">{{ movie.year || '----' }}</span>
                    <span class="dot"></span>
                    <span class="genre">{{ movie.genres?.split(',')[0] || 'Movie' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination (Matching User Profile/MyPage) -->
            <PaginationNav 
              v-if="store.totalPages > 1" 
              :current="currentPage" 
              :total="store.totalPages" 
              @change="changePage" 
            />
          </div>

          <!-- Empty State -->
          <div v-else class="empty-zone">
            <div class="glitch-text" data-text="NO RESULTS">NO RESULTS</div>
            <p class="empty-msg">검색 결과가 없습니다. 다른 필터를 선택해 보세요.</p>
          </div>
        </main>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useMovieStore } from '@/stores/movies'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import PaginationNav from '@/components/PaginationNav.vue'

const store = useMovieStore()
const router = useRouter()

const localSearchQuery = ref('')
const { sortOption, selectedGenre, currentPage } = storeToRefs(store)

const sorts = [
  { label: '최신순', value: 'latest' },
  { label: '관객순', value: 'audience' },
  { label: '평점순', value: 'rating' },
  { label: '리뷰순', value: 'review_count' }
]

let debounceTimer = null

onMounted(() => {
  store.getGenres()
  localSearchQuery.value = store.searchQuery
  
  const isBack = sessionStorage.getItem('isBackFromDetail')
  if (isBack) {
    sessionStorage.removeItem('isBackFromDetail')
  } else {
    resetFilters()
  }
  store.getMovies(getParams())
})

const getParams = () => {
  const params = {
    page_size: 9 // 한 페이지에 9개만 가져오도록 설정 (3x3 그리드)
  }
  if (localSearchQuery.value) params.query = localSearchQuery.value
  if (selectedGenre.value && selectedGenre.value !== '개봉예정') params.genre = selectedGenre.value
  if (sortOption.value) params.sort = sortOption.value
  if (currentPage.value) params.page = currentPage.value
  
  if (selectedGenre.value === '개봉예정') {
    params.status = 'upcoming'
  } else {
    params.status = 'released'
  }
  return params
}

const selectGenre = (genre) => {
  if (selectedGenre.value === genre && genre !== '개봉예정') return
  if (selectedGenre.value === genre && genre === '개봉예정') {
    selectedGenre.value = ''
  } else {
    selectedGenre.value = genre
  }
  currentPage.value = 1
  store.getMovies(getParams())
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const changeSort = (option) => {
  if (sortOption.value === option) return
  sortOption.value = option
  currentPage.value = 1
  store.getMovies(getParams())
}

const changePage = (page) => {
  if (page > 0 && page <= store.totalPages) {
    currentPage.value = page
    store.getMovies(getParams())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const onSearch = () => {
  currentPage.value = 1
  store.searchQuery = localSearchQuery.value
  store.getMovies(getParams())
}

const resetFilters = () => {
  localSearchQuery.value = ''
  store.searchQuery = ''
  selectedGenre.value = ''
  sortOption.value = 'latest'
  currentPage.value = 1
  // 필터 초기화 후 즉시 영화 목록 갱신 및 상단 이동
  store.getMovies(getParams())
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(localSearchQuery, (newVal) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    onSearch()
  }, 500)
})

const goToDetail = (movieId) => {
  sessionStorage.setItem('isBackFromDetail', 'true')
  router.push({ name: 'movie-detail', params: { id: movieId } })
}

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path.replace('/original/', '/w500/')
  return `https://image.tmdb.org/t/p/w500${path}`
}

const onImageError = (e) => {
  e.target.style.display = 'none'
  const parent = e.target.parentElement
  parent.classList.add('no-poster-minimal')
  parent.innerHTML = '🎬'
}
</script>

<style scoped>
/* 1. Base Cinematic Styles (Matching Detail & MyPage) */
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
  gap: 80px;
  padding-top: 100px;
  padding-bottom: 120px;
}

/* 2. Filter Sidebar (Left) */
.filter-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 100px;
  height: fit-content;
}

.sidebar-header { margin-bottom: 50px; }
.entry-no { font-size: 0.7rem; font-weight: 900; letter-spacing: 2px; color: #aaa; display: block; margin-bottom: 10px; }
.page-title { font-size: 3rem; font-weight: 900; letter-spacing: -2px; line-height: 0.9; color: #1a1a1a; }

.search-block { margin-bottom: 60px; }
.input-capsule {
  position: relative;
  border-bottom: 2px solid #1a1a1a;
  padding-bottom: 10px;
}

.search-input {
  width: 100%;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  font-weight: 800;
  color: #1a1a1a;
  padding-right: 30px;
}

.search-input::placeholder { color: #ddd; letter-spacing: 1px; }
.search-input:focus { outline: none; }
.search-icon { position: absolute; right: 0; top: 0; font-size: 1.2rem; }

.btn-reset-minimal {
  background: none; border: none; padding: 5px 0;
  font-size: 0.9rem; font-weight: 900; letter-spacing: 1px;
  color: #bbb; cursor: pointer; transition: 0.3s;
  display: block;
  margin-left: auto;
  margin-top: 5px;
}

.btn-reset-minimal:hover { color: #409E99; }

.nav-label {
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 3px;
  color: #409E99;
  display: block;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.genre-list { 
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px 0;
  width: 100%;
}

.genre-link {
  width: 100%;
  background: none; border: none; padding: 0;
  font-size: 0.9rem; font-weight: 800; color: #888;
  cursor: pointer; transition: 0.2s;
  letter-spacing: 1px;
  display: block;
}

/* ALL이 첫 번째 자식(span 2)이므로: 
   2, 4, 6... 번째 자식 (UPCOMING, 가족 등) -> 왼쪽 정렬
   3, 5, 7... 번째 자식 (SF, 공연 등) -> 오른쪽 정렬
*/
.genre-link:nth-child(even) {
  text-align: left !important;
}

.genre-link:nth-child(odd):not(.all-link) {
  text-align: right !important;
}

.genre-link:hover { color: #1a1a1a; transform: translateX(5px); }
.genre-link:nth-child(odd):not(.all-link):hover { transform: translateX(-5px); }

.genre-link.active { color: #409E99; transform: translateX(10px); }
.genre-link:nth-child(odd):not(.all-link).active { color: #409E99; transform: translateX(-10px); }

/* ALL & UPCOMING Special Styling */
.all-link {
  grid-column: span 2;
  border-bottom: none;
  padding-bottom: 10px;
  margin-bottom: 5px;
  text-align: left !important;
  font-size: 1.2rem;
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.all-link.active {
  color: #409E99;
}

.upcoming-link { 
  color: #bbb; 
  font-style: normal;
  border-bottom: none;
}

.upcoming-link.active {
  color: #409E99;
}

/* 3. Records Feed (Right) */
.records-feed { flex-grow: 1; }

.feed-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px;
  border-bottom: 2px solid #1a1a1a;
  padding-bottom: 10px;
}

.sort-tabs {
  display: flex;
  gap: 30px;
}

.sort-tab-item {
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 1px;
  color: #bbb;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  padding: 5px 0;
}

.sort-tab-item:hover { color: #1a1a1a; }

.sort-tab-item.active {
  color: #409E99;
}

.sort-tab-item.active::after {
  content: "";
  position: absolute;
  bottom: -12px;
  left: 0;
  width: 100%;
  height: 4px;
  background: #409E99;
}

.editorial-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 50px;
}

.record-card { cursor: pointer; position: relative; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }

.poster-box {
  width: 100%; aspect-ratio: 2/3; overflow: hidden; border-radius: 2px;
  background: #f0f0f0; border: 1px solid #eee; box-shadow: 15px 15px 0px rgba(0,0,0,0.03);
  position: relative;
}

.poster-box img {
  width: 100%; height: 100%; object-fit: cover;
  filter: grayscale(10%) contrast(1.05);
  transition: all 0.6s ease;
  display: block;
}

.record-card:hover { transform: translateY(-10px) rotate(-1deg); }
.record-card:hover .poster-box {
  box-shadow: 25px 25px 0px rgba(64, 158, 153, 0.15);
  border-color: #409E99;
}
.record-card:hover .poster-box img { transform: scale(1.05); filter: grayscale(0%); }

.rating-badge {
  position: absolute;
  bottom: 0; right: 0;
  background: rgba(26, 26, 26, 0.9);
  color: #FFD700;
  padding: 6px 12px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 2;
}

.record-info { margin-top: 20px; border-left: 3px solid #1a1a1a; padding-left: 15px; }
.record-title { font-size: 1.1rem; font-weight: 900; color: #1a1a1a; line-height: 1.2; margin-bottom: 8px; }

.record-meta { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; font-weight: 700; color: #888; }
.dot { width: 4px; height: 4px; background: #ddd; border-radius: 50%; }

/* Empty Zone */
.empty-zone {
  text-align: center; padding: 150px 0;
}
.glitch-text {
  font-size: 2rem; font-weight: 900; letter-spacing: 10px; color: #1a1a1a;
  margin-bottom: 20px;
}
.empty-msg { color: #aaa; font-weight: 600; }

.no-poster-minimal {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  font-size: 3rem; background: #eee;
}

@media (max-width: 1200px) {
  .editorial-layout { flex-direction: column; }
  .filter-sidebar { width: 100%; position: relative; top: 0; margin-bottom: 60px; }
  .editorial-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .editorial-grid { grid-template-columns: 1fr; }
}
</style>