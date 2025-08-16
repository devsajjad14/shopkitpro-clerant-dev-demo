'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import Image from 'next/image'
import {
  FiUploadCloud,
  FiImage,
  FiFolder,
  FiServer,
  FiCloud,
  FiMonitor,
  FiUsers,
  FiShoppingBag,
  FiLayout,
  FiStar,
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiInfo,
  FiEye,
  FiTrash2,
  FiDownload,
  FiRefreshCw,
  FiZap,
  FiShield,
  FiActivity,
  FiCpu,
  FiHardDrive,
  FiWifi,
  FiTrendingUp,
  FiAward,
  FiTarget,
  FiLayers,
  FiGlobe,
  FiDatabase,
  FiEdit2,
  FiSearch,
  FiChevronRight,
  FiChevronDown,
  FiLoader,
  FiCopy,
} from 'react-icons/fi'
import { detectDeploymentEnvironment, getPlatformDisplayInfo, type DeploymentEnvironment } from '@/lib/utils/deployment-detection'
import useSettingStore from '@/hooks/use-setting-store'

interface UploadCategory {
  id: string
  name: string
  folder: string
  icon: React.ReactNode
  gradient: string
  description: string
  subtitle: string
  maxFiles: number
  acceptedTypes: string[]
  examples: string[]
}

interface UploadedFile {
  id: string
  file: File
  preview: string
  category: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  url?: string
}

// Platform-aware upload category mapping
type AssetType = 'product' | 'brand' | 'user' | 'banner' | 'mini-banner' | 'page' | 'logo'

interface UploadProgress {
  fileId: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  uploadSpeed?: string
  error?: string
}

interface MediaAsset {
  id: string
  filename: string
  url: string
  type: string
  size: number
  category: string
  uploadedAt: Date
}

interface UploadStats {
  total: number
  completed: number
  failed: number
  inProgress: number
}

// Professional category-to-asset-type mapping
const CATEGORY_ASSET_MAPPING: Record<string, AssetType> = {
  'products': 'product',
  'main-banners': 'banner',
  'mini-banners': 'mini-banner',
  'brands': 'brand',
  'site': 'logo',
  'users': 'user',
  'pages': 'page',
} as const

// Enterprise-grade upload categories with enhanced metadata
const uploadCategories: UploadCategory[] = [
  {
    id: 'products',
    name: 'Products Images',
    folder: 'media/products',
    icon: <FiShoppingBag className="h-7 w-7" />,
    gradient: 'from-[#00437f] to-[#003366]',
    description: 'Upload Product Images',
    subtitle: 'upload bulk products images from here',
    maxFiles: 100,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    examples: ['Product photos', 'Gallery images', 'Zoom details']
  },
  {
    id: 'main-banners',
    name: 'Main Banners',
    folder: 'media/main-banners',
    icon: <FiImage className="h-7 w-7" />,
    gradient: 'from-[#00437f] to-[#003366]',
    description: 'Upload Main Banner Images',
    subtitle: 'Upload bulk Main Banner image from here',
    maxFiles: 10,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    examples: ['Section headers', 'Category banners', 'Feature highlights'],
  },
  {
    id: 'mini-banners',
    name: 'Mini Banners',
    folder: 'media/mini-banners',
    icon: <FiTarget className="h-7 w-7" />,
    gradient: 'from-[#00437f] to-[#003366]',
    description: 'Upload Mini Banner Images',
    subtitle: 'Upload bulk Mini Banner image from here',
    maxFiles: 20,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    examples: ['CTA buttons', 'Small promos', 'Badge banners']
  },
  {
    id: 'brands',
    name: 'Brands',
    folder: 'media/brands',
    icon: <FiStar className="h-7 w-7" />,
    gradient: 'from-[#00437f] to-[#003366]',
    description: 'Upload Brand Images',
    subtitle: 'Upload bulk brand logo images from here',
    maxFiles: 15,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
    examples: ['Company logos', 'Partner brands', 'Certification badges']
  },
  {
    id: 'site',
    name: 'Site Resources',
    folder: 'media/site',
    icon: <FiGlobe className="h-7 w-7" />,
    gradient: 'from-gray-600 to-gray-800',
    description: 'Upload Site Resource Images',
    subtitle: 'upload site resources like logo, icons from here',
    maxFiles: 25,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/ico'],
    examples: ['Site icons', 'Backgrounds', 'UI elements']
  },
  {
    id: 'users',
    name: 'Users Picture',
    folder: 'media/users',
    icon: <FiUsers className="h-7 w-7" />,
    gradient: 'from-[#00437f] to-[#003366]',
    description: 'Upload User Profile Images',
    subtitle: 'upload bulk User profiles images from here',
    maxFiles: 200,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    examples: ['Profile avatars', 'Team photos', 'User galleries']
  },
  {
    id: 'pages',
    name: 'Page Resources',
    folder: 'media/pages',
    icon: <FiLayout className="h-7 w-7" />,
    gradient: 'from-[#00437f] to-[#003366]',
    description: 'Upload Page Resource Images',
    subtitle: 'upload page resources like hero images, about us from here',
    maxFiles: 50,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    examples: ['Hero images', 'About us photos', 'Content images']
  }
]

// Demo images for static layout showcase
const demoImages: UploadedFile[] = [
  {
    id: '1',
    file: { name: 'hero-banner-1.jpg' } as File,
    preview: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    category: 'banners',
    status: 'success',
    progress: 100,
    url: '/media/banners/hero-banner-1.jpg'
  },
  {
    id: '2',
    file: { name: 'product-shoe-nike.jpg' } as File,
    preview: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop',
    category: 'products',
    status: 'success',
    progress: 100,
    url: '/media/products/product-shoe-nike.jpg'
  },
  {
    id: '3',
    file: { name: 'brand-apple-logo.png' } as File,
    preview: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop',
    category: 'brands',
    status: 'success',
    progress: 100,
    url: '/media/brands/brand-apple-logo.png'
  },
  {
    id: '4',
    file: { name: 'main-fashion-banner.jpg' } as File,
    preview: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&h=600&fit=crop',
    category: 'main-banners',
    status: 'success',
    progress: 100,
    url: '/media/main-banners/main-fashion-banner.jpg'
  },
  {
    id: '5',
    file: { name: 'user-profile-john.jpg' } as File,
    preview: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    category: 'users',
    status: 'success',
    progress: 100,
    url: '/media/users/user-profile-john.jpg'
  },
  {
    id: '6',
    file: { name: 'mini-sale-banner.jpg' } as File,
    preview: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&h=300&fit=crop',
    category: 'mini-banners',
    status: 'success',
    progress: 100,
    url: '/media/mini-banners/mini-sale-banner.jpg'
  },
  {
    id: '7',
    file: { name: 'about-us-team.jpg' } as File,
    preview: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&h=500&fit=crop',
    category: 'pages',
    status: 'success',
    progress: 100,
    url: '/media/pages/about-us-team.jpg'
  },
  {
    id: '8',
    file: { name: 'site-favicon.png' } as File,
    preview: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=300&fit=crop',
    category: 'site',
    status: 'success',
    progress: 100,
    url: '/media/site/site-favicon.png'
  },
  {
    id: '9',
    file: { name: 'product-watch-luxury.jpg' } as File,
    preview: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=800&fit=crop',
    category: 'products',
    status: 'success',
    progress: 100,
    url: '/media/products/product-watch-luxury.jpg'
  },
  {
    id: '10',
    file: { name: 'hero-ecommerce-banner.jpg' } as File,
    preview: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&h=600&fit=crop',
    category: 'banners',
    status: 'success',
    progress: 100,
    url: '/media/banners/hero-ecommerce-banner.jpg'
  },
  {
    id: '11',
    file: { name: 'user-profile-sarah.jpg' } as File,
    preview: 'https://images.unsplash.com/photo-1494790108755-2616b332c3c1?w=400&h=500&fit=crop',
    category: 'users',
    status: 'success',
    progress: 100,
    url: '/media/users/user-profile-sarah.jpg'
  },
  {
    id: '12',
    file: { name: 'brand-nike-logo.png' } as File,
    preview: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    category: 'brands',
    status: 'success',
    progress: 100,
    url: '/media/brands/brand-nike-logo.png'
  }
]

export default function MediaManagerPage() {
  // Settings store for reactive platform switching
  const selectedPlatform = useSettingStore((state) => state.getPlatform())
  const isSettingsLoaded = useSettingStore((state) => state.isLoaded)
  
  // Platform detection state - professional implementation
  const [deploymentEnv, setDeploymentEnv] = useState<DeploymentEnvironment | null>(null)
  const [isLoadingPlatform, setIsLoadingPlatform] = useState(true)
  
  // Upload management state - enterprise-grade
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploadQueue, setUploadQueue] = useState<Map<string, UploadProgress>>(new Map())
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStats, setUploadStats] = useState<UploadStats>({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: 0
  })
  
  // UI state management
  const [draggedOver, setDraggedOver] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  
  // Media library state
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([])
  const [isLoadingAssets, setIsLoadingAssets] = useState(false)
  
  // Upload popup state
  const [uploadModal, setUploadModal] = useState<{
    isOpen: boolean
    category: string
    files: File[]
    progress: number
    currentFile: string
    isUploading: boolean
    uploadSpeed: string
    completed: number
    total: number
  }>({
    isOpen: false,
    category: '',
    files: [],
    progress: 0,
    currentFile: '',
    isUploading: false,
    uploadSpeed: '',
    completed: 0,
    total: 0
  })
  
  // Delete confirmation popup state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    fileId: string
    fileName: string
    isDeleting: boolean
  }>({
    isOpen: false,
    fileId: '',
    fileName: '',
    isDeleting: false
  })

  // Edit/Replace image popup state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    fileId: string
    fileName: string
    fileUrl: string
    category: string
    isUploading: boolean
    progress: number
    uploadSpeed: string
  }>({
    isOpen: false,
    fileId: '',
    fileName: '',
    fileUrl: '',
    category: '',
    isUploading: false,
    progress: 0,
    uploadSpeed: ''
  })

  // Premium image preview popup state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean
    imageUrl: string
    imageName: string
    imageCategory: string
    imageSize: number
    imageDate: Date | null
  }>({
    isOpen: false,
    imageUrl: '',
    imageName: '',
    imageCategory: '',
    imageSize: 0,
    imageDate: null
  })

  // Professional platform detection with caching and error handling
  const initializePlatform = useCallback(async () => {
    try {
      setIsLoadingPlatform(true)
      const detected = detectDeploymentEnvironment()
      setDeploymentEnv(detected)
    } catch (error) {
      console.error('Platform detection failed:', error)
      toast.error('Failed to detect platform. Defaulting to server mode.')
      
      // Fallback to server platform
      setDeploymentEnv({
        platform: 'server',
        capabilities: { canUseServerStorage: true, canUseVercelStorage: false },
        metadata: { isProduction: false }
      })
    } finally {
      setIsLoadingPlatform(false)
    }
  }, [])
  
  // Initialize platform detection on mount
  useEffect(() => {
    initializePlatform()
  }, [initializePlatform])
  
  // Professional platform information with computed properties
  const platformInfo = useMemo(() => {
    if (!deploymentEnv) return null
    
    // Override deployment platform with user-selected platform from admin switcher
    const effectiveEnv = {
      ...deploymentEnv,
      platform: selectedPlatform as 'server' | 'vercel'
    }
    
    return getPlatformDisplayInfo(effectiveEnv)
  }, [deploymentEnv, selectedPlatform])

  // Professional stats computation with real-time updates
  useEffect(() => {
    const queueStats = Array.from(uploadQueue.values()).reduce(
      (acc, progress) => {
        acc.total++
        switch (progress.status) {
          case 'success':
            acc.completed++
            break
          case 'error':
            acc.failed++
            break
          case 'uploading':
            acc.inProgress++
            break
        }
        return acc
      },
      { total: 0, completed: 0, failed: 0, inProgress: 0 }
    )
    
    setUploadStats(queueStats)
  }, [uploadQueue])
  
  // Load existing media assets on platform initialization or platform change
  useEffect(() => {
    if (deploymentEnv && !isLoadingPlatform && isSettingsLoaded) {
      console.log('🔄 Loading media assets for platform:', selectedPlatform)
      loadMediaAssets()
    }
  }, [deploymentEnv, isLoadingPlatform, isSettingsLoaded, selectedPlatform])
  
  // Professional media asset loading
  const loadMediaAssets = useCallback(async () => {
    if (!deploymentEnv) {
      console.log('❌ No deployment environment available for asset loading')
      return
    }
    
    try {
      setIsLoadingAssets(true)
      console.log('📡 Fetching media assets from API...')
      console.log('🔄 Using platform:', selectedPlatform)
      
      // Pass the selected platform to the API
      const response = await fetch(`/api/admin/media/assets?platform=${selectedPlatform}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Response error:', response.status, errorText)
        throw new Error(`Failed to load assets: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Media assets API response:', data)
      
      if (!data.success) {
        throw new Error(data.error || 'API returned success: false')
      }
      
      setMediaAssets(data.assets || [])
      
      // Convert to legacy format for compatibility
      const legacyFiles: UploadedFile[] = (data.assets || []).map((asset: MediaAsset) => ({
        id: asset.id,
        file: { 
          name: asset.filename,
          lastModified: new Date(asset.uploadedAt).getTime()
        } as File,
        preview: asset.url,
        category: asset.category,
        status: 'success' as const,
        progress: 100,
        url: asset.url
      }))
      
      setUploadedFiles(legacyFiles)
      console.log(`✅ Loaded ${legacyFiles.length} existing assets`)
      
      if (data.message) {
        toast.info(data.message, { duration: 3000 })
      }
    } catch (error) {
      console.error('❌ Failed to load media assets:', error)
      toast.error(`Failed to load existing media: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoadingAssets(false)
    }
  }, [deploymentEnv, selectedPlatform])

  // Enterprise-grade file drop handler with validation
  const handleFileDrop = useCallback(async (files: FileList | null, category: string) => {
    if (!files || !deploymentEnv || !isSettingsLoaded) return
    
    const categoryConfig = uploadCategories.find(c => c.id === category)
    if (!categoryConfig) {
      toast.error('Invalid upload category')
      return
    }

    const filesArray = Array.from(files)
    const currentCategoryFiles = uploadedFiles.filter(f => f.category === category).length
    
    // Professional validation
    if (currentCategoryFiles + filesArray.length > categoryConfig.maxFiles) {
      toast.error(`Maximum ${categoryConfig.maxFiles} files allowed for ${categoryConfig.name}`)
      return
    }

    // Validate each file
    const validFiles: File[] = []
    const invalidFiles: string[] = []
    
    for (const file of filesArray) {
      // File size validation (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        invalidFiles.push(`${file.name}: File too large (max 50MB)`)
        continue
      }
      
      // File type validation
      if (!categoryConfig.acceptedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name}: Invalid file type`)
        continue
      }
      
      validFiles.push(file)
    }
    
    if (invalidFiles.length > 0) {
      toast.error(`Validation failed:\n${invalidFiles.join('\n')}`)
    }
    
    if (validFiles.length === 0) return

    // Add files to upload queue
    const newUploadQueue = new Map(uploadQueue)
    const newFiles: UploadedFile[] = []
    const currentTime = Date.now()
    
    validFiles.forEach((file, index) => {
      const fileId = `${category}_${currentTime}_${Math.random().toString(36).substr(2, 9)}`
      
      // Add to upload queue
      newUploadQueue.set(fileId, {
        fileId,
        progress: 0,
        status: 'pending'
      })
      
      // Ensure file has proper lastModified timestamp for sorting
      const fileWithTimestamp = new File([file], file.name, {
        type: file.type,
        lastModified: currentTime + index // Add small increment to maintain order
      })
      
      // Add to files list for UI
      newFiles.push({
        id: fileId,
        file: fileWithTimestamp,
        preview: URL.createObjectURL(file),
        category,
        status: 'pending',
        progress: 0
      })
    })
    
    setUploadQueue(newUploadQueue)
    // Add new files to the beginning of the list so they appear on top
    setUploadedFiles(prev => [...newFiles, ...prev])
    
    toast.success(
      `${validFiles.length} file(s) added to ${categoryConfig.name} upload queue`,
      { duration: 3000 }
    )
  }, [uploadedFiles, uploadQueue, deploymentEnv])

  // Show delete confirmation modal
  const showDeleteConfirmation = useCallback((fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    if (file) {
      setDeleteModal({
        isOpen: true,
        fileId,
        fileName: file.file.name,
        isDeleting: false
      })
    }
  }, [uploadedFiles])

  // Show edit/replace image modal
  const showEditModal = useCallback((fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    if (file) {
      setEditModal({
        isOpen: true,
        fileId,
        fileName: file.file.name,
        fileUrl: file.url || file.preview,
        category: file.category,
        isUploading: false,
        progress: 0,
        uploadSpeed: ''
      })
    }
  }, [uploadedFiles])

  // Cancel edit modal
  const cancelEdit = useCallback(() => {
    if (!editModal.isUploading) {
      setEditModal({
        isOpen: false,
        fileId: '',
        fileName: '',
        fileUrl: '',
        category: '',
        isUploading: false,
        progress: 0,
        uploadSpeed: ''
      })
    }
  }, [editModal.isUploading])

  // Show premium image preview modal
  const showImagePreview = useCallback((fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    if (file) {
      setPreviewModal({
        isOpen: true,
        imageUrl: file.url || file.preview,
        imageName: file.file.name,
        imageCategory: file.category,
        imageSize: file.file.size || 0,
        imageDate: file.file.lastModified ? new Date(file.file.lastModified) : null
      })
    }
  }, [uploadedFiles])

  // Close image preview modal
  const closeImagePreview = useCallback(() => {
    setPreviewModal({
      isOpen: false,
      imageUrl: '',
      imageName: '',
      imageCategory: '',
      imageSize: 0,
      imageDate: null
    })
  }, [])

  // Keyboard support for image preview modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && previewModal.isOpen) {
        closeImagePreview()
      }
    }

    if (previewModal.isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [previewModal.isOpen, closeImagePreview])

  // Professional image download function
  const downloadImage = useCallback(async (imageUrl: string, fileName: string) => {
    try {
      toast.info('🔄 Preparing download...', { duration: 2000 })
      
      // Check if this is a Vercel blob URL (external domain)
      const isVercelBlob = imageUrl.includes('blob.vercel-storage.com') || 
                          imageUrl.includes('public.blob.vercel-storage.com')
      
      if (isVercelBlob) {
        console.log('🌐 Vercel blob detected, adding cache-buster for fresh content')
        
        // For Vercel blobs, add aggressive cache-busting to ensure fresh content
        const url = new URL(imageUrl)
        
        // Clear existing cache-busting parameters
        url.searchParams.delete('v')
        url.searchParams.delete('t')
        url.searchParams.delete('_t')
        url.searchParams.delete('cache')
        
        // Add fresh cache-busting parameters
        url.searchParams.set('v', Date.now().toString())
        url.searchParams.set('t', Math.random().toString())
        url.searchParams.set('cache', 'no-cache')
        
        const freshUrl = url.toString()
        console.log('🔄 Original URL:', imageUrl)
        console.log('🔄 Fresh URL:', freshUrl)
        
        // For Vercel blobs, use direct link download (bypasses CSP)
        const link = document.createElement('a')
        link.href = freshUrl
        link.download = fileName
        link.target = '_blank' // Fallback to open in new tab if download fails
        link.style.display = 'none'
        
        // Add download attribute to force download behavior
        link.setAttribute('download', fileName)
        
        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success(`📥 "${fileName}" download initiated with fresh content!`, { duration: 3000 })
        return
      }
      
      // For server/local images, use fetch method
      console.log('🖥️ Server image detected, using fetch download method')
      
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }
      
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.style.display = 'none'
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`📥 "${fileName}" downloaded successfully!`, { duration: 3000 })
      
    } catch (error) {
      console.error('Download error:', error)
      toast.error('❌ Download failed. Opening image in new tab instead.')
      
      // Fallback: open in new tab
      window.open(imageUrl, '_blank')
    }
  }, [])

  // Professional upload speed calculation
  const calculateUploadSpeed = useCallback((bytesUploaded: number, startTime: number): string => {
    const elapsed = (Date.now() - startTime) / 1000 // seconds
    if (elapsed === 0) return 'Calculating...'
    
    const bytesPerSecond = bytesUploaded / elapsed
    
    if (bytesPerSecond < 1024) {
      return `${bytesPerSecond.toFixed(0)} B/s`
    } else if (bytesPerSecond < 1024 * 1024) {
      return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
    } else {
      return `${(bytesPerSecond / 1024 / 1024).toFixed(1)} MB/s`
    }
  }, [])

  // Handle replacing existing image with new file
  const handleImageReplacement = useCallback(async (newFile: File) => {
    if (!deploymentEnv || !editModal.fileId) return

    const categoryConfig = uploadCategories.find(c => c.id === editModal.category)
    if (!categoryConfig) {
      toast.error('Invalid category for replacement')
      return
    }

    // Validate new file
    if (newFile.size > 50 * 1024 * 1024) {
      toast.error('File too large (max 50MB)')
      return
    }

    if (!categoryConfig.acceptedTypes.includes(newFile.type)) {
      toast.error('Invalid file type for this category')
      return
    }

    // Create new file with original filename to maintain replacement
    const replacementFile = new File([newFile], editModal.fileName, {
      type: newFile.type,
      lastModified: Date.now()
    })

    try {
      setEditModal(prev => ({ 
        ...prev, 
        isUploading: true, 
        progress: 0,
        uploadSpeed: 'Deleting old image...'
      }))

      // Upload replacement - Vercel will handle overwriting automatically with allowOverwrite: true
      console.log('🔄 Uploading replacement file (Vercel will overwrite existing):', editModal.fileName)
      const formData = new FormData()
      const fileId = `replace_${editModal.fileId}_${Date.now()}`
      
      formData.append('files', replacementFile)
      formData.append('categories', editModal.category)
      formData.append('fileIds', fileId)
      formData.append('isReplacement', 'true') // Signal that this is a replacement, not new upload

      const startTime = Date.now()

      // Upload with progress tracking
      const uploadPromise = new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            const uploadSpeed = calculateUploadSpeed(event.loaded, startTime)
            
            setEditModal(prev => ({
              ...prev,
              progress: percentComplete,
              uploadSpeed
            }))
          }
        })
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText))
            } catch (e) {
              reject(new Error('Invalid response format'))
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
        
        xhr.onerror = () => reject(new Error('Network error occurred'))
        xhr.ontimeout = () => reject(new Error('Upload timeout'))
        
        xhr.open('POST', `/api/admin/media/bulk-upload?platform=${selectedPlatform}`)
        xhr.timeout = 300000 // 5 minute timeout
        xhr.send(formData)
      })

      const response = await uploadPromise
      
      if (!response.success) {
        throw new Error(response.error || 'Replacement failed')
      }

      const { results } = response
      const result = results[0]

      if (!result.success) {
        throw new Error(result.error || 'Replacement failed')
      }

      // Update the existing file in the UI with fresh URLs and aggressive cache busting
      const timestamp = Date.now()
      setUploadedFiles(prev => 
        prev.map(f => {
          if (f.id === editModal.fileId) {
            // Always add timestamp for cache busting (even on Vercel new URLs)
            const cacheBuster = `v=${timestamp}&t=${Math.random().toString(36).substring(2, 8)}&r=${Date.now()}`
            const freshUrl = `${result.url}?${cacheBuster}`
            
            // Create new preview from new file with timestamp
            const freshPreview = URL.createObjectURL(replacementFile)
            
            console.log('🔄 Cache-busted URL:', freshUrl)
            
            // Force component re-render by changing ID
            const newId = `${f.id}_replaced_${timestamp}`
            
            console.log(`🔄 Updating file in UI:`)
            console.log(`  Old URL: ${f.url}`)
            console.log(`  New URL: ${freshUrl}`)
            console.log(`  Old ID: ${f.id}`)
            console.log(`  New ID: ${newId}`)
            
            return {
              ...f,
              id: newId, // Force React re-render
              file: replacementFile,
              preview: freshPreview,
              url: freshUrl,
              status: 'success'
            }
          }
          return f
        })
      )

      // Complete the replacement
      setEditModal(prev => ({
        ...prev,
        progress: 100,
        isUploading: false,
        uploadSpeed: 'Replacement complete!'
      }))

      toast.success(
        `🎉 "${editModal.fileName}" replaced successfully!`,
        { duration: 4000 }
      )

      // Auto-close modal and refresh media assets
      setTimeout(async () => {
        setEditModal({
          isOpen: false,
          fileId: '',
          fileName: '',
          fileUrl: '',
          category: '',
          isUploading: false,
          progress: 0,
          uploadSpeed: ''
        })
        
        // Reload assets to get fresh blob URLs (especially important for Vercel)
        console.log('🔄 Reloading media assets after replacement...')
        await loadMediaAssets()
        
        // For Vercel mode, force complete refresh and cache clearing
        if (selectedPlatform === 'vercel') {
          console.log('☁️ Vercel mode: clearing all caches and forcing refresh')
          
          // Clear all possible caches
          try {
            // Clear service worker cache if available
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(registrations => {
                registrations.forEach(registration => registration.update())
              })
            }
            
            // Clear browser cache for this domain
            if ('caches' in window) {
              caches.keys().then(names => {
                names.forEach(name => {
                  caches.delete(name)
                })
              })
            }
            
            // Force reload with no-cache headers
            const url = new URL(window.location.href)
            url.searchParams.set('_t', Date.now().toString())
            window.location.href = url.toString()
          } catch (error) {
            console.log('Cache clearing failed, using simple reload:', error)
            window.location.reload()
          }
        }
      }, 2000)
      
    } catch (error) {
      console.error('Image replacement error:', error)
      
      setEditModal(prev => ({
        ...prev,
        isUploading: false,
        uploadSpeed: 'Replacement failed',
        progress: 0
      }))
      
      toast.error(
        `Replacement failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { duration: 5000 }
      )
      
      // Close modal on error after 3 seconds
      setTimeout(() => {
        cancelEdit()
      }, 3000)
    }
  }, [editModal, deploymentEnv, calculateUploadSpeed, loadMediaAssets, cancelEdit])

  // Professional file removal with cleanup
  const removeFile = useCallback(async (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId)
    if (!file) return

    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }))

      // If file has a URL (uploaded file), delete from server
      if (file.url && file.status === 'success') {
        try {
          const response = await fetch(`/api/admin/media/delete?url=${encodeURIComponent(file.url)}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            console.error('Failed to delete file from server:', response.statusText)
            // Continue with local removal even if server delete fails
          } else {
            const result = await response.json()
            console.log('File deleted from server:', result)
          }
        } catch (serverError) {
          console.error('Server delete error:', serverError)
          // Continue with local removal
        }
      }

      // Remove from local state
      setUploadedFiles(prev => {
        const file = prev.find(f => f.id === fileId)
        if (file && file.preview) {
          URL.revokeObjectURL(file.preview)
        }
        return prev.filter(f => f.id !== fileId)
      })
      
      // Remove from upload queue if pending
      setUploadQueue(prev => {
        const newQueue = new Map(prev)
        newQueue.delete(fileId)
        return newQueue
      })

      // Close modal and show success
      setDeleteModal({ isOpen: false, fileId: '', fileName: '', isDeleting: false })
      toast.success(`"${file.file.name}" deleted successfully`, { duration: 3000 })

      // Refresh media assets
      await loadMediaAssets()

    } catch (error) {
      console.error('Delete operation failed:', error)
      setDeleteModal(prev => ({ ...prev, isDeleting: false }))
      toast.error(`Failed to delete "${file.file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [uploadedFiles, loadMediaAssets])

  // Cancel delete confirmation
  const cancelDelete = useCallback(() => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({ isOpen: false, fileId: '', fileName: '', isDeleting: false })
    }
  }, [deleteModal.isDeleting])

  // Enterprise-grade bulk upload with real progress tracking
  const uploadAllFiles = useCallback(async () => {
    if (!deploymentEnv || isUploading) return
    
    const pendingFiles = uploadedFiles.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) {
      toast.info('No files pending upload')
      return
    }

    setIsUploading(true)
    const startTime = Date.now()
    
    toast.info(
      `🚀 Starting professional bulk upload of ${pendingFiles.length} files...`,
      { duration: 3000 }
    )

    try {
      // Prepare form data for bulk upload
      const formData = new FormData()
      const fileIds: string[] = []
      const categories: string[] = []
      
      pendingFiles.forEach(fileData => {
        formData.append('files', fileData.file)
        formData.append('categories', fileData.category)
        formData.append('fileIds', fileData.id)
        fileIds.push(fileData.id)
        categories.push(fileData.category)
      })

      // Update all files to uploading status
      setUploadedFiles(prev => 
        prev.map(f => 
          f.status === 'pending' 
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        )
      )
      
      // Update upload queue
      const newQueue = new Map(uploadQueue)
      fileIds.forEach(id => {
        newQueue.set(id, {
          fileId: id,
          progress: 0,
          status: 'uploading',
          uploadSpeed: 'Initializing...'
        })
      })
      setUploadQueue(newQueue)

      // Professional upload with XMLHttpRequest for progress tracking
      const uploadPromise = new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            const uploadSpeed = calculateUploadSpeed(event.loaded, startTime)
            
            // Update progress for all uploading files
            setUploadedFiles(prev => 
              prev.map(f => 
                f.status === 'uploading'
                  ? { ...f, progress: percentComplete, uploadSpeed }
                  : f
              )
            )
            
            // Update upload queue
            setUploadQueue(prev => {
              const newQueue = new Map(prev)
              fileIds.forEach(id => {
                const existing = newQueue.get(id)
                if (existing && existing.status === 'uploading') {
                  newQueue.set(id, {
                    ...existing,
                    progress: percentComplete,
                    uploadSpeed
                  })
                }
              })
              return newQueue
            })
          }
        })
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText))
            } catch (e) {
              reject(new Error('Invalid response format'))
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
        
        xhr.onerror = () => reject(new Error('Network error occurred'))
        xhr.ontimeout = () => reject(new Error('Upload timeout'))
        
        xhr.open('POST', `/api/admin/media/bulk-upload?platform=${selectedPlatform}`)
        xhr.timeout = 300000 // 5 minute timeout
        xhr.send(formData)
      })

      const response = await uploadPromise
      
      if (!response.success) {
        throw new Error(response.error || 'Bulk upload failed')
      }

      // Process upload results
      const { results, stats } = response
      
      // Update files based on upload results
      setUploadedFiles(prev => 
        prev.map(f => {
          const result = results.find((r: any) => r.fileId === f.id)
          if (!result) return f
          
          return {
            ...f,
            status: result.success ? 'success' : 'error',
            progress: 100,
            url: result.url || f.url,
            error: result.error,
            uploadSpeed: 'Completed'
          }
        })
      )
      
      // Update upload queue
      setUploadQueue(prev => {
        const newQueue = new Map(prev)
        results.forEach((result: any) => {
          newQueue.set(result.fileId, {
            fileId: result.fileId,
            progress: 100,
            status: result.success ? 'success' : 'error',
            uploadSpeed: 'Completed',
            error: result.error
          })
        })
        return newQueue
      })
      
      const duration = (Date.now() - startTime) / 1000
      
      if (stats.failed > 0) {
        toast.warning(
          `⚠️ Upload completed with issues: ${stats.successful}/${stats.total} files successful (${duration.toFixed(1)}s)`,
          { duration: 5000 }
        )
      } else {
        toast.success(
          `✅ All ${stats.successful} files uploaded successfully! (${duration.toFixed(1)}s)`,
          { duration: 4000 }
        )
      }
      
      // Refresh media assets
      await loadMediaAssets()
      
    } catch (error) {
      console.error('Bulk upload error:', error)
      
      // Mark all uploading files as failed
      setUploadedFiles(prev => 
        prev.map(f => 
          f.status === 'uploading'
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        )
      )
      
      toast.error(
        `❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { duration: 5000 }
      )
    } finally {
      setIsUploading(false)
    }
  }, [uploadedFiles, uploadQueue, deploymentEnv, isUploading, loadMediaAssets])
  
  // Professional file clearing with cleanup
  const clearAllFiles = useCallback(() => {
    if (isUploading) {
      toast.error('Cannot clear files while upload is in progress')
      return
    }
    
    // Clean up object URLs to prevent memory leaks
    uploadedFiles.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
    })
    
    setUploadedFiles([])
    setUploadQueue(new Map())
    
    toast.info('All files cleared from upload queue', { duration: 2000 })
  }, [uploadedFiles, isUploading])

  // Professional folder management
  const toggleFolder = useCallback((categoryId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }, [])
  
  const expandAllFolders = useCallback(() => {
    setExpandedFolders(new Set(uploadCategories.map(c => c.id)))
    toast.info('All folders expanded', { duration: 1500 })
  }, [])
  
  const collapseAllFolders = useCallback(() => {
    setExpandedFolders(new Set())
    toast.info('All folders collapsed', { duration: 1500 })
  }, [])
  
  // Handle direct file upload with popup
  const handleDirectUpload = useCallback(async (files: File[], category: string) => {
    if (!files.length || !deploymentEnv || !isSettingsLoaded) return

    const categoryConfig = uploadCategories.find(c => c.id === category)
    if (!categoryConfig) {
      toast.error('Invalid upload category')
      return
    }

    // Validate files
    const validFiles: File[] = []
    const invalidFiles: string[] = []
    
    for (const file of files) {
      if (file.size > 50 * 1024 * 1024) {
        invalidFiles.push(`${file.name}: File too large (max 50MB)`)
        continue
      }
      
      if (!categoryConfig.acceptedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name}: Invalid file type`)
        continue
      }
      
      validFiles.push(file)
    }
    
    if (invalidFiles.length > 0) {
      toast.error(`Validation failed:\n${invalidFiles.join('\n')}`)
    }
    
    if (validFiles.length === 0) return

    // Open upload modal
    setUploadModal({
      isOpen: true,
      category,
      files: validFiles,
      progress: 0,
      currentFile: '',
      isUploading: true,
      uploadSpeed: 'Preparing...',
      completed: 0,
      total: validFiles.length
    })

    try {
      // Prepare form data for bulk upload
      const formData = new FormData()
      const fileIds: string[] = []
      const categories: string[] = []
      const currentTime = Date.now()
      
      validFiles.forEach((file, index) => {
        const fileId = `${category}_${currentTime}_${Math.random().toString(36).substr(2, 9)}`
        formData.append('files', file)
        formData.append('categories', category)
        formData.append('fileIds', fileId)
        fileIds.push(fileId)
        categories.push(category)
      })

      const startTime = Date.now()

      // Upload with progress tracking
      const uploadPromise = new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            const uploadSpeed = calculateUploadSpeed(event.loaded, startTime)
            
            setUploadModal(prev => ({
              ...prev,
              progress: percentComplete,
              uploadSpeed,
              currentFile: validFiles[Math.floor((event.loaded / event.total) * validFiles.length)]?.name || 'Processing...'
            }))
          }
        })
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText))
            } catch (e) {
              reject(new Error('Invalid response format'))
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
        
        xhr.onerror = () => reject(new Error('Network error occurred'))
        xhr.ontimeout = () => reject(new Error('Upload timeout'))
        
        xhr.open('POST', `/api/admin/media/bulk-upload?platform=${selectedPlatform}`)
        xhr.timeout = 300000 // 5 minute timeout
        xhr.send(formData)
      })

      const response = await uploadPromise
      
      if (!response.success) {
        throw new Error(response.error || 'Upload failed')
      }

      const { results, stats } = response
      
      // Update modal with completion
      setUploadModal(prev => ({
        ...prev,
        progress: 100,
        isUploading: false,
        uploadSpeed: 'Completed!',
        completed: stats.successful
      }))

      // Show success message
      if (stats.failed > 0) {
        toast.warning(
          `Upload completed with issues: ${stats.successful}/${stats.total} files successful`,
          { duration: 5000 }
        )
      } else {
        toast.success(
          `🎉 All ${stats.successful} files uploaded successfully!`,
          { duration: 4000 }
        )
      }

      // Auto-close modal after 2 seconds and refresh
      setTimeout(async () => {
        setUploadModal(prev => ({ ...prev, isOpen: false }))
        await loadMediaAssets()
        window.location.reload() // Refresh page as requested
      }, 2000)
      
    } catch (error) {
      console.error('Direct upload error:', error)
      
      setUploadModal(prev => ({
        ...prev,
        isUploading: false,
        uploadSpeed: 'Failed',
        progress: 0
      }))
      
      toast.error(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { duration: 5000 }
      )
      
      // Close modal on error after 3 seconds
      setTimeout(() => {
        setUploadModal(prev => ({ ...prev, isOpen: false }))
      }, 3000)
    }
  }, [deploymentEnv, isSettingsLoaded, calculateUploadSpeed, loadMediaAssets])

  // Handle file input change for direct upload
  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleDirectUpload(Array.from(files), category)
    }
    // Reset input value to allow selecting the same file again
    event.target.value = ''
  }, [handleDirectUpload])

  // Professional file filtering and sorting
  const getFilteredFiles = useCallback((categoryId: string) => {
    let files = uploadedFiles.filter(f => f.category === categoryId && f.status === 'success')
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      files = files.filter(f => 
        f.file.name.toLowerCase().includes(searchLower) ||
        f.category.toLowerCase().includes(searchLower)
      )
    }
    
    files.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.file.name.localeCompare(b.file.name, undefined, { numeric: true })
        case 'date':
          // Use file lastModified or fall back to ID
          const aTime = a.file.lastModified || parseInt(a.id.split('_')[1]) || 0
          const bTime = b.file.lastModified || parseInt(b.id.split('_')[1]) || 0
          return bTime - aTime
        case 'size':
          return (b.file.size || 0) - (a.file.size || 0)
        default:
          return 0
      }
    })
    
    return files
  }, [uploadedFiles, searchTerm, sortBy])

  // Early return for loading states
  if (isLoadingPlatform || !isSettingsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <FiLoader className="w-12 h-12 text-[#00437f] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Initializing Media Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Detecting platform and loading configuration...
          </p>
        </motion.div>
      </div>
    )
  }
  
  if (!deploymentEnv || !platformInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <FiAlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Platform Detection Failed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to determine deployment environment
          </p>
          <Button onClick={() => window.location.reload()} className="bg-[#00437f] hover:bg-[#003366]">
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <div className="max-w-[2000px] mx-auto p-6 space-y-8">
        
        {/* ===== SIMPLE HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <Card className="relative border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl shadow-xl rounded-2xl overflow-hidden">
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-2xl flex items-center justify-center shadow-lg">
                    <FiUploadCloud className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Media Manager
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                      Upload and manage your media files
                    </p>
                  </div>
                </div>
                
                {/* Professional Platform Display */}
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 backdrop-blur-lg transition-all duration-300 ${
                  selectedPlatform === 'server'
                    ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400'
                }`}>
                  {selectedPlatform === 'server' ? (
                    <FiServer className="h-5 w-5" />
                  ) : (
                    <FiCloud className="h-5 w-5" />
                  )}
                  <div className="text-right">
                    <div className="text-sm font-bold flex items-center gap-2">
                      {selectedPlatform === 'server' ? 'Local Server' : 'Vercel Cloud'}
                      {deploymentEnv?.metadata.isProduction && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Production Environment" />
                      )}
                    </div>
                    <div className="text-xs opacity-75">
                      {selectedPlatform === 'server' ? 'Full File System Access' : 'Cloud Storage Platform'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ===== UPLOAD CATEGORIES GRID ===== */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Smart Upload Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Drag & drop files into organized categories for automatic organization
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
            {uploadCategories.map((category, index) => (
              <CategoryUploadCard 
                key={category.id} 
                category={category} 
                index={index}
                files={uploadedFiles.filter(f => f.category === category.id)}
                onFileDrop={handleFileDrop}
                onRemoveFile={showDeleteConfirmation}
                isUploading={isUploading}
                draggedOver={draggedOver}
                setDraggedOver={setDraggedOver}
                platformInfo={platformInfo}
                deploymentEnv={deploymentEnv}
                onFileInputChange={handleFileInputChange}
              />
            ))}
          </div>
        </div>

        {/* ===== EXISTING MEDIA GALLERY ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#00437f]/5 via-[#003366]/5 to-[#00437f]/5 rounded-3xl blur-2xl"></div>
          
          <Card className="relative border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-2xl shadow-xl rounded-3xl p-8">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-2xl flex items-center justify-center">
                  <FiImage className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Existing Media Library
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Browse your uploaded images by category
                  </p>
                </div>
              </div>

              {/* Premium File Explorer */}
              <div className="space-y-6">
                
                {/* Header with Controls */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Media File Explorer</h4>
                      <p className="text-gray-600 dark:text-gray-300">Professional file management with search and filtering</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isLoadingAssets ? (
                        <Badge className="bg-blue-500 text-white px-3 py-1">
                          <FiLoader className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white px-3 py-1">
                          <FiCheck className="h-4 w-4 mr-2" />
                          {uploadedFiles.filter(f => f.status === 'success').length} Files
                        </Badge>
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Using: <span className="font-semibold text-gray-900 dark:text-white">
                          {platformInfo?.type === 'vercel' ? 'Vercel Resources' : 'Server Resources'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Search and Sort Controls */}
                  <div className={`flex items-center gap-4 p-4 bg-white/80 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50 transition-opacity ${isLoadingAssets ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex-1 relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search files by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={isLoadingAssets}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00437f] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                        disabled={isLoadingAssets}
                        className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00437f] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="name">Name</option>
                        <option value="date">Date</option>
                        <option value="size">Size</option>
                      </select>
                    </div>
                    <Button
                      onClick={expandAllFolders}
                      size="sm"
                      disabled={isLoadingAssets}
                      className="bg-[#00437f] hover:bg-[#003366] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Expand All
                    </Button>
                    <Button
                      onClick={collapseAllFolders}
                      size="sm"
                      variant="secondary"
                      disabled={isLoadingAssets}
                    >
                      Collapse All
                    </Button>
                  </div>
                </div>

                {/* File Explorer Tree */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    {isLoadingAssets ? (
                      /* Professional Loading State */
                      <div className="space-y-4">
                        {/* Root folder */}
                        <div className="flex items-center gap-2 p-2 text-sm font-bold text-gray-900 dark:text-white">
                          <FiFolder className="h-4 w-4 text-[#00437f]" />
                          📁 media/
                        </div>
                        
                        {/* Loading State */}
                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12 border-4 border-gray-200 dark:border-gray-600 border-t-[#00437f] rounded-full"
                          />
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              Loading Media Library
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {selectedPlatform === 'vercel' 
                                ? 'Scanning Vercel blob storage...' 
                                : 'Scanning server media directories...'}
                            </p>
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <FiActivity className="w-4 h-4 animate-pulse" />
                              <span>Discovering assets by category</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Loaded Content */
                      <div className="space-y-1">
                        {/* Root folder */}
                        <div className="flex items-center gap-2 p-2 text-sm font-bold text-gray-900 dark:text-white">
                          <FiFolder className="h-4 w-4 text-[#00437f]" />
                          📁 media/
                        </div>
                      
                      {/* Category folders */}
                      {uploadCategories.map((category, index) => {
                        const categoryFiles = getFilteredFiles(category.id)
                        const isExpanded = expandedFolders.has(category.id)
                        const hasFiles = categoryFiles.length > 0
                        
                        return (
                          <motion.div
                            key={category.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className="ml-4"
                          >
                            {/* Folder row */}
                            <div 
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group ${
                                hasFiles ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                              }`}
                              onClick={() => toggleFolder(category.id)}
                            >
                              {/* Expand/Collapse Arrow */}
                              <div className="w-4 flex justify-center">
                                {hasFiles && (
                                  <motion.div
                                    animate={{ rotate: isExpanded ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <FiChevronRight className="h-3 w-3 text-gray-400" />
                                  </motion.div>
                                )}
                              </div>
                              
                              {/* Folder icon and name */}
                              <div className={`w-4 h-4 rounded bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                                {React.cloneElement(category.icon as React.ReactElement, { className: 'h-2.5 w-2.5 text-white' })}
                              </div>
                              <span className="text-sm font-medium">{category.folder.split('/').pop()}/</span>
                              
                              {/* File count */}
                              <div className="flex items-center gap-2 ml-auto">
                                {hasFiles && (
                                  <Badge variant="secondary" className="text-xs">
                                    {categoryFiles.length} files
                                  </Badge>
                                )}
                                {!hasFiles && (
                                  <span className="text-xs text-gray-400">empty</span>
                                )}
                              </div>
                            </div>
                            
                            {/* Files list */}
                            <AnimatePresence>
                              {isExpanded && hasFiles && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-6 overflow-hidden"
                                >
                                  <div className="space-y-1 py-2">
                                    {categoryFiles.map((file, fileIndex) => (
                                      <motion.div
                                        key={file.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: fileIndex * 0.01 }}
                                        className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                      >
                                        {/* Tree line */}
                                        <div className="w-4 flex justify-center">
                                          <div className="w-px h-full bg-gray-200 dark:bg-gray-600"></div>
                                        </div>
                                        
                                        {/* File icon */}
                                        <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                                          <FiImage className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        
                                        {/* File name */}
                                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                                          {file.file.name}
                                        </span>
                                        
                                        {/* Status and actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Badge className="bg-green-500 text-white text-xs">
                                            <FiCheck className="h-2 w-2 mr-1" />
                                          </Badge>
                                          <button
                                            onClick={() => showImagePreview(file.id)}
                                            className="w-6 h-6 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded flex items-center justify-center transition-colors"
                                            title="Preview Image"
                                          >
                                            <FiEye className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={() => downloadImage(file.url || file.preview, file.file.name)}
                                            className="w-6 h-6 bg-green-100 hover:bg-green-200 text-green-600 rounded flex items-center justify-center transition-colors"
                                            title="Download Image"
                                          >
                                            <FiDownload className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={() => showEditModal(file.id)}
                                            className="w-6 h-6 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded flex items-center justify-center transition-colors"
                                            title="Replace Image"
                                          >
                                            <FiEdit2 className="h-3 w-3" />
                                          </button>
                                          <button
                                            onClick={() => showDeleteConfirmation(file.id)}
                                            className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded flex items-center justify-center transition-colors"
                                            title="Delete"
                                          >
                                            <FiTrash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )
                      })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
      
      {/* Professional Upload Progress Modal */}
      <AnimatePresence>
        {uploadModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !uploadModal.isUploading) {
                setUploadModal(prev => ({ ...prev, isOpen: false }))
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full"
            >
              <div className="text-center">
                {/* Upload Icon */}
                <div className="w-16 h-16 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-full flex items-center justify-center mx-auto mb-4">
                  {uploadModal.isUploading ? (
                    <FiLoader className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <FiCheck className="w-8 h-8 text-white" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {uploadModal.isUploading ? 'Uploading Files' : 'Upload Complete!'}
                </h3>

                {/* Progress Info */}
                <div className="mb-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {uploadModal.isUploading ? (
                      <>Uploading to {uploadModal.category} ({uploadModal.completed}/{uploadModal.total})</>
                    ) : (
                      <>Successfully uploaded {uploadModal.completed} files</>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                    <motion.div
                      className="bg-gradient-to-r from-[#00437f] to-[#003366] h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadModal.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  {/* Progress Details */}
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{uploadModal.progress}%</span>
                    <span>{uploadModal.uploadSpeed}</span>
                  </div>
                  
                  {/* Current File */}
                  {uploadModal.currentFile && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 truncate">
                      {uploadModal.currentFile}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!uploadModal.isUploading && (
                  <div className="space-y-3">
                    <Button
                      onClick={() => setUploadModal(prev => ({ ...prev, isOpen: false }))}
                      className="w-full bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white"
                    >
                      <FiCheck className="w-4 h-4 mr-2" />
                      Close
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Page will refresh automatically in a moment...
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Premium Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !deleteModal.isDeleting) {
                cancelDelete()
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full"
            >
              <div className="text-center">
                {/* Warning Icon */}
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  {deleteModal.isDeleting ? (
                    <FiLoader className="w-8 h-8 text-red-600 animate-spin" />
                  ) : (
                    <FiAlertTriangle className="w-8 h-8 text-red-600" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {deleteModal.isDeleting ? 'Deleting File...' : 'Confirm Deletion'}
                </h3>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {deleteModal.isDeleting ? (
                      <>Processing deletion request...</>
                    ) : (
                      <>Are you sure you want to delete this file?</>
                    )}
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      📄 {deleteModal.fileName}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {deleteModal.isDeleting ? (
                  <div className="flex justify-center">
                    <Button
                      disabled
                      className="bg-red-500 text-white cursor-not-allowed opacity-50"
                    >
                      <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <Button
                      onClick={cancelDelete}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <FiX className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={() => removeFile(deleteModal.fileId)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                    >
                      <FiTrash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
                
                {deleteModal.isDeleting && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Please wait while we remove the file...
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Premium Edit/Replace Image Modal */}
      <AnimatePresence>
        {editModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !editModal.isUploading) {
                cancelEdit()
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full"
            >
              <div className="text-center">
                {/* Edit Icon */}
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  {editModal.isUploading ? (
                    <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                  ) : (
                    <FiEdit2 className="w-8 h-8 text-blue-600" />
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {editModal.isUploading ? 'Replacing Image...' : 'Replace Image'}
                </h3>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {editModal.isUploading ? (
                      <>Uploading new image with same filename...</>
                    ) : (
                      <>Select a new image to replace the existing one</>
                    )}
                  </p>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      📄 {editModal.fileName}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Original filename will be preserved
                    </p>
                  </div>

                  {/* Current Image Preview */}
                  {editModal.fileUrl && !editModal.isUploading && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current image:</p>
                      <div className="w-24 h-24 mx-auto rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        <Image
                          src={`${editModal.fileUrl}?t=${Date.now()}`}
                          alt="Current image"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          unoptimized
                          key={`edit-${editModal.fileId}-${Date.now()}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {editModal.isUploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                        <motion.div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${editModal.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{editModal.progress}%</span>
                        <span>{editModal.uploadSpeed}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {editModal.isUploading ? (
                  <div className="flex justify-center">
                    <Button
                      disabled
                      className="bg-blue-500 text-white cursor-not-allowed opacity-50"
                    >
                      <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                      Replacing...
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* File Upload Input */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageReplacement(file)
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                        <FiUploadCloud className="w-4 h-4 mr-2" />
                        Choose New Image
                      </Button>
                    </div>

                    {/* Cancel Button */}
                    <Button
                      onClick={cancelEdit}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <FiX className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
                
                {editModal.isUploading && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Please wait while we replace the image...
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* World-Class Premium Image Preview Modal */}
      <AnimatePresence>
        {previewModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeImagePreview()
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center">
                      <FiImage className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate max-w-md">
                        {previewModal.imageName}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="capitalize font-medium">{previewModal.imageCategory}</span>
                        <span>•</span>
                        <span>{(previewModal.imageSize / 1024 / 1024).toFixed(2)} MB</span>
                        {previewModal.imageDate && (
                          <>
                            <span>•</span>
                            <span>{previewModal.imageDate.toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => downloadImage(previewModal.imageUrl, previewModal.imageName)}
                      size="sm"
                      variant="outline"
                      className="bg-green-50 hover:bg-green-100 border-green-300 text-green-700 hover:text-green-800"
                    >
                      <FiDownload className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(previewModal.imageUrl)
                        toast.success('Image URL copied!')
                      }}
                      size="sm"
                      variant="outline"
                      className="bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700 hover:text-blue-800"
                    >
                      <FiCopy className="w-4 h-4 mr-2" />
                      Copy URL
                    </Button>
                    
                    <Button
                      onClick={() => window.open(previewModal.imageUrl, '_blank')}
                      size="sm"
                      className="bg-[#00437f] hover:bg-[#003366] text-white"
                    >
                      <FiGlobe className="w-4 h-4 mr-2" />
                      Open Original
                    </Button>
                    
                    <button
                      onClick={closeImagePreview}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Image Container */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 min-h-[400px] max-h-[70vh] overflow-hidden">
                {/* Premium Image Display */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="relative max-w-full max-h-full">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="relative rounded-2xl overflow-hidden shadow-2xl"
                    >
                      <Image
                        src={`${previewModal.imageUrl}?t=${Date.now()}`}
                        alt={previewModal.imageName}
                        width={800}
                        height={600}
                        className="max-w-full max-h-[60vh] object-contain"
                        unoptimized
                        quality={100}
                        key={`preview-${previewModal.imageName}-${Date.now()}`}
                      />
                      
                      {/* Premium Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                  </div>
                </div>
                
                {/* Professional Background Pattern */}
                <div className="absolute inset-0 opacity-5 dark:opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                </div>
              </div>
              
              {/* Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      <FiCheck className="w-3 h-3 mr-1" />
                      Original Quality
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1">
                      <FiZap className="w-3 h-3 mr-1" />
                      Premium Preview
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">ESC</kbd> to close
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ===== CATEGORY UPLOAD CARD COMPONENT =====
const CategoryUploadCard = ({ 
  category, 
  index, 
  files, 
  onFileDrop, 
  onRemoveFile, 
  isUploading,
  draggedOver,
  setDraggedOver,
  platformInfo,
  deploymentEnv,
  onFileInputChange
}: {
  category: UploadCategory
  index: number
  files: UploadedFile[]
  onFileDrop: (files: FileList | null, category: string) => void
  onRemoveFile: (fileId: string) => void
  isUploading: boolean
  draggedOver: string | null
  setDraggedOver: (category: string | null) => void
  platformInfo: any
  deploymentEnv: any
  onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>, category: string) => void
}) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
    setDraggedOver(category.id)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setDraggedOver(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setDraggedOver(null)
    onFileDrop(e.dataTransfer.files, category.id)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileInputChange(e, category.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="relative group h-full flex flex-col"
    >
      {/* Subtle Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-2xl blur-2xl opacity-10 group-hover:opacity-15 transition-all duration-500`}></div>
      
      <Card className="relative border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:border-[#00437f]/30 h-full flex flex-col">
        
        {/* Upload Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            relative p-8 border-2 border-dashed transition-all duration-300 cursor-pointer m-4 rounded-xl flex-1 flex flex-col justify-center
            ${isDragOver 
              ? 'border-[#00437f] bg-[#00437f]/5 scale-[1.02]' 
              : 'border-gray-300 dark:border-gray-600 hover:border-[#00437f]/50 hover:bg-[#00437f]/5'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="file"
            multiple
            accept={category.acceptedTypes.join(',')}
            onChange={handleFileInput}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="text-center space-y-5">
            {/* Upload Icon and Category */}
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center group-hover:bg-[#00437f]/10 transition-colors">
                <FiUploadCloud className={`h-8 w-8 transition-colors ${isDragOver ? 'text-[#00437f] animate-bounce' : 'text-gray-500 dark:text-gray-400 group-hover:text-[#00437f]'}`} />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {category.description}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.subtitle}
                </p>
              </div>
            </div>

            {/* Upload Status */}
            {isDragOver ? (
              <div className="flex items-center justify-center gap-2 text-[#00437f] font-semibold">
                <FiUploadCloud className="h-5 w-5 animate-bounce" />
                <span>Drop your files here</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Click to browse</span> or drag files here
                  {platformInfo && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      🌐 Uploading to {platformInfo.name}
                    </div>
                  )}
                </div>
                
                {/* File count and progress */}
                <div className="flex items-center justify-center gap-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {files.length}/{category.maxFiles} files
                  </span>
                  <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#00437f] transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min((files.length / category.maxFiles) * 100, 100)}%` }}
                    />
                  </div>
                  {files.length > 0 && (
                    <Badge className="bg-green-500 text-white text-xs">
                      <FiCheck className="h-2.5 w-2.5 mr-1" />
                      {files.filter(f => f.status === 'success').length}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Supported formats */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {category.acceptedTypes.slice(0, 4).map(type => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type.split('/')[1].toUpperCase()}
                </Badge>
              ))}
              {category.acceptedTypes.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{category.acceptedTypes.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        </div>

      </Card>
    </motion.div>
  )
}

// ===== FILE PREVIEW CARD COMPONENT =====
const FilePreviewCard = ({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) => (
  <div className="relative group">
    <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-white/50 shadow-lg">
      <Image
        src={`${file.preview}?t=${Date.now()}`}
        alt={file.file.name}
        fill
        className="object-cover transition-transform group-hover:scale-110"
        unoptimized
        key={`preview-${file.id}-${Date.now()}`}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(file.preview, '_blank')}
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-gray-800 rounded-lg"
          >
            <FiEye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-500 text-white rounded-lg"
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {file.status === 'uploading' && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
          <Progress value={file.progress} className="h-1" />
          <div className="flex justify-between items-center mt-1 text-xs text-white">
            <span>{file.progress}%</span>
            <span>{file.uploadSpeed}</span>
          </div>
        </div>
      )}

      {/* Status Icons */}
      <div className="absolute top-2 right-2">
        {file.status === 'success' && (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <FiCheck className="h-3 w-3 text-white" />
          </div>
        )}
        {file.status === 'error' && (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <FiX className="h-3 w-3 text-white" />
          </div>
        )}
        {file.status === 'uploading' && (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <FiUploadCloud className="h-3 w-3 text-white animate-pulse" />
          </div>
        )}
      </div>
    </div>
    
    {/* File Info */}
    <div className="mt-2 space-y-1 text-center">
      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
        {file.file.name}
      </p>
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        {file.status === 'success' && <FiCheck className="h-3 w-3 text-green-500" />}
      </div>
    </div>
  </div>
)