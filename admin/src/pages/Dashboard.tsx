import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { TeamOutlined, FileTextOutlined, PictureOutlined, MessageOutlined } from '@ant-design/icons'
import axios from 'axios'

export default function Dashboard() {
  const [stats, setStats] = useState({
    members: 0,
    articles: 0,
    albums: 0,
    messages: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // 并行加载统计数据
      const [membersRes, articlesRes, albumsRes, messagesRes] = await Promise.all([
        axios.get('/api/members', { params: { limit: 1 } }),
        axios.get('/api/articles', { params: { limit: 1 } }),
        axios.get('/api/albums', { params: { limit: 1 } }),
        axios.get('/api/admin/guestbook', { params: { limit: 1 } })
      ])

      setStats({
        members: membersRes.data.data?.pagination?.total || 0,
        articles: articlesRes.data.data?.pagination?.total || 0,
        albums: albumsRes.data.data?.pagination?.total || 0,
        messages: messagesRes.data.data?.pagination?.total || 0
      })
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>控制台</h2>
      
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="家族成员"
              value={stats.members}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1e3a5f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="文章数量"
              value={stats.articles}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="相册数量"
              value={stats.albums}
              prefix={<PictureOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="留言数量"
              value={stats.messages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }} title="欢迎使用由基家族管理后台">
        <p>在这里您可以：</p>
        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>管理家族成员信息和关系</li>
          <li>发布和编辑家族文章</li>
          <li>管理家族相册</li>
          <li>发布公告通知</li>
          <li>审核留言板内容</li>
          <li>配置站点信息</li>
        </ul>
      </Card>
    </div>
  )
}
