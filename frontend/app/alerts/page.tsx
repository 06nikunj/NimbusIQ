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
.main{padding:16px 20px;max-width:1440px;margin:0 auto}
.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}
.page-title{font-size:20px;font-weight:700;color:#16191f}
.page-sub{font-size:12px;color:#545b64;margin-top:3px}
.btn{padding:6px 14px;border-radius:3px;font-size:13px;font-weight:500;cursor:pointer;font-family:'Noto Sans',sans-serif;display:flex;align-items:center;gap:5px;transition:all .12s;border:1px solid}
.btn-primary{background:#ff9900;border-color:#ec7211;color:#232f3e;font-weight:700}
.btn-primary:hover{background:#ec7211}
.btn-primary:disabled{background:#aab7b8;border-color:#aab7b8;cursor:not-allowed}
.btn-secondary{background:white;border-color:#aab7b8;color:#16191f}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.stat-card{background:white;border:1px solid #d5dbdb;border-radius:4px;padding:14px 16px;position:relative;overflow:hidden}
.stat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px}
.s-green::after{background:#1d8102}.s-orange::after{background:#ff9900}.s-blue::after{background:#0073bb}.s-red::after{background:#d13212}
.stat-label{font-size:11px;color:#545b64;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px}
.stat-val{font-size:26px;font-weight:700;font-family:'IBM Plex Mono',monospace;line-height:1}
.content-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.panel{background:white;border:1px solid #d5dbdb;border-radius:4px;overflow:hidden}
.panel-header{padding:12px 16px;border-bottom:1px solid #d5dbdb;display:flex;align-items:center;justify-content:space-between;background:#fafafa}
.panel-title{font-size:14px;font-weight:700;color:#16191f;display:flex;align-items:center;gap:8px}
.panel-body{padding:20px}
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:13px;font-weight:600;color:#16191f;margin-bottom:6px}
.form-input{width:100%;padding:7px 10px;font-size:13px;border:1px solid #aab7b8;border-radius:3px;font-family:'IBM Plex Mono',monospace;outline:none;color:#16191f;transition:border-color .15s}
.form-input:focus{border-color:#0073bb;box-shadow:0 0 0 2px rgba(0,115,187,0.12)}
.form-hint{font-size:11px;color:#879596;margin-top:4px}
.error-box{background:#fdf3f1;border:1px solid #f5c6bc;border-left:3px solid #d13212;border-radius:3px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#d13212}
.success-box{background:#f2f8f0;border:1px solid #c3e6cb;border-left:3px solid #1d8102;border-radius:3px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#1d8102}
.aws-table{width:100%;border-collapse:collapse}
.aws-table th{font-size:11px;font-weight:700;color:#545b64;text-transform:uppercase;letter-spacing:.6px;padding:8px 12px;text-align:left;background:#fafafa;border-bottom:1px solid #d5dbdb}
.aws-table td{padding:10px 12px;font-size:13px;border-bottom:1px solid #d5dbdb;vertical-align:middle}
.aws-table tr:last-child td{border-bottom:none}
.aws-table tbody tr:hover td{background:#f8f9fa}
.col-mono{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#545b64}
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:3px;font-size:12px;font-weight:500}
.badge-red{background:#fdf3f1;color:#d13212}
.badge-orange{background:#fef6e4;color:#8d6605}
.empty-box{padding:48px;text-align:center;color:#545b64;font-size:13px}
.empty-icon{font-size:36px;margin-bottom:12px}
.empty-title{font-size:15px;font-weight:600;color:#16191f;margin-bottom:6px}
.footer{background:#232f3e;color:rgba(255,255,255,0.5);font-size:11px;padding:12px 20px;text-align:center;margin-top:20px}
`

interface AlertConfig {
  id: number
  dailyLimit: number
  monthlyLimit: number
  email: string
}

interface AlertHistoryItem {
  id: number
  type: string
  amount: number
  limit: number
  triggeredAt: string
}

interface User {
  id: number
  name: string
  email: string
}

export default function AlertsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [dailyLimit, setDailyLimit] = useState('')
  const [monthlyLimit, setMonthlyLimit] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [alert, setAlert] = useState<AlertConfig | null>(null)
  const [history, setHistory] = useState<AlertHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { setUser(getUser()) }, [])

  function buildHeaders(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    const auth = getAuthHeader()
    if (auth && auth.Authorization) h['Authorization'] = auth.Authorization
    return h
  }

  async function fetchData() {
    try {
      const [alertRes, histRes] = await Promise.all([
        fetch('http://localhost:5000/api/alerts', { headers: buildHeaders() }),
        fetch('http://localhost:5000/api/alerts/history', { headers: buildHeaders() })
      ])
      const alertData = await alertRes.json()
      const histData = await histRes.json()
      if (alertData.success && alertData.data) {
        setAlert(alertData.data)
        setDailyLimit(String(alertData.data.dailyLimit))
        setMonthlyLimit(String(alertData.data.monthlyLimit))
        setEmail(alertData.data.email)
      }
      if (histData.success) setHistory(histData.data)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function handleSave() {
    setError(''); setSuccess('')
    if (!dailyLimit || !monthlyLimit || !email) {
      setError('All fields are required'); return
    }
    setSaving(true)
    try {
      const res = await fetch('http://localhost:5000/api/alerts', {
        method: 'POST', headers: buildHeaders(),
        body: JSON.stringify({
          dailyLimit: parseFloat(dailyLimit),
          monthlyLimit: parseFloat(monthlyLimit),
          email
        })
      })
      const data = await res.json()
      if (!data.success) { setError(data.error); return }
      setAlert(data.data)
      setSuccess('Budget alert configured successfully!')
    } catch {
      setError('Cannot connect to server.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <nav className="nav">
        <div className="nav-logo"><div className="logo-sq">N</div><span className="logo-text">Nimbus<span>IQ</span></span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => router.push('/dashboard')}>Dashboard</button>
          <button className="nav-link" onClick={() => router.push('/ec2')}>Infrastructure</button>
          <button className="nav-link" onClick={() => router.push('/costs')}>Analytics</button>
          <button className="nav-link" onClick={() => router.push('/optimizer')}>AI Optimizer</button>
          <button className="nav-link active">Alerts</button>
          <button className="nav-link" onClick={() => router.push('/settings')}>Settings</button>
        </div>
        <div className="nav-right">
          <div className="region-tag"><div className="rdot"></div>ap-south-1</div>
          <button className="nav-user" onClick={logout}>{user ? user.name : 'User'} ▾</button>
        </div>
      </nav>

      <div className="breadcrumb">
        <button className="bc-link" onClick={() => router.push('/dashboard')}>NimbusIQ</button>
        <span>/</span><span>Budget Alerts</span>
      </div>

      <div className="main">
        <div className="page-header">
          <div>
            <div className="page-title">Budget Alerts</div>
            <div className="page-sub">Configure spending limits and get notified when exceeded</div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card s-green">
            <div className="stat-label">Alert Status</div>
            <div className="stat-val" style={{ color: alert ? '#1d8102' : '#879596', fontSize: 18 }}>{alert ? '● Active' : '○ Not Set'}</div>
          </div>
          <div className="stat-card s-orange">
            <div className="stat-label">Daily Limit</div>
            <div className="stat-val" style={{ color: '#ec7211' }}>{alert ? `$${alert.dailyLimit}` : '—'}</div>
          </div>
          <div className="stat-card s-blue">
            <div className="stat-label">Monthly Limit</div>
            <div className="stat-val" style={{ color: '#0073bb' }}>{alert ? `$${alert.monthlyLimit}` : '—'}</div>
          </div>
          <div className="stat-card s-red">
            <div className="stat-label">Alerts Triggered</div>
            <div className="stat-val" style={{ color: '#d13212' }}>{history.length}</div>
          </div>
        </div>

        <div className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">🔔 Configure Budget Alert</div>
            </div>
            <div className="panel-body">
              {error && <div className="error-box">⚠ {error}</div>}
              {success && <div className="success-box">✓ {success}</div>}

              <div className="form-group">
                <label className="form-label">Daily Spend Limit ($)</label>
                <input className="form-input" type="number" step="0.01" value={dailyLimit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDailyLimit(e.target.value)} placeholder="2.00" />
                <div className="form-hint">You will be alerted when daily AWS spend exceeds this amount</div>
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Spend Limit ($)</label>
                <input className="form-input" type="number" step="0.01" value={monthlyLimit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonthlyLimit(e.target.value)} placeholder="50.00" />
                <div className="form-hint">You will be alerted when month-to-date spend exceeds this amount</div>
              </div>

              <div className="form-group">
                <label className="form-label">Notification Email</label>
                <input className="form-input" type="email" value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="you@example.com" />
                <div className="form-hint">Alert notifications will be sent to this email</div>
              </div>

              <button className="btn btn-primary" onClick={handleSave} disabled={saving}
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                {saving ? '⏳ Saving...' : alert ? '↻ Update Alert' : '🔔 Create Alert'}
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">📋 Alert History</div>
              <span style={{ fontSize: 12, color: '#879596' }}>{history.length} total</span>
            </div>
            {loading ? (
              <div className="empty-box">Loading...</div>
            ) : history.length === 0 ? (
              <div className="empty-box">
                <div className="empty-icon">🔔</div>
                <div className="empty-title">No alerts triggered yet</div>
                <div style={{ fontSize: 13, color: '#545b64' }}>
                  When your AWS spend exceeds configured limits, alerts will appear here.
                </div>
              </div>
            ) : (
              <table className="aws-table">
                <thead>
                  <tr><th>Type</th><th>Amount</th><th>Limit</th><th>Triggered</th></tr>
                </thead>
                <tbody>
                  {history.map((item: AlertHistoryItem) => (
                    <tr key={item.id}>
                      <td>
                        <span className={`badge ${item.type === 'daily' ? 'badge-orange' : 'badge-red'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td><span className="col-mono" style={{ fontWeight: 600 }}>${item.amount.toFixed(2)}</span></td>
                      <td><span className="col-mono">${item.limit.toFixed(2)}</span></td>
                      <td><span className="col-mono" style={{ fontSize: 11 }}>
                        {new Date(item.triggeredAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="footer">NimbusIQ · Budget Alerts · © 2026</div>
    </>
  )
}
