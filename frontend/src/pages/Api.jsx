import Navbar from '../components/Navbar'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .api-page { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }
  .container { max-width: 1120px; margin: 0 auto; padding: 56px 24px 80px; }

  .hero {
    border: 1px solid #ddd9d1;
    background: linear-gradient(135deg, #f3eee4, #e7f0e8);
    border-radius: 6px;
    padding: 34px;
    margin-bottom: 26px;
  }
  .hero-top { display: flex; justify-content: space-between; align-items: center; gap: 14px; margin-bottom: 14px; }
  .tag {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #2D7A5A;
    font-weight: 500;
  }
  .poc {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #7a746b;
    border: 1px solid #c8c2b8;
    background: #f7f3ec;
    border-radius: 999px;
    padding: 4px 10px;
  }
  .hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: 44px;
    letter-spacing: -0.7px;
    line-height: 1.1;
    margin-bottom: 12px;
  }
  .hero-sub {
    font-size: 15px;
    color: #666;
    line-height: 1.75;
    max-width: 760px;
  }

  .grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; margin-bottom: 18px; }
  .card { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; }
  .card-head {
    padding: 12px 16px;
    border-bottom: 1px solid #ece9e2;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #888;
    font-weight: 500;
  }
  .card-body { padding: 16px; }

  .endpoint-list { display: grid; gap: 10px; }
  .endpoint {
    border: 1px solid #ece9e2;
    border-radius: 4px;
    padding: 12px;
    background: #fdfcf9;
  }
  .endpoint-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .method {
    font-size: 11px;
    font-weight: 600;
    border-radius: 999px;
    padding: 2px 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .method.get { background: #e8f5ef; color: #235f45; }
  .method.post { background: #fef3c7; color: #8a5a00; }
  .path { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #222; }
  .endpoint-desc { font-size: 12px; color: #777; line-height: 1.6; }

  .meta-list { display: grid; gap: 10px; }
  .meta-item { border-bottom: 1px solid #f0ede8; padding-bottom: 8px; }
  .meta-item:last-child { border-bottom: none; padding-bottom: 0; }
  .meta-k { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
  .meta-v { font-size: 13px; color: #222; line-height: 1.6; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; color: #333; }

  .code { background: #161616; color: #8fe3bd; border-radius: 4px; padding: 14px; overflow: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; line-height: 1.6; }
  .code-comment { color: #5b5b5b; }
  .stack { display: grid; gap: 18px; }

  .note {
    border: 1px solid #e0ddd6;
    border-radius: 4px;
    background: #f9f7f2;
    padding: 14px 16px;
    font-size: 12px;
    color: #777;
    line-height: 1.65;
  }

  @media (max-width: 980px) {
    .grid { grid-template-columns: 1fr; }
    .hero-title { font-size: 36px; }
  }
`

export default function Api() {
  return (
    <div className="api-page">
      <style>{styles}</style>
      <Navbar />

      <div className="container">
        <section className="hero">
          <div className="hero-top">
            <div className="tag">Developer Access</div>
            <div className="poc">Proof of Concept</div>
          </div>
          <h1 className="hero-title">Registra API</h1>
          <p className="hero-sub">
            This page is a UI/UX proof of concept for API docs. It presents endpoint shape,
            expected auth model, and sample payloads for verification workflows.
          </p>
        </section>

        <div className="grid">
          <div className="stack">
            <div className="card">
              <div className="card-head">Core Endpoints</div>
              <div className="card-body endpoint-list">
                <div className="endpoint">
                  <div className="endpoint-meta">
                    <span className="method get">GET</span>
                    <span className="path">/api/verify?hash=:hash</span>
                  </div>
                  <div className="endpoint-desc">Verify an artwork fingerprint and retrieve ownership metadata.</div>
                </div>
                <div className="endpoint">
                  <div className="endpoint-meta">
                    <span className="method post">POST</span>
                    <span className="path">/api/me/upload-challenge</span>
                  </div>
                  <div className="endpoint-desc">Issue a one-time challenge to bind certificate exports to an authenticated account.</div>
                </div>
                <div className="endpoint">
                  <div className="endpoint-meta">
                    <span className="method post">POST</span>
                    <span className="path">/api/register-with-cert</span>
                  </div>
                  <div className="endpoint-desc">Submit artwork file, proof file, and signed certificate bundle for registration.</div>
                </div>
                <div className="endpoint">
                  <div className="endpoint-meta">
                    <span className="method post">POST</span>
                    <span className="path">/api/certificates/:id/reverse-search</span>
                  </div>
                  <div className="endpoint-desc">Run reverse image search on your own registered piece to find potential reposts.</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">Sample Response</div>
              <div className="card-body">
                <pre className="code">
{`{
  "verified": true,
  "artist": {
    "username": "@artist_handle",
    "profile_url": "https://registra.app/u/artist_handle"
  },
  "artwork": {
    "title": "Forest Study No. 3",
    "hash": "e23a...9f7c",
    "registered_at": "2026-04-26T02:00:31Z"
  },
  "certificate": {
    "status": "verified",
    "certificate_id": "c40e5c4d-cc84-4f8b-8099-e3b518ffbc96"
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          <div className="stack">
            <div className="card">
              <div className="card-head">Authentication</div>
              <div className="card-body meta-list">
                <div className="meta-item">
                  <div className="meta-k">Scheme</div>
                  <div className="meta-v">Bearer token (Supabase access token)</div>
                </div>
                <div className="meta-item">
                  <div className="meta-k">Header</div>
                  <div className="meta-v mono">Authorization: Bearer &lt;token&gt;</div>
                </div>
                <div className="meta-item">
                  <div className="meta-k">Public endpoints</div>
                  <div className="meta-v">Verification lookup may be public; mutation endpoints require user auth.</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head">Request Example</div>
              <div className="card-body">
                <pre className="code">
{`# register artwork with certificate
POST /api/register-with-cert
Authorization: Bearer <token>
Content-Type: multipart/form-data

file=<artwork.png>
proof_file=<timelapse.mp4>
proof_type=timelapse
title=Forest Study No. 3
cert=<certificate json>`}
                </pre>
              </div>
            </div>

            <div className="note">
              <div className="code-comment">Roadmap note</div>
              This is an interface preview only. Production docs would include versioning,
              schema references, webhooks, and SDK examples.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
