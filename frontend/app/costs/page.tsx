'use client'
import { useState, useEffect, useRef } from 'react'
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
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.stat-card{background:white;border:1px solid #d5dbdb;border-radius:4px;padding:14px 16px;position:relative;overflow:hidden}
.stat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px}
.stat-blue::after{background:#0073bb}
.stat-orange::after{background:#ff9900}
.stat-green::after{background:#1d8102}
.stat-red::after{background:#d13212}
.stat-label{font-size:11px;color:#545b64;text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px}
.stat-val{font-size:26px;font-weight:700;font-family:'IBM Plex Mono',monospace;line-height:1;margin-bottom:4px}
.stat-trend{font-size:11px;display:flex;align-items:center;gap:4px}
.trend-bad{color:#d13212}
.trend-good{color:#1d8102}
.trend-neutral{color:#879596}
.content-grid{display:grid;grid-template-columns:1fr 320px;gap:12px;margin-bottom:12px}
.panel{background:white;border:1px solid #d5dbdb;border-radius:4px;overflow:hidden}
.panel-header{padding:12px 16px;border-bottom:1px solid #d5dbdb;display:flex;align-items:center;justify-content:space-between;background:#fafafa}
.panel-title{font-size:14px;font-weight:700;color:#16191f;display:flex;align-items:center;gap:8px}
.panel-body{padding:16px}
.tab-row{display:flex}
.tab{padding:4px 10px;font-size:12px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;color:#545b64;background:none;border-left:none;border-right:none;border-top:none;font-family:'Noto Sans',sans-serif}
.tab.active{color:#0073bb;border-bottom-color:#0073bb}
.tab:hover{color:#16191f;background:#f2f3f3}
.chart-wrap{width:100%;height:220px;position:relative}
.chart-stats{display:flex;gap:20px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #d5dbdb}
.cs-label{font-size:10px;color:#879596;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
.cs-val{font-size:16px;font-weight:700;font-family:'IBM Plex Mono',monospace}
.svc-row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #d5dbdb;font-size:13px}
.svc-row:last-child{border-bottom:none}
.svc-dot{width:10px;height:10px;border-radius:2px;flex-shrink:0}
.svc-name{flex:1;color:#16191f}
.svc-bar-bg{width:80px;height:6px;background:#e8eced;border-radius:2px;overflow:hidden}
.svc-bar-fill{height:100%;border-radius:2px}
.svc-amt{font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:500;color:#16191f;min-width:46px;text-align:right}
.svc-pct{font-size:11px;color:#879596;min-width:28px;text-align:right}
.forecast-box{background:#fff8ee;border:1px solid #f5d97a;border-left:3px solid #ff9900;border-radius:3px;padding:12px 14px;margin-top:12px}
.forecast-label{font-size:11px;color:#8d6605;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;font-weight:600}
.forecast-val{font-size:20px;font-weight:700;font-family:'IBM Plex Mono',monospace;color:#8d6605}
.forecast-sub{font-size:11px;color:#879596;margin-top:3px}
.region-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #d5dbdb}
.region-item:last-child{border-bottom:none}
.region-name{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#545b64;min-width:90px}
.region-bar-bg{flex:1;height:6px;background:#e8eced;border-radius:2px;overflow:hidden}
.region-bar-fill{height:100%;border-radius:2px;background:#0073bb}
.region-cost{font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:500;color:#16191f;min-width:44px;text-align:right}
.region-pct{font-size:11px;color:#879596;min-width:28px;text-align:right}
.aws-table{width:100%;border-collapse:collapse}
.aws-table th{font-size:11px;font-weight:700;color:#545b64;text-transform:uppercase;letter-spacing:.6px;padding:8px 12px;text-align:left;background:#fafafa;border-bottom:1px solid #d5dbdb}
.aws-table td{padding:10px 12px;font-size:13px;border-bottom:1px solid #d5dbdb;vertical-align:middle}
.aws-table tr:last-child td{border-bottom:none}
.aws-table tbody tr:hover td{background:#f8f9fa}
.col-mono{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#545b64}
.loading-box{padding:48px;text-align:center;color:#545b64;font-size:13px}
.loading-spin{width:24px;height:24px;border:2px solid #d5dbdb;border-top-color:#0073bb;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.footer{background:#232f3e;color:rgba(255,255,255,0.5);font-size:11px;padding:12px 20px;text-align:center;margin-top:20px}
`

const SERVICES = [
  { label: 'Amazon EC2', color: '#0073bb', pct: 57, amt: 22.10 },
  { label: 'Amazon RDS', color: '#8d6605', pct: 24, amt: 9.40 },
  { label: 'Amazon S3', color: '#ec7211', pct: 12, amt: 4.80 },
  { label: 'CloudWatch', color: '#1d8102', pct: 7, amt: 2.60 },
]

const REGIONS = [
  { name: 'ap-south-1', pct: 72, cost: 28.10 },
  { name: 'us-east-1', pct: 18, cost: 7.20 },
  { name: 'eu-west-1', pct: 10, cost: 3.60 },
]

function buildHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = getAuthHeader()
  if (auth && auth.Authorization) {
    h['Authorization'] = auth.Authorization
  }
  return h
}

export default function CostsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const costChartRef = useRef<HTMLCanvasElement>(null)
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const [chartsLoaded, setChartsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dailyCosts, setDailyCosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('daily')

  useEffect(() => {
    setUser(getUser())
  }, [])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    script.onload = () => setChartsLoaded(true)
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  useEffect(() => {
    async function fetchCosts() {
      try {
        const res = await fetch('http://localhost:5000/api/costs/daily', {
          method: 'GET',
          headers: buildHeaders(),
        })
        const data = await res.json()
        if (data.success) {
          setDailyCosts(data.data)
        }
      } catch {
        // silently fail - charts will show static data
      } finally {
        setLoading(false)
      }
    }
    fetchCosts()
  }, [])

  useEffect(() => {
    if (!chartsLoaded) return
    const Chart = (window as any).Chart

    const labels = ['May 1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30']
    const data = [0.8,1.1,0.9,1.3,2.1,1.8,1.2,1.0,1.4,1.6,1.9,3.8,2.2,1.5,1.3,1.1,1.7,2.0,1.8,1.4,1.2,1.6,1.9,2.1,1.8,2.3,2.0,1.9,2.2,2.41]

    const costCtx = costChartRef.current?.getContext('2d')
    if (costCtx) {
      new Chart(costCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Daily Cost',
              data,
              borderColor: '#0073bb',
              backgroundColor: 'rgba(0,115,187,0.06)',
              borderWidth: 1.5,
              pointRadius: 0,
              pointHoverRadius: 4,
              fill: true,
              tension: 0.3,
            },
            {
              label: '7-day avg',
              data: data.map((_: number, i: number) =>
                i < 6 ? null : +(data.slice(i - 6, i + 1).reduce((a: number, b: number) => a + b, 0) / 7).toFixed(2)
              ),
              borderColor: 'rgba(236,114,17,0.7)',
              borderWidth: 1.5,
              borderDash: [5, 4],
              pointRadius: 0,
              fill: false,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#232f3e',
              borderColor: '#3a4a5c',
              borderWidth: 1,
              titleColor: '#aab7b8',
              bodyColor: '#fff',
              callbacks: { label: (ctx: any) => `  $${ctx.parsed.y.toFixed(2)}` },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(213,219,219,0.5)' },
              ticks: { color: '#879596', font: { size: 10 }, maxTicksLimit: 10 },
            },
            y: {
              grid: { color: 'rgba(213,219,219,0.5)' },
              ticks: { color: '#879596', font: { size: 10 }, callback: (v: any) => '$' + Number(v).toFixed(1) },
              beginAtZero: true,
            },
          },
        },
      })
    }

    const barCtx = barChartRef.current?.getContext('2d')
    if (barCtx) {
      new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: SERVICES.map(s => s.label),
          datasets: [
            {
              label: 'Cost ($)',
              data: SERVICES.map(s => s.amt),
              backgroundColor: SERVICES.map(s => s.color + 'cc'),
              borderColor: SERVICES.map(s => s.color),
              borderWidth: 1,
              borderRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#232f3e',
              borderColor: '#3a4a5c',
              borderWidth: 1,
              titleColor: '#aab7b8',
              bodyColor: '#fff',
              callbacks: { label: (ctx: any) => `  $${ctx.parsed.y.toFixed(2)}` },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#879596', font: { size: 11 } },
            },
            y: {
              grid: { color: 'rgba(213,219,219,0.5)' },
              ticks: { color: '#879596', font: { size: 10 }, callback: (v: any) => '$' + v },
              beginAtZero: true,
            },
          },
        },
      })
    }
  }, [chartsLoaded])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className="nav">
        <div className="nav-logo">
          <div className="logo-sq">N</div>
          <span className="logo-text">Nimbus<span>IQ</span></span>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => router.push('/dashboard')}>Dashboard</button>
          <button className="nav-link" onClick={() => router.push('/ec2')}>Infrastructure</button>
          <button className="nav-link active">Analytics</button>
          <button className="nav-link" onClick={() => router.push('/optimizer')}>AI Optimizer</button>
          <button className="nav-link" onClick={() => router.push('/alerts')}>Alerts</button>
          <button className="nav-link" onClick={() => router.push('/settings')}>Settings</button>
        </div>
        <div className="nav-right">
          <div className="nav-search">
            <span style={{ fontSize: 14 }}>⌕</span>
            <span>Search resources</span>
          </div>
          <div className="region-tag"><div className="rdot"></div>ap-south-1</div>
          <button className="nav-user" onClick={logout}>
            {user ? user.name : 'User'} ▾
          </button>
        </div>
      </nav>

      <div className="breadcrumb">
        <button className="bc-link" onClick={() => router.push('/dashboard')}>NimbusIQ</button>
        <span>/</span>
        <span>Cost Analytics</span>
      </div>

      <div className="main">
        <div className="page-header">
          <div>
            <div className="page-title">Cost Analytics</div>
            <div className="page-sub">AWS Cost Explorer · ap-south-1 · May 2026</div>
          </div>
          <div className="header-btns">
            <button className="btn btn-secondary">Refresh</button>
            <button className="btn btn-primary">Export CSV</button>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-card stat-blue">
            <div className="stat-label">Today Spend</div>
            <div className="stat-val" style={{ color: '#0073bb' }}>$2.41</div>
            <div className="stat-trend"><span className="trend-bad">12% up</span><span className="trend-neutral"> vs yesterday</span></div>
          </div>
          <div className="stat-card stat-orange">
            <div className="stat-label">Month-to-Date</div>
            <div className="stat-val" style={{ color: '#ec7211' }}>$38.90</div>
            <div className="stat-trend"><span className="trend-good">8% down</span><span className="trend-neutral"> vs last month</span></div>
          </div>
          <div className="stat-card stat-green">
            <div className="stat-label">Average Daily</div>
            <div className="stat-val" style={{ color: '#1d8102' }}>$1.30</div>
            <div className="stat-trend"><span className="trend-neutral">Last 30 days</span></div>
          </div>
          <div className="stat-card stat-red">
            <div className="stat-label">Forecast EOM</div>
            <div className="stat-val" style={{ color: '#d13212' }}>$41.20</div>
            <div className="stat-trend"><span className="trend-bad">Above budget</span></div>
          </div>
        </div>

        <div className="content-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Daily cost trend</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div className="tab-row">
                    {['daily', 'weekly', 'monthly'].map(t => (
                      <button
                        key={t}
                        className={activeTab === t ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab(t)}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}>Export</button>
                </div>
              </div>
              <div className="panel-body">
                <div className="chart-stats">
                  <div><div className="cs-label">Avg Daily</div><div className="cs-val" style={{ color: '#16191f' }}>$1.30</div></div>
                  <div><div className="cs-label">Peak Day</div><div className="cs-val" style={{ color: '#d13212' }}>$3.80</div></div>
                  <div><div className="cs-label">Lowest Day</div><div className="cs-val" style={{ color: '#1d8102' }}>$0.80</div></div>
                  <div><div className="cs-label">Forecast EOM</div><div className="cs-val" style={{ color: '#ec7211' }}>$41.20</div></div>
                </div>
                <div className="chart-wrap">
                  <canvas ref={costChartRef}></canvas>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Cost by service — May 2026</div>
              </div>
              <div className="panel-body">
                <div className="chart-wrap" style={{ height: 180 }}>
                  <canvas ref={barChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Service breakdown</div>
              </div>
              <div className="panel-body" style={{ padding: '8px 16px' }}>
                {SERVICES.map(s => (
                  <div key={s.label} className="svc-row">
                    <div className="svc-dot" style={{ background: s.color }}></div>
                    <div className="svc-name">{s.label}</div>
                    <div className="svc-bar-bg">
                      <div className="svc-bar-fill" style={{ width: s.pct + '%', background: s.color }}></div>
                    </div>
                    <div className="svc-amt">${s.amt.toFixed(2)}</div>
                    <div className="svc-pct">{s.pct}%</div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #d5dbdb', fontSize: 12 }}>
                  <span style={{ color: '#545b64' }}>Total</span>
                  <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontWeight: 700 }}>$38.90</span>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Cost by region</div>
              </div>
              <div className="panel-body" style={{ padding: '8px 16px' }}>
                {REGIONS.map(r => (
                  <div key={r.name} className="region-item">
                    <span className="region-name">{r.name}</span>
                    <div className="region-bar-bg">
                      <div className="region-bar-fill" style={{ width: r.pct + '%' }}></div>
                    </div>
                    <span className="region-cost">${r.cost.toFixed(2)}</span>
                    <span className="region-pct">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Month forecast</div>
              </div>
              <div className="panel-body">
                <div className="forecast-box">
                  <div className="forecast-label">Projected end of month</div>
                  <div className="forecast-val">$41.20</div>
                  <div className="forecast-sub">Based on current daily spend of $2.41</div>
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: '#545b64', lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #d5dbdb' }}>
                    <span>Days remaining</span>
                    <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontWeight: 600 }}>1</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #d5dbdb' }}>
                    <span>Budget limit</span>
                    <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontWeight: 600 }}>$40.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span>Over budget by</span>
                    <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontWeight: 600, color: '#d13212' }}>$1.20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Daily cost breakdown</div>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>Export CSV</button>
          </div>
          {loading ? (
            <div className="loading-box">
              <div className="loading-spin"></div>
              Loading cost data from AWS...
            </div>
          ) : dailyCosts.length === 0 ? (
            <div className="loading-box">No cost data available. Connect your AWS account to see real data.</div>
          ) : (
            <table className="aws-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Cost</th>
                  <th>vs previous day</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dailyCosts.slice(-7).reverse().map((item: any, i: number) => {
                  const idx = dailyCosts.length - i - 2
                  const prev = idx >= 0 ? dailyCosts[idx] : null
                  const diff = prev
                    ? (((Number(item.amount) - Number(prev.amount)) / Number(prev.amount)) * 100).toFixed(1)
                    : null
                  return (
                    <tr key={item.date}>
                      <td><span className="col-mono">{item.date}</span></td>
                      <td>
                        <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontWeight: 600 }}>
                          ${item.amount}
                        </span>
                      </td>
                      <td>
                        {diff && (
                          <span style={{ color: Number(diff) > 0 ? '#d13212' : '#1d8102', fontFamily: 'IBM Plex Mono,monospace', fontSize: 12 }}>
                            {Number(diff) > 0 ? 'up ' : 'down '}{Math.abs(Number(diff))}%
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          background: Number(item.amount) > 2 ? '#fdf3f1' : '#f2f8f0',
                          color: Number(item.amount) > 2 ? '#d13212' : '#1d8102',
                          padding: '2px 8px',
                          borderRadius: 3,
                          fontSize: 11,
                          fontWeight: 500,
                        }}>
                          {Number(item.amount) > 2 ? 'Above avg' : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="footer">NimbusIQ - Cost Analytics - ap-south-1 - 2026</div>
    </>
  )
}