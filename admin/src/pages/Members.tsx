import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Popconfirm, Switch, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons'
import api from '../services/api'

export default function Members() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [accountSaving, setAccountSaving] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [accountModalVisible, setAccountModalVisible] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [accountForm] = Form.useForm()

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/api/admin/members', { params: { limit: 1000 } })
      setMembers(res.data.data?.data || [])
    } catch (error) {
      message.error('加载成员失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingMember(null)
    form.resetFields()
    form.setFieldsValue({ is_public: true })
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingMember(record)
    form.setFieldsValue({
      ...record,
      birth_date: record.birth_date ? dayjs(record.birth_date) : null,
      death_date: record.death_date ? dayjs(record.death_date) : null,
      is_public: Boolean(record.is_public)
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/admin/members/${id}`)
      message.success('删除成功')
      loadMembers()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleCreateAccount = (record: any) => {
    setSelectedMemberId(record.id)
    accountForm.resetFields()
    setAccountModalVisible(true)
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const payload = {
        ...values,
        birth_date: values.birth_date?.format('YYYY-MM-DD'),
        death_date: values.death_date?.format('YYYY-MM-DD'),
        is_public: values.is_public ? 1 : 0
      }

      if (editingMember) {
        await api.put(`/api/admin/members/${editingMember.id}`, payload)
        message.success('更新成功')
      } else {
        await api.post('/api/admin/members', payload)
        message.success('创建成功')
      }

      setModalVisible(false)
      loadMembers()
    } catch (error) {
      if ((error as any)?.errorFields) {
        return
      }
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleAccountModalOk = async () => {
    try {
      const values = await accountForm.validateFields()
      setAccountSaving(true)
      await api.post(`/api/admin/members/${selectedMemberId}/account`, values)
      message.success('账号创建成功')
      setAccountModalVisible(false)
    } catch (error) {
      if ((error as any)?.errorFields) {
        return
      }
      message.error('账号创建失败')
    } finally {
      setAccountSaving(false)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '姓名', dataIndex: 'name' },
    { title: '代数', dataIndex: 'generation', width: 80 },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 80,
      render: (value: string) => (value === 'male' ? '男' : value === 'female' ? '女' : '-')
    },
    {
      title: '状态',
      dataIndex: 'is_public',
      width: 100,
      render: (value: number) => (value ? <Tag color="green">公开</Tag> : <Tag>私密</Tag>)
    },
    { title: '电话', dataIndex: 'phone' },
    { title: '邮箱', dataIndex: 'email' },
    {
      title: '操作',
      width: 250,
      render: (_: any, record: any) => (
        <div>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" icon={<UserAddOutlined />} onClick={() => handleCreateAccount(record)}>
            创建账号
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>成员管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加成员
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={members}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingMember ? '编辑成员' : '添加成员'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        confirmLoading={saving}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="generation" label="代数" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select options={[{ label: '男', value: 'male' }, { label: '女', value: 'female' }]} />
          </Form.Item>
          <Form.Item name="birth_date" label="出生日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="death_date" label="逝世日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input />
          </Form.Item>
          <Form.Item name="bio" label="简介">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="is_public" label="公开显示" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="创建登录账号"
        open={accountModalVisible}
        onOk={handleAccountModalOk}
        onCancel={() => setAccountModalVisible(false)}
        confirmLoading={accountSaving}
      >
        <Form form={accountForm} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
