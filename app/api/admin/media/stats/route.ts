import { NextResponse } from 'next/server'

// Stats endpoint removed for performance
export async function GET() {
  return NextResponse.json(
    { error: 'Statistics endpoint disabled for performance' },
    { status: 410 }
  )
}