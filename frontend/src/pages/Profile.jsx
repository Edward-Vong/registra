import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .page { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }
  .container { max-width: 760px; margin: 0 auto; padding: 48px 24px 72px; }
  .tag { font-size: 11px; color: #2D7A5A; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
  .title { font-family: 'DM Serif Display', serif; font-size: 36px; letter-spacing: -0.4px; margin-bottom: 8px; }
  .sub { font-size: 14px; color: #777; line-height: 1.6; margin-bottom: 28px; }
  .card { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; }
  .card-head { padding: 16px 20px; border-bottom: 1px solid #ece9e2; }
  .card-title { font-size: 14px; font-weight: 500; }
  .card-sub { font-size: 12px; color: #999; margin-top: 4px; }
  .card-body { padding: 20px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .form-group label { font-size: 12px; color: #777; }
  .form-group input {
    font-size: 14px; padding: 11px 14px; border-radius: 2px; border: 1px solid #d8d5ce;
    background: #fff; color: #1a1a1a; font-family: 'DM Sans', sans-serif; outline: none;
  }
  .form-group input:focus { border-color: #2D7A5A; }
  .form-group input[disabled] { background: #f5f3ee; color: #999; }
  .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; }
  .btn-outline { border: 1px solid #1a1a1a; background: transparent; padding: 10px 18px; border-radius: 2px; font-size: 13px; cursor: pointer; }
  .btn-primary { background: #2D7A5A; color: #fff; border: none; padding: 10px 18px; border-radius: 2px; font-size: 13px; cursor: pointer; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-danger { background: #c0392b; color: #fff; border: none; padding: 10px 18px; border-radius: 2px; font-size: 13px; cursor: pointer; }
  .btn-danger:hover { background: #a93226; }
  .message { font-size: 13px; border-radius: 3px; padding: 12px 14px; margin-bottom: 18px; }
  .message.error { background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; }
  .message.success { background: #e8f5ef; border: 1px solid #98d5b6; color: #235f45; }
  .helper { font-size: 11px; color: #999; margin-top: -8px; margin-bottom: 12px; }
  .public-link { font-size: 12px; color: #2D7A5A; text-decoration: none; }
  .public-link:hover { text-decoration: underline; }
  .key-status { padding: 12px 14px; background: #f5f3ee; border: 1px solid #e0ddd6; border-radius: 2px; font-size: 13px; margin-bottom: 16px; }
  .key-status.registered { background: #e8f5ef; border-color: #98d5b6; color: #235f45; }
  @media (max-width: 720px) {
    .form-row { grid-template-columns: 1fr; }
  }
`

function normalizeSocialUrl(raw) {
  const value = (raw || '').trim()
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `https://${value}`
}

function validateSocialUrl(raw, label) {
  const value = (raw || '').trim()
  if (!value) return null
  const normalized = normalizeSocialUrl(value)
  try {
    const url = new URL(normalized)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return `${label} link must start with http:// or https://`
    }
    return null
  } catch {
    return `${label} link is not a valid URL`
  }
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    username: '',
    email: '',
    socialWebsite: '',
    socialInstagram: '',
    socialX: '',
    socialArtstation: '',
  })
  const [keyFingerprint, setKeyFingerprint] = useState('')
  const [keyLoading, setKeyLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resettingKey, setResettingKey] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!user) return
    setForm({
      username: user.user_metadata?.username || '',
      email: user.email || '',
      socialWebsite: user.user_metadata?.social_website || '',
      socialInstagram: user.user_metadata?.social_instagram || '',
      socialX: user.user_metadata?.social_x || '',
      socialArtstation: user.user_metadata?.social_artstation || '',
    })
  }, [user])

  // Load registered signing key fingerprint
  useEffect(() => {
    async function loadSigningKey() {
      if (!user) return
      setKeyLoading(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return
        
        const response = await fetch('http://localhost:5000/me/signing-key', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const data = await response.json()
        if (response.ok) {
          setKeyFingerprint(data.key_fingerprint || '')
        }
      } catch {
        // Continue if key lookup fails
      } finally {
        setKeyLoading(false)
      }
    }
    loadSigningKey()
  }, [user])

  const updateField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.username.trim()) {
      setError('Username is required.')
      return
    }

    setSaving(true)
    try {
      const username = form.username.trim()

      const socialError =
        validateSocialUrl(form.socialWebsite, 'Website') ||
        validateSocialUrl(form.socialInstagram, 'Instagram') ||
        validateSocialUrl(form.socialX, 'X') ||
        validateSocialUrl(form.socialArtstation, 'ArtStation')

      if (socialError) throw new Error(socialError)

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username,
          first_name: null,
          last_name: null,
          name: username,
          social_website: normalizeSocialUrl(form.socialWebsite),
          social_instagram: normalizeSocialUrl(form.socialInstagram),
          social_x: normalizeSocialUrl(form.socialX),
          social_artstation: normalizeSocialUrl(form.socialArtstation),
        },
      })
      if (updateError) throw updateError
      await refreshUser()
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setError('')
    setSuccess('')
    setForm({
      username: user?.user_metadata?.username || '',
      email: user?.email || '',
      socialWebsite: user?.user_metadata?.social_website || '',
      socialInstagram: user?.user_metadata?.social_instagram || '',
      socialX: user?.user_metadata?.social_x || '',
      socialArtstation: user?.user_metadata?.social_artstation || '',
    })
  }

  const handleResetKey = async () => {
    setError('')
    setSuccess('')
    setResettingKey(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Not authenticated')
      
      const response = await fetch('http://localhost:5000/account/signing-key/reset-request', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Failed to request key reset')
      } else {
        setSuccess('Reset email sent! Check your inbox for the verification link.')
      }
    } catch (err) {
      setError(err.message || 'Failed to request key reset')
    } finally {
      setResettingKey(false)
    }
  }

  return (
    <div className="page">
      <style>{styles}</style>
      <Navbar />
      <div className="container">
        <div className="tag">Account settings</div>
        <h1 className="title">Your profile</h1>
        <p className="sub">Update your username and manage your signing key for certificate generation.</p>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        <div className="card">
          <div className="card-head">
            <div className="card-title">Public profile</div>
            <div className="card-sub">Your username is your public identity. Social links appear on your artist profile page.</div>
          </div>
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username / display name</label>
              <input type="text" value={form.username} onChange={updateField('username')} placeholder="yourname" />
            </div>
            {form.username.trim() && (
              <div style={{ marginBottom: 12 }}>
                <a className="public-link" href={`/artist/${encodeURIComponent(form.username.trim())}`} target="_blank" rel="noreferrer">
                  View public artist profile →
                </a>
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} disabled />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input type="text" value={form.socialWebsite} onChange={updateField('socialWebsite')} placeholder="https://your-site.com" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Instagram</label>
                <input type="text" value={form.socialInstagram} onChange={updateField('socialInstagram')} placeholder="https://instagram.com/yourhandle" />
              </div>
              <div className="form-group">
                <label>X (Twitter)</label>
                <input type="text" value={form.socialX} onChange={updateField('socialX')} placeholder="https://x.com/yourhandle" />
              </div>
            </div>
            <div className="form-group">
              <label>ArtStation</label>
              <input type="text" value={form.socialArtstation} onChange={updateField('socialArtstation')} placeholder="https://www.artstation.com/yourname" />
            </div>
            <div className="helper">Tip: you can paste links with or without https://.</div>
            <div className="actions">
              <button type="button" className="btn-outline" onClick={resetForm}>Reset</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </form>
        </div>

        <div className="card" style={{ marginTop: 18 }}>
          <div className="card-head">
            <div className="card-title">Signing key</div>
            <div className="card-sub">Your signing key is generated by the GIMP plugin on first upload. It cannot be changed without a reset.</div>
          </div>
          <div className="card-body">
            {keyLoading ? (
              <div className="key-status">Loading key status...</div>
            ) : keyFingerprint ? (
              <>
                <div className="key-status registered">✓ Key registered (fingerprint: {keyFingerprint.slice(0, 16)}...)</div>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Your signing key is linked to your account. All future uploads must use this same key from the same device.</p>
                <button className="btn-danger" onClick={handleResetKey} disabled={resettingKey}>
                  {resettingKey ? 'Sending reset email...' : 'Reset key (device change)'}
                </button>
              </>
            ) : (
              <div className="key-status">No key registered yet. Your first upload will automatically register your GIMP plugin's key.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
