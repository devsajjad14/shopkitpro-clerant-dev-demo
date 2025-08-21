import { NextResponse } from 'next/server'
import { uploadAsset, deleteAsset } from '@/lib/services/platform-upload-service'

// Expert file type detection functions
function getExpectedMimeType(extension?: string): string {
  const mimeTypes: Record<string, string> = {
    'webp': 'image/webp',
    'avif': 'image/avif',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml'
  }
  return mimeTypes[extension || ''] || 'unknown'
}

function detectFileTypeFromSignature(uint8Array: Uint8Array): string {
  const signature = Array.from(uint8Array.slice(0, 12))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
  
  // File signature detection
  if (signature.startsWith('52494646') && signature.includes('57454250')) return 'WebP'
  if (signature.startsWith('00000020667479706176696631') || signature.startsWith('0000001c667479706176696631')) return 'AVIF'  
  if (signature.startsWith('89504e47')) return 'PNG'
  if (signature.startsWith('ffd8ff')) return 'JPEG'
  if (signature.startsWith('474946383761') || signature.startsWith('474946383961')) return 'GIF'
  if (signature.includes('3c737667') || signature.includes('3c3f786d6c')) return 'SVG'
  
  return `Unknown (${signature.slice(0, 16)}...)`
}

export async function POST(request: Request) {
  try {
    console.log('🔥 BANNER API - Request received!')
    
    // Expert-level HTTP debugging
    console.log('📡 REQUEST HEADERS:', Object.fromEntries(request.headers.entries()))
    console.log('📡 REQUEST METHOD:', request.method)
    console.log('📡 REQUEST URL:', request.url)
    console.log('📡 CONTENT-TYPE:', request.headers.get('content-type'))
    console.log('📡 CONTENT-LENGTH:', request.headers.get('content-length'))
    
    let formData: FormData
    try {
      formData = await request.formData()
      console.log('✅ FormData parsed successfully')
    } catch (formDataError) {
      console.error('❌ FormData parsing failed:', formDataError)
      return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 })
    }
    const file = formData.get('file') as File
    const bannerName = formData.get('bannerName') as string
    const folderType = formData.get('folderType') as string

    // Debug logging - show ALL form data entries
    console.log('🔍 BANNER API - Received FormData keys:', Array.from(formData.keys()))
    console.log('🔍 BANNER API - All FormData entries:')
    for (const [key, value] of formData.entries()) {
      if (key === 'file') {
        console.log(`  ${key}: File(${(value as File).name})`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    }
    // Expert file analysis
    if (file) {
      console.log('📁 FILE ANALYSIS:')
      console.log('  Name:', file.name)
      console.log('  Size:', file.size, 'bytes')
      console.log('  Type (MIME):', file.type)
      console.log('  Last Modified:', file.lastModified ? new Date(file.lastModified).toISOString() : 'Unknown')
      
      // Deep file validation
      const fileExtension = file.name.split('.').pop()?.toLowerCase()
      console.log('  Extension:', fileExtension)
      console.log('  MIME vs Extension match:', {
        mime: file.type,
        extension: fileExtension,
        expectedMime: getExpectedMimeType(fileExtension)
      })
      
      // File buffer analysis
      try {
        const arrayBuffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const fileSignature = Array.from(uint8Array.slice(0, 12))
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join(' ')
        console.log('  File Signature (hex):', fileSignature)
        console.log('  Actual file type:', detectFileTypeFromSignature(uint8Array))
      } catch (bufferError) {
        console.error('❌ Failed to read file buffer:', bufferError)
      }
    } else {
      console.log('📁 BANNER API - No file received')
    }
    
    console.log('🏷️ BANNER API - bannerName received:', bannerName)
    
    // Check for other parameters that might be sent instead
    const folder = formData.get('folder')
    const category = formData.get('category')
    console.log('📂 BANNER API - folder parameter:', folder)
    console.log('🏷️ BANNER API - category parameter:', category)

    if (!file) {
      console.error('Banner API - No file in FormData')
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!bannerName) {
      console.error('❌ Banner API - No bannerName in FormData')
      console.error('❌ Available FormData keys:', Array.from(formData.keys()))
      console.error('❌ All FormData values:')
      for (const [key, value] of formData.entries()) {
        console.error(`  ${key}:`, typeof value === 'object' ? `File(${(value as File).name})` : value)
      }
      return NextResponse.json({ error: 'Banner name is required' }, { status: 400 })
    }

    console.log(`Processing banner image upload - Banner Name: ${bannerName}`)
    console.log('🏷️ BANNER API - folderType received:', folderType)

    // Determine banner type based on folder type (more reliable than filename)
    // If folderType is missing, try to determine from bannerName as fallback
    let bannerType: 'banner' | 'mini-banner'
    
    if (folderType) {
      bannerType = folderType === 'main-banners' ? 'banner' : 'mini-banner'
      console.log(`✅ Using folderType to determine banner type: ${bannerType}`)
    } else {
      // Fallback: check if bannerName indicates main banner
      bannerType = bannerName.toLowerCase().includes('main') ? 'banner' : 'mini-banner'
      console.log(`⚠️ folderType missing, using bannerName fallback: ${bannerType}`)
    }
    
    console.log(`Banner type determined: ${bannerType}`)
    console.log(`About to call uploadAsset with file: ${file.name}, type: ${bannerType}`)
    
    // Use platform-aware upload service
    const uploadResult = await uploadAsset(file, bannerType)
    
    console.log(`Upload result:`, uploadResult)

    if (!uploadResult.success || !uploadResult.url) {
      console.error('Banner upload failed:', uploadResult.error)
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload banner' },
        { status: 500 }
      )
    }

    console.log(`Banner uploaded successfully: ${uploadResult.url}`)

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.url,
      url: uploadResult.url,
      path: uploadResult.path || uploadResult.url
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

    console.log('DELETE request received for banner image URL:', imageUrl)

    // Use platform-aware delete service
    const deleteSuccess = await deleteAsset(imageUrl)

    if (deleteSuccess) {
      console.log('Banner image deleted successfully:', imageUrl)
      return NextResponse.json({ success: true })
    } else {
      console.error('Failed to delete banner image:', imageUrl)
      return NextResponse.json(
        { error: 'Failed to delete banner image' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error deleting banner image:', error)
    return NextResponse.json(
      { error: 'Failed to delete banner image' },
      { status: 500 }
    )
  }
} 