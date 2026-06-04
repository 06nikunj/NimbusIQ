'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveAuth } from '../../lib/auth.js'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setError('')
    if (!name || !email || !password || !confirm) {
      setError('All fields are required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error)
        return
      }
      saveAuth(data.token, data.user)
      // New user always goes to setup page first
      router.push('/setup')
    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px', fontSize: '13px',
    border: '1px solid #aab7b8', borderRadius: '3px',
    fontFamily: 'inherit', outline: 'none', color: '#16191f'
  }

  const labelStyle = {
    fontSize: '13px', fontWeight: '600' as const,
    color: '#16191f', display: 'block' as const, marginBottom: '6px'
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f2f3f3',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: "'Noto Sans', sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 16px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: '#232f3e', padding: '10px 20px', borderRadius: '6px'
          }}>
            <div style={{
              width: '28px', height: '28px', background: '#ff9900',
              borderRadius: '4px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: '700', fontSize: '14px',
              color: '#232f3e'
            }}>N</div>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>
              Nimbus<span style={{ color: '#ff9900' }}>IQ</span>
            </span>
          </div>
          <p style={{ color: '#545b64', fontSize: '13px', marginTop: '10px' }}>
            Create your free account
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', border: '1px solid #d5dbdb',
          borderRadius: '4px', padding: '28px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#16191f', marginBottom: '20px' }}>
            Create your account
          </h2>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fdf3f1', border: '1px solid #f5c6bc',
              borderLeft: '4px solid #d13212', borderRadius: '3px',
              padding: '10px 12px', marginBottom: '16px',
              fontSize: '13px', color: '#d13212'
            }}>
              {error}
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nikun Kumar"
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              style={inputStyle}
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
              placeholder="Repeat your password"
              style={inputStyle}
            />
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: '100%', padding: '9px', fontSize: '13px',
              fontWeight: '700', background: loading ? '#aab7b8' : '#ec7211',
              color: 'white', border: 'none', borderRadius: '3px',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span style={{ fontSize: '13px', color: '#545b64' }}>
              Already have an account?{' '}
            </span>
            <span
              onClick={() => router.push('/login')}
              style={{ fontSize: '13px', color: '#0073bb', cursor: 'pointer', fontWeight: '600' }}
            >
              Sign in
            </span>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#879596', marginTop: '16px' }}>
          © 2026 NimbusIQ · AWS Infrastructure Monitor
        </p>
      </div>
    </div>
  )
}