import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('=== CARD GATEWAY TEST CONNECTION START ===')
    console.log('Testing card connection with:', {
      gateway: body.gateway,
      credentials: body.credentials ? '[REDACTED]' : 'empty'
    })
    
    // Parse credentials if it's a string
    let credentials = body.credentials
    if (typeof body.credentials === 'string') {
      try {
        credentials = JSON.parse(body.credentials)
        console.log('Successfully parsed credentials from string')
      } catch (error) {
        console.error('Error parsing credentials:', error)
        credentials = {}
      }
    }
    
    console.log('Parsed credentials keys:', Object.keys(credentials || {}))
    
    // Determine which backend endpoint to call based on gateway
    let backendEndpoint = ''
    let requestBody = {}
    
    switch (body.gateway) {
      case 'stripe':
        backendEndpoint = '/checkout/credit-card/stripe/test-connection'
        requestBody = {
          api_key: credentials?.['Secret Key'] || credentials?.secretKey || '',
          publishable_key: credentials?.['Publishable Key'] || credentials?.publishableKey || '',
          environment: credentials?.environment || 'sandbox'
        }
        break
        

        
      case 'square':
        backendEndpoint = '/checkout/credit-card/square/test-connection'
        requestBody = {
          application_id: credentials?.['Application ID'] || credentials?.applicationId || '',
          access_token: credentials?.['Access Token'] || credentials?.accessToken || '',
          location_id: credentials?.['Location ID'] || credentials?.locationId || '',
          mode: credentials?.environment || 'sandbox'
        }
        break
        
      case 'authorize':
        backendEndpoint = '/checkout/credit-card/authorize/test-connection'
        requestBody = {
          api_login_id: credentials?.['API Login ID'] || credentials?.apiLoginId || '',
          transaction_key: credentials?.['Transaction Key'] || credentials?.transactionKey || '',
          mode: credentials?.environment || 'sandbox'
        }
        break
        
      case 'paypal-commerce':
        backendEndpoint = '/checkout/paypal/test-connection'
        requestBody = {
          client_id: credentials?.['Client ID'] || credentials?.clientId || '',
          client_secret: credentials?.['Client Secret'] || credentials?.clientSecret || '',
          mode: credentials?.environment || 'sandbox'
        }
        break
        
      default:
        console.error('Unsupported gateway:', body.gateway)
        return NextResponse.json(
          { 
            success: false,
            error: `Unsupported gateway: ${body.gateway}`
          },
          { status: 400 }
        )
    }
    
    console.log('Using backend endpoint:', backendEndpoint)
    console.log('Request body keys:', Object.keys(requestBody))
    
    // Proxy to backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}${backendEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    
    const result = await response.json()
    
    console.log('Backend response status:', response.status)
    console.log('Backend response success:', result.success)
    console.log('=== CARD GATEWAY TEST CONNECTION END ===')
    
    if (response.ok) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.detail || result.message || 'Failed to test card connection'
        },
        { status: response.status }
      )
    }
    
  } catch (error) {
    console.error('Error testing card connection:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test card connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 