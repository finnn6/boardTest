import { useState, useEffect } from 'react'
import { Card, Button, Spinner, Badge, Avatar } from 'flowbite-react'
import { HiEye, HiCalendar, HiPencil, HiTrash, HiArrowLeft } from 'react-icons/hi2'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { useRef } from 'react'
import CommentSection from './CommentSection'
import AttachmentSection from './AttachmentSection'

function PostDetail() {
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthor, setIsAuthor] = useState(false)
  const [files, setFiles] = useState([])
  const { postId } = useParams()
  const hasFetched = useRef(false) // 개발모드에서도 조회수 2번 증가시키지 않으려고
  
  useEffect(() => {
    if (hasFetched.current) return

    fetchPost()
    hasFetched.current = true
  }, [])

  const fetchPost = async () => {
    setLoading(true)
    try {
      // 실제 API 호출
      const response = await api.get(`posts/${postId}`).json()

      const responseData = response.data
      const responseObj = {
        id: postId,
        title: responseData.title,
        content: responseData.content,
        author_id: responseData.author_id,
        author_name: responseData.users.user_name,
        view_count: responseData.view_count,
        status: responseData.status,
        created_at: responseData.created_at,
        updated_at: responseData.updated_at
      }
      
      setPost(responseObj)
      
      // 이미지 파일 가져오기
      try {
        const filesResponse = await api.get(`posts/${postId}/files`).json()
        if (filesResponse.data && Array.isArray(filesResponse.data)) {
          setFiles(filesResponse.data)
        }
      } catch (error) {
        console.error('이미지 불러오기 실패:', error)
        // 이미지 없어도 게시글은 표시
      }

      // 현재 로그인한 사용자가 작성자인지 확인
      const currentUserId = localStorage.getItem('user_info')
      setIsAuthor(JSON.parse(currentUserId)['userIdx'] === responseObj.author_id)
      
    } catch (error) {
      console.error('게시글 불러오기 실패:', error)
      alert('게시글을 불러올 수 없습니다.')
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/posts/${postId}/edit`)
  };

  const handleDelete = async () => {
    if (!confirm('정말로 삭제하시겠습니까?')) return
    
    try {
      await api.delete(`posts/${postId}`)
      alert('게시글이 삭제되었습니다.')
      navigate('/posts')
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  const handleBack = () => {
    window.history.back();
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <p className="text-xl text-gray-600">게시글을 찾을 수 없습니다.</p>
        <Button onClick={handleBack}>목록으로 돌아가기</Button>
      </div>
    );
  }

  const imageFiles = files.filter(file => file.file_type === 'image')
  const documentFiles = files.filter(file => file.file_type === 'document')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button color="gray" onClick={handleBack} className="mb-4">
          <HiArrowLeft className="mr-2 h-5 w-5" />
          목록으로
        </Button>

        <Card>
          <div className="space-y-4">
            {/* 헤더 */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-start mb-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {post.title}
                </h1>
                {post.status === 'draft' && (
                  <Badge color="warning">임시저장</Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Avatar
                      placeholderInitials={post.author_name[0]}
                      rounded
                      size="sm"
                    />
                    <span className="font-medium">{post.author_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HiCalendar className="w-4 h-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HiEye className="w-4 h-4" />
                    <span>{post.view_count.toLocaleString()}</span>
                  </div>
                </div>

                {isAuthor && (
                  <div className="flex gap-2">
                    <Button size="sm" color="gray" onClick={handleEdit}>
                      <HiPencil className="mr-2 h-4 w-4" />
                      수정
                    </Button>
                    <Button size="sm" color="failure" onClick={handleDelete}>
                      <HiTrash className="mr-2 h-4 w-4" />
                      삭제
                    </Button>
                  </div>
                )}
              </div>

              {post.updated_at !== post.created_at && (
                <p className="text-xs text-gray-500 mt-2">
                  수정됨: {formatDate(post.updated_at)}
                </p>
              )}
            </div>

            {/* 본문 */}
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {post.content}
              </div>
            </div>

            <AttachmentSection files={files} />
          </div>
        </Card>

        {/* 댓글 영역 */}
        <div>
          <CommentSection postId={postId} />
        </div>
      </div>
    </div>
  );
}

export default PostDetail