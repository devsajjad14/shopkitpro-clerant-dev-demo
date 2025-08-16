'use client'

import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FiLayout, FiGrid, FiStar, FiPlus, FiMinus, FiTrendingDown, FiDroplet } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { getSettings, updateMultipleSettings } from '@/lib/actions/settings'
import { toast, Toaster } from 'sonner'
import CartAbandonmentToggle from '@/components/admin/CartAbandonmentToggle'

export default function ThemeSettings() {
  const defaultSettings = {
    mainBanners: 3,
    miniBanners: 3,
    featuredProducts: 8,
    brandLogos: 6,
    productsPerPage: 12,
    relatedProducts: 4,
    showCompanySection: false,
    showUpsellProducts: true,
    showSocialSharing: true,
    showReviews: true,
    showStockStatus: true,
    defaultViewMode: 'grid',
    enableFilters: true
  }

  const [settings, setSettings] = useState<Record<string, string | number | boolean>>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const themeSettings = await getSettings('theme')
        // Merge default settings with loaded settings, ensuring all values are properly typed
        const mergedSettings = {
          ...defaultSettings,
          ...themeSettings,
          // Ensure numeric values are properly converted
          mainBanners: Number(themeSettings.mainBanners || defaultSettings.mainBanners),
          miniBanners: Number(themeSettings.miniBanners || defaultSettings.miniBanners),
          featuredProducts: Number(themeSettings.featuredProducts || defaultSettings.featuredProducts),
          brandLogos: Number(themeSettings.brandLogos || defaultSettings.brandLogos),
          productsPerPage: Number(themeSettings.productsPerPage || defaultSettings.productsPerPage),
          relatedProducts: Number(themeSettings.relatedProducts || defaultSettings.relatedProducts),
          // Ensure boolean values are properly converted
          showCompanySection: Boolean(themeSettings.showCompanySection ?? defaultSettings.showCompanySection),
          showUpsellProducts: Boolean(themeSettings.showUpsellProducts ?? defaultSettings.showUpsellProducts),
          showSocialSharing: Boolean(themeSettings.showSocialSharing ?? defaultSettings.showSocialSharing),
          showReviews: Boolean(themeSettings.showReviews ?? defaultSettings.showReviews),
          showStockStatus: Boolean(themeSettings.showStockStatus ?? defaultSettings.showStockStatus),
          enableFilters: Boolean(themeSettings.enableFilters ?? defaultSettings.enableFilters),
          // Ensure string values are properly set
          defaultViewMode: themeSettings.defaultViewMode || defaultSettings.defaultViewMode
        }
        setSettings(mergedSettings)
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load settings')
        // If loading fails, use default settings
        setSettings(defaultSettings)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (key: string, value: string | number | boolean) => {
    // Ensure numeric values are properly handled
    if (typeof value === 'number') {
      setSettings(prev => ({ ...prev, [key]: value }))
    } else {
      setSettings(prev => ({ ...prev, [key]: value }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Convert all values to their proper types before saving
      const settingsToSave = {
        ...settings,
        mainBanners: Number(settings.mainBanners),
        miniBanners: Number(settings.miniBanners),
        featuredProducts: Number(settings.featuredProducts),
        brandLogos: Number(settings.brandLogos),
        productsPerPage: Number(settings.productsPerPage),
        relatedProducts: Number(settings.relatedProducts),
        showCompanySection: Boolean(settings.showCompanySection),
        showUpsellProducts: Boolean(settings.showUpsellProducts),
        showSocialSharing: Boolean(settings.showSocialSharing),
        showReviews: Boolean(settings.showReviews),
        showStockStatus: Boolean(settings.showStockStatus),
        enableFilters: Boolean(settings.enableFilters),
        defaultViewMode: String(settings.defaultViewMode)
      }

      const result = await updateMultipleSettings(settingsToSave)
      if (result.success) {
        toast.success('Settings saved successfully', {
          description: 'Your changes have been saved and will be reflected immediately.',
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: 'white',
            border: 'none',
          },
        })
        
        // Reload settings after successful save
        const themeSettings = await getSettings('theme')
        
        // Merge with default settings to ensure all values are present
        const mergedSettings = {
          ...defaultSettings,
          ...themeSettings,
          // Ensure numeric values are properly converted
          mainBanners: Number(themeSettings.mainBanners || defaultSettings.mainBanners),
          miniBanners: Number(themeSettings.miniBanners || defaultSettings.miniBanners),
          featuredProducts: Number(themeSettings.featuredProducts || defaultSettings.featuredProducts),
          brandLogos: Number(themeSettings.brandLogos || defaultSettings.brandLogos),
          productsPerPage: Number(themeSettings.productsPerPage || defaultSettings.productsPerPage),
          relatedProducts: Number(themeSettings.relatedProducts || defaultSettings.relatedProducts),
          // Ensure boolean values are properly converted
          showCompanySection: Boolean(themeSettings.showCompanySection ?? defaultSettings.showCompanySection),
          showUpsellProducts: Boolean(themeSettings.showUpsellProducts ?? defaultSettings.showUpsellProducts),
          showSocialSharing: Boolean(themeSettings.showSocialSharing ?? defaultSettings.showSocialSharing),
          showReviews: Boolean(themeSettings.showReviews ?? defaultSettings.showReviews),
          showStockStatus: Boolean(themeSettings.showStockStatus ?? defaultSettings.showStockStatus),
          enableFilters: Boolean(themeSettings.enableFilters ?? defaultSettings.enableFilters),
          // Ensure string values are properly set
          defaultViewMode: themeSettings.defaultViewMode || defaultSettings.defaultViewMode
        }
        
        setSettings(mergedSettings)
      } else {
        toast.error('Failed to save settings', {
          description: result.error || 'There was an error saving your changes. Please try again.',
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: 'white',
            border: 'none',
          },
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings', {
        description: 'An unexpected error occurred. Please try again later.',
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: 'white',
          border: 'none',
        },
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00437f]"></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <Toaster position="top-right" richColors />
      <div className='max-w-7xl mx-auto p-8 space-y-10'>
        {/* Premium Header */}
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl'></div>
          <div className='relative flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl'>
            <div className='space-y-3'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                  <FiDroplet className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Theme Settings
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-lg font-medium'>
                    Customize your store's appearance and behavior
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>

        {/* Premium Content Grid */}
        <div className='space-y-8'>
          {/* Homepage Layout Section */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                  <FiLayout className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Homepage Layout</h2>
                  <p className='text-gray-600 dark:text-gray-300'>Configure your homepage appearance</p>
                </div>
              </div>
              <div className='space-y-6'>
                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Main Banners</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Number of main banner slides to display
                    </p>
                  </div>
                  <div className='flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 backdrop-blur-sm'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('mainBanners', Math.max(1, Number(settings.mainBanners) - 1))}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiMinus className='h-4 w-4' />
                    </Button>
                    <span className='w-12 text-center font-bold text-[#00437f] text-lg'>
                      {settings.mainBanners}
                    </span>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('mainBanners', Number(settings.mainBanners) + 1)}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiPlus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Mini Banners</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Number of mini promotional banners
                    </p>
                  </div>
                  <div className='flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 backdrop-blur-sm'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('miniBanners', Math.max(1, Number(settings.miniBanners) - 1))}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiMinus className='h-4 w-4' />
                    </Button>
                    <span className='w-12 text-center font-bold text-[#00437f] text-lg'>
                      {settings.miniBanners}
                    </span>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('miniBanners', Number(settings.miniBanners) + 1)}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiPlus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Our Company Section</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Display company information section
                    </p>
                  </div>
                  <Switch 
                    checked={!!settings.showCompanySection}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('showCompanySection', e.target.checked)}
                    className="data-[state=checked]:bg-[#00437f] data-[state=unchecked]:bg-gray-200"
                  />
                </div>

                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Featured Products</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Number of featured products to display
                    </p>
                  </div>
                  <div className='flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 backdrop-blur-sm'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('featuredProducts', Math.max(1, Number(settings.featuredProducts) - 1))}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiMinus className='h-4 w-4' />
                    </Button>
                    <span className='w-12 text-center font-bold text-[#00437f] text-lg'>
                      {settings.featuredProducts}
                    </span>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('featuredProducts', Number(settings.featuredProducts) + 1)}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiPlus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Brand Logos</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Number of brand logos to display
                    </p>
                  </div>
                  <div className='flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 backdrop-blur-sm'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('brandLogos', Math.max(1, Number(settings.brandLogos) - 1))}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiMinus className='h-4 w-4' />
                    </Button>
                    <span className='w-12 text-center font-bold text-[#00437f] text-lg'>
                      {settings.brandLogos}
                    </span>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('brandLogos', Number(settings.brandLogos) + 1)}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiPlus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Category Page Settings */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                  <FiGrid className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Category Page Settings</h2>
                  <p className='text-gray-600 dark:text-gray-300'>Configure product listing behavior</p>
                </div>
              </div>
              <div className='space-y-6'>
                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Products Per Page</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Number of products to display per page
                    </p>
                  </div>
                  <div className='flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 backdrop-blur-sm'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('productsPerPage', Math.max(1, Number(settings.productsPerPage) - 1))}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiMinus className='h-4 w-4' />
                    </Button>
                    <span className='w-12 text-center font-bold text-[#00437f] text-lg'>
                      {settings.productsPerPage}
                    </span>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('productsPerPage', Number(settings.productsPerPage) + 1)}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiPlus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Default View Mode</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Default sorting method for products
                    </p>
                  </div>
                  <div className='flex items-center gap-4 bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 backdrop-blur-sm'>
                    <Label className='text-gray-700 dark:text-gray-300 font-medium'>Grid</Label>
                    <Switch 
                      checked={settings.defaultViewMode === 'grid'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('defaultViewMode', e.target.checked ? 'grid' : 'list')}
                      className="data-[state=checked]:bg-[#00437f] data-[state=unchecked]:bg-gray-200"
                    />
                    <Label className='text-gray-700 dark:text-gray-300 font-medium'>List</Label>
                  </div>
                </div>

                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Filter Settings</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Enable product filtering options
                    </p>
                  </div>
                  <Switch 
                    checked={!!settings.enableFilters}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('enableFilters', e.target.checked)}
                    className="data-[state=checked]:bg-[#00437f] data-[state=unchecked]:bg-gray-200"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Product Page Settings */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                  <FiStar className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Product Page Settings</h2>
                  <p className='text-gray-600 dark:text-gray-300'>Configure product page features</p>
                </div>
              </div>
              <div className='space-y-6'>
                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Related Products</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Number of related products to display
                    </p>
                  </div>
                  <div className='flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-xl p-2 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 backdrop-blur-sm'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('relatedProducts', Math.max(1, Number(settings.relatedProducts) - 1))}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiMinus className='h-4 w-4' />
                    </Button>
                    <span className='w-12 text-center font-bold text-[#00437f] text-lg'>
                      {settings.relatedProducts}
                    </span>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('relatedProducts', Number(settings.relatedProducts) + 1)}
                      className='h-8 w-8 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200'
                    >
                      <FiPlus className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Upsell/Cross-sell Products</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Display related product suggestions
                    </p>
                  </div>
                  <Switch 
                    checked={!!settings.showUpsellProducts}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('showUpsellProducts', e.target.checked)}
                    className="data-[state=checked]:bg-[#00437f] data-[state=unchecked]:bg-gray-200"
                  />
                </div>

                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Social Sharing Buttons</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Enable social media sharing options
                    </p>
                  </div>
                  <Switch 
                    checked={!!settings.showSocialSharing}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('showSocialSharing', e.target.checked)}
                    className="data-[state=checked]:bg-[#00437f] data-[state=unchecked]:bg-gray-200"
                  />
                </div>

                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Review System</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Allow customers to leave product reviews
                    </p>
                  </div>
                  <Switch 
                    checked={!!settings.showReviews}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('showReviews', e.target.checked)}
                    className="data-[state=checked]:bg-[#00437f] data-[state=unchecked]:bg-gray-200"
                  />
                </div>

                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Stock Visibility</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Show product stock status to customers
                    </p>
                  </div>
                  <Switch 
                    checked={!!settings.showStockStatus}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('showStockStatus', e.target.checked)}
                    className="data-[state=checked]:bg-[#00437f] data-[state=unchecked]:bg-gray-200"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Cart Abandonment Settings */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                  <FiTrendingDown className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Cart Abandonment</h2>
                  <p className='text-gray-600 dark:text-gray-300'>Recover lost sales and improve conversion</p>
                </div>
              </div>
              <div className='space-y-6'>
                <div className='flex items-center justify-between p-6 rounded-xl bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 border border-[#00437f]/20 dark:border-[#00437f]/30'>
                  <div className='space-y-2'>
                    <Label className='text-lg font-semibold text-gray-900 dark:text-white'>Cart Abandonment Tracking</Label>
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                      Track abandoned carts and recover lost sales
                    </p>
                  </div>
                  <CartAbandonmentToggle />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
