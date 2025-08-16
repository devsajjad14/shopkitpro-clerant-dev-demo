import { NextResponse } from 'next/server'
import { uploadAsset } from '@/lib/services/platform-upload-service'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const brandId = formData.get('brandId') as string
    const brandName = formData.get('brandName') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log(
      `Processing brand logo upload - BrandId: ${brandId}, BrandName: ${brandName}, File: ${file.name}, Size: ${file.size}`
    )

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size should be less than 5MB' },
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

    // Use platform-aware upload service directly with the original file
    // The platform service will handle filename generation internally
    const uploadResult = await uploadAsset(file, 'brand')

    if (!uploadResult.success || !uploadResult.url) {
      console.error('Brand logo upload failed:', uploadResult.error)
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload brand logo' },
        { status: 500 }
      )
    }

    console.log(`Brand logo uploaded successfully: ${uploadResult.url}`)

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      path: uploadResult.path || uploadResult.url
    })

  } catch (error) {
    console.error('Error uploading brand logo:', error)
    return NextResponse.json(
      { error: 'Failed to upload brand logo' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    console.log('DELETE request received for brand logo URL:', imageUrl)

    if (!imageUrl) {
      console.error('No image URL provided for deletion')
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    // This DELETE endpoint is kept for backward compatibility
    // but it's no longer used since cleanup is now handled by the brand actions
    console.log('Legacy DELETE endpoint called - cleanup should be handled by brand actions')

    return NextResponse.json({ 
      success: true, 
      deletedUrl: imageUrl,
      note: 'Legacy endpoint - cleanup handled by brand actions'
    })
  } catch (error) {
    console.error('Error in brand logo DELETE endpoint:', error)
    return NextResponse.json(
      {
        error: 'Failed to process brand logo deletion',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
} 