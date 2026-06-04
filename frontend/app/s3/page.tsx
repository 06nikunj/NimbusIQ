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
.nav-search{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:4px;padding:5px 10px;display:flex;align-items:center;gap:6px;color:rgba(255,255,255,0.6);font-size:12px;width:180px;cursor:text}
.region-tag{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:3px;padding:3px 8px;font-size:11px;font-family:'IBM Plex Mono',monospace;color:rgba(255,255,255,0.8);display:flex;align-items:center;gap:5px;cursor:pointer}
.rdot{width:6px;height:6px;border-radius:50%;background:#67c918;flex-shrink:0}
.nav-user{color:rgba(255,255,255,0.85);font-size:12px;padding:4px 10px;cursor:pointer;display:flex;align-items:center;gap:4px;background:none;border:none;font-family:'Noto Sans',sans-serif}
.nav-user:hover{color:white}
.breadcrumb{background:white;border-bottom:1px solid #d5dbdb;padding:8px 20px;display:flex;align-items:center;gap:6px;font-size:12px;color:#879596}
.bc-link{color:#0073bb;cursor:pointer;background:none;border:none;font-size:12px;font-family:'Noto Sans',sans-serif;padding:0}
.bc-link:hover{text-decoration:underline}
.main{padding:16px 20px;max-width:1440px;margin:0 auto}
.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px}
.page-title{font-size:20px;font-weight:700;color:#16191f;letter-spacing:-0.3px}
.page-sub{font-size:12px;color:#545b64;margin-top:3px}
.header-btns{display:flex;gap:8px}
.btn{padding:6px 14px;border-radius:3px;font-size:13px;font-weight:500;cursor:pointer;font-family:'Noto Sans',sans-serif;display:flex;align-items:center;gap:5px;transition:all .12s;border:1px solid}
.btn-primary{background:#ff9900;border-color:#ec7211;color:#232f3e;font-weight:700}
.btn-primary:hover{background:#ec7211}
.btn-secondary{background:white;border-color:#aab7b8;color:#16191f}
.btn-secondary:hover{background:#f2f3f3;border-color:#879596}
.btn-link{background:none;border-color:transparent;color:#0073bb;padding:6px 8px}
.btn-link:hover{text-decoration:underline;background:#f0f7ff}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.stat-card{background:white;border:1px solid #d5dbdb;border-radius:4px;padding:14px 16px;display:flex;align-items:center;gap:12px}
.stat-icon{width:36px;height:36px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.stat-label{font-size:11px;color:#545b64;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
.stat-val{font-size:22px;font-weight:700;font-family:'IBM Plex Mono',monospace;line-height:1}
.panel{background:white;border:1px solid #d5dbdb;border-radius:4px;overflow:hidden}
.panel-header{padding:12px 16px;border-bottom:1px solid #d5dbdb;display:flex;align-items:center;justify-content:space-between;background:#fafafa}
.panel-title{font-size:14px;font-weight:700;color:#16191f;display:flex;align-items:center;gap:8px}
.table-filter{padding:8px 16px;border-bottom:1px solid #d5dbdb;display:flex;align-items:center;gap:8px;background:#fafafa}
.filter-input{border:1px solid #d5dbdb;border-radius:3px;padding:5px 10px;font-size:12px;width:240px;font-family:'Noto Sans',sans-serif;color:#16191f;outline:none}
.filter-input:focus{border-color:#0073bb}
.aws-table{width:100%;border-collapse:collapse}
.aws-table th{font-size:11px;font-weight:700;color:#545b64;text-transform:uppercase;letter-spacing:.6px;padding:8px 12px;text-align:left;background:#fafafa;border-bottom:1px solid #d5dbdb}
.aws-table td{padding:10px 12px;font-size:13px;border-bottom:1px solid #d5dbdb;vertical-align:middle}
.aws-table tr:last-child td{border-bottom:none}
.aws-table tbody tr:hover td{background:#f8f9fa}
.col-name{font-weight:600;color:#0073bb;cursor:pointer;font-size:13px}
.col-name:hover{text-decoration:underline}
.col-mono{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#545b64}
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:3px;font-size:12px;font-weight:500}
.bdot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.badge-green{background:#f2f8f0;color:#1d8102}
.badge-green .bdot{background:#1d8102}
.badge-amber{background:#fef6e4;color:#8d6605}
.badge-amber .bdot{background:#8d6605}
.badge-gray{background:#f2f3f3;color:#545b64}
.badge-gray .bdot{background:#879596}
.warn-tag{display:inline-flex;align-items:center;gap:4px;background:#fef6e4;border:1px solid #f5d97a;border-radius:3px;padding:2px 6px;font-size:10px;color:#8d6605}
.info-tag{display:inline-flex;align-items:center;gap:4px;background:#f0f7ff;border:1px solid #b3d5f0;border-radius:3px;padding:2px 6px;font-size:11px;color:#0073bb}
.table-footer{padding:8px 16px;border-top:1px solid #d5dbdb;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#545b64;background:#fafafa}
.loading-box{padding:48px;text-align:center;color:#545b64;font-size:13px}
.loading-spin{width:24px;height:24px;border:2px solid #d5dbdb;border-top-color:#0073bb;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.empty-box{padding:48px;text-align:center;color:#545b64}
.empty-icon{font-size:36px;margin-bottom:12px}
.empty-title{font-size:15px;font-weight:600;color:#16191f;margin-bottom:6px}
.empty-sub{font-size:13px;margin-bottom:16px}
.size-bar-wrap{display:flex;align-items:center;gap:8px}
.size-bar{height:6px;background:#e8eced;border-radius:2px;width:80px;overflow:hidden}
.size-fill{height:100%;border-radius:2px;background:#0073bb}
.cost-badge{font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;color:#ec7211}
.footer{background:#232f3e;color:rgba(255,255,255,0.5);font-size:11px;padding:12px 20px;text-align:center;margin-top:20px}
.tip-box{background:#f0f7ff;border:1px solid #b3d5f0;border-left:3px solid #0073bb;border-radius:3px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#0073bb;display:flex;align-items:flex-start;gap:8px}
`

interface Bucket {
  name: string
  createdAt: string
  sizeGB: number
  estimatedMonthlyCost: number
}

export default function S3Page() {
  const router = useRouter()
 const [user, setUser] = useState<any>(null)

useEffect(() => {
  setUser(getUser())
}, [])
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [refreshing, setRefreshing] = useState(false)

async function fetchBuckets() {

  try {

    const authHeader = getAuthHeader()

    const res = await fetch(

      'http://localhost:5000/api/s3/buckets',

      {

        method:'GET',

        headers: authHeader as Record<string,string>

      }

    )

    if(!res.ok){

      throw new Error('Failed to fetch buckets')

    }

    const data = await res.json()

    if(data.success){

      setBuckets(data.data)

    }

    else{

      setError(data.error)

    }

  }

  catch(err){

    console.error(err)

    setError('Cannot connect to backend server.')

  }

  finally{

    setLoading(false)

    setRefreshing(false)

  }

}

  useEffect(() => { fetchBuckets() }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await fetchBuckets()
  }

  const filtered = buckets.filter(b =>
    b.name.toLowerCase().includes(filter.toLowerCase())
  )

  const totalSize = buckets.reduce((sum, b) => sum + Number(b.sizeGB), 0)
  const totalCost = buckets.reduce((sum, b) => sum + Number(b.estimatedMonthlyCost), 0)
  const maxSize = Math.max(...buckets.map(b => Number(b.sizeGB)), 1)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="logo-sq">N</div>
          <span className="logo-text">Nimbus<span>IQ</span></span>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => router.push('/dashboard')}>Dashboard</button>
          <button className="nav-link active">Infrastructure ▾</button>
          <button className="nav-link" onClick={() => router.push('/costs')}>Analytics</button>
          <button className="nav-link" onClick={() => router.push('/optimizer')}>AI Optimizer</button>
          <button className="nav-link" onClick={() => router.push('/alerts')}>Alerts</button>
          <button className="nav-link" onClick={() => router.push('/settings')}>Settings</button>
        </div>
        <div className="nav-right">
          <div className="nav-search"><span style={{ fontSize: 14 }}>⌕</span><span>Search resources</span></div>
          <div className="region-tag"><div className="rdot"></div>ap-south-1</div>
          <button className="nav-user" onClick={logout}>{user?.name || 'User'} ▾</button>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <button className="bc-link" onClick={() => router.push('/dashboard')}>NimbusIQ</button>
        <span>/</span>
        <button className="bc-link" onClick={() => router.push('/dashboard')}>Infrastructure</button>
        <span>/</span>
        <span>S3 Buckets</span>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* PAGE HEADER */}
        <div className="page-header">
          <div>
            <div className="page-title">S3 Buckets</div>
            <div className="page-sub">Amazon Simple Storage Service · Global · {buckets.length} total buckets</div>
          </div>
          <div className="header-btns">
            <button className="btn btn-secondary" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
            </button>
            <button className="btn btn-primary">+ Create bucket</button>
          </div>
        </div>

        {/* TIP */}
        <div className="tip-box">
          <span>💡</span>
          <span>Buckets not accessed in 90+ days should be moved to S3 Glacier to reduce storage costs by up to 80%. NimbusIQ AI will flag these automatically.</span>
        </div>

        {/* STATS */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f0f7ff' }}>🪣</div>
            <div>
              <div className="stat-label">Total Buckets</div>
              <div className="stat-val" style={{ color: '#0073bb' }}>{loading ? '—' : buckets.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f2f8f0' }}>💾</div>
            <div>
              <div className="stat-label">Total Storage</div>
              <div className="stat-val" style={{ color: '#1d8102' }}>{loading ? '—' : totalSize.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400 }}>GB</span></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fff8ee' }}>💸</div>
            <div>
              <div className="stat-label">Est. Monthly Cost</div>
              <div className="stat-val" style={{ color: '#ec7211' }}>${loading ? '—' : totalCost.toFixed(2)}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef6e4' }}>⚠️</div>
            <div>
              <div className="stat-label">Idle Buckets</div>
              <div className="stat-val" style={{ color: '#8d6605' }}>{loading ? '—' : 0}</div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              All Buckets
              {!loading && <span className="badge badge-gray" style={{ fontSize: 11 }}>{filtered.length} shown</span>}
            </div>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>Actions ▾</button>
          </div>

          <div className="table-filter">
            <input
              className="filter-input"
              placeholder="🔍  Search buckets by name..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
            <span className="info-tag">All regions ▾</span>
          </div>

          {loading ? (
            <div className="loading-box">
              <div className="loading-spin"></div>
              Fetching S3 buckets from AWS...
            </div>
          ) : error ? (
            <div className="empty-box">
              <div className="empty-icon">⚠️</div>
              <div className="empty-title">Could not load buckets</div>
              <div className="empty-sub">{error}</div>
              <button className="btn btn-primary" onClick={handleRefresh}>Try again</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-box">
              <div className="empty-icon">🪣</div>
              <div className="empty-title">No buckets found</div>
              <div className="empty-sub">
                {buckets.length === 0
                  ? 'No S3 buckets in your AWS account. Connect your AWS credentials in Settings.'
                  : 'No buckets match your search.'}
              </div>
            </div>
          ) : (
            <table className="aws-table">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>Bucket name</th>
                  <th>Created</th>
                  <th>Size</th>
                  <th>Est. monthly cost</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(bucket => (
                  <tr key={bucket.name}>
                    <td><input type="checkbox" /></td>
                    <td>
                      <div className="col-name">{bucket.name}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#879596', marginTop: 2 }}>
                        s3://{bucket.name}
                      </div>
                    </td>
                    <td>
                      <span className="col-mono">
                        {new Date(bucket.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </td>
                    <td>
                      <div className="size-bar-wrap">
                        <div className="size-bar">
                          <div className="size-fill" style={{ width: `${(Number(bucket.sizeGB) / maxSize) * 100}%` }}></div>
                        </div>
                        <span className="col-mono">{Number(bucket.sizeGB).toFixed(2)} GB</span>
                      </div>
                    </td>
                    <td>
                      <span className="cost-badge">${Number(bucket.estimatedMonthlyCost).toFixed(2)}/mo</span>
                    </td>
                    <td>
                      <span className="badge badge-green"><span className="bdot"></span>Active</span>
                    </td>
                    <td>
                      <button className="btn btn-link" style={{ fontSize: 12, padding: '3px 6px' }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="table-footer">
            <span>Showing {filtered.length} of {buckets.length} buckets</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }}>‹ Prev</button>
              <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }}>Next ›</button>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">NimbusIQ · S3 Storage Monitor · Global · © 2026</div>
    </>
  )
}