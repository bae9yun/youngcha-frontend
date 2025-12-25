<template>
  <div class="page-wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header-section text-center">
        <h1 class="page-title">{{ isUpdate ? '게시글 수정' : '새 게시글 작성' }}</h1>
        <p class="subtitle">오늘 본 영화, 나누고 싶은 이야기를 기록해보세요.</p>
      </div>

      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="article-form">
          
          <!-- 1. Movie Tag Section -->
          <div class="form-group">
            <label class="custom-label">이야기하고 싶은 영화를 찾아보세요</label>
            <div class="movie-tag-wrapper">
              <!-- Search Input (if no movie selected) -->
              <div v-if="!selectedMovie" class="search-box-container">
                <div class="search-input-group">
                  <i class="bi bi-search search-icon"></i>
                  <input 
                    type="text" 
                    class="form-input search-input" 
                    v-model.trim="movieQuery" 
                    @keydown.enter.prevent
                    placeholder="영화 제목을 검색하여 태그해보세요"
                  >
                </div>
                
                <!-- Floating Search Results -->
                <transition name="slide-fade">
                  <ul v-if="searchResults.length > 0" class="floating-results">
                    <li 
                      v-for="movie in searchResults" 
                      :key="movie.id" 
                      @click="selectMovie(movie)"
                      class="result-item"
                    >
                      <img :src="getPosterUrl(movie.poster_url)" alt="poster" class="result-poster">
                      <div class="result-info">
                        <span class="result-title">{{ movie.title_ko }}</span>
                        <span class="result-year">{{ movie.year }}</span>
                      </div>
                    </li>
                  </ul>
                </transition>
              </div>

              <!-- Selected Movie Card -->
              <transition name="bounce">
                <div v-if="selectedMovie" class="selected-movie-tag">
                  <div class="tag-content">
                    <img :src="getPosterUrl(selectedMovie.poster_url)" alt="poster" class="tag-poster">
                    <div class="tag-info">
                      <span class="tag-label">태그된 영화</span>
                      <h5 class="tag-title text-truncate">{{ selectedMovie.title_ko || selectedMovie.title }}</h5>
                    </div>
                  </div>
                  <button type="button" class="btn-remove-tag" @click="removeMovie">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </transition>
            </div>
          </div>

          <!-- 2. Title Input -->
          <div class="form-group">
            <label for="title" class="custom-label">제목</label>
            <input 
              type="text" 
              id="title" 
              class="form-input title-input" 
              v-model.trim="title" 
              placeholder="게시글의 제목을 입력해주세요"
            >
          </div>

          <!-- 3. Content Area -->
          <div class="form-group">
            <label for="content" class="custom-label">내용</label>
            <textarea 
              id="content" 
              class="form-input content-input" 
              v-model="content" 
              rows="12" 
              placeholder="영화에 대한 솔직한 생각을 자유롭게 적어주세요."
            ></textarea>
          </div>
          
          <!-- 4. Image Upload Section -->
          <div class="form-group">
            <label class="custom-label">이미지 첨부</label>
            <div class="upload-area" :class="{ 'has-preview': imagePreview }">
              <input 
                type="file" 
                id="image-upload" 
                hidden 
                @change="onFileChange" 
                accept="image/*"
              >
              
              <!-- No Image State -->
              <label v-if="!imagePreview" for="image-upload" class="upload-placeholder">
                <i class="bi bi-image-fill"></i>
                <span>이미지를 클릭하여 업로드하세요</span>
              </label>

              <!-- Image Preview State -->
              <div v-else class="preview-wrapper">
                <img :src="imagePreview" alt="미리보기" class="img-preview">
                <div class="preview-overlay">
                  <label for="image-upload" class="btn-change-img">변경</label>
                  <button type="button" class="btn-delete-img" @click="removeImage">삭제</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 5. Action Buttons -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="handleCancel">취소</button>
            <button type="submit" class="btn-primary">
              {{ isUpdate ? '수정 완료' : '게시글 등록' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommunityStore } from '@/stores/community'
// import axios from 'axios'
// const API_URL = 'http://127.0.0.1:8000'
import api from '@/apis/axios'

const route = useRoute()
const router = useRouter()
const store = useCommunityStore()


const title = ref('')
const content = ref('')
const imageFile = ref(null)
const imagePreview = ref(null)
const articleId = ref(route.params.id || null)

// Movie Tag logic
const movieQuery = ref('')
const searchResults = ref([])
const selectedMovie = ref(null)
let debounceTimer = null

const isUpdate = computed(() => articleId.value !== null)

onMounted(async () => {
  if (isUpdate.value) {
    await store.fetchArticle(articleId.value)
    title.value = store.article.title
    content.value = store.article.content
    if (store.article.image) {
      imagePreview.value = store.article.image
    }
    if (store.article.movie) {
      selectedMovie.value = store.article.movie
    }
  } else if (route.query.movie_id) {
    // 영화 상세 페이지에서 '게시글 쓰기'를 통해 넘어온 경우
    fetchMovieDetail(route.query.movie_id)
  }
})

const fetchMovieDetail = async (movieId) => {
  try {
    const res = await api.get(`/api/movies/${movieId}/`)
    selectedMovie.value = res.data
  } catch (err) {
    console.error('Failed to fetch movie detail:', err)
  }
}

watch(movieQuery, (newVal) => {
  clearTimeout(debounceTimer)
  if (!newVal.trim()) {
    searchResults.value = []
    return
  }
  debounceTimer = setTimeout(() => {
    searchMovie()
  }, 300)
})

const searchMovie = async () => {
  if (!movieQuery.value.trim()) return
  try {
    const res = await api.get(`/api/movies/`, {
      params: { query: movieQuery.value }
    })
    searchResults.value = res.data.results
  } catch (err) {
    console.error('Movie search failed:', err)
  }
}

const selectMovie = (movie) => {
  selectedMovie.value = movie
  searchResults.value = []
  movieQuery.value = ''
}

const removeMovie = () => selectedMovie.value = null

const getPosterUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) {
    return path.replace('/w500/', '/original/').replace('/w200/', '/original/')
  }
  return `https://image.tmdb.org/t/p/original${path}`
}

const onFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = null
}

const handleSubmit = async () => {
  const formData = new FormData()
  formData.append('title', title.value)
  formData.append('content', content.value)
  if (imageFile.value) {
    formData.append('image', imageFile.value)
  }
  if (selectedMovie.value) {
    formData.append('movie_id', selectedMovie.value.id)
  }
  
  try {
    if (isUpdate.value) {
      await store.updateArticle(articleId.value, formData)
      router.push({ name: 'community-detail', params: { id: articleId.value } })
    } else {
      const response = await store.createArticle(formData)
      router.push({ name: 'community-detail', params: { id: response.data.id } })
    }
  } catch (err) {
    console.error('Failed to submit:', err)
  }
}

const handleCancel = () => router.push({ name: 'community-list' })
</script>

<style scoped>
.page-wrapper {
  background: #FFFFFFD9;
  min-height: 100vh;
  padding: 60px 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

/* Header */
.header-section {
  margin-bottom: 40px;
}

.page-title {
  font-weight: 800;
  font-size: 2.5rem;
  color: #409E99;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

/* Form Container */
.form-container {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.form-group {
  margin-bottom: 30px;
  position: relative;
}

.custom-label {
  display: block;
  font-weight: 700;
  color: #444;
  margin-bottom: 10px;
  font-size: 0.95rem;
  padding-left: 4px;
}

.form-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 15px 20px;
  font-size: 1rem;
  transition: all 0.3s;
  color: #333;
}

.form-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.9);
  border-color: #409E99;
  box-shadow: 0 0 0 4px rgba(64, 158, 153, 0.1);
}

textarea.form-input {
  resize: none;
  line-height: 1.6;
}

/* Movie Tag Section */
.search-box-container {
  position: relative;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 18px;
  color: #adb5bd;
  font-size: 1.1rem;
}

.search-input {
  padding-left: 50px;
}

/* Floating Results */
.floating-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 350px;
  overflow-y: auto;
  list-style: none;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.result-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.result-item:hover {
  background: #e8f7f6;
}

.result-poster {
  width: 45px;
  height: 65px;
  object-fit: cover;
  border-radius: 6px;
}

.result-title {
  display: block;
  font-weight: 700;
  color: #333;
}

.result-year {
  font-size: 0.85rem;
  color: #999;
}

/* Selected Movie Tag Card */
.selected-movie-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(64, 158, 153, 0.1);
  border: 1px solid rgba(64, 158, 153, 0.2);
  border-radius: 16px;
  padding: 15px 20px;
  animation: bounceIn 0.5s;
}

.tag-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.tag-poster {
  width: 50px;
  height: 75px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.tag-label {
  font-size: 0.75rem;
  color: #409E99;
  font-weight: 800;
  text-transform: uppercase;
}

.tag-title {
  margin: 0;
  font-weight: 800;
  font-size: 1.15rem;
  color: #222;
}

.btn-remove-tag {
  background: white;
  border: 1px solid #eee;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #aaa;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove-tag:hover {
  color: #ff4081;
  border-color: #ff4081;
  background: #fff0f3;
}

/* Upload Area */
.upload-area {
  width: 100%;
  border: 2px dashed rgba(64, 158, 153, 0.2);
  border-radius: 16px;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.4);
  overflow: hidden;
  transition: all 0.3s;
}

.upload-area:hover:not(.has-preview) {
  border-color: #409E99;
  background: rgba(64, 158, 153, 0.05);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #adb5bd;
  cursor: pointer;
  width: 100%;
  height: 150px;
  justify-content: center;
}

.upload-placeholder i { font-size: 2.5rem; }
.upload-placeholder span { font-weight: 600; font-size: 0.9rem; }

.preview-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.img-preview {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-wrapper:hover .preview-overlay {
  opacity: 1;
}

.btn-change-img, .btn-delete-img {
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
}

.btn-change-img { background: white; color: #333; }
.btn-delete-img { background: #ff4081; color: white; }

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
}

.btn-primary {
  background: rgba(64, 158, 153, 0.7);
  color: white;
  border-radius: 50px;
  padding: 14px 35px;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary:hover {
  background: rgba(64, 158, 153, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(64, 158, 153, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #555;
  padding: 14px 35px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: #ccc;
}

/* Animations */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

@keyframes bounceIn {
  0% { transform: scale(0.9); opacity: 0; }
  60% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(1); }
}

.error-msg {
  color: #ff4081;
  font-size: 0.85rem;
  margin-top: 5px;
  padding-left: 4px;
}
</style>