'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiUpload, FiX, FiCheck, FiLoader } from 'react-icons/fi'
import { useToast } from '@/components/ui/use-toast'

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')
}

export default function CreateBrandPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [alias, setAlias] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null)
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null)
  const [touched, setTouched] = useState<{ name?: boolean; alias?: boolean; url?: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState<'active' | 'draft'>('active')
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [brandId, setBrandId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if we're in edit mode and fetch brand data
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setIsEditMode(true)
      setBrandId(parseInt(id))
      fetchBrand(parseInt(id))
    }
  }, [searchParams])

  // Fetch brand data for editing
  const fetchBrand = async (id: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/brands/${id}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const brand = result.data
        setName(brand.name)
        setAlias(brand.alias)
        setUrl(brand.urlHandle)
        setDescription(brand.description || '')
        setStatus(brand.status)
        if (brand.logo) {
          setLogoUrl(brand.logo)
          setLogoPreview(brand.logo)
          setExistingLogoUrl(brand.logo) // Track existing logo for cleanup
        }
        setTouched({ name: true, alias: true, url: true })
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch brand data',
          variant: 'destructive',
        })
        router.push('/custom-cms/brand-logos')
      }
    } catch (error) {
      console.error('Error fetching brand:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch brand data',
        variant: 'destructive',
      })
      router.push('/custom-cms/brand-logos')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-fill alias and url from name
  const handleNameChange = (val: string) => {
    setName(val)
    // Always update alias and URL when name changes in edit mode
    // This allows users to change the name and have alias/URL update accordingly
    if (isEditMode) {
      setAlias(val)
      setUrl(slugify(val))
      // Reset touched state to show auto-generated indicators
      setTouched(prev => ({ ...prev, alias: false, url: false }))
    } else {
      // In create mode, only update if not manually touched
      if (!touched.alias) {
        setAlias(val)
      }
    if (!touched.url) setUrl(slugify(val))
    }
  }

  const handleAliasChange = (val: string) => {
    setAlias(val)
    setTouched(t => ({ ...t, alias: true }))
  }
  const handleUrlChange = (val: string) => {
    setUrl(val)
    setTouched(t => ({ ...t, url: true }))
  }

  // Logo upload logic
  const handleLogoChange = async (file: File | null) => {
    setLogo(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = e => setLogoPreview(e.target?.result as string)
      reader.readAsDataURL(file)
      
      // Store the file for deferred upload
      setSelectedLogo(file)
      
      // If we're in edit mode and there's an existing logo, track it for cleanup
      if (isEditMode && logoUrl) {
        setExistingLogoUrl(logoUrl)
      }
      
      // Clear the logo URL as we'll upload new image
      setLogoUrl(null)
    } else {
      setLogoPreview(null)
      setLogoUrl(null)
      setSelectedLogo(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoChange(e.dataTransfer.files[0])
    }
  }

  const handleRemoveLogo = () => {
    setLogo(null)
    setLogoPreview(null)
    setLogoUrl(null)
    setSelectedLogo(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Upload logo to server
  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/brand-logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload logo')
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload logo',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValid || isSubmitting) return

    try {
      setIsSubmitting(true)

      // Handle logo upload if we have a selected file
      let finalLogoUrl = logoUrl
      
      if (selectedLogo) {
        try {
          // Generate unique brand name with random number
          const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000) // 10 digit random number
          const uniqueBrandName = `${name}_${randomNumber}`
          
          // Note: Existing logo cleanup is now handled by brand actions

          // Upload new logo
          const uploadFormData = new FormData()
          uploadFormData.append('file', selectedLogo)
          uploadFormData.append('brandId', brandId ? brandId.toString() : 'new')
          uploadFormData.append('brandName', uniqueBrandName)

          const uploadResponse = await fetch('/api/upload/brand-logo', {
            method: 'POST',
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json()
            console.error('Brand logo upload failed:', uploadError)
            toast({
              title: 'Warning',
              description: `Brand ${isEditMode ? 'updated' : 'created'} but logo upload failed: ${uploadError.error || uploadError.details || 'Unknown error'}. You can update the logo later.`,
              variant: 'default',
            })
          } else {
            const uploadData = await uploadResponse.json()
            console.log('Brand logo uploaded successfully:', uploadData.url)
            finalLogoUrl = uploadData.url
          }
        } catch (uploadError) {
          console.error('Error during brand logo upload:', uploadError)
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error'
          toast({
            title: 'Warning',
            description: `Brand ${isEditMode ? 'updated' : 'created'} but logo upload failed: ${errorMessage}. You can update the logo later.`,
            variant: 'default',
          })
        }
      }

      const brandData = {
        name: name.trim(),
        alias: alias.trim(),
        description: description.trim() || null,
        urlHandle: url.trim(),
        logo: finalLogoUrl,
        showOnCategory: true,
        showOnProduct: true,
        status: status
      }

      // Create or update brand
      const apiUrl = isEditMode ? `/api/brands/${brandId}` : '/api/brands'
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Failed to ${isEditMode ? 'update' : 'create'} brand`)
      }

      const result = await response.json()

      toast({
        title: 'Success!',
        description: `Brand ${isEditMode ? 'updated' : 'created'} successfully`,
      })

      // Redirect to brands list
      router.push('/custom-cms/brand-logos')
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} brand:`, error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} brand`,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = name.trim() && alias.trim() && url.trim() && (logo || logoUrl) && !isUploading

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 backdrop-blur-md flex flex-col items-center justify-center"
        >
          <FiLoader className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading brand data...</p>
        </motion.div>
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 backdrop-blur-md"
      >
        <div className="flex items-center gap-3 mb-8">
          <button
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-700 transition-all"
            onClick={() => router.back()}
            aria-label="Back"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isEditMode ? 'Edit Brand' : 'Create Brand'}
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Brand Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Brand Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, name: true }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
              placeholder="e.g. Nike"
              required
            />
          </div>
          {/* Alias */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Alias <span className="text-red-500">*</span>
              {!touched.alias && name && (
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                  Auto-generated
                </span>
              )}
            </label>
            <input
              type="text"
              value={alias}
              onChange={e => handleAliasChange(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, alias: true }))}
              className={`w-full px-4 py-2 rounded-lg border transition-all placeholder:text-gray-400 ${
                !touched.alias && name 
                  ? 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder="e.g. Nike"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {!touched.alias && name 
                ? 'Auto-generated from brand name. Click to edit manually.'
                : 'This will be used as the brand\'s display name.'
              }
            </p>
          </div>
          {/* URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
              Brand URL <span className="text-red-500">*</span>
              {!touched.url && name && (
                <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                  Auto-generated
                </span>
              )}
            </label>
            <input
              type="text"
              value={url}
              onChange={e => handleUrlChange(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, url: true }))}
              className={`w-full px-4 py-2 rounded-lg border transition-all placeholder:text-gray-400 ${
                !touched.url && name 
                  ? 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              }`}
              placeholder="e.g. my-test-brand"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              {!touched.url && name 
                ? 'Auto-generated from brand name. Click to edit manually.'
                : 'Auto-filled from name, but you can edit it. (e.g. my-test-brand)'
              }
            </p>
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 resize-none"
              placeholder="Enter brand description (optional)"
              rows={3}
            />
            <p className="text-xs text-gray-400 mt-1">Optional description for the brand.</p>
          </div>
          {/* Logo Uploader */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Brand Logo <span className="text-red-500">*</span></label>
            <div
              className="relative flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-100/60 dark:hover:bg-blue-900/20 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              tabIndex={0}
              role="button"
              aria-label="Upload brand logo"
            >
              {logoPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={logoPreview} alt="Logo preview" className="w-20 h-20 object-contain rounded-lg shadow" />
                  {isUploading && (
                    <div className="flex items-center gap-2 text-blue-600 text-xs">
                      <FiLoader className="w-3 h-3 animate-spin" />
                      Uploading...
                    </div>
                  )}
                  <button
                    type="button"
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-700 text-xs font-semibold mt-2 transition-all"
                    onClick={e => { e.stopPropagation(); handleRemoveLogo(); }}
                    disabled={isUploading}
                  >
                    <FiX className="w-4 h-4" /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FiUpload className="w-8 h-8 text-blue-400 group-hover:text-blue-600 transition-all" />
                  <span className="text-sm text-gray-500 dark:text-gray-300">Drag & drop or click to upload logo</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) handleLogoChange(e.target.files[0])
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Recommended: transparent PNG or SVG, square, max 1MB.</p>
          </div>
          {/* Status Toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Brand Status</label>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {status === 'active' ? 'Active' : 'Draft'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {status === 'active' 
                      ? 'Brand will be visible to customers' 
                      : 'Brand will be hidden from customers'
                    }
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatus(status === 'active' ? 'draft' : 'active')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  status === 'active' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    status === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {status === 'active' 
                ? 'Active brands will appear on your website' 
                : 'Draft brands are saved but not visible to customers'
              }
            </p>
          </div>
          {/* Submit Button */}
          <div className="flex items-center justify-between mt-8 gap-4">
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-all"
              onClick={() => router.back()}
            >
              <FiArrowLeft className="w-4 h-4" /> Cancel
            </button>
            <motion.button
              type="submit"
              whileHover={isValid && !isSubmitting ? { scale: 1.04 } : {}}
              whileTap={isValid && !isSubmitting ? { scale: 0.97 } : {}}
              disabled={!isValid || isSubmitting}
              className={`flex items-center gap-2 px-7 py-2.5 rounded-lg font-bold text-white transition-all shadow-lg focus:ring-2 focus:ring-blue-400 ${
                isValid && !isSubmitting
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" /> {isEditMode 
                    ? selectedLogo ? 'Updating & Uploading...' : 'Updating...'
                    : selectedLogo ? 'Creating & Uploading...' : 'Creating...'
                  }
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" /> {isEditMode ? 'Update Brand' : 'Create Brand'}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
      )}
    </div>
  )
} 