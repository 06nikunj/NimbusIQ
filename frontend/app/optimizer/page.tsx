'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthHeader, getUser, logout } from '../../lib/auth.js'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f2f3f3;color:#16191f;font-family:'Noto Sans',sans-serif;font-size:14px;min-height:100vh}
.nav{background:#232f3e;height:48px;display:flex;align-items:center;padding:0 16px;position:sticky;top:0;z-index:100}
.nav-logo{display:flex;align-items:center;gap:8px;padding-right:20px;border-right:1px solid rgba(255,255,255,0.15);margin-right:4px}
.logo-sq{width:22px;height:22px;background:#ff9900;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#232f3e;flex-shrink:0}
.logo-text{font-size:15px;font-weight:700;color:white}
.logo-text span{color:#ff9900}
.nav-links{display:flex;flex:1}
.nav-link{padding:0 12px;height:48px;display:flex;align-items:center;font-size:13px;color:rgba(255,255,255,0.85);cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;gap:4px;white-space:nowrap;background:none;border-left:none;border-right:none;border-top:none;font-family:'Noto Sans',sans-serif}
.nav-link:hover{color:white;background:rgba(255,255,255,0.08)}
.nav-link.active{color:white;border-bottom-color:#ff9900}
.nav-right{display:flex;align-items:center;gap:8px;margin-left:auto}
.region-tag{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:3px;padding:3px 8px;font-size:11px;font-family:'IBM Plex Mono',monospace;color:rgba(255,255,255,0.8);display:flex;align-items:center;gap:5px}
.rdot{width:6px;height:6px;border-radius:50%;background:#67c918;flex-shrink:0}
.nav-user{color:rgba(255,255,255,0.85);font-size:12px;padding:4px 10px;cursor:pointer;display:flex;align-items:center;gap:4px;background:none;border:none;font-family:'Noto Sans',sans-serif}
.breadcrumb{background:white;border-bottom:1px solid #d5dbdb;padding:8px 20px;display:flex;align-items:center;gap:6px;font-size:12px;color:#879596}
.bc-link{color:#0073bb;cursor:pointer;background:none;border:none;font-size:12px;font-family:'Noto Sans',sans-serif;padding:0}
.bc-link:hover{text-decoration:underline}
.main{padding:16px 20px;max-width:1440px;margin:0 auto}
.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}
.page-title{font-size:20px;font-weight:700;color:#16191f}
.page-sub{font-size:12px;color:#545b64;margin-top:3px}
.btn{padding:6px 14px;border-radius:3px;font-size:13px;font-weight:500;cursor:pointer;font-family:'Noto Sans',sans-serif;display:flex;align-items:center;gap:5px;transition:all .12s;border:1px solid}
.btn-primary{background:#ff9900;border-color:#ec7211;color:#232f3e;font-weight:700}
.btn-primary:hover{background:#ec7211}
.btn-primary:disabled{background:#aab7b8;border-color:#aab7b8;cursor:not-allowed}
.btn-secondary{background:white;border-color:#aab7b8;color:#16191f}
.btn-secondary:hover{background:#f2f3f3}
.btn-sm{font-size:11px;padding:4px 8px}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.stat-card{background:white;border:1px solid #d5dbdb;border-radius:4px;padding:14px 16px;position:relative;overflow:hidden}
.stat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px}
.s-blue::after{background:#0073bb}.s-green::after{background:#1d8102}.s-orange::after{background:#ff9900}.s-purple::after{background:#8d6605}
.stat-label{font-size:11px;color:#545b64;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px}
.stat-val{font-size:26px;font-weight:700;font-family:'IBM Plex Mono',monospace;line-height:1}
.panel{background:white;border:1px solid #d5dbdb;border-radius:4px;overflow:hidden;margin-bottom:12px}
.panel-header{padding:12px 16px;border-bottom:1px solid #d5dbdb;display:flex;align-items:center;justify-content:space-between;background:#fafafa}
.panel-title{font-size:14px;font-weight:700;color:#16191f;display:flex;align-items:center;gap:8px}
.rec-item{display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid #d5dbdb;transition:background .1s}
.rec-item:last-child{border-bottom:none}
.rec-item:hover{background:#f8f9fa}
.rec-bar{width:4px;border-radius:2px;flex-shrink:0;align-self:stretch}
.bar-high{background:#d13212}.bar-medium{background:#ff9900}.bar-low{background:#1d8102}
.rec-body{flex:1;min-width:0}
.rec-resource{font-size:13px;font-weight:600;color:#0073bb;margin-bottom:4px;font-family:'IBM Plex Mono',monospace}
.rec-text{font-size:13px;color:#545b64;line-height:1.5;margin-bottom:8px}
.rec-footer{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.rec-tag{padding:2px 8px;border-radius:3px;font-size:11px;font-weight:500;border:1px solid}
.tag-high{background:#fdf3f1;color:#d13212;border-color:#f5c6bc}
.tag-medium{background:#fef6e4;color:#8d6605;border-color:#f5d97a}
.tag-low{background:#f2f8f0;color:#1d8102;border-color:#c3e6cb}
.tag-pending{background:#f0f7ff;color:#0073bb;border-color:#b3d5f0}
.tag-applied{background:#f2f8f0;color:#1d8102;border-color:#c3e6cb}
.tag-dismissed{background:#f2f3f3;color:#545b64;border-color:#d5dbdb}
.rec-saving{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:700;color:#1d8102;margin-left:auto}
.savings-box{background:#f2f8f0;border:1px solid #c3e6cb;border-radius:3px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;margin:12px 16px}
.savings-label{font-size:11px;color:#1d8102;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
.savings-val{font-size:22px;font-weight:700;font-family:'IBM Plex Mono',monospace;color:#1d8102}
.loading-box{padding:48px;text-align:center;color:#545b64;font-size:13px}
.loading-spin{width:24px;height:24px;border:2px solid #d5dbdb;border-top-color:#0073bb;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-box{padding:48px;text-align:center;color:#545b64}
.empty-icon{font-size:40px;margin-bottom:12px}
.empty-title{font-size:15px;font-weight:600;color:#16191f;margin-bottom:6px}
.empty-sub{font-size:13px;color:#545b64;margin-bottom:16px}
.error-banner{background:#fdf3f1;border:1px solid #f5c6bc;border-left:4px solid #d13212;border-radius:3px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#d13212}
.info-banner{background:#f0f7ff;border:1px solid #b3d5f0;border-left:4px solid #0073bb;border-radius:3px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#0073bb}
.footer{background:#232f3e;color:rgba(255,255,255,0.5);font-size:11px;padding:12px 20px;text-align:center;margin-top:20px}
`

interface Recommendation {
  id?: number
  resource: string
  recommendation: string
  saving: number
  priority: string
  status?: string
  category?: string
}

interface User {
  id: number
  name: string
  email: string
}

export default function OptimizerPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => { setUser(getUser()) }, [])

  function buildHeaders(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    const auth = getAuthHeader()
    if (auth && auth.Authorization) h['Authorization'] = auth.Authorization
    return h
  }

  async function fetchRecommendations() {
    try {
      const res = await fetch('https://nimbusiq.onrender.com/api/optimizer/recommendations', {
        headers: buildHeaders()
      })
      const data = await res.json()
      if (data.success) setRecommendations(data.data)
    } catch {
      // silent — page will show empty state
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRecommendations() }, [])

  async function runAnalysis() {
    setError('')
    setSuccess('')
    setAnalyzing(true)
    try {
      const res = await fetch('https://nimbusiq.onrender.com/api/optimizer/analyze', {
        method: 'POST', headers: buildHeaders()
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }
      setSuccess(`Analysis complete! Found ${data.data.length} recommendations with $${data.totalSaving} potential monthly savings.`)
      // Re-fetch from database to get records with proper IDs and statuses
      // This makes Apply/Dismiss buttons work and Pending count accurate
      await fetchRecommendations()
    } catch {
      setError('Cannot connect to backend. Make sure the server is running.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function updateStatus(id: number, newStatus: string) {
    try {
      await fetch(`https://nimbusiq.onrender.com/api/optimizer/${id}/status`, {
        method: 'PATCH', headers: buildHeaders(),
        body: JSON.stringify({ status: newStatus })
      })
      setRecommendations(prev =>
        prev.map(r => r.id === id ? { ...r, status: newStatus } : r)
      )
    } catch {
      // silent
    }
  }

  const pending = recommendations.filter(r => r.status === 'pending').length
  const applied = recommendations.filter(r => r.status === 'applied').length
  const totalSaving = recommendations
    .filter(r => r.status !== 'dismissed')
    .reduce((sum: number, r: Recommendation) => sum + r.saving, 0)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <nav className="nav">
        <div className="nav-logo"><div className="logo-sq">N</div><span className="logo-text">Nimbus<span>IQ</span></span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => router.push('/dashboard')}>Dashboard</button>
          <button className="nav-link" onClick={() => router.push('/ec2')}>Infrastructure</button>
          <button className="nav-link" onClick={() => router.push('/costs')}>Analytics</button>
          <button className="nav-link active">AI Optimizer</button>
          <button className="nav-link" onClick={() => router.push('/alerts')}>Alerts</button>
          <button className="nav-link" onClick={() => router.push('/settings')}>Settings</button>
        </div>
        <div className="nav-right">
          <div className="region-tag"><div className="rdot"></div>ap-south-1</div>
          <button className="nav-user" onClick={logout}>{user ? user.name : 'User'} ▾</button>
        </div>
      </nav>

      <div className="breadcrumb">
        <button className="bc-link" onClick={() => router.push('/dashboard')}>NimbusIQ</button>
        <span>/</span><span>AI Cost Optimizer</span>
      </div>

      <div className="main">
        <div className="page-header">
          <div>
            <div className="page-title">AI Cost Optimizer</div>
            <div className="page-sub">Rule-based analysis engine · Analyzes your AWS resources for cost savings</div>
          </div>
          <button className="btn btn-primary" onClick={runAnalysis} disabled={analyzing}>
            {analyzing ? '⏳ Analyzing...' : '⚡ Run AI Analysis'}
          </button>
        </div>

        {error && <div className="error-banner">⚠ {error}</div>}
        {success && <div className="info-banner">✓ {success}</div>}

        <div className="stats-row">
          <div className="stat-card s-blue">
            <div className="stat-label">Total Recommendations</div>
            <div className="stat-val" style={{ color: '#0073bb' }}>{recommendations.length}</div>
          </div>
          <div className="stat-card s-green">
            <div className="stat-label">Potential Savings / mo</div>
            <div className="stat-val" style={{ color: '#1d8102' }}>${totalSaving.toFixed(2)}</div>
          </div>
          <div className="stat-card s-orange">
            <div className="stat-label">Applied</div>
            <div className="stat-val" style={{ color: '#1d8102' }}>{applied}</div>
          </div>
          <div className="stat-card s-purple">
            <div className="stat-label">Pending Review</div>
            <div className="stat-val" style={{ color: '#8d6605' }}>{pending}</div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              Recommendations
              {recommendations.length > 0 && <span className="rec-tag tag-pending">{pending} pending</span>}
            </div>
          </div>

          {loading ? (
            <div className="loading-box"><div className="loading-spin"></div>Loading recommendations...</div>
          ) : recommendations.length === 0 ? (
            <div className="empty-box">
              <div className="empty-icon">🤖</div>
              <div className="empty-title">No recommendations yet</div>
              <div className="empty-sub">Click &quot;Run AI Analysis&quot; to scan your AWS infrastructure for cost-saving opportunities.</div>
              <button className="btn btn-primary" onClick={runAnalysis} disabled={analyzing}>
                {analyzing ? '⏳ Analyzing...' : '⚡ Run AI Analysis'}
              </button>
            </div>
          ) : (
            <>
              {recommendations.map((rec: Recommendation, idx: number) => (
                <div key={rec.id ? rec.id : `rec-${idx}`} className="rec-item">
                  <div className={`rec-bar bar-${rec.priority}`}></div>
                  <div className="rec-body">
                    <div className="rec-resource">{rec.resource}</div>
                    <div className="rec-text">{rec.recommendation}</div>
                    <div className="rec-footer">
                      <span className={`rec-tag tag-${rec.priority}`}>
                        {rec.priority} priority
                      </span>
                      <span className={`rec-tag tag-${rec.status || 'pending'}`}>
                        {rec.status || 'pending'}
                      </span>
                      {(rec.status === 'pending' || !rec.status) && rec.id && (
                        <>
                          <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(rec.id!, 'applied')}>
                            ✓ Apply
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(rec.id!, 'dismissed')}>
                            ✕ Dismiss
                          </button>
                        </>
                      )}
                      <span className="rec-saving">Save ${rec.saving.toFixed(2)}/mo</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="savings-box">
                <div>
                  <div className="savings-label">Total potential savings</div>
                  <div className="savings-val">${totalSaving.toFixed(2)} / month</div>
                </div>
                <button className="btn btn-primary" onClick={runAnalysis} disabled={analyzing}>
                  {analyzing ? '⏳ Re-analyzing...' : '↻ Re-analyze'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="footer">NimbusIQ · AI Cost Optimizer · © 2026</div>
    </>
  )
}