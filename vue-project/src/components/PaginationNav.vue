<template>
  <nav class="pagination-minimal" aria-label="Page navigation">
    <!-- Prev -->
    <button 
      class="nav-arrow" 
      :disabled="current === 1" 
      @click="emitPage(current - 1)"
    >
      <i class="bi bi-chevron-left"></i>
    </button>

    <!-- Numbers -->
    <div class="page-list">
      <button 
        v-for="page in visiblePages" 
        :key="page" 
        class="page-num" 
        :class="{ active: current === page }"
        @click="emitPage(page)"
      >
        {{ page }}
      </button>
    </div>

    <!-- Next -->
    <button 
      class="nav-arrow" 
      :disabled="current === total" 
      @click="emitPage(current + 1)"
    >
      <i class="bi bi-chevron-right"></i>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true }
})

const emit = defineEmits(['change'])

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, props.current - 2)
  let end = Math.min(props.total, start + maxVisible - 1)

  if (end === props.total) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const emitPage = (page) => {
  if (page >= 1 && page <= props.total && page !== props.current) {
    emit('change', page)
  }
}
</script>

<style scoped>
.pagination-minimal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-top: 60px;
  padding: 20px 0;
}

.nav-arrow {
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  color: #bbb;
  font-size: 1.2rem;
  transition: color 0.3s;
  display: flex;
  align-items: center;
}

.nav-arrow:hover:not(:disabled) {
  color: #1a1a1a;
}

.nav-arrow:disabled {
  color: #eee;
  cursor: not-allowed;
}

.page-list {
  display: flex;
  align-items: center;
  gap: 15px;
}

.page-num {
  background: none;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #999;
  position: relative;
  transition: all 0.3s;
}

.page-num::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #409E99;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.page-num:hover {
  color: #1a1a1a;
}

.page-num.active {
  color: #1a1a1a;
  font-weight: 900;
}

.page-num.active::after {
  width: 15px;
}

/* Mobile */
@media (max-width: 480px) {
  .pagination-minimal { gap: 15px; }
  .page-list { gap: 5px; }
}
</style>