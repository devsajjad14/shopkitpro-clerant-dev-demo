import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentSettings, orders } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    console.log('=== KLARNA PAYMENT PROCESSING START ===')
    
    const body = await request.json()
    console.log('Klarna payment request received:', {
      order_id: body.order_id,
      customer_email: body.customer?.email,
      total_amount: body.total_amount,
      currency: body.currency
    })
    
    // Get payment settings from database
    const settings = await db.select().from(paymentSettings)
    console.log('Payment settings found:', settings.length)
    
    // Find Klarna settings by name (like Square/Authorize.Net)
    const klarnaSettings = settings.find(s => s.name === 'Klarna')
    console.log('Full Klarna settings:', klarnaSettings)
    console.log('Klarna settings found:', !!klarnaSettings)

    if (!klarnaSettings || !klarnaSettings.isActive) {
      console.error('Klarna payment gateway is not configured or not active')
      return NextResponse.json(
        { 
          success: false,
          error: 'Klarna payment gateway is not configured or not active'
        },
        { status: 400 }
      )
    }

    // Extract Klarna credentials from correct fields
    const merchantId = klarnaSettings.klarnaMerchantId || ''
    const username = klarnaSettings.klarnaUsername || ''
    const password = klarnaSettings.klarnaPassword || ''
    const region = klarnaSettings.klarnaRegion || ''
    const environment = klarnaSettings.environment || 'sandbox'

    console.log('Klarna credentials extracted:', {
      merchantId,
      username: username ? `${username.substring(0, 4)}...` : 'empty',
      password: password ? '***' : 'empty',
      region,
      environment
    })

    // Validate Klarna credentials
    if (!username || !password) {
      console.error('Missing Klarna credentials')
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing Klarna credentials: Username and Password are required'
        },
        { status: 400 }
      )
    }

    // Create payment config for backend
    const paymentConfig = {
      merchant_id: merchantId,
      username,
      password,
      region,
      environment
    }

    // Add payment config to request body
    const requestBody = {
      ...body,
      payment_config: paymentConfig
    }
    
    // Proxy to backend Klarna session/payment endpoint
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${backendUrl}/checkout/klarna/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    
    const result = await response.json()
    
    console.log('Backend response status:', response.status)
    console.log('Backend response success:', result.success)

    if (response.status === 403) {
      // Klarna does not support this country/network
      return NextResponse.json(
        {
          success: false,
          error: 'Klarna is not available in your country or network. Please use a VPN or try a different payment method.'
        },
        { status: 403 }
      )
    }
    // Handle backend 400 with 403 Forbidden HTML in error
    if (response.status === 400 && typeof result.error === 'string' && result.error.includes('403 Forbidden')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Klarna is not available in your country or network. Please use a VPN or try a different payment method.'
        },
        { status: 403 }
      )
    }
    
    if (response.ok && result.success) {
      // Insert order into DB (orders table)
      await db.insert(orders).values({
        guestEmail: body.customer?.email,
        totalAmount: body.total_amount,
        subtotal: body.subtotal,
        tax: body.tax_amount,
        shippingFee: body.shipping_amount,
        discount: body.discount_amount,
        paymentMethod: 'klarna',
        status: 'completed',
        paymentStatus: 'paid',
        createdAt: new Date(),
        // TODO: Add userId, shippingAddressId, billingAddressId, etc. if available
      })
      console.log('Order inserted into DB')
      console.log('=== KLARNA PAYMENT PROCESSING END ===')
      return NextResponse.json({ ...result, success: true })
    } else {
      console.error('Klarna payment processing failed:', result.error || result.detail)
      console.log('=== KLARNA PAYMENT PROCESSING END ===')
      return NextResponse.json(
        { 
          success: false,
          error: result.detail || result.message || result.error || 'Failed to process Klarna payment'
        },
        { status: response.status }
      )
    }
    
  } catch (error) {
    console.error('Error processing Klarna payment:', error)
    console.log('=== KLARNA PAYMENT PROCESSING END ===')
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process Klarna payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 