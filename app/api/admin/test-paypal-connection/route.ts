import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Testing PayPal connection with:', {
      clientId: body.clientId ? '[REDACTED]' : 'empty',
      clientSecret: body.clientSecret ? '[REDACTED]' : 'empty',
      mode: body.mode
    })
    
    // Proxy to backend PayPal test API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/checkout/paypal/test-connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: body.clientId,
        client_secret: body.clientSecret,
        mode: body.mode
      }),
    })
    
    const result = await response.json()
    
    if (response.ok) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.detail || 'Failed to test PayPal connection'
        },
        { status: response.status }
      )
    }
    
  } catch (error) {
    console.error('Error testing PayPal connection:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test PayPal connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 