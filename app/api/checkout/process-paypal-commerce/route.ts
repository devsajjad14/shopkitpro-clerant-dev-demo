import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentSettings } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    console.log('===PAYPAL COMMERCE CARD PAYMENT START===')
    const body = await request.json()
    console.log('Processing PayPal Commerce card payment for order:', body.order_id)

    // Get payment settings from database
    const settings = await db.select().from(paymentSettings)

    // Find PayPal Commerce Card settings by name (mirror Stripe/Square logic)
    const paypalCardSettings = settings.find(s => s.name === 'PayPal Commerce Card');
    if (!paypalCardSettings || !paypalCardSettings.isActive || !paypalCardSettings.cardEnabled) {
      console.error('PayPal Commerce Platform is not configured or not active as the card gateway');
      console.log('===PAYPAL COMMERCE CARD PAYMENT END===')
      return NextResponse.json(
        {
          success: false,
          error: 'PayPal Commerce Platform is not configured or not active as the card gateway'
        },
        { status: 400 }
      );
    }
    // Only log that the correct settings were found
    const cardGateway = paypalCardSettings.cardGateway || '';
    const cardEnvironment = paypalCardSettings.cardEnvironment || 'sandbox';
    let cardCredentials: Record<string, any> = {};
    if (paypalCardSettings.cardCredentials) {
      cardCredentials = typeof paypalCardSettings.cardCredentials === 'string'
        ? JSON.parse(paypalCardSettings.cardCredentials)
        : paypalCardSettings.cardCredentials;
    }

    // Check if PayPal Commerce is the selected card gateway and enabled
    if (!paypalCardSettings.cardEnabled || cardGateway !== 'paypal-commerce') {
      console.error('PayPal Commerce Platform is not configured or not active as the card gateway')
      console.log('===PAYPAL COMMERCE CARD PAYMENT END===')
      return NextResponse.json(
        {
          success: false,
          error: 'PayPal Commerce Platform is not configured or not active as the card gateway'
        },
        { status: 400 }
      )
    }

    // Extract PayPal credentials from the shared cardCredentials object
    const clientId = cardCredentials['Client ID'] || ''
    const clientSecret = cardCredentials['Client Secret'] || ''
    const environment = cardEnvironment

    // Log credential presence and length, not values
    console.log('PayPal Commerce credentials loaded:', {
      environment,
      clientIdLength: clientId.length,
      clientSecretLength: clientSecret.length
    })

    // Validate PayPal credentials
    if (!clientId || !clientSecret) {
      console.error('Missing PayPal Commerce Platform credentials')
      console.log('===PAYPAL COMMERCE CARD PAYMENT END===')
      return NextResponse.json(
        {
          success: false,
          error: 'Missing PayPal Commerce Platform credentials: Client ID and Client Secret are required'
        },
        { status: 400 }
      )
    }

    // Create payment config for backend
    const paymentConfig = {
      client_id: clientId,
      client_secret: clientSecret,
      environment: environment
    }

    // Add payment config to request body
    const requestBody = {
      ...body,
      payment_config: paymentConfig
    }

    // Log backend request
    console.log('Sending request to backend:', {
      order_id: body.order_id,
      total_amount: body.total_amount,
      currency: body.currency
    })

    // Proxy to backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${backendUrl}/checkout/credit-card/paypal-commerce/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const result = await response.json()

    // Log backend response
    console.log('Backend response status:', response.status)
    console.log('Backend response success:', result.success)
    console.log('===PAYPAL COMMERCE CARD PAYMENT END===')

    if (response.ok) {
      return NextResponse.json(result)
    } else {
      // If backend returns a structured error with a user-friendly message, surface it
      let userError = result?.error
      if (result?.detail && typeof result.detail === 'object' && result.detail.error) {
        userError = result.detail.error
      } else if (typeof result?.detail === 'string') {
        userError = result.detail
      }
      return NextResponse.json(
        {
          success: false,
          error: userError || result.message || 'Failed to process PayPal Commerce card payment'
        },
        { status: response.status }
      )
    }

  } catch (error) {
    console.error('Error processing PayPal Commerce card payment:', error)
    console.log('===PAYPAL COMMERCE CARD PAYMENT END===')
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process PayPal Commerce card payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 