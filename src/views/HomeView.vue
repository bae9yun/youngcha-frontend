<template>
  <div class="cinematic-wrapper">
    <!-- Background Noise Texture -->
    <div class="noise-overlay"></div>

    <div class="home-main-content">
      <!-- 1. Hero Slider -->
      <section class="hero-section">
        <div 
          class="hero-slider" 
          v-if="heroMovies && heroMovies.length > 0"
          @mouseenter="stopSlide"
          @mouseleave="startSlide"
        >
          <transition-group name="fade" tag="div" class="slider-wrapper">
            <div 
              v-for="movie in activeHeroMovie" 
              :key="movie.id" 
              class="slide-item"
            >
              <div class="hero-bg" :style="getHeroStyle(movie)"></div>
              <div class="hero-overlay">
                <div class="hero-content">
                  <h1 class="hero-title">{{ movie.title_ko }}</h1>
                  <p class="hero-overview">{{ movie.overview || '상세 정보가 없습니다.' }}</p>
                  <div class="hero-meta">
                    <span v-if="movie.vote_average">⭐ {{ movie.vote_average.toFixed(1) }}</span>
                  </div>
                  <div class="hero-actions">
                    <button class="btn-detail-home" @click="goToDetail(movie.id)">
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>

          <div class="slider-indicators">
            <button 
              v-for="(movie, index) in heroMovies" 
              :key="'indi-' + movie.id"
              @click="setSlide(index)" 
              :class="{ active: currentIndex === index }"
            ></button>
          </div>

          <button class="slider-control prev" @click="prevSlide">‹</button>
          <button class="slider-control next" @click="nextSlide">›</button>
        </div>

        <div v-else class="hero-loading">
          <div class="glitch-text" data-text="영화 정보를 불러오는 중입니다...">영화 정보를 불러오는 중입니다...</div>
        </div>
      </section>

      <!-- 2. Editorial Movie Rows -->
      <div class="editorial-container">
        
        <!-- Section: Recommended -->
        <section class="editorial-row fade-in" v-if="userStore.isLogin && recommendedMovies && recommendedMovies.length > 0">
          <header class="row-header">
            <div class="header-left">
              <h2 class="section-title">{{ userStore.nickname }}님을 위한 추천 영화</h2>
            </div>
            <p v-if="!hasRatings" class="editorial-guide">
              평점을 남기고 나만의 취향 저격 영화를 추천받아보세요!
            </p>
          </header>
          
          <div class="row-scroll-wrapper">
            <button class="btn-scroll prev" @click="scrollRow('recommended', -1)">‹</button>
            <div class="editorial-scroll" ref="recommendedRow">
              <div 
                v-for="(movie, index) in [...recommendedMovies, ...recommendedMovies.slice(0, 5)]" 
                :key="`rec-${movie.id}-${index}`" 
                class="record-card home-card" 
                @click="goToDetail(movie.id)"
              >
                <div class="poster-box">
                  <img :src="getImageUrl(movie.poster_url)" alt="poster" @error="onImageError">
                  <div class="rating-badge">★ {{ movie.vote_average ? movie.vote_average.toFixed(1) : '0.0' }}</div>
                </div>
                <div class="record-info">
                  <h4 class="record-title">{{ movie.title_ko }}</h4>
                </div>
              </div>
            </div>
            <button class="btn-scroll next" @click="scrollRow('recommended', 1)">›</button>
          </div>
        </section>

        <!-- Section: Popular (Top 10) -->
        <section class="editorial-row fade-in">
          <header class="row-header">
            <div class="header-left">
              <h2 class="section-title">모두가 본 영화</h2>
            </div>
          </header>
          
          <div class="row-scroll-wrapper">
            <button class="btn-scroll prev" @click="scrollRow('popular', -1)">‹</button>
            <div class="editorial-scroll" ref="popularRow" v-if="popularMovies && popularMovies.length > 0">
              <div 
                v-for="(movie, index) in [...popularMovies, ...popularMovies.slice(0, 5)]" 
                :key="`pop-${movie.id}-${index}`" 
                class="record-card home-card rated-card" 
                @click="goToDetail(movie.id)"
              >
                <div class="poster-box">
                  <span class="rank-number" v-if="index < 10">{{ index + 1 }}</span>
                  <span class="rank-number" v-else>{{ (index % 10) + 1 }}</span>
                  <img :src="getImageUrl(movie.poster_url)" alt="poster" @error="onImageError">
                  <div class="stat-badge">👥 {{ formattedAudience(movie.audi_acc) }}</div>
                </div>
                <div class="record-info">
                  <h4 class="record-title">{{ movie.title_ko }}</h4>
                </div>
              </div>
            </div>
            <button class="btn-scroll next" @click="scrollRow('popular', 1)">›</button>
          </div>
        </section>

        <!-- Section: Latest / Upcoming -->
        <section class="editorial-row fade-in">
          <header class="row-header">
            <div class="header-left">
              <h2 class="section-title">개봉 예정작</h2>
            </div>
          </header>
          
          <div class="row-scroll-wrapper">
            <button class="btn-scroll prev" @click="scrollRow('latest', -1)">‹</button>
            <div class="editorial-scroll" ref="latestRow" v-if="latestMovies && latestMovies.length > 0">
              <div 
                v-for="(movie, index) in [...latestMovies, ...latestMovies.slice(0, 5)]" 
                :key="`lat-${movie.id}-${index}`" 
                class="record-card home-card" 
                @click="goToDetail(movie.id)"
              >
                <div class="poster-box">
                  <img :src="getImageUrl(movie.poster_url)" alt="poster" @error="onImageError">
                  <div class="stat-badge date-badge">{{ movie.year }}</div>
                </div>
                <div class="record-info">
                  <h4 class="record-title">{{ movie.title_ko }}</h4>
                </div>
              </div>
            </div>
            <button class="btn-scroll next" @click="scrollRow('latest', 1)">›</button>
          </div>
        </section>

        <!-- Section: Top Rated -->
        <section class="editorial-row fade-in last-row">
          <header class="row-header">
            <div class="header-left">
              <h2 class="section-title">평점 우수작</h2>
            </div>
          </header>
          
          <div class="row-scroll-wrapper">
            <button class="btn-scroll prev" @click="scrollRow('topRated', -1)">‹</button>
            <div class="editorial-scroll" ref="topRatedRow" v-if="topRatedMovies && topRatedMovies.length > 0">
              <div 
                v-for="(movie, index) in [...topRatedMovies, ...topRatedMovies.slice(0, 5)]" 
                :key="`top-${movie.id}-${index}`" 
                class="record-card home-card" 
                @click="goToDetail(movie.id)"
              >
                <div class="poster-box">
                  <img :src="getImageUrl(movie.poster_url)" alt="poster" @error="onImageError">
                  <div class="rating-badge">★ {{ movie.vote_average ? movie.vote_average.toFixed(1) : '0.0' }}</div>
                </div>
                <div class="record-info">
                  <h4 class="record-title">{{ movie.title_ko }}</h4>
                </div>
              </div>
            </div>
            <button class="btn-scroll next" @click="scrollRow('topRated', 1)">›</button>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMovieStore } from '@/stores/movies'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
// import axios from 'axios'
import api from '@/apis/axios'

const router = useRouter()
const store = useMovieStore()
const userStore = useUserStore()
const { recommendedMovies } = storeToRefs(store)
const API_URL = store.API_URL

const heroMovies = ref([])
const popularMovies = ref([])
const latestMovies = ref([])
const topRatedMovies = ref([])

const recommendedRow = ref(null)
const popularRow = ref(null)
const latestRow = ref(null)
const topRatedRow = ref(null)

const hasRatings = computed(() => {
  return userStore.profile && userStore.profile.rating_count > 0
})

const currentIndex = ref(0)
let slideInterval = null

onMounted(async () => {
  if (userStore.isLogin) {
    await store.fetchRecommendedMovies()
  }
  await fetchHomeData()
  startSlide()
})

onUnmounted(() => {
  stopSlide()
})

const startSlide = () => {
  if (slideInterval) clearInterval(slideInterval)
  if (heroMovies.value && heroMovies.value.length > 1) {
    slideInterval = setInterval(() => {
      nextSlide()
    }, 5000)
  }
}

const stopSlide = () => {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
}

const nextSlide = () => {
  if (!heroMovies.value || heroMovies.value.length === 0) return
  currentIndex.value = (currentIndex.value + 1) % heroMovies.value.length
}

const prevSlide = () => {
  if (!heroMovies.value || heroMovies.value.length === 0) return
  currentIndex.value = (currentIndex.value - 1 + heroMovies.value.length) % heroMovies.value.length
}

const setSlide = (index) => {
  currentIndex.value = index
  startSlide() 
}

const activeHeroMovie = computed(() => {
  if (!heroMovies.value || heroMovies.value.length === 0) return []
  return [heroMovies.value[currentIndex.value]]
})

const isScrolling = ref({
  recommended: false,
  popular: false,
  latest: false,
  topRated: false
})

const scrollRow = (type, direction) => {
  if (isScrolling.value[type]) return 

  const scrollAmount = 1275 
  let container = null
  
  if (type === 'recommended') container = recommendedRow.value
  else if (type === 'popular') container = popularRow.value
  else if (type === 'latest') container = latestRow.value
  else if (type === 'topRated') container = topRatedRow.value

  if (container) {
    const { scrollLeft } = container
    isScrolling.value[type] = true

    if (direction === 1) {
      // 오른쪽으로 이동
      if (scrollLeft >= scrollAmount - 50 && scrollLeft < scrollAmount * 2 - 50) {
        // 현재 2페이지(6~10번) -> 클론 페이지(1~5번)로 이동 후 점프
        container.scrollTo({ left: scrollAmount * 2, behavior: 'smooth' })
        setTimeout(() => {
          container.scrollTo({ left: 0, behavior: 'auto' })
          isScrolling.value[type] = false
        }, 600)
      } else {
        // 1페이지 -> 2페이지 혹은 기타
        const target = scrollLeft >= scrollAmount * 2 - 50 ? scrollAmount : scrollLeft + scrollAmount
        container.scrollTo({ left: target, behavior: 'smooth' })
        setTimeout(() => { isScrolling.value[type] = false }, 600)
      }
    } else {
      // 왼쪽으로 이동
      if (scrollLeft <= 50) {
        // 처음 위치 -> 끝(클론)으로 점프 후 2페이지로 이동
        container.scrollTo({ left: scrollAmount * 2, behavior: 'auto' })
        setTimeout(() => {
          container.scrollTo({ left: scrollAmount, behavior: 'smooth' })
          setTimeout(() => { isScrolling.value[type] = false }, 600)
        }, 20)
      } else {
        container.scrollTo({ left: scrollLeft - scrollAmount, behavior: 'smooth' })
        setTimeout(() => { isScrolling.value[type] = false }, 600)
      }
    }
  }
}

const fetchHomeData = async () => {
  try {
    // const resHero = await axios.get(`${API_URL}/api/movies/recommendations/hero/`)
    const resHero = await api.get(`/api/movies/recommendations/hero/`)
    const heroCandidates = resHero.data || []

    if (heroCandidates.length > 0) {
      const detailRequests = heroCandidates.map(movie => 
        // axios.get(`${API_URL}/api/movies/${movie.id}/`)
        api.get(`/api/movies/${movie.id}/`)
      )
      const responses = await Promise.all(detailRequests)
      heroMovies.value = responses.map(res => res.data).filter(item => item)
    } else {
      heroMovies.value = []
    }

    // const resPopular = await axios.get(`${API_URL}/api/movies/`, {
    const resPopular = await api.get(`/api/movies/`, {
      params: { sort: 'audience', page: 1 }
    })
    popularMovies.value = resPopular.data.results ? resPopular.data.results.slice(0, 10) : []

    // const resLatest = await axios.get(`${API_URL}/api/movies/`, {
    const resLatest = await api.get(`/api/movies/`, {
      params: { sort: 'latest', page: 1 }
    })
    latestMovies.value = resLatest.data.results ? resLatest.data.results.slice(0, 10) : []

    // const resTop = await axios.get(`${API_URL}/api/movies/`, {
    const resTop = await api.get(`/api/movies/`, {
      params: { sort: 'rating', page: 1 }
    })
    topRatedMovies.value = resTop.data.results ? resTop.data.results.slice(0, 10) : []

  } catch (err) {
    console.error('Failed to fetch home data:', err)
    heroMovies.value = []
    popularMovies.value = []
    latestMovies.value = []
    topRatedMovies.value = []
  }
}

const getHeroStyle = (movie) => {
  if (!movie || !movie.backdrop_path) return { backgroundColor: '#111' }
  let path = movie.backdrop_path
  if (path.startsWith('http')) {
    path = path.replace('/w500/', '/original/').replace('/w1280/', '/original/')
  } else {
    path = `https://image.tmdb.org/t/p/original${path}`
  }
  return { backgroundImage: `url(${path})` }
}

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path.replace('/original/', '/w500/')
  return `https://image.tmdb.org/t/p/w500${path}`
}

const onImageError = (e) => {
  e.target.style.display = 'none'
  const parent = e.target.parentElement
  parent.innerHTML = '<div class="no-poster-minimal">🎬</div>'
}

const goToDetail = (movieId) => {
  router.push({ name: 'movie-detail', params: { id: movieId } })
}

const formattedAudience = (val) => {
  if (!val) return '0'
  if (val >= 10000) return (val / 10000).toFixed(1) + '만'
  return val.toLocaleString()
}
</script>

<style scoped>
/* 1. Base Styles (Light Editorial) */
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

.home-main-content {
  position: relative;
  z-index: 1;
}

/* 2. Hero Slider Refinement */
.hero-slider {
  position: relative;
  width: 100%;
  height: 700px; 
  overflow: hidden;
  background: #000;
}

.slider-wrapper { position: relative; width: 100%; height: 100%; }
.slide-item { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

.fade-enter-active, .fade-leave-active { transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.hero-bg {
  width: 100%; height: 100%;
  background-size: cover;
  background-position: center 20%;
  transition: transform 10s linear;
}

.slide-item.v-enter-active .hero-bg { transform: scale(1.1); }

.hero-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
  display: flex;
  align-items: flex-end;
  padding-bottom: 80px;
}

.hero-content { 
  max-width: 1350px; 
  width: 100%;
  margin: 0 auto;
  padding: 0 50px; 
  color: #fff; 
  text-shadow: 0 4px 20px rgba(0,0,0,0.5); 
}

.hero-title { font-size: 4.5rem; font-weight: 900; letter-spacing: -2px; line-height: 1; margin-bottom: 20px; }
.hero-overview { font-size: 1.2rem; line-height: 1.6; margin-bottom: 30px; opacity: 0.9; max-width: 600px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.btn-detail-home {
  background: white; 
  color: black; 
  border: 1px solid rgba(0,0,0,0.1);
  padding: 12px 45px;
  border-radius: 2px;
  font-weight: 900;
  letter-spacing: 2px;
  font-size: 1.2rem; /* 1rem에서 1.2rem으로 키움 */
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.btn-detail-home:hover {
  background: #409E99;
  color: white;
  transform: translateY(-5px);
  border-color: #409E99;
}

.slider-indicators {
  position: absolute; 
  bottom: 40px; 
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1350px;
  padding: 0 50px;
  display: flex; 
  gap: 12px; 
  z-index: 10;
}
.slider-indicators button {
  width: 40px; height: 3px; background: rgba(255,255,255,0.3); border: none; cursor: pointer; transition: 0.3s;
}
.slider-indicators button.active { background: #409E99; width: 60px; }

.slider-control {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: white; font-size: 4rem; font-weight: 100;
  padding: 20px; cursor: pointer; z-index: 10; opacity: 0.5; transition: 0.3s;
}
.slider-control:hover { opacity: 1; color: #409E99; }
.slider-control.prev { left: 20px; }
.slider-control.next { right: 20px; }

.hero-loading { 
  height: 700px; 
  display: flex; 
  flex-direction: column;
  align-items: center; 
  justify-content: center; 
  background: #111; 
  text-align: center;
}

/* 3. Editorial Rows */
.editorial-container { 
  max-width: 1350px; 
  margin: 0 auto;
  padding: 80px 50px 120px 50px; 
}

.editorial-row { margin-bottom: 100px; position: relative; }
.last-row { margin-bottom: 0; }

.row-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 10px;
}

.section-no { font-size: 0.65rem; font-weight: 900; color: #aaa; letter-spacing: 2px; display: block; margin-bottom: 5px; }
.section-title { font-size: 1.8rem; font-weight: 900; letter-spacing: -1px; color: #1a1a1a; margin: 0; }

.editorial-guide { font-size: 0.75rem; font-weight: 800; color: #409E99; letter-spacing: 1px; }

.row-scroll-wrapper { 
  position: relative; 
  width: 100%;
}

.editorial-scroll {
  display: flex; gap: 25px; overflow-x: auto; padding: 5px 0 35px 0;
  scrollbar-width: none; -ms-overflow-style: none;
}
.editorial-scroll::-webkit-scrollbar { display: none; }

/* 4. Editorial Card Styles */
.home-card { flex: 0 0 230px; } /* 5개가 1250px 내부폭에 딱 맞음 */

.poster-box {
  width: 100%; aspect-ratio: 2/3; overflow: hidden; border-radius: 2px;
  background: #f0f0f0; border: 1px solid #eee; box-shadow: 12px 12px 0px rgba(0,0,0,0.03);
  position: relative;
}

.poster-box img {
  width: 100%; height: 100%; object-fit: cover;
  filter: grayscale(10%) contrast(1.05); transition: all 0.6s ease; display: block;
}

.home-card:hover { transform: translateY(-5px) scale(1.03); } 
.home-card:hover .poster-box { 
  box-shadow: 8px 8px 0px rgba(64, 158, 153, 0.1); 
  border-color: #409E99; 
}
.home-card:hover .poster-box img { transform: scale(1.05); filter: grayscale(0%); }

.rating-badge {
  position: absolute; bottom: 0; right: 0;
  background: rgba(26, 26, 26, 0.9); color: #FFD700;
  padding: 6px 12px; font-size: 0.9rem; font-weight: 500; z-index: 2;
  line-height: 1;
}

.stat-badge {
  position: absolute; bottom: 0; left: 0;
  background: #1a1a1a; color: white;
  padding: 6px 12px; font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; z-index: 2;
}

.rank-number {
  position: absolute; top: -10px; left: -10px;
  font-size: 5rem; font-weight: 900; color: rgba(64, 158, 153, 0.2);
  line-height: 1; z-index: 0; pointer-events: none;
  font-family: 'Impact', sans-serif;
}

.record-info { margin-top: 20px; border-left: 3px solid #1a1a1a; padding-left: 15px; }
.record-title { font-size: 1.1rem; font-weight: 900; color: #1a1a1a; line-height: 1.2; margin: 0; }

/* 5. Controls & Animations */
.btn-scroll {
  position: absolute;
  top: 40%; 
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #1a1a1a;
  font-size: 3.5rem; 
  font-weight: 100;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  opacity: 0.3;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 60px;
  height: 60px;
}

.row-scroll-wrapper:hover .btn-scroll {
  opacity: 0.6;
}

.btn-scroll:hover {
  opacity: 1 !important;
  color: #409E99;
  transform: translateY(-50%) scale(1.1);
}

.btn-scroll.prev { left: -60px; } 
.btn-scroll.next { right: -60px; }

@media (max-width: 1450px) {
  .btn-scroll.prev { left: -40px; }
  .btn-scroll.next { right: -40px; }
}

@media (max-width: 768px) {
  .btn-scroll { display: none; }
}

.fade-in { animation: fadeIn 0.8s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.glitch-text { font-size: 1.5rem; font-weight: 900; letter-spacing: 5px; color: #fff; position: relative; }

.no-poster-minimal { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 3rem; background: #eee; }
</style>