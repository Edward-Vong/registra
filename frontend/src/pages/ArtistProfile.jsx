import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { fetchPublicArtistProfile } from '../api'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .page { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }
  .container { max-width: 1120px; margin: 0 auto; padding: 50px 24px 80px; }
  .hero { border: 1px solid #ddd9d1; border-radius: 4px; background: linear-gradient(135deg, #f3ead9, #dcecdf); padding: 20px; margin-bottom: 22px; }
  .hero-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .name { font-family: 'DM Serif Display', serif; font-size: 36px; letter-spacing: -0.5px; }
  .tag { font-size: 10px; text-transform: uppercase; letter-spacing: 0.09em; color: #7a746b; border: 1px solid #c8c2b8; background: #f7f3ec; border-radius: 999px; padding: 4px 10px; }
  .hero-sub { margin-top: 8px; font-size: 13px; color: #666; }

  .layout { display: grid; grid-template-columns: 280px 1fr; gap: 16px; }
  .card { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; }
  .card-head { padding: 12px 16px; border-bottom: 1px solid #ece9e2; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; }
  .card-body { padding: 14px; }

  .socials { display: grid; gap: 8px; }
  .social-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid #1a1a1a;
    background: #fff;
    color: #1a1a1a;
    padding: 10px 14px;
    border-radius: 3px;
    text-decoration: none;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .social-button:hover { background: #1a1a1a; color: #F7F5F0; }
  .social-empty { font-size: 12px; color: #999; }

  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .art-card { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; }
  .art-image { background: #f3f1ec; border-bottom: 1px solid #ece9e2; aspect-ratio: 4 / 3; overflow: hidden; }
  .art-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .art-placeholder { width: 100%; height: 100%; display: grid; place-items: center; color: #999; font-size: 12px; }
  .art-body { padding: 12px; }
  .art-title { font-size: 14px; font-weight: 500; margin-bottom: 6px; }
  .art-meta { font-size: 11px; color: #888; }

  .state { font-size: 14px; color: #777; background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; padding: 14px 16px; }
  .state.error { color: #991b1b; background: #fee2e2; border-color: #fca5a5; }
  .back-btn { margin-bottom: 10px; border: 1px solid #1a1a1a; background: transparent; padding: 8px 14px; border-radius: 2px; font-size: 12px; cursor: pointer; }

  @media (max-width: 980px) { .layout { grid-template-columns: 1fr; } }
  @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } .name { font-size: 30px; } }
`

function formatDate(value) {
  if (!value) return 'n/a'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

export default function ArtistProfile() {
  const navigate = useNavigate()
  const { username } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!username) return
      setLoading(true)
      setError('')
      try {
        const result = await fetchPublicArtistProfile(username)
        setData(result)
      } catch (err) {
        setError(err.message || 'Failed to load artist profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [username])

  const socials = data?.artist?.social_links || {}
  const instagramUrl = socials.instagram || ''
  const artworks = data?.verified_artworks || []

  return (
    <div className="page">
      <style>{styles}</style>
      <Navbar />
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/gallery')}>Back to gallery</button>

        {loading && <div className="state">Loading artist profile...</div>}
        {!loading && error && <div className="state error">{error}</div>}

        {!loading && !error && data && (
          <>
            <div className="hero">
              <div className="hero-top">
                <div className="name">@{data.artist?.username || username}</div>
                <div className="tag">Verified artist</div>
              </div>
              <div className="hero-sub">Public profile with linked socials and verified artworks.</div>
            </div>

            <div className="layout">
              <div className="card">
                <div className="card-head">Social links</div>
                <div className="card-body socials">
                  {instagramUrl ? (
                    <a className="social-button" href={instagramUrl} target="_blank" rel="noreferrer">
                      instagram
                    </a>
                  ) : (
                    <div className="social-empty">No Instagram link shared.</div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-head">Verified artworks</div>
                <div className="card-body">
                  {artworks.length === 0 ? (
                    <div className="social-empty">No verified artworks found.</div>
                  ) : (
                    <div className="grid">
                      {artworks.map((art, idx) => (
                        <div className="art-card" key={art.certificate_id || idx}>
                          <div className="art-image">
                            {art.artwork_url ? (
                              <img src={art.artwork_url} alt={art.title || 'Artwork'} />
                            ) : (
                              <div className="art-placeholder">No preview</div>
                            )}
                          </div>
                          <div className="art-body">
                            <div className="art-title">{art.title || 'Untitled'}</div>
                            <div className="art-meta">Verified: {formatDate(art.verified_at)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
