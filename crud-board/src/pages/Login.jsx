import { useState } from 'react'
import { Card, Label, TextInput, Button, Checkbox } from 'flowbite-react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'
import { authService } from '../utils/auth'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    rememberMe: authService.getRememberMe()
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await api.post('login', {
        json: {
          userId: formData.userId,
          password: formData.password,
          rememberMe: formData.rememberMe
        }
      }).json()

      console.log('로그인 성공:', response)

      // 토큰과 사용자 정보 저장
      authService.setToken(response.access_token)
      authService.setUser(response.user)
      authService.setRememberMe(formData.rememberMe)

      alert(formData.rememberMe 
        ? '로그인 성공! (30일간 자동 로그인)' 
        : '로그인 성공! (24시간 유지)'
      )
      navigate('/')

    } catch (error) {
      console.error('로그인 실패:', error)

      // 에러 처리
      if (error.response) {
        const errorData = await error.response.json()
        setError(errorData.detail || '로그인에 실패했습니다.')
      } else {
        // 네트워크 에러
        alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
      }
    }

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">로그인</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 아이디 */}
          <div>
            <div className="mb-2">
              <Label htmlFor="userId" value="아이디" />
            </div>
            <TextInput
              id="userId"
              name="userId"
              type="text"
              placeholder="아이디를 입력하세요"
              value={formData.userId}
              onChange={handleChange}
              required
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <div className="mb-2">
              <Label htmlFor="password" value="비밀번호" />
            </div>
            <TextInput
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* 자동 로그인 & 비밀번호 찾기 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <Label htmlFor="rememberMe">자동 로그인</Label>
            </div>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              비밀번호 찾기
            </a>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col gap-2 mt-4">
            <Button type="submit" color="blue" className="w-full">
              로그인
            </Button>
            <Button
              type="button"
              color="gray"
              onClick={() => navigate('/')}
              className="w-full"
            >
              취소
            </Button>
          </div>
        </form>

        {/* 회원가입 링크 */}
        <div className="text-center mt-4 text-sm">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            회원가입
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default Login