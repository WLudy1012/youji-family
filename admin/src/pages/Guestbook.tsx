import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Tag, message, Popconfirm } from 'antd'
import { CheckOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons'
import axios from 'axios'

export default function Guestbook() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [replyModalVisible, setReplyModalVisible] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const res: any = await axios.get('/api/admin/guestbook', { params: { limit: 1000 } })
      setMessages(res.data.data?.data || [])
    } catch (error) {
      message.error('加载留言失败')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number, isApproved: number) => {
    try {
      await axios.put(`/api/admin/guestbook/${id}/approve`, { is_approved: isApproved })
      message.success(isApproved ? '已通过审核' : '已取消审核')
      loadMessages()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleReply = (record: any) => {
    setSelectedMessage(record)
    form.setFieldsValue({ reply_content: record.reply_content })
    setReplyModalVisible(true)
  }

  const handleReplySubmit = async () => {
    try {
      const values = await form.validateFields()
      await axios.put(`/api/admin/guestbook/${selectedMessage.id}/reply`, values)
      message.success('回复成功')
      setReplyModalVisible(false)
      loadMessages()
    } catch (error) {
      message.error('回复失败')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/admin/guestbook/${id}`)
      message.success('删除成功')
      loadMessages()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '姓名', dataIndex: 'author_name', width: 100 },
    { 
      title: '内容', 
      dataIndex: 'content',
      ellipsis: true
    },
    { 
      title: '状态', 
      dataIndex: 'is_approved',
      width: 100,
      render: (v: number) => v ? <Tag color="green">已通过</Tag> : <Tag color="orange">待审核</Tag>
    },
    {
      title: '操作',
      width: 250,
      render: (_: any, record: any) => (
        <div>
          {!record.is_approved && (
            <Button type="link" icon={<CheckOutlined />} onClick={() => handleApprove(record.id, 1)}>通过</Button>
          )}
          {record.is_approved && (
            <Button type="link" onClick={() => handleApprove(record.id, 0)}>取消审核</Button>
          )}
          <Button type="link" icon={<MessageOutlined />} onClick={() => handleReply(record)}>回复</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
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
        rowKey="id"
        columns={columns}
        dataSource={messages}
        loading={loading}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: 16, background: '#f5f5f5' }}>
              <p><strong>留言内容：</strong></p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{record.content}</p>
              {record.reply_content && (
                <div style={{ marginTop: 16, padding: 12, background: '#e6f7ff', borderRadius: 4 }}>
                  <p><strong>管理员回复：</strong></p>
                  <p>{record.reply_content}</p>
                </div>
              )}
            </div>
          )
        }}
      />

      {/* 回复弹窗 */}
      <Modal
        title="回复留言"
        open={replyModalVisible}
        onOk={handleReplySubmit}
        onCancel={() => setReplyModalVisible(false)}
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
          <p><strong>原留言：</strong></p>
          <p>{selectedMessage?.content}</p>
        </div>
        <Form form={form} layout="vertical">
          <Form.Item name="reply_content" label="回复内容" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="请输入回复内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
