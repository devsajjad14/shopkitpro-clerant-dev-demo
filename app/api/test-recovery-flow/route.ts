import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions, cartEvents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recoveryCartId, recoveryEmail, cartData } = body
    
    console.log('🧪 Testing recovery flow with:', { recoveryCartId, recoveryEmail, cartData })
    
    // Step 1: Check if the abandoned cart exists
    const abandonedCart = await db
      .select()
      .from(cartSessions)
      .where(eq(cartSessions.id, recoveryCartId))
      .limit(1)
    
    console.log('📋 Found abandoned cart:', abandonedCart)
    
    if (abandonedCart.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Recovery cart not found',
        step: 'cart_lookup'
      })
    }
    
    const originalSession = abandonedCart[0]
    console.log('✅ Original session:', originalSession)
    
    // Step 2: Verify email match
    if (originalSession.customerEmail !== recoveryEmail) {
      return NextResponse.json({
        success: false,
        error: 'Email mismatch',
        step: 'email_verification',
        originalEmail: originalSession.customerEmail,
        recoveryEmail
      })
    }
    
    // Step 3: Mark as recovered
    const updateResult = await db
      .update(cartSessions)
      .set({ 
        status: 'recovered',
        recovered_at: new Date(),
        recovery_session_id: `test_${Date.now()}`,
        recovery_amount: cartData?.totalAmount || 0
      })
      .where(eq(cartSessions.id, recoveryCartId))
    
    console.log('🔄 Update result:', updateResult)
    
    // Step 4: Track recovery event
    const eventResult = await db
      .insert(cartEvents)
      .values({
        sessionId: originalSession.sessionId,
        eventType: 'recovery_completed',
        productId: null,
        productName: null,
        quantity: 0,
        price: null,
        totalValue: cartData?.totalAmount || 0,
        metadata: {
          recoveryCartId,
          recoveryEmail,
          testSessionId: `test_${Date.now()}`,
          originalAbandonedAt: originalSession.abandonedAt,
          recoveryCompletedAt: new Date().toISOString()
        }
      })
    
    console.log('📝 Event result:', eventResult)
    
    // Step 5: Verify the update
    const updatedCart = await db
      .select()
      .from(cartSessions)
      .where(eq(cartSessions.id, recoveryCartId))
      .limit(1)
    
    console.log('✅ Updated cart:', updatedCart)
    
    return NextResponse.json({
      success: true,
      message: 'Recovery test completed successfully',
      originalSession,
      updatedCart: updatedCart[0],
      testData: {
        recoveryCartId,
        recoveryEmail,
        cartData
      }
    })
    
  } catch (error) {
    console.error('❌ Error in recovery test:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 