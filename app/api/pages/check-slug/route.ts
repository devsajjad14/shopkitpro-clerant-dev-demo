import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      )
    }

    // Check if slug exists in database
    const existingPage = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1)

    const available = existingPage.length === 0

    return NextResponse.json({
      success: true,
      available,
      slug,
    })
  } catch (error) {
    console.error('Error checking slug availability:', error)
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    )
  }
} 