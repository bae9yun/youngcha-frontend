// src/stores/movies.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'
// import axios from 'axios'
// const API_URL = 'http://127.0.0.1:8000'
import api from '@/apis/axios'

export const useMovieStore = defineStore('movie', () => {
  const movies = ref([])
  const genres = ref([])
  const movie = ref(null)
  const count = ref(0)
  const myScore = ref(null)

  const recommendedMovies = ref([])
  const similarMoviesForDetail = ref([])

  const searchQuery = ref('')
  const sortOption = ref('latest')
  const selectedGenre = ref('')
  const currentPage = ref(1)

  const totalPages = computed(() => Math.ceil(count.value / 9))
  const userStore = useUserStore()

  // 장르 목록 조회
  // const getGenres = function () {
  //   axios({
  //     method: 'get',
  //     url: `${API_URL}/api/movies/genres/`,
  //   })
  //     .then((res) => {
  //       genres.value = res.data
  //     })
  //     .catch((err) => {
  //       console.error('장르 목록을 불러오는데 실패했습니다:', err)
  //     })
  // }

  const getGenres = function () {
    api.get('/api/movies/genres/')
      .then((res) => {
        genres.value = res.data
      })
      .catch((err) => {
        console.error('장르 목록을 불러오는데 실패했습니다:', err)
      })
  }

  // 추천 영화 조회
  // const fetchRecommendedMovies = function () {
  //   if (!userStore.isLogin) return
  //
  //   axios({
  //     method: 'get',
  //     url: `${API_URL}/api/movies/recommendations/`,
  //     headers: { Authorization: `Token ${userStore.token}` }
  //   })
  //     .then((res) => {
  //       recommendedMovies.value = res.data
  //     })
  //     .catch((err) => {
  //       console.error('추천 영화 로딩 실패:', err)
  //     })
  // }

  const fetchRecommendedMovies = function () {
    if (!userStore.isLogin) return
    api.get('/api/movies/recommendations/', {
      headers: { Authorization: `Token ${userStore.token}` },
    })
      .then((res) => {
        recommendedMovies.value = res.data
      })
      .catch((err) => {
        console.error('추천 영화 로딩 실패:', err)
      })
  }

  // 영화 목록
  // const getMovies = function (params = {}) {
  //   axios({
  //     method: 'get',
  //     url: `${API_URL}/api/movies/`,
  //     params,
  //   })
  //     .then((res) => {
  //       movies.value = res.data.results
  //       count.value = res.data.count
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //     })
  // }

  const getMovies = function (params = {}) {
    api.get('/api/movies/', { params })
      .then((res) => {
        movies.value = res.data.results
        count.value = res.data.count
      })
      .catch((err) => {
        console.log(err)
      })
  }

  // 영화 상세
  // const getMovieDetail = function (id) {
  //   axios({
  //     method: 'get',
  //     url: `${API_URL}/api/movies/${id}/`,
  //     headers: {
  //       Authorization: userStore.token ? `Token ${userStore.token}` : null,
  //     }
  //   })
  //     .then((res) => {
  //       movie.value = res.data
  //       myScore.value = res.data.my_score ?? null
  //       similarMoviesForDetail.value = res.data.similar_movies || []
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //       movie.value = null
  //       myScore.value = null
  //       similarMoviesForDetail.value = []
  //     })
  // }

  const getMovieDetail = function (id) {
    api.get(`/api/movies/${id}/`, {
      headers: {
        Authorization: userStore.token ? `Token ${userStore.token}` : null,
      },
    })
      .then((res) => {
        movie.value = res.data
        myScore.value = res.data.my_score ?? null
        similarMoviesForDetail.value = res.data.similar_movies || []
      })
      .catch((err) => {
        console.log(err)
        movie.value = null
        myScore.value = null
        similarMoviesForDetail.value = []
      })
  }

  // 좋아요
  // const likeMovie = function (movieId) {
  //   if (!userStore.isLogin) return Promise.reject('로그인이 필요합니다.')
  //
  //   return axios({
  //     method: 'post',
  //     url: `${API_URL}/api/movies/${movieId}/like/`,
  //     headers: { Authorization: `Token ${userStore.token}` },
  //   }).then(res => {
  //     if (movie.value && movie.value.id === movieId) {
  //       movie.value.is_liked = res.data.is_liked
  //       movie.value.like_count = res.data.like_count
  //     }
  //   })
  // }

  const likeMovie = function (movieId) {
    if (!userStore.isLogin) return Promise.reject('로그인이 필요합니다.')

    return api.post(`/api/movies/${movieId}/like/`, null, {
      headers: { Authorization: `Token ${userStore.token}` },
    }).then(res => {
      if (movie.value && movie.value.id === movieId) {
        movie.value.is_liked = res.data.is_liked
        movie.value.like_count = res.data.like_count
      }
    })
  }

  // 평점 + 한줄평 통합 등록/수정
  const rateAndReview = function (movieId, payload) {
    if (!userStore.isLogin) return Promise.reject('로그인이 필요합니다.')

    return api.post(`/api/movies/${movieId}/rate-review/`, payload, {
      headers: { Authorization: `Token ${userStore.token}` },
    }).then(res => {
      if (movie.value && movie.value.id === movieId) {
        movie.value.avg_score = res.data.avg_score
        myScore.value = payload.score
        similarMoviesForDetail.value = res.data.similar_movies || []

        const reviewData = res.data.review
        if (reviewData) {
          const idx = movie.value.reviews.findIndex(
            r => r.user.id === reviewData.user.id,
          )
          if (idx > -1) {
            movie.value.reviews[idx] = reviewData
          } else {
            movie.value.reviews.push(reviewData)
          }
        } else {
          if (userStore.profile?.id) {
            const idx = movie.value.reviews.findIndex(
              r => r.user.id === userStore.profile.id,
            )
            if (idx > -1) {
              movie.value.reviews.splice(idx, 1)
            }
          }
        }
      }
    })
  }

  // 평점만 등록/수정
  const createOrUpdateRating = function (movieId, score) {
    if (!userStore.isLogin) return Promise.reject('로그인이 필요합니다.')

    return api.post(`/api/movies/${movieId}/rating/`,
      { score },
      { headers: { Authorization: `Token ${userStore.token}` } },
    ).then(res => {
      if (movie.value && movie.value.id === movieId) {
        movie.value.avg_score = res.data.avg_score
        myScore.value = res.data.my_rating.score
        similarMoviesForDetail.value = res.data.similar_movies || []
      }
    })
  }

  // 평점만 삭제
  const deleteRating = function (movieId) {
    if (!userStore.isLogin) return Promise.reject('로그인이 필요합니다.')

    return api.delete(`/api/movies/${movieId}/rating/delete/`, {
      headers: { Authorization: `Token ${userStore.token}` },
    }).then(res => {
      if (movie.value && movie.value.id === movieId) {
        movie.value.avg_score = res.data.avg_score
        myScore.value = null
        similarMoviesForDetail.value = []
      }
    })
  }

  // 리뷰 삭제
  const deleteReview = function (movieId, reviewId) {
    if (!userStore.isLogin) return Promise.reject('로그인이 필요합니다.')

    return api.delete(`/api/movies/${movieId}/reviews/${reviewId}/`, {
      headers: { Authorization: `Token ${userStore.token}` },
    }).then(() => {
      if (movie.value && movie.value.id === movieId) {
        const idx = movie.value.reviews.findIndex(r => r.id === reviewId)
        if (idx > -1) {
          movie.value.reviews.splice(idx, 1)
        }
      }
    })
  }

  const reviewLike = function (movieId, reviewId) {
    if (!userStore.isLogin) return Promise.reject('로그인이 필요합니다.')

    return api.post(`/api/movies/${movieId}/reviews/${reviewId}/like/`, null, {
      headers: { Authorization: `Token ${userStore.token}` },
    }).then((res) => {
      if (movie.value && movie.value.id === movieId) {
        const idx = movie.value.reviews.findIndex(r => r.id === reviewId)
        if (idx > -1) {
          movie.value.reviews[idx].like_count = res.data.like_count
          movie.value.reviews[idx].is_liked = res.data.is_liked
        }
      }
    })
  }

  return {
    movies,
    genres,
    movie,
    count,
    totalPages,
    searchQuery,
    sortOption,
    selectedGenre,
    currentPage,
    myScore,
    recommendedMovies,
    similarMoviesForDetail,
    getGenres,
    getMovies,
    getMovieDetail,
    likeMovie,
    rateAndReview,
    createOrUpdateRating,
    deleteRating,
    deleteReview,
    reviewLike,
    fetchRecommendedMovies,
  }
}, {
  persist: true,
})
