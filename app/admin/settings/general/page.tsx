'use client'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  FiSettings,
  FiGlobe,
  FiShoppingBag,
  FiUpload,
  FiImage,
  FiDroplet,
  FiX,
  FiMinus,
} from 'react-icons/fi'
import { useEffect, useState, useRef } from 'react'
import { getSettings, updateMultipleSettings, updateSetting } from '@/lib/actions/settings'
import { toast, Toaster } from 'sonner'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Server, Cloud, RefreshCw } from 'lucide-react'
import useSettingStore from '@/hooks/use-setting-store'
import { getPlatformFromUrl, needsMigration } from '@/lib/utils/platform-utils'

export default function GeneralSettings() {
  const [settings, setSettings] = useState({
    siteTitle: '',
    description: '',
    keywords: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#8B5CF6',
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    logo: '',
    favicon: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  
  // Get current platform from Zustand store
  const platform = useSettingStore((state) => state.getPlatform())
  const zustandSetSettings = useSettingStore((state) => state.setSettings)
  const zustandUpdateSetting = useSettingStore((state) => state.updateSetting)

  // Migration function
  const migrateAssets = async () => {
    setIsMigrating(true)
    try {
      const response = await fetch('/api/upload/migrate-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPlatform: platform })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state with new URLs
        setSettings(prev => ({
          ...prev,
          logo: result.results.logo.url,
          favicon: result.results.favicon.url
        }))
        
        toast.success('Assets migrated successfully!', {
          description: `All assets are now stored on ${platform} platform`,
        })
      } else {
        toast.error('Migration failed', {
          description: result.message || 'Some assets failed to migrate'
        })
      }
    } catch (error) {
      console.error('Migration error:', error)
      toast.error('Migration failed', {
        description: 'An unexpected error occurred during migration'
      })
    } finally {
      setIsMigrating(false)
    }
  }

  // Temporary storage for new images before upload
  const [tempLogo, setTempLogo] = useState<File | null>(null)
  const [tempFavicon, setTempFavicon] = useState<File | null>(null)
  const [tempLogoPreview, setTempLogoPreview] = useState<string>('')
  const [tempFaviconPreview, setTempFaviconPreview] = useState<string>('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const generalSettings = await getSettings('general')
        const colorSettings = await getSettings('colors')
        const storeSettings = await getSettings('store')
        const brandingSettings = await getSettings('branding')
        
        const allSettings = {
          ...generalSettings,
          ...colorSettings,
          ...storeSettings,
          ...brandingSettings,
        }
        setSettings(prev => ({
          ...prev,
          ...allSettings,
        }))
        
        // Don't sync with Zustand store - let global provider handle this
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleLogoClick = () => {
    logoInputRef.current?.click()
  }

  const handleFaviconClick = () => {
    faviconInputRef.current?.click()
  }

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      const response = await fetch('/api/upload/platform-asset', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`)
      }
      
      const result = await response.json()
      
      // Update the settings with the new URL
      setSettings(prev => ({
        ...prev,
        [type]: result.url
      }))
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`)
    } catch (error) {
      console.error(`Error uploading ${type}:`, error)
      toast.error(`Failed to upload ${type}`)
    }
  }

  const handleRemoveImage = async (type: 'logo' | 'favicon') => {
    try {
      const currentUrl = settings[type]
      if (!currentUrl) return
      
      // Extract filename from URL
      const urlParts = currentUrl.split('/')
      const filename = urlParts[urlParts.length - 1]
      
      // Delete from current platform
      const response = await fetch(`/api/upload/platform-asset?url=${encodeURIComponent(currentUrl)}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        console.warn(`Failed to delete ${type} from blob storage`)
      }
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        [type]: ''
      }))
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully!`)
    } catch (error) {
      console.error(`Error removing ${type}:`, error)
      toast.error(`Failed to remove ${type}`)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setIsUploading(false)
    
    try {
      // Upload images first if there are new ones
      let logoUrl = settings.logo
      let faviconUrl = settings.favicon
      
      if (tempLogo) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', tempLogo)
        formData.append('type', 'logo')
        
        const response = await fetch('/api/upload/platform-asset', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Failed to upload logo')
        }
        
        const result = await response.json()
        logoUrl = result.url
        setIsUploading(false)
      }
      
      if (tempFavicon) {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', tempFavicon)
        formData.append('type', 'favicon')
        
        const response = await fetch('/api/upload/platform-asset', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error('Failed to upload favicon')
        }
        
        const result = await response.json()
        faviconUrl = result.url
        setIsUploading(false)
      }
      
      // Update settings with new image URLs
      const updatedSettings = {
        ...settings,
        logo: logoUrl,
        favicon: faviconUrl,
      }
      
      // Save settings using the original working function
      const result = await updateMultipleSettings({
        siteTitle: updatedSettings.siteTitle,
        description: updatedSettings.description,
        keywords: updatedSettings.keywords,
        primaryColor: updatedSettings.primaryColor,
        secondaryColor: updatedSettings.secondaryColor,
        accentColor: updatedSettings.accentColor,
        storeName: updatedSettings.storeName,
        storeEmail: updatedSettings.storeEmail,
        storePhone: updatedSettings.storePhone,
        storeAddress: updatedSettings.storeAddress,
        logo: updatedSettings.logo,
        favicon: updatedSettings.favicon,
      })

      if (result.success) {
        // Update local state
        setSettings(updatedSettings)
        
        // Don't update Zustand store - let global provider handle this
        
        // Clean up temporary files and previews
        if (tempLogo) {
          URL.revokeObjectURL(tempLogoPreview)
          setTempLogo(null)
          setTempLogoPreview('')
        }
        
        if (tempFavicon) {
          URL.revokeObjectURL(tempFaviconPreview)
          setTempFavicon(null)
          setTempFaviconPreview('')
        }
        
        // Clear file inputs
        if (logoInputRef.current) {
          logoInputRef.current.value = ''
        }
        if (faviconInputRef.current) {
          faviconInputRef.current.value = ''
        }
        
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
        const generalSettings = await getSettings('general')
        const colorSettings = await getSettings('colors')
        const storeSettings = await getSettings('store')
        const brandingSettings = await getSettings('branding')
        
        const allSettings = {
          ...generalSettings,
          ...colorSettings,
          ...storeSettings,
          ...brandingSettings,
        }
        setSettings(prev => ({
          ...prev,
          ...allSettings,
        }))
        
        // Don't update Zustand store - let global provider handle this
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
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                  <FiSettings className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    General Settings
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-lg font-medium'>
                    Configure your store&#39;s core settings and preferences
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || isUploading}
              className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading Images...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>

        {/* Premium Content Grid */}
        <div className='space-y-8'>
          {/* Branding Section */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center justify-between mb-8'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                    <FiSettings className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <div className='flex items-center gap-3 mb-1'>
                      <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Branding</h2>
                      <Badge className={`flex items-center gap-1 ${
                        platform === 'vercel' 
                          ? 'bg-blue-100 text-blue-700 border-blue-200' 
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {platform === 'vercel' ? (
                          <>
                            <Cloud className='w-3 h-3' />
                            Vercel Storage
                          </>
                        ) : (
                          <>
                            <Server className='w-3 h-3' />
                            Server Storage
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className='text-gray-600 dark:text-gray-300'>Upload your logo and favicon</p>
                  </div>
                </div>
                
                {/* Migration Button */}
                {(needsMigration(settings.logo, platform) || needsMigration(settings.favicon, platform)) && (
                  <Button
                    onClick={migrateAssets}
                    disabled={isMigrating}
                    variant="outline"
                    className="flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    {isMigrating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Migrating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Migrate Assets
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {/* Logo Upload */}
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-lg'>Store Logo</Label>
                    {settings.logo && (
                      <Badge variant="outline" className={`text-xs ${
                        getPlatformFromUrl(settings.logo) === 'vercel' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {getPlatformFromUrl(settings.logo) === 'vercel' ? (
                          <>
                            <Cloud className='w-3 h-3 mr-1' />
                            Vercel
                          </>
                        ) : (
                          <>
                            <Server className='w-3 h-3 mr-1' />
                            Server
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center space-x-6'>
                    <div 
                      onClick={handleLogoClick}
                      className='w-32 h-32 border-2 border-dashed border-[#00437f]/30 dark:border-[#00437f]/50 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 hover:from-[#00437f]/10 hover:to-[#00437f]/20 dark:hover:from-[#00437f]/20 dark:hover:to-[#00437f]/30 transition-all duration-300 cursor-pointer relative overflow-hidden group/upload hover:scale-105 hover:shadow-lg'
                    >
                      {(tempLogoPreview || settings.logo) ? (
                        <div className="relative w-full h-full">
                          <img
                            src={tempLogoPreview || settings.logo}
                            alt="Store Logo"
                            className="w-full h-full object-contain p-2"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setTempLogo(null)
                              setTempLogoPreview('')
                              setSettings(prev => ({ ...prev, logo: '' }))
                              if (logoInputRef.current) {
                                logoInputRef.current.value = ''
                              }
                            }}
                            className="absolute -top-1 -right-1 text-red-500 hover:text-red-600"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className='text-center group-hover/upload:scale-110 transition-transform duration-300'>
                          <FiUpload className='mx-auto h-8 w-8 text-[#00437f] group-hover/upload:text-[#003366] transition-colors duration-300' />
                          <span className='mt-2 block text-sm text-[#00437f] font-medium group-hover/upload:text-[#003366] transition-colors duration-300'>
                            Upload Logo
                          </span>
                        </div>
                      )}
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Recommended size: 200x200px. Max file size: 2MB
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Validate file size
                        const maxSize = 2 * 1024 * 1024 // 2MB for logo
                        if (file.size > maxSize) {
                          toast.error('Logo size should be less than 2MB')
                          return
                        }

                        // Validate file type
                        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                        if (!allowedTypes.includes(file.type)) {
                          toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
                          return
                        }

                        // Store file temporarily and create preview
                        setTempLogo(file)
                        const tempUrl = URL.createObjectURL(file)
                        setTempLogoPreview(tempUrl)
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Favicon Upload */}
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-lg'>Favicon</Label>
                    {settings.favicon && (
                      <Badge variant="outline" className={`text-xs ${
                        getPlatformFromUrl(settings.favicon) === 'vercel' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {getPlatformFromUrl(settings.favicon) === 'vercel' ? (
                          <>
                            <Cloud className='w-3 h-3 mr-1' />
                            Vercel
                          </>
                        ) : (
                          <>
                            <Server className='w-3 h-3 mr-1' />
                            Server
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                  <div className='flex items-center space-x-6'>
                    <div 
                      onClick={handleFaviconClick}
                      className='w-16 h-16 border-2 border-dashed border-[#00437f]/30 dark:border-[#00437f]/50 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#00437f]/5 to-[#00437f]/10 dark:from-[#00437f]/10 dark:to-[#00437f]/20 hover:from-[#00437f]/10 hover:to-[#00437f]/20 dark:hover:from-[#00437f]/20 dark:hover:to-[#00437f]/30 transition-all duration-300 cursor-pointer relative overflow-hidden group/upload hover:scale-105 hover:shadow-lg'
                    >
                      {(tempFaviconPreview || settings.favicon) ? (
                        <div className="relative w-full h-full">
                          <img
                            src={tempFaviconPreview || settings.favicon}
                            alt="Favicon"
                            className="w-full h-full object-contain p-1"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setTempFavicon(null)
                              setTempFaviconPreview('')
                              setSettings(prev => ({ ...prev, favicon: '' }))
                              if (faviconInputRef.current) {
                                faviconInputRef.current.value = ''
                              }
                            }}
                            className="absolute -top-1 -right-1 text-red-500 hover:text-red-600"
                          >
                            <FiX className="w-2 h-2" />
                          </button>
                        </div>
                      ) : (
                        <div className='text-center group-hover/upload:scale-110 transition-transform duration-300'>
                          <FiUpload className='mx-auto h-6 w-6 text-[#00437f] group-hover/upload:text-[#003366] transition-colors duration-300' />
                          <span className='mt-1 block text-xs text-[#00437f] font-medium group-hover/upload:text-[#003366] transition-colors duration-300'>
                            Upload Favicon
                          </span>
                        </div>
                      )}
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Recommended size: 32x32px. Max file size: 1MB
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={faviconInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Validate file size
                        const maxSize = 1 * 1024 * 1024 // 1MB for favicon
                        if (file.size > maxSize) {
                          toast.error('Favicon size should be less than 1MB')
                          return
                        }

                        // Validate file type
                        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                        if (!allowedTypes.includes(file.type)) {
                          toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
                          return
                        }

                        // Store file temporarily and create preview
                        setTempFavicon(file)
                        const tempUrl = URL.createObjectURL(file)
                        setTempFaviconPreview(tempUrl)
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Site Information */}
          <div className='relative group'>
            <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
            <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                  <FiGlobe className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Site Information</h2>
                  <p className='text-gray-600 dark:text-gray-300'>Configure your site metadata</p>
                </div>
              </div>
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <Label className='text-lg'>Site Title</Label>
                  <Input
                    value={settings.siteTitle}
                    onChange={(e) =>
                      setSettings({ ...settings, siteTitle: e.target.value })
                    }
                    placeholder='Enter your site title'
                    className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300 hover:border-[#00437f]/50'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-lg'>Meta Description</Label>
                  <textarea
                    value={settings.description}
                    onChange={(e) =>
                      setSettings({ ...settings, description: e.target.value })
                    }
                    rows={3}
                    placeholder='Enter your site description'
                    className='w-full rounded-xl bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 p-3 text-base transition-all duration-300 hover:border-[#00437f]/50'
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-lg'>Keywords</Label>
                  <Input
                    value={settings.keywords}
                    onChange={(e) =>
                      setSettings({ ...settings, keywords: e.target.value })
                    }
                    placeholder='Enter keywords separated by commas'
                    className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300 hover:border-[#00437f]/50'
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Color Settings */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
            <div className='flex items-center gap-4 mb-8'>
              <div className='w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                <FiDroplet className='w-6 h-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Color Settings</h2>
                <p className='text-gray-600 dark:text-gray-300'>Customize your brand colors</p>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='space-y-2'>
                <Label className='text-lg'>Primary Color</Label>
                <div className='flex items-center gap-2'>
                  <input
                    type='color'
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                    className='h-12 w-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform duration-300 shadow-lg'
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryColor: e.target.value })
                    }
                    className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300 hover:border-[#00437f]/50'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label className='text-lg'>Secondary Color</Label>
                <div className='flex items-center gap-2'>
                  <input
                    type='color'
                    value={settings.secondaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, secondaryColor: e.target.value })
                    }
                    className='h-12 w-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform duration-300 shadow-lg'
                  />
                  <Input
                    value={settings.secondaryColor}
                    onChange={(e) =>
                      setSettings({ ...settings, secondaryColor: e.target.value })
                    }
                    className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300 hover:border-[#00437f]/50'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label className='text-lg'>Accent Color</Label>
                <div className='flex items-center gap-2'>
                  <input
                    type='color'
                    value={settings.accentColor}
                    onChange={(e) =>
                      setSettings({ ...settings, accentColor: e.target.value })
                    }
                    className='h-12 w-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:scale-110 transition-transform duration-300 shadow-lg'
                  />
                  <Input
                    value={settings.accentColor}
                    onChange={(e) =>
                      setSettings({ ...settings, accentColor: e.target.value })
                    }
                    className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300 hover:border-[#00437f]/50'
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Store Information */}
        <div className='relative group'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
          <Card className='relative p-8 border border-white/20 dark:border-gray-700/50 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
            <div className='flex items-center gap-4 mb-8'>
              <div className='w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg'>
                <FiShoppingBag className='w-6 h-6 text-white' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Store Information</h2>
                <p className='text-gray-600 dark:text-gray-300'>Manage your store details</p>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <Label className='text-lg'>Store Name</Label>
                <Input
                  value={settings.storeName}
                  onChange={(e) =>
                    setSettings({ ...settings, storeName: e.target.value })
                  }
                  placeholder='Enter store name'
                  className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300 hover:border-[#00437f]/50'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-lg'>Store Email</Label>
                <Input
                  type='email'
                  value={settings.storeEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, storeEmail: e.target.value })
                  }
                  placeholder='store@example.com'
                  className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300 hover:border-[#00437f]/50'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-lg'>Phone Number</Label>
                <Input
                  type='tel'
                  value={settings.storePhone}
                  onChange={(e) =>
                    setSettings({ ...settings, storePhone: e.target.value })
                  }
                  placeholder='+1 (555) 000-0000'
                  className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300 hover:border-[#00437f]/50'
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-lg'>Store Address</Label>
                <Input
                  value={settings.storeAddress}
                  onChange={(e) =>
                    setSettings({ ...settings, storeAddress: e.target.value })
                  }
                  placeholder='Enter store address'
                  className='h-12 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl transition-all duration-300 hover:border-[#00437f]/50'
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
