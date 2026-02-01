import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { getArticles, createArticle, updateArticle, deleteArticle } from '../services/api'

export default function Articles() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingArticle, setEditingArticle] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadArticles()
  }, [])

  const loadArticles = async () => {
    try {
      setLoading(true)
      const res: any = await getArticles({ limit: 1000 })
      setArticles(res.data?.data || [])
    } catch (error) {
      message.error('加载文章失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingArticle(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingArticle(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteArticle(id)
      message.success('删除成功')
      loadArticles()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()

      if (editingArticle) {
        await updateArticle(editingArticle.article_id, values)
        message.success('更新成功')
      } else {
        await createArticle(values)
        message.success('创建成功')
      }

      setModalVisible(false)
      loadArticles()
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'article_id', width: 60 },
    { title: '标题', dataIndex: 'title' },
    { title: '分类', dataIndex: 'category' },
    { 
      title: '状态', 
      dataIndex: 'status',
      render: (v: string) => v === 'published' ? <span style={{ color: '#52c41a' }}>已发布</span> : <span style={{ color: '#999' }}>草稿</span>
    },
    {
      title: '操作',
      width: 200,
      render: (_: any, record: any) => (
        <div>
          <Button type="link" icon={<EyeOutlined />} onClick={() => window.open(`/articles/${record.article_id}`, '_blank')}>查看</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.article_id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>文章管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>发布文章</Button>
      </div>

      <Table
        rowKey="article_id"
        columns={columns}
        dataSource={articles}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingArticle ? '编辑文章' : '发布文章'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input placeholder="家族历史" />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={2} placeholder="文章简介" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={10} placeholder="支持HTML格式" />
          </Form.Item>
          <Form.Item name="status" label="发布状态">
            <Select options={[{ label: '已发布', value: 'published' }, { label: '草稿', value: 'draft' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
