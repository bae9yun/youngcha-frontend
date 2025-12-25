<template>
  <div class="movie-list-container">
    <h3>Movie List</h3>
    <div class="movie-grid">
      <MovieListItem
        v-for="movie in movies"
        :key="movie.id"
        :movie="movie" 
      />
    </div>
  </div>
</template>

<script setup>
import MovieListItem from './MovieListItem.vue'

// 부모(View)에서 보낸 목록을 받습니다.
defineProps({
  movies: {
    type: Array,
    default: () => []
  }
})
</script>

<style scoped>
/* .movie-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
} */
</style>