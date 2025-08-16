import { NextRequest, NextResponse } from 'next/server'
import { CartTrackingService } from '@/lib/services/cart-tracking-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, userId, email, name, productId, productName, quantity, price, totalValue, metadata } = body
    if (!email) {
      return NextResponse.json({ success: false, error: 'User not logged in' }, { status: 400 })
    }
    const session = await CartTrackingService.getOrCreateSession(sessionId, userId, email, name)
    if (!session) return NextResponse.json({ success: false, error: 'Session not created' }, { status: 500 })
    await CartTrackingService.updateSession(session.sessionId, {
      // You can add more cart data here if needed
      updatedAt: new Date(),
    })
    await CartTrackingService.trackEvent(session.sessionId, 'remove_item', {
      productId,
      productName,
      quantity,
      price,
      totalValue,
      metadata,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 })
  }
} 