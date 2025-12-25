<template>
  <div v-if="movieStore.movie">
    <!-- 백드롭 + 좌측 하단 정보 오버레이 -->
    <div class="backdrop-hero" :style="backdropStyle">
      <div class="backdrop-gradient"></div>

      <div class="hero-text">
        <h1 class="hero-title">{{ movieStore.movie.title_ko }}</h1>
        <p class="hero-line">{{ movieStore.movie.title_en }}</p>
        <p class="hero-line sub-info">
          {{ movieStore.movie.year }} · 
          <span v-if="formattedOpenDate">{{ formattedOpenDate }} · </span>
          {{ movieStore.movie.genres }} · 
          {{ movieStore.movie.nation }}
        </p>
        <p class="hero-line sub-info">
          {{ runtimeText }} · {{ watchGradeLabel }}
        </p>
      </div>
    </div>

    <!-- 정보 영역 -->
    <div class="editorial-container">
      <div class="content-layout">
        
        <!-- 1. Left Sticky: Poster & Nav -->
        <aside class="poster-sidebar">
          <div class="poster-frame">
            <img v-if="movieStore.movie.poster_url" :src="getPosterUrl(movieStore.movie.poster_url)" alt="poster" class="main-poster" />
          </div>
          
          <nav class="sidebar-nav">
            <a href="#info-feed" 
               :class="{ active: activeSection === 'info-feed' }" 
               @click.prevent="scrollToSection('info-feed')">OVERVIEW</a>
            <a href="#review-section" 
               :class="{ active: activeSection === 'review-section' }" 
               @click.prevent="scrollToSection('review-section')">REVIEWS</a>
            <a href="#community-section" 
               :class="{ active: activeSection === 'community-section' }" 
               @click.prevent="scrollToSection('community-section')">COMMUNITY</a>
            <a v-if="movieStore.movie.trailer_key" 
               href="#trailer-section" 
               :class="{ active: activeSection === 'trailer-section' }" 
               @click.prevent="scrollToSection('trailer-section')">TRAILER</a>
          </nav>
        </aside>
        
        <!-- 2. Right Scroll: Info Feed -->
        <main class="info-feed" id="info-feed">
          
          <!-- A. Big Stats Row -->
          <div class="stats-row">
            <!-- Rating -->
            <div class="stat-item border-right">
              <span class="stat-label">평점</span>
              <div class="stat-value">
                <span class="icon">⭐</span>
                <span class="number">{{ movieStore.movie.avg_score ?? '-' }}</span>
                <span class="max">/ 5</span>
              </div>
              <span class="stat-sub">{{ movieStore.movie.ratings_count || 0 }}명의 평가</span>
            </div>
            
            <!-- Audience -->
            <div class="stat-item">
              <span class="stat-label">관객수</span>
              <div class="stat-value">
                <span class="icon">👥</span>
                <span class="number">{{ formattedAudience }}</span>
              </div>
              <span class="stat-sub">누적 관객수</span>
            </div>
          </div>

          <!-- B. Action Row (My Rating + Collection) -->
          <div class="action-row">
            <div class="my-rating-area" v-if="userStore.isLogin">
              <span class="action-label">내 평점</span>
               <span class="score-text" v-if="movieStore.myScore">{{ movieStore.myScore }}</span>
              <div class="star-interactive" @mouseleave="hoverRating = 0">
                <span v-for="i in 5" :key="i" class="star-unit">
                  <span class="click-half left" @mouseover="hoverRating = i - 0.5" @click="handleRating(i - 0.5)"></span>
                  <span class="click-half right" @mouseover="hoverRating = i" @click="handleRating(i)"></span>
                  <span class="star-shape" :class="getStarClass(i)">★</span>
                </span>
              </div>
             
            </div>
            <div v-else class="my-rating-area placeholder">
              <span class="action-label">내 평점</span>
              <p class="login-hint" @click="goLogin">로그인 후 평가해주세요</p>
            </div>

            <div class="collection-area" @click="handleLike">
              <!-- <span class="action-label">컬렉션</span> -->
              <div :class="['wish-editorial-btn', { active: movieStore.movie.is_liked }]">
                <div class="wish-icon-ring">
                  <i class="bi" :class="movieStore.movie.is_liked ? 'bi-heart-fill' : 'bi-heart'"></i>
                </div>
                <span class="wish-count-text">{{ movieStore.movie.like_count }}</span>
                <span class="wish-label">{{ movieStore.movie.is_liked ? '보관됨' : '컬렉션 추가' }}</span>
              </div>
            </div>
          </div>

          <!-- ★ New: Similar Movies Recommendation (Triggered by 4.0+ rating) -->
          <div v-if="movieStore.similarMoviesForDetail && movieStore.similarMoviesForDetail.length > 0" class="section-block similar-recommend-block">
            <div class="recommend-alert">
              <i class="bi bi-stars"></i>
              <span>이 영화를 좋아하신다니, 이런 작품들은 어떠신가요?</span>
            </div>
            <div class="similar-grid">
              <div v-for="simMovie in movieStore.similarMoviesForDetail" :key="simMovie.id" class="sim-card" @click="goSimilarMovie(simMovie.id)">
                <div class="sim-poster">
                  <img :src="getPosterUrl(simMovie.poster_url)" alt="poster">
                  <div class="sim-score">⭐ {{ simMovie.vote_average ? simMovie.vote_average.toFixed(1) : '-' }}</div>
                </div>
                <div class="sim-info">
                  <span class="sim-title">{{ simMovie.title_ko }}</span>
                  <span class="sim-meta">{{ simMovie.year }} · {{ simMovie.genres?.split(',')[0] }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- C. Synopsis (Redesigned Editorial Style) -->
          <div class="section-block" v-if="movieStore.movie.overview">
            <div class="editorial-synopsis-container">
              <div class="synopsis-header">
                <span class="synopsis-label">줄거리</span>
                <div class="synopsis-line"></div>
              </div>
              <div class="synopsis-content">
                <p class="synopsis-text">
                  {{ movieStore.movie.overview }}
                </p>
              </div>
            </div>
          </div>

          <!-- D. Director & Cast (2-Column List Style) -->
          <div class="section-block">
            <h3 class="block-title">감독 및 출연진</h3>
            
            <div class="cast-list-container">
              <!-- Directors (Iterate List) -->
              <template v-if="movieStore.movie.director_persons && movieStore.movie.director_persons.length > 0">
                <div v-for="director in movieStore.movie.director_persons" :key="'dir-'+director.id" class="cast-row" @click="goPerson(director.id)">
                  <div class="person-thumb">
                    <img :src="getProfileUrl(director.profile_path)" alt="profile" @error="onPersonImageError">
                  </div>
                  <div class="person-info">
                    <div class="name">{{ director.name }}</div>
                    <div class="role director">감독</div>
                  </div>
                  <i class="bi bi-chevron-right arrow"></i>
                </div>
              </template>
              <div v-else-if="movieStore.movie.directors" class="cast-row fallback">
                 <div class="person-thumb">
                    <img :src="getProfileUrl()" alt="profile">
                 </div>
                 <div class="person-info">
                   <div class="name">{{ movieStore.movie.directors }}</div>
                   <div class="role director">감독</div>
                 </div>
              </div>

              <!-- Actors -->
              <div v-for="casting in displayedCastings" :key="casting.id" class="cast-row" @click="goPerson(casting.person.id)">
                <div class="person-thumb">
                  <img :src="getProfileUrl(casting.person.profile_path)" alt="profile" @error="onPersonImageError">
                </div>
                <div class="person-info">
                  <div class="name">{{ casting.person.name }}</div>
                  <div class="role">{{ casting.character || '출연' }}</div>
                </div>
                <i class="bi bi-chevron-right arrow"></i>
              </div>
            </div>
            
            <div v-if="movieStore.movie.castings && movieStore.movie.castings.length > 10" class="more-btn-area">
              <button @click="showAllCastings = !showAllCastings" class="btn-more">
                {{ showAllCastings ? '접기' : '더보기' }}
              </button>
            </div>
          </div>

          <!-- E. Reviews (Clean List) -->
          <div class="section-block" id="review-section">
            <div class="header-row">
              <h3 class="block-title">REVIEWS <span class="count">{{ movieStore.movie.reviews?.length || 0 }}</span></h3>
              <div class="sort-tabs">
                <span @click="reviewSortOption = 'latest'" :class="{ active: reviewSortOption === 'latest' }">LATEST</span>
                <span class="divider">/</span>
                <span @click="reviewSortOption = 'likes'" :class="{ active: reviewSortOption === 'likes' }">LIKED</span>
              </div>
            </div>

            <!-- Review Input -->
            <div v-if="userStore.isLogin" class="review-input-container">
              <div class="review-input-box">
                <div class="input-avatar">
                  <img v-if="userStore.profile?.profile_image" :src="getProfileUrl(userStore.profile.profile_image)">
                  <span v-else>{{ userStore.nickname?.[0] }}</span>
                </div>
                <form @submit.prevent="handleReviewSubmit" class="input-form">
                  <input 
                    type="text" 
                    v-model="newReviewContent" 
                    placeholder="어떤 점이 가장 인상 깊었나요?"
                  >
                  <button type="submit">
                    <span>{{ hasMyReview ? '수정' : '등록' }}</span>
                    <i class="bi" :class="hasMyReview ? 'bi-check-lg' : 'bi-arrow-right'"></i>
                  </button>
                </form>
              </div>
              <p v-if="showRatingWarning" class="warning-msg">평점을 먼저 등록해주세요.</p>
            </div>
            <div v-else class="login-msg">
              리뷰를 남기려면 <a @click="goLogin">로그인</a>이 필요합니다.
            </div>

            <!-- Reviews List -->
            <div class="review-stream">
              <div 
                v-for="review in paginatedReviews" 
                :key="review.id" 
                class="review-item"
                :data-score="review.score ? review.score.toFixed(1) : '-'"
              >
                <div class="review-meta">
                  <div class="reviewer-info" @click="goUserProfile(review.user.id)">
                    <img v-if="review.user.profile_image" :src="getProfileUrl(review.user.profile_image)">
                    <div v-else class="reviewer-placeholder">
                      {{ review.user.nickname?.[0] }}
                    </div>
                    <span class="name">{{ review.user.nickname }}</span>
                  </div>
                  <div class="review-score-tag">
                    <span class="star-icon">★</span>
                    <span class="score-num">{{ review.score ? review.score.toFixed(1) : '-' }}</span>
                  </div>
                </div>

                <div class="review-content-wrapper">
                  <div class="review-body">
                    <div v-if="review.is_spoiler && !reviewVisibility[review.id]" class="editorial-spoiler">
                      <div class="spoiler-blur-bg">
                        <p>스포일러가 포함되어 있어요</p>
                        <button class="btn-reveal" @click="reviewVisibility[review.id] = true">보기</button>
                      </div>
                    </div>
                    <p v-else>{{ review.content }}</p>
                  </div>
                  
                  <div class="review-actions">
                    <span class="date">{{ formatDate(review.created_at) }}</span>
                    <button class="like-btn" :class="{ active: review.is_liked }" @click="handleReviewLike(review.id)">
                      <i class="bi" :class="review.is_liked ? 'bi-heart-fill' : 'bi-heart'"></i>
                      {{ review.like_count }}
                    </button>
                    <button v-if="userStore.isLogin && review.user.id === userStore.profile?.id" @click="handleReviewDelete(review.id)" class="del-btn">삭제</button>
                  </div>
                </div>
              </div>
            </div>
             <PaginationNav 
              v-if="totalReviewPages > 1" 
              :current="currentReviewPage" 
              :total="totalReviewPages" 
              @change="handleReviewPageChange" 
            />
          </div>

          <!-- F. Community Link (Redesigned) -->
          <div class="section-block" id="community-section">
            <div class="header-row">
              <h3 class="block-title">COMMUNITY <span class="count">{{ movieStore.movie.articles?.length || 0 }}</span></h3>
              <button class="btn-create-article" @click="goCreateArticle">
                <i class="bi bi-pencil-square"></i>
                <span>글 쓰기</span>
              </button>
            </div>

            <div class="community-list-editorial" v-if="movieStore.movie.articles && movieStore.movie.articles.length">
               <div v-for="article in paginatedArticles" :key="article.id" class="comm-item-editorial" @click="goArticle(article.id)">
                 <div class="comm-main">
                    <span class="comm-title">{{ article.title }}</span>
                    <span class="comm-meta">{{ article.user_nickname }}</span>
                 </div>
                 <div v-if="article.image" class="comm-thumbnail">
                   <img :src="getArticleImageUrl(article.image)" alt="article-image">
                 </div>
                 <div class="comm-stats">
                   <span class="likes">❤️ {{ article.likes_count }}</span>
                 </div>
               </div>

               <PaginationNav 
                v-if="totalArticlePages > 1" 
                :current="currentArticlePage" 
                :total="totalArticlePages" 
                @change="handleArticlePageChange" 
              />
            </div>
            <div v-else class="empty-community">
              <p>이 영화에 대한 게시글이 아직 없습니다.</p>
              <button class="btn-primary-small" @click="goCreateArticle">첫 게시글을 남겨보세요!</button>
            </div>
          </div>

          <!-- G. Trailer -->
          <div class="section-block" id="trailer-section" v-if="movieStore.movie.trailer_key">
            <h3 class="block-title">TRAILER</h3>
            <div class="video-frame">
              <iframe :src="`https://www.youtube.com/embed/${movieStore.movie.trailer_key}`" frameborder="0" allowfullscreen></iframe>
            </div>
          </div>

        </main>
      </div>
    </div>
  </div>
  <div v-else class="loading-screen">
    <div class="spinner"></div>
    <p>영화 정보를 불러오는 중...</p>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMovieStore } from '@/stores/movies'
import { useUserStore } from '@/stores/user'
import PaginationNav from '@/components/PaginationNav.vue'
import noImage from '@/assets/no_actor_image.png'

const route = useRoute()
const router = useRouter()
const movieStore = useMovieStore()
const userStore = useUserStore()

const newReviewContent = ref('')
const hoverRating = ref(0)
const reviewVisibility = reactive({})
const showAllCastings = ref(false)
const currentReviewPage = ref(1)
const currentArticlePage = ref(1)
const reviewSortOption = ref('latest')
const activeSection = ref('info-feed')

let observer = null

const initScrollSpy = () => {
  const options = {
    root: null,
    rootMargin: '-150px 0px -70% 0px', // 네비바와 하단 여백을 고려한 감지 영역
    threshold: 0
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id
      }
    })
  }, options)

  const targets = ['info-feed', 'review-section', 'community-section', 'trailer-section']
  targets.forEach(id => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })
}

// Watchers
watch(() => movieStore.movie?.reviews, (reviews) => {
  if (reviews) {
    reviews.forEach(review => {
      if (review.is_spoiler && reviewVisibility[review.id] === undefined) {
        reviewVisibility[review.id] = false
      }
    })
  }
}, { deep: true, immediate: true })

// Computed
const displayedCastings = computed(() => {
  const castings = movieStore.movie?.castings || []
  if (showAllCastings.value || castings.length <= 10) {
    return castings
  }
  return castings.slice(0, 10)
})

// Helpers
const getPosterUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path.replace('/w500/', '/original/').replace('/w1280/', '/original/').replace('/w185/', '/original/').replace('/w200/', '/original/').replace('/w300/', '/original/')
  return `https://image.tmdb.org/t/p/original${path}`
}
const getProfileUrl = (path) => {
  if (!path) return noImage
  if (path.startsWith('http')) return path
  if (path.startsWith('/media/')) return `${movieStore.API_URL}${path}`
  return `https://image.tmdb.org/t/p/w185${path}`
}
const backdropStyle = computed(() => {
  let path = movieStore.movie?.backdrop_path
  if (!path) return { backgroundColor: '#141414' }
  const url = path.startsWith('http') ? path.replace('/w500/', '/original/') : `https://image.tmdb.org/t/p/original${path}`
  return { backgroundImage: `url(${url})` }
})
const runtimeText = computed(() => {
  const m = movieStore.movie?.runtime
  return m ? `${Math.floor(m / 60)}h ${m % 60}m` : ''
})
const watchGradeLabel = computed(() => {
  const g = movieStore.movie?.watch_grade_nm || ''
  if (g.includes('12')) return '12+'
  if (g.includes('15')) return '15+'
  if (g.includes('18')) return '18+'
  return g
})
const formattedOpenDate = computed(() => {
  const d = movieStore.movie?.open_date
  if (!d) return ''
  const dateObj = new Date(d)
  return `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`
})
const hasMyReview = computed(() => {
  const myId = userStore.profile?.id
  if (!myId || !movieStore.movie?.reviews) return false
  return movieStore.movie.reviews.some(r => r.user.id === myId)
})
const sortedReviews = computed(() => {
  if (!movieStore.movie || !movieStore.movie.reviews) return []
  const allReviews = [...movieStore.movie.reviews]
  const myId = userStore.profile?.id
  const myReview = myId ? allReviews.find(r => r.user.id === myId) : null
  const otherReviews = myId ? allReviews.filter(r => r.user.id !== myId) : allReviews
  
  if (reviewSortOption.value === 'likes') {
    otherReviews.sort((a, b) => b.like_count - a.like_count)
  } else {
    otherReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
  return myReview ? [myReview, ...otherReviews] : otherReviews
})
const paginatedReviews = computed(() => {
  const reviews = sortedReviews.value
  const start = (currentReviewPage.value - 1) * 5
  return reviews.slice(start, start + 5)
})
const totalReviewPages = computed(() => Math.ceil((sortedReviews.value?.length || 0) / 5))

const totalArticlePages = computed(() => {
  return Math.ceil((movieStore.movie?.articles?.length || 0) / 5)
})

const paginatedArticles = computed(() => {
  const articles = movieStore.movie?.articles || []
  const start = (currentArticlePage.value - 1) * 5
  return articles.slice(start, start + 5)
})

const formattedAudience = computed(() => {
  const val = movieStore.movie?.audi_acc
  if (val === undefined || val === null || val === 0) return '0'
  if (val >= 10000) return (val / 10000).toFixed(1) + '만'
  return val.toLocaleString()
})

const getStarClass = (index) => {
  const target = hoverRating.value || movieStore.myScore || 0
  if (target >= index) return 'full'
  if (target >= index - 0.5) return 'half'
  return 'empty'
}

const showRatingWarning = ref(false)

// Handlers
const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
const handleLike = () => movieStore.likeMovie(movieStore.movie.id).catch(err => alert(err))
const handleRating = (score) => {
  score = Number(score)
  console.log('handleRating called with score:', score, typeof score)
  const newScore = (movieStore.myScore === score) ? null : score
  
  if (newScore === null) {
    console.log('Deleting rating')
    movieStore.deleteRating(movieStore.movie.id)
  } else {
    console.log('Creating/Updating rating:', newScore)
    movieStore.createOrUpdateRating(movieStore.movie.id, newScore)
    showRatingWarning.value = false
  }
}
const handleReviewSubmit = () => {
  if (!movieStore.myScore) {
    showRatingWarning.value = true
    return
  }
  if (!newReviewContent.value.trim()) return alert('내용이 필요합니다')
  movieStore.rateAndReview(movieStore.movie.id, { score: movieStore.myScore, content: newReviewContent.value }).then(() => newReviewContent.value = '')
}
const handleReviewDelete = (reviewId) => {
  if(confirm('리뷰를 삭제하시겠습니까?')) movieStore.deleteReview(movieStore.movie.id, reviewId)
}
const handleReviewLike = (reviewId) => {
  if(!userStore.isLogin) return goLogin()
  movieStore.reviewLike(movieStore.movie.id, reviewId)
}
const handleReviewPageChange = (p) => {
  currentReviewPage.value = p
  const el = document.getElementById('review-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
const handleArticlePageChange = (p) => {
  currentArticlePage.value = p
  const el = document.getElementById('community-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
const goPerson = (id) => router.push({ name: 'person-detail', params: { id } })
const goUserProfile = (userId) => router.push({ name: 'user-profile', params: { id: userId } })
const goLogin = () => router.push({ name: 'login', query: { redirect: route.fullPath } })
const goArticle = (articleId) => router.push({ name: 'community-detail', params: { id: articleId } })
const goCreateArticle = () => router.push({ name: 'community-create', query: { movie_id: movieStore.movie.id } })
const goSimilarMovie = (id) => {
  movieStore.similarMoviesForDetail = [] // Clear recommendations before moving
  router.push({ name: 'movie-detail', params: { id } })
}
const getArticleImageUrl = (path) => {
  if (!path) return ''
  return path.startsWith('http') ? path : `${movieStore.API_URL}${path}`
}
const formatDate = (d) => new Date(d).toLocaleDateString()
const onPersonImageError = (e) => e.target.src = noImage

onMounted(async () => {
  movieStore.similarMoviesForDetail = [] // 초기화
  await movieStore.getMovieDetail(route.params.id)
  setTimeout(initScrollSpy, 500) // 데이터 렌더링 후 관찰 시작
})
watch(() => movieStore.movie, (newMovie) => {
  newReviewContent.value = ''
  currentReviewPage.value = 1
  if (newMovie && hasMyReview.value) {
    const myReview = newMovie.reviews.find(r => r.user.id === userStore.profile?.id)
    if (myReview) newReviewContent.value = myReview.content
  }
  // 데이터가 바뀌면 다시 관찰 대상을 찾음
  setTimeout(initScrollSpy, 500)
}, { immediate: true })
watch(() => route.params.id, (id) => {
  if (id) {
    movieStore.similarMoviesForDetail = []
    movieStore.getMovieDetail(id)
  }
})
</script>

<style scoped>
/* Similar Movies Section */
.similar-recommend-block {
  background: #f0f7f7;
  padding: 25px;
  border-radius: 4px;
  border: 1px solid #e0eeee;
  animation: fadeInDown 0.6s ease;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.recommend-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #409E99; /* .stat-label과 동일한 색상 */
  font-weight: 900; /* .stat-label과 동일한 굵기 */
  font-size: 0.9rem; /* 적절한 크기 조정 */
  letter-spacing: 1px; /* .stat-label 스타일 반영 */
  text-transform: uppercase; /* 대문자 스타일 반영 (선택사항) */
  font-family: 'Inter', sans-serif;
}
.recommend-alert i { font-size: 1.2rem; }

.similar-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)); /* 3개의 컬럼 너비를 완전히 동일하게 강제 */
  gap: 20px;
  width: 100%;
}

.sim-card {
  width: 100%; /* 카드가 컬럼 너비에 꽉 차도록 설정 */
  cursor: pointer;
  transition: 0.3s;
  overflow: hidden; /* 내부 요소가 튀어나와 크기를 키우는 것 방지 */
}

.sim-card:hover { transform: translateY(-5px); }

.sim-poster {
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3; /* 세로가 긴 포스터 비율 고정 */
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  background: #eee; /* 로딩 전 배경색 */
}

.sim-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 비율 유지하며 꽉 채움 */
  display: block;
}

.sim-score {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  color: #fbc02d;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 800;
}

.sim-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sim-title {
  font-weight: 800;
  font-size: 0.95rem;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sim-meta {
  font-size: 0.8rem;
  color: #888;
}

/* 1. Layout Base */
.editorial-container { background-color: #FFFFFFD9; min-height: 100vh; font-family: 'Inter', sans-serif; padding-bottom: 100px; }
.content-layout { display: flex; gap: 60px; max-width: 1400px; margin: 0 auto; padding: 40px 20px; } /* 너비 1400px로 확장 */

/* Backdrop & Hero */
.backdrop-hero { position: relative; height: 650px; background-size: cover; background-position: center top; color: #fff; z-index: 0; }
.backdrop-gradient { 
  position: absolute; 
  left: 0; 
  right: 0; 
  bottom: 0; 
  height: 70%; 
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, transparent 100%); 
}
.hero-text { 
  position: absolute; 
  left: 50%; 
  transform: translateX(-50%); 
  bottom: 0; 
  width: 100%;
  max-width: 1300px; 
  padding: 0 20px 20px 20px; 
  z-index: 2; 
  text-shadow: 0 4px 15px rgba(0,0,0,0.5); 
  text-align: left; 
}
.hero-title { 
  font-size: 2.0rem; 
  font-weight: 900; 
  margin-bottom: 0.4rem; 
  color: #ffffff; 
  letter-spacing: -1px; 
  line-height: 1.2;
}
.hero-line { font-size: 1.3rem; color: rgba(255,255,255,0.9); margin: 2px 0; font-weight: 600; }
.hero-line.sub-info { color: rgba(255,255,255,0.7); font-size: 1.1rem; font-weight: 400; }

/* Sidebar */
.poster-sidebar { width: 320px; flex-shrink: 0; position: sticky; top: 100px; height: fit-content; }
.poster-frame { width: 100%; aspect-ratio: 2/3; border-radius: 4px; overflow: hidden; box-shadow: 20px 20px 0px rgba(64, 158, 153, 0.1); background: #eee; margin-bottom: 30px; }
.main-poster { width: 100%; height: 100%; object-fit: cover; }
.sidebar-nav { display: flex; flex-direction: column; gap: 15px; border-top: 2px solid #1a1a1a; padding-top: 20px; }
.sidebar-nav a { text-decoration: none; color: #888; font-weight: 800; font-size: 0.9rem; letter-spacing: 1px; transition: 0.2s; }
.sidebar-nav a:hover, .sidebar-nav a.active { color: #409E99; transform: translateX(5px); }

/* Right Feed */
.info-feed { flex-grow: 1; min-width: 0; }
.stats-row { 
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2등분 유지 */
  align-items: center; 
  margin-bottom: 40px; 
  padding-bottom: 30px; 
  border-bottom: 2px solid #1a1a1a; 
}
.stat-item { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  text-align: center;
}
.stat-item.border-right {
  border-right: 1px solid #eee;
}
.stat-label { font-size: 0.75rem; font-weight: 900; letter-spacing: 2px; color: #409E99; margin-bottom: 5px; }
.stat-value { display: flex; align-items: baseline; gap: 5px; justify-content: center; }
.stat-value .number { font-size: 2.8rem; font-weight: 900; color: #1a1a1a; line-height: 1; font-family: 'Impact', 'Inter', sans-serif; }
.stat-value .max { font-size: 1.1rem; color: #bbb; font-weight: 600; }
.stat-value .icon { font-size: 1.2rem; color: #ddd; margin-right: 5px; }
.stat-sub { font-size: 0.8rem; color: #888; margin-top: 5px; }

/* Action Row Redesign */
.action-row { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  margin-bottom: 60px; 
  background: #f8f9fa; 
  padding: 25px 40px; 
  border-radius: 4px; /* Editorial theme uses sharper corners */
  border-left: 4px solid #1a1a1a;
}
.my-rating-area { display: flex; flex-direction: column; gap: 8px; }
.my-rating-area.placeholder .login-hint {
  font-size: 0.9rem;
  font-weight: 700;
  color: #409E99;
  cursor: pointer;
  margin: 0;
  text-decoration: underline;
}
.collection-area { 
  display: flex; 
  flex-direction: column; 
  align-items: flex-end; 
  gap: 8px; 
  cursor: pointer;
}
.wish-editorial-btn { 
  display: flex; 
  align-items: center; 
  gap: 15px; 
  background: #1a1a1a; 
  color: white; 
  padding: 8px 20px; 
  border-radius: 50px; 
  transition: 0.3s ease; 
}
.wish-editorial-btn.active { background: #409E99; }
.wish-icon-ring { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; }
.wish-count-text { font-size: 1.1rem; font-weight: 900; }
.wish-label { font-size: 0.75rem; font-weight: 800; letter-spacing: 1px; }
.collection-area:hover .wish-editorial-btn { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
.my-rating-area { display: flex; flex-direction: column; gap: 10px; }
.action-label { font-size: 0.7rem; font-weight: 800; color: #888; }
.star-interactive { display: flex; gap: 5px; cursor: pointer; }
.star-unit { position: relative; font-size: 2rem; color: #ddd; line-height: 1; }
.click-half { position: absolute; width: 50%; height: 100%; z-index: 10; }
.click-half.left { left: 0; }
.click-half.right { right: 0; }
.star-shape.full { color: #fbc02d; }
.star-shape.half::before { content: '★'; position: absolute; left: 0; top: 0; width: 100%; height: 100%; color: #fbc02d; clip-path: inset(0 50% 0 0); }
.score-text { font-size: 1.2rem; font-weight: 800; color: #409E99; }

/* Redesigned Spoiler Alert */
.editorial-spoiler {
  position: relative;
  width: 100%;
  height: 80px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ddd;
}
.spoiler-blur-bg {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.spoiler-blur-bg p { font-weight: 900; letter-spacing: 2px; color: #777; font-size: 0.75rem; margin: 0; }
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
.btn-reveal:hover { background: #409E99; }

/* Blocks */
.section-block { 
  margin-bottom: 80px; 
  scroll-margin-top: 120px; /* 여백 추가: 네비바 높이를 고려하여 조정 */
}
.block-title { font-size: 1.1rem; font-weight: 900; letter-spacing: 3px; color: #1a1a1a; margin-bottom: 25px; text-transform: uppercase; }

/* Redesigned Synopsis (Clean Editorial Style) */
.editorial-synopsis-container {
  padding: 20px 0;
  position: relative;
}

.synopsis-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.synopsis-label {
  font-size: 0.9rem;
  font-weight: 900;
  color: #409E99;
  letter-spacing: 5px;
  text-transform: uppercase;
}

.synopsis-line {
  flex-grow: 1;
  height: 1px;
  background: #eee;
}

.synopsis-content {
  position: relative;
  padding-left: 30px;
  border-left: 3px solid #1a1a1a;
}

.synopsis-text {
  font-size: 1.1rem;
  line-height: 2;
  color: #333;
  font-weight: 400;
  text-align: left;
  word-break: keep-all;
  margin: 0;
}

.editorial-synopsis-container::after {
  content: "";
  position: absolute;
  bottom: -40px;
  left: 0;
  width: 60px;
  height: 2px;
  background: #409E99;
  opacity: 0.5;
}

/* Cast */
.cast-list-container { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.cast-row { display: flex; align-items: center; gap: 15px; padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; transition: 0.2s; background: white; }
.cast-row:hover { background: #f8f9fa; transform: translateX(5px); border-left: 3px solid #409E99; }
.person-thumb { width: 50px; height: 50px; border-radius: 50%; overflow: hidden; background: #ddd; flex-shrink: 0; }
.person-thumb img { width: 100%; height: 100%; object-fit: cover; }
.person-info .name { font-weight: 700; color: #1a1a1a; }
.person-info .role { font-size: 0.8rem; color: #888; text-transform: uppercase; }
.role.director { color: #409E99; font-weight: 800; }

.more-btn-area {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.btn-more {
  background: white;
  border: 1px solid #ddd;
  color: #555;
  padding: 10px 30px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 1px;
}

.btn-more:hover {
  background: #1a1a1a;
  color: white;
  border-color: #1a1a1a;
  transform: translateY(-2px);
}

/* Review */
.header-row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
.sort-tabs { font-size: 0.85rem; font-weight: 700; color: #aaa; }
.sort-tabs span.active { color: #1a1a1a; text-decoration: underline; text-underline-offset: 4px; }
.review-input-container {
  margin-bottom: 40px;
}
.review-input-box { display: flex; gap: 15px; background: #f8f9fa; padding: 20px; border-radius: 4px; align-items: center; }
.warning-msg {
  color: #ff5252;
  font-size: 0.9rem;
  font-weight: 700;
  margin-top: 10px;
  padding-left: 20px;
  animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
.input-form { flex-grow: 1; display: flex; gap: 15px; align-items: flex-end; }
.input-form input { 
  flex-grow: 1; 
  background: transparent; 
  border: none; 
  border-bottom: 2px solid #ddd; 
  padding: 10px 0; 
  outline: none; 
  transition: 0.2s; 
  font-size: 1.05rem; 
  color: #1a1a1a; 
  font-weight: 500;
}
.input-form input:focus { border-bottom-color: #409E99; }

.input-form button {
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 8px 20px;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 1px;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  border-radius: 2px;
}
.input-form button:hover:not(:disabled) {
  background: #409E99;
  transform: translateY(-2px);
}
.input-form button:disabled {
  background: #eee;
  color: #ccc;
  cursor: not-allowed;
}

.input-avatar { 
  width: 40px; 
  height: 40px; 
  border-radius: 50%; 
  overflow: hidden; 
  flex-shrink: 0; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-weight: 900; 
  color: white;
  background: linear-gradient(135deg, #409E99 0%, #358682 100%);
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
}
.input-avatar img { width: 100%; height: 100%; object-fit: cover; }

.reviewer-info img, .reviewer-placeholder { 
  width: 35px; 
  height: 35px; 
  border-radius: 50%; 
  object-fit: cover; 
  flex-shrink: 0; 
}
.reviewer-placeholder {
  background: linear-gradient(135deg, #409E99 0%, #358682 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.1);
}
/* Reviews List - Editorial Stream Redesign */
.review-stream {
  display: flex;
  flex-direction: column;
  gap: 0; /* 간격을 없애고 선으로 연결 */
  margin-top: 40px;
  border-top: 2px solid #1a1a1a;
}

.review-item {
  padding: 25px 0; 
  background: transparent;
  border: none;
  border-bottom: 1px solid #eee;
  border-radius: 0;
  box-shadow: none;
  position: relative;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  gap: 30px;
}

.review-meta { 
  display: flex; 
  flex-direction: column;
  align-items: flex-start;
  gap: 10px; /* 간격 축소 */
  width: 160px; /* 고정폭 축소 */
  flex-shrink: 0;
  margin-bottom: 0;
}

.reviewer-info { 
  display: flex; 
  flex-direction: column;
  align-items: flex-start;
  gap: 10px; 
  cursor: pointer; 
}

.reviewer-info .name { 
  font-weight: 800; 
  color: #1a1a1a; 
  font-size: 1rem;
  letter-spacing: -0.5px;
}

.review-score-tag {
  background: #1a1a1a;
  color: white;
  padding: 2px 10px;
  border-radius: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  border-left: none;
  box-shadow: none;
}

.review-score-tag .star-icon { color: #fbc02d; font-size: 0.7rem; }

.review-content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.review-body { 
  margin: 0; 
  font-size: 1.05rem; 
  color: #222; 
  line-height: 1.7; 
  min-height: 45px; /* 최소 높이 축소 */
  display: flex; 
  align-items: center;
  text-align: left;
}

.review-actions { 
  display: flex; 
  align-items: center; 
  gap: 15px; 
  margin-top: 10px; /* 간격 축소 */
  border-top: 1px dashed #eee;
  padding-top: 8px;
}
.review-body p { margin: 0; }
.spoiler-blind { background: #eee; color: #888; padding: 10px; text-align: center; font-size: 0.9rem; font-weight: 700; display: flex; justify-content: center; gap: 10px; align-items: center; }
.spoiler-blind button { border: 1px solid #aaa; background: white; padding: 2px 8px; border-radius: 4px; cursor: pointer; }
.review-actions { display: flex; align-items: center; gap: 20px; margin-top: 8px; }
.review-actions .date { font-size: 0.85rem; color: #aaa; font-weight: 500; }
.like-btn { 
  border: 1px solid #eee; 
  padding: 4px 15px; 
  border-radius: 20px; 
  background: white; 
  cursor: pointer; 
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}
.like-btn:hover { background: #f8f9fa; border-color: #ddd; }
.like-btn.active { color: #ff4081; border-color: #ffccd5; background: #fff0f3; }

.del-btn { 
  background: none; 
  border: none; 
  color: #bbb; 
  font-size: 0.75rem; 
  font-weight: 800; 
  letter-spacing: 1px; 
  cursor: pointer; 
  padding: 4px 8px;
  transition: 0.2s;
  text-transform: uppercase;
}
.del-btn:hover { color: #ff5252; text-decoration: underline; text-underline-offset: 3px; }

/* Reviews List - Editorial Stream Redesign */
.review-stream {
  display: flex;
  flex-direction: column;
  gap: 0; /* 간격을 없애고 선으로 연결 */
  margin-top: 40px;
  border-top: 2px solid #1a1a1a;
}

.review-item {
  padding: 25px 0; 
  background: transparent;
  border: none;
  border-bottom: 1px solid #eee;
  border-radius: 0;
  box-shadow: none;
  position: relative;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  display: flex;
  gap: 30px;
}

/* 거대한 배경 점수 효과 - Right Side */
.review-item::before {
  content: attr(data-score);
  position: absolute;
  right: 0; 
  left: auto;
  top: 50%;
  transform: translateY(-50%);
  font-size: 6.5rem;
  font-weight: 900;
  color: #f6f6f6;
  z-index: -1;
  font-family: 'Impact', sans-serif;
  opacity: 0;
  transition: all 0.4s ease;
  pointer-events: none;
}

.review-item:hover::before {
  opacity: 1;
  right: 20px; 
}
.review-score-tag .score-num { 
  font-weight: 900; 
  color: #fff; 
  font-size: 0.85rem;
}

.review-content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.review-body { 
  margin: 0; 
  font-size: 1.05rem; 
  color: #222; 
  line-height: 1.7; 
  min-height: 45px; /* 최소 높이 축소 */
  display: flex; 
  align-items: center;
  text-align: left;
}

.review-actions { 
  display: flex; 
  align-items: center; 
  gap: 15px; 
  margin-top: 10px; /* 간격 축소 */
  border-top: 1px dashed #eee;
  padding-top: 8px;
}.review-body p { margin: 0; }
.spoiler-blind { background: #eee; color: #888; padding: 10px; text-align: center; font-size: 0.9rem; font-weight: 700; display: flex; justify-content: center; gap: 10px; align-items: center; }
.spoiler-blind button { border: 1px solid #aaa; background: white; padding: 2px 8px; border-radius: 4px; cursor: pointer; }
.review-actions { display: flex; align-items: center; gap: 20px; margin-top: 8px; }
.review-actions .date { font-size: 0.85rem; color: #aaa; font-weight: 500; }
.like-btn { 
  border: 1px solid #eee; 
  padding: 4px 15px; 
  border-radius: 20px; 
  background: white; 
  cursor: pointer; 
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}
.like-btn:hover { background: #f8f9fa; border-color: #ddd; }
.like-btn.active { color: #ff4081; border-color: #ffccd5; background: #fff0f3; }

.del-btn { 
  background: none; 
  border: none; 
  color: #bbb; 
  font-size: 0.75rem; 
  font-weight: 800; 
  letter-spacing: 1px; 
  cursor: pointer; 
  padding: 4px 8px;
  transition: 0.2s;
  text-transform: uppercase;
}
.del-btn:hover { color: #ff5252; text-decoration: underline; text-underline-offset: 3px; }

/* Community Redesign */
.btn-create-article {
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 2px;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: 0.3s;
}
.btn-create-article:hover {
  background: #409E99;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 153, 0.2);
}

.community-list-editorial {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}
.comm-item-editorial {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 25px;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.3s;
  gap: 20px;
}
.comm-item-editorial:hover {
  border-color: #409E99;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.comm-main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.comm-item-editorial .comm-title {
  font-weight: 700;
  font-size: 1.05rem;
  color: #1a1a1a;
  transition: 0.2s;
}
.comm-item-editorial:hover .comm-title {
  color: #409E99;
}
.comm-item-editorial .comm-meta {
  font-size: 0.8rem;
  color: #888;
}
.comm-stats {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
  flex-shrink: 0;
  margin-left: 20px;
}

.comm-thumbnail {
  width: 80px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #eee;
}

.comm-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-community {
  text-align: center;
  padding: 60px 0;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px dashed #ddd;
}
.empty-community p {
  color: #888;
  margin-bottom: 20px;
  font-weight: 500;
}
.btn-primary-small {
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 0.8rem;
  font-weight: 800;
  cursor: pointer;
  border-radius: 2px;
  transition: 0.3s;
}
.btn-primary-small:hover {
  background: #409E99;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 153, 0.2);
}

/* Video */
.video-frame { position: relative; padding-bottom: 56.25%; height: 0; background: black; border-radius: 4px; overflow: hidden; }
.video-frame iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }

.loading-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #409E99; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .content-layout { flex-direction: column; }
  .poster-sidebar { position: relative; top: 0; width: 100%; margin-bottom: 40px; }
  .cast-list-container { grid-template-columns: 1fr; }
  .sidebar-nav { display: none; }
}
</style>