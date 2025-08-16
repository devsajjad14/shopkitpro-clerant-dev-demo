import { NextRequest, NextResponse } from 'next/server'
import { createBanner, getBanners } from '@/lib/actions/banners'

export async function GET() {
  try {
    const banners = await getBanners()
    return NextResponse.json({ success: true, data: banners })
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const result = await createBanner({
      name,
      content,
      imageUrl: imageUrl || '',
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
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    )
  }
} 