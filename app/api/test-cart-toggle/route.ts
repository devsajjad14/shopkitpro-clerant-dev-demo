import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cartAbandonmentToggle } from '@/lib/db/schema'

export async function GET() {
  try {
    // Get all records from the table
    const allToggles = await db.select().from(cartAbandonmentToggle)
    
    // Get the first record
    const firstToggle = await db.query.cartAbandonmentToggle.findFirst()
    
    return NextResponse.json({
      success: true,
      allRecords: allToggles,
      firstRecord: firstToggle,
      recordCount: allToggles.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Create a new toggle record with enabled state
    const newToggle = await db.insert(cartAbandonmentToggle).values({
      isEnabled: true,
      description: 'Cart abandonment tracking and recovery feature',
      lastToggledAt: new Date(),
    }).returning()
    
    return NextResponse.json({
      success: true,
      created: newToggle[0],
      message: 'Created new toggle with enabled state',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Create test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 