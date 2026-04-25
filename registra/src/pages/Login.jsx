import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .auth-page { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; display: grid; grid-template-columns: 1fr 1fr; }
  .auth-left { padding: 48px; display: flex; flex-direction: column; justify-content: space-between; background: #1a1a1a; }
  .auth-left-logo { font-family: 'DM Serif Display', serif; font-size: 20px; color: #F7F5F0; cursor: pointer; }
  .auth-left-logo span { color: #2D7A5A; }
  .auth-left-quote { font-family: 'DM Serif Display', serif; font-size: 32px; color: #F7F5F0; line-height: 1.2; letter-spacing: -0.5px; }
  .auth-left-quote em { color: #7bc4a0; font-style: italic; }
  .auth-left-note { font-size: 12px; color: #555; }
  .auth-right { padding: 48px; display: flex; align-items: center; justify-content: center; }
  .auth-form { width: 100%; max-width: 360px; }
  .auth-tag { font-size: 11px; color: #2D7A5A; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
  .auth-title { font-family: 'DM Serif Display', serif; font-size: 30px; letter-spacing: -0.5px; margin-bottom: 8px; }
  .auth-sub { font-size: 13px; color: #999; margin-bottom: 36px; font-weight: 300; }
  .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .form-group label { font-size: 12px; color: #777; }
  .form-group input { font-size: 14px; padding: 11px 14px; border-radius: 2px; border: 1px solid #d8d5ce; background: #fff; color: #1a1a1a; font-family: 'DM Sans', sans-serif; outline: none; }
  .form-group input:focus { border-color: #2D7A5A; }
  .error { font-size: 12px; color: #c0392b; background: #fdf0ef; border: 1px solid #f5c6c6; border-radius: 2px; padding: 10px 14px; margin-bottom: 16px; }
  .submit-btn { width: 100%; background: #2D7A5A; color: #fff; border: none; padding: 13px; border-radius: 2px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
  .submit-btn:hover { background: #235f45; }
  .auth-switch { font-size: 13px; color: #999; margin-top: 24px; text-align: center; }
  .auth-switch span { color: #2D7A5A; cursor: pointer; font-weight: 500; }
  .divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
  .divider-line { flex: 1; height: 1px; background: #e0ddd6; }
  .divider-text { font-size: 11px; color: #ccc; }
`

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleLogin = (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    // TODO: wire up Supabase auth
    navigate('/dashboard')
  }

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-logo" onClick={() => navigate('/')}>Regist<span>ra</span></div>
          <div className="auth-left-quote">Your art.<br /><em>Your proof.</em><br />Forever on record.</div>
          <div className="auth-left-note">Art certification authority — est. 2026</div>
        </div>
        <div className="auth-right">
          <div className="auth-form">
            <div className="auth-tag">Welcome back</div>
            <h1 className="auth-title">Sign in</h1>
            <p className="auth-sub">Access your verified portfolio and certifications.</p>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button className="submit-btn" type="submit">Sign in →</button>
            </form>
            <div className="auth-switch">No account? <span onClick={() => navigate('/register')}>Create one free</span></div>
          </div>
        </div>
      </div>
    </>
  )
}
