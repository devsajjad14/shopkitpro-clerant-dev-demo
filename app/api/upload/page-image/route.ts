import { NextResponse } from 'next/server'
import { uploadAsset } from '@/lib/services/platform-upload-service'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const pageName = formData.get('pageName') as string
    const imageType = formData.get('imageType') as string // 'featured' or 'content'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log(
      `Processing page image upload - PageName: ${pageName}, ImageType: ${imageType}, File: ${file.name}, Size: ${file.size}`
    )

    // Validate file size (10MB limit for page images)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size should be less than 10MB' },
        { status: 400 }
      )
    }

    // Validate file type - allow all image types
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Please upload a valid image file' },
        { status: 400 }
      )
    }

    // Use platform-aware upload service
    const uploadResult = await uploadAsset(file, 'page')

    if (!uploadResult.success || !uploadResult.url) {
      console.error('Page image upload failed:', uploadResult.error)
      return NextResponse.json(
        { 
          error: uploadResult.error || 'Failed to upload page image',
          details: uploadResult.error
        },
        { status: 500 }
      )
    }

    console.log(`Page image uploaded successfully: ${uploadResult.url}`)

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      path: uploadResult.path || uploadResult.url
    })

  } catch (error) {
    console.error('Error uploading page image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to upload page image',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    console.log('DELETE request received for page image URL:', imageUrl)

    if (!imageUrl) {
      console.error('No image URL provided for deletion')
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    // This DELETE endpoint is kept for backward compatibility
    // but it's no longer used since cleanup is now handled by the page actions
    console.log('Legacy DELETE endpoint called - cleanup should be handled by page actions')

    return NextResponse.json({ 
      success: true, 
      deletedUrl: imageUrl,
      note: 'Legacy endpoint - cleanup handled by page actions'
    })
  } catch (error) {
    console.error('Error in page image DELETE endpoint:', error)
    return NextResponse.json(
      {
        error: 'Failed to process page image deletion',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
} 