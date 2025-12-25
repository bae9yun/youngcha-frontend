// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LandingViewCreative from '../views/LandingViewCreative.vue'
import MovieListView from '../views/MovieListView.vue'
import MovieDetailView from '../views/MovieDetailView.vue'
import SignUpView from '../views/SignUpView.vue'
import MyPageView from '@/views/MyPageView.vue'
import LogInView from '@/views/LogInView.vue'

// Community Views
import ArticleListView from '@/views/community/ArticleListView.vue'
import ArticleDetailView from '@/views/community/ArticleDetailView.vue'
import ArticleFormView from '@/views/community/ArticleFormView.vue'

// profile
import UserProfileView from '@/views/UserProfileView.vue'

// 인물 상세
import PersonDetailView from '@/views/PersonDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // 뒤로가기/앞으로가기 시 저장된 위치가 있으면 그곳으로 이동
    if (savedPosition) {
      return savedPosition
    } else {
      // 그 외의 경우(새로운 링크 클릭 등) 최상단으로 이동
      return { top: 0 }
    }
  },
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingViewCreative,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/movies',
      name: 'movies',
      component: MovieListView,
    },
    {
      path: '/movies/:id',
      name: 'movie-detail',
      component: MovieDetailView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUpView,
    },
    {
      path: '/login',
      name: 'login',
      component: LogInView,
    },
    {
      path: '/me',
      name: 'mypage',
      component: MyPageView,
    },
    // Community Routes
    {
      path: '/community',
      name: 'community-list',
      component: ArticleListView,
    },
    {
      path: '/community/create',
      name: 'community-create',
      component: ArticleFormView,
    },
    {
      path: '/community/:id',
      name: 'community-detail',
      component: ArticleDetailView,
    },
    {
      path: '/community/:id/update',
      name: 'community-update',
      component: ArticleFormView,
    },
    {
      path: '/users/:id',
      name: 'user-profile',
      component: UserProfileView,
    },
    {
      path: '/people/:id',
      name: 'person-detail',
      component: PersonDetailView 
    },
  ],
})

export default router