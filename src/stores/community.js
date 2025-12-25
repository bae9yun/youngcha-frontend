// 기존 코드
// import { ref } from 'vue'
// import { defineStore } from 'pinia'
// import axios from 'axios'
// import { useUserStore } from './user'
// 
// const API_URL = 'http://127.0.0.1:8000'

import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/apis/axios'
import { useUserStore } from './user'

export const useCommunityStore = defineStore('community', () => {
  const articles = ref([])
  const popularArticles = ref([])
  const article = ref(null)
  const userStore = useUserStore()

  const getAuthHeaders = () => {
    if (!userStore.token) {
      return {}
    }
    return { Authorization: `Token ${userStore.token}` }
  }

  // 게시글 목록
  // const fetchArticles = (sortOption = null) => {
  //   let url = `${API_URL}/api/community/articles/`
  //   if (sortOption) {
  //     url += `?sort=${sortOption}`
  //   }
  //   axios({ method: 'get', url })
  //     .then((res) => { articles.value = res.data })
  //     .catch((err) => console.error(err))
  // }

  const fetchArticles = (sortOption = null) => {
    let url = '/api/community/articles/'
    if (sortOption) {
      url += `?sort=${sortOption}`
    }
    api.get(url)
      .then((res) => {
        articles.value = res.data
      })
      .catch((err) => console.error(err))
  }

  // 인기 게시글 목록
  // const fetchPopularArticles = () => {
  //   axios({
  //     method: 'get',
  //     url: `${API_URL}/api/community/articles/popular/`,
  //   })
  //     .then((res) => {
  //       popularArticles.value = res.data
  //     })
  //     .catch((err) => console.error(err))
  // }

  const fetchPopularArticles = () => {
    api.get('/api/community/articles/popular/')
      .then((res) => {
        popularArticles.value = res.data
      })
      .catch((err) => console.error(err))
  }

  // 게시글 상세
  // const fetchArticle = (articleId) => {
  //   const headers = getAuthHeaders()
  //   return axios({
  //     method: 'get',
  //     url: `${API_URL}/api/community/articles/${articleId}/`,
  //     headers,
  //   })
  //     .then((res) => {
  //       article.value = res.data
  //     })
  //     .catch((err) => console.error(err))
  // }

  const fetchArticle = (articleId) => {
    const headers = getAuthHeaders()
    return api.get(`/api/community/articles/${articleId}/`, { headers })
      .then((res) => {
        article.value = res.data
      })
      .catch((err) => console.error(err))
  }

  // 게시글 생성
  // const createArticle = (formData) => {
  //   return axios({
  //     method: 'post',
  //     url: `${API_URL}/api/community/articles/`,
  //     headers: {
  //       ...getAuthHeaders(),
  //       'Content-Type': 'multipart/form-data',
  //     },
  //     data: formData,
  //   })
  // }

  const createArticle = (formData) => {
    return api.post('/api/community/articles/', formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // 게시글 수정
  // const updateArticle = (articleId, formData) => {
  //   return axios({
  //     method: 'patch',
  //     url: `${API_URL}/api/community/articles/${articleId}/`,
  //     headers: {
  //       ...getAuthHeaders(),
  //       'Content-Type': 'multipart/form-data',
  //     },
  //     data: formData,
  //   })
  // }

  const updateArticle = (articleId, formData) => {
    return api.patch(`/api/community/articles/${articleId}/`, formData, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  // 게시글 삭제
  // const deleteArticle = (articleId) => {
  //   return axios({
  //     method: 'delete',
  //     url: `${API_URL}/api/community/articles/${articleId}/`,
  //     headers: getAuthHeaders(),
  //   })
  // }

  const deleteArticle = (articleId) => {
    return api.delete(`/api/community/articles/${articleId}/`, {
      headers: getAuthHeaders(),
    })
  }

  // 좋아요
  // const likeArticle = (articleId) => {
  //   return axios({
  //     method: 'post',
  //     url: `${API_URL}/api/community/articles/${articleId}/like/`,
  //     headers: getAuthHeaders(),
  //   })
  //     .then((res) => {
  //       article.value = res.data
  //     })
  //     .catch((err) => console.error(err))
  // }

  const likeArticle = (articleId) => {
    return api.post(`/api/community/articles/${articleId}/like/`, null, {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        article.value = res.data
      })
      .catch((err) => console.error(err))
  }

  // 댓글 생성
  // const createComment = (payload) => {
  //   return axios({
  //     method: 'post',
  //     url: `${API_URL}/api/community/articles/${payload.articleId}/comments/`,
  //     headers: getAuthHeaders(),
  //     data: { content: payload.content },
  //   })
  // }

  const createComment = (payload) => {
    return api.post(
      `/api/community/articles/${payload.articleId}/comments/`,
      { content: payload.content },
      { headers: getAuthHeaders() },
    )
  }

  // 댓글 수정
  // const updateComment = (payload) => {
  //   return axios({
  //     method: 'put',
  //     url: `${API_URL}/api/community/comments/${payload.commentId}/`,
  //     headers: getAuthHeaders(),
  //     data: { content: payload.content },
  //   })
  // }

  const updateComment = (payload) => {
    return api.put(
      `/api/community/comments/${payload.commentId}/`,
      { content: payload.content },
      { headers: getAuthHeaders() },
    )
  }

  // 댓글 삭제
  // const deleteComment = (payload) => {
  //   return axios({
  //     method: 'delete',
  //     url: `${API_URL}/api/community/comments/${payload.commentId}/`,
  //     headers: getAuthHeaders(),
  //   })
  // }

  const deleteComment = (payload) => {
    return api.delete(
      `/api/community/comments/${payload.commentId}/`,
      { headers: getAuthHeaders() },
    )
  }

  return {
    articles,
    popularArticles,
    article,
    fetchArticles,
    fetchPopularArticles,
    fetchArticle,
    createArticle,
    updateArticle,
    deleteArticle,
    likeArticle,
    createComment,
    updateComment,
    deleteComment,
  }
})
