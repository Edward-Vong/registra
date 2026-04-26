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
  .dash-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
  .dash-title { font-family: 'DM Serif Display', serif; font-size: 32px; letter-spacing: -0.5px; }
  .dash-sub { font-size: 13px; color: #999; margin-top: 6px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e0ddd6; border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; margin-bottom: 40px; }
  .stat { background: #fff; padding: 24px 28px; }
  .stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .stat-value { font-family: 'DM Serif Display', serif; font-size: 36px; color: #1a1a1a; }
  .stat-note { font-size: 12px; color: #2D7A5A; margin-top: 4px; }
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
  .api-box { background: #1a1a1a; border-radius: 4px; padding: 28px 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
  .api-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .api-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #F7F5F0; margin-bottom: 10px; }
  .api-sub { font-size: 13px; color: #777; line-height: 1.6; font-weight: 300; }
  .api-code { background: #111; border: 1px solid #333; border-radius: 3px; padding: 16px 20px; font-family: monospace; font-size: 11px; color: #7bc4a0; line-height: 1.8; }
  .api-comment { color: #555; }
  .tier-badge { display: inline-flex; align-items: center; gap: 6px; background: #e8f5ef; color: #2D7A5A; font-size: 12px; padding: 4px 12px; border-radius: 20px; font-weight: 500; }
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
  const { user } = useAuth()
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [backendOnline, setBackendOnline] = useState(false)

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
              <div className="dash-sub">All your registered and verified works</div>
            </div>
            <div className="tier-badge">✓ Gold tier</div>
          </div>

          <div className="stats">
            <div className="stat"><div className="stat-label">Registered works</div><div className="stat-value">{artworks.length}</div><div className="stat-note">live from backend</div></div>
            <div className="stat"><div className="stat-label">Backend</div><div className="stat-value">{backendOnline ? 'On' : 'Off'}</div><div className="stat-note">{backendOnline ? 'connected' : 'unreachable'}</div></div>
            <div className="stat"><div className="stat-label">Artist ID</div><div className="stat-value" style={{ fontSize: '18px' }}>{user?.id ? `${user.id.slice(0, 8)}...` : 'n/a'}</div><div className="stat-note">authenticated user</div></div>
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
                </div>
              </div>
            ))}
          </div>

          <div className="api-box">
            <div>
              <div className="api-label">Your API endpoint</div>
              <div className="api-title">Let anyone verify your work</div>
              <div className="api-sub">Share this endpoint so platforms and clients can confirm authorship automatically.</div>
            </div>
            <div>
              <div className="api-code">
                <div className="api-comment"># verify by hash</div>
                <div>GET /verify?hash=&lt;artwork_hash&gt;</div>
                <br />
                <div className="api-comment"># returns</div>
                <div>{'{ "verified": true, ... }'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
