<template>
  <div class="landing-container">
    <!-- Background Decor (Blurred Shapes) -->
    <div class="shape circle-1"></div>
    <div class="shape circle-2"></div>
    <div class="shape circle-3"></div>

    <div class="content-wrapper">
      <h1 class="main-copy">
        당신의 인생 영화를<br />찾아드립니다
      </h1>
      <p class="sub-copy">
        영화 추천 및 리뷰 커뮤니티, 영차
      </p>
      
      <button class="cta-button" @click="goHome">
        영차 시작하기
        <span class="arrow">→</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'home' })
}
</script>

<style scoped>
/* Container & Background */
.landing-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(circle at 50% 120%, #1a2a6c, #0e1a40); /* Deep dark base */
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%); /* Alternative Deep */
  background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

/* Blurred Shapes for Dreamy Effect */
.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 10s infinite ease-in-out alternate;
  z-index: 1;
}

.circle-1 {
  width: 500px;
  height: 500px;
  background: #409E99; /* Main Teal */
  top: -100px;
  left: -100px;
  animation-duration: 12s;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: #2b5876; /* Darker Blue/Teal */
  bottom: -50px;
  right: -50px;
  animation-duration: 15s;
  animation-delay: -2s;
}

.circle-3 {
  width: 300px;
  height: 300px;
  background: #4e4376; /* Slight Purple hint for depth */
  top: 40%;
  left: 60%;
  background: #20c997; /* Light Teal */
  opacity: 0.4;
  animation-duration: 18s;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 50px) scale(1.1); }
}

/* Content */
.content-wrapper {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 0 20px;
  animation: fadeInUp 1s ease-out;
}

.main-copy {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  background: linear-gradient(to right, #fff, #e0f2f1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.sub-copy {
  font-size: 1.2rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 3rem;
  letter-spacing: 0.5px;
}

/* CTA Button */
.cta-button {
  background: #409E99;
  color: white;
  border: none;
  padding: 18px 45px;
  font-size: 1.2rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 15px rgba(64, 158, 153, 0.4);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.cta-button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 30px rgba(64, 158, 153, 0.6);
  background: #3aa8a3;
}

.arrow {
  transition: transform 0.3s;
}

.cta-button:hover .arrow {
  transform: translateX(5px);
}

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .main-copy { font-size: 2.5rem; }
  .sub-copy { font-size: 1rem; }
  .cta-button { padding: 15px 35px; font-size: 1rem; }
}
</style>
