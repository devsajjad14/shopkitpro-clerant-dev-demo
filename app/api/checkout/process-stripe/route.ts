import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentSettings } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
  
  try {
    const body = await request.json()
    
    console.log('=== STRIPE CHECKOUT START ===')
    console.log('Processing Stripe payment for order:', body.order_id)
    
    // Get payment settings from database
    const settings = await db.select().from(paymentSettings)
    
    if (settings.length === 0) {
      return NextResponse.json(
        { error: 'Payment settings not configured' },
        { status: 500 }
      )
    }
    
    // Find Stripe settings
    const stripeSettings = settings.find(s => s.name === 'Stripe')
    const generalSettings = settings.find(s => s.name === 'General' || s.paymentMethod === 'general')
    
    // Check if Credit/Debit Card is enabled
    const isCardEnabled = generalSettings?.cardEnabled || stripeSettings?.isActive || false
    if (!isCardEnabled) {
      return NextResponse.json(
        { error: 'Credit/Debit Card payment is not enabled' },
        { status: 400 }
      )
    }
    
    if (!stripeSettings) {
      return NextResponse.json(
        { error: 'Stripe settings not configured' },
        { status: 500 }
      )
    }
    
    // Get Stripe credentials
    const secretKey = stripeSettings.secretKey || ''
    const publishableKey = stripeSettings.publishableKey || ''
    const environment = stripeSettings.environment || 'sandbox'
    
    if (!secretKey) {
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      )
    }
    
    console.log('Stripe credentials loaded:', {
      environment,
      secretKeyLength: secretKey.length,
      publishableKeyLength: publishableKey.length
    })
    
    // Prepare payment configuration for backend
    const paymentConfig = {
      api_key: secretKey,
      publishable_key: publishableKey,
      environment: environment,
      webhook_secret: null // Add if you have webhook secret configured
    }
    
    // Prepare the request payload for the backend
    const backendPayload = {
      ...body,
      payment_config: paymentConfig
    }
    
    console.log('Sending request to backend:', {
      order_id: body.order_id,
      total_amount: body.total_amount,
      currency: body.currency,
      payment_method_type: body.payment_method?.type
    })
    
    // Call backend Stripe service
    const response = await fetch(`${backendUrl}/checkout/credit-card/stripe/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    })
    
    const result = await response.json()
    
    console.log('Backend response status:', response.status)
    console.log('Backend response success:', result.success)
    console.log('=== STRIPE CHECKOUT END ===')
    
    if (response.ok && result.success) {
      return NextResponse.json({
        success: true,
        order_id: result.order_id,
        payment_intent: result.payment_intent,
        status: result.status,
        message: result.message
      })
    } else {
      // Handle validation errors specifically
      let errorMessage = 'Failed to process Stripe payment'
      
      if (response.status === 422) {
        // Validation error - extract specific field errors
        if (result.detail && Array.isArray(result.detail)) {
          const fieldErrors = result.detail.map((err: any) => 
            `${err.loc?.join('.') || 'field'}: ${err.msg}`
          ).join(', ')
          errorMessage = `Validation error: ${fieldErrors}`
        } else if (result.detail) {
          errorMessage = `Validation error: ${result.detail}`
        }
      } else if (result.error) {
        errorMessage = result.error
      } else if (result.detail) {
        errorMessage = result.detail
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage
        },
        { status: response.status }
      )
    }
    
  } catch (error) {
    console.error('Error processing Stripe payment:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process Stripe payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 