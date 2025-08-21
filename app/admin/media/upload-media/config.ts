import type { UploadFolder } from './types'

export const UPLOAD_FOLDERS: UploadFolder[] = [
  {
    id: 'products',
    name: 'Products',
    path: 'products',
    description: 'Product images and galleries',
    icon: '🛍️'
  },
  {
    id: 'site',
    name: 'Site Assets',
    path: 'site',
    description: 'Logos, icons, and site resources',
    icon: '🌐'
  },
  {
    id: 'users',
    name: 'User Profiles',
    path: 'users',
    description: 'User avatars and profile images',
    icon: '👤'
  },
  {
    id: 'brands',
    name: 'Brand Assets',
    path: 'brands',
    description: 'Brand logos and materials',
    icon: '🏢'
  },
  {
    id: 'main-banners',
    name: 'Main Banners',
    path: 'main-banners',
    description: 'Hero and main banners',
    icon: '🖼️'
  },
  {
    id: 'mini-banners',
    name: 'Mini Banners',
    path: 'mini-banners',
    description: 'Small promotional banners',
    icon: '🎯'
  },
  {
    id: 'pages',
    name: 'Page Content',
    path: 'pages',
    description: 'Content images for pages',
    icon: '📄'
  }
]

export const ALLOWED_FILE_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml',
  'image/bmp', 'image/tiff', 'image/tif', 'image/ico', 'image/heic', 'image/heif', 'image/jxl',
  'image/jp2', 'image/jpx', 'image/jpm', 'image/mj2'
]
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_FILES = 50000 // Allow up to 50,000 files