<template>
  <div class="movie-row" @click="goDetail">
    <img
      :src="posterSrc"
      alt="poster"
      class="poster"
    />
    <div class="info">
      {{ movie.year }} - {{ movie.title_ko }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
// NO IMAGE 대체 이미지 파일은 /src/assets/no-image.png 라고 가정

const props = defineProps({
  movie: {
    type: Object,
    required: true,
  },
})

const router = useRouter()

const posterSrc = computed(() => {
  // movie.poster_url 이 비었거나 "poster" 같은 더미 값이면 기본 이미지
  if (!props.movie.poster_url || props.movie.poster_url === 'poster') {
    return new URL('../assets/no-image.png', import.meta.url).href
  }
  return props.movie.poster_url
})

const goDetail = () => {
  router.push({ name: 'movie-detail', params: { id: props.movie.id } })
}
</script>

<style scoped>
.movie-row {
  display: flex;
  align-items: center;        /* 위아래 가운데 정렬 */
  gap: 12px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.movie-row:hover {
  background-color: #f3f3f3;  /* 마우스 올렸을 때 색 살짝 변경 */
}

.poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  flex-shrink: 0;
  background-color: #eee;
}

.info {
  flex: 1;                    /* 남은 가로 공간 채우기 */
  display: flex;
  align-items: center;        /* 텍스트 세로 가운데 */
}
</style>
