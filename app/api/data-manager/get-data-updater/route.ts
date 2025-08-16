import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dataUpdater } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Always fetch the record with id = 1
    const result = await db
      .select()
      .from(dataUpdater)
      .where(eq(dataUpdater.id, 1))
      .limit(1)
    
    if (result.length > 0) {
      return NextResponse.json({
        success: true,
        data: result[0]
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'No data updater record found'
      })
    }
    
  } catch (error) {
    console.error('Error fetching data updater settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data updater settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
