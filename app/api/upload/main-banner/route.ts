import { NextResponse } from 'next/server'
import { uploadAsset, deleteAsset } from '@/lib/services/platform-upload-service'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bannerName = formData.get('bannerName') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!bannerName) {
      return NextResponse.json({ error: 'Banner name is required' }, { status: 400 })
    }

    console.log(
      `[MAIN-BANNER-UPLOAD] Processing banner upload - BannerName: ${bannerName}, File: ${file.name}, Size: ${file.size}`
    )

    // Validate file size (10MB limit for banners)
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

    // Create a custom file name for banner uploads
    const sanitizedBannerName = bannerName ? bannerName.replace(/[^a-zA-Z0-9]/g, '_') : 'banner'
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const customFileName = `${sanitizedBannerName}_${Date.now()}.${fileExtension}`
    
    // Create a new File object with the custom name
    const customFile = new File([await file.arrayBuffer()], customFileName, { 
      type: file.type 
    })

    console.log(`[MAIN-BANNER-UPLOAD] Using platform-aware upload service`)
    
    // Use the platform-aware upload service with 'banner' type
    const uploadResult = await uploadAsset(customFile, 'banner')

    if (uploadResult.success && uploadResult.url) {
      console.log(`[MAIN-BANNER-UPLOAD] ✅ Banner uploaded successfully:`, uploadResult.url)
      
      return NextResponse.json({
        success: true,
        imageUrl: uploadResult.url,  // Match expected property name
        url: uploadResult.url,
        path: uploadResult.path
      })
    } else {
      console.error('[MAIN-BANNER-UPLOAD] Upload failed:', uploadResult.error)
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload banner' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[MAIN-BANNER-UPLOAD] Error uploading main banner:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to upload main banner',
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

    console.log('[MAIN-BANNER-DELETE] DELETE request received for banner URL:', imageUrl)

    if (!imageUrl) {
      console.error('[MAIN-BANNER-DELETE] No image URL provided for deletion')
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    console.log('[MAIN-BANNER-DELETE] Using platform-aware delete service')
    const isVercelUrl = imageUrl.includes('blob.vercel-storage.com')
    console.log('[MAIN-BANNER-DELETE] Platform detected:', isVercelUrl ? 'Vercel' : 'Server')

    // Use the platform-aware delete service
    const deleteSuccess = await deleteAsset(imageUrl)

    if (deleteSuccess) {
      console.log('[MAIN-BANNER-DELETE] ✅ Banner deleted successfully from', isVercelUrl ? 'Vercel' : 'Server')
      return NextResponse.json({ success: true, deletedUrl: imageUrl })
    } else {
      console.error('[MAIN-BANNER-DELETE] Delete returned false')
      return NextResponse.json(
        { error: 'Failed to delete banner from storage' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[MAIN-BANNER-DELETE] Error deleting main banner:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete main banner',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
} 