import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BookOpen, Eye, Calendar, ChevronLeft, User } from 'lucide-react'
import { getArticle } from '../services/api'

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadArticle()
  }, [id])

  const loadArticle = async () => {
    try {
      setLoading(true)
      const res: any = await getArticle(id!)
      if (res.success) {
        setArticle(res.data)
      }
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

  if (!article) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">文章不存在</p>
        <Link to="/articles" className="text-[#1e3a5f] hover:underline mt-4 inline-block">
          返回文章列表
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/articles" className="flex items-center text-[#1e3a5f] hover:text-[#c9a227] mb-6">
        <ChevronLeft className="w-5 h-5" />
        返回文章列表
      </Link>

      <article className="card overflow-hidden">
        {/* 封面 */}
        {article.cover_image && (
          <div className="aspect-video w-full">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 内容 */}
        <div className="p-8">
          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="px-3 py-1 bg-[#c9a227]/20 text-[#c9a227] rounded-full">
              {article.category}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(article.published_at || article.created_at).toLocaleDateString('zh-CN')}
            </span>
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {article.view_count} 阅读
            </span>
          </div>

          {/* 标题 */}
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-6">{article.title}</h1>

          {/* 摘要 */}
          {article.summary && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-gray-600 italic">
              {article.summary}
            </div>
          )}

          {/* 正文 */}
          <div
            className="prose prose-lg max-w-none prose-headings:text-[#1e3a5f] prose-a:text-[#c9a227]"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>
    </div>
  )
}
