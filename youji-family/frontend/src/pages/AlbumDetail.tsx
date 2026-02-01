import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Image, ChevronLeft } from 'lucide-react'
import { getAlbum } from '../services/api'

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>()
  const [album, setAlbum] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadAlbum()
  }, [id])

  const loadAlbum = async () => {
    try {
      setLoading(true)
      const res: any = await getAlbum(id!)
      if (res.success) {
        setAlbum(res.data)
      }
    } catch (error) {
      console.error('加载相册失败:', error)
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

  if (!album) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">相册不存在</p>
        <Link to="/albums" className="text-[#1e3a5f] hover:underline mt-4 inline-block">
          返回相册列表
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/albums" className="flex items-center text-[#1e3a5f] hover:text-[#c9a227] mb-6">
        <ChevronLeft className="w-5 h-5" />
        返回相册列表
      </Link>

      {/* 相册信息 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1e3a5f]">{album.name}</h1>
        {album.description && (
          <p className="text-gray-600 mt-2">{album.description}</p>
        )}
      </div>

      {/* 图片列表 */}
      {album.images?.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>相册暂无图片</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {album.images?.map((image: any) => (
            <div key={image.id} className="card overflow-hidden group">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={image.image_path}
                  alt={image.caption || ''}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform cursor-pointer"
                  onClick={() => window.open(image.image_path, '_blank')}
                />
              </div>
              {image.caption && (
                <div className="p-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
