import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .about {
    font-family: 'DM Sans', sans-serif;
    background: #F7F5F0;
    min-height: 100vh;
    color: #1a1a1a;
  }

  .btn-primary {
    background: #2D7A5A;
    color: #fff;
    border: none;
    padding: 8px 20px;
    border-radius: 2px;
    font-size: 13px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  .btn-primary:hover { background: #235f45; }

  .btn-outline {
    border: 1px solid #1a1a1a;
    background: transparent;
    padding: 8px 20px;
    border-radius: 2px;
    font-size: 13px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a1a;
  }
  .btn-outline:hover {
    background: #1a1a1a;
    color: #F7F5F0;
  }

  .hero {
    padding: 96px 48px;
    max-width: 700px;
    margin: 0 auto;
    text-align: center;
    border-bottom: 1px solid #e0ddd6;
  }
  .hero-tag {
    font-size: 11px;
    color: #2D7A5A;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 500;
    margin-bottom: 20px;
  }
  .hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: 52px;
    line-height: 1.05;
    letter-spacing: -1px;
    margin-bottom: 24px;
  }
  .hero-title em {
    font-style: italic;
    color: #2D7A5A;
  }
  .hero-body {
    font-size: 16px;
    color: #666;
    line-height: 1.8;
    font-weight: 300;
    max-width: 520px;
    margin: 0 auto 36px;
  }

  .problem {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border-bottom: 1px solid #e0ddd6;
  }
  .problem-left {
    padding: 72px 48px;
    border-right: 1px solid #e0ddd6;
  }
  .problem-right {
    padding: 72px 48px;
    background: #EFECE5;
  }

  .section-tag {
    font-size: 11px;
    color: #2D7A5A;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 500;
    margin-bottom: 16px;
  }
  .section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    letter-spacing: -0.3px;
    margin-bottom: 16px;
    line-height: 1.2;
  }
  .section-body {
    font-size: 14px;
    color: #666;
    line-height: 1.8;
    font-weight: 300;
  }

  .how {
    padding: 72px 48px;
    border-bottom: 1px solid #e0ddd6;
  }
  .how-title {
    font-family: 'DM Serif Display', serif;
    font-size: 32px;
    letter-spacing: -0.5px;
    margin-bottom: 48px;
    text-align: center;
  }
  .how-steps {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: #e0ddd6;
    border: 1px solid #e0ddd6;
  }
  .how-step {
    background: #F7F5F0;
    padding: 32px 24px;
  }
  .step-num {
    font-family: 'DM Serif Display', serif;
    font-size: 36px;
    color: #d7d2c8;
    margin-bottom: 16px;
  }
  .step-title {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
    margin-bottom: 8px;
  }
  .step-body {
    font-size: 12px;
    color: #888;
    line-height: 1.6;
    font-weight: 300;
  }

  .plugin {
    padding: 72px 48px;
    background: #1a1a1a;
    color: #F7F5F0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .plugin-tag {
    font-size: 11px;
    color: #2D7A5A;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 16px;
  }
  .plugin-title {
    font-family: 'DM Serif Display', serif;
    font-size: 32px;
    letter-spacing: -0.5px;
    margin-bottom: 16px;
  }
  .plugin-body {
    font-size: 14px;
    color: #b0b0b0;
    line-height: 1.8;
    font-weight: 300;
    margin-bottom: 28px;
  }
  .plugin-features {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .plugin-feature {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 13px;
    color: #c5c5c5;
    line-height: 1.5;
  }
  .feature-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2D7A5A;
    margin-top: 6px;
    flex-shrink: 0;
  }
  .code-block {
    background: #111;
    border: 1px solid #2a2a2a;
    border-radius: 4px;
    padding: 24px;
    font-family: monospace;
    font-size: 12px;
    color: #7bc4a0;
    line-height: 2;
  }
  .code-comment { color: #555; }

  .cta {
    padding: 96px 48px;
    text-align: center;
    border-top: 1px solid #e0ddd6;
  }
  .cta-title {
    font-family: 'DM Serif Display', serif;
    font-size: 44px;
    letter-spacing: -0.8px;
    margin-bottom: 16px;
  }
  .cta-title em {
    font-style: italic;
    color: #2D7A5A;
  }
  .cta-sub {
    font-size: 15px;
    color: #888;
    margin-bottom: 36px;
    font-weight: 300;
  }
  .cta-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .footer {
    padding: 32px 48px;
    border-top: 1px solid #e0ddd6;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-logo {
    font-family: 'DM Serif Display', serif;
    font-size: 16px;
  }
  .footer-logo span { color: #2D7A5A; }
  .footer-note {
    font-size: 12px;
    color: #aaa;
  }

  @media (max-width: 960px) {
    .problem,
    .plugin,
    .how-steps {
      grid-template-columns: 1fr;
    }

    .problem-left {
      border-right: none;
      border-bottom: 1px solid #e0ddd6;
    }
  }

  @media (max-width: 640px) {
    .hero,
    .problem-left,
    .problem-right,
    .how,
    .plugin,
    .cta,
    .footer {
      padding-left: 20px;
      padding-right: 20px;
    }

    .hero-title {
      font-size: 40px;
    }

    .cta-title {
      font-size: 34px;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }

    .cta-buttons button {
      width: 100%;
      max-width: 280px;
    }

    .footer {
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }
  }
`

export default function About() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <>
      <style>{styles}</style>
      <div className="about">
        <Navbar />

        <div className="hero">
          <div className="hero-tag">About Registra</div>
          <h1 className="hero-title">
            Art ownership
            <br />
            in the <em>age of AI</em>
          </h1>
          <p className="hero-body">
            Artists spend years developing their craft and building a portfolio — but the
            moment they share their work online, they lose control. Registra is built to
            make authorship easier to prove and harder to erase.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '14px' }}
              onClick={() => navigate(user ? '/dashboard' : '/register')}
            >
              {user ? 'go to dashboard' : 'start for free'}
            </button>
          </div>
        </div>

        <div className="problem">
          <div className="problem-left">
            <div className="section-tag">The problem</div>
            <div className="section-title">Art theft is rampant — and getting worse</div>
            <p className="section-body">
              With AI models trained on scraped art, reposts stripping attribution by
              default, and artists expected to manually defend their own work, independent
              creators are left with weak proof and too much friction. Existing tools are
              often expensive, hard to use, or disconnected from the actual creative
              process.
            </p>
          </div>
          <div className="problem-right">
            <div className="section-tag">Our solution</div>
            <div className="section-title">A verifiable record tied to creation itself</div>
            <p className="section-body">
              Registra works at the source — inside your workflow. Our GIMP plugin helps
              generate a signed proof package tied to the artwork you export, giving you a
              stronger record of authorship without turning your process into paperwork.
            </p>
          </div>
        </div>

        <div className="how">
          <div className="how-title">How it works</div>
          <div className="how-steps">
            {[
              {
                n: '01',
                title: 'Install the plugin',
                body: 'Set up the Registra GIMP plugin so your workflow can produce signed proof on export.',
              },
              {
                n: '02',
                title: 'Create as normal',
                body: 'Make your artwork in GIMP without changing how you already work.',
              },
              {
                n: '03',
                title: 'Export to Registra',
                body: 'When finished, export your artwork and proof package to your Registra account.',
              },
              {
                n: '04',
                title: 'Get verification tools',
                body: 'Use your dashboard, certificate records, and reverse search tools to monitor your work online.',
              },
            ].map((s, i) => (
              <div className="how-step" key={i}>
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-body">{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="plugin">
          <div>
            <div className="plugin-tag">The GIMP plugin</div>
            <div className="plugin-title">Proof built into your workflow</div>
            <p className="plugin-body">
              Our Python-based GIMP plugin is designed to fit naturally into the way you
              already create. It prepares proof at export time and connects that proof to
              your Registra account.
            </p>
            <div className="plugin-features">
              {[
                'Works with your existing GIMP-based process',
                'Generates signed proof tied to the exported artwork',
                'Connects uploads to your Registra account and certificates',
                'Pairs with dashboard tools like verification and reverse search',
              ].map((f, i) => (
                <div className="plugin-feature" key={i}>
                  <div className="feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div className="code-block">
            <div className="code-comment"># registra.py — GIMP plugin</div>
            <div className="code-comment"># simplified flow</div>
            <br />
            <div>def export_to_registra(image):</div>
            <div>&nbsp;&nbsp;artwork = build_export(image)</div>
            <div>&nbsp;&nbsp;proof = sign_artwork(artwork)</div>
            <div>&nbsp;&nbsp;send_to_registry(artwork, proof)</div>
            <br />
            <div className="code-comment"># backend verifies signature</div>
            <div>def verify_submission(bundle):</div>
            <div>&nbsp;&nbsp;check_hash(bundle)</div>
            <div>&nbsp;&nbsp;check_signature(bundle)</div>
            <div>&nbsp;&nbsp;store_certificate(bundle)</div>
          </div>
        </div>

        <div className="cta">
          <div className="cta-title">
            Ready to protect
            <br />
            <em>your work?</em>
          </div>
          <p className="cta-sub">
            Build your record of authorship and keep your work easier to verify.
          </p>
          <div className="cta-buttons">
            <button
              className="btn-primary"
              style={{ padding: '13px 32px', fontSize: '14px' }}
              onClick={() => navigate(user ? '/upload' : '/register')}
            >
              {user ? 'upload artwork' : 'create free account'}
            </button>

            {!user && (
              <button
                className="btn-outline"
                style={{ padding: '13px 32px', fontSize: '14px' }}
                onClick={() => navigate('/login')}
              >
                sign in
              </button>
            )}
          </div>
        </div>

        <footer className="footer">
          <div className="footer-logo">
            Regist<span>ra</span>
          </div>
          <div className="footer-note">2026 Registra — art certification authority</div>
        </footer>
      </div>
    </>
  )
}