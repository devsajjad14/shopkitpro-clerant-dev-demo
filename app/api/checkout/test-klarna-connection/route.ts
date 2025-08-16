import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
  try {
    const body = await request.json()
    // You may fetch Klarna credentials from DB here if needed

    // Send to backend Klarna test connection endpoint
    const response = await fetch(`${backendUrl}/checkout/klarna/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to test Klarna connection', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 