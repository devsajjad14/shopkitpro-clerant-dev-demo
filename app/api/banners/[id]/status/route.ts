import { NextRequest, NextResponse } from 'next/server'
import { updateBannerStatus } from '@/lib/actions/banners'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['draft', 'active', 'scheduled', 'inactive'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required' },
        { status: 400 }
      )
    }

    const result = await updateBannerStatus(id, status)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating banner status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update banner status' },
      { status: 500 }
    )
  }
} 