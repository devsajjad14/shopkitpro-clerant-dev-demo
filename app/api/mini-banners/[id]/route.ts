import { NextRequest, NextResponse } from 'next/server'
import { createMiniBanner, getMiniBannerById, updateMiniBanner, deleteMiniBanner } from '@/lib/actions/mini-banners'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise first
    const resolvedParams = await params
    const { id } = resolvedParams

    // Validate the ID
    const parsedId = parseInt(id)
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    const miniBanner = await getMiniBannerById(parsedId)
    console.log('miniBanner', miniBanner)

    if (!miniBanner) {
      return NextResponse.json(
        { success: false, error: 'Mini banner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: miniBanner })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const parsedId = parseInt(id)

    if (isNaN(parsedId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const result = await updateMiniBanner(parsedId, body)

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating mini banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update mini banner' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams
    const parsedId = parseInt(id)
    
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    const result = await deleteMiniBanner(parsedId)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting mini banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete mini banner' },
      { status: 500 }
    )
  }
}
