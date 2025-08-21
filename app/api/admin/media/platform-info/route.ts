import { NextResponse } from 'next/server'

// Simple platform detection
function getCurrentPlatform(): 'vercel' | 'server' {
  // Check for Vercel environment variables
  if (process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL) {
    return 'vercel'
  }
  return 'server'
}

export async function GET() {
  try {
    const platform = getCurrentPlatform()
    
    const info = {
      platform,
      environment: {
        VERCEL: !!process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV || null,
        VERCEL_URL: !!process.env.VERCEL_URL,
        BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
        NODE_ENV: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    }
    
    console.log('🔍 [PLATFORM-INFO] Current platform info:', info)
    
    return NextResponse.json(info)
  } catch (error) {
    console.error('🔍 [PLATFORM-INFO] Error getting platform info:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get platform information',
        platform: 'error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}