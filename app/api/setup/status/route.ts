import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Cache setup status for 1 hour
let setupStatusCache: { isSetup: boolean; timestamp: number } | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

async function checkSetupStatus(): Promise<{ isSetup: boolean; hasSettings: boolean; hasAdminUsers: boolean }> {
  try {
    // Check cache first
    if (setupStatusCache && Date.now() - setupStatusCache.timestamp < CACHE_DURATION) {
      return {
        isSetup: setupStatusCache.isSetup,
        hasSettings: setupStatusCache.isSetup,
        hasAdminUsers: setupStatusCache.isSetup
      }
    }

    // Check if settings table exists
    const tableResult = await db.execute(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'settings'
      ) as table_exists
    `)

    const tableExists = tableResult.rows[0]?.table_exists

    if (!tableExists) {
      setupStatusCache = { isSetup: false, timestamp: Date.now() }
      return {
        isSetup: false,
        hasSettings: false,
        hasAdminUsers: false
      }
    }

    // Check if settings table has data
    const settingsResult = await db.execute(`
      SELECT COUNT(*) as count FROM settings
    `)

    const hasSettings = settingsResult.rows[0]?.count > 0

    // Check if admin_users table has data
    const adminResult = await db.execute(`
      SELECT COUNT(*) as count FROM admin_users
    `)

    const hasAdminUsers = adminResult.rows[0]?.count > 0

    const isSetup = hasSettings && hasAdminUsers

    setupStatusCache = { isSetup, timestamp: Date.now() }

    return {
      isSetup,
      hasSettings,
      hasAdminUsers
    }
  } catch (error) {
    console.error('Setup status check failed:', error)
    // Default to not setup on error
    setupStatusCache = { isSetup: false, timestamp: Date.now() }
    return {
      isSetup: false,
      hasSettings: false,
      hasAdminUsers: false
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Add cache headers for better performance
    const response = NextResponse.json({
      success: true,
      data: await checkSetupStatus(),
      timestamp: Date.now()
    })

    // Set cache headers
    response.headers.set('Cache-Control', 'public, max-age=3600') // 1 hour
    response.headers.set('ETag', `"${Date.now()}"`)
    
    return response
  } catch (error) {
    console.error('Setup status API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check setup status',
      timestamp: Date.now()
    }, { status: 500 })
  }
}

// Clear cache when setup is completed
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'clear-cache') {
      setupStatusCache = null
      return NextResponse.json({
        success: true,
        message: 'Cache cleared'
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid request'
    }, { status: 400 })
  }
} 