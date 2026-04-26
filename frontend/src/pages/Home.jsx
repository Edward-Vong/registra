import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .home { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }

  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 48px; border-bottom: 1px solid #e0ddd6;
    background: #F7F5F0; position: sticky; top: 0; z-index: 10;
  }
  .logo { font-family: 'DM Serif Display', serif; font-size: 20px; letter-spacing: -0.3px; color: #1a1a1a; }
  .logo span { color: #2D7A5A; }
  .nav-links { display: flex; gap: 32px; align-items: center; }
  .nav-link { font-size: 13px; color: #666; cursor: pointer; font-weight: 400; text-decoration: none; }
  .nav-link:hover { color: #1a1a1a; }
  .btn-outline { border: 1px solid #1a1a1a; background: transparent; padding: 8px 20px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; color: #1a1a1a; }
  .btn-outline:hover { background: #1a1a1a; color: #F7F5F0; }
  .btn-primary { background: #2D7A5A; color: #fff; border: none; padding: 8px 20px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .btn-primary:hover { background: #235f45; }

  .hero {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0; min-height: 88vh; align-items: stretch;
  }
  .hero-left {
    padding: 80px 48px 80px 48px;
    display: flex; flex-direction: column; justify-content: center;
    border-right: 1px solid #e0ddd6;
  }
  .hero-tag { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #2D7A5A; font-weight: 500; margin-bottom: 24px; }
  .hero-title { font-family: 'DM Serif Display', serif; font-size: 56px; line-height: 1.05; letter-spacing: -1px; color: #1a1a1a; margin-bottom: 24px; }
  .hero-title em { font-style: italic; color: #2D7A5A; }
  .hero-sub { font-size: 15px; color: #555; line-height: 1.7; max-width: 380px; margin-bottom: 40px; font-weight: 300; }
  .hero-actions { display: flex; gap: 12px; align-items: center; }
  .hero-note { font-size: 12px; color: #999; margin-top: 20px; }

  .hero-right {
    background: #EFECE5; padding: 48px;
    display: flex; flex-direction: column; justify-content: center; gap: 16px;
  }
  .artwork-card {
    background: #fff; border: 1px solid #e0ddd6; border-radius: 4px;
    padding: 16px 18px; display: flex; align-items: center; gap: 14px;
    transition: transform 0.2s;
  }
  .artwork-card:hover { transform: translateX(4px); }
  .artwork-thumb {
    width: 52px; height: 52px; border-radius: 3px; flex-shrink: 0;
  }
  .thumb-1 { background: linear-gradient(135deg, #c8e6d4, #7bc4a0); }
  .thumb-2 { background: linear-gradient(135deg, #d4c8e6, #a07bc4); }
  .thumb-3 { background: linear-gradient(135deg, #e6d4c8, #c4a07b); }
  .artwork-meta { flex: 1; }
  .artwork-name { font-size: 13px; font-weight: 500; color: #1a1a1a; margin-bottom: 3px; }
  .artwork-hash { font-size: 11px; color: #999; font-family: monospace; }
  .verified-pill {
    background: #e8f5ef; color: #2D7A5A; font-size: 10px;
    padding: 3px 9px; border-radius: 20px; font-weight: 500; white-space: nowrap;
  }
  .card-label { font-size: 11px; color: #999; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }

  .how-section { padding: 96px 48px; border-top: 1px solid #e0ddd6; }
  .how-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 56px; }
  .how-title { font-family: 'DM Serif Display', serif; font-size: 36px; letter-spacing: -0.5px; }
  .how-sub { font-size: 13px; color: #888; max-width: 240px; text-align: right; line-height: 1.6; }
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e0ddd6; border: 1px solid #e0ddd6; }
  .step { background: #F7F5F0; padding: 36px 32px; }
  .step-num { font-family: 'DM Serif Display', serif; font-size: 40px; color: #ddd; margin-bottom: 20px; }
  .step-title { font-size: 15px; font-weight: 500; color: #1a1a1a; margin-bottom: 10px; }
  .step-desc { font-size: 13px; color: #777; line-height: 1.7; font-weight: 300; }

  .api-section {
    padding: 80px 48px; background: #1a1a1a; color: #F7F5F0;
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
  }
  .api-title { font-family: 'DM Serif Display', serif; font-size: 36px; letter-spacing: -0.5px; margin-bottom: 16px; }
  .api-desc { font-size: 14px; color: #aaa; line-height: 1.7; margin-bottom: 28px; font-weight: 300; }
  .api-code { background: #111; border: 1px solid #333; border-radius: 4px; padding: 20px 24px; font-family: monospace; font-size: 12px; color: #7bc4a0; line-height: 1.8; }
  .api-comment { color: #555; }

  .footer { padding: 32px 48px; border-top: 1px solid #e0ddd6; display: flex; justify-content: space-between; align-items: center; }
  .footer-logo { font-family: 'DM Serif Display', serif; font-size: 16px; }
  .footer-logo span { color: #2D7A5A; }
  .footer-note { font-size: 12px; color: #aaa; }
`

export default function Homepage() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <>
      <style>{styles}</style>
      <div className="home" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.4s' }}>

        <nav className="nav">
          <div className="logo">Regist<span>ra</span></div>
          <div className="nav-links">
            <a className="nav-link" onClick={() => navigate ('/about')}>how it works</a>
            <a className="nav-link" onClick={() => navigate ('/upload')}>upload</a>
            <a className="nav-link">api</a>
            <button className="btn-outline" onClick={() => navigate('/login')}>sign in</button>
            <button className="btn-primary" onClick={() => navigate('/register')}>get started</button>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-left">
            <div className="hero-tag">Art certification authority</div>
            <h1 className="hero-title">Your art.<br /><em>Verified.</em><br />Always.</h1>
            <p className="hero-sub">Registra automatically fingerprints your work as you create it — building an unbreakable proof of authorship that travels with your art across the internet.</p>
            <div className="hero-actions">
              <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '14px' }} onClick={() => navigate('/register')}>register your work</button>
              <button className="btn-outline" style={{ padding: '12px 28px', fontSize: '14px' }} onClick={() => navigate('/about')}>see how it works</button>
            </div>
            <p className="hero-note">Free for independent artists — no credit card required</p>
          </div>

          <div className="hero-right">
            <div className="card-label">recently verified</div>
            {[
              { name: 'Forest Study No. 3', hash: 'a3f8...c21d', cls: 'thumb-1' },
              { name: 'Neon Botanica', hash: 'b19e...77fa', cls: 'thumb-2' },
              { name: 'Character Sheet 01', hash: 'f402...9b3c', cls: 'thumb-3' },
            ].map((art, i) => (
              <div className="artwork-card" key={i}>
                <div className={`artwork-thumb ${art.cls}`} />
                <div className="artwork-meta">
                  <div className="artwork-name">{art.name}</div>
                  <div className="artwork-hash">{art.hash}</div>
                </div>
                <div className="verified-pill">✓ verified</div>
              </div>
            ))}
          </div>
        </section>

        <section className="how-section">
          <div className="how-header">
            <h2 className="how-title">How it works</h2>
            <p className="how-sub">Three steps from creation to certified ownership</p>
          </div>
          <div className="steps">
            {[
              { n: '01', title: 'Install the GIMP plugin', desc: 'Our free plugin runs silently in the background while you draw — hashing your work at regular intervals to build a timestamped proof of creation.' },
              { n: '02', title: 'Export to Registra', desc: 'When your piece is done, export directly from GIMP. The plugin bundles your artwork, hash history, and process proof into a single certification package.' },
              { n: '03', title: 'Share your verified badge', desc: 'Your work gets a public verified profile. Share the link anywhere — anyone can confirm you made it with a single click.' },
            ].map((s, i) => (
              <div className="step" key={i}>
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="api-section">
          <div>
            <h2 className="api-title">Built for the open web</h2>
            <p className="api-desc">Any platform can query our registry to verify authorship and credit artists automatically. One endpoint, instant verification.</p>
            <button className="btn-primary" style={{ padding: '10px 24px' }}>read the docs</button>
          </div>
          <div className="api-code">
            <div className="api-comment"># verify an artwork by hash</div>
            <div>GET /api/verify?hash=a3f8c21d</div>
            <br />
            <div className="api-comment"># response</div>
            <div>{'{'}</div>
            <div>&nbsp;&nbsp;"verified": true,</div>
            <div>&nbsp;&nbsp;"artist": "@chloe",</div>
            <div>&nbsp;&nbsp;"registered": "2026-04-18",</div>
            <div>&nbsp;&nbsp;"title": "Forest Study No. 3"</div>
            <div>{'}'}</div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-logo">Regist<span>ra</span></div>
          <div className="footer-note">© 2026 Registra — art certification authority</div>
        </footer>

      </div>
    </>
  )
}
