import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: 'var(--primary)',
          colorInfo: 'var(--primary)',
          colorSuccess: 'var(--secondary)',
          colorWarning: 'var(--accent)',
          colorError: '#ff7875',
          colorBgBase: 'var(--background)',
          colorTextBase: 'var(--text)',
          borderRadius: 10
        }
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)
