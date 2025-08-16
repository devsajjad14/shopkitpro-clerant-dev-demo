import { Resend } from 'resend'
import { db } from '@/lib/db'
import { cartSessions, cartEvents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailData {
  to: string
  customerName?: string
  cartItems?: Array<{
    name: string
    price: number
    quantity: number
    image?: string
  }>
  totalAmount: number
  itemCount: number
  cartId: string
  recoveryUrl?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  private static generateRecoveryUrl(cartId: string, customerEmail: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const encodedEmail = encodeURIComponent(customerEmail)
    const encodedCartId = encodeURIComponent(cartId)
    return `${baseUrl}/cart?recovery=true&email=${encodedEmail}&cart=${encodedCartId}`
  }

  private static createCartRecoveryTemplate(data: EmailData): EmailTemplate {
    const recoveryUrl = data.recoveryUrl || this.generateRecoveryUrl(data.cartId, data.to)
    const customerName = data.customerName || 'Valued Customer'
    const totalFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(data.totalAmount)

    const itemsHtml = data.cartItems?.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">` : ''}
            <div>
              <div style="font-weight: 600; color: #1f2937;">${item.name}</div>
              <div style="color: #6b7280; font-size: 14px;">Qty: ${item.quantity}</div>
            </div>
          </div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
          ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price)}
        </td>
      </tr>
    `).join('') || ''

    return {
      subject: `Complete Your Order - ${totalFormatted} Left in Your Cart`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Complete Your Order</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
            .content { padding: 40px 20px; }
            .cart-summary { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; }
            .cart-items { border-collapse: collapse; width: 100%; margin: 16px 0; }
            .cart-items th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; color: #374151; }
            .total-row { background: #f3f4f6; font-weight: 700; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
            .footer { background: #f9fafb; padding: 24px 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .urgency { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .urgency h3 { color: #92400e; margin: 0 0 8px 0; font-size: 16px; }
            .urgency p { color: #92400e; margin: 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 Complete Your Order</h1>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; margin-bottom: 16px;">Hi ${customerName},</h2>
              
              <p style="margin-bottom: 24px; font-size: 16px;">
                We noticed you left some amazing items in your cart! Don't let them get away - 
                complete your purchase and enjoy your new products.
              </p>

              <div class="urgency">
                <h3>⏰ Limited Time Offer</h3>
                <p>Complete your order within 24 hours to secure your items and enjoy fast shipping!</p>
              </div>

              <div class="cart-summary">
                <h3 style="margin: 0 0 16px 0; color: #1f2937;">Your Cart Summary</h3>
                <table class="cart-items">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style="text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                    <tr class="total-row">
                      <td style="padding: 12px; font-weight: 700; color: #1f2937;">Total</td>
                      <td style="padding: 12px; text-align: right; font-weight: 700; color: #1f2937; font-size: 18px;">
                        ${totalFormatted}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style="text-align: center;">
                <a href="${recoveryUrl}" class="cta-button">
                  🛒 Complete Your Order
                </a>
              </div>

              <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
                If you have any questions, feel free to reply to this email or contact our support team.
              </p>
            </div>

            <div class="footer">
              <p>© 2024 My Store. All rights reserved.</p>
              <p>This email was sent to ${data.to}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Complete Your Order - ${totalFormatted} Left in Your Cart

Hi ${customerName},

We noticed you left some amazing items in your cart! Don't let them get away - complete your purchase and enjoy your new products.

⏰ Limited Time Offer
Complete your order within 24 hours to secure your items and enjoy fast shipping!

Your Cart Summary:
${data.cartItems?.map(item => `- ${item.name} (Qty: ${item.quantity}) - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price)}`).join('\n') || ''}

Total: ${totalFormatted}

Complete your order here: ${recoveryUrl}

If you have any questions, feel free to reply to this email or contact our support team.

© 2024 My Store. All rights reserved.
This email was sent to ${data.to}
      `
    }
  }

  static async sendCartRecoveryEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured. Please add your Resend API key to your environment variables.')
      }

      if (!process.env.FROM_EMAIL) {
        console.warn('FROM_EMAIL not configured, using default sender')
      }

      // Fetch the actual cart session data from database
      const cartSession = await db
        .select()
        .from(cartSessions)
        .where(eq(cartSessions.id, data.cartId))
        .limit(1)

      if (cartSession.length === 0) {
        throw new Error('Cart session not found')
      }

      const session = cartSession[0]

      // Fetch cart items from view_cart event metadata
      const viewCartEvent = await db
        .select({
          metadata: cartEvents.metadata,
        })
        .from(cartEvents)
        .where(
          and(
            eq(cartEvents.sessionId, session.sessionId),
            eq(cartEvents.eventType, 'view_cart')
          )
        )
        .orderBy(cartEvents.createdAt)
        .limit(1)

      // Extract cart items from view_cart event metadata
      let cartItems: Array<{name: string, price: number, quantity: number, image?: string}> = []
      
      if (viewCartEvent.length > 0 && viewCartEvent[0].metadata) {
        const metadata = viewCartEvent[0].metadata as any
        if (metadata.cartData && metadata.cartData.items && Array.isArray(metadata.cartData.items)) {
          cartItems = metadata.cartData.items.map((item: any) => ({
            name: item.name || 'Unknown Product',
            price: parseFloat(item.price?.toString() || '0'),
            quantity: item.quantity || 1,
            image: item.image || undefined
          }))
        }
      }

      // If no items found in view_cart, try add_item events as fallback
      if (cartItems.length === 0) {
        const cartItemsEvents = await db
          .select({
            productName: cartEvents.productName,
            quantity: cartEvents.quantity,
            price: cartEvents.price,
          })
          .from(cartEvents)
          .where(
            and(
              eq(cartEvents.sessionId, session.sessionId),
              eq(cartEvents.eventType, 'add_item')
            )
          )

        cartItems = cartItemsEvents.map(event => ({
          name: event.productName || 'Unknown Product',
          price: parseFloat(event.price?.toString() || '0'),
          quantity: event.quantity || 1,
          image: undefined
        }))
      }

      // Update the email data with real cart information
      const updatedEmailData = {
        ...data,
        totalAmount: parseFloat(session.totalAmount?.toString() || '0'),
        itemCount: session.itemCount || 0,
        cartItems: cartItems
      }

      console.log('Cart data for email:', {
        cartId: data.cartId,
        totalAmount: updatedEmailData.totalAmount,
        itemCount: updatedEmailData.itemCount,
        itemsCount: cartItems.length
      })

      const template = this.createCartRecoveryTemplate(updatedEmailData)
      
      console.log('Sending cart recovery email to:', data.to)
      
      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        to: data.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
        headers: {
          'X-Entity-Ref-ID': data.cartId,
        },
      })

      if (result.error) {
        console.error('Resend API error:', result.error)
        const errorMessage = result.error.message || result.error.error || 'Unknown API error'
        throw new Error(`Resend API error: ${errorMessage}`)
      }

      console.log('Email sent successfully with message ID:', result.data?.id)

      return {
        success: true,
        messageId: result.data?.id
      }
    } catch (error) {
      console.error('Failed to send cart recovery email:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        if (error.message.includes('RESEND_API_KEY')) {
          errorMessage = 'Email service not configured. Please check your Resend API key.'
        } else if (error.message.includes('Resend API error')) {
          errorMessage = `Email service error: ${error.message}`
        } else {
          errorMessage = error.message
        }
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  static async sendTestEmail(to: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured. Please add your Resend API key to your environment variables.')
      }

      if (!process.env.FROM_EMAIL) {
        console.warn('FROM_EMAIL not configured, using default sender')
      }

      console.log('Sending test email to:', to)
      
      const result = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
        to,
        subject: 'Test Email - Cart Recovery System',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email to verify your Resend configuration is working correctly.</p>
          <p>If you received this email, your cart recovery system is ready to go!</p>
        `,
        text: 'Test Email - Cart Recovery System\n\nThis is a test email to verify your Resend configuration is working correctly.',
      })

      if (result.error) {
        console.error('Resend API error:', result.error)
        const errorMessage = result.error.message || result.error.error || 'Unknown API error'
        throw new Error(`Resend API error: ${errorMessage}`)
      }

      console.log('Test email sent successfully with message ID:', result.data?.id)

      return {
        success: true,
        messageId: result.data?.id
      }
    } catch (error) {
      console.error('Failed to send test email:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        if (error.message.includes('RESEND_API_KEY')) {
          errorMessage = 'Email service not configured. Please check your Resend API key.'
        } else if (error.message.includes('Resend API error')) {
          errorMessage = `Email service error: ${error.message}`
        } else {
          errorMessage = error.message
        }
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }
} 