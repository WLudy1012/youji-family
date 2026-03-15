import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Users, BookOpen, Image, MessageSquare, LogIn, Lock } from 'lucide-react'
import { getConfigs, getAnnouncements, getMembers, getArticles, getAlbums } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface HomeData {
  config: any
  announcements: any[]
  members: any[]
  articles: any[]
  albums: any[]
}

export default function Home() {
  const { isLoggedIn } = useAuth()
  const [data, setData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    try {
      setLoading(true)
      // 访客只加载配置和公告
      const requests: any[] = [getConfigs(), getAnnouncements({ limit: 3 })]
      
      // 登录后才加载其他数据
      if (isLoggedIn) {
        requests.push(
          getMembers({ limit: 6 }),
          getArticles({ limit: 3 }),
          getAlbums({ limit: 4 })
        )
      }

      const results = await Promise.all(requests)

      setData({
        config: (results[0] as any).data,
        announcements: (results[1] as any).data?.data || [],
        members: isLoggedIn ? (results[2] as any).data?.data || [] : [],
        articles: isLoggedIn ? (results[3] as any).data?.data || [] : [],
        albums: isLoggedIn ? (results[4] as any).data?.data || [] : []
      })
    } catch (error) {
      console.error('加载首页数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const config = data?.config
  const announcements = data?.announcements || []
  const members = data?.members || []
  const articles = data?.articles || []
  const albums = data?.albums || []

  return (
    <div className="space-y-16">
      {/* Hero区域 - 所有人可见 */}
      <section className="relative bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-2xl overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #c9a227 0%, transparent 50%), radial-gradient(circle at 80% 50%, #c9a227 0%, transparent 50%)'
          }} />
        </div>
        <div className="relative px-8 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {config?.home_banner_title || '由基家族'}
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8">
            {config?.home_banner_subtitle || '世代传承，薪火相传'}
          </p>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {config?.family_declaration || '传承家族文化，凝聚家族力量'}
          </p>
          
          {isLoggedIn ? (
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/members" className="btn btn-secondary">
                <Users className="w-5 h-5 mr-2" />
                查看族谱
              </Link>
              <Link to="/articles" className="btn bg-white/10 hover:bg-white/20 text-white">
                <BookOpen className="w-5 h-5 mr-2" />
                阅读文章
              </Link>
            </div>
          ) : (
            <div className="mt-10">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full text-white/80">
                <Lock className="w-4 h-4" />
                <span>登录后可查看完整内容</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 公告区域 - 所有人可见 */}
      {announcements.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="page-title mb-0">最新公告</h2>
            {isLoggedIn && (
              <Link to="/announcements" className="flex items-center text-[#1e3a5f] hover:text-[#c9a227]">
                查看全部 <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          <div className="space-y-4">
            {announcements.slice(0, isLoggedIn ? 3 : 1).map((item: any) => (
              <div key={item.id} className="card p-6 flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-[#c9a227] rounded-full flex items-center justify-center text-white font-bold">
                  公告
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 line-clamp-2">{item.content}</p>
                  <span className="text-sm text-gray-400 mt-2 block">
                    {new Date(item.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {!isLoggedIn && announcements.length > 1 && (
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">还有 {announcements.length - 1} 条公告，登录后查看</p>
            </div>
          )}
        </section>
      )}

      {/* 以下区域仅登录后可见 */}
      {isLoggedIn && (
        <>
          {/* 家族成员 */}
          {members.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="page-title mb-0">家族成员</h2>
                <Link to="/members" className="flex items-center text-[#1e3a5f] hover:text-[#c9a227]">
                  查看全部 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {members.map((member: any) => (
                  <Link key={member.id} to={`/members/${member.id}`} className="card group">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <Users className="w-16 h-16 text-gray-300" />
                      )}
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-semibold text-[#1e3a5f]">{member.name}</h3>
                      <p className="text-sm text-gray-500">{member.relation}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 家族文章 */}
          {articles.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="page-title mb-0">家族文章</h2>
                <Link to="/articles" className="flex items-center text-[#1e3a5f] hover:text-[#c9a227]">
                  查看全部 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {articles.map((article: any) => (
                  <Link key={article.id} to={`/articles/${article.id}`} className="card group">
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      {article.cover_image ? (
                        <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1e3a5f]/10">
                          <BookOpen className="w-12 h-12 text-[#1e3a5f]/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-[#c9a227] font-medium">{article.category}</span>
                      <h3 className="font-semibold text-[#1e3a5f] mt-1 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.summary}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 家族相册 */}
          {albums.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="page-title mb-0">家族相册</h2>
                <Link to="/albums" className="flex items-center text-[#1e3a5f] hover:text-[#c9a227]">
                  查看全部 <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {albums.map((album: any) => (
                  <Link key={album.id} to={`/albums/${album.id}`} className="card group">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {album.cover_image ? (
                        <img src={album.cover_image} alt={album.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1e3a5f]/10">
                          <Image className="w-12 h-12 text-[#1e3a5f]/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[#1e3a5f]">{album.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 留言板入口 */}
          <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] rounded-2xl p-8 text-white text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-[#c9a227]" />
            <h2 className="text-2xl font-bold mb-4">有话想说？</h2>
            <p className="text-white/70 mb-6">在家族留言板留下您的祝福和建议</p>
            <Link to="/guestbook" className="btn btn-secondary inline-flex">
              去留言
            </Link>
          </section>
        </>
      )}

      {/* 访客提示 */}
      {!isLoggedIn && (
        <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] rounded-2xl p-8 text-white text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-[#c9a227]" />
          <h2 className="text-2xl font-bold mb-4">更多内容等你探索</h2>
          <p className="text-white/70 mb-6">登录后可查看家族成员、文章、相册等完整内容</p>
          <Link to="/login" className="btn btn-secondary inline-flex">
            <LogIn className="w-5 h-5 mr-2" />
            立即登录
          </Link>
        </section>
      )}
    </div>
  )
}
