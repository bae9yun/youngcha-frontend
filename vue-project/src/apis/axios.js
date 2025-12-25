// src/apis/axios.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // 여기만 바꿔 쓰면 됨
})

export default api
