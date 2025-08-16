import { NextRequest, NextResponse } from 'next/server'
import { createMiniBanner, getMiniBanners } from '@/lib/actions/mini-banners'

export async function GET() {
  try {
    const banners = await getMiniBanners()
    return NextResponse.json({ success: true, data: banners })
  } catch (error) {
    console.error('Error fetching mini banners:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch mini banners' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, content, imageUrl, status, priority, startDate, endDate } = body

    if (!name || !content) {
      return NextResponse.json(
        { success: false, error: 'Name and content are required' },
        { status: 400 }
      )
    }

    const result = await createMiniBanner({
      name,
      content,
      imageUrl: imageUrl || '',
      status: status || 'draft',
      priority: priority || 1,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    })

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating mini banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create mini banner' },
      { status: 500 }
    )
  }
} 