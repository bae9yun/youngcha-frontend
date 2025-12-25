// src/stores/people.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
// import axios from 'axios'
// const API_URL = 'http://127.0.0.1:8000'
import api from '@/apis/axios'

export const usePeopleStore = defineStore('people', () => {
  const person = ref(null)
  const directing = ref([])
  const acting = ref([])
  const mainRole = ref('directing')

  // const getPersonDetail = (id) => {
  //   return axios({
  //     method: 'get',
  //     url: `${API_URL}/api/movies/people/${id}/`,
  //   })
  //     .then((res) => {
  //       person.value = res.data.person
  //       directing.value = res.data.directing
  //       acting.value = res.data.acting
  //       mainRole.value = res.data.main_role || 'directing'
  //     })
  //     .catch((err) => {
  //       console.error(err)
  //       person.value = null
  //       directing.value = []
  //       acting.value = []
  //       mainRole.value = 'directing'
  //     })
  // }

  const getPersonDetail = (id) => {
    return api.get(`/api/movies/people/${id}/`)
      .then((res) => {
        person.value = res.data.person
        directing.value = res.data.directing
        acting.value = res.data.acting
        mainRole.value = res.data.main_role || 'directing'
      })
      .catch((err) => {
        console.error(err)
        person.value = null
        directing.value = []
        acting.value = []
        mainRole.value = 'directing'
      })
  }

  return {
    // API_URL,  // 이제 필요 없음
    person,
    directing,
    acting,
    mainRole,
    getPersonDetail,
  }
}, {
  persist: false,
})
