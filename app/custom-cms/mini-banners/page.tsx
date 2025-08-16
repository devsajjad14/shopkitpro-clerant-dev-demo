'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlus,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
  FiDownload,
  FiShare2,
  FiCopy,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiPlay,
  FiPause,
  FiTrendingUp,
  FiCode,
  FiTag,
  FiFileText,
  FiChevronsLeft,
  FiChevronsRight,
  FiSmartphone,
  FiMonitor,
} from 'react-icons/fi'
import { useToast } from '@/components/ui/use-toast';
// Remove: import { Dialog } from '@headlessui/react';

// Dynamic banner data interface
interface Banner {
  id: number
  name: string
  content: string
  image_url?: string
  imageUrl?: string
  status: 'draft' | 'active' | 'scheduled' | 'inactive'
  priority: number
  startDate: Date | null
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
  showTitle?: boolean
  showSubtitle?: boolean
  showButton?: boolean
}

export default function MainBannersPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBanners, setSelectedBanners] = useState<number[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null)
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [publishingId, setPublishingId] = useState<number | null>(null)
  const { toast } = useToast();
  const [viewBanner, setViewBanner] = useState<Banner | null>(null);
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop');
  useEffect(() => {
    if (viewBanner) setDevicePreview('desktop');
  }, [viewBanner]);

  const itemsPerPage = 8

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/mini-banners')
        const result = await response.json()
        
        if (result.success) {
          setBanners(result.data)
        } else {
          console.error('Failed to fetch mini banners:', result.error)
        }
      } catch (error) {
        console.error('Error fetching mini banners:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBanners()
  }, [])

  // Filter banners based on search and status
  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = banner.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || banner.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBanners = filteredBanners.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleDelete = (id: number) => {
    setBannerToDelete(id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!bannerToDelete) return;
    try {
      setDeletingId(bannerToDelete);
      const response = await fetch(`/api/mini-banners/${bannerToDelete}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setBanners(banners.filter(banner => banner.id !== bannerToDelete));
        setShowDeleteModal(false);
        setBannerToDelete(null);
        toast({ title: 'Mini Banner Deleted', description: 'Mini banner deleted successfully.' });
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to delete mini banner', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete mini banner', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  // Publish draft banner to active
  const handlePublishBanner = async (id: number) => {
    setPublishingId(id)
    try {
      const response = await fetch(`/api/mini-banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      })
      const result = await response.json()

      if (result.success) {
        setBanners(banners.map((banner) => 
          banner.id === id ? { ...banner, status: 'active' } : banner
        ))
        toast({ title: 'Success', description: 'Mini banner published successfully!' })
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to publish mini banner', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error publishing mini banner:', error)
      toast({ title: 'Error', description: 'Failed to publish mini banner', variant: 'destructive' })
    } finally {
      setPublishingId(null)
    }
  }

  // Extract image from HTML content for preview
  const extractImageFromHtml = (html: string): string => {
    const imgMatch = html.match(/<img[^>]+src="([^"]+)"/)
    return imgMatch ? imgMatch[1] : '/placeholder-banner.jpg'
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return // Don't interfere with form inputs
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setCurrentPage(Math.max(1, currentPage - 1))
          break
        case 'ArrowRight':
          e.preventDefault()
          setCurrentPage(Math.min(totalPages, currentPage + 1))
          break
        case 'Home':
          e.preventDefault()
          setCurrentPage(1)
          break
        case 'End':
          e.preventDefault()
          setCurrentPage(totalPages)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading mini banners...</p>
        </div>
      </div>
    )
  }

  function generateBannerHtmlFromContent(content: string, devicePreview: 'desktop' | 'mobile' = 'desktop', showTitle: boolean = true, showSubtitle: boolean = true, showButton: boolean = true, imageUrl?: string): string {
    // Parse the HTML string and extract banner data
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Extract basic elements
    const img = doc.querySelector('.banner-container img');
    const titleEl = doc.querySelector('.banner-title');
    const subtitleEl = doc.querySelector('.banner-subtitle');
    const ctaEl = doc.querySelector('.banner-cta') || doc.querySelector('button') || doc.querySelector('[id*="cta"]') || doc.querySelector('[class*="cta"]');
    const overlayEl = doc.querySelector('.banner-overlay');
    
    // Extract text content
    const title = titleEl?.textContent?.trim() || 'Your Banner Title';
    const subtitle = subtitleEl?.textContent?.trim() || 'Your banner subtitle';
    const ctaText = ctaEl?.textContent?.trim() || 'Shop Now';
    
    // Use provided imageUrl or extract from HTML
    const bannerImageUrl = imageUrl || img?.getAttribute('src') || '';
    
    // Extract overlay opacity
    let overlayOpacity = 0.5;
    if (overlayEl) {
      const overlayStyle = overlayEl.getAttribute('style') || '';
      const match = overlayStyle.match(/rgba\(0,0,0,([0-9.]+)\)/);
      if (match) overlayOpacity = parseFloat(match[1]);
    }
    
    // Extract styles function
    function extractStyles(styleStr: string): Record<string, string> {
      const style: Record<string, string> = {};
      if (!styleStr) return style;
      styleStr.split(';').forEach(s => {
        const [key, val] = s.split(':');
        if (key && val) style[key.trim()] = val.trim();
      });
      return style;
    }
    
    // Extract individual styles
    const titleStyle = titleEl ? extractStyles(titleEl.getAttribute('style') || '') : {};
    const subtitleStyle = subtitleEl ? extractStyles(subtitleEl.getAttribute('style') || '') : {};
    const ctaStyle = ctaEl ? extractStyles(ctaEl.getAttribute('style') || '') : {};
    
    // Extract positions
    const titleTop = titleStyle.top || '20%';
    const titleLeft = titleStyle.left || '50%';
    const subtitleTop = subtitleStyle.top || '40%';
    const subtitleLeft = subtitleStyle.left || '50%';
    const ctaTop = ctaStyle.top || '65%';
    const ctaLeft = ctaStyle.left || '50%';
    
    // Extract colors
    const titleColor = titleStyle.color || '#EF4444';
    const subtitleColor = subtitleStyle.color || '#3B82F6';
    const ctaBgColor = ctaStyle['background-color'] || '#FFFFFF';
    const ctaColor = ctaStyle.color || '#000000';
    
    // Extract font sizes with mobile scaling
    let titleFontSize = titleStyle['font-size'] || '48px';
    let subtitleFontSize = subtitleStyle['font-size'] || '24px';
    let ctaFontSize = ctaStyle['font-size'] || '18px';
    
    if (devicePreview === 'mobile') {
      // Scale down font sizes for mobile
      titleFontSize = `${Math.max(parseInt(titleFontSize) * 0.6, 14)}px`;
      subtitleFontSize = `${Math.max(parseInt(subtitleFontSize) * 0.6, 12)}px`;
      ctaFontSize = `${Math.max(parseInt(ctaFontSize) * 0.6, 10)}px`;
    }
    
    // Extract margins and padding
    const titleMargin = titleStyle.margin || '0px';
    const subtitleMargin = subtitleStyle.margin || '0px';
    const ctaMargin = ctaStyle.margin || '0px';
    
    // Generate clean HTML
    const html = `
<div class="banner-container" style="position: relative; width: 100%; height: 320px; overflow: hidden; border-radius: 12px;">
  ${bannerImageUrl ? `<img src="${bannerImageUrl}" alt="Banner" style="width: 100%; height: 100%; object-fit: cover;" />` : ''}
  
  <div class="banner-overlay" style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,${overlayOpacity}), transparent);">
    <div class="banner-content" style="position: relative; height: 100%; width: 100%;">
      ${showTitle ? `<h3 class="banner-title" style="
        position: absolute;
        top: ${titleTop}; left: ${titleLeft}; transform: translate(-50%, -50%);
        font-weight: ${titleStyle['font-weight'] || 'bold'};
        font-style: ${titleStyle['font-style'] || 'normal'};
        text-decoration: ${titleStyle['text-decoration'] || 'none'};
        color: ${titleColor};
        font-size: ${titleFontSize};
        margin: ${titleMargin};
        padding: ${titleStyle.padding || '0px'};
        width: 100%;
        max-width: 100%;
        text-align: center;
        line-height: 1.2;
        word-break: break-words;
        hyphens: auto;
        z-index: 2;
      ">
        ${title}
      </h3>` : ''}
      
      ${showSubtitle ? `<p class="banner-subtitle" style="
        position: absolute;
        top: ${subtitleTop}; left: ${subtitleLeft}; transform: translate(-50%, -50%);
        font-weight: ${subtitleStyle['font-weight'] || 'bold'};
        font-style: ${subtitleStyle['font-style'] || 'normal'};
        text-decoration: ${subtitleStyle['text-decoration'] || 'none'};
        color: ${subtitleColor};
        font-size: ${subtitleFontSize};
        margin: ${subtitleMargin};
        padding: ${subtitleStyle.padding || '0px'};
        width: 100%;
        max-width: 100%;
        text-align: center;
        line-height: 1.2;
        word-break: break-words;
        hyphens: auto;
        z-index: 2;
      ">
        ${subtitle}
      </p>` : ''}
      
      ${showButton ? `<button class="banner-cta" style="
        position: absolute;
        top: ${ctaTop}; left: ${ctaLeft}; transform: translate(-50%, -50%);
        font-weight: ${ctaStyle['font-weight'] || 'normal'};
        font-style: ${ctaStyle['font-style'] || 'normal'};
        text-decoration: ${ctaStyle['text-decoration'] || 'none'};
        background-color: ${ctaBgColor};
        color: ${ctaColor};
        font-size: ${ctaFontSize};
        margin: ${ctaMargin};
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        min-width: 120px;
        min-height: 44px;
        display: inline-block;
        overflow: visible;
        z-index: 2;
        text-align: center;
        line-height: 1;
        font-family: inherit;
        white-space: nowrap;
        font-weight: 500;
      ">
        ${ctaText}
      </button>` : ''}
    </div>
  </div>
</div>

<style>
.banner-cta:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}
</style>
    `;
    
    return html.trim();
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Mini Banners
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Manage your mini banner content
          </p>
        </div>
        <button
          onClick={() => router.push('/custom-cms/create-mini-banner')}
          className='px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium'
        >
          <FiPlus className='w-4 h-4' />
          Create New Mini Banner
        </button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Total Banners
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {banners.length}
              </p>
            </div>
            <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
              <FiGrid className='w-6 h-6 text-blue-600 dark:text-blue-400' />
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Active
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {banners.filter((b) => b.status === 'active').length}
              </p>
            </div>
            <div className='w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center'>
              <FiCheckCircle className='w-6 h-6 text-green-600 dark:text-green-400' />
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                Draft
              </p>
              <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                {banners.filter((b) => b.status === 'draft').length}
              </p>
            </div>
            <div className='w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center'>
              <FiEdit3 className='w-6 h-6 text-yellow-600 dark:text-yellow-400' />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
        <div className='flex flex-col lg:flex-row gap-4 items-center justify-between'>
          <div className='flex items-center gap-4 flex-1'>
            <div className='relative flex-1 max-w-md'>
              <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search banners...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
                aria-label='Search banners'
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none'
                  aria-label='Clear search'
                >
                  <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' /></svg>
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white'
            >
              <option value='all'>All Status</option>
              <option value='active'>Active</option>
              <option value='draft'>Draft</option>
              <option value='inactive'>Inactive</option>
            </select>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <FiGrid className='w-5 h-5' />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <FiList className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>

      {/* Banners Grid/List */}
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden'>
        {currentBanners.length === 0 ? (
          <div className='text-center py-12'>
            <FiTag className='w-16 h-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              No banners found
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-6'>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Get started by creating your first banner.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => router.push('/custom-cms/create-main-banner')}
                className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                Create First Banner
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4'>
            {currentBanners.map((banner) => {
              const imageUrl = banner.image_url || banner.imageUrl || extractImageFromHtml(banner.content) || '/placeholder-banner.jpg';
              return (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.025, boxShadow: '0 8px 32px 0 rgba(31,41,55,0.10)' }}
                  className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-200 group flex flex-col overflow-hidden min-h-[150px]'
                  style={{ minHeight: 150 }}
                >
                  <img
                    src={imageUrl}
                    alt={banner.name}
                    className='mx-auto w-[92%] aspect-[12/7] object-cover rounded-xl shadow-sm mt-2 mb-2'
                  />
                  <div className='absolute top-4 right-6 flex items-center gap-2 z-10'>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(banner.status)}`}>{banner.status}</span>
                  </div>
                  <div className='flex-1 flex flex-col justify-between p-2 gap-1'>
                    <h3 className='text-base font-bold text-gray-900 dark:text-white text-center tracking-tight leading-tight truncate mb-1'>{banner.name}</h3>
                                        <div className='flex items-center justify-between gap-2 mt-1 px-2 pb-2 overflow-visible'>
                      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-sm flex-shrink-0'>
                        <FiClock className='w-3 h-3 opacity-70' />{new Date(banner.updatedAt).toLocaleDateString()}
                      </span>
                      <div className='flex items-center gap-1 overflow-visible flex-shrink-0 min-w-0'>
                        <button
                          title='View'
                          onClick={() => setViewBanner(banner)}
                          className='w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-500 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200/60'
                          aria-label='View banner'
                        >
                          <FiEye className='w-3 h-3' />
                        </button>
                        <button
                          title='Edit'
                          onClick={() => router.push(`/custom-cms/create-mini-banner?id=${banner.id}`)}
                          className='w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-500 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200/60'
                        >
                          <FiEdit3 className='w-3 h-3' />
                        </button>
                        {banner.status === 'draft' && (
                          <button
                            title='Publish'
                            onClick={() => handlePublishBanner(banner.id)}
                            disabled={publishingId === banner.id}
                            className='w-6 h-6 flex items-center justify-center rounded-md bg-green-50 border border-green-200 text-green-600 shadow-sm hover:bg-green-100 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-200/60 disabled:opacity-50'
                          >
                            {publishingId === banner.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-500"></div>
                            ) : (
                              <FiPlay className='w-3 h-3' />
                            )}
                          </button>
                        )}
                        <button
                          title='Delete'
                          onClick={() => handleDelete(banner.id)}
                          disabled={deletingId === banner.id}
                          className='w-6 h-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-500 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-200/60 disabled:opacity-50'
                        >
                          {deletingId === banner.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                          ) : (
                            <FiTrash2 className='w-3 h-3' />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 dark:bg-gray-700'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Banner
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Priority
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Updated
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {currentBanners.map((banner) => (
                  <tr
                    key={banner.id}
                    className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <img
                          src={banner.image_url || banner.imageUrl || extractImageFromHtml(banner.content) || '/placeholder-banner.jpg'}
                          alt={banner.name}
                          className='w-20 h-14 object-cover rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm'
                        />
                        <div>
                          <div className='text-base font-bold text-gray-900 dark:text-white truncate'>{banner.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          banner.status
                        )}`}
                      >
                        {banner.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                      {banner.priority}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                      {new Date(banner.updatedAt).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <div className='flex items-center justify-end gap-3'>
                        <button className='p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
                          <FiEye className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/custom-cms/create-mini-banner?id=${banner.id}`
                            )
                          }
                          className='p-1 text-gray-400 hover:text-blue-600 transition-colors'
                        >
                          <FiEdit3 className='w-4 h-4' />
                        </button>
                        {banner.status === 'draft' && (
                          <button
                            onClick={() => handlePublishBanner(banner.id)}
                            disabled={publishingId === banner.id}
                            className='p-1 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50'
                            title='Publish to Active'
                          >
                            {publishingId === banner.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                            ) : (
                              <FiPlay className='w-4 h-4' />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(banner.id)}
                          disabled={deletingId === banner.id}
                          className='p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-50'
                        >
                          {deletingId === banner.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          ) : (
                            <FiTrash2 className='w-4 h-4' />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-700 dark:text-gray-300'>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredBanners.length)} of{' '}
              {filteredBanners.length} results
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className='p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                <FiChevronsLeft className='w-4 h-4' />
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className='p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                <FiChevronLeft className='w-4 h-4' />
              </button>
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className='p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                <FiChevronRight className='w-4 h-4' />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className='p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                <FiChevronsRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl'
            >
              <div className='text-center'>
                <div className='w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FiTrash2 className='w-8 h-8 text-red-600 dark:text-red-400' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                  Delete Banner
                </h3>
                <p className='text-gray-600 dark:text-gray-400 mb-6'>
                  Are you sure you want to delete this banner? This action
                  cannot be undone.
                </p>
                <div className='flex gap-3'>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deletingId === bannerToDelete}
                    className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deletingId === bannerToDelete}
                    className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600 flex items-center justify-center gap-2'
                  >
                    {deletingId === bannerToDelete ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Banner Modal */}
      {viewBanner && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='fixed inset-0 bg-black/60' onClick={() => setViewBanner(null)} aria-label='Close modal' tabIndex={-1} />
          <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full mx-4 p-6 z-10 flex flex-col'>
            {/* Premium Close Button */}
            <button 
              onClick={() => setViewBanner(null)}
              className='absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-20'
              aria-label='Close modal'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
            {/* Device Toggle */}
            <div className='flex items-center justify-center mb-4'>
              <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
                <button 
                  onClick={() => setDevicePreview('desktop')}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    devicePreview === 'desktop'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiMonitor className='w-4 h-4' />
                </button>
                <button 
                  onClick={() => setDevicePreview('mobile')}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    devicePreview === 'mobile'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiSmartphone className='w-4 h-4' />
                </button>
              </div>
            </div>
            <div className={`w-full max-h-[70vh] overflow-auto rounded-xl mb-4 bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
              {devicePreview === 'mobile' ? (
                <div className='relative mx-auto' style={{ maxWidth: '375px' }}>
                  <div className='relative mx-auto bg-gray-900 rounded-3xl p-2 shadow-2xl' style={{ width: '375px' }}>
                    {/* Status Bar */}
                    <div className='flex items-center justify-between px-6 py-2 bg-gray-900 rounded-t-2xl'>
                      <div className='flex items-center gap-1'>
                        <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                        <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                        <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                      </div>
                      <div className='text-white text-xs font-medium'>9:41</div>
                      <div className='flex items-center gap-1'>
                        <div className='w-4 h-3 border border-white rounded-sm'></div>
                        <div className='w-6 h-2 bg-white rounded-sm'></div>
                      </div>
                    </div>
                    {/* Mobile Screen */}
                    <div className='bg-white rounded-b-2xl overflow-hidden'>
                      <div className='relative' style={{ height: '320px' }}>
                        <div dangerouslySetInnerHTML={{ __html: generateBannerHtmlFromContent(viewBanner.content, devicePreview, viewBanner.showTitle ?? true, viewBanner.showSubtitle ?? true, viewBanner.showButton ?? true, viewBanner.image_url || viewBanner.imageUrl) }} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='w-full flex justify-center' style={{ minHeight: 320 }}>
                  <div dangerouslySetInnerHTML={{ __html: generateBannerHtmlFromContent(viewBanner.content, devicePreview, viewBanner.showTitle ?? true, viewBanner.showSubtitle ?? true, viewBanner.showButton ?? true, viewBanner.image_url || viewBanner.imageUrl) }} />
                </div>
              )}
            </div>
            <h2 className='text-2xl font-extrabold text-gray-900 dark:text-white mb-2'>{viewBanner.name}</h2>
            <div className='flex items-center gap-2 mb-2'>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(viewBanner.status)}`}>{viewBanner.status}</span>
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-sm'><FiClock className='w-3.5 h-3.5 opacity-70' />{new Date(viewBanner.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 