import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ChevronRight } from 'lucide-react'
import { getMembers, getFamilyTree } from '../services/api'

export default function Members() {
  const [members, setMembers] = useState<any[]>([])
  const [treeData, setTreeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('grid')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [membersRes, treeRes] = await Promise.all([
        getMembers({ limit: 100 }),
        getFamilyTree()
      ])

      setMembers((membersRes as any).data?.data || [])
      setTreeData((treeRes as any).data)
    } catch (error) {
      console.error('加载成员数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 按代数分组
  const groupedMembers = members.reduce((acc, member) => {
    const gen = member.generation
    if (!acc[gen]) acc[gen] = []
    acc[gen].push(member)
    return acc
  }, {} as Record<number, any[]>)

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">家族成员</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200'}`}
          >
            列表
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-4 py-2 rounded-lg ${viewMode === 'tree' ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200'}`}
          >
            族谱
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="space-y-8">
          {Object.entries(groupedMembers)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([generation, genMembers]) => (
              <div key={generation}>
                <h2 className="text-xl font-bold text-[#1e3a5f] mb-4 flex items-center">
                  <span className="w-8 h-8 bg-[#c9a227] text-white rounded-full flex items-center justify-center text-sm mr-3">
                    {generation}
                  </span>
                  第{generation}代
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {(genMembers as any[]).map((member) => (
                    <Link key={member.member_id} to={`/members/${member.member_id}`} className="card group">
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
              </div>
            ))}
        </div>
      ) : (
        <div className="card p-8">
          <FamilyTreeView data={treeData} />
        </div>
      )}
    </div>
  )
}

// 简化的族谱树形展示组件
function FamilyTreeView({ data }: { data: any }) {
  if (!data) return <div className="text-center text-gray-500">暂无族谱数据</div>

  const { members } = data

  // 按代数分组
  const byGeneration = members.reduce((acc: any, m: any) => {
    if (!acc[m.generation]) acc[m.generation] = []
    acc[m.generation].push(m)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.entries(byGeneration)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([gen, genMembers]: [string, any]) => (
          <div key={gen} className="relative">
            <div className="text-center mb-4">
              <span className="inline-block px-4 py-1 bg-[#1e3a5f] text-white rounded-full text-sm">
                第{gen}代
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {genMembers.map((member: any) => (
                <Link
                  key={member.member_id}
                  to={`/members/${member.member_id}`}
                  className="flex flex-col items-center p-4 bg-white border-2 border-[#1e3a5f]/20 rounded-xl hover:border-[#c9a227] transition-colors"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2 overflow-hidden">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <span className="font-medium text-[#1e3a5f]">{member.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
