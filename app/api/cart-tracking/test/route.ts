import { NextResponse } from 'next/server'
import { CartTrackingService } from '@/lib/services/cart-tracking-service'

export async function GET() {
  try {
    // Test if tracking is enabled
    const isEnabled = await CartTrackingService.isTrackingEnabled()
    
    // Test analytics
    const analytics = await CartTrackingService.getCartAnalytics(7) // Last 7 days
    
    // Test abandoned carts
    const abandonedCarts = await CartTrackingService.getAbandonedCarts(24) // Last 24 hours
    
    return NextResponse.json({
      success: true,
      trackingEnabled: isEnabled,
      analytics,
      abandonedCartsCount: abandonedCarts.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cart tracking test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, eventType, data } = body

    if (!sessionId || !eventType) {
      return NextResponse.json(
        { success: false, error: 'sessionId and eventType are required' },
        { status: 400 }
      )
    }

    // Test event tracking
    const event = await CartTrackingService.trackEvent(sessionId, eventType, data)

    return NextResponse.json({
      success: true,
      event,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cart tracking event test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 