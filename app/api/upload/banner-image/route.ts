import { NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'
import { randomTenDigitString } from '@/lib/utils/image-utils'

// Helper function to ensure main-banners directory exists
async function ensureMainBannersDirectory() {
  try {
    // List blobs to check if main-banners directory exists
    const { blobs } = await list({ prefix: 'main-banners/' })
    console.log('Main Banners directory check - found blobs:', blobs.length)
    return true
  } catch (error) {
    console.log(
      'Main Banners directory does not exist, will be created on first upload'
    )
    return false
  }
}

// Helper to delete old images for a banner name
async function deleteOldImages(bannerName: string) {
  try {
    const { blobs } = await list({ prefix: 'main-banners/' })
    
    // Delete all images for this banner name
    const bannerPattern = new RegExp(`^main-banners/${bannerName}_[0-9]{10}\.jpg$`)
    for (const blob of blobs) {
      if (bannerPattern.test(blob.pathname)) {
        try {
          await del(blob.pathname)
          console.log('Deleted old banner image:', blob.pathname)
        } catch (err) {
          console.error('Failed to delete banner image:', blob.pathname, err)
        }
      }
    }
  } catch (error) {
    console.error('Error listing or deleting old banner images:', error)
    // Do not throw, just log
  }
}

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

    console.log(`Processing banner image upload - Banner Name: ${bannerName}`)

    // Ensure main-banners directory exists
    await ensureMainBannersDirectory()

    // Delete old images for this banner name
    await deleteOldImages(bannerName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename: main-banners/banner_name_10digits.jpg
    const uniqueId = randomTenDigitString()
    const sanitizedBannerName = bannerName.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase()
    const imagePath = `main-banners/${sanitizedBannerName}_${uniqueId}.jpg`

    // Use original buffer to avoid Sharp dependency in serverless functions
    const processedBuffer = buffer

    // Upload to Vercel Blob
    const blob = await put(imagePath, processedBuffer, {
      access: 'public',
      addRandomSuffix: false,
    })

    console.log('Banner image uploaded successfully:', blob.url)

    return NextResponse.json({
      success: true,
      imageUrl: blob.url,
      filename: imagePath
    })

  } catch (error) {
    console.error('Error uploading banner image:', error)
    return NextResponse.json(
      { error: 'Failed to upload banner image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Extract the pathname from the URL
    const url = new URL(imageUrl)
    const pathname = url.pathname.substring(1) // Remove leading slash

    // Delete from Vercel Blob
    await del(pathname)

    console.log('Banner image deleted successfully:', pathname)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting banner image:', error)
    return NextResponse.json(
      { error: 'Failed to delete banner image' },
      { status: 500 }
    )
  }
} 