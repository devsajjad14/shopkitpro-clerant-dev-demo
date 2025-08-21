import { NextResponse } from 'next/server'
// Platform detection function - copied locally to avoid import issues
async function getCurrentPlatform() {
  try {
    // First, check environment variables for Vercel
    if (process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL) {
      console.log('🔍 [PLATFORM] Vercel environment detected from env vars')
      return 'vercel'
    }

    // Default to server if no Vercel env vars
    console.log('🔍 [PLATFORM] Server environment detected')
    return 'server'
    
  } catch (error) {
    console.warn('⚠️ [PLATFORM] Error in platform detection:', error)
    
    // Final fallback - check environment again
    if (process.env.VERCEL || process.env.VERCEL_ENV || process.env.VERCEL_URL) {
      return 'vercel'
    } else {
      return 'server'
    }
  }
}

export async function GET() {
  try {
    const platform = await getCurrentPlatform()
    
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
    console.error('Error getting platform info:', error)
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