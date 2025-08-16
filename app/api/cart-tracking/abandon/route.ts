import { NextRequest, NextResponse } from 'next/server'
import { CartTrackingService } from '@/lib/services/cart-tracking-service'

export async function POST(req: NextRequest) {
  try {
    let body
    const contentType = req.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      body = await req.json()
    } else {
      // Handle sendBeacon request (text/plain)
      const text = await req.text()
      try {
        body = JSON.parse(text)
      } catch (e) {
        console.error('❌ Failed to parse sendBeacon body:', e)
        return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
      }
    }

    const { sessionId, userId, email, name, cartData } = body
    
    // Check if cart abandonment tracking is enabled
    const isEnabled = await CartTrackingService.isTrackingEnabled()
    if (!isEnabled) {
      console.log('Cart abandonment tracking is disabled, skipping')
      return NextResponse.json({ success: true, message: 'Tracking disabled' })
    }
    
    if (!email) {
      console.log('No email provided for abandonment tracking')
      return NextResponse.json({ success: false, error: 'User not logged in' }, { status: 400 })
    }

    // For abandonment, we allow tracking even if cart data is zero
    // because the user might have cleared the cart before leaving
    const session = await CartTrackingService.getOrCreateSession(sessionId, userId, email, name, cartData, false)
    
    if (!session) {
      console.log('No session created for abandonment tracking')
      return NextResponse.json({ success: false, error: 'Session not created' }, { status: 500 })
    }

    // Extract cart data for abandonment tracking
    const itemCount = cartData?.itemCount || 0
    const totalAmount = cartData?.totalAmount || 0

    await CartTrackingService.markAbandoned(session.sessionId, totalAmount, itemCount)
    
    console.log('✅ Cart abandonment tracked successfully:', { sessionId, email, itemCount, totalAmount })
    return NextResponse.json({ success: true, updatedToAbandoned: true })
  } catch (error) {
    console.error('❌ Error in cart abandonment tracking:', error)
    return NextResponse.json({ success: false, error: (error as Error)?.message || 'Unknown error' }, { status: 500 })
  }
} 