import { useEffect } from 'react'
import { useAdmin } from '../../context/AdminContext'
import { logoutAdmin } from '../../api'
import A2_Dashboard from './A2_Dashboard'
import A3_AppointmentDetail from './A3_AppointmentDetail'
import A5_BlockDates from './A5_BlockDates'

export default function AdminPanel({ onLogout }) {
  const { isAuthenticated, setIsAuthenticated, adminView } = useAdmin()

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthenticated(true)
    }
  }, [isAuthenticated, setIsAuthenticated])

  const handleLogout = () => {
    logoutAdmin()
    setIsAuthenticated(false)
    onLogout()
  }

  switch (adminView) {
    case 'dashboard':
      return <A2_Dashboard onLogout={handleLogout} />
    case 'appointment-detail':
      return <A3_AppointmentDetail />
    case 'block-dates':
      return <A5_BlockDates />
    default:
      return <A2_Dashboard onLogout={handleLogout} />
  }
}
