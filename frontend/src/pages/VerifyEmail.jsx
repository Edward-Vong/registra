import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .page { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }
  .container { max-width: 600px; margin: 80px auto; padding: 48px 24px; }
  .card { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; padding: 36px; text-align: center; }
  .title { font-family: 'DM Serif Display', serif; font-size: 32px; letter-spacing: -0.4px; margin-bottom: 16px; }
  .message { font-size: 15px; color: #666; line-height: 1.6; margin-bottom: 24px; }
  .icon { font-size: 48px; margin-bottom: 16px; }
  .btn { background: #2D7A5A; color: #fff; border: none; padding: 12px 24px; border-radius: 2px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 16px; }
  .btn:hover { background: #235f45; }
  .email { font-weight: 600; }
  .check-email-hint { font-size: 13px; color: #999; margin-top: 12px; }
  .logout-btn { background: transparent; border: 1px solid #1a1a1a; color: #1a1a1a; padding: 10px 18px; margin-top: 24px; }
  .logout-btn:hover { background: #f5f3ee; }
`

export default function VerifyEmail() {
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')
  const [checkingStatus, setCheckingStatus] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.email_confirmed_at) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Poll for email verification
  useEffect(() => {
    const interval = setInterval(async () => {
      setCheckingStatus(true)
      try {
        const { data: { user: updatedUser } } = await supabase.auth.getUser()
        if (updatedUser?.email_confirmed_at) {
          setMessage('Email verified! Redirecting...')
          await refreshUser()
          setTimeout(() => navigate('/dashboard'), 1000)
        }
      } catch (err) {
        console.error('Error checking verification status:', err)
      }
      setCheckingStatus(false)
    }, 3000)

    return () => clearInterval(interval)
  }, [navigate, refreshUser])

  const handleResendEmail = async () => {
    setResending(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.resendEnrollmentEmail(user.email)
      if (error) throw error
      setMessage('Verification email resent! Check your inbox.')
    } catch (err) {
      setMessage(err.message || 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="card">
            <div className="icon">✉️</div>
            <h1 className="title">Verify your email</h1>
            <p className="message">
              We sent a verification link to <span className="email">{user?.email}</span>
            </p>
            <p className="message">
              Click the link in the email to verify your account and get started.
            </p>
            <p className="check-email-hint">
              {checkingStatus ? 'Checking for verification...' : 'We\'re checking automatically — no need to refresh.'}
            </p>
            
            {message && (
              <div style={{ fontSize: '13px', color: message.includes('resent') ? '#235f45' : '#c0392b', marginBottom: '16px' }}>
                {message}
              </div>
            )}

            <button className="btn" onClick={handleResendEmail} disabled={resending}>
              {resending ? 'Resending...' : 'Resend verification email'}
            </button>

            <button className="btn logout-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
