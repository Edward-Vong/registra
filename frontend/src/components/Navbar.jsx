import { useEffect, useRef, useState } from 'react'
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
  .nav-logo {
    font-family: 'DM Serif Display', serif; font-size: 20px; letter-spacing: -0.3px;
    color: #1a1a1a; cursor: pointer;
    transition: transform 0.18s ease, color 0.18s ease;
  }
  .nav-logo span { color: #2D7A5A; }
  .nav-logo:hover { transform: scale(1.04); }

  .nav-links { display: flex; gap: 32px; align-items: center; }

  .nav-link {
    font-size: 13px; color: #666; cursor: pointer; font-weight: 400;
    text-decoration: none; background: none; border: none; font-family: 'DM Sans', sans-serif;
    transition: transform 0.18s ease, color 0.18s ease;
    transform-origin: center;
  }
  .nav-link:hover {
    color: #1a1a1a;
    transform: scale(1.08);
  }

  .nav-user { display: inline-flex; align-items: center; gap: 10px; }
  .nav-user-wrap { position: relative; }

  .nav-avatar {
    width: 36px; height: 36px; border-radius: 999px; border: 1px solid #1a1a1a;
    background: linear-gradient(135deg, #f5eee0, #d7eadf); color: #1a1a1a;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .nav-avatar:hover { transform: scale(1.08) translateY(-1px); }

  .nav-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    min-width: 190px;
    background: #fff;
    border: 1px solid #e0ddd6;
    border-radius: 4px;
    box-shadow: 0 10px 26px rgba(26, 26, 26, 0.1);
    padding: 8px;
    z-index: 20;
  }
  .nav-menu-item {
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    padding: 9px 10px;
    border-radius: 3px;
    font-size: 12px;
    color: #333;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .nav-menu-item:hover { background: #f5f3ee; }
  .nav-menu-user {
    padding: 9px 10px;
    font-size: 11px;
    color: #8a857b;
    border-bottom: 1px solid #efece6;
    margin-bottom: 4px;
  }
  .nav-menu-divider {
    height: 1px;
    background: #efece6;
    margin: 6px 0;
  }

  .nav-btn-outline {
    border: 1px solid #1a1a1a; background: transparent; padding: 8px 20px; border-radius: 2px;
    font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; color: #1a1a1a;
    transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease;
    transform-origin: center;
  }
  .nav-btn-outline:hover {
    background: #1a1a1a; color: #F7F5F0;
    transform: scale(1.06);
  }

  .nav-btn-primary {
    background: #2D7A5A; color: #fff; border: none; padding: 8px 20px; border-radius: 2px;
    font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: transform 0.18s ease, background 0.18s ease;
    transform-origin: center;
  }
  .nav-btn-primary:hover {
    background: #235f45;
    transform: scale(1.06);
  }
`

export default function Navbar({ rightExtra = null }) {
  const navigate = useNavigate()
  const { user, username, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const avatarText = (username || user?.email || 'U').slice(0, 2).toUpperCase()

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      // auth listener should still update UI
    }
  }

  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate('/')}>
          Regist<span>ra</span>
        </div>

        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate('/about')}>
            how it works
          </button>

          <button className="nav-link" onClick={() => navigate('/gallery')}>
            gallery
          </button>

          {user && (
            <>
              <button className="nav-link" onClick={() => navigate('/upload')}>
                upload
              </button>
              <button className="nav-link" onClick={() => navigate('/reversesearch')}>
                reverse search
              </button>
            </>
          )}

          <button className="nav-link" onClick={() => navigate('/api')}>
            api
          </button>

          {user ? (
            <>
              <button
                className="nav-btn-outline"
                onClick={() => navigate('/dashboard')}
              >
                dashboard
              </button>

              <div className="nav-user nav-user-wrap" ref={menuRef}>
                <button
                  className="nav-avatar"
                  title={username || 'Profile'}
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  {avatarText}
                </button>

                {menuOpen && (
                  <div className="nav-menu">
                    <div className="nav-menu-user">Signed in as @{username || user?.email?.split('@')[0] || 'artist'}</div>
                    <button
                      className="nav-menu-item"
                      onClick={() => {
                        setMenuOpen(false)
                        navigate(`/artist/${encodeURIComponent(username || user?.email?.split('@')[0] || 'artist')}`)
                      }}
                    >
                      public profile
                    </button>
                    <button
                      className="nav-menu-item"
                      onClick={() => {
                        setMenuOpen(false)
                        navigate('/profile')
                      }}
                    >
                      profile settings
                    </button>
                    <div className="nav-menu-divider" />
                    <button
                      className="nav-menu-item"
                      onClick={async () => {
                        setMenuOpen(false)
                        await handleLogout()
                      }}
                    >
                      logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="nav-btn-outline" onClick={() => navigate('/login')}>
                sign in
              </button>
              <button className="nav-btn-primary" onClick={() => navigate('/register')}>
                get started
              </button>
            </>
          )}

          {rightExtra}
        </div>
      </nav>
    </>
  )
}
