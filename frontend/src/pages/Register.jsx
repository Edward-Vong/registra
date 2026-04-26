import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

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
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .error { font-size: 12px; color: #c0392b; background: #fdf0ef; border: 1px solid #f5c6c6; border-radius: 2px; padding: 10px 14px; margin-bottom: 16px; }
  .submit-btn { width: 100%; background: #2D7A5A; color: #fff; border: none; padding: 13px; border-radius: 2px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
  .submit-btn:hover { background: #235f45; }
  .auth-switch { font-size: 13px; color: #999; margin-top: 24px; text-align: center; }
  .auth-switch span { color: #2D7A5A; cursor: pointer; font-weight: 500; }
  .terms { font-size: 11px; color: #bbb; margin-top: 16px; text-align: center; line-height: 1.5; }
`

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', password: '' })
  const [error, setError] = useState(null)

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.username) { setError('Please fill in all required fields.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          username: form.username,
        }
      }
    })

    if (error) setError(error.message)
    else navigate('/dashboard')
  }

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-logo" onClick={() => navigate('/')}>Regist<span>ra</span></div>
          <div className="auth-left-quote">Join thousands of<br />artists who own<br /><em>their work.</em></div>
          <div className="auth-left-note">Free forever for independent creators</div>
        </div>
        <div className="auth-right">
          <div className="auth-form">
            <div className="auth-tag">Get started free</div>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-sub">Start certifying your art in under 2 minutes.</p>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleRegister}>
              <div className="form-row">
                <div className="form-group">
                  <label>First name</label>
                  <input type="text" placeholder="Jane" value={form.firstName} onChange={update('firstName')} />
                </div>
                <div className="form-group">
                  <label>Last name</label>
                  <input type="text" placeholder="Doe" value={form.lastName} onChange={update('lastName')} />
                </div>
              </div>
              <div className="form-group">
                <label>Username</label>
                <input type="text" placeholder="@yourname" value={form.username} onChange={update('username')} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="at least 6 characters" value={form.password} onChange={update('password')} />
              </div>
              <button className="submit-btn" type="submit">Create account →</button>
            </form>
            <div className="auth-switch">Already have an account? <span onClick={() => navigate('/login')}>Sign in</span></div>
            <div className="terms">By creating an account you agree to our Terms of Service and Privacy Policy.</div>
          </div>
        </div>
      </div>
    </>
  )
}
