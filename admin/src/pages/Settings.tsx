import { useEffect, useState } from 'react'
import { Form, Input, Button, message, Card, Tabs, Spin } from 'antd'
import api from '../services/api'

export default function Settings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const res: any = await api.get('/api/admin/configs')
      if (res.data.success) {
        form.setFieldsValue(res.data.data)
      }
    } catch (error) {
      message.error('加载配置失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const values = await form.validateFields()
      await api.put('/api/admin/configs', values)
      message.success('保存成功')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const items = [
    {
      key: 'basic',
      label: '基本设置',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item name="site_name" label="站点名称" rules={[{ required: true }]}>
            <Input placeholder="由基家族" />
          </Form.Item>
          <Form.Item name="site_description" label="站点描述">
            <Input.TextArea rows={2} placeholder="站点描述，用于SEO" />
          </Form.Item>
          <Form.Item name="site_keywords" label="SEO关键词">
            <Input placeholder="关键词1,关键词2,关键词3" />
          </Form.Item>
          <Form.Item name="site_logo" label="站点LOGO">
            <Input placeholder="/uploads/logo.png" />
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'home',
      label: '首页设置',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item name="home_banner_title" label="首页横幅标题">
            <Input placeholder="由基家族" />
          </Form.Item>
          <Form.Item name="home_banner_subtitle" label="首页横幅副标题">
            <Input placeholder="世代传承，薪火相传" />
          </Form.Item>
          <Form.Item name="family_declaration" label="家族宣言">
            <Input.TextArea rows={2} placeholder="传承家族文化，凝聚家族力量" />
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'contact',
      label: '联系信息',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item name="contact_email" label="联系邮箱">
            <Input placeholder="contact@youji-family.com" />
          </Form.Item>
          <Form.Item name="contact_phone" label="联系电话">
            <Input placeholder="13800138000" />
          </Form.Item>
          <Form.Item name="icp_number" label="ICP备案号">
            <Input placeholder="京ICP备XXXXXXXX号" />
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'footer',
      label: '页脚设置',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item name="footer_copyright" label="版权信息">
            <Input placeholder="© 2024 由基家族 版权所有" />
          </Form.Item>
        </Form>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>系统设置</h2>
        <Button type="primary" loading={saving} onClick={handleSave}>保存设置</Button>
      </div>

      <Card>
        <Spin spinning={loading}>
          <Tabs items={items} />
        </Spin>
      </Card>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button type="primary" size="large" loading={saving} onClick={handleSave}>
          保存所有设置
        </Button>
      </div>
    </div>
  )
}
