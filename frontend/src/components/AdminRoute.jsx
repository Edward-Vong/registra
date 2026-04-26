import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  if (!user.email_confirmed_at) return <Navigate to="/verify-email" replace />

  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return children
}
