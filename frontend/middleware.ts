import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages that don't need login
const publicPages = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('nimbusiq_token')?.value

  // If public page — allow always
  if (publicPages.includes(pathname)) {
    // If already logged in and visiting login/register — redirect to dashboard
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // If protected page and no token — redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard',
    '/ec2',
    '/s3',
    '/costs',
    '/optimizer',
    '/alerts',
    '/settings',
    '/setup',
    '/login',
    '/register',
  ]
}