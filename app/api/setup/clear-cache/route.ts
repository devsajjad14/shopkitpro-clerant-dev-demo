import { NextRequest, NextResponse } from 'next/server'
import { clearSetupStatusCache } from '@/lib/utils/setup-check'

export async function POST(request: NextRequest) {
  try {
    // Clear setup status cache
    clearSetupStatusCache()
    
    // Clear session storage cache
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('setupStatus')
    }
    
    return NextResponse.json({
      success: true,
      message: 'All setup caches cleared successfully'
    })
  } catch (error) {
    console.error('Cache clear error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache'
    }, { status: 500 })
  }
} 