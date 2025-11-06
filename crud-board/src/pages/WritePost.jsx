import { useEffect, useState } from 'react'
import {
  Button,
  Label,
  TextInput,
  Textarea,
  Card,
  Select,
  FileInput
} from 'flowbite-react'
import api from '../api/client'
import { useNavigate, useParams } from 'react-router-dom'

function WritePost() {
  const navigate = useNavigate()
  const { postId } = useParams() // 아이디 있으면 수정모드
  const isEditMode = !!postId

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    viewCount: 0,
    isDeleted: false,
    status: '',
    image: null
  })

  // 수정일 때 기존 데이터 불러오기
  useEffect(() => {
    if (isEditMode) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const response = await api.get(`posts/${postId}`).json()
      setFormData({
        title: response.data.title,
        content: response.data.content,
        status: response.data.status
      })
    } catch (error) {
      console.error('게시글 불러오기 실패', error)
      navigate('/posts')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('content', formData.content)
      submitData.append('status', 'published')

      if (formData.image) {
        submitData.append('image', formData.image)
      }

      if (isEditMode) {
        await api.put(`posts/${postId}`, { body: submitData })
        alert('글이 수정되었습니다.')
      } else {
        await api.post(`write`, { body: submitData })
      }
      navigate('/posts')
    } catch (error) {
      console.error('글쓰기 실패:', error)
    }
  }

  const handleDraft = async (e) => {
    e.preventDefault()

    try {
      if (isEditMode) {
        await api.put(`posts/${postId}`, {
          json: {
            title: formData.title,
            content: formData.content,
            status: 'draft'
          }
        })
      } else {
        const response = await api.post('write', {
          json: {
            title: formData.title,
            content: formData.content,
            status: 'draft',
          }
        }).json()
      }

      alert('임시 저장 완료')

    } catch (error) {
      console.error('임시저장 실패:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {isEditMode ? '글 수정' : '글 작성'}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <Label htmlFor="title" value="제목" className="mb-2 block" />
              <TextInput
                id="title"
                name="title"
                type="text"
                placeholder="제목을 입력하세요"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="content" value="내용" className="mb-2 block" />
              <Textarea
                id="content"
                name="content"
                placeholder="내용을 입력하세요"
                value={formData.content}
                onChange={handleChange}
                required
                rows={12}
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <Label htmlFor="image" value="대표 이미지" className="mb-2 block" />
              <FileInput
                id="image"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                helperText="JPG, PNG, GIF 형식의 이미지를 업로드할 수 있습니다"
              />
              {formData.image && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="미리보기"
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm text-gray-600">{formData.image.name}</p>
                    <p className="text-xs text-gray-500">
                      {(formData.image.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 justify-end">
              <Button color="gray" onClick={handleDraft} type="button">
                임시저장
              </Button>
              <Button color="blue" onClick={handleSubmit}>
                {isEditMode ? '수정하기' : '작성하기'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default WritePost