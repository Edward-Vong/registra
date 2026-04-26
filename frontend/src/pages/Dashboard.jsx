import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .dash { font-family: 'DM Sans', sans-serif; background: #F7F5F0; min-height: 100vh; color: #1a1a1a; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 48px; border-bottom: 1px solid #e0ddd6; background: #F7F5F0; position: sticky; top: 0; z-index: 10; }
  .logo { font-family: 'DM Serif Display', serif; font-size: 20px; letter-spacing: -0.3px; color: #1a1a1a; cursor: pointer; }
  .logo span { color: #2D7A5A; }
  .btn-primary { background: #2D7A5A; color: #fff; border: none; padding: 8px 20px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .btn-primary:hover { background: #235f45; }
  .btn-outline { border: 1px solid #1a1a1a; background: transparent; padding: 8px 20px; border-radius: 2px; font-size: 13px; cursor: pointer; font-family: 'DM Sans', sans-serif; color: #1a1a1a; }
  .container { max-width: 1000px; margin: 0 auto; padding: 56px 24px; }
  .dash-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
  .dash-title { font-family: 'DM Serif Display', serif; font-size: 32px; letter-spacing: -0.5px; }
  .dash-sub { font-size: 13px; color: #999; margin-top: 6px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #e0ddd6; border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; margin-bottom: 40px; }
  .stat { background: #fff; padding: 24px 28px; }
  .stat-label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .stat-value { font-family: 'DM Serif Display', serif; font-size: 36px; color: #1a1a1a; }
  .stat-note { font-size: 12px; color: #2D7A5A; margin-top: 4px; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .section-title { font-size: 12px; font-weight: 500; color: #555; text-transform: uppercase; letter-spacing: 0.08em; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 48px; }
  .artwork-card { background: #fff; border: 1px solid #e0ddd6; border-radius: 4px; overflow: hidden; cursor: pointer; transition: transform 0.15s; }
  .artwork-card:hover { transform: translateY(-2px); }
  .thumb { height: 140px; position: relative; }
  .thumb-1 { background: linear-gradient(135deg, #c8e6d4, #7bc4a0); }
  .thumb-2 { background: linear-gradient(135deg, #d4c8e6, #a07bc4); }
  .thumb-3 { background: linear-gradient(135deg, #e6d4c8, #c4a07b); }
  .thumb-4 { background: linear-gradient(135deg, #c8d4e6, #7ba0c4); }
  .thumb-5 { background: linear-gradient(135deg, #e6c8d4, #c47ba0); }
  .thumb-6 { background: linear-gradient(135deg, #d4e6c8, #a0c47b); }
  .badge { position: absolute; top: 8px; right: 8px; background: #2D7A5A; color: #fff; font-size: 10px; padding: 3px 9px; border-radius: 20px; }
  .card-body { padding: 14px 16px; }
  .card-title { font-size: 13px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px; }
  .card-date { font-size: 11px; color: #aaa; margin-bottom: 6px; }
  .card-hash { font-family: monospace; font-size: 10px; color: #bbb; }
  .api-box { background: #1a1a1a; border-radius: 4px; padding: 28px 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
  .api-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .api-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #F7F5F0; margin-bottom: 10px; }
  .api-sub { font-size: 13px; color: #777; line-height: 1.6; font-weight: 300; }
  .api-code { background: #111; border: 1px solid #333; border-radius: 3px; padding: 16px 20px; font-family: monospace; font-size: 11px; color: #7bc4a0; line-height: 1.8; }
  .api-comment { color: #555; }
  .tier-badge { display: inline-flex; align-items: center; gap: 6px; background: #e8f5ef; color: #2D7A5A; font-size: 12px; padding: 4px 12px; border-radius: 20px; font-weight: 500; }
`

const artworks = [
  { title: 'Forest Study No. 3', date: 'Apr 18, 2026', hash: 'a3f8...c21d', cls: 'thumb-1' },
  { title: 'Neon Botanica', date: 'Mar 2, 2026', hash: 'b19e...77fa', cls: 'thumb-2' },
  { title: 'Character Sheet 01', date: 'Jan 14, 2026', hash: 'f402...9b3c', cls: 'thumb-3' },
  { title: 'Urban Sketch #7', date: 'Dec 3, 2025', hash: 'c881...d4ae', cls: 'thumb-4' },
  { title: 'Portrait Study', date: 'Nov 20, 2025', hash: 'e230...ff12', cls: 'thumb-5' },
  { title: 'Abstract No. 1', date: 'Oct 5, 2025', hash: '9b44...7c01', cls: 'thumb-6' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  return (
    <>
      <style>{styles}</style>
      <div className="dash">
        <Navbar loggedIn={true}/>
        <div className="container">
          <div className="dash-header">
            <div>
              <div className="dash-title">My portfolio</div>
              <div className="dash-sub">All your registered and verified works</div>
            </div>
            <div className="tier-badge">✓ Gold tier</div>
          </div>

          <div className="stats">
            <div className="stat"><div className="stat-label">Registered works</div><div className="stat-value">12</div><div className="stat-note">+2 this month</div></div>
            <div className="stat"><div className="stat-label">API calls</div><div className="stat-value">340</div><div className="stat-note">last 30 days</div></div>
            <div className="stat"><div className="stat-label">Profile views</div><div className="stat-value">1.2k</div><div className="stat-note">last 30 days</div></div>
          </div>

          <div className="section-header">
            <div className="section-title">Verified works</div>
            <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => navigate('/upload')}>+ add new</button>
          </div>
          <div className="grid">
            {artworks.map((a, i) => (
              <div className="artwork-card" key={i}>
                <div className={`thumb ${a.cls}`}><div className="badge">✓ verified</div></div>
                <div className="card-body">
                  <div className="card-title">{a.title}</div>
                  <div className="card-date">{a.date}</div>
                  <div className="card-hash">{a.hash}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="api-box">
            <div>
              <div className="api-label">Your API endpoint</div>
              <div className="api-title">Let anyone verify your work</div>
              <div className="api-sub">Share this endpoint so platforms and clients can confirm authorship automatically.</div>
            </div>
            <div>
              <div className="api-code">
                <div className="api-comment"># verify by hash</div>
                <div>GET /api/verify?artist=@artist</div>
                <br />
                <div className="api-comment"># returns</div>
                <div>{'{ "verified": true, ... }'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
