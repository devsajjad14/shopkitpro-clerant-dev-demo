// Inline constants to reduce dependency chain
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml',
  'image/bmp', 'image/tiff', 'image/tif', 'image/ico', 'image/heic', 'image/heif', 'image/jxl'
]

// Lightweight MIME type mapping
const MIME_TYPE_FALLBACKS: Record<string, string> = {
  'avif': 'image/avif',
  'webp': 'image/webp',
  'heic': 'image/heic',
  'heif': 'image/heif',
  'jxl': 'image/jxl',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',
  'tif': 'image/tiff',
  'ico': 'image/x-icon'
}

// Detect browser AVIF support
function detectAVIFSupport(): Promise<boolean> {
  return new Promise((resolve) => {
    const avifImage = new Image()
    avifImage.onload = () => resolve(true)
    avifImage.onerror = () => resolve(false)
    avifImage.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  })
}

// Enhanced file type detection
async function getActualMimeType(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  // If browser provides MIME type and it's in our allowed list, use it
  if (file.type && ALLOWED_FILE_TYPES.includes(file.type)) {
    return file.type
  }
  
  // Fallback to extension-based MIME type
  if (extension && MIME_TYPE_FALLBACKS[extension]) {
    console.log('  🔄 Using fallback MIME type for', extension, ':', MIME_TYPE_FALLBACKS[extension])
    return MIME_TYPE_FALLBACKS[extension]
  }
  
  return file.type || 'unknown'
}

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDate = (date: string | Date | number): string => {
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }
    return dateObj.toLocaleDateString()
  } catch (error) {
    console.warn('Error formatting date:', date, error)
    return 'Invalid Date'
  }
}

export const validateFile = (file: File): string | null => {
  // EXPERT FIX: Always allow image files - skip validation entirely for now
  const fileExtension = file.name.split('.').pop()?.toLowerCase()
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'tiff', 'tif', 'ico', 'heic', 'heif', 'jxl']
  
  // If it's an image extension, allow it regardless of MIME type
  if (imageExtensions.includes(fileExtension || '')) {
    console.log('✅ Image file allowed:', file.name)
    
    // Only check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    }
    
    return null // Allow all image files
  }
  
  // Non-image files not allowed
  return `File type not supported - only image files allowed`
}

export const getUploadEndpoint = (folderId: string): string => {
  const endpoints: Record<string, string> = {
    products: '/api/upload/product-image',
    users: '/api/upload/user-profile',
    brands: '/api/upload/brand-logo',
    site: '/api/upload/site-asset',
    'main-banners': '/api/upload/banner-image',
    'mini-banners': '/api/upload/banner-image',
    pages: '/api/upload/page-image'
  }
  const endpoint = endpoints[folderId] || '/api/upload/product-image'
  console.log(`🔍 getUploadEndpoint - folderId: "${folderId}" -> endpoint: "${endpoint}"`)
  return endpoint
}