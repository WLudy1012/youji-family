import { Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="members" element={<Members />} />
        <Route path="members/:id" element={<MemberDetail />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:id" element={<ArticleDetail />} />
        <Route path="albums" element={<Albums />} />
        <Route path="albums/:id" element={<AlbumDetail />} />
        <Route path="guestbook" element={<Guestbook />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
