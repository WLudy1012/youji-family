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
          colorPrimary: '#4ecdc4',
          colorInfo: '#4ecdc4',
          colorSuccess: '#45b7d1',
          colorWarning: '#f9c80e',
          colorError: '#ff7875',
          colorBgBase: '#f7f9fc',
          colorTextBase: '#2f3b4a',
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
