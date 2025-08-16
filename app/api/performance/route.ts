import { NextRequest, NextResponse } from 'next/server'
import { PerformanceMonitor } from '@/lib/utils/performance-monitor'

// Performance monitoring endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint') || undefined
    
    const monitor = PerformanceMonitor.getInstance()
    const stats = monitor.getStats(endpoint)
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get performance stats'
    }, { status: 500 })
  }
}