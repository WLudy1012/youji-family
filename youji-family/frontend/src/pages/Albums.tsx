import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image } from 'lucide-react'
import { getAlbums } from '../services/api'

export default function Albums() {
  const [albums, setAlbums] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlbums()
  }, [])

  const loadAlbums = async () => {
    try {
      setLoading(true)
      const res: any = await getAlbums({ limit: 100 })
      setAlbums(res.data?.data || [])
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

  return (
    <div>
      <h1 className="page-title">家族相册</h1>

      {albums.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>暂无相册</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link key={album.id} to={`/albums/${album.id}`} className="card group">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {album.cover_image ? (
                  <img
                    src={album.cover_image}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1e3a5f]/10">
                    <Image className="w-12 h-12 text-[#1e3a5f]/30" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-[#1e3a5f] group-hover:text-[#c9a227] transition-colors">
                  {album.name}
                </h2>
                {album.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{album.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
