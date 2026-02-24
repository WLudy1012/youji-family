import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Members from './pages/Members'
import MemberDetail from './pages/MemberDetail'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import Albums from './pages/Albums'
import AlbumDetail from './pages/AlbumDetail'
import Guestbook from './pages/Guestbook'
import Announcements from './pages/Announcements'
import NotFound from './pages/NotFound'
import Login from './pages/Login'

// 受保护的路由组件
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* 完整登录页面（用于聊天等需要强制登录的页面） */}
      <Route path="/login" element={<Login />} />
      
      {/* 主布局 */}
      <Route path="/" element={<Layout />}>
        {/* 首页 - 所有人可访问 */}
        <Route index element={<Home />} />
        
        {/* 以下页面需要登录 */}
        <Route 
          path="members" 
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="members/:id" 
          element={
            <ProtectedRoute>
              <MemberDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="articles" 
          element={
            <ProtectedRoute>
              <Articles />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="articles/:id" 
          element={
            <ProtectedRoute>
              <ArticleDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="albums" 
          element={
            <ProtectedRoute>
              <Albums />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="albums/:id" 
          element={
            <ProtectedRoute>
              <AlbumDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="announcements" 
          element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="guestbook" 
          element={
            <ProtectedRoute>
              <Guestbook />
            </ProtectedRoute>
          } 
        />
        
        {/* 404页面 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
