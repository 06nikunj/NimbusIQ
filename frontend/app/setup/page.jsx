'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthHeader } from '../../lib/auth.js'

const regions = [
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
]

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f2f3f3;font-family:'Noto Sans',sans-serif;font-size:14px;min-height:100vh}
.nav{background:#232f3e;height:48px;display:flex;align-items:center;padding:0 16px;position:sticky;top:0;z-index:100}
.nav-logo{display:flex;align-items:center;gap:8px;}
.logo-sq{width:22px;height:22px;background:#ff9900;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#232f3e;flex-shrink:0}
.logo-text{font-size:15px;font-weight:700;color:white}
.logo-text span{color:#ff9900}
.breadcrumb{background:white;border-bottom:1px solid #d5dbdb;padding:8px 20px;display:flex;align-items:center;gap:6px;font-size:12px;color:#879596}
.bc-link{color:#0073bb;cursor:pointer;background:none;border:none;font-size:12px;font-family:'Noto Sans',sans-serif;padding:0}
.bc-link:hover{text-decoration:underline}
.page-wrap{min-height:calc(100vh - 96px);background:#f2f3f3;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px}
.container{width:100%;max-width:580px}
.steps-bar{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:24px}
.step-circle{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.step-done{background:#1d8102;color:white}
.step-active{background:#0073bb;color:white}
.step-todo{background:#d5dbdb;color:#879596}
.step-line{width:48px;height:1px;background:#d5dbdb}
.step-label{font-size:12px;font-weight:600;white-space:nowrap}
.card{background:white;border:1px solid #d5dbdb;border-radius:4px;overflow:hidden}
.card-header{padding:16px 20px;border-bottom:1px solid #d5dbdb;background:#fafafa}
.card-title{font-size:16px;font-weight:700;color:#16191f;margin-bottom:4px}
.card-sub{font-size:12px;color:#545b64;line-height:1.5}
.card-body{padding:20px}
.info-box{background:#f0f7ff;border:1px solid #b3d5f0;border-left:3px solid #0073bb;border-radius:3px;padding:12px 14px;margin-bottom:20px;font-size:12px;color:#0073bb;line-height:1.6}
.info-box strong{display:block;margin-bottom:4px;font-size:12px;color:#0073bb}
.error-box{background:#fdf3f1;border:1px solid #f5c6bc;border-left:3px solid #d13212;border-radius:3px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#d13212;display:flex;align-items:flex-start;gap:8px}
.success-box{background:#f2f8f0;border:1px solid #c3e6cb;border-left:3px solid #1d8102;border-radius:3px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#1d8102;display:flex;align-items:flex-start;gap:8px}
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:13px;font-weight:600;color:#16191f;margin-bottom:6px}
.form-label span{font-weight:400;color:#879596;font-size:11px;margin-left:4px}
.form-input{width:100%;padding:7px 10px;font-size:13px;border:1px solid #aab7b8;border-radius:3px;font-family:'IBM Plex Mono',monospace;outline:none;color:#16191f;background:white;transition:border-color 0.15s}
.form-input:focus{border-color:#0073bb;box-shadow:0 0 0 2px rgba(0,115,187,0.12)}
.form-input::placeholder{color:#aab7b8}
.form-select{width:100%;padding:7px 10px;font-size:13px;border:1px solid #aab7b8;border-radius:3px;font-family:'Noto Sans',sans-serif;outline:none;color:#16191f;background:white;cursor:pointer;transition:border-color 0.15s}
.form-select:focus{border-color:#0073bb}
.form-hint{font-size:11px;color:#879596;margin-top:4px}
.divider{border:none;border-top:1px solid #d5dbdb;margin:20px 0}
.btn-row{display:flex;gap:10px;margin-bottom:10px}
.btn-save{flex:1;padding:8px 16px;font-size:13px;font-weight:700;background:#232f3e;color:white;border:1px solid #232f3e;border-radius:3px;cursor:pointer;font-family:'Noto Sans',sans-serif;transition:background 0.15s;display:flex;align-items:center;justify-content:center;gap:6px}
.btn-save:hover{background:#1a2332}
.btn-save:disabled{background:#aab7b8;border-color:#aab7b8;cursor:not-allowed}
.btn-test{flex:1;padding:8px 16px;font-size:13px;font-weight:700;background:#0073bb;color:white;border:1px solid #0073bb;border-radius:3px;cursor:pointer;font-family:'Noto Sans',sans-serif;transition:background 0.15s;display:flex;align-items:center;justify-content:center;gap:6px}
.btn-test:hover{background:#005ea2}
.btn-test:disabled{background:#aab7b8;border-color:#aab7b8;cursor:not-allowed}
.btn-dashboard{width:100%;padding:10px 16px;font-size:13px;font-weight:700;background:#1d8102;color:white;border:1px solid #1d8102;border-radius:3px;cursor:pointer;font-family:'Noto Sans',sans-serif;transition:background 0.15s;display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:10px}
.btn-dashboard:hover{background:#16650c}
.skip-link{display:block;text-align:center;font-size:12px;color:#879596;cursor:pointer;padding:6px;background:none;border:none;font-family:'Noto Sans',sans-serif;width:100%}
.skip-link:hover{color:#0073bb;text-decoration:underline}
.security-note{display:flex;align-items:flex-start;gap:8px;margin-top:16px;padding:10px 12px;background:#fafafa;border:1px solid #d5dbdb;border-radius:3px;font-size:11px;color:#545b64;line-height:1.5}
.footer{background:#232f3e;color:rgba(255,255,255,0.5);font-size:11px;padding:12px 20px;text-align:center}
.spinner{display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
`

export default function SetupPage() {
  const router = useRouter()
  const [accessKeyId, setAccessKeyId] = useState('')
  const [secretAccessKey, setSecretAccessKey] = useState('')
  const [region, setRegion] = useState('ap-south-1')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [verified, setVerified] = useState(false)

  async function handleSave() {
    setError('')
    setSuccess('')
    if (!accessKeyId || !secretAccessKey) {
      setError('Access Key ID and Secret Access Key are required')
      return
    }
    setSaving(true)
    try {
      const authHeaders = getAuthHeader()
      const res = await fetch('http://localhost:5000/api/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({ accessKeyId, secretAccessKey, region }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error)
        return
      }
      setSuccess('Credentials saved successfully. Now click Test Connection to verify.')
    } catch {
      setError('Cannot connect to server. Make sure backend is running on port 5000.')
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setError('')
    setSuccess('')
    setTesting(true)
    try {
      const authHeaders = getAuthHeader()
      const res = await fetch('http://localhost:5000/api/credentials/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error)
        setVerified(false)
        return
      }
      setVerified(true)
      setSuccess('AWS credentials verified! Your connection is working perfectly.')
    } catch {
      setError('Connection test failed. Please check your credentials and try again.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="logo-sq">N</div>
          <span className="logo-text">Nimbus<span>IQ</span></span>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <button className="bc-link">NimbusIQ</button>
        <span>/</span>
        <span>Account Setup</span>
        <span>/</span>
        <span>Connect AWS</span>
      </div>

      {/* MAIN */}
      <div className="page-wrap">
        <div className="container">

          {/* STEPS */}
          <div className="steps-bar">
            <div className="step-circle step-done">✓</div>
            <span className="step-label" style={{ color: '#1d8102' }}>Account created</span>
            <div className="step-line"></div>
            <div className="step-circle step-active">2</div>
            <span className="step-label" style={{ color: '#0073bb' }}>Connect AWS</span>
            <div className="step-line"></div>
            <div className="step-circle step-todo">3</div>
            <span className="step-label" style={{ color: '#879596' }}>Dashboard</span>
          </div>

          {/* CARD */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Connect your AWS account</div>
              <div className="card-sub">
                Enter your IAM user credentials below. Keys are AES-256 encrypted before storage.
                NimbusIQ only uses read-only permissions and cannot modify your AWS resources.
              </div>
            </div>

            <div className="card-body">

              {/* HOW TO GET KEYS */}
              <div className="info-box">
                <strong>📋 How to get your AWS Access Keys</strong>
                AWS Console → Search IAM → Users → Create user →
                Name it nimbusiq-readonly → Attach these policies:
                AmazonEC2ReadOnlyAccess, AmazonS3ReadOnlyAccess,
                CloudWatchReadOnlyAccess, AWSBillingReadOnlyAccess →
                Security credentials tab → Create access key →
                Select Application running outside AWS → Download CSV
              </div>

              {/* ERROR */}
              {error && (
                <div className="error-box">
                  <span>⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* SUCCESS */}
              {success && (
                <div className="success-box">
                  <span>✓</span>
                  <span>{success}</span>
                </div>
              )}

              {/* ACCESS KEY ID */}
              <div className="form-group">
                <label className="form-label">
                  AWS Access Key ID
                  <span>required</span>
                </label>
                <input
                  className="form-input"
                  type="text"
                  value={accessKeyId}
                  onChange={e => setAccessKeyId(e.target.value)}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="form-hint">Starts with AKIA — 20 characters long</div>
              </div>

              {/* SECRET ACCESS KEY */}
              <div className="form-group">
                <label className="form-label">
                  AWS Secret Access Key
                  <span>required</span>
                </label>
                <input
                  className="form-input"
                  type="password"
                  value={secretAccessKey}
                  onChange={e => setSecretAccessKey(e.target.value)}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="form-hint">40 character string from your AWS IAM console</div>
              </div>

              {/* REGION */}
              <div className="form-group">
                <label className="form-label">Default AWS Region</label>
                <select
                  className="form-select"
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                >
                  {regions.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label} — {r.value}
                    </option>
                  ))}
                </select>
                <div className="form-hint">Select the region where most of your AWS resources are located</div>
              </div>

              <hr className="divider" />

              {/* SAVE + TEST BUTTONS */}
              <div className="btn-row">
                <button
                  className="btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? <><span className="spinner"></span> Saving...</>
                    : '💾 Save credentials'
                  }
                </button>
                <button
                  className="btn-test"
                  onClick={handleTest}
                  disabled={testing}
                >
                  {testing
                    ? <><span className="spinner"></span> Testing...</>
                    : '⚡ Test connection'
                  }
                </button>
              </div>

              {/* GO TO DASHBOARD — only shows after verified */}
              {verified && (
                <button
                  className="btn-dashboard"
                  onClick={() => router.push('/dashboard')}
                >
                  ✓ Connection verified — Go to Dashboard →
                </button>
              )}

              {/* SKIP */}
              <button
                className="skip-link"
                onClick={() => router.push('/dashboard')}
              >
                Skip for now — connect AWS later in Settings
              </button>

              {/* SECURITY NOTE */}
              <div className="security-note">
                <span>🔒</span>
                <span>
                  <strong>Security: </strong>
                  Your AWS credentials are encrypted with AES-256 before being stored.
                  NimbusIQ uses read-only IAM policies only — it cannot create, modify,
                  or delete any AWS resources. You can remove credentials anytime from Settings.
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        NimbusIQ · AWS Infrastructure Monitor · © 2026
      </div>
    </>
  )
}