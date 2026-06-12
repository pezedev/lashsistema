import { createContext, useContext, useState, useCallback } from 'react'
import * as api from '../api'

const AdminContext = createContext()

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminView, setAdminView] = useState('dashboard')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [loginError, setLoginError] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (username, password) => {
    setLoading(true)
    setLoginError(null)
    try {
      const data = await api.loginUser(username, password)
      if (data.role === 'admin') {
        setIsAuthenticated(true)
        return { ok: true, role: 'admin' }
      }
      return { ok: true, role: 'client', client: data.client }
    } catch (err) {
      setLoginError(err.message || 'Erro ao autenticar.')
      return { ok: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    api.logoutAdmin()
    setIsAuthenticated(false)
    setAdminView('dashboard')
    setSelectedAppointment(null)
    setLoginError(null)
  }, [])

  const goTo = useCallback((view) => {
    setAdminView(view)
  }, [])

  const selectAppointment = useCallback((appt) => {
    setSelectedAppointment(appt)
    setAdminView('appointment-detail')
  }, [])

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    adminView,
    selectedAppointment,
    loginError,
    loading,
    login,
    logout,
    goTo,
    selectAppointment,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}
