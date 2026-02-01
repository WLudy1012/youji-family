import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Eye, Calendar } from 'lucide-react'
import { getArticles } from '../services/api'

export default function Articles() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const res: any = await getArticles({ limit: 100 })
      setArticles(res.data?.data || [])
    } catch (error) {
      console.error('加载文章失败:', error)
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

  return (
    <div>
      <h1 className="page-title">家族文章</h1>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>暂无文章</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.id} to={`/articles/${article.id}`} className="card group">
              <div className="aspect-video bg-gray-100 overflow-hidden">
                {article.cover_image ? (
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1e3a5f]/10">
                    <BookOpen className="w-12 h-12 text-[#1e3a5f]/30" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="text-[#c9a227] font-medium">{article.category}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(article.published_at || article.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {article.view_count}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-[#1e3a5f] line-clamp-2 group-hover:text-[#c9a227] transition-colors">
                  {article.title}
                </h2>
                {article.summary && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{article.summary}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
