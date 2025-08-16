import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentSettings } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
  
  try {
    const body = await request.json()
    
    console.log('=== AUTHORIZE.NET CHECKOUT START ===')
    console.log('Processing Authorize.Net payment for order:', body.order_id)
    
    // Get payment settings from database
    const settings = await db.select().from(paymentSettings)
    
    if (settings.length === 0) {
      return NextResponse.json(
        { error: 'Payment settings not configured' },
        { status: 500 }
      )
    }
    
    // Find Authorize.Net settings
    const authorizeSettings = settings.find(s => s.name === 'Authorize.Net')
    const generalSettings = settings.find(s => s.name === 'General' || s.paymentMethod === 'general')
    
    // Check if Credit/Debit Card is enabled
    const isCardEnabled = generalSettings?.cardEnabled || authorizeSettings?.isActive || false
    if (!isCardEnabled) {
      return NextResponse.json(
        { error: 'Credit/Debit Card payment is not enabled' },
        { status: 400 }
      )
    }
    
    if (!authorizeSettings) {
      return NextResponse.json(
        { error: 'Authorize.Net settings not configured' },
        { status: 500 }
      )
    }
    
    // Get Authorize.Net credentials
    const apiLoginId = authorizeSettings.apiLoginId || ''
    const transactionKey = authorizeSettings.transactionKey || ''
    const environment = authorizeSettings.environment || 'sandbox'
    
    if (!apiLoginId || !transactionKey) {
      return NextResponse.json(
        { error: 'Authorize.Net credentials not configured' },
        { status: 500 }
      )
    }
    
    console.log('Authorize.Net credentials loaded:', {
      environment,
      apiLoginIdLength: apiLoginId.length,
      transactionKeyLength: transactionKey.length
    })
    
    // Prepare payment configuration for backend
    const paymentConfig = {
      api_login_id: apiLoginId,
      transaction_key: transactionKey,
      environment: environment
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
    
    // Call backend Authorize.Net service
    const response = await fetch(`${backendUrl}/checkout/credit-card/authorize/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    })
    
    const result = await response.json()
    
    console.log('Backend response status:', response.status)
    console.log('Backend response success:', result.success)
    console.log('=== AUTHORIZE.NET CHECKOUT END ===')
    
    if (response.ok && result.success) {
      return NextResponse.json({
        success: true,
        order_id: result.order_id,
        transaction_id: result.transaction_id,
        status: result.status,
        message: result.message
      })
    } else {
      // Handle validation errors specifically
      let errorMessage = 'Failed to process Authorize.Net payment'
      
      if (response.status === 422) {
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
    console.error('Error processing Authorize.Net payment:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process Authorize.Net payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 