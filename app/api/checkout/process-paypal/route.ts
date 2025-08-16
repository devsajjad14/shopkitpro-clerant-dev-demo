import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentSettings } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
  
  try {
    const body = await request.json()
    
    console.log('=== PAYPAL CHECKOUT PROCESSING START ===')
    console.log('Received checkout request for PayPal')
    
    // Get payment settings from database
    const settings = await db.select().from(paymentSettings)
    
    console.log('Retrieved payment settings from DB:', settings.map(s => ({ 
      name: s.name, 
      method: s.paymentMethod, 
      enabled: s.isActive,
      hasClientId: !!s.clientId,
      hasClientSecret: !!s.clientSecret
    })))
    
    if (settings.length === 0) {
      console.error('No payment settings found in database')
      return NextResponse.json(
        { error: 'Payment settings not configured' },
        { status: 500 }
      )
    }
    
    // Find PayPal settings
    const paypalSettings = settings.find(s => s.name === 'PayPal')
    const generalSettings = settings.find(s => s.name === 'General' || s.paymentMethod === 'general')
    
    console.log('PayPal settings found:', !!paypalSettings)
    console.log('General settings found:', !!generalSettings)
    
    // Check if PayPal is enabled
    const isPaypalEnabled = generalSettings?.paypalEnabled || paypalSettings?.isActive || false
    console.log('PayPal enabled status:', isPaypalEnabled)
    
    if (!isPaypalEnabled) {
      console.error('PayPal is not enabled in settings')
      return NextResponse.json(
        { error: 'PayPal is not enabled' },
        { status: 400 }
      )
    }
    
    // Get PayPal credentials from the new schema structure
    const paypalClientId = paypalSettings?.clientId || paypalSettings?.paypalClientId
    const paypalClientSecret = paypalSettings?.clientSecret || paypalSettings?.paypalClientSecret
    const paypalMode = paypalSettings?.environment || paypalSettings?.paypalMode || 'sandbox'
    
    console.log('PayPal credentials status:', {
      clientId: paypalClientId ? `[${paypalClientId.length} chars]` : 'NOT SET',
      clientSecret: paypalClientSecret ? `[${paypalClientSecret.length} chars]` : 'NOT SET',
      mode: paypalMode
    })
    
    // Check if PayPal credentials are configured
    if (!paypalClientId || !paypalClientSecret) {
      console.error('PayPal credentials not configured:', {
        clientId: !!paypalClientId,
        clientSecret: !!paypalClientSecret
      })
      return NextResponse.json(
        { error: 'PayPal credentials not configured. Please configure PayPal in admin settings.' },
        { status: 500 }
      )
    }
    
    // Add payment configuration to the request
    const requestWithConfig = {
      ...body,
      payment_config: {
        client_id: paypalClientId,
        client_secret: paypalClientSecret,
        mode: paypalMode
      }
    }
    
    console.log('Sending request to backend with payment config')
    console.log('Backend URL:', backendUrl)
    
    const response = await fetch(`${backendUrl}/checkout/paypal/process-paypal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestWithConfig),
    })
    
    const result = await response.json()
    
    console.log('Backend response status:', response.status)
    console.log('Backend response success:', result.success)
    
    if (!response.ok) {
      console.error('Backend request failed:', result)
      return NextResponse.json(result, { status: response.status })
    }
    
    console.log('=== PAYPAL CHECKOUT PROCESSING END ===')
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('PayPal checkout processing error:', error)
    return NextResponse.json(
      { 
        error: 'PayPal checkout processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
} 