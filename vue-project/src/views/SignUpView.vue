<template>
  <div class="page-wrapper">
    <!-- Left Landing Section -->
    <div class="landing-section">
      <div class="landing-content">
        <h1 class="main-copy">
          새로운 취향의 발견<br />영차와 함께하세요
        </h1>
        <p class="sub-copy">
          당신의 영화 파트너, <span class="brand-highlight">영차</span>
        </p>
      </div>
    </div>

    <!-- Right Form Section -->
    <div class="form-section">
      <div class="form-container">
        <div class="header-section text-center">
          <h1>회원가입</h1>
          <p class="subtitle">우리와 함께하세요!</p>
        </div>

        <form @submit.prevent="onSignUp" class="auth-form">
          <!-- 아이디 -->
          <div class="form-group">
            <label for="username">아이디</label>
            <div class="input-group">
              <input id="username" v-model.trim="store.username" type="text" class="form-control" placeholder="아이디" required />
              <button type="button" @click="checkUsername" class="btn btn-secondary">중복 확인</button>
            </div>
            <p v-if="usernameMessage" class="feedback-message" :class="usernameAvailable ? 'success' : 'error'">
              {{ usernameMessage }}
            </p>
            <p v-if="store.signUpErrors?.username" class="error-message">{{ store.signUpErrors.username[0] }}</p>
          </div>
          
          <!-- 닉네임 -->
          <div class="form-group">
            <label for="nickname">닉네임</label>
            <div class="input-group">
              <input id="nickname" v-model.trim="store.nickname" type="text" class="form-control" placeholder="닉네임" required />
              <button type="button" @click="checkNickname" class="btn btn-secondary">중복 확인</button>
            </div>
            <p v-if="nicknameMessage" class="feedback-message" :class="nicknameAvailable ? 'success' : 'error'">
              {{ nicknameMessage }}
            </p>
            <p v-if="store.signUpErrors?.nickname" class="error-message">{{ store.signUpErrors.nickname[0] }}</p>
          </div>

          <!-- 이메일 -->
          <div class="form-group">
            <label for="email">이메일</label>
            <div class="input-group">
              <input id="email" v-model.trim="store.email" type="email" class="form-control" placeholder="이메일" />
              <button type="button" @click="checkEmail" class="btn btn-secondary">중복 확인</button>
            </div>
            <p v-if="emailMessage" class="feedback-message" :class="emailAvailable ? 'success' : 'error'">
              {{ emailMessage }}
            </p>
            <p v-if="store.signUpErrors?.email" class="error-message">{{ store.signUpErrors.email[0] }}</p>
          </div>

          <!-- 한줄 소개 (선택) -->
          <div class="form-group">
            <label for="intro">한줄 소개 (선택)</label>
            <input id="intro" v-model.trim="intro" type="text" class="form-control" placeholder="나를 소개하는 한 문장을 적어보세요." />
          </div>

          <!-- 비밀번호 -->
          <div class="form-group">
            <label for="password">비밀번호</label>
            <input id="password" v-model="store.password1" type="password" class="form-control" placeholder="비밀번호" required />
            <p v-if="store.signUpErrors?.password1" class="error-message">{{ store.signUpErrors.password1[0] }}</p>
          </div>

          <!-- 비밀번호 확인 -->
          <div class="form-group">
            <label for="password2">비밀번호 확인</label>
            <input id="password2" v-model="store.password2" type="password" class="form-control" placeholder="비밀번호 확인" required />
            <p v-if="store.signUpErrors?.non_field_errors" class="error-message">{{ store.signUpErrors.non_field_errors[0] }}</p>
          </div>
          
          <button type="submit" class="btn btn-primary btn-block">회원가입</button>
        </form>

        <div class="form-footer">
          <p>이미 계정이 있으신가요? <router-link :to="{ name: 'login' }">로그인</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
// import axios from 'axios'
import api from '@/apis/axios'
import { useUserStore } from '../stores/user'

const store = useUserStore()
const router = useRouter()

const usernameAvailable = ref(null)
const usernameMessage = ref('')
const emailAvailable = ref(null)
const emailMessage = ref('')
const nicknameAvailable = ref(null)
const nicknameMessage = ref('')
const intro = ref('') // This field is optional and not shown in the new design for simplicity

onMounted(() => {
  // Reset all fields on component mount
  store.username = null
  store.email = null
  store.nickname = null
  store.password1 = null
  store.password2 = null
  store.signUpErrors = null
  usernameAvailable.value = null
  usernameMessage.value = ''
  emailAvailable.value = null
  emailMessage.value = ''
  nicknameAvailable.value = null
  nicknameMessage.value = ''
  intro.value = ''
})

// 아이디, 이메일, 닉네임 변경 시 중복 확인 상태 초기화
watch(() => store.username, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    usernameAvailable.value = null
    usernameMessage.value = ''
  }
})

watch(() => store.email, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    emailAvailable.value = null
    emailMessage.value = ''
  }
})

watch(() => store.nickname, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    nicknameAvailable.value = null
    nicknameMessage.value = ''
  }
})

const checkField = (fieldName, paramKey, value, availableRef, messageRef, endpoint) => {
  if (!value) {
    availableRef.value = false
    messageRef.value = `${fieldName}을(를) 입력하세요.`
    return
  }
  // axios.get(`${store.API_URL}/api/accounts/${endpoint}/`, {
  api.get(`/api/accounts/${endpoint}/`, {
    params: { [paramKey]: value }
  }).then(res => {
    availableRef.value = res.data.is_available
    messageRef.value = res.data.is_available
      ? `사용 가능한 ${fieldName}입니다.`
      : `이미 사용 중인 ${fieldName}입니다.`
  })
}

const checkUsername = () => checkField('아이디', 'username', store.username, usernameAvailable, usernameMessage, 'check-username')
const checkEmail = () => checkField('이메일', 'email', store.email, emailAvailable, emailMessage, 'check-email')
const checkNickname = () => checkField('닉네임', 'nickname', store.nickname, nicknameAvailable, nicknameMessage, 'check-nickname')

const onSignUp = function () {
  // 중복 확인 여부 검사
  if (usernameAvailable.value !== true) {
    alert('아이디 중복 확인을 통과해야 합니다.')
    return
  }
  if (nicknameAvailable.value !== true) {
    alert('닉네임 중복 확인을 통과해야 합니다.')
    return
  }
  // 이메일은 선택사항이지만, 입력했다면 중복 확인을 거쳐야 함
  if (store.email && emailAvailable.value !== true) {
    alert('이메일 중복 확인을 통과해야 합니다.')
    return
  }

  const payload = {
    username: store.username,
    email: store.email,
    password1: store.password1,
    password2: store.password2,
    nickname: store.nickname,
    intro: intro.value || '',
  }
  store.signUp(payload)
    .then(() => {
      alert('회원가입 완료! 로그인 해 주세요.')
      router.push({ name: 'login' })
    })
    .catch(() => {
      alert('입력 내용을 다시 확인해 주세요.')
    })
}
</script>

<style scoped>
/* Page Layout */
.page-wrapper {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  overflow-x: hidden;
  position: relative;
  background: transparent;
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

/* Form Section (Right) */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* Pull content towards center */
  padding-left: 150px; /* Adjusted gap */
  z-index: 10;
  overflow-y: auto;
}

.form-container {
  max-width: 450px;
  width: 100%;
  background: rgba(255, 255, 255, 0.05); /* Glass effect */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Header */
.header-section {
  margin-bottom: 30px;
}

h1 {
  font-weight: 800;
  font-size: 2.2rem;
  color: #fff;
  margin-bottom: 5px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

/* Form styles */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.input-group {
  display: flex;
  gap: 10px;
}

.form-control {
  flex-grow: 1;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  width: 100%;
  transition: 0.3s;
}

/* 버튼이 없는 필드의 입력창 너비 조절 */
.form-control:not(.input-group .form-control) {
  width: calc(100% - 110px);
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

.btn-secondary {
  width: 100px;
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 15px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

/* Feedback messages */
.feedback-message {
  font-size: 0.8rem;
  margin-top: 6px;
}
.feedback-message.success {
  color: #51cf66;
}
.feedback-message.error {
  color: #ff6b6b;
}
.error-message {
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-top: 6px;
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
  margin-top: 25px;
  font-size: 0.9rem;
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
    padding: 20px;
  }
  .landing-section {
    display: none;
  }
  .form-section {
    padding: 0;
    justify-content: center;
  }
  .form-container {
    padding: 30px;
  }
}
</style>