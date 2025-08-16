import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentSettings } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SQUARE PAYMENT PROCESSING START ===')
    
    const body = await request.json()
    console.log('Payment request received:', {
      order_id: body.order_id,
      customer_email: body.customer?.email,
      total_amount: body.total_amount,
      currency: body.currency
    })
    
    // Get payment settings from database
    const settings = await db.select().from(paymentSettings)
    console.log('Payment settings found:', settings.length)
    
    // Find Square settings
    const squareSettings = settings.find(s => s.name === 'Square')
    console.log('Square settings found:', !!squareSettings)
    
    if (!squareSettings || !squareSettings.isActive) {
      console.error('Square payment gateway is not configured or not active')
      return NextResponse.json(
        { 
          success: false,
          error: 'Square payment gateway is not configured or not active'
        },
        { status: 400 }
      )
    }
    
    // Parse Square credentials from database
    let squareCredentials = {}
    if (squareSettings.cardCredentials) {
      try {
        squareCredentials = typeof squareSettings.cardCredentials === 'string' 
          ? JSON.parse(squareSettings.cardCredentials) 
          : squareSettings.cardCredentials
        console.log('Square credentials parsed successfully')
      } catch (error) {
        console.error('Error parsing Square credentials:', error)
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid Square credentials configuration'
          },
          { status: 400 }
        )
      }
    }
    
    // Extract Square credentials
    const applicationId = squareCredentials['Application ID'] || ''
    const accessToken = squareCredentials['Access Token'] || ''
    const locationId = squareCredentials['Location ID'] || ''
    const environment = squareSettings.environment || 'sandbox'
    
    console.log('Square credentials extracted:', {
      applicationId: applicationId ? `${applicationId.substring(0, 10)}...` : 'empty',
      accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : 'empty',
      locationId: locationId ? locationId : 'empty',
      environment: environment
    })
    
    // Validate Square credentials
    if (!applicationId || !accessToken || !locationId) {
      console.error('Missing Square credentials')
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing Square credentials: Application ID, Access Token, and Location ID are required'
        },
        { status: 400 }
      )
    }
    
    // Create payment config for backend
    const paymentConfig = {
      square: {
        application_id: applicationId,
        access_token: accessToken,
        location_id: locationId,
        environment: environment
      }
    }
    
    console.log('Payment config created for Square')
    
    // Add payment config to request body
    const requestBody = {
      ...body,
      payment_config: paymentConfig
    }
    
    console.log('Request body prepared with payment config')
    
    // Proxy to backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
    const response = await fetch(`${backendUrl}/checkout/credit-card/square/process-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    
    const result = await response.json()
    
    console.log('Backend response status:', response.status)
    console.log('Backend response success:', result.success)
    
    if (response.ok) {
      console.log('Square payment processed successfully')
      console.log('=== SQUARE PAYMENT PROCESSING END ===')
      return NextResponse.json(result)
    } else {
      console.error('Square payment processing failed:', result.error || result.detail)
      console.log('=== SQUARE PAYMENT PROCESSING END ===')
      return NextResponse.json(
        { 
          success: false,
          error: result.detail || result.message || result.error || 'Failed to process Square payment'
        },
        { status: response.status }
      )
    }
    
  } catch (error) {
    console.error('Error processing Square payment:', error)
    console.log('=== SQUARE PAYMENT PROCESSING END ===')
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process Square payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 