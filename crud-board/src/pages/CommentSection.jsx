import { useState, useEffect } from 'react'
import { Card, Button, Textarea, Spinner, Avatar } from 'flowbite-react'
import { HiTrash } from 'react-icons/hi2'
import api from "../api/client"

function CommentSection({ postId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const currentUserId = JSON.parse(localStorage.getItem('user_info') || '{}').userIdx

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await api.get(`posts/${postId}/comments`).json()
      setComments(response.data)
    } catch (error) {
      console.error('댓글 불러오기 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      alert('댓글 내용을 입력하세요.')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.post(`posts/${postId}/comments`, {
        json: { content: content.trim() }
      }).json()

      setComments([response.data, ...comments])
      setContent('')
      alert('댓글이 작성되었습니다.')

      await fetchComments()
    } catch (error) {
      console.error('댓글 작성 실패:', error)
      alert('댓글 작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    try {
      await api.delete(`comments/${commentId}`)
      setComments(comments.filter(c => c.id !== commentId))
      alert('댓글이 삭제되었습니다.')
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  const getUserName = (comment) => {
    return comment.user?.user_name || comment.user.user_name || '알 수 없음'
  }
  
  const getUserInitial = (comment) => {
    const name = getUserName(comment)
    return name[0] || 'U'
  }

  return (
    <Card className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">댓글 {comments.length}</h2>
      </div>

      <div className="mb-4 pb-4 border-b">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <Button color="blue" onClick={handleSubmit} disabled={submitting || !content.trim()}>
            {submitting ? '작성 중...' : '작성'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner size="lg" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          첫 댓글을 작성해보세요!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="border-b pb-3 last:border-b-0">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <Avatar
                    // placeholderInitials={comment.user?.user_name?.[0] || '?'}
                    placeholderInitials={getUserInitial(comment)}
                    rounded
                    size="sm"
                  />
                  <div>
                    {/* <p className="font-medium text-sm">{comment.user?.user_name}</p> */}
                    <p className="font-medium text-sm">{getUserName(comment)}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>
                </div>

                {currentUserId === comment.author_id && (
                  <Button
                    size="xs"
                    color="failure"
                    onClick={() => handleDelete(comment.id)}
                  >
                    <HiTrash className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <p className="text-gray-700 text-sm whitespace-pre-wrap ml-10">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default CommentSection