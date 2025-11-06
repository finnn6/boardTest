import { useState, useEffect } from 'react'
import { Card, Button, Pagination, Spinner, Badge } from 'flowbite-react'
import { HiEye, HiCalendar, HiUser } from 'react-icons/hi'
import api from '../api/client'
import { useNavigate } from 'react-router-dom'


function PostList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const postsPerPage = 10
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts(currentPage)
  }, [currentPage])

  const fetchPosts = async (page) => {
    setLoading(true)
    try {
      const response = await api.get(`posts?page=${page}&limit=${postsPerPage}`).json()
      const postData = response.data

      const startIndex = (page - 1) * postsPerPage
      const endIndex = startIndex + postsPerPage
      const paginatedPosts = postData.slice(startIndex, endIndex)
      
      setPosts(paginatedPosts);
      setTotalPages(Math.ceil(postData.length / postsPerPage))
    } catch (error) {
      console.error('게시글 불러오기 실패:', error)
    } finally {
      setLoading(false)
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes}분 전`;
      }
      return `${hours}시간 전`;
    } else if (days < 7) {
      return `${days}일 전`;
    }
    return date.toLocaleDateString('ko-KR');
  };

  const handlePostClick = (postId) => {
    
    navigate(`/posts/${postId}`)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">게시글 목록</h1>
          <Button onClick={() => navigate('/write')}>
            글쓰기
          </Button>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePostClick(post.id)}
            >
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                    {post.title}
                  </h2>
                  {post.status === 'draft' && (
                    <Badge color="warning">임시저장</Badge>
                  )}
                </div>

                <p className="text-gray-600 line-clamp-2">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <HiUser className="w-4 h-4" />
                    <span>{post.author_name}</span>
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
              </div>
            </Card>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">게시글이 없습니다.</p>
            <Button className="mt-4" onClick={() => navigate('/write')}>
              첫 게시글 작성하기
            </Button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showIcons
              previousLabel="이전"
              nextLabel="다음"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PostList;