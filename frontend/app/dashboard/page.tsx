'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthHeader, getUser, logout } from '../../lib/auth.js'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f2f3f3;color:#16191f;font-family:'Noto Sans',sans-serif;font-size:14px;min-height:100vh}
.nav{background:#232f3e;height:48px;display:flex;align-items:center;padding:0 16px;position:sticky;top:0;z-index:100}
.nav-logo{display:flex;align-items:center;gap:8px;padding-right:20px;border-right:1px solid rgba(255,255,255,0.15);margin-right:4px;text-decoration:none}
.logo-sq{width:22px;height:22px;background:#ff9900;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#232f3e;flex-shrink:0}
.logo-text{font-size:15px;font-weight:700;color:white;letter-spacing:0.2px}
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
.alert-banner{background:#fdf3f1;border:1px solid #f5c6bc;border-left:4px solid #d13212;border-radius:3px;padding:10px 14px;display:flex;align-items:flex-start;gap:10px;margin-bottom:16px}
.alert-icon{color:#d13212;font-size:16px;margin-top:1px;flex-shrink:0}
.alert-title{font-weight:600;margin-bottom:2px;font-size:13px;color:#16191f}
.alert-desc{font-size:12px;color:#545b64;line-height:1.5}
.kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.kpi-card{background:white;border:1px solid #d5dbdb;border-radius:4px;padding:16px;display:flex;align-items:flex-start;gap:12px;cursor:pointer;transition:border-color .15s;position:relative;overflow:hidden}
.kpi-card:hover{border-color:#0073bb}
.kpi-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;border-radius:0 0 4px 4px}
.kpi-blue::after{background:#0073bb}
.kpi-orange::after{background:#ff9900}
.kpi-green::after{background:#1d8102}
.kpi-purple::after{background:#8d6605}
.kpi-icon{width:40px;height:40px;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px}
.icon-blue{background:#f0f7ff}
.icon-orange{background:#fff8ee}
.icon-green{background:#f2f8f0}
.icon-purple{background:#fef6e4}
.kpi-body{flex:1;min-width:0}
.kpi-label{font-size:12px;color:#545b64;margin-bottom:4px}
.kpi-value{font-size:26px;font-weight:700;font-family:'IBM Plex Mono',monospace;line-height:1;margin-bottom:6px}
.kpi-trend{font-size:11px;display:flex;align-items:center;gap:4px;margin-bottom:4px}
.trend-bad{color:#d13212}
.trend-good{color:#1d8102}
.trend-neutral{color:#879596}
.kpi-link{font-size:11px;color:#0073bb;cursor:pointer;display:inline-block}
.kpi-link:hover{text-decoration:underline}
.section-grid{display:grid;grid-template-columns:1fr 360px;gap:12px;margin-bottom:12px}
.panel{background:white;border:1px solid #d5dbdb;border-radius:4px;overflow:hidden}
.panel-header{padding:12px 16px;border-bottom:1px solid #d5dbdb;display:flex;align-items:center;justify-content:space-between;background:#fafafa}
.panel-title{font-size:14px;font-weight:700;color:#16191f;display:flex;align-items:center;gap:8px}
.panel-actions{display:flex;gap:6px;align-items:center}
.tab-row{display:flex;border-bottom:none}
.tab{padding:4px 10px;font-size:12px;font-weight:500;cursor:pointer;border-bottom:2px solid transparent;color:#545b64;background:none;border-left:none;border-right:none;border-top:none;font-family:'Noto Sans',sans-serif}
.tab.active{color:#0073bb;border-bottom-color:#0073bb}
.tab:hover{color:#16191f;background:#f2f3f3}
.panel-body{padding:16px}
.chart-area{width:100%;height:200px;position:relative}
.chart-stats{display:flex;gap:24px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #d5dbdb}
.chart-stat-label{font-size:11px;color:#879596;text-transform:uppercase;letter-spacing:.4px;margin-bottom:2px}
.chart-stat-val{font-size:18px;font-weight:700;font-family:'IBM Plex Mono',monospace}
.chart-legend{margin-left:auto;display:flex;gap:12px;align-items:center}
.legend-item{display:flex;align-items:center;gap:5px;font-size:11px;color:#545b64}
.legend-line{width:20px;height:2px;display:inline-block}
.aws-table{width:100%;border-collapse:collapse}
.aws-table th{font-size:11px;font-weight:700;color:#545b64;text-transform:uppercase;letter-spacing:.6px;padding:8px 12px;text-align:left;background:#fafafa;border-bottom:1px solid #d5dbdb}
.aws-table td{padding:10px 12px;font-size:13px;border-bottom:1px solid #d5dbdb;vertical-align:middle}
.aws-table tr:last-child td{border-bottom:none}
.aws-table tbody tr:hover td{background:#f8f9fa}
.col-name{font-weight:600;color:#0073bb;cursor:pointer;font-size:13px}
.col-name:hover{text-decoration:underline}
.col-id{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#879596;margin-top:2px}
.col-type{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#545b64}
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:3px;font-size:12px;font-weight:500}
.bdot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.badge-green{background:#f2f8f0;color:#1d8102}
.badge-green .bdot{background:#1d8102}
.badge-red{background:#fdf3f1;color:#d13212}
.badge-red .bdot{background:#d13212}
.badge-amber{background:#fef6e4;color:#8d6605}
.badge-amber .bdot{background:#8d6605}
.badge-gray{background:#f2f3f3;color:#545b64}
.badge-gray .bdot{background:#879596}
.warn-tag{display:inline-flex;align-items:center;gap:4px;background:#fef6e4;border:1px solid #f5d97a;border-radius:3px;padding:2px 6px;font-size:10px;color:#8d6605}
.info-tag{display:inline-flex;align-items:center;gap:4px;background:#f0f7ff;border:1px solid #b3d5f0;border-radius:3px;padding:2px 6px;font-size:10px;color:#0073bb}
.cpu-wrap{display:flex;align-items:center;gap:8px}
.cpu-bar{height:6px;background:#e8eced;border-radius:2px;width:70px;overflow:hidden}
.cpu-fill{height:100%;border-radius:2px}
.cpu-good{background:#1d8102}
.cpu-bad{background:#d13212}
.cpu-num{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#545b64;min-width:32px}
.table-filter{padding:8px 16px;border-bottom:1px solid #d5dbdb;display:flex;align-items:center;gap:8px;background:#fafafa}
.filter-input{border:1px solid #d5dbdb;border-radius:3px;padding:5px 10px;font-size:12px;width:200px;font-family:'Noto Sans',sans-serif;color:#16191f;outline:none}
.filter-input:focus{border-color:#0073bb}
.table-footer{padding:8px 16px;border-top:1px solid #d5dbdb;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#545b64;background:#fafafa}
.cost-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #d5dbdb;font-size:13px}
.cost-row:last-child{border-bottom:none}
.cost-svc{display:flex;align-items:center;gap:8px;color:#16191f}
.cost-dot{width:10px;height:10px;border-radius:2px;flex-shrink:0}
.cost-bar-wrap{flex:1;margin:0 10px;height:6px;background:#e8eced;border-radius:2px;overflow:hidden}
.cost-bar-fill{height:100%;border-radius:2px}
.cost-amt{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#16191f;min-width:46px;text-align:right;font-weight:500}
.cost-total{display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid #d5dbdb;font-size:12px}
.rec-item{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #d5dbdb}
.rec-item:last-child{border-bottom:none}
.rec-bar{width:4px;border-radius:2px;flex-shrink:0;align-self:stretch}
.rec-high{background:#d13212}
.rec-med{background:#ff9900}
.rec-low{background:#1d8102}
.rec-body{flex:1}
.rec-title{font-size:13px;font-weight:600;color:#16191f;margin-bottom:3px}
.rec-desc{font-size:12px;color:#545b64;line-height:1.5;margin-bottom:6px}
.rec-footer{display:flex;align-items:center;justify-content:space-between}
.rec-tag{background:#f2f3f3;border:1px solid #d5dbdb;border-radius:3px;padding:2px 6px;font-size:11px;color:#545b64}
.rec-save{font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:700;color:#1d8102}
.savings-box{background:#f2f8f0;border:1px solid #c3e6cb;border-radius:3px;padding:12px 14px;margin-top:0;display:flex;align-items:center;justify-content:space-between}
.savings-label{font-size:10px;color:#1d8102;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}
.savings-val{font-size:18px;font-weight:700;font-family:'IBM Plex Mono',monospace;color:#1d8102}
.bottom-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px}
.region-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #d5dbdb;font-size:13px}
.region-item:last-child{border-bottom:none}
.region-name{font-family:'IBM Plex Mono',monospace;font-size:11px;color:#545b64;min-width:90px}
.region-bar-bg{flex:1;height:8px;background:#e8eced;border-radius:2px;overflow:hidden}
.region-bar-fill{height:100%;border-radius:2px;background:#0073bb}
.region-cost{font-family:'IBM Plex Mono',monospace;font-size:12px;color:#16191f;min-width:44px;text-align:right;font-weight:500}
.region-pct{font-size:11px;color:#879596;min-width:28px;text-align:right}
.act-item{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #d5dbdb}
.act-item:last-child{border-bottom:none}
.act-icon{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;margin-top:1px}
.act-red{background:#fdf3f1}
.act-green{background:#f2f8f0}
.act-blue{background:#f0f7ff}
.act-amber{background:#fef6e4}
.act-title{font-size:12px;color:#16191f;margin-bottom:2px;font-weight:500}
.act-time{font-size:11px;color:#879596;font-family:'IBM Plex Mono',monospace}
.footer{background:#232f3e;color:rgba(255,255,255,0.5);font-size:11px;padding:12px 20px;text-align:center;margin-top:20px}
.donut-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none}
.donut-total{font-size:18px;font-weight:700;font-family:'IBM Plex Mono',monospace;color:#16191f}
.donut-label{font-size:10px;color:#879596;text-transform:uppercase;letter-spacing:.5px}
.skeleton{background:linear-gradient(90deg,#e8eced 25%,#f2f3f3 50%,#e8eced 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:3px;display:inline-block}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.no-creds-box{background:#f0f7ff;border:1px solid #b3d5f0;border-left:4px solid #0073bb;border-radius:3px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:16px}
`

// helper — builds auth headers safely with no TypeScript spread error
function buildHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = getAuthHeader()
  if (auth && auth.Authorization) h['Authorization'] = auth.Authorization
  return h
}

// Dot colors for service chart
const SVC_COLORS = ['#0073bb', '#8d6605', '#ec7211', '#1d8102', '#d13212', '#545b64']

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const costChartRef = useRef<HTMLCanvasElement>(null)
  const svcChartRef = useRef<HTMLCanvasElement>(null)
  const [chartsLoaded, setChartsLoaded] = useState(false)

  // ---- REAL DATA STATE ----
  const [instances, setInstances] = useState<any[]>([])
  const [buckets, setBuckets] = useState<any[]>([])
  const [dailyCosts, setDailyCosts] = useState<any[]>([])
  const [svcCosts, setSvcCosts] = useState<any[]>([])
  const [monthlyTotal, setMonthlyTotal] = useState<string>('0')
  const [alertData, setAlertData] = useState<any>(null)
  const [alertHistory, setAlertHistory] = useState<any[]>([])
  const [loadingAll, setLoadingAll] = useState(true)
  const [hasCredentials, setHasCredentials] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('')

  // ---- LOAD USER ----
  useEffect(() => {
    setUser(getUser())
    setLastUpdated(new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }))
  }, [])

  // ---- LOAD CHART.JS ----
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    script.onload = () => setChartsLoaded(true)
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  // ---- FETCH ALL DATA FROM BACKEND ----
  useEffect(() => {
    async function fetchAll() {
      const h = buildHeaders()
      try {
        // Run all fetches in parallel for speed
        const [ec2Res, s3Res, dailyRes, svcRes, totalRes, alertRes, histRes] = await Promise.allSettled([
          fetch('http://localhost:5000/api/ec2/instances', { headers: h }),
          fetch('http://localhost:5000/api/s3/buckets', { headers: h }),
          fetch('http://localhost:5000/api/costs/daily', { headers: h }),
          fetch('http://localhost:5000/api/costs/by-service', { headers: h }),
          fetch('http://localhost:5000/api/costs/monthly-total', { headers: h }),
          fetch('http://localhost:5000/api/alerts', { headers: h }),
          fetch('http://localhost:5000/api/alerts/history', { headers: h }),
        ])

        // EC2
        if (ec2Res.status === 'fulfilled') {
          const d = await ec2Res.value.json()
          if (d.success) setInstances(d.data)
          else if (d.error && d.error.includes('No AWS credentials')) setHasCredentials(false)
        }

        // S3
        if (s3Res.status === 'fulfilled') {
          const d = await s3Res.value.json()
          if (d.success) setBuckets(d.data)
        }

        // Daily costs
        if (dailyRes.status === 'fulfilled') {
          const d = await dailyRes.value.json()
          if (d.success) setDailyCosts(d.data)
        }

        // Service costs
        if (svcRes.status === 'fulfilled') {
          const d = await svcRes.value.json()
          if (d.success) setSvcCosts(d.data)
        }

        // Monthly total
        if (totalRes.status === 'fulfilled') {
          const d = await totalRes.value.json()
          if (d.success) setMonthlyTotal(d.total)
        }

        // Alert settings
        if (alertRes.status === 'fulfilled') {
          const d = await alertRes.value.json()
          if (d.success) setAlertData(d.data)
        }

        // Alert history
        if (histRes.status === 'fulfilled') {
          const d = await histRes.value.json()
          if (d.success) setAlertHistory(d.data)
        }

      } catch {
        // backend unreachable
      } finally {
        setLoadingAll(false)
      }
    }
    fetchAll()
  }, [])

  // ---- DRAW CHARTS when data + Chart.js ready ----
  useEffect(() => {
    if (!chartsLoaded || loadingAll) return
    const Chart = (window as any).Chart

    // Destroy old charts first to avoid duplicate canvas error
    const existingCost = Chart.getChart(costChartRef.current)
    if (existingCost) existingCost.destroy()
    const existingSvc = Chart.getChart(svcChartRef.current)
    if (existingSvc) existingSvc.destroy()

    // Cost trend chart — use real daily cost data if available
    const costCtx = costChartRef.current?.getContext('2d')
    if (costCtx && dailyCosts.length > 0) {
      const labels = dailyCosts.map((d: any) => d.date.slice(5)) // show MM-DD
      const data = dailyCosts.map((d: any) => parseFloat(d.amount))
      new Chart(costCtx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Daily Cost', data, borderColor: '#0073bb', backgroundColor: 'rgba(0,115,187,0.06)', borderWidth: 1.5, pointRadius: 0, pointHoverRadius: 4, fill: true, tension: 0.3 },
            { label: '7-day avg', data: data.map((_: number, i: number) => i < 6 ? null : +(data.slice(i - 6, i + 1).reduce((a: number, b: number) => a + b, 0) / 7).toFixed(2)), borderColor: 'rgba(236,114,17,0.7)', borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, fill: false, tension: 0.3 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#232f3e', borderColor: '#3a4a5c', borderWidth: 1, titleColor: '#aab7b8', bodyColor: '#ffffff', callbacks: { label: (ctx: any) => `  $${ctx.parsed.y.toFixed(2)}` } } },
          scales: { x: { grid: { color: 'rgba(213,219,219,0.5)' }, ticks: { color: '#879596', font: { size: 10 }, maxTicksLimit: 10 } }, y: { grid: { color: 'rgba(213,219,219,0.5)' }, ticks: { color: '#879596', font: { size: 10 }, callback: (v: any) => '$' + Number(v).toFixed(1) }, beginAtZero: true } }
        }
      })
    }

    // Service donut — use real service cost data if available
    const svcCtx = svcChartRef.current?.getContext('2d')
    if (svcCtx && svcCosts.length > 0) {
      new Chart(svcCtx, {
        type: 'doughnut',
        data: {
          labels: svcCosts.map((s: any) => s.service),
          datasets: [{ data: svcCosts.map((s: any) => parseFloat(s.amount)), backgroundColor: SVC_COLORS, borderColor: '#ffffff', borderWidth: 2, hoverOffset: 4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '68%',
          plugins: { legend: { display: false }, tooltip: { backgroundColor: '#232f3e', borderColor: '#3a4a5c', borderWidth: 1, titleColor: '#aab7b8', bodyColor: '#ffffff', callbacks: { label: (ctx: any) => `  $${ctx.parsed.toFixed(2)}` } } }
        }
      })
    }
  }, [chartsLoaded, loadingAll, dailyCosts, svcCosts])

  // ---- DERIVED VALUES from real data ----
  const runningCount = instances.filter((i: any) => i.state === 'running').length
  const todaySpend = dailyCosts.length > 0 ? parseFloat(dailyCosts[dailyCosts.length - 1]?.amount || '0') : 0
  const yesterdaySpend = dailyCosts.length > 1 ? parseFloat(dailyCosts[dailyCosts.length - 2]?.amount || '0') : 0
  const todayChange = yesterdaySpend > 0 ? (((todaySpend - yesterdaySpend) / yesterdaySpend) * 100).toFixed(1) : null
  const avgDaily = dailyCosts.length > 0 ? (dailyCosts.reduce((s: number, d: any) => s + parseFloat(d.amount), 0) / dailyCosts.length).toFixed(2) : '0'
  const peakDay = dailyCosts.length > 0 ? Math.max(...dailyCosts.map((d: any) => parseFloat(d.amount))).toFixed(2) : '0'
  const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()
  const forecastEOM = (todaySpend * (new Date().getDate() + daysLeft)).toFixed(2)
  const overBudget = alertData && todaySpend > alertData.dailyLimit
  const activeAlerts = alertHistory.filter((a: any) => {
    const triggered = new Date(a.triggeredAt)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return triggered > dayAgo
  })

  const Sk = ({ w, h }: { w: number | string; h: number }) => (
    <span className="skeleton" style={{ width: w, height: h, display: 'inline-block' }}>&nbsp;</span>
  )

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
          <button className="nav-link active">Dashboard</button>
          <button className="nav-link" onClick={() => router.push('/ec2')}>Infrastructure</button>
          <button className="nav-link" onClick={() => router.push('/costs')}>Analytics</button>
          <button className="nav-link" onClick={() => router.push('/optimizer')}>AI Optimizer</button>
          <button className="nav-link" onClick={() => router.push('/alerts')}>
            Alerts
            {activeAlerts.length > 0 && (
              <span style={{ background: '#d13212', color: 'white', borderRadius: '8px', padding: '1px 5px', fontSize: '10px', fontWeight: 700 }}>
                {activeAlerts.length}
              </span>
            )}
          </button>
          <button className="nav-link" onClick={() => router.push('/settings')}>Settings</button>
        </div>
        <div className="nav-right">
          <div className="nav-search"><span style={{ fontSize: 14 }}>⌕</span><span>Search resources</span></div>
          <div className="region-tag"><div className="rdot"></div>ap-south-1</div>
          <button className="nav-user" onClick={logout}>{user ? user.name : 'User'} ▾</button>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <button className="bc-link">NimbusIQ</button>
        <span>/</span>
        <span>Dashboard</span>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* PAGE HEADER */}
        <div className="page-header">
          <div>
            <div className="page-title">Infrastructure Overview</div>
            <div className="page-sub">AWS Account · ap-south-1 · Last updated: {lastUpdated} UTC</div>
          </div>
          <div className="header-btns">
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>↻ Refresh</button>
            <button className="btn btn-primary" onClick={() => router.push('/optimizer')}>⚡ Run AI Analysis</button>
          </div>
        </div>

        {/* NO CREDENTIALS BANNER */}
        {!hasCredentials && (
          <div className="no-creds-box">
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>AWS account not connected</div>
              <div style={{ fontSize: 12, color: '#545b64' }}>Connect your AWS credentials to see real infrastructure data and cost analytics.</div>
            </div>
            <button className="btn btn-primary" onClick={() => router.push('/setup')}>Connect AWS →</button>
          </div>
        )}

        {/* BUDGET ALERT BANNER — only shows when real alert is triggered */}
        {overBudget && (
          <div className="alert-banner">
            <div className="alert-icon">⚠</div>
            <div style={{ flex: 1 }}>
              <div className="alert-title">Daily budget limit exceeded</div>
              <div className="alert-desc">
                Today's spend of <strong>${todaySpend.toFixed(2)}</strong> has exceeded your configured limit of <strong>${alertData.dailyLimit}</strong>.{' '}
                <span style={{ color: '#0073bb', cursor: 'pointer' }} onClick={() => router.push('/alerts')}>View alerts →</span>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Dismiss</button>
          </div>
        )}

        {/* KPI CARDS — real data */}
        <div className="kpi-grid">
          <div className="kpi-card kpi-blue" onClick={() => router.push('/ec2')}>
            <div className="kpi-icon icon-blue">🖥</div>
            <div className="kpi-body">
              <div className="kpi-label">Running EC2 Instances</div>
              <div className="kpi-value" style={{ color: '#0073bb' }}>
                {loadingAll ? <Sk w={40} h={28} /> : runningCount}
              </div>
              <div className="kpi-trend">
                <span className="trend-neutral">of {loadingAll ? '–' : instances.length} total instances</span>
              </div>
              <div className="kpi-link">View all instances →</div>
            </div>
          </div>

          <div className="kpi-card kpi-orange" onClick={() => router.push('/costs')}>
            <div className="kpi-icon icon-orange">💸</div>
            <div className="kpi-body">
              <div className="kpi-label">Today's AWS Spend</div>
              <div className="kpi-value" style={{ color: '#ec7211' }}>
                {loadingAll ? <Sk w={80} h={28} /> : `$${todaySpend.toFixed(2)}`}
              </div>
              {todayChange && (
                <div className="kpi-trend">
                  <span className={Number(todayChange) > 0 ? 'trend-bad' : 'trend-good'}>
                    {Number(todayChange) > 0 ? '▲' : '▼'} {Math.abs(Number(todayChange))}%
                  </span>
                  <span className="trend-neutral"> vs yesterday (${yesterdaySpend.toFixed(2)})</span>
                </div>
              )}
              <div className="kpi-link">View cost breakdown →</div>
            </div>
          </div>

          <div className="kpi-card kpi-green" onClick={() => router.push('/costs')}>
            <div className="kpi-icon icon-green">📅</div>
            <div className="kpi-body">
              <div className="kpi-label">Month-to-Date Spend</div>
              <div className="kpi-value" style={{ color: '#1d8102' }}>
                {loadingAll ? <Sk w={80} h={28} /> : `$${monthlyTotal}`}
              </div>
              <div className="kpi-trend"><span className="trend-neutral">This month so far</span></div>
              <div className="kpi-link">View Cost Explorer →</div>
            </div>
          </div>

          <div className="kpi-card kpi-purple" onClick={() => router.push('/optimizer')}>
            <div className="kpi-icon icon-purple">✨</div>
            <div className="kpi-body">
              <div className="kpi-label">AI Optimizer</div>
              <div className="kpi-value" style={{ color: '#8d6605', fontSize: 18, paddingTop: 4 }}>
                Ready
              </div>
              <div className="kpi-trend"><span className="trend-neutral">Click to analyze infrastructure</span></div>
              <div className="kpi-link">Run AI Analysis →</div>
            </div>
          </div>
        </div>

        {/* MAIN SECTION GRID */}
        <div className="section-grid">

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* COST TREND CHART */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Cost trend — last 30 days</div>
                <div className="panel-actions">
                  <div className="tab-row">
                    <button className="tab active">Daily</button>
                    <button className="tab">Weekly</button>
                    <button className="tab">Monthly</button>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}>Export CSV</button>
                </div>
              </div>
              <div className="panel-body">
                <div className="chart-stats">
                  <div>
                    <div className="chart-stat-label">Avg Daily</div>
                    <div className="chart-stat-val" style={{ color: '#16191f' }}>
                      {loadingAll ? <Sk w={50} h={18} /> : `$${avgDaily}`}
                    </div>
                  </div>
                  <div>
                    <div className="chart-stat-label">Peak Day</div>
                    <div className="chart-stat-val" style={{ color: '#d13212' }}>
                      {loadingAll ? <Sk w={50} h={18} /> : `$${peakDay}`}
                    </div>
                  </div>
                  <div>
                    <div className="chart-stat-label">Forecast EOM</div>
                    <div className="chart-stat-val" style={{ color: '#ec7211' }}>
                      {loadingAll ? <Sk w={50} h={18} /> : `$${forecastEOM}`}
                    </div>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item"><span className="legend-line" style={{ background: '#0073bb' }}></span>Daily cost</div>
                    <div className="legend-item"><span className="legend-line" style={{ background: '#ec7211', borderTop: '2px dashed #ec7211', height: 0 }}></span>7-day avg</div>
                  </div>
                </div>
                <div className="chart-area">
                  {loadingAll ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#879596', fontSize: 12 }}>
                      Loading cost data from AWS...
                    </div>
                  ) : dailyCosts.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#879596', fontSize: 12 }}>
                      No cost data available. Connect your AWS account.
                    </div>
                  ) : (
                    <canvas ref={costChartRef}></canvas>
                  )}
                </div>
              </div>
            </div>

            {/* EC2 TABLE — real instances */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  EC2 Instances
                  {!loadingAll && (
                    <span className="badge badge-green" style={{ fontSize: 11 }}>
                      <span className="bdot"></span>{runningCount} running
                    </span>
                  )}
                </div>
                <div className="panel-actions">
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>Actions ▾</button>
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => router.push('/ec2')}>View all</button>
                </div>
              </div>
              <div className="table-filter">
                <input className="filter-input" placeholder="🔍  Filter instances..." />
                <span className="info-tag">All states ▾</span>
                <span className="info-tag">All types ▾</span>
              </div>

              {loadingAll ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#879596', fontSize: 12 }}>Loading EC2 instances...</div>
              ) : instances.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: '#879596', fontSize: 12 }}>
                  No EC2 instances found.{' '}
                  <span style={{ color: '#0073bb', cursor: 'pointer' }} onClick={() => router.push('/setup')}>Connect AWS credentials →</span>
                </div>
              ) : (
                <table className="aws-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" /></th>
                      <th>Name / Instance ID</th>
                      <th>Instance type</th>
                      <th>State</th>
                      <th>Zone</th>
                      <th>CPU</th>
                      <th>Cost/hr</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {instances.slice(0, 5).map((instance: any) => (
                      <tr key={instance.id} style={{ background: instance.cpu < 5 && instance.state === 'running' ? '#fff8f8' : 'white' }}>
                        <td><input type="checkbox" /></td>
                        <td>
                          <div className="col-name">{instance.name}</div>
                          <div className="col-id">{instance.id}</div>
                          {instance.cpu < 5 && instance.state === 'running' && (
                            <div className="warn-tag" style={{ marginTop: 4 }}>⚠ CPU at {instance.cpu}% — oversized</div>
                          )}
                        </td>
                        <td><span className="col-type">{instance.type}</span></td>
                        <td>
                          {instance.state === 'running' && <span className="badge badge-green"><span className="bdot"></span>Running</span>}
                          {instance.state === 'stopped' && <span className="badge badge-red"><span className="bdot"></span>Stopped</span>}
                          {instance.state === 'pending' && <span className="badge badge-amber"><span className="bdot"></span>Pending</span>}
                          {!['running', 'stopped', 'pending'].includes(instance.state) && (
                            <span className="badge badge-gray"><span className="bdot"></span>{instance.state}</span>
                          )}
                        </td>
                        <td><span className="col-id">{instance.region}</span></td>
                        <td>
                          <div className="cpu-wrap">
                            <div className="cpu-bar">
                              <div className={`cpu-fill ${instance.cpu < 5 ? 'cpu-bad' : 'cpu-good'}`} style={{ width: `${Math.min(instance.cpu, 100)}%` }}></div>
                            </div>
                            <span className="cpu-num" style={{ color: instance.cpu < 5 ? '#d13212' : '#1d8102' }}>{instance.cpu}%</span>
                          </div>
                        </td>
                        <td><span className="col-type">$0.013</span></td>
                        <td><button className="btn btn-link" style={{ fontSize: 12, padding: '3px 6px' }}>Connect</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="table-footer">
                <span>Showing {Math.min(instances.length, 5)} of {instances.length} instances</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => router.push('/ec2')}>View all →</button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* SERVICE DONUT — real service cost data */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Cost by service — this month</div>
              </div>
              <div className="panel-body">
                {loadingAll ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#879596', fontSize: 12 }}>Loading...</div>
                ) : svcCosts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#879596', fontSize: 12 }}>No cost data available</div>
                ) : (
                  <>
                    <div style={{ position: 'relative', width: '100%', height: 160, marginBottom: 4 }}>
                      <canvas ref={svcChartRef}></canvas>
                      <div className="donut-center">
                        <div className="donut-total">${monthlyTotal}</div>
                        <div className="donut-label">Total</div>
                      </div>
                    </div>
                    <div>
                      {svcCosts.slice(0, 5).map((s: any, i: number) => {
                        const total = svcCosts.reduce((sum: number, x: any) => sum + parseFloat(x.amount), 0)
                        const pct = total > 0 ? Math.round((parseFloat(s.amount) / total) * 100) : 0
                        return (
                          <div key={s.service} className="cost-row">
                            <div className="cost-svc">
                              <div className="cost-dot" style={{ background: SVC_COLORS[i] || '#545b64' }}></div>
                              {s.service.replace('Amazon ', '').replace('AWS ', '')}
                            </div>
                            <div className="cost-bar-wrap">
                              <div className="cost-bar-fill" style={{ width: pct + '%', background: SVC_COLORS[i] || '#545b64' }}></div>
                            </div>
                            <div className="cost-amt">${parseFloat(s.amount).toFixed(2)}</div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="cost-total">
                      <span style={{ color: '#545b64' }}>Total month-to-date</span>
                      <span style={{ fontFamily: 'IBM Plex Mono,monospace', fontWeight: 700 }}>${monthlyTotal}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* AI RECOMMENDATIONS PROMPT */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">AI Cost Recommendations</div>
                <span className="info-tag">AI powered</span>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🤖</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#16191f', marginBottom: 6 }}>
                    AI Analysis Ready
                  </div>
                  <div style={{ fontSize: 12, color: '#545b64', marginBottom: 16, lineHeight: 1.5 }}>
                    Click below to analyze your AWS infrastructure and get specific cost-saving recommendations powered by AI.
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
                    onClick={() => router.push('/optimizer')}
                  >
                    ⚡ Analyze My Infrastructure
                  </button>
                </div>
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid #d5dbdb' }}>
                <div className="savings-box">
                  <div>
                    <div className="savings-label">Go to AI Optimizer</div>
                    <div style={{ fontSize: 12, color: '#545b64', marginTop: 2 }}>Get recommendations in seconds</div>
                  </div>
                  <button className="btn btn-link" style={{ fontSize: 12 }} onClick={() => router.push('/optimizer')}>Open →</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="bottom-grid">

          {/* REGIONAL — placeholder since Cost Explorer doesn't break by region easily */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Cost summary</div>
              <button className="btn btn-link" style={{ fontSize: 12, padding: '3px 6px' }} onClick={() => router.push('/costs')}>View all</button>
            </div>
            <div style={{ padding: '8px 16px' }}>
              <div className="region-item">
                <span className="region-name">Today</span>
                <div className="region-bar-bg"><div className="region-bar-fill" style={{ width: '40%' }}></div></div>
                <span className="region-cost">${todaySpend.toFixed(2)}</span>
                <span className="region-pct"></span>
              </div>
              <div className="region-item">
                <span className="region-name">This month</span>
                <div className="region-bar-bg"><div className="region-bar-fill" style={{ width: '70%' }}></div></div>
                <span className="region-cost">${monthlyTotal}</span>
                <span className="region-pct"></span>
              </div>
              <div className="region-item">
                <span className="region-name">Forecast EOM</span>
                <div className="region-bar-bg"><div className="region-bar-fill" style={{ width: '90%', background: '#ec7211' }}></div></div>
                <span className="region-cost">${forecastEOM}</span>
                <span className="region-pct"></span>
              </div>
            </div>
          </div>

          {/* S3 — real bucket data */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                S3 Buckets
                <span className="badge badge-gray" style={{ fontSize: 11, marginLeft: 4 }}>{buckets.length} total</span>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => router.push('/s3')}>View all</button>
            </div>
            {loadingAll ? (
              <div style={{ padding: 16, color: '#879596', fontSize: 12, textAlign: 'center' }}>Loading...</div>
            ) : buckets.length === 0 ? (
              <div style={{ padding: 16, color: '#879596', fontSize: 12, textAlign: 'center' }}>No buckets found</div>
            ) : (
              <table className="aws-table">
                <thead>
                  <tr><th>Name</th><th>Size</th><th>Cost/mo</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {buckets.slice(0, 3).map((bucket: any) => (
                    <tr key={bucket.name}>
                      <td><div className="col-name" style={{ fontSize: 11 }}>{bucket.name}</div></td>
                      <td><span className="col-type">{parseFloat(bucket.sizeGB).toFixed(1)} GB</span></td>
                      <td><span style={{ fontFamily: 'IBM Plex Mono,monospace', fontSize: 11, color: '#ec7211' }}>${parseFloat(bucket.estimatedMonthlyCost).toFixed(2)}</span></td>
                      <td><span className="info-tag">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ACTIVITY — real alert history */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Recent activity</div>
              <button className="btn btn-link" style={{ fontSize: 12, padding: '3px 6px' }} onClick={() => router.push('/alerts')}>View alerts →</button>
            </div>
            <div style={{ padding: '0 16px' }}>
              {alertHistory.length === 0 ? (
                <>
                  <div className="act-item">
                    <div className="act-icon act-blue">↻</div>
                    <div>
                      <div className="act-title">Dashboard loaded — AWS data synced</div>
                      <div className="act-time">{lastUpdated}</div>
                    </div>
                  </div>
                  <div className="act-item">
                    <div className="act-icon act-green">✓</div>
                    <div>
                      <div className="act-title">No alerts triggered recently</div>
                      <div className="act-time">All systems normal</div>
                    </div>
                  </div>
                </>
              ) : (
                alertHistory.slice(0, 4).map((a: any) => (
                  <div key={a.id} className="act-item">
                    <div className="act-icon act-red">⚠</div>
                    <div>
                      <div className="act-title">{a.type} budget alert — ${a.amount} exceeded ${a.limit}</div>
                      <div className="act-time">{new Date(a.triggeredAt).toLocaleString('en-GB')}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="footer">NimbusIQ · AWS Infrastructure Monitor · ap-south-1 · © 2026</div>
    </>
  )
}