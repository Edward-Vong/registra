import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  .error { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; padding: 12px 14px; border-radius: 3px; margin-bottom: 16px; font-size: 13px; }
  .loading { color: #999; }
`

export default function ResetKey() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')
  const token = searchParams.get('token')

  useEffect(() => {
    const confirmReset = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Missing reset token. Check your email for the verification link.')
        return
      }

      try {
        const response = await fetch('http://localhost:5000/account/signing-key/reset-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await response.json()
        
        if (!response.ok) {
          setStatus('error')
          setMessage(data.error || 'Failed to reset signing key')
        } else {
          setStatus('success')
          setMessage(data.message)
        }
      } catch (err) {
        setStatus('error')
        setMessage(err.message || 'Network error')
      }
    }

    confirmReset()
  }, [token])

  return (
    <>
      <style>{styles}</style>
      <Navbar />
      <div className="page">
        <div className="container">
          <div className="card">
            {status === 'loading' && (
              <>
                <div className="loading icon">⏳</div>
                <h1 className="title">Resetting key...</h1>
                <p className="message loading">Please wait while we process your request.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="icon">✓</div>
                <h1 className="title">Key reset successful</h1>
                <p className="message">Your signing key has been reset.</p>
                <p className="message">On your next upload, a new key will be automatically registered.</p>
                <button className="btn" onClick={() => navigate('/upload')}>
                  Go to upload
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="icon">⚠️</div>
                <h1 className="title">Reset failed</h1>
                <div className="error">{message}</div>
                <button className="btn" onClick={() => navigate('/profile')}>
                  Back to profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
