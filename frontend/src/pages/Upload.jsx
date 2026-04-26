import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { createUploadChallenge, registerWithCert } from '../api'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .upload-page { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }

  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px; border-bottom: 1px solid #e0ddd6;
    background: #F7F5F0; position: sticky; top: 0; z-index: 10;
  }
  .logo { font-family: 'DM Serif Display', serif; font-size: 20px; letter-spacing: -0.3px; color: #1a1a1a; cursor: pointer; }
  .logo span { color: #2D7A5A; }
  .btn-outline { border: 1px solid #1a1a1a; background: transparent; padding: 8px 20px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; color: #1a1a1a; }
  .btn-primary { background: #2D7A5A; color: #fff; border: none; padding: 8px 20px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .btn-primary:hover { background: #235f45; }
  .btn-primary:disabled { background: #aaa; cursor: not-allowed; }

  .upload-container { max-width: 720px; margin: 0 auto; padding: 64px 24px; }

  .page-header { margin-bottom: 48px; }
  .page-tag { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #2D7A5A; font-weight: 500; margin-bottom: 12px; }
  .page-title { font-family: 'DM Serif Display', serif; font-size: 36px; letter-spacing: -0.5px; margin-bottom: 10px; }
  .page-sub { font-size: 14px; color: #777; font-weight: 300; line-height: 1.6; }

  .section { margin-bottom: 32px; }
  .section-label { font-size: 12px; font-weight: 500; color: #555; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }

  .drop-zone {
    border: 1.5px dashed #c8c5be; border-radius: 4px;
    padding: 48px 32px; text-align: center; cursor: pointer;
    background: #fff; transition: all 0.2s;
  }
  .drop-zone:hover, .drop-zone.dragover { border-color: #2D7A5A; background: #f0faf5; }
  .drop-zone.has-file { border-style: solid; border-color: #2D7A5A; background: #f0faf5; }
  .drop-icon { font-size: 32px; margin-bottom: 12px; }
  .drop-title { font-size: 15px; font-weight: 500; color: #1a1a1a; margin-bottom: 6px; }
  .drop-sub { font-size: 13px; color: #999; font-weight: 300; }
  .drop-sub span { color: #2D7A5A; font-weight: 500; }
  .file-preview { display: flex; align-items: center; gap: 12px; }
  .file-icon { width: 48px; height: 48px; background: #e8f5ef; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .file-info { text-align: left; }
  .file-name { font-size: 14px; font-weight: 500; color: #1a1a1a; }
  .file-size { font-size: 12px; color: #999; margin-top: 2px; }
  .file-change { font-size: 12px; color: #2D7A5A; cursor: pointer; margin-top: 4px; }

  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .form-group label { font-size: 12px; color: #777; font-weight: 400; }
  .form-group input, .form-group select, .form-group textarea {
    font-size: 14px; padding: 10px 12px; border-radius: 2px;
    border: 1px solid #d8d5ce; background: #fff; color: #1a1a1a;
    font-family: 'DM Sans', sans-serif; outline: none;
  }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #2D7A5A; }
  .form-group textarea { resize: vertical; min-height: 80px; }

  .proof-section { border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; }
  .proof-header { padding: 16px 20px; background: #fff; border-bottom: 1px solid #e0ddd6; }
  .proof-header-title { font-size: 14px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px; }
  .proof-header-sub { font-size: 12px; color: #999; font-weight: 300; }
  .proof-options { display: grid; grid-template-columns: repeat(3, 1fr); }
  .proof-option {
    padding: 20px; cursor: pointer; background: #fff;
    border-right: 1px solid #e0ddd6; text-align: center;
    transition: all 0.15s;
  }
  .proof-option:last-child { border-right: none; }
  .proof-option:hover { background: #f7faf8; }
  .proof-option.selected { background: #f0faf5; border-top: 2px solid #2D7A5A; }
  .proof-option .p-icon { font-size: 24px; margin-bottom: 8px; }
  .proof-option .p-title { font-size: 13px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px; }
  .proof-option .p-sub { font-size: 11px; color: #aaa; line-height: 1.4; font-weight: 300; }
  .proof-option.selected .p-title { color: #2D7A5A; }
  .proof-upload { padding: 16px 20px; background: #f7f5f0; border-top: 1px solid #e0ddd6; }
  .proof-upload-btn {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid #c8c5be; background: #fff; padding: 8px 16px;
    border-radius: 2px; font-size: 13px; cursor: pointer; color: #555;
    font-family: 'DM Sans', sans-serif;
  }
  .proof-upload-btn:hover { border-color: #2D7A5A; color: #2D7A5A; }
  .proof-uploaded { font-size: 12px; color: #2D7A5A; margin-top: 8px; }
  .cert-drop {
    padding: 32px; background: #fff; text-align: center;
    cursor: pointer; transition: all 0.2s;
  }
  .cert-drop:hover { background: #f7faf8; }
  .cert-drop.has-cert { background: #f0faf5; }
  .cert-file-name { font-size: 13px; font-weight: 500; color: #2D7A5A; margin-bottom: 4px; }
  .cert-file-change { font-size: 12px; color: #999; cursor: pointer; }
  .cert-file-change:hover { color: #c0392b; }
  .cert-status { padding: 12px 20px; border-top: 1px solid #e0ddd6; font-size: 12px; display: flex; align-items: center; gap: 8px; }
  .cert-ok { color: #2D7A5A; background: #e8f5ef; }
  .cert-err { color: #c0392b; background: #fdf0ef; }
  .cert-pending { color: #999; background: #f7f5f0; }

  .hash-preview {
    background: #1a1a1a; border-radius: 4px; padding: 20px 24px;
    margin-bottom: 32px;
  }
  .hash-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .hash-value { font-family: monospace; font-size: 13px; color: #7bc4a0; word-break: break-all; }
  .hash-match { font-size: 11px; color: #7bc4a0; margin-top: 8px; }
  .hash-mismatch { font-size: 11px; color: #e87c7c; margin-top: 8px; }
  .challenge-box { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; padding: 18px 20px; }
  .challenge-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .challenge-copy { font-family: monospace; font-size: 12px; color: #1a1a1a; word-break: break-all; }
  .challenge-help { font-size: 12px; color: #777; line-height: 1.6; margin-top: 12px; }

  .submit-row { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; }
  .submit-note { font-size: 12px; color: #aaa; max-width: 340px; line-height: 1.5; }
  .submit-btn {
    background: #2D7A5A; color: #fff; border: none; padding: 14px 36px;
    border-radius: 2px; font-size: 14px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: background 0.2s;
  }
  .submit-btn:hover { background: #235f45; }
  .submit-btn:disabled { background: #aaa; cursor: not-allowed; }

  .success-banner {
    background: #e8f5ef; border: 1px solid #2D7A5A; border-radius: 4px;
    padding: 20px 24px; margin-bottom: 32px; display: flex; align-items: center; gap: 16px;
  }
  .success-icon { font-size: 24px; }
  .success-title { font-size: 14px; font-weight: 500; color: #2D7A5A; margin-bottom: 4px; }
  .success-sub { font-size: 13px; color: #555; }
`

async function generateFileHash(file) {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function Upload() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dragover, setDragover] = useState(false)
  const [artworkFile, setArtworkFile] = useState(null)
  const [certFile, setCertFile] = useState(null)
  const [cert, setCert] = useState(null)       // parsed certificate.json
  const [certError, setCertError] = useState(null)
  const [proofType, setProofType] = useState('wip')
  const [proofFile, setProofFile] = useState(null)
  const [title, setTitle] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [hash, setHash] = useState(null)         // computed from artwork file
  const [submitError, setSubmitError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [certificateHash, setCertificateHash] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [challengeLoading, setChallengeLoading] = useState(false)

  // null = not yet checked, true = match, false = mismatch
  const hashMatch = hash && cert ? hash === cert.image_hash : null
  const challengeMatch = cert && challenge
    ? cert.challenge_id === challenge.challenge_id && cert.challenge_nonce === challenge.nonce
    : null

  useEffect(() => {
    async function loadChallenge() {
      if (!user?.id) return
      setChallengeLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token
        if (!accessToken) return
        const nextChallenge = await createUploadChallenge(accessToken)
        setChallenge(nextChallenge)
      } catch (error) {
        setSubmitError(error.message || 'Failed to create upload challenge. Register a signing key in your profile first.')
      } finally {
        setChallengeLoading(false)
      }
    }
    loadChallenge()
  }, [user?.id])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      setSubmitError('Failed to logout. Please try again.')
    }
  }

  const handleFileDrop = async (e) => {
    e.preventDefault()
    setDragover(false)
    const file = e.dataTransfer?.files[0] || e.target.files[0]
    if (file) {
      setSubmitError(null)
      setArtworkFile(file)
      const fileHash = await generateFileHash(file)
      setHash(fileHash)
    }
  }

  const handleCertUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCertError(null)
    setCertFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (!parsed.image_hash || !parsed.signature || !parsed.public_key_pem || !parsed.challenge_id || !parsed.challenge_nonce || !parsed.signed_payload) {
          throw new Error('Missing required fields')
        }
        setCert(parsed)
      } catch {
        setCert(null)
        setCertError('Invalid certificate file — make sure you upload the certificate.json from the GIMP plugin.')
      }
    }
    reader.readAsText(file)
  }

  const handleSubmit = async () => {
    if (!artworkFile || !cert || !title || !user?.id || hashMatch !== true) return

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) throw new Error('Not authenticated')

      const result = await registerWithCert({
        file: artworkFile,
        title,
        cert,
        proofType,
        proofFileName: proofFile?.name,
        proofFile,
        accessToken,
      })

      setCertificateHash(result?.certificate?.certificate_hash || null)
      setSubmitted(true)
      setArtworkFile(null)
      setCertFile(null)
      setCert(null)
      setCertError(null)
      setHash(null)
      setTitle('')
      setProofType('wip')
      setProofFile(null)
      setCertError(null)
      try {
        const nextChallenge = await createUploadChallenge(accessToken)
        setChallenge(nextChallenge)
      } catch {
        // Keep success path smooth even if auto-refreshing the next challenge fails.
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setSubmitError(error.message || 'Failed to register artwork.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const proofOptions = [
    { key: 'timelapse', icon: '🎬', title: 'Timelapse / recording', sub: 'Screen recording or timelapse of your process' },
    { key: 'layered', icon: '📁', title: 'Layered file', sub: '.psd, .procreate, .xcf with visible layers' },
    { key: 'wip', icon: '📸', title: 'WIP screenshots', sub: 'Progress photos taken while drawing' },
  ]

  return (
    <>
      <style>{styles}</style>
      <div className="upload-page">
        <nav className="nav">
          <div className="logo" onClick={() => navigate('/')}>Regist<span>ra</span></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-outline" onClick={() => navigate('/dashboard')}>my portfolio</button>
            <button className="btn-outline" onClick={handleLogout}>logout</button>
          </div>
        </nav>

        <div className="upload-container">
          <div className="page-header">
            <div className="page-tag">Register new work</div>
            <h1 className="page-title">Certify your artwork</h1>
            <p className="page-sub">Upload your finished piece and proof of creation. We'll generate a permanent fingerprint and add it to the verified registry.</p>
          </div>

          {submitted && (
            <div className="success-banner">
              <div className="success-icon">✓</div>
              <div>
                <div className="success-title">Artwork registered successfully</div>
                <div className="success-sub">Your piece has been fingerprinted and added to the Registra registry. <span style={{ color: '#2D7A5A', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>View in dashboard →</span></div>
                {certificateHash && <div className="success-sub">Certificate hash: {certificateHash.slice(0, 16)}...</div>}
              </div>
            </div>
          )}

          {submitError && (
            <div className="success-banner" style={{ background: '#fdf0ef', borderColor: '#c0392b' }}>
              <div className="success-icon" style={{ color: '#c0392b' }}>!</div>
              <div>
                <div className="success-title" style={{ color: '#c0392b' }}>Registration failed</div>
                <div className="success-sub">{submitError}</div>
              </div>
            </div>
          )}

          <div className="section">
            <div className="section-label">Upload challenge</div>
            <div className="challenge-box">
              <div className="challenge-row">
                <div>
                  <div style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>Challenge ID</div>
                  <div className="challenge-copy">{challengeLoading ? 'Loading challenge...' : challenge?.challenge_id || 'Unavailable'}</div>
                </div>
                <button className="btn-outline" type="button" onClick={async () => {
                  setSubmitError(null)
                  setChallengeLoading(true)
                  try {
                    const { data: { session } } = await supabase.auth.getSession()
                    const accessToken = session?.access_token
                    if (!accessToken) throw new Error('Not authenticated')
                    const nextChallenge = await createUploadChallenge(accessToken)
                    setChallenge(nextChallenge)
                  } catch (error) {
                    setSubmitError(error.message || 'Failed to refresh challenge.')
                  } finally {
                    setChallengeLoading(false)
                  }
                }}>{challengeLoading ? 'Refreshing...' : 'Refresh challenge'}</button>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>Challenge nonce</div>
                <div className="challenge-copy">{challenge?.nonce || 'Unavailable'}</div>
              </div>
              <div className="challenge-help">Use this exact challenge ID and nonce when exporting from the GIMP plugin. The plugin will sign them into the certificate, and the upload will only succeed once for this challenge.</div>
            </div>
          </div>

          <div className="section">
            <div className="section-label">Artwork file</div>
            <div
              className={`drop-zone ${dragover ? 'dragover' : ''} ${artworkFile ? 'has-file' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragover(true) }}
              onDragLeave={() => setDragover(false)}
              onDrop={handleFileDrop}
              onClick={() => !artworkFile && document.getElementById('artwork-input').click()}
            >
              <input id="artwork-input" type="file" accept="image/*,.psd,.xcf,.svg,.tiff" style={{ display: 'none' }} onChange={handleFileDrop} />
              {artworkFile ? (
                <div className="file-preview">
                  <div className="file-icon">🖼</div>
                  <div className="file-info">
                    <div className="file-name">{artworkFile.name}</div>
                    <div className="file-size">{formatBytes(artworkFile.size)}</div>
                    <div className="file-change" onClick={(e) => { e.stopPropagation(); setArtworkFile(null); setHash(null) }}>remove file</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="drop-icon">↑</div>
                  <div className="drop-title">Drop your artwork here</div>
                  <div className="drop-sub">or <span>browse files</span> — PNG, JPG, PSD, SVG, TIFF up to 50MB</div>
                </>
              )}
            </div>
          </div>

          {hash && cert && (
            <div className="hash-preview">
              <div className="hash-label">Certificate fingerprint</div>
              <div className="hash-value">{cert.image_hash}</div>
              {hashMatch === true && (
                <div className="hash-match">✓ File hash matches certificate — ready to register</div>
              )}
              {hashMatch === false && (
                <div className="hash-mismatch">✗ Hash mismatch — this file does not match the certificate</div>
              )}
            </div>
          )}

          {hash && !cert && (
            <div className="hash-preview">
              <div className="hash-label">Computed fingerprint</div>
              <div className="hash-value">{hash}</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 8 }}>Upload your certificate.json to validate this matches.</div>
            </div>
          )}

          <div className="section">
            <div className="section-label">Artwork details</div>
            <div className="form-group">
              <label>Title</label>
              <input type="text" placeholder="e.g. Forest Study No. 3" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          </div>

          <div className="section">
            <div className="section-label">GIMP certificate</div>
            <div className="proof-section">
              <div className="proof-header">
                <div className="proof-header-title">Upload the certificate.json from the GIMP plugin</div>
                <div className="proof-header-sub">Generated by the Proof of Process plugin — proves authorship with an RSA signature</div>
              </div>
              <div
                className={`cert-drop ${cert ? 'has-cert' : ''}`}
                onClick={() => document.getElementById('cert-input').click()}
              >
                <input
                  id="cert-input"
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={handleCertUpload}
                />
                {cert ? (
                  <>
                    <div className="cert-file-name">📄 {certFile?.name}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>Signed at {cert.timestamp_utc}</div>
                    <div
                      className="cert-file-change"
                      style={{ marginTop: 8 }}
                      onClick={e => { e.stopPropagation(); setCert(null); setCertFile(null); setCertError(null) }}
                    >
                      remove
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>📋</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 4 }}>Drop certificate.json here</div>
                    <div style={{ fontSize: 13, color: '#999' }}>or <span style={{ color: '#2D7A5A', fontWeight: 500 }}>browse files</span></div>
                  </>
                )}
              </div>
              {certError && (
                <div className="cert-status cert-err">✗ {certError}</div>
              )}
              {cert && hashMatch === true && (
                <div className="cert-status cert-ok">✓ Certificate structure looks valid — server will verify the registered key, challenge, and proof hash on submission</div>
              )}
              {cert && hashMatch === false && (
                <div className="cert-status cert-err">✗ This certificate does not belong to the uploaded artwork file</div>
              )}
              {cert && challengeMatch === false && (
                <div className="cert-status cert-err">✗ This certificate was not generated from the current upload challenge</div>
              )}
              {cert && hashMatch === null && (
                <div className="cert-status cert-pending">Upload the artwork file above to validate this certificate</div>
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-label">Proof of creation</div>
            <div className="proof-section">
              <div className="proof-header">
                <div className="proof-header-title">Add real-world process proof</div>
                <div className="proof-header-sub">This complements the cryptographic certificate and helps with moderation confidence.</div>
              </div>
              <div className="proof-options">
                {proofOptions.map(opt => (
                  <div key={opt.key} className={`proof-option ${proofType === opt.key ? 'selected' : ''}`} onClick={() => setProofType(opt.key)}>
                    <div className="p-icon">{opt.icon}</div>
                    <div className="p-title">{opt.title}</div>
                    <div className="p-sub">{opt.sub}</div>
                  </div>
                ))}
              </div>
              <div className="proof-upload">
                <button className="proof-upload-btn" onClick={() => document.getElementById('proof-input').click()}>
                  <span>↑</span> Upload proof file
                </button>
                <input id="proof-input" type="file" style={{ display: 'none' }} onChange={(e) => setProofFile(e.target.files[0] || null)} />
                {proofFile && <div className="proof-uploaded">✓ {proofFile.name} uploaded</div>}
              </div>
            </div>
          </div>

          <div className="submit-row">
            <p className="submit-note">By registering, you confirm this is your original work. We verify your account-bound signing key, the one-time challenge, the artwork hash, and the proof hash.</p>
            <button
              className="submit-btn"
              disabled={!challenge || !artworkFile || !cert || !proofFile || !title || hashMatch !== true || challengeMatch !== true}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Verifying & registering...' : 'Register & certify →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}