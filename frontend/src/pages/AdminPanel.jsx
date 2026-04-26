import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import {
  fetchAdminCertificates,
  adminVerifyCertificate,
  adminRejectCertificate,
} from '../api'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .admin { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }
  .gate { position: fixed; inset: 0; background: rgba(247,245,240,0.92); backdrop-filter: blur(6px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; gap: 16px; }
  .gate-icon { font-size: 40px; }
  .gate-title { font-family: 'DM Serif Display', serif; font-size: 28px; letter-spacing: -0.5px; }
  .gate-sub { font-size: 14px; color: #999; }
  .gate-btn { background: #2D7A5A; color: #fff; border: none; padding: 11px 28px; border-radius: 2px; font-size: 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-top: 8px; }
  .gate-btn:hover { background: #235f45; }
  .container { max-width: 1000px; margin: 0 auto; padding: 56px 24px; }
  .page-title { font-family: 'DM Serif Display', serif; font-size: 32px; letter-spacing: -0.5px; margin-bottom: 6px; }
  .page-sub { font-size: 13px; color: #999; margin-bottom: 40px; }
  .filter-bar { display: flex; gap: 8px; margin-bottom: 24px; }
  .filter-btn { border: 1px solid #e0ddd6; background: #fff; padding: 6px 16px; border-radius: 20px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; color: #555; transition: all 0.15s; }
  .filter-btn.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
  .table-wrap { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; }
  .table-head { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr; gap: 0; padding: 12px 20px; background: #f2f0eb; border-bottom: 1px solid #e0ddd6; }
  .th { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500; }
  .table-row { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr; gap: 0; padding: 16px 20px; border-bottom: 1px solid #f0ede8; align-items: center; transition: background 0.1s; }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: #faf9f7; }
  .row-title { font-size: 14px; font-weight: 500; color: #1a1a1a; }
  .row-hash { font-size: 11px; color: #999; font-family: monospace; margin-top: 3px; }
  .row-artist { font-size: 13px; color: #555; }
  .row-date { font-size: 12px; color: #999; }
  .status-badge { display: inline-block; font-size: 11px; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
  .status-pending { background: #fef3c7; color: #92400e; }
  .status-verified { background: #d1fae5; color: #065f46; }
  .status-rejected { background: #fee2e2; color: #991b1b; }
  .actions { display: flex; gap: 8px; align-items: center; }
  .btn-verify { background: #2D7A5A; color: #fff; border: none; padding: 6px 14px; border-radius: 2px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .btn-verify:hover { background: #235f45; }
  .btn-reject { background: transparent; color: #dc2626; border: 1px solid #dc2626; padding: 6px 14px; border-radius: 2px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .btn-reject:hover { background: #fee2e2; }
  .btn-open { background: transparent; color: #1a1a1a; border: 1px solid #1a1a1a; padding: 6px 14px; border-radius: 2px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .btn-open:hover { background: #f2f0eb; }
  .btn-disabled { opacity: 0.4; cursor: not-allowed; }
  .reject-form { margin-top: 8px; display: flex; gap: 6px; }
  .reject-input { border: 1px solid #e0ddd6; padding: 6px 10px; font-size: 12px; font-family: 'DM Sans', sans-serif; border-radius: 2px; flex: 1; outline: none; }
  .reject-input:focus { border-color: #999; }
  .btn-send { background: #1a1a1a; color: #fff; border: none; padding: 6px 12px; border-radius: 2px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .btn-cancel { background: transparent; color: #999; border: 1px solid #e0ddd6; padding: 6px 12px; border-radius: 2px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .empty { padding: 60px 20px; text-align: center; color: #999; font-size: 14px; }
  .error-msg { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; padding: 12px 16px; border-radius: 4px; font-size: 13px; margin-bottom: 20px; }
  .loading { padding: 60px 20px; text-align: center; color: #999; font-size: 14px; }
`

const FILTERS = ['all', 'pending', 'verified', 'rejected']

function shortHash(hash) {
  if (!hash) return '—'
  return hash.slice(0, 8) + '...'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function parseCertData(value) {
  if (!value) return null
  if (typeof value === 'object') return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }
  return null
}

export default function AdminPanel() {
  const { user, loading: authLoading, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [certs, setCerts] = useState([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  async function getToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  async function loadCerts() {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      const data = await fetchAdminCertificates(token)
      setCerts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCerts()
  }, [])

  async function handleVerify(id) {
    setActionLoading(id)
    try {
      const token = await getToken()
      await adminVerifyCertificate(id, token)
      setCerts(prev => prev.map(c => c.id === id ? { ...c, status: 'verified' } : c))
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id) {
    setActionLoading(id)
    try {
      const token = await getToken()
      await adminRejectCertificate(id, rejectReason.trim(), token)
      setCerts(prev => prev.filter(c => c.id !== id))
      setRejectingId(null)
      setRejectReason('')
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = filter === 'all' ? certs : certs.filter(c => c.status === filter)

  const gate = !authLoading && (!user || !isAdmin)
  const gateMessage = !user
    ? { icon: '🔒', title: 'Sign in required', sub: 'You must be logged in to access this page.', btn: 'Sign in', action: () => navigate('/login', { state: { from: '/admin' } }) }
    : { icon: '⛔', title: 'Access denied', sub: 'You do not have admin privileges.', btn: 'Go to dashboard', action: () => navigate('/dashboard') }

  return (
    <div className="admin">
      <style>{styles}</style>
      <Navbar />
      {gate && (
        <div className="gate">
          <div className="gate-icon">{gateMessage.icon}</div>
          <div className="gate-title">{gateMessage.title}</div>
          <div className="gate-sub">{gateMessage.sub}</div>
          <button className="gate-btn" onClick={gateMessage.action}>{gateMessage.btn}</button>
        </div>
      )}
      <div className="container">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-sub">Review and verify artwork certificates</p>

        {error && <div className="error-msg">{error}</div>}

        <div className="filter-bar">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && ` (${certs.filter(c => c.status === f).length})`}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <div className="table-head">
            <span className="th">Artwork</span>
            <span className="th">Artist ID</span>
            <span className="th">Date</span>
            <span className="th">Status</span>
            <span className="th">Actions</span>
          </div>

          {loading ? (
            <div className="loading">Loading certificates…</div>
          ) : filtered.length === 0 ? (
            <div className="empty">No {filter === 'all' ? '' : filter} certificates found.</div>
          ) : (
            filtered.map(cert => {
              const artwork = cert.artworks || {}
              const certData = parseCertData(cert.cert_data)
              const proof = certData?.proof || null
              const gimpCert = certData?.gimp_certificate || null
              const isPending = cert.status === 'pending'
              const isRejecting = rejectingId === cert.id
              const isActing = actionLoading === cert.id

              return (
                <div key={cert.id} className="table-row">
                  <div>
                    <div className="row-title">{artwork.title || 'Untitled'}</div>
                    <div className="row-hash">{shortHash(artwork.final_file_hash)}</div>
                    {proof && (
                      <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>
                        Proof: {proof.type || 'unknown'}{proof.file_name ? ` (${proof.file_name})` : ''}
                      </div>
                    )}
                    {gimpCert?.image_file && (
                      <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                        Source file: {gimpCert.image_file}
                      </div>
                    )}
                    {cert.rejection_reason && (
                      <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>
                        Reason: {cert.rejection_reason}
                      </div>
                    )}
                  </div>
                  <div className="row-artist">{artwork.artist_id ? artwork.artist_id.slice(0, 12) + '…' : '—'}</div>
                  <div className="row-date">{formatDate(cert.created_at)}</div>
                  <div>
                    <span className={`status-badge status-${cert.status || 'pending'}`}>
                      {cert.status || 'pending'}
                    </span>
                  </div>
                  <div>
                    {isPending && !isRejecting && (
                      <div className="actions">
                        <button
                          className="btn-open"
                          onClick={() => navigate(`/admin/certificates/${cert.id}`)}
                        >
                          Open
                        </button>
                        <button
                          className={`btn-verify ${isActing ? 'btn-disabled' : ''}`}
                          disabled={isActing}
                          onClick={() => handleVerify(cert.id)}
                        >
                          {isActing ? '…' : 'Verify'}
                        </button>
                        <button
                          className="btn-reject"
                          disabled={isActing}
                          onClick={() => { setRejectingId(cert.id); setRejectReason('') }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {!isPending && (
                      <div className="actions">
                        <button
                          className="btn-open"
                          onClick={() => navigate(`/admin/certificates/${cert.id}`)}
                        >
                          Open
                        </button>
                      </div>
                    )}
                    {isPending && isRejecting && (
                      <div>
                        <div className="reject-form">
                          <input
                            className="reject-input"
                            placeholder="Reason (optional)"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleReject(cert.id)}
                          />
                          <button
                            className={`btn-send ${isActing ? 'btn-disabled' : ''}`}
                            disabled={isActing}
                            onClick={() => handleReject(cert.id)}
                          >
                            {isActing ? '…' : 'Send'}
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => { setRejectingId(null); setRejectReason('') }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
