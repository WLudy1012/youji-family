import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Upload, message, Popconfirm, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import api from '../services/api'

export default function Albums() {
  const [albums, setAlbums] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<any>(null)
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadAlbums()
  }, [])

  const loadAlbums = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/api/albums', { params: { limit: 1000 } })
      setAlbums(res.data.data?.data || [])
    } catch (error) {
      message.error('加载相册失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingAlbum(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingAlbum(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/admin/albums/${id}`)
      message.success('删除成功')
      loadAlbums()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleView = async (record: any) => {
    try {
      const res: any = await api.get(`/api/albums/${record.id}`)
      setSelectedAlbum(res.data.data)
      setDetailModalVisible(true)
    } catch (error) {
      message.error('加载相册详情失败')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()

      if (editingAlbum) {
        await api.put(`/api/admin/albums/${editingAlbum.id}`, values)
        message.success('更新成功')
      } else {
        await api.post('/api/admin/albums', values)
        message.success('创建成功')
      }

      setModalVisible(false)
      loadAlbums()
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    { 
      title: '封面', 
      dataIndex: 'cover_image',
      width: 100,
      render: (url: string) => url ? <Image src={url} width={80} height={60} style={{ objectFit: 'cover' }} /> : '-'
    },
    { title: '名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '操作',
      width: 200,
      render: (_: any, record: any) => (
        <div>
          <Button type="link" onClick={() => handleView(record)}>管理图片</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>相册管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>创建相册</Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={albums}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* 相册表单弹窗 */}
      <Modal
        title={editingAlbum ? '编辑相册' : '创建相册'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="相册名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="相册描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="cover_image" label="封面图片">
            <Input placeholder="图片URL" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 相册详情弹窗 */}
      <Modal
        title={selectedAlbum?.name}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        <p>{selectedAlbum?.description}</p>
        <Upload.Dragger
          name="image"
          multiple
          action="/api/admin/upload/image"
          headers={{ Authorization: `Bearer ${localStorage.getItem('admin_token')}` }}
          onChange={(info) => {
            if (info.file.status === 'done') {
              message.success(`${info.file.name} 上传成功`)
              // 添加到相册
              api.post(`/api/admin/albums/${selectedAlbum.id}/images`, {
                image_path: info.file.response.data.url
              })
            }
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
        </Upload.Dragger>
        
        <div style={{ marginTop: 16 }}>
          <h4>相册图片</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {selectedAlbum?.images?.map((img: any) => (
              <Image key={img.id} src={img.image_path} width={120} height={120} style={{ objectFit: 'cover' }} />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
