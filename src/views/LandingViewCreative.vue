<template>
  <div class="landing-archive-container">
    <!-- Login-style Animated Background -->
    <div class="background-elements">
      <div class="shape circle-1"></div>
      <div class="shape circle-2"></div>
      <div class="shape circle-3"></div>
    </div>
    
    <div class="grain-overlay"></div>

    <!-- Top Section: Typography -->
    <header class="landing-header">
      <div class="text-reveal-wrapper">
        <h1 class="landing-main-title">
          <span class="line block-reveal">
            <span class="highlight-word">DISCOVER</span>
          </span>
          <span class="line accent block-reveal">
            YOUR LIFE <span class="highlight-word">MOVIE</span>
          </span>
        </h1>
        <p class="landing-sub-text">
          당신의 취향이 머무는 곳, <span class="brand-highlight">영차</span>
        </p>
      </div>
    </header>

    <!-- Middle Section: Scrolling Movie Marquee -->
    <section class="marquee-section">
      <div class="marquee-wrapper">
        <div class="marquee-content" :style="{ '--speed': `${marqueeSpeed}s` }">
          <div 
            v-for="(movie, index) in displayMovies" 
            :key="`${movie.id}-${index}`"
            class="marquee-card"
          >
            <img :src="getImageUrl(movie.poster_url)" :alt="movie.title_ko" class="marquee-img">
            <div class="marquee-card-overlay">
              <span class="marquee-movie-title">{{ movie.title_ko }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom Section: Action -->
    <footer class="landing-footer">
      <div class="btn-wrap">
        <button class="enter-btn-minimal" @click="goHome">
          <span class="btn-label">입장하기</span>
          <svg class="arrow-icon" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMovieStore } from '@/stores/movies'
// import axios from 'axios'
import api from '@/apis/axios'

const router = useRouter()
const movieStore = useMovieStore()
const API_URL = movieStore.API_URL
const heroMovies = ref([])
const marqueeSpeed = ref(40) 

const fetchLandingMovies = async () => {
  try {
    // const res = await axios.get(`${API_URL}/api/movies/recommendations/hero/`)
    const res = await api.get(`/api/movies/recommendations/hero/`)
    heroMovies.value = res.data || []
  } catch (err) {
    console.error('Failed to fetch marquee movies:', err)
  }
}

const displayMovies = computed(() => {
  if (heroMovies.value.length === 0) return []
  return [...heroMovies.value, ...heroMovies.value, ...heroMovies.value, ...heroMovies.value]
})

const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path.replace('/original/', '/w500/')
  return `https://image.tmdb.org/t/p/w500${path}`
}

const goHome = () => {
  router.push({ name: 'home' })
}

onMounted(() => {
  fetchLandingMovies()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;700;900&display=swap');

.landing-archive-container {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #0f1014; /* 로그인 페이지와 유사한 딥한 배경색 */
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* Background Elements (From LoginView) */
.background-elements {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  animation: float 10s infinite ease-in-out alternate;
}

.circle-1 {
  width: 500px; height: 500px;
  background: #409E99;
  top: -150px; left: -150px;
}

.circle-2 {
  width: 400px; height: 400px;
  background: #2b5876;
  bottom: -100px; right: -100px;
  animation-delay: -2s;
}

.circle-3 {
  width: 300px; height: 300px;
  background: #20c997;
  top: 40%; left: 60%;
  opacity: 0.2;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(40px, 60px) scale(1.05); }
}

.grain-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 5;
}

/* Header */
.landing-header {
  padding: 150px 50px 0; /* 120px에서 150px로 쪼금만 더 내림 */
  z-index: 10;
  position: relative;
  /* 전체 문구 세트를 가운대로 배치 */
  width: fit-content;
  margin: 0 auto;
}

.landing-main-title {
  font-family: 'Anton', sans-serif;
  font-size: 6rem;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 3px; /* 1px에서 3px로 넓혀 가로 확장감 부여 */
  margin: 0;
  transform: none; 
  transform-origin: center;
}

.landing-main-title .line {
  display: block;
  color: #fff;
  text-shadow: 0 0 20px rgba(255,255,255,0.1), 0 10px 40px rgba(0,0,0,0.8);
}

.highlight-word {
  color: #409E99;
  -webkit-text-fill-color: #409E99;
  /* 이미 두꺼운 폰트이므로 스트로크를 줄여 선명도 확보 */
  -webkit-text-stroke: 1px #409E99;
  filter: drop-shadow(0 0 15px rgba(64, 158, 153, 0.4)) drop-shadow(0 5px 10px rgba(0,0,0,0.5));
  font-size: 1.02em;
}

.landing-main-title .accent {
  padding-left: 80px;
}

.landing-sub-text {
  font-size: 1.3rem;
  margin-top: 25px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  letter-spacing: 1px;
  text-align: right; /* 우측 정렬 추가 */
  max-width: 100%; /* 부모 너비만큼 확보 */
}

.brand-highlight {
  font-weight: 700;
  color: #409E99;
  text-shadow: 0 0 15px rgba(64, 158, 153, 0.4);
}

/* Marquee */
.marquee-section {
  flex-grow: 1;
  display: flex;
  align-items: flex-start;
  padding-top: 60px;
  position: relative;
  overflow: hidden;
  z-index: 2;
}

.marquee-wrapper {
  width: 100%;
  display: flex;
}

.marquee-content {
  display: flex;
  gap: 30px;
  animation: scroll var(--speed) linear infinite;
}

@keyframes scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-card {
  flex: 0 0 260px;
  height: 390px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  background: #1a1a1a;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.marquee-card:hover {
  transform: scale(1.08) translateY(-10px);
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.marquee-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%) brightness(0.7);
  transition: 0.5s ease;
}

.marquee-card:hover .marquee-img {
  filter: grayscale(0%) brightness(1);
}

.marquee-card-overlay {
  position: absolute;
  bottom: 0; left: 0; width: 100%;
  padding: 40px 15px 15px;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
  opacity: 0;
  transition: 0.3s;
}

.marquee-card:hover .marquee-card-overlay {
  opacity: 1;
}

.marquee-movie-title {
  font-size: 0.85rem;
  font-weight: 600;
}

/* Footer */
.landing-footer {
  padding: 0 50px 80px;
  display: flex;
  justify-content: center;
  z-index: 10;
}

.enter-btn-minimal {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  padding: 18px 45px;
  border-radius: 15px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.btn-label {
  font-family: 'Inter', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: 1px;
  white-space: nowrap;
}

.arrow-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.enter-btn-minimal:hover {
  background: rgba(64, 158, 153, 0.2);
  border-color: rgba(64, 158, 153, 0.5);
  transform: translateY(-5px);
  box-shadow: 0 15px 45px rgba(64, 158, 153, 0.2);
}

.enter-btn-minimal:hover .btn-label,
.enter-btn-minimal:hover .arrow-icon {
  color: #409E99;
}

.enter-btn-minimal:hover .arrow-icon {
  transform: translateX(8px);
}

/* Animations */
.block-reveal {
  opacity: 0;
  animation: reveal 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}
.block-reveal:nth-child(2) { animation-delay: 0.2s; }

@keyframes reveal {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .landing-main-title { font-size: 2.8rem; }
  .landing-main-title .accent { padding-left: 0; }
  .marquee-card { flex: 0 0 180px; height: 270px; }
}
</style>
