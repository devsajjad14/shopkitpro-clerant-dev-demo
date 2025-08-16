import { NextRequest, NextResponse } from 'next/server'
import {
  getBannerById,
  updateBanner,
  deleteBanner,
} from '@/lib/actions/banners'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Only this line changed
) {
  const { id: idStr } = await params // Use a different variable name
  try {
    const id = parseInt(idStr) // Pass string to parseInt
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID' },
        { status: 400 }
      )
    }

    const banner = await getBannerById(id)
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: banner })
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banner' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      name, content, imageUrl, status, priority, startDate, endDate, 
      showTitle, showSubtitle, showButton,
      titlePosition, subtitlePosition, ctaPosition,
      titleCustomFontSize, subtitleCustomFontSize, ctaCustomFontSize,
      titleMarginTop, titleMarginRight, titleMarginBottom, titleMarginLeft,
      titlePaddingTop, titlePaddingRight, titlePaddingBottom, titlePaddingLeft,
      subtitleMarginTop, subtitleMarginRight, subtitleMarginBottom, subtitleMarginLeft,
      subtitlePaddingTop, subtitlePaddingRight, subtitlePaddingBottom, subtitlePaddingLeft,
      buttonMarginTop, buttonMarginRight, buttonMarginBottom, buttonMarginLeft,
      buttonPaddingTop, buttonPaddingRight, buttonPaddingBottom, buttonPaddingLeft
    } = body

    if (!name || !content) {
      return NextResponse.json(
        { success: false, error: 'Name and content are required' },
        { status: 400 }
      )
    }

    const result = await updateBanner(id, {
      name,
      content,
      imageUrl,
      status: status || 'draft',
      priority: priority || 1,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      showTitle: showTitle !== undefined ? showTitle : true,
      showSubtitle: showSubtitle !== undefined ? showSubtitle : true,
      showButton: showButton !== undefined ? showButton : true,
      titlePosition,
      subtitlePosition,
      ctaPosition,
      titleCustomFontSize,
      subtitleCustomFontSize,
      ctaCustomFontSize,
      titleMarginTop,
      titleMarginRight,
      titleMarginBottom,
      titleMarginLeft,
      titlePaddingTop,
      titlePaddingRight,
      titlePaddingBottom,
      titlePaddingLeft,
      subtitleMarginTop,
      subtitleMarginRight,
      subtitleMarginBottom,
      subtitleMarginLeft,
      subtitlePaddingTop,
      subtitlePaddingRight,
      subtitlePaddingBottom,
      subtitlePaddingLeft,
      buttonMarginTop,
      buttonMarginRight,
      buttonMarginBottom,
      buttonMarginLeft,
      buttonPaddingTop,
      buttonPaddingRight,
      buttonPaddingBottom,
      buttonPaddingLeft,
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
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid banner ID' },
        { status: 400 }
      )
    }

    const result = await deleteBanner(id)
    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    )
  }
}
