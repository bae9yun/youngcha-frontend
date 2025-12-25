<template>
  <div class="cinematic-wrapper">
    <!-- Background Noise Texture -->
    <div class="noise-overlay"></div>

    <div class="container-fluid" v-if="store.person">
      <div class="editorial-layout">
        
        <!-- 1. Sticky Sidebar (Left) -->
        <aside class="profile-sidebar">
          <div class="profile-image-container">
            <img
              v-if="profileImageUrl"
              :src="profileImageUrl"
              class="profile-img"
              alt="profile"
            />
            <div v-else class="profile-placeholder">
              <span>{{ initials }}</span>
            </div>
          </div>

          <div class="person-bio">
            <div class="bio-item">
              <span class="label">NAME</span>
              <span class="value name-val">{{ store.person.name }}</span>
            </div>
            <div class="bio-item" v-if="store.person.birthday">
              <span class="label">BORN</span>
              <span class="value">{{ store.person.birthday }}</span>
            </div>
            <div class="bio-item" v-if="store.person.place_of_birth">
              <span class="label">FROM</span>
              <span class="value">{{ store.person.place_of_birth }}</span>
            </div>
          </div>
        </aside>

        <!-- 2. Scrolling Content (Right) -->
        <main class="filmography-feed">
          
          <!-- Directing Section -->
          <section v-if="store.directing && store.directing.length" class="feed-section">
            <h2 class="feed-title">DIRECTED BY</h2>
            <div class="film-list">
              <div 
                v-for="movie in store.directing" 
                :key="'d-' + movie.id" 
                class="film-item"
                @click="goMovie(movie.id)"
              >
                <div class="film-year">{{ movie.year || '----' }}</div>
                <div class="film-info">
                  <h3 class="film-title">{{ movie.title_ko }}</h3>
                  <span class="film-role">Director</span>
                </div>
                <div class="film-poster">
                  <img v-if="movie.poster_url" :src="movie.poster_url" alt="poster">
                  <div v-else class="no-poster"></div>
                </div>
              </div>
            </div>
          </section>

          <!-- Acting Section -->
          <section v-if="store.acting && store.acting.length" class="feed-section">
            <h2 class="feed-title">STARRING IN</h2>
            <div class="film-list">
              <div 
                v-for="movie in store.acting" 
                :key="'a-' + movie.id + '-' + movie.role" 
                class="film-item"
                @click="goMovie(movie.id)"
              >
                <div class="film-year">{{ movie.year || '----' }}</div>
                <div class="film-info">
                  <h3 class="film-title">{{ movie.title_ko }}</h3>
                  <span class="film-role">{{ movie.role ? movie.role : 'Cast' }}</span>
                </div>
                <div class="film-poster">
                  <img v-if="movie.poster_url" :src="movie.poster_url" alt="poster">
                  <div v-else class="no-poster"></div>
                </div>
              </div>
            </div>
          </section>

          <!-- Empty State -->
          <div v-if="(!store.directing || !store.directing.length) && (!store.acting || !store.acting.length)" class="empty-zone">
            <p>NO FILMOGRAPHY DATA</p>
          </div>

        </main>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading-screen">
      <div class="glitch-text" data-text="LOADING">LOADING</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePeopleStore } from '@/stores/people'

const route = useRoute()
const router = useRouter()
const store = usePeopleStore()

const profileImageUrl = computed(() => {
  const path = store.person?.profile_path
  if (!path) return null
  if (path.startsWith('http')) return path
  if (path.startsWith('/media/')) return `http://127.0.0.1:8000${path}`
  return `https://image.tmdb.org/t/p/w500${path}`
})

const initials = computed(() => {
  const base = store.person?.name || '?'
  return base.slice(0, 1)
})

const goMovie = (id) => {
  router.push({ name: 'movie-detail', params: { id } })
}

const loadData = () => {
  const id = route.params.id
  if (id) store.getPersonDetail(id)
}

onMounted(loadData)
watch(() => route.params.id, loadData)
</script>

<style scoped>
/* 1. Light Editorial Theme */
.cinematic-wrapper {
  background-color: #FFFFFFD9; /* Matched with Movie Detail */
  color: #1a1a1a;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  padding-bottom: 100px;
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
}

/* 2. Sidebar Refinement */
.profile-sidebar {
  width: 380px;
  flex-shrink: 0;
  position: sticky;
  top: 120px;
  height: fit-content;
}

.profile-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4; 
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 30px 30px 0px rgba(64, 158, 153, 0.1); 
  margin-bottom: 40px;
  background: #f0f0f0;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.profile-sidebar:hover .profile-img {
  transform: scale(1.05);
}

.person-bio {
  border-top: 2px solid #1a1a1a;
  padding-top: 30px;
}

.bio-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
}

.bio-item .label {
  font-size: 0.88rem;
  font-weight: 900;
  color: #409E99;
  letter-spacing: 2px;
  margin-bottom: 5px;
}

.bio-item .value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.bio-item .name-val {
  font-size: 2.2rem;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -1px;
}

/* 3. Filmography Feed Refinement */
.filmography-feed {
  flex-grow: 1;
}

.feed-section {
  margin-bottom: 120px;
}

.feed-title {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 3px;
  color: #409E99;
  margin-bottom: 40px;
  text-transform: uppercase;
  display: block;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.film-item {
  display: flex;
  align-items: center; /* Vertical Center */
  padding: 0; /* Vertical padding removed */
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.4s ease;
}

/* Year: Left Fixed */
.film-year {
  font-size: 3.6rem; /* Reduced from 4rem */
  font-weight: 900;
  color: #f0f0f0; /* Large background-like year */
  width: 180px;
  flex-shrink: 0;
  line-height: 1;
  letter-spacing: -2px;
  transition: all 0.4s ease;
}

/* Text Info: Exactly Centered */
.film-info {
  flex-grow: 1;
  text-align: center; /* Horizontal Center */
  padding: 0 20px;
}

.film-title {
  font-size: 1.8rem; /* Reduced from 2rem */
  font-weight: 800;
  margin: 0;
  line-height: 1.1;
  color: #1a1a1a;
  transition: transform 0.4s ease;
}

.film-role {
  font-size: 0.81rem; /* Reduced from 0.9rem */
  font-weight: 500;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 10px;
  display: block;
}

/* Poster: Right Fixed */
.film-poster {
  width: 100px;
  height: 140px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  background: #f5f5f5;
}

.film-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Hover State */
.film-item:hover {
  border-bottom-color: #1a1a1a;
}

.film-item:hover .film-year {
  color: #1a1a1a;
  transform: translateX(-10px);
}

.film-item:hover .film-title {
  transform: scale(1.05);
  color: #409E99;
}

.film-item:hover .film-poster {
  transform: scale(1.1) rotate(2deg);
  box-shadow: 0 20px 40px rgba(64, 158, 153, 0.2);
}

/* Mobile */
@media (max-width: 1024px) {
  .editorial-layout {
    flex-direction: column;
    gap: 40px;
  }
  .profile-sidebar {
    width: 100%;
    position: relative;
    top: 0;
  }
  .film-year {
    font-size: 2.5rem;
    width: 100px;
  }
  .film-title {
    font-size: 1.4rem;
  }
  .film-poster {
    width: 70px;
    height: 100px;
  }
}
</style>
