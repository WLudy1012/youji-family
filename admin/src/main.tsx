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
          colorPrimary: '#6b745d',
          colorInfo: '#6b745d',
          colorSuccess: '#86a174',
          colorWarning: '#c29b6a',
          colorError: '#ff7875',
          colorBgBase: '#f2ece1',
          colorTextBase: '#3c342c',
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
