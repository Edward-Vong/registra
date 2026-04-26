import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { checkBackendHealth, fetchArtworksByArtist } from '../api'
import { supabase } from '../supabase'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .dash { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 48px; border-bottom: 1px solid #e0ddd6; background: #F7F5F0; position: sticky; top: 0; z-index: 10; }
  .logo { font-family: 'DM Serif Display', serif; font-size: 20px; letter-spacing: -0.3px; color: #1a1a1a; cursor: pointer; }
  .logo span { color: #2D7A5A; }
  .btn-primary { background: #2D7A5A; color: #fff; border: none; padding: 8px 20px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .btn-primary:hover { background: #235f45; }
  .btn-outline { border: 1px solid #1a1a1a; background: transparent; padding: 8px 20px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; color: #1a1a1a; }
  .container { max-width: 1000px; margin: 0 auto; padding: 56px 24px; }
  .dash-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-bottom: 26px; }
  .dash-title { font-family: 'DM Serif Display', serif; font-size: 32px; letter-spacing: -0.5px; }
  .dash-sub { font-size: 13px; color: #777; margin-top: 6px; max-width: 560px; line-height: 1.6; }
  .identity-badge { display: inline-flex; align-items: center; gap: 6px; background: #efece5; color: #6d665d; font-size: 11px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e0ddd6; border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; margin-bottom: 40px; }
  .stat { background: #fff; padding: 24px 28px; }
  .stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .stat-value { font-family: 'DM Serif Display', serif; font-size: 36px; color: #1a1a1a; }
  .stat-note { font-size: 12px; color: #666; margin-top: 4px; }
  .stat-note.ok { color: #2D7A5A; }

  .top-tools { display: grid; grid-template-columns: 1.3fr 1fr; gap: 14px; margin-bottom: 28px; }
  .tool-card { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; padding: 16px 18px; }
  .tool-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .tool-title { font-size: 12px; color: #777; text-transform: uppercase; letter-spacing: 0.08em; }
  .system-pill { font-size: 11px; padding: 4px 10px; border-radius: 999px; font-weight: 500; }
  .system-pill.ok { background: #d1fae5; color: #065f46; }
  .system-pill.err { background: #fee2e2; color: #991b1b; }
  .tool-body { font-size: 13px; color: #666; line-height: 1.6; }

  .quick-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .quick-btn {
    border: 1px solid #1a1a1a;
    background: transparent;
    color: #1a1a1a;
    border-radius: 2px;
    padding: 7px 11px;
    font-size: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .quick-btn:hover { background: #1a1a1a; color: #F7F5F0; }

  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .section-title { font-size: 12px; font-weight: 500; color: #555; text-transform: uppercase; letter-spacing: 0.08em; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 48px; }
  .artwork-card { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; cursor: pointer; transition: transform 0.15s; }
  .artwork-card:hover { transform: translateY(-2px); }
  .thumb { height: 180px; position: relative; overflow: hidden; background: #efece5; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .thumb-fallback { width: 100%; height: 100%; }
  .thumb-1 { background: linear-gradient(135deg, #c8e6d4, #7bc4a0); }
  .thumb-2 { background: linear-gradient(135deg, #d4c8e6, #a07bc4); }
  .thumb-3 { background: linear-gradient(135deg, #e6d4c8, #c4a07b); }
  .thumb-4 { background: linear-gradient(135deg, #c8d4e6, #7ba0c4); }
  .thumb-5 { background: linear-gradient(135deg, #e6c8d4, #c47ba0); }
  .thumb-6 { background: linear-gradient(135deg, #d4e6c8, #a0c47b); }
  .badge { position: absolute; top: 8px; right: 8px; background: #2D7A5A; color: #fff; font-size: 10px; padding: 3px 9px; border-radius: 20px; }
  .badge.pending { background: #8a6d3b; }
  .badge.rejected { background: #c0392b; }
  .card-status { font-size: 11px; margin-top: 6px; }
  .card-status.pending { color: #8a6d3b; }
  .card-status.verified { color: #2D7A5A; }
  .card-status.rejected { color: #c0392b; }
  .card-body { padding: 14px 16px; }
  .card-title { font-size: 13px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px; }
  .card-date { font-size: 11px; color: #aaa; margin-bottom: 6px; }
  .card-hash { font-family: monospace; font-size: 10px; color: #bbb; }
  .card-actions { margin-top: 10px; }
  .card-action-btn {
    border: 1px solid #1a1a1a;
    background: #fff;
    color: #1a1a1a;
    border-radius: 2px;
    padding: 6px 10px;
    font-size: 11px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .card-action-btn:hover { background: #1a1a1a; color: #F7F5F0; }
  .tier-badge { display: inline-flex; align-items: center; gap: 6px; background: #e8f5ef; color: #2D7A5A; font-size: 12px; padding: 4px 12px; border-radius: 20px; font-weight: 500; }

  @media (max-width: 900px) {
    .top-tools { grid-template-columns: 1fr; }
    .grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 640px) {
    .stats { grid-template-columns: 1fr; }
    .grid { grid-template-columns: 1fr; }
  }
`

const thumbClasses = ['thumb-1', 'thumb-2', 'thumb-3', 'thumb-4', 'thumb-5', 'thumb-6']

function formatDate(value) {
  if (!value) return 'Unknown date'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function shortHash(hash) {
  if (!hash) return 'n/a'
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, username } = useAuth()
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [backendOnline, setBackendOnline] = useState(false)

  const verifiedCount = artworks.filter((a) => a.certificate_status === 'verified').length
  const pendingCount = artworks.filter((a) => a.certificate_status === 'pending').length
  const rejectedCount = artworks.filter((a) => a.certificate_status === 'rejected').length

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.id) return

      setLoading(true)
      setError(null)

      try {
        await checkBackendHealth()
        setBackendOnline(true)

        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token
        if (!accessToken) throw new Error('Not authenticated')

        const rows = await fetchArtworksByArtist(user.id, accessToken)
        setArtworks(Array.isArray(rows) ? rows : [])
      } catch (loadError) {
        setBackendOnline(false)
        setError(loadError.message || 'Failed to load your artworks.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.id])

  return (
    <>
      <style>{styles}</style>
      <div className="dash">
        <Navbar />
        <div className="container">
          <div className="dash-header">
            <div>
              <div className="dash-title">My portfolio</div>
              <div className="dash-sub">Track your certified artworks, monitor verification progress, and investigate potential reposts.</div>
            </div>
            <div className="identity-badge">@{username || user?.email?.split('@')[0] || 'artist'}</div>
          </div>

          <div className="top-tools">
            <div className="tool-card">
              <div className="tool-head">
                <div className="tool-title">System status</div>
                <div className={`system-pill ${backendOnline ? 'ok' : 'err'}`}>
                  {backendOnline ? 'Connected' : 'Unavailable'}
                </div>
              </div>
              <div className="tool-body">
                This checks whether the verification backend API is reachable right now. If it is offline, uploads and reverse search actions may fail.
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-title">Quick actions</div>
              <div className="quick-actions">
                <button className="quick-btn" onClick={() => navigate('/upload')}>Upload artwork</button>
                <button className="quick-btn" onClick={() => navigate('/gallery')}>Open gallery</button>
                <button className="quick-btn" onClick={() => navigate('/reversesearch')}>Reverse search page</button>
                <button className="quick-btn" onClick={() => navigate('/api')}>API docs</button>
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat-label">Registered works</div>
              <div className="stat-value">{artworks.length}</div>
              <div className="stat-note ok">total in your portfolio</div>
            </div>
            <div className="stat">
              <div className="stat-label">Verified</div>
              <div className="stat-value">{verifiedCount}</div>
              <div className="stat-note ok">publicly trusted pieces</div>
            </div>
            <div className="stat">
              <div className="stat-label">Needs attention</div>
              <div className="stat-value">{pendingCount + rejectedCount}</div>
              <div className="stat-note">{pendingCount} pending, {rejectedCount} rejected</div>
            </div>
          </div>

          <div className="section-header">
            <div className="section-title">Registered works</div>
            <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => navigate('/upload')}>+ add new</button>
          </div>

          {error && (
            <div style={{ marginBottom: '16px', fontSize: '13px', color: '#c0392b' }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ marginBottom: '16px', fontSize: '13px', color: '#777' }}>
              Loading artworks...
            </div>
          )}

          <div className="grid">
            {!loading && artworks.length === 0 && (
              <div style={{ gridColumn: '1 / -1', fontSize: '13px', color: '#777' }}>
                No artworks registered yet. Upload your first one.
              </div>
            )}

            {artworks.map((a, i) => (
              <div className="artwork-card" key={a.id || i} onClick={() => a.certificate_id && navigate(`/portfolio/${a.certificate_id}`)}>
                <div className="thumb">
                  {a.artwork_url ? (
                    <img src={a.artwork_url} alt={a.title || 'Artwork preview'} />
                  ) : (
                    <div className={`thumb-fallback ${thumbClasses[i % thumbClasses.length]}`} />
                  )}
                  <div className={`badge ${a.certificate_status === 'pending' ? 'pending' : a.certificate_status === 'rejected' ? 'rejected' : ''}`}>
                    {a.certificate_status === 'pending' ? 'pending' : a.certificate_status === 'rejected' ? 'rejected' : 'verified'}
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-title">{a.title}</div>
                  <div className="card-date">{formatDate(a.created_at)}</div>
                  <div className="card-hash">{shortHash(a.final_file_hash)}</div>
                  {a.certificate_status === 'pending' && <div className="card-status pending">Waiting to be verified by admin</div>}
                  {a.certificate_status === 'verified' && <div className="card-status verified">Verified and publicly trusted</div>}
                  {a.certificate_status === 'rejected' && <div className="card-status rejected">Rejected{a.certificate_rejection_reason ? `: ${a.certificate_rejection_reason}` : ''}</div>}

                  <div className="card-actions">
                    <button
                      className="card-action-btn"
                      onClick={(event) => {
                        event.stopPropagation()
                        navigate('/reversesearch', {
                          state: {
                            certificateId: a.certificate_id,
                            title: a.title || 'Untitled',
                            artworkUrl: a.artwork_url || null,
                          },
                        })
                      }}
                      disabled={!a.certificate_id}
                    >
                      reverse image search
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
