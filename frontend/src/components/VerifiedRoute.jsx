import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function VerifiedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (!user.email_confirmed_at) return <Navigate to="/verify-email" />
  
  return children
}
