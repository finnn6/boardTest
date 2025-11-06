import { useState } from 'react'
import { Card, Label, TextInput, Button } from 'flowbite-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    passwordConfirm: '',
    userName: ''
  })
  const [errors, setErrors] = useState({})

  // 정규식
  const regex = {
    userId: /^[a-z0-9]{5,20}$/,  // 영문 소문자+숫자, 5-20자
    password: /^.{1,20}$/,        // 최대 20자
    userName: /^[가-힣a-zA-Z0-9]{2,10}$/
  }

  // 에러 메시지
  const errorMessages = {
    userId: '아이디는 5-20자 영문 소문자/숫자만 가능합니다',
    password: '비밀번호는 최대 20자까지 가능합니다',
    passwordConfirm: '비밀번호가 일치하지 않습니다',
    userName: '별명은 2-10자 한글/영문/숫자만 가능합니다'
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    validateField(name, value)
  }

  const validateField = (name, value) => {
    let newErrors = { ...errors }

    if (name === 'userId' && !regex.userId.test(value)) {
      newErrors.userId = errorMessages.userId
    } else if (name === 'userId') {
      delete newErrors.userId
    }

    if (name === 'password' && !regex.password.test(value)) {
      newErrors.password = errorMessages.password
    } else if (name === 'password') {
      delete newErrors.password
      if (formData.passwordConfirm && value !== formData.passwordConfirm) {
        newErrors.passwordConfirm = errorMessages.passwordConfirm
      } else {
        delete newErrors.passwordConfirm
      }
    }

    if (name === 'passwordConfirm' && value !== formData.password) {
      newErrors.passwordConfirm = errorMessages.passwordConfirm
    } else if (name === 'passwordConfirm') {
      delete newErrors.passwordConfirm
    }

    if (name === 'userName' && !regex.userName.test(value)) {
      newErrors.userName = errorMessages.userName
    } else if (name === 'userName') {
      delete newErrors.userName
    }

    setErrors(newErrors)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    // 유효성 검사
    if (!regex.userId.test(formData.userId)) {
      newErrors.userId = errorMessages.userId
    }
    if (!regex.password.test(formData.password)) {
      newErrors.password = errorMessages.password
    }
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = errorMessages.passwordConfirm
    }
    if (!regex.userName.test(formData.userName)) {
      newErrors.userName = errorMessages.userName
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // API 요청
    try {
      const response = await api.post('signup', {
        json: {
          userId: formData.userId,
          password: formData.password,
          userName: formData.userName
        }
      }).json()

      console.log('회원가입 성공:', response)
      alert('회원가입 성공!')
      navigate('/login')

    } catch (error) {
      console.error('회원가입 실패:', error)

      // 에러 처리
      if (error.response) {
        const errorData = await error.response.json()

        // 400: 중복 아이디
        if (error.response.status === 400) {
          setErrors({ userId: errorData.detail || '이미 존재하는 아이디입니다' })
        }
        // 500: 서버 에러
        else if (error.response.status === 500) {
          alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        }
        // 기타 에러
        else {
          alert(errorData.detail || '회원가입에 실패했습니다.')
        }
      } else {
        // 네트워크 에러
        alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="mb-2">
              <Label htmlFor="userId" value="아이디" />
            </div>
            <TextInput
              id="userId"
              name="userId"
              type="text"
              placeholder="영문 소문자/숫자, 5-20자"
              value={formData.userId}
              onChange={handleChange}
              color={errors.userId ? 'failure' : 'gray'}
              helperText={errors.userId && <span className="text-red-600">{errors.userId}</span>}
              required
            />
          </div>

          <div>
            <div className="mb-2">
              <Label htmlFor="password" value="비밀번호" />
            </div>
            <TextInput
              id="password"
              name="password"
              type="password"
              placeholder="최대 20자"
              value={formData.password}
              onChange={handleChange}
              color={errors.password ? 'failure' : 'gray'}
              helperText={errors.password && <span className="text-red-600">{errors.password}</span>}
              required
            />
          </div>

          <div>
            <div className="mb-2">
              <Label htmlFor="passwordConfirm" value="비밀번호 확인" />
            </div>
            <TextInput
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={handleChange}
              color={errors.passwordConfirm ? 'failure' : 'gray'}
              helperText={errors.passwordConfirm && <span className="text-red-600">{errors.passwordConfirm}</span>}
              required
            />
          </div>

          <div>
            <div className="mb-2">
              <Label htmlFor="userName" value="별명" />
            </div>
            <TextInput
              id="userName"
              name="userName"
              type="text"
              placeholder="2-10자, 한글/영문/숫자"
              value={formData.userName}
              onChange={handleChange}
              color={errors.userName ? 'failure' : 'gray'}
              helperText={errors.userName && <span className="text-red-600">{errors.userName}</span>}
              required
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              type="submit"
              color="blue"
              className="flex-1"
              disabled={Object.keys(errors).length > 0}
            >
              가입하기
            </Button>
            <Button
              type="button"
              color="gray"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </form>

        <div className="text-center mt-4 text-sm">
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            로그인
          </a>
        </div>
      </Card>
    </div>
  )
}

export default Signup