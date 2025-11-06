import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import {
  Button,
  MegaMenu,
  MegaMenuDropdown,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react"
import { useAuth } from './hooks/useAuth'
import WritePost from './pages/WritePost'
import PostList from './pages/PostList'
import PostDetail from './pages/PostDetail'

function App() {
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <MegaMenu>
        <NavbarBrand href="/">
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">게시판</span>
        </NavbarBrand>
        <div className="order-2 hidden items-center md:flex gap-2">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-gray-700">
                {user?.userName}님
              </span>
              <Button color="light" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link to="/signup">
                <Button color="light">회원가입</Button>
              </Link>
              <Link to="login">
                <Button color="light">로그인</Button>
              </Link>
            </>
          )}
        </div>
        <NavbarToggle />
        <NavbarCollapse>
          <NavbarLink href="/posts">글 목록</NavbarLink>
          <NavbarLink href="/writePost">글 작성</NavbarLink>
        </NavbarCollapse>
      </MegaMenu>
      
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/writePost" element={<WritePost />} />
        <Route path="/" element={<PostList />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/posts/:postId" element={<PostDetail />} />
        <Route path="/posts/:postId/edit" element={<WritePost />} />
      </Routes>
    </>
  )
}

export default App
