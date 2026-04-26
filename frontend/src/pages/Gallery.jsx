import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { fetchVerifiedGallery } from '../api'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .page { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }
  .container { max-width: 1160px; margin: 0 auto; padding: 50px 24px 80px; }
  .tag { font-size: 11px; color: #2D7A5A; text-transform: uppercase; letter-spacing: 0.11em; margin-bottom: 12px; }
  .title { font-family: 'DM Serif Display', serif; font-size: 44px; letter-spacing: -0.6px; margin-bottom: 10px; }
  .sub { font-size: 14px; color: #777; line-height: 1.7; margin-bottom: 26px; max-width: 760px; }

  .state { font-size: 14px; color: #777; background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; padding: 14px 16px; }
  .state.error { color: #991b1b; background: #fee2e2; border-color: #fca5a5; }

  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .card {
    background: #fff;
    border: 1px solid #e0ddd6;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .card:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(26, 26, 26, 0.07); }
  .image-wrap { background: #f3f1ec; border-bottom: 1px solid #ece9e2; aspect-ratio: 4 / 3; overflow: hidden; }
  .image-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .placeholder { width: 100%; height: 100%; display: grid; place-items: center; color: #999; font-size: 12px; }
  .body { padding: 14px; }
  .meta-row { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
  .artist { font-size: 12px; color: #2D7A5A; font-weight: 500; }
  .verified { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #065f46; background: #d1fae5; border-radius: 999px; padding: 3px 8px; }
  .art-title { font-size: 14px; color: #1a1a1a; font-weight: 500; margin-bottom: 6px; }
  .hash { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #888; }

  @media (max-width: 980px) { .grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 640px) { .grid { grid-template-columns: 1fr; } .title { font-size: 36px; } }
`

function shortHash(hash) {
  if (!hash) return 'n/a'
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`
}

export default function Gallery() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await fetchVerifiedGallery(60)
        setItems(data || [])
      } catch (err) {
        setError(err.message || 'Failed to load gallery.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="page">
      <style>{styles}</style>
      <Navbar />
      <div className="container">
        <div className="tag">Public discovery</div>
        <h1 className="title">Verified gallery</h1>
        <p className="sub">Browse recently verified artworks and visit artist pages to see their certified pieces and linked socials.</p>

        {loading && <div className="state">Loading verified artworks...</div>}
        {!loading && error && <div className="state error">{error}</div>}
        {!loading && !error && items.length === 0 && <div className="state">No verified artworks found yet.</div>}

        {!loading && !error && items.length > 0 && (
          <div className="grid">
            {items.map((item, idx) => (
              <div
                className="card"
                key={item.certificate_id || idx}
                onClick={() => navigate(`/artist/${encodeURIComponent(item.artist?.username || 'unknown')}`)}
              >
                <div className="image-wrap">
                  {item.artwork_url ? (
                    <img src={item.artwork_url} alt={item.title || 'Artwork'} />
                  ) : (
                    <div className="placeholder">No preview</div>
                  )}
                </div>
                <div className="body">
                  <div className="meta-row">
                    <div className="artist">@{item.artist?.username || 'unknown'}</div>
                    <div className="verified">verified</div>
                  </div>
                  <div className="art-title">{item.title || 'Untitled'}</div>
                  <div className="hash">{shortHash(item.hash)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
