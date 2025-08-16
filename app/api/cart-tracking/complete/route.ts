import { NextRequest, NextResponse } from 'next/server'
import { CartTrackingService } from '@/lib/services/cart-tracking-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, userId, email, name, totalAmount, cartData } = body
    if (!email) {
      return NextResponse.json({ success: false, error: 'User not logged in' }, { status: 400 })
    }
    
    // For completed orders, we allow tracking even if cart data is zero
    // because the order was already placed successfully
    const session = await CartTrackingService.getOrCreateSession(sessionId, userId, email, name, cartData, true)
    if (!session) return NextResponse.json({ success: false, error: 'Session not created' }, { status: 500 })
    
    await CartTrackingService.updateSession(session.sessionId, {
      updatedAt: new Date(),
    })
    
    // Extract itemCount from cartData
    const itemCount = cartData?.itemCount || 0
    
    await CartTrackingService.markCompleted(session.sessionId, totalAmount, itemCount)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error)?.message || 'Unknown error' }, { status: 500 })
  }
} 