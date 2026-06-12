import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.addEventListener('cilios-notification', (e) => {
  const { type, whatsapp, sms, message } = e.detail
  console.log('🔔 Notificação simulada:', { type, whatsapp, sms })
  console.log('📨 Mensagem:', message)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
