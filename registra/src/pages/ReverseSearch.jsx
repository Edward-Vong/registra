import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .rs-page { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }
  .container { max-width: 720px; margin: 0 auto; padding: 56px 24px; }
  .page-tag { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #2D7A5A; font-weight: 500; margin-bottom: 12px; }
  .page-title { font-family: 'DM Serif Display', serif; font-size: 36px; letter-spacing: -0.5px; margin-bottom: 10px; }
  .page-sub { font-size: 14px; color: #777; font-weight: 300; line-height: 1.6; margin-bottom: 48px; }
  .section-label { font-size: 12px; font-weight: 500; color: #555; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }

  .drop-zone {
    border: 1.5px dashed #c8c5be; border-radius: 4px;
    padding: 48px 32px; text-align: center; cursor: pointer;
    background: #fff; transition: all 0.2s; margin-bottom: 24px;
  }
  .drop-zone:hover { border-color: #2D7A5A; background: #f0faf5; }
  .drop-zone.has-file { border-style: solid; border-color: #2D7A5A; background: #f0faf5; }
  .drop-icon { font-size: 32px; margin-bottom: 12px; }
  .drop-title { font-size: 15px; font-weight: 500; color: #1a1a1a; margin-bottom: 6px; }
  .drop-sub { font-size: 13px; color: #999; font-weight: 300; }
  .drop-sub span { color: #2D7A5A; font-weight: 500; }
  .preview-img { max-width: 200px; max-height: 200px; border-radius: 4px; object-fit: cover; margin: 0 auto 12px; display: block; }
  .file-name { font-size: 13px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px; }
  .file-change { font-size: 12px; color: #2D7A5A; cursor: pointer; }

  .search-btn {
    width: 100%; background: #2D7A5A; color: #fff; border: none;
    padding: 14px; border-radius: 2px; font-size: 14px; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif; margin-bottom: 32px;
    transition: background 0.2s;
  }
  .search-btn:hover { background: #235f45; }
  .search-btn:disabled { background: #aaa; cursor: not-allowed; }

  .loading { text-align: center; padding: 48px 0; }
  .loading-spinner {
    width: 32px; height: 32px; border: 2px solid #e0ddd6;
    border-top-color: #2D7A5A; border-radius: 50%;
    animation: spin 0.8s linear infinite; margin: 0 auto 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-size: 13px; color: #999; }

  .result-status-clean { display: inline-flex; align-items: center; gap: 8px; background: #e8f5ef; color: #2D7A5A; font-size: 13px; padding: 8px 16px; border-radius: 20px; font-weight: 500; margin-bottom: 16px; }
  .result-status-flagged { display: inline-flex; align-items: center; gap: 8px; background: #fdf0ef; color: #c0392b; font-size: 13px; padding: 8px 16px; border-radius: 20px; font-weight: 500; margin-bottom: 16px; }
  .result-box { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; padding: 20px 24px; }
  .result-flagged-box { background: #fdf0ef; border: 1px solid #f5c6c6; border-radius: 4px; padding: 20px 24px; }
  .result-box-title { font-size: 13px; font-weight: 500; color: #1a1a1a; margin-bottom: 6px; }
  .result-box-text { font-size: 13px; color: #777; line-height: 1.6; font-weight: 300; }
  .result-link { font-size: 12px; color: #2D7A5A; word-break: break-all; margin-top: 8px; display: block; }
  .error-box { background: #fdf0ef; border: 1px solid #f5c6c6; border-radius: 4px; padding: 16px 20px; font-size: 13px; color: #c0392b; }
`

const IMGBB_KEY = 'd66a657897319166d583a3059aaee2e5'

export default function ReverseSearch() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFile = (e) => {
    const f = e.target.files?.[0] || e.dataTransfer?.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError(null)
  }

  const handleSearch = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      // Step 1 — upload to imgbb to get public URL
      const formData = new FormData()
      formData.append('image', file)

      const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadRes.json()
      if (!uploadData.success) throw new Error('Image upload failed')

      const imageUrl = uploadData.data.url

      // Step 2 — call Flask instead of SerpAPI directly
const searchRes = await fetch('http://localhost:5000/reverse-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ image_url: imageUrl })
})
const searchData = await searchRes.json()
setResult(searchData)
      setResult(searchData)
    } catch (err) {
      setError('Search failed. Please try again.')
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="rs-page">
        <Navbar loggedIn={true} />
        <div className="container">
          <div className="page-tag">Theft detection</div>
          <h1 className="page-title">Reverse image search</h1>
          <p className="page-sub">Upload an image to check if it appears elsewhere on the internet without your permission.</p>

          <div className="section-label">Upload image</div>
          <div
            className={`drop-zone ${file ? 'has-file' : ''}`}
            onClick={() => !file && document.getElementById('rs-input').click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e) }}
          >
            <input id="rs-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            {file ? (
              <>
                <img src={preview} className="preview-img" alt="preview" />
                <div className="file-name">{file.name}</div>
                <div className="file-change" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null) }}>remove</div>
              </>
            ) : (
              <>
                <div className="drop-icon">↑</div>
                <div className="drop-title">Drop your image here</div>
                <div className="drop-sub">or <span>browse files</span> — PNG, JPG, WEBP</div>
              </>
            )}
          </div>

          <button className="search-btn" disabled={!file || loading} onClick={handleSearch}>
            {loading ? 'Searching...' : 'Run reverse image search →'}
          </button>

          {loading && (
            <div className="loading">
              <div className="loading-spinner" />
              <div className="loading-text">Scanning the web for matches...</div>
            </div>
          )}

          {error && <div className="error-box">{error}</div>}

          {result && !loading && (
            <>
              {result.image_results?.length > 0 ? (
                <>
                  <div className="result-status-flagged">⚠ {result.image_results.length} match(es) found online</div>
                  <div className="result-flagged-box">
                    <div className="result-box-title">Your image was found in these locations</div>
                    <div className="result-box-text">This image appears to exist elsewhere on the internet. If these are unauthorized uses, you have a verified ownership record to support your claim.</div>
                    {result.image_results.slice(0, 5).map((r, i) => (
                      <a key={i} className="result-link" href={r.link} target="_blank" rel="noreferrer">
                        {r.title || r.link}
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="result-status-clean">✓ No matches found</div>
                  <div className="result-box">
                    <div className="result-box-title">Your image looks safe</div>
                    <div className="result-box-text">No matching images were found online. This doesn't guarantee your image hasn't been reposted, but no direct matches were detected in this search.</div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
