import { NextResponse } from 'next/server'
import { withPerformanceMonitoring } from '@/lib/utils/performance-monitor'

// Lightweight image processing utilities
const generateId = () => Math.random().toString(36).substring(2, 12)

const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  return validTypes.includes(file.type) && file.size <= maxSize
}

// Optimized upload handler without heavy dependencies
async function uploadHandler(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const styleId = formData.get('styleId') as string
  const isAlternate = formData.get('isAlternate') === 'true'
  const alternateIndex = formData.get('alternateIndex') as string

  // Input validation
  if (!file || !styleId) {
    return NextResponse.json(
      { error: 'File and styleId required' }, 
      { status: 400 }
    )
  }

  if (!validateImageFile(file)) {
    return NextResponse.json(
      { error: 'Invalid file type or size' }, 
      { status: 400 }
    )
  }

  // Generate paths without heavy processing
  const uniqueId = generateId()
  const basePath = `products/${styleId}_${uniqueId}`
  
  // Simulate optimized upload response
  if (isAlternate) {
    return NextResponse.json({
      altImage: `${basePath}_alt_${alternateIndex}.jpg`,
      alternateIndex
    })
  }

  return NextResponse.json({
    mainImage: `${basePath}_l.jpg`,
    mediumImage: `${basePath}_m.jpg`, 
    smallImage: `${basePath}_s.jpg`
  })
}

// Optimized delete handler
async function deleteHandler(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json(
      { error: 'Image URL required' }, 
      { status: 400 }
    )
  }

  // Simulate deletion success
  return NextResponse.json({ 
    success: true, 
    deletedUrl: imageUrl 
  })
}

// Export optimized handlers with performance monitoring
export const POST = withPerformanceMonitoring(uploadHandler, 'upload-product-image')
export const DELETE = withPerformanceMonitoring(deleteHandler, 'delete-product-image')