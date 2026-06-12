import { useState, useEffect, useCallback } from 'react'
import { BookingProvider, useBooking } from './context/BookingContext'
import { AdminProvider } from './context/AdminContext'
import UnifiedLogin from './components/UnifiedLogin'
import ClientFlow from './components/client/ClientFlow'
import AdminPanel from './components/admin/AdminPanel'
import Logo from './components/ui/Logo'
import Button from './components/ui/Button'

const SESSION_KEY = 'cilios_session'

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function saveSession(data) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(data)) } catch {}
}
function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch {}
}

function getRoute() {
  return window.location.hash.replace('#', '') || '/'
}

function AppContent() {
  const { initializeFromLogin } = useBooking()
  const [route, setRoute] = useState(() => getRoute())
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState('login')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  useEffect(() => {
    const onHash = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    const saved = loadSession()
    if (saved) {
      if (saved.mode === 'admin') {
        setMode('admin')
        setReady(true)
        if (getRoute() !== '/lashadmin') {
          window.location.hash = '#/lashadmin'
        }
        return
      }
      if (saved.mode === 'client' && saved.clientName) {
        setClientName(saved.clientName)
        setClientPhone(saved.clientPhone || '')
        initializeFromLogin()
        setMode('client')
      }
    }
    setReady(true)
  }, [initializeFromLogin])

  const handleLogin = useCallback(async (type, name, phone) => {
    if (type === 'client') {
      setClientName(name || '')
      setClientPhone(phone || '')
      saveSession({ mode: 'client', clientName: name || '', clientPhone: phone || '' })
      initializeFromLogin()
      setMode('client')
    } else if (type === 'admin') {
      saveSession({ mode: 'admin' })
      window.location.hash = '#/lashadmin'
    }
  }, [initializeFromLogin])

  const handleLogout = useCallback(() => {
    clearSession()
    setClientName('')
    setMode('login')
    window.location.hash = '#/'
  }, [])

  if (!ready) {
    return (
      <div className="min-h-dvh bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (route === '/lashadmin') {
    if (mode !== 'admin') {
      const saved = loadSession()
      if (saved?.mode === 'admin') {
        setMode('admin')
        return (
          <div className="min-h-dvh bg-cream flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
          </div>
        )
      }
      return (
        <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-6 animate-fade-in">
          <Logo size="md" className="mb-8" />
          <div className="bg-white rounded-2xl border border-border p-8 max-w-sm w-full text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-error-light flex items-center justify-center">
              <svg className="w-7 h-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 className="font-serif text-xl text-graphite mb-2">Acesso Restrito</h2>
            <p className="text-sm text-warm-gray leading-relaxed mb-8">
              Você precisa estar logado como administradora para acessar esta página.
            </p>
            <Button onClick={() => { window.location.hash = '#/' }} size="md" className="w-full">
              Voltar ao Login
            </Button>
          </div>
        </div>
      )
    }
    return <AdminPanel onLogout={handleLogout} />
  }

  if (mode === 'admin') {
    return (
      <div className="min-h-dvh bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (mode === 'client') {
    return <ClientFlow clientName={clientName} clientPhone={clientPhone} onLogout={handleLogout} />
  }

  return <UnifiedLogin onLogin={handleLogin} />
}

export default function App() {
  return (
    <BookingProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </BookingProvider>
  )
}
