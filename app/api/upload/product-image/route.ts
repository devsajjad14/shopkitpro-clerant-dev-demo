import { NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'
// import sharp from 'sharp' // Removed to reduce function size
import { generateImagePaths, randomTenDigitString } from '@/lib/utils/image-utils'

// Helper function to ensure products directory exists
async function ensureProductsDirectory() {
  try {
    // List blobs to check if products directory exists
    const { blobs } = await list({ prefix: 'products/' })
    console.log('Products directory check - found blobs:', blobs.length)
    return true
  } catch (error) {
    console.log(
      'Products directory does not exist, will be created on first upload'
    )
    return false
  }
}

// Helper to delete old images for a styleId and type
async function deleteOldImages(styleId: string, isAlternate: boolean, alternateIndex?: string) {
  try {
    const { blobs } = await list({ prefix: 'products/' })
    if (isAlternate && alternateIndex) {
      // Delete all alternate images for this styleId and index
      const altPattern = new RegExp(`^products/${styleId}_alt_${alternateIndex}_[0-9]{10}\.jpg$`)
      for (const blob of blobs) {
        if (altPattern.test(blob.pathname)) {
          try {
            await del(blob.pathname)
            console.log('Deleted old alternate image:', blob.pathname)
          } catch (err) {
            console.error('Failed to delete alternate image:', blob.pathname, err)
          }
        }
      }
    } else {
      // Delete all main images for this styleId (l, m, s)
      const mainPattern = new RegExp(`^products/${styleId}_[lms]_[0-9]{10}\.jpg$`)
      for (const blob of blobs) {
        if (mainPattern.test(blob.pathname)) {
          try {
            await del(blob.pathname)
            console.log('Deleted old main image:', blob.pathname)
          } catch (err) {
            console.error('Failed to delete main image:', blob.pathname, err)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error listing or deleting old images:', error)
    // Do not throw, just log
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const styleId = formData.get('styleId') as string
    const isAlternate = formData.get('isAlternate') === 'true'
    const isVariant = formData.get('isVariant') === 'true'
    const variantId = formData.get('variantId') as string
    const color = formData.get('color') as string
    const alternateIndex = formData.get('alternateIndex') as string
    const size = formData.get('size') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log(
      `Processing image upload - StyleId: ${styleId}, IsAlternate: ${isAlternate}, AlternateIndex: ${alternateIndex}`
    )

    // Ensure products directory exists (Vercel Blob creates directories automatically on first upload)
    await ensureProductsDirectory()

    // Delete old images for this styleId and type
    await deleteOldImages(styleId, isAlternate, alternateIndex)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate proper file paths with a random 10-digit number
    const uniqueId = randomTenDigitString()
    let imagePaths = generateImagePaths(styleId, isAlternate, alternateIndex, uniqueId)
    let imageBuffers: Buffer[]
    let variantPath: string | undefined = undefined
    if (isVariant && color) {
      if (size && size.trim() !== '') {
        // Per-combination variant image: products/{styleId}-{size}-{color}.jpg
        variantPath = `products/${styleId}-${size}-${color}.jpg`
      } else {
        // Color image only: products/{styleId}_{color}.jpg
        variantPath = `products/${styleId}_${color}.jpg`
      }
    }

    if (isAlternate) {
      // Only one image for alternate images (no resizing)
      imageBuffers = [buffer]
    } else {
      // Use original buffer for all sizes to reduce function size
      imageBuffers = [buffer, buffer, buffer]
    }

    // Upload to Vercel Blob with proper directory structure
    let blobUrls: string[]

    if (isAlternate) {
      // Upload single image for alternate
      const mainPath = imagePaths.main
      if (!mainPath) {
        throw new Error('Invalid alternate image path')
      }
      console.log(`Uploading alternate image to: ${mainPath}`)
      const blob = await put(mainPath, imageBuffers[0], {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      blobUrls = [blob.url]
      console.log(`Alternate image uploaded successfully: ${blob.url}`)
    } else if (isVariant && variantPath) {
      // Upload single image for variant combination or color
      const blob = await put(variantPath, imageBuffers[0], {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      blobUrls = [blob.url]
      console.log(`Variant image uploaded successfully: ${blob.url}`)
    } else {
      // Upload three images for main
      const {
        large: largePath,
        medium: mediumPath,
        small: smallPath,
      } = imagePaths
      if (!largePath || !mediumPath || !smallPath) {
        throw new Error('Invalid main image paths')
      }
      console.log(`Uploading main images to:`, imagePaths)
      const [largeBlob, mediumBlob, smallBlob] = await Promise.all([
        put(largePath, imageBuffers[0], {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
        }),
        put(mediumPath, imageBuffers[1], {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
        }),
        put(smallPath, imageBuffers[2], {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
        }),
      ])
      blobUrls = [largeBlob.url, mediumBlob.url, smallBlob.url]
      console.log(`Main images uploaded successfully:`, blobUrls)
    }

    // Return appropriate response based on upload type
    if (isVariant) {
      return NextResponse.json({
        mainImage: blobUrls[0],
        mediumImage: blobUrls[1],
        smallImage: blobUrls[2],
        variantId,
        color,
      })
    } else if (isAlternate) {
      return NextResponse.json({
        altImage: blobUrls[0],
        AltImage: blobUrls[0],
        alternateIndex,
      })
    } else {
      return NextResponse.json({
        mainImage: blobUrls[0], // large
        mediumImage: blobUrls[1], // medium
        smallImage: blobUrls[2], // small
      })
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    console.log('DELETE request received for image URL:', imageUrl)

    if (!imageUrl) {
      console.error('No image URL provided for deletion')
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      )
    }

    console.log('Attempting to delete image from Vercel Blob:', imageUrl)

    // Delete the image from Vercel Blob
    const result = await del(imageUrl)

    console.log('Vercel Blob delete result:', result)

    return NextResponse.json({ success: true, deletedUrl: imageUrl })
  } catch (error) {
    console.error('Error deleting image from Vercel Blob:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
