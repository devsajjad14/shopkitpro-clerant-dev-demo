import { NextResponse } from 'next/server'
import { clearMiddlewareCache } from '@/middleware'

export async function POST() {
  try {
    // Clear middleware cache only (setup flag clearing is handled elsewhere)
    clearMiddlewareCache()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Middleware cache cleared successfully' 
    })
  } catch (error) {
    console.error('Error clearing cache:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
} 