const TOKEN_KEY = 'access_token'
const USER_KEY = 'user_info'
const REMEMBER_ME_KEY = 'remember_me' 

export const authService = {
  /**
   * 토큰 저장
   */
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token)
  },
  
  /**
   * 토큰 가져오기
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  
  /**
   * 토큰 삭제
   */
  removeToken() {
    localStorage.removeItem(TOKEN_KEY)
  },
  
  /**
   * 사용자 정보 저장
   */
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  
  /**
   * 사용자 정보 가져오기
   */
  getUser() {
    const userStr = localStorage.getItem(USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },
  
  /**
   * 사용자 정보 삭제
   */
  removeUser() {
    localStorage.removeItem(USER_KEY)
  },
  
  // 자동 로그인 여부 저장
  setRememberMe(remember) {
    localStorage.setItem(REMEMBER_ME_KEY, remember.toString())
  },
  
  // 자동 로그인 여부 확인
  getRememberMe() {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true'
  },
  
  // 자동 로그인 여부 삭제
  removeRememberMe() {
    localStorage.removeItem(REMEMBER_ME_KEY)
  },

  /**
   * 로그인 여부 확인
   */
  isAuthenticated() {
    return !!this.getToken()
  },
  
  /**
   * 로그아웃 (모든 정보 삭제)
   */
  logout() {
    this.removeToken()
    this.removeUser()
    this.removeRememberMe()
  }
}