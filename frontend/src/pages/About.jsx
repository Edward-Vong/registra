import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .about { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }

  .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

  .btn-primary { background: #2D7A5A; color: #fff; border: none; padding: 10px 22px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .btn-primary:hover { background: #235f45; }
  .btn-outline { border: 1px solid #1a1a1a; background: transparent; padding: 10px 22px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; color: #1a1a1a; }
  .btn-outline:hover { background: #1a1a1a; color: #F7F5F0; }

  .hero {
    border-bottom: 1px solid #e0ddd6;
    background: linear-gradient(180deg, #f7f5f0 0%, #f2efe8 100%);
  }
  .hero-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 84px 24px 72px;
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 32px;
    align-items: center;
  }
  .hero-tag { font-size: 11px; color: #2D7A5A; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 500; margin-bottom: 18px; }
  .hero-title { font-family: 'DM Serif Display', serif; font-size: 54px; line-height: 1.02; letter-spacing: -1px; margin-bottom: 20px; }
  .hero-title em { font-style: italic; color: #2D7A5A; }
  .hero-body { font-size: 15px; color: #666; line-height: 1.8; font-weight: 300; max-width: 620px; margin-bottom: 32px; }
  .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

  .hero-stats {
    border: 1px solid #ddd9d1;
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
  }
  .hero-stat {
    padding: 18px 20px;
    border-bottom: 1px solid #eee9e2;
  }
  .hero-stat:last-child { border-bottom: none; }
  .hero-stat-label { font-size: 11px; color: #8a8378; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .hero-stat-value { font-family: 'DM Serif Display', serif; font-size: 28px; color: #1a1a1a; margin-bottom: 6px; }
  .hero-stat-sub { font-size: 12px; color: #777; line-height: 1.5; }

  .section { padding: 72px 0; border-bottom: 1px solid #e0ddd6; }
  .section:last-of-type { border-bottom: none; }
  .section-tag { font-size: 11px; color: #2D7A5A; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 500; margin-bottom: 14px; }
  .section-title { font-family: 'DM Serif Display', serif; font-size: 36px; letter-spacing: -0.4px; margin-bottom: 14px; line-height: 1.15; }
  .section-sub { font-size: 14px; color: #777; line-height: 1.7; max-width: 640px; }

  .grid-two {
    margin-top: 28px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: #ddd9d1;
    border: 1px solid #ddd9d1;
  }
  .panel {
    background: #f7f5f0;
    padding: 28px;
  }
  .panel-title { font-size: 16px; font-weight: 500; color: #1a1a1a; margin-bottom: 10px; }
  .panel-body { font-size: 13px; color: #777; line-height: 1.75; }

  .flow {
    margin-top: 36px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: #ddd9d1;
    border: 1px solid #ddd9d1;
  }
  .flow-step { background: #f7f5f0; padding: 26px 22px; }
  .flow-num { font-family: 'DM Serif Display', serif; font-size: 34px; color: #ddd9d1; margin-bottom: 14px; }
  .flow-title { font-size: 14px; font-weight: 500; color: #1a1a1a; margin-bottom: 8px; }
  .flow-body { font-size: 12px; color: #888; line-height: 1.7; }

  .trust {
    background: #151515;
    color: #f4f1eb;
    border-bottom: 1px solid #2b2b2b;
  }
  .trust-wrap {
    max-width: 1100px;
    margin: 0 auto;
    padding: 72px 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 36px;
    align-items: start;
  }
  .trust-title { font-family: 'DM Serif Display', serif; font-size: 34px; letter-spacing: -0.4px; margin-bottom: 14px; }
  .trust-sub { font-size: 14px; color: #9e9e9e; line-height: 1.75; }
  .trust-list { display: grid; gap: 12px; }
  .trust-item {
    border: 1px solid #303030;
    background: #111;
    padding: 16px;
    border-radius: 4px;
  }
  .trust-item-title { font-size: 13px; color: #e9e5de; margin-bottom: 6px; }
  .trust-item-body { font-size: 12px; color: #9f9f9f; line-height: 1.6; }

  .cta { padding: 88px 24px; text-align: center; border-top: 1px solid #e0ddd6; }
  .cta-title { font-family: 'DM Serif Display', serif; font-size: 44px; letter-spacing: -0.8px; margin-bottom: 16px; }
  .cta-title em { font-style: italic; color: #2D7A5A; }
  .cta-sub { font-size: 15px; color: #888; margin-bottom: 30px; font-weight: 300; }
  .cta-buttons { display: flex; gap: 12px; justify-content: center; }

  .footer { padding: 30px 24px; border-top: 1px solid #e0ddd6; display: flex; justify-content: space-between; align-items: center; }
  .footer-logo { font-family: 'DM Serif Display', serif; font-size: 16px; }
  .footer-logo span { color: #2D7A5A; }
  .footer-note { font-size: 12px; color: #aaa; }

  @media (max-width: 980px) {
    .hero-inner { grid-template-columns: 1fr; padding-top: 68px; }
    .hero-title { font-size: 44px; }
    .grid-two { grid-template-columns: 1fr; }
    .flow { grid-template-columns: 1fr 1fr; }
    .trust-wrap { grid-template-columns: 1fr; }
    .section-title { font-size: 30px; }
  }

  @media (max-width: 680px) {
    .hero-title { font-size: 38px; }
    .flow { grid-template-columns: 1fr; }
    .section { padding: 58px 0; }
    .panel { padding: 22px; }
    .cta-title { font-size: 34px; }
    .cta-buttons { flex-direction: column; align-items: stretch; max-width: 300px; margin: 0 auto; }
    .footer { flex-direction: column; gap: 8px; }
  }
`

export default function About() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isLoggedIn = !!user

  return (
    <>
      <style>{styles}</style>
      <div className="about">
        <Navbar />

        <section className="hero">
          <div className="hero-inner">
            <div>
              <div className="hero-tag">About Registra</div>
              <h1 className="hero-title">Proof of creation,<br /><em>not just a timestamp.</em></h1>
              <p className="hero-body">Registra helps artists prove authorship with cryptographic evidence created during the art process itself. We combine local creation logs from the GIMP plugin with account-bound signatures and challenge-based uploads.</p>
              <div className="hero-actions">
                {isLoggedIn ? (
                  <>
                    <button className="btn-primary" onClick={() => navigate('/upload')}>register artwork</button>
                    <button className="btn-outline" onClick={() => navigate('/dashboard')}>go to dashboard</button>
                  </>
                ) : (
                  <>
                    <button className="btn-primary" onClick={() => navigate('/register')}>create free account</button>
                    <button className="btn-outline" onClick={() => navigate('/login')}>sign in</button>
                  </>
                )}
              </div>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-label">Cryptographic proof</div>
                <div className="hero-stat-value">RSA signed</div>
                <div className="hero-stat-sub">Certificates are signed by your registered key and validated server-side.</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-label">Replay protection</div>
                <div className="hero-stat-value">One-time challenge</div>
                <div className="hero-stat-sub">Each upload includes a fresh challenge ID and nonce to prevent certificate reuse.</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-label">Verification ready</div>
                <div className="hero-stat-value">Public registry</div>
                <div className="hero-stat-sub">Registered works can be inspected and shared through verification pages.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-tag">Why we built this</div>
            <h2 className="section-title">Ownership signals should be part of the creative workflow</h2>
            <p className="section-sub">Most systems only prove upload time. Registra focuses on proof of process: evidence generated while the artwork is being created, then bound to the artist account that submits it.</p>

            <div className="grid-two">
              <div className="panel">
                <div className="panel-title">What artists need</div>
                <p className="panel-body">Clear, portable proof that survives reposts and attribution loss, without adding heavy manual steps to every project.</p>
              </div>
              <div className="panel" style={{ background: '#efece5' }}>
                <div className="panel-title">What Registra provides</div>
                <p className="panel-body">A signed certificate package, a server-verified registry entry, and a shareable record that others can inspect.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-tag">How it works</div>
            <h2 className="section-title">From sketch to verification in four steps</h2>
            <p className="section-sub">The flow is designed to stay simple for artists and strict for validation.</p>

            <div className="flow">
              {[
                { n: '01', title: 'Install plugin', body: 'Add the GIMP plugin once. It runs locally and records proof snapshots while you create.' },
                { n: '02', title: 'Generate challenge', body: 'Request a one-time challenge in Registra before export. This challenge is embedded in your certificate.' },
                { n: '03', title: 'Export certificate', body: 'Plugin exports artwork + certificate JSON with image hash, challenge values, and RSA signature.' },
                { n: '04', title: 'Submit and verify', body: 'Server validates signature, challenge, and hashes, then records the certified work in your portfolio.' },
              ].map((step, i) => (
                <div className="flow-step" key={i}>
                  <div className="flow-num">{step.n}</div>
                  <div className="flow-title">{step.title}</div>
                  <div className="flow-body">{step.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="trust">
          <div className="trust-wrap">
            <div>
              <div className="section-tag" style={{ color: '#4ca97f' }}>Trust model</div>
              <h2 className="trust-title">What gets verified at upload</h2>
              <p className="trust-sub">We validate multiple signals together. A single signal is not enough for a certification record.</p>
            </div>

            <div className="trust-list">
              <div className="trust-item">
                <div className="trust-item-title">Certificate structure and required fields</div>
                <div className="trust-item-body">Ensures the submitted certificate contains all expected proof components.</div>
              </div>
              <div className="trust-item">
                <div className="trust-item-title">Image hash consistency</div>
                <div className="trust-item-body">The uploaded file hash must match the hash signed inside the certificate.</div>
              </div>
              <div className="trust-item">
                <div className="trust-item-title">Challenge match and single-use behavior</div>
                <div className="trust-item-body">Challenge ID and nonce must match the active challenge issued to the account.</div>
              </div>
              <div className="trust-item">
                <div className="trust-item-title">Registered signing key</div>
                <div className="trust-item-body">Signature verification is checked against the account-bound key registered in profile.</div>
              </div>
            </div>
          </div>
        </section>

        <div className="cta container">
          <div className="cta-title">Ready to own<br /><em>your work?</em></div>
          <p className="cta-sub">
            {isLoggedIn
              ? 'You are signed in. Register your next certified piece or review your portfolio.'
              : 'Start with a free account, upload one certified piece, and publish a verification-ready portfolio.'}
          </p>
          <div className="cta-buttons">
            {isLoggedIn ? (
              <>
                <button className="btn-primary" onClick={() => navigate('/upload')}>register artwork</button>
                <button className="btn-outline" onClick={() => navigate('/dashboard')}>open dashboard</button>
              </>
            ) : (
              <>
                <button className="btn-primary" onClick={() => navigate('/register')}>create free account</button>
                <button className="btn-outline" onClick={() => navigate('/login')}>sign in</button>
              </>
            )}
          </div>
        </div>

        <footer className="footer">
          <div className="footer-logo">Regist<span>ra</span></div>
          <div className="footer-note">© 2026 Registra - art certification authority</div>
        </footer>
      </div>
    </>
  )
}
