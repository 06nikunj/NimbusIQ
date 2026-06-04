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
.main{padding:16px 20px;max-width:900px;margin:0 auto}
.page-header{margin-bottom:16px}
.page-title{font-size:20px;font-weight:700;color:#16191f}
.page-sub{font-size:12px;color:#545b64;margin-top:3px}
.btn{padding:6px 14px;border-radius:3px;font-size:13px;font-weight:500;cursor:pointer;font-family:'Noto Sans',sans-serif;display:flex;align-items:center;gap:5px;transition:all .12s;border:1px solid}
.btn-primary{background:#ff9900;border-color:#ec7211;color:#232f3e;font-weight:700}
.btn-primary:hover{background:#ec7211}
.btn-secondary{background:white;border-color:#aab7b8;color:#16191f}
.btn-secondary:hover{background:#f2f3f3}
.btn-danger{background:#d13212;border-color:#b7280f;color:white;font-weight:600}
.btn-danger:hover{background:#b7280f}
.btn-success{background:#1d8102;border-color:#16650c;color:white;font-weight:600}
.btn-success:hover{background:#16650c}
.panel{background:white;border:1px solid #d5dbdb;border-radius:4px;overflow:hidden;margin-bottom:16px}
.panel-header{padding:12px 16px;border-bottom:1px solid #d5dbdb;display:flex;align-items:center;justify-content:space-between;background:#fafafa}
.panel-title{font-size:14px;font-weight:700;color:#16191f;display:flex;align-items:center;gap:8px}
.panel-body{padding:16px}
.info-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #d5dbdb;font-size:13px}
.info-row:last-child{border-bottom:none}
.info-label{color:#545b64;font-weight:500}
.info-value{font-weight:600;color:#16191f;font-family:'IBM Plex Mono',monospace;font-size:13px}
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:3px;font-size:12px;font-weight:500}
.bdot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.badge-green{background:#f2f8f0;color:#1d8102}
.badge-green .bdot{background:#1d8102}
.badge-red{background:#fdf3f1;color:#d13212}
.badge-red .bdot{background:#d13212}
.badge-orange{background:#fef6e4;color:#8d6605}
.badge-orange .bdot{background:#8d6605}
.btn-row{display:flex;gap:8px;margin-top:12px}
.success-box{background:#f2f8f0;border:1px solid #c3e6cb;border-left:3px solid #1d8102;border-radius:3px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#1d8102}
.error-box{background:#fdf3f1;border:1px solid #f5c6bc;border-left:3px solid #d13212;border-radius:3px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#d13212}
.danger-panel{border-color:#d13212}
.danger-panel .panel-header{background:#fdf3f1;border-bottom-color:#f5c6bc}
.danger-panel .panel-title{color:#d13212}
.footer{background:#232f3e;color:rgba(255,255,255,0.5);font-size:11px;padding:12px 20px;text-align:center;margin-top:20px}
`

interface User {
  id: number
  name: string
  email: string
}

interface CredStatus {
  hasCredentials: boolean
  isVerified?: boolean
  region?: string
  createdAt?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [creds, setCreds] = useState<CredStatus | null>(null)
  const [serverStatus, setServerStatus] = useState('checking')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [testing, setTesting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { setUser(getUser()) }, [])

  function buildHeaders(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    const auth = getAuthHeader()
    if (auth && auth.Authorization) h['Authorization'] = auth.Authorization
    return h
  }

  async function fetchData() {
    try {
      const [credRes, healthRes] = await Promise.all([
        fetch('http://localhost:5000/api/credentials', { headers: buildHeaders() }),
        fetch('http://localhost:5000/health')
      ])
      const credData = await credRes.json()
      if (credData.success) setCreds(credData)
      const healthData = await healthRes.json()
      setServerStatus(healthData.status === 'ok' ? 'online' : 'error')
    } catch {
      setServerStatus('offline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function handleTest() {
    setError(''); setSuccess(''); setTesting(true)
    try {
      const res = await fetch('http://localhost:5000/api/credentials/test', {
        method: 'POST', headers: buildHeaders()
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('AWS connection verified successfully!')
        setCreds(prev => prev ? { ...prev, isVerified: true } : prev)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Connection test failed.')
    } finally {
      setTesting(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to remove your AWS credentials? You will need to re-enter them to use NimbusIQ.')) return
    setError(''); setSuccess(''); setDeleting(true)
    try {
      const res = await fetch('http://localhost:5000/api/credentials', {
        method: 'DELETE', headers: buildHeaders()
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('AWS credentials removed.')
        setCreds({ hasCredentials: false })
      } else {
        setError(data.error)
      }
    } catch {
      setError('Failed to remove credentials.')
    } finally {
      setDeleting(false)
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
          <button className="nav-link" onClick={() => router.push('/alerts')}>Alerts</button>
          <button className="nav-link active">Settings</button>
        </div>
        <div className="nav-right">
          <div className="region-tag"><div className="rdot"></div>ap-south-1</div>
          <button className="nav-user" onClick={logout}>{user ? user.name : 'User'} ▾</button>
        </div>
      </nav>

      <div className="breadcrumb">
        <button className="bc-link" onClick={() => router.push('/dashboard')}>NimbusIQ</button>
        <span>/</span><span>Settings</span>
      </div>

      <div className="main">
        <div className="page-header">
          <div className="page-title">Settings</div>
          <div className="page-sub">Manage your account and AWS configuration</div>
        </div>

        {error && <div className="error-box">⚠ {error}</div>}
        {success && <div className="success-box">✓ {success}</div>}

        {/* Account Info */}
        <div className="panel">
          <div className="panel-header"><div className="panel-title">👤 Account Information</div></div>
          <div className="panel-body">
            <div className="info-row">
              <span className="info-label">Name</span>
              <span className="info-value">{user ? user.name : '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user ? user.email : '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Account ID</span>
              <span className="info-value">{user ? user.id : '—'}</span>
            </div>
          </div>
        </div>

        {/* AWS Credentials */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">☁️ AWS Credentials</div>
            {creds && creds.hasCredentials && (
              <span className={`badge ${creds.isVerified ? 'badge-green' : 'badge-orange'}`}>
                <span className="bdot"></span>
                {creds.isVerified ? 'Verified' : 'Unverified'}
              </span>
            )}
          </div>
          <div className="panel-body">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#879596' }}>Loading...</div>
            ) : !creds || !creds.hasCredentials ? (
              <>
                <div className="info-row">
                  <span className="info-label">Connection Status</span>
                  <span className="badge badge-red"><span className="bdot"></span>Not Connected</span>
                </div>
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={() => router.push('/setup')}>
                    🔑 Connect AWS Account
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="info-row">
                  <span className="info-label">Connection Status</span>
                  <span className="badge badge-green"><span className="bdot"></span>Connected</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Region</span>
                  <span className="info-value">{creds.region || 'ap-south-1'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Verified</span>
                  <span className="info-value">{creds.isVerified ? '✓ Yes' : '✕ No'}</span>
                </div>
                {creds.createdAt && (
                  <div className="info-row">
                    <span className="info-label">Connected Since</span>
                    <span className="info-value">
                      {new Date(creds.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                    </span>
                  </div>
                )}
                <div className="btn-row">
                  <button className="btn btn-success" onClick={handleTest} disabled={testing}>
                    {testing ? '⏳ Testing...' : '⚡ Test Connection'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => router.push('/setup')}>
                    🔑 Update Credentials
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                    {deleting ? '⏳ Removing...' : '🗑 Remove'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Application */}
        <div className="panel">
          <div className="panel-header"><div className="panel-title">⚙️ Application</div></div>
          <div className="panel-body">
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-value">NimbusIQ v1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">API Server</span>
              <span className={`badge ${serverStatus === 'online' ? 'badge-green' : 'badge-red'}`}>
                <span className="bdot"></span>
                {serverStatus === 'online' ? 'Online' : serverStatus === 'checking' ? 'Checking...' : 'Offline'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">API Endpoint</span>
              <span className="info-value">http://localhost:5000</span>
            </div>
            <div className="info-row">
              <span className="info-label">AI Engine</span>
              <span className="info-value">Rule-Based Analyzer v1.0</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="panel danger-panel">
          <div className="panel-header"><div className="panel-title">⚠️ Danger Zone</div></div>
          <div className="panel-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Sign out of NimbusIQ</div>
                <div style={{ fontSize: 12, color: '#545b64' }}>You will be redirected to the login page</div>
              </div>
              <button className="btn btn-danger" onClick={logout}>🚪 Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">NimbusIQ · Settings · © 2026</div>
    </>
  )
}
