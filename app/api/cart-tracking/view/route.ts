import { NextRequest, NextResponse } from 'next/server'
import { CartTrackingService } from '@/lib/services/cart-tracking-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, userId, email, name, cartData } = body
    
    // Only track if user is logged in
    if (!userId || !email) {
      return NextResponse.json({ success: false, error: 'User not logged in' }, { status: 400 })
    }

    // Validate cart data - if no cartData or empty cart, don't track
    let itemCount = 0
    let totalAmount = 0

    if (cartData) {
      itemCount = cartData.itemCount || 0
      totalAmount = parseFloat(cartData.totalAmount || '0')
    }

    if (itemCount <= 0 || totalAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Cart validation failed - no items or zero amount' }, { status: 400 })
    }

    // Initialize or update session and track view
    const session = await CartTrackingService.getOrCreateSession(sessionId, userId, email, name, cartData)
    if (!session) return NextResponse.json({ success: false, error: 'Session not created or cart validation failed' }, { status: 500 })
    
    await CartTrackingService.updateSession(sessionId, cartData)
    await CartTrackingService.trackEvent(sessionId, 'view_cart', { metadata: { cartData } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error)?.message || 'Unknown error' }, { status: 500 })
  }
} 