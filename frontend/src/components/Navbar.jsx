import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  .navbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px; border-bottom: 1px solid #e0ddd6;
    background: #F7F5F0; position: sticky; top: 0; z-index: 10;
    font-family: 'DM Sans', sans-serif;
  }
  .nav-logo { font-family: 'DM Serif Display', serif; font-size: 20px; letter-spacing: -0.3px; color: #1a1a1a; cursor: pointer; }
  .nav-logo span { color: #2D7A5A; }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-link { font-size: 13px; color: #666; cursor: pointer; font-weight: 400; text-decoration: none; background: none; border: none; font-family: 'DM Sans', sans-serif; }
  .nav-link:hover { color: #1a1a1a; }
  .nav-user { display: inline-flex; align-items: center; gap: 10px; }
  .nav-avatar {
    width: 36px; height: 36px; border-radius: 999px; border: 1px solid #1a1a1a;
    background: linear-gradient(135deg, #f5eee0, #d7eadf); color: #1a1a1a;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
  }
  .nav-avatar:hover { transform: translateY(-1px); }
  .nav-btn-outline { border: 1px solid #1a1a1a; background: transparent; padding: 8px 20px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; color: #1a1a1a; }
  .nav-btn-outline:hover { background: #1a1a1a; color: #F7F5F0; }
  .nav-btn-primary { background: #2D7A5A; color: #fff; border: none; padding: 8px 20px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .nav-btn-primary:hover { background: #235f45; }
`

export default function Navbar({ rightExtra = null }) {
  const navigate = useNavigate()
  const { user, username, logout } = useAuth()
  const avatarText = (username || user?.email || 'U').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      // Keep UX simple for now; auth listener will still handle session changes.
    }
  }

  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate('/')}>Regist<span>ra</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/about')}>how it works</button>
          <button className="nav-link" onClick={() => navigate('/upload')}>upload</button>
          <button className="nav-link">api</button>

          {user ? (
            <>
              <div className="nav-user">
                <button
                  className="nav-avatar"
                  title={username || 'Profile settings'}
                  onClick={() => navigate('/profile')}
                >
                  {avatarText}
                </button>
              </div>
              <button className="nav-btn-outline" onClick={() => navigate('/dashboard')}>
                dashboard
              </button>
              <button className="nav-btn-outline" onClick={handleLogout}>
                logout
              </button>
            </>
          ) : (
            <>
              <button className="nav-btn-outline" onClick={() => navigate('/login')}>sign in</button>
              <button className="nav-btn-primary" onClick={() => navigate('/register')}>get started</button>
            </>
          )}

          {rightExtra}
        </div>
      </nav>
    </>
  )
}