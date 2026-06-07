'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveAuth } from '../../lib/auth.js'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    if (!email || !password) {
      setError('Email and password are required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('https://nimbusiq.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error)
        return
      }
      saveAuth(data.token, data.user)
      if (!data.user.hasAwsCredentials) {
        router.push('/setup')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Cannot connect to server. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f2f3f3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Noto Sans', sans-serif"
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
              justifyContent: 'center', fontWeight: '700', fontSize: '14px', color: '#232f3e'
            }}>N</div>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>
              Nimbus<span style={{ color: '#ff9900' }}>IQ</span>
            </span>
          </div>
          <p style={{ color: '#545b64', fontSize: '13px', marginTop: '10px' }}>
            Cloud Infrastructure Monitor
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white', border: '1px solid #d5dbdb',
          borderRadius: '4px', padding: '28px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#16191f', marginBottom: '20px' }}>
            Sign in to NimbusIQ
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

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#16191f', display: 'block', marginBottom: '6px' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '8px 10px', fontSize: '13px',
                border: '1px solid #aab7b8', borderRadius: '3px',
                fontFamily: 'inherit', outline: 'none', color: '#16191f'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#16191f', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '8px 10px', fontSize: '13px',
                border: '1px solid #aab7b8', borderRadius: '3px',
                fontFamily: 'inherit', outline: 'none', color: '#16191f'
              }}
            />
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '9px', fontSize: '13px',
              fontWeight: '700', background: loading ? '#aab7b8' : '#ec7211',
              color: 'white', border: 'none', borderRadius: '3px',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {/* Divider */}
          <div style={{
            borderTop: '1px solid #d5dbdb', margin: '20px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ background: 'white', padding: '0 10px', fontSize: '12px', color: '#879596', marginTop: '-10px' }}>
              New to NimbusIQ?
            </span>
          </div>

          {/* Register Link */}
          <button
            onClick={() => router.push('/register')}
            style={{
              width: '100%', padding: '8px', fontSize: '13px',
              fontWeight: '600', background: 'white', color: '#0073bb',
              border: '1px solid #0073bb', borderRadius: '3px',
              cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            Create a new account
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#879596', marginTop: '16px' }}>
          © 2026 NimbusIQ · AWS Infrastructure Monitor
        </p>
      </div>
    </div>
  )
}