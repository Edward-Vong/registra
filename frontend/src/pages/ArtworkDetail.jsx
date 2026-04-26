import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { supabase } from '../supabase'
import { fetchAdminCertificateDetail, fetchCertificateDetail } from '../api'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .page { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }
  .container { max-width: 1100px; margin: 0 auto; padding: 44px 24px 72px; }
  .head-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .title { font-family: 'DM Serif Display', serif; font-size: 34px; letter-spacing: -0.4px; }
  .sub { font-size: 13px; color: #777; margin-top: 5px; }
  .back-btn { border: 1px solid #1a1a1a; background: transparent; padding: 8px 16px; border-radius: 2px; font-size: 12px; cursor: pointer; }
  .layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 18px; }
  .card { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; }
  .card-head { padding: 12px 16px; border-bottom: 1px solid #ece9e2; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; font-weight: 500; }
  .card-body { padding: 16px; }
  .image-wrap { background: #f3f1ec; border: 1px solid #ece9e2; border-radius: 3px; overflow: hidden; }
  .image-wrap img { display: block; width: 100%; max-height: 620px; object-fit: contain; background: #f3f1ec; }
  .placeholder { padding: 40px 18px; text-align: center; color: #888; font-size: 13px; }
  .meta-list { display: grid; gap: 12px; }
  .meta-item { padding-bottom: 10px; border-bottom: 1px solid #f0ede8; }
  .meta-item:last-child { border-bottom: none; padding-bottom: 0; }
  .meta-k { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .meta-v { font-size: 13px; color: #222; word-break: break-word; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; }
  .credit-banner {
    margin-bottom: 18px; background: linear-gradient(135deg, #f3ead9, #dcecdf);
    border: 1px solid #d8d5ce; border-radius: 4px; padding: 16px 18px;
  }
  .credit-label { font-size: 11px; color: #7a746b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .credit-name { font-family: 'DM Serif Display', serif; font-size: 24px; color: #1a1a1a; }
  .status { display: inline-flex; font-size: 11px; padding: 3px 10px; border-radius: 999px; font-weight: 500; text-transform: lowercase; }
  .status.pending { background: #fef3c7; color: #92400e; }
  .status.verified { background: #d1fae5; color: #065f46; }
  .status.rejected { background: #fee2e2; color: #991b1b; }
  .json { background: #141414; color: #8fe3bd; border-radius: 3px; padding: 14px; overflow: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; line-height: 1.5; max-height: 520px; }
  .stack { display: grid; gap: 18px; }
  .error { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; border-radius: 4px; padding: 12px 14px; margin-bottom: 16px; font-size: 13px; }
  .loading { color: #777; font-size: 14px; }
  @media (max-width: 900px) {
    .layout { grid-template-columns: 1fr; }
  }
`

function statusClass(status) {
  const s = status || 'pending'
  return `status ${s === 'verified' ? 'verified' : s === 'rejected' ? 'rejected' : 'pending'}`
}

function maybeImage(url) {
  if (!url) return false
  const u = url.toLowerCase()
  return u.endsWith('.png') || u.endsWith('.jpg') || u.endsWith('.jpeg') || u.endsWith('.webp') || u.endsWith('.gif')
}

export default function ArtworkDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { certificateId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isAdminView = location.pathname.startsWith('/admin/')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) throw new Error('Not authenticated')
        const detail = isAdminView
          ? await fetchAdminCertificateDetail(certificateId, token)
          : await fetchCertificateDetail(certificateId, token)
        setData(detail)
      } catch (err) {
        setError(err.message || 'Failed to load artwork details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [certificateId, isAdminView])

  const cert = data?.certificate || {}
  const certData = data?.cert_data || {}
  const artwork = data?.artwork || {}
  const user = data?.user || {}

  const artworkUrl = certData?.artwork?.url || null
  const proofUrl = certData?.proof?.url || null
  const artistUsername = user.username || certData?.submitted_by?.username || 'Unknown artist'

  const certJson = useMemo(() => JSON.stringify(certData?.gimp_certificate || certData || {}, null, 2), [certData])

  return (
    <div className="page">
      <style>{styles}</style>
      <Navbar />
      <div className="container">
        <div className="head-row">
          <div>
            <div className="title">{isAdminView ? 'Artwork Review' : 'Artwork Details'}</div>
            <div className="sub">{isAdminView ? 'Original art, certificate payload, proof, and submitter information' : 'View your uploaded artwork, certificate payload, and proof details'}</div>
          </div>
          <button className="back-btn" onClick={() => navigate(isAdminView ? '/admin' : '/dashboard')}>{isAdminView ? 'Back to admin' : 'Back to dashboard'}</button>
        </div>

        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Loading details...</div>}

        {!loading && data && (
          <>
            <div className="credit-banner">
              <div className="credit-label">Credited artist</div>
              <div className="credit-name">{artistUsername}</div>
            </div>

          <div className="layout">
            <div className="stack">
              <div className="card">
                <div className="card-head">Original Artwork</div>
                <div className="card-body">
                  <div className="image-wrap">
                    {artworkUrl && maybeImage(artworkUrl) ? (
                      <img src={artworkUrl} alt={artwork.title || 'Artwork'} />
                    ) : (
                      <div className="placeholder">
                        {artworkUrl ? (
                          <a href={artworkUrl} target="_blank" rel="noreferrer">Open uploaded artwork file</a>
                        ) : (
                          <span>No artwork file URL stored for this certificate.</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head">Proof of Creation</div>
                <div className="card-body meta-list">
                  <div className="meta-item">
                    <div className="meta-k">Proof type</div>
                    <div className="meta-v">{certData?.proof?.type || 'Not provided'}</div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-k">Proof file</div>
                    <div className="meta-v">{certData?.proof?.file_name || 'Not provided'}</div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-k">Proof asset</div>
                    <div className="meta-v">
                      {proofUrl ? <a href={proofUrl} target="_blank" rel="noreferrer">Open proof file</a> : 'No proof file URL stored'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="stack">
              <div className="card">
                <div className="card-head">Certificate Summary</div>
                <div className="card-body meta-list">
                  <div className="meta-item">
                    <div className="meta-k">Artist credit</div>
                    <div className="meta-v">{artistUsername}</div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-k">Status</div>
                    <div className="meta-v"><span className={statusClass(cert.status)}>{cert.status || 'pending'}</span></div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-k">Artwork title</div>
                    <div className="meta-v">{artwork.title || 'Untitled'}</div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-k">Certificate hash</div>
                    <div className="meta-v mono">{cert.certificate_hash || 'n/a'}</div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-k">Artwork hash</div>
                    <div className="meta-v mono">{artwork.final_file_hash || certData?.gimp_certificate?.image_hash || 'n/a'}</div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-k">Submitted</div>
                    <div className="meta-v">{cert.created_at || 'n/a'}</div>
                  </div>
                </div>
              </div>

              {isAdminView && <div className="card">
                <div className="card-head">User Information</div>
                <div className="card-body meta-list">
                  <div className="meta-item">
                    <div className="meta-k">Username</div>
                    <div className="meta-v">{user.username || certData?.submitted_by?.username || 'Unknown'}</div>
                  </div>
                </div>
              </div>}

              <div className="card">
                <div className="card-head">Raw Certificate Data</div>
                <div className="card-body">
                  <pre className="json">{certJson}</pre>
                </div>
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  )
}
