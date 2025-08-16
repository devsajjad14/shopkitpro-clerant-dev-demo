import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from './lib/db'

// Cache setup status for 1 minute to be more responsive to changes
let setupStatusCache: { isSetup: boolean; timestamp: number } | null = null
const CACHE_DURATION = 1 * 60 * 1000 // 1 minute (reduced from 5 minutes)

async function checkSetupStatus(): Promise<boolean> {
  try {
    // Check cache first
    if (setupStatusCache && Date.now() - setupStatusCache.timestamp < CACHE_DURATION) {
      return setupStatusCache.isSetup
    }

    console.log('Checking database for setup status...')

    // Check if settings table exists and has data
    const result = await db.execute(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'settings'
      ) as table_exists
    `)

    const tableExists = result.rows[0]?.table_exists
    console.log('Settings table exists:', tableExists)

    if (!tableExists) {
      setupStatusCache = { isSetup: false, timestamp: Date.now() }
      return false
    }

    // Check if settings table has any data
    const settingsResult = await db.execute(`
      SELECT COUNT(*) as count FROM settings
    `)

    const hasSettings = settingsResult.rows[0]?.count > 0
    console.log('Settings table has data:', hasSettings)

    setupStatusCache = { isSetup: hasSettings, timestamp: Date.now() }
    return hasSettings
  } catch (error) {
    console.error('Setup status check failed:', error)
    // Default to not setup on error - this ensures setup page is accessible
    setupStatusCache = { isSetup: false, timestamp: Date.now() }
    return false
  }
}

// Function to clear middleware cache
export function clearMiddlewareCache() {
  setupStatusCache = null
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }

  // Skip setup check for setup-related routes (admin/setup, welcome, api/setup)
  if (
    pathname.startsWith('/admin/setup') ||
    pathname.startsWith('/welcome') ||
    pathname.startsWith('/api/setup')
  ) {
    return NextResponse.next()
  }

  // If reset parameter is present, force clear the cache
  if (searchParams.get('reset')) {
    console.log('Reset parameter detected, clearing middleware cache')
    setupStatusCache = null
  }

  // Check setup status (server-side, cached)
  const isSetup = await checkSetupStatus()
  console.log('Middleware processing pathname:', pathname, 'Setup status:', isSetup)

  // If setup is complete and user is trying to access /setup, redirect to frontend URL
  if (isSetup && pathname.startsWith('/setup')) {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
    console.log('Redirecting from /setup to:', frontendUrl)
    return NextResponse.redirect(frontendUrl)
  }

  // If not setup and user is not already on /setup, redirect to setup page
  if (!isSetup && !pathname.startsWith('/setup')) {
    const setupUrl = new URL('/setup', request.url)
    
    // Preserve original URL for redirect after setup
    if (pathname !== '/') {
      setupUrl.searchParams.set('redirect', pathname)
    }
    
    console.log('Redirecting to setup page:', setupUrl.toString())
    return NextResponse.redirect(setupUrl)
  }

  // If setup is complete, allow the request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
