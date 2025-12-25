<template>
  <div class="page-wrapper">
    <!-- Left Landing Section -->
    <div class="landing-section">
      <div class="landing-content">
        <h1 class="main-copy">
          당신의 인생 영화를<br />찾아드립니다
        </h1>
        <p class="sub-copy">
          영화 추천 및 리뷰 커뮤니티, <span class="brand-highlight">영차</span>
        </p>
      </div>
    </div>

    <!-- Right Form Section -->
    <div class="form-section">
      <div class="form-container">
        <div class="header-section text-center">
          <h1>로그인</h1>
          <p class="subtitle">다시 오신 것을 환영합니다!</p>
        </div>

        <form @submit.prevent="onLogIn" class="auth-form">
          <div class="form-group">
            <label for="username">아이디</label>
            <input
              id="username"
              v-model.trim="store.username"
              type="text"
              class="form-control"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">비밀번호</label>
            <input
              id="password"
              v-model="store.password"
              type="password"
              class="form-control"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <p v-if="store.logInErrors" class="error-message">
            아이디 또는 비밀번호를 다시 확인해 주세요.
          </p>

          <button type="submit" class="btn btn-primary btn-block">로그인</button>
        </form>
        
        <div class="form-footer">
          <p>아직 회원이 아니신가요? <router-link :to="{ name: 'signup' }">회원가입</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const store = useUserStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  store.password = null
  store.logInErrors = null
  store.username = null
})

const onLogIn = function () {
  const payload = {
    username: store.username,
    password: store.password,
  }
  store.logIn(payload)
    .then(() => {
      const redirect = route.query.redirect

      if (redirect) {
        router.push(redirect)
      } else {
        router.push({ name: 'home' })
      }
    })
    .catch(() => {
      // 에러 메시지는 store.logInErrors에 저장됨
    })
}
</script>

<style scoped>
/* Page Layout */
.brand-highlight {
  font-weight: 800;
  color: #409E99;
  font-size: 1.4rem;
  background: linear-gradient(to right, #409E99, #52c7c1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
  text-shadow: 0 0 20px rgba(64, 158, 153, 0.3);
}

.page-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  background: transparent;
}

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
  background: #409E99;
  top: -100px;
  left: -100px;
  animation-duration: 12s;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: #2b5876;
  bottom: -50px;
  right: -50px;
  animation-duration: 15s;
  animation-delay: -2s;
}

.circle-3 {
  width: 300px;
  height: 300px;
  background: #20c997;
  top: 40%;
  left: 60%;
  opacity: 0.4;
  animation-duration: 18s;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 50px) scale(1.1); }
}

/* Landing Section (Left) */
.landing-section {
  flex: 1;
  display: flex;
  justify-content: flex-end; /* Pull content towards center */
  align-items: center;
  z-index: 10;
  padding-right: 150px; /* Adjusted gap */
}

.landing-content {
  text-align: right;
  max-width: 500px;
}

.main-copy {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  letter-spacing: -1px;
  background: linear-gradient(to right, #fff, #e0f2f1);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.sub-copy {
  font-size: 1.2rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
}

/* Form Section (Right) */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Pull content towards center */
  padding-left: 150px; /* Adjusted gap */
  z-index: 10;
}

.form-container {
  max-width: 450px;
  width: 100%;
  background: rgba(255, 255, 255, 0.05); /* Glass effect */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 50px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Header */
.header-section {
  margin-bottom: 40px;
}

h1 {
  font-weight: 800;
  font-size: 2.2rem;
  color: #fff;
  margin-bottom: 8px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

/* Form styles */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.form-control {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  width: 100%;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-control:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: #409E99;
  box-shadow: 0 0 0 4px rgba(64, 158, 153, 0.2);
  outline: none;
}

/* Error message */
.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  margin-top: -10px;
  text-align: center;
}

/* Button */
.btn-primary {
  background-color: #409E99;
  color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(64, 158, 153, 0.3);
}

.btn-primary:hover {
  background-color: #32827e;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(64, 158, 153, 0.5);
}

.btn-block {
  width: 100%;
}

/* Footer link */
.form-footer {
  text-align: center;
  margin-top: 30px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
}

.form-footer a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  transition: all 0.2s ease;
  opacity: 0.8;
}

.form-footer a:hover {
  color: #409E99;
  text-decoration: none;
  opacity: 1;
  transform: translateY(-1px);
  display: inline-block;
}

/* Responsive */
@media (max-width: 992px) {
  .page-wrapper {
    flex-direction: column;
    justify-content: center;
    padding: 20px;
  }
  .landing-section {
    display: none;
  }
  .form-section {
    padding-left: 0;
    justify-content: center;
  }
  .form-container {
    padding: 30px;
  }
}
</style>
