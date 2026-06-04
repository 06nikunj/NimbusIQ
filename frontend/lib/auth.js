import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const TOKEN_KEY = 'nimbusiq_token'
const USER_KEY = 'nimbusiq_user'

// Save token and user after login
export function saveAuth(token, user) {
  Cookies.set(TOKEN_KEY, token, { expires: 7 })
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// Get token
export function getToken() {
  return Cookies.get(TOKEN_KEY)
}

// Get current user from localStorage
export function getUser() {
  try {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

// Check if user is logged in
export function isLoggedIn() {
  const token = getToken()
  if (!token) return false
  try {
    const decoded = jwtDecode(token)
    // Check token is not expired
    return decoded.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

// Logout — clear everything
export function logout() {
  Cookies.remove(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.location.href = '/login'
}

// Get auth header for API calls
export function getAuthHeader() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}