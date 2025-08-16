import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartSessions, campaignEmails, cartAbandonmentToggle, cartEvents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { recoveryCampaigns } from '@/lib/db/schema'
import { EmailService } from '@/lib/services/email-service'

export async function POST(request: NextRequest) {
  try {
    // Check if cart abandonment is enabled
    const toggleResult = await db.select().from(cartAbandonmentToggle).limit(1)
    if (toggleResult.length === 0 || !toggleResult[0].isEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Cart abandonment tracking is disabled'
      }, { status: 400 })
    }

    const body = await request.json()
    const { cartId } = body

    if (!cartId) {
      return NextResponse.json({
        success: false,
        error: 'Cart ID is required'
      }, { status: 400 })
    }

    // Get the abandoned cart
    const cartResult = await db
      .select()
      .from(cartSessions)
      .where(
        and(
          eq(cartSessions.id, cartId),
          eq(cartSessions.status, 'abandoned')
        )
      )
      .limit(1)

    if (cartResult.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Abandoned cart not found'
      }, { status: 404 })
    }

    const cart = cartResult[0]

    // Check if customer email exists
    if (!cart.customerEmail) {
      return NextResponse.json({
        success: false,
        error: 'No customer email found for this cart'
      }, { status: 400 })
    }

    // Check if an email was already sent for this session
    const existingEmail = await db.select().from(campaignEmails).where(eq(campaignEmails.sessionId, cart.sessionId)).limit(1)
    
    // Send the actual email using Resend
    const emailData = {
      to: cart.customerEmail,
      customerName: cart.customerName || undefined,
      totalAmount: parseFloat(cart.totalAmount || '0'),
      itemCount: cart.itemCount || 0,
      cartId: cart.id, // This will be used to fetch real cart data
      cartItems: undefined // Will be fetched from database in EmailService
    }

    const emailResult = await EmailService.sendCartRecoveryEmail(emailData)

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: `Failed to send email: ${emailResult.error}`
      }, { status: 500 })
    }

    // Update or create email record in database
    let emailRecord
    if (existingEmail.length > 0) {
      // Update existing record
      emailRecord = await db.update(campaignEmails)
        .set({ 
          status: 'sent', 
          sentAt: new Date(),
          messageId: emailResult.messageId || null
        })
        .where(eq(campaignEmails.id, existingEmail[0].id))
        .returning()
    } else {
      // Insert new record
      emailRecord = await db.insert(campaignEmails).values({
        sessionId: cart.sessionId,
        customerEmail: cart.customerEmail,
        customerName: cart.customerName,
        emailNumber: 1,
        status: 'sent',
        messageId: emailResult.messageId || null
      }).returning()
    }

    // Track the email send event
    await db.insert(cartEvents).values({
      sessionId: cart.sessionId,
      eventType: 'recover_cart',
      customerEmail: cart.customerEmail,
      customerName: cart.customerName,
      metadata: {
        cartId: cart.id,
        totalAmount: cart.totalAmount,
        itemCount: cart.itemCount,
        messageId: emailResult.messageId
      }
    })

    return NextResponse.json({
      success: true,
      email: emailRecord[0],
      messageId: emailResult.messageId,
      message: 'Recovery email sent successfully'
    })

  } catch (error) {
    console.error('Failed to send recovery email:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 