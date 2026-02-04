import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Tag, message, Popconfirm } from 'antd'
import { CheckOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons'
import { getGuestbook, updateGuestbookStatus } from '../services/api'

export default function Guestbook() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const res: any = await getGuestbook({ limit: 1000 })
      setMessages(res.data?.data || [])
    } catch (error) {
      message.error('加载留言失败')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number, status: string) => {
    try {
      await updateGuestbookStatus(id, { status })
      message.success(status === 'approved' ? '已通过审核' : '已取消审核')
      loadMessages()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      // 这里可以添加删除留言的API调用
      message.success('删除成功')
      loadMessages()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'guest_id', width: 60 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { 
      title: '内容', 
      dataIndex: 'message',
      ellipsis: true
    },
    { 
      title: '状态', 
      dataIndex: 'status',
      width: 100,
      render: (v: string) => v === 'approved' ? <Tag color="green">已通过</Tag> : <Tag color="orange">待审核</Tag>
    },
    {
      title: '操作',
      width: 250,
      render: (_: any, record: any) => (
        <div>
          {record.status !== 'approved' && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handleApprove(record.guest_id, 'approved')}>通过</Button>
          )}
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.guest_id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>留言管理</h2>
        <p style={{ color: '#666' }}>共 {messages.length} 条留言</p>
      </div>

      <Table
        rowKey="guest_id"
        columns={columns}
        dataSource={messages}
        loading={loading}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: 16, background: '#f5f5f5' }}>
              <p><strong>原留言：</strong></p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{record.message}</p>
            </div>
          )
        }}
      />


    </div>
  )
}
