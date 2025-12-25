<template>
  <footer class="main-footer" :class="{ 'is-dark-bg': isDarkPage }">
    <div class="footer-content">
      <div class="footer-logo">
        <span class="brand">영차</span>
      </div>
      <div class="footer-links">
        <a href="#" class="link">서비스 소개</a>
        <a href="#" class="link">이용약관</a>
        <a href="#" class="link">개인정보처리방침</a>
      </div>
      <div class="footer-info">
        <p>SSAFY 14기 관통 프로젝트 서백균 조강영</p>
        <p>Copyright © 2025 YoungCha. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isDarkPage = computed(() => {
  return ['landing', 'login', 'signup'].includes(route.name)
})
</script>

<style scoped>
.main-footer {
  background-color: #f8f9fa;
  padding: 60px 20px;
  margin-top: auto;
  border-top: 1px solid #e9ecef;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.brand {
  font-weight: 800;
  font-size: 1.8rem;
  background: linear-gradient(to right, #409E99, #307c77);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.5px;
}

.footer-links {
  display: flex;
  gap: 30px;
}

.link {
  color: #666;
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.2s;
  font-weight: 500;
}

.link:hover {
  color: #409E99;
  transform: translateY(-2px);
}

.footer-info {
  color: #999;
  font-size: 0.85rem;
  line-height: 1.8;
  border-top: 1px solid #eee;
  padding-top: 24px;
  width: 100%;
  max-width: 600px;
}

.footer-info p {
  margin: 4px 0;
}

/* Dark Background Page Styles */
.main-footer.is-dark-bg {
  background-color: transparent;
  border-top: none;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0;
}

.main-footer.is-dark-bg .link {
  color: rgba(255, 255, 255, 0.6);
}

.main-footer.is-dark-bg .link:hover {
  color: #409E99;
}

.main-footer.is-dark-bg .footer-info {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
}
</style>
