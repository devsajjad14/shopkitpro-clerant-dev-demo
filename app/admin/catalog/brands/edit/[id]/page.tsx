'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiUpload, FiSave, FiX, FiEdit, FiSettings, FiImage, FiGlobe, FiTag } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { getBrand, updateBrand } from '@/lib/actions/brands'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Brand {
  id: number
  name: string
  alias: string
  description: string | null
  urlHandle: string
  logo: string | null
  showOnCategory: boolean
  showOnProduct: boolean
  status: string
  createdAt: string
  updatedAt: string
}

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<Brand>({
    id: 0,
    name: '',
    alias: '',
    description: '',
    urlHandle: '',
    logo: '',
    showOnCategory: false,
    showOnProduct: false,
    status: 'active',
    createdAt: '',
    updatedAt: '',
  })

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const resolvedParams = await params
        const response = await getBrand(parseInt(resolvedParams.id))
        if (response.success && response.data) {
          setFormData({
            ...response.data,
            createdAt: response.data.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: response.data.updatedAt?.toISOString() || new Date().toISOString(),
          })
          if (response.data.logo) {
            setLogoPreview(response.data.logo)
          }
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch brand',
            variant: 'destructive',
          })
          router.push('/admin/catalog/brands')
        }
      } catch (error) {
        console.error('Error fetching brand:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch brand',
          variant: 'destructive',
        })
        router.push('/admin/catalog/brands')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrand()
  }, [params, router, toast])

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      if (!formData.name) {
        toast({
          title: 'Error',
          description: 'Please enter a brand name',
          variant: 'destructive',
        })
        return
      }

      let logoUrl = formData.logo || ''

      // If we have a selected file, upload the logo first
      if (selectedFile) {
        try {
          const uploadFormData = new FormData()
          uploadFormData.append('file', selectedFile)
          uploadFormData.append('brandId', formData.id.toString())
          uploadFormData.append('brandName', formData.name)

          const uploadResponse = await fetch('/api/upload/brand-platform-asset', {
            method: 'POST',
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            throw new Error(errorData.error || 'Logo upload failed')
          }

          const uploadData = await uploadResponse.json()
          logoUrl = uploadData.url
          console.log('Logo uploaded successfully:', logoUrl)
        } catch (uploadError) {
          console.error('Error uploading logo:', uploadError)
          toast({
            title: 'Error',
            description: uploadError instanceof Error ? uploadError.message : 'Failed to upload logo',
            variant: 'destructive',
          })
          return
        }
      }

      // Update the brand with the logo URL (new or existing)
      // If we uploaded a new file, we need to cleanup the old logo
      const response = await updateBrand(formData.id, {
        name: formData.name,
        alias: formData.alias,
        description: formData.description || '',
        urlHandle: formData.urlHandle,
        logo: logoUrl,
        showOnCategory: formData.showOnCategory,
        showOnProduct: formData.showOnProduct,
        status: formData.status,
      }, { cleanupOldLogo: !!selectedFile })

      if (response.success) {
        toast({
          title: 'Success',
          description: selectedFile ? 'Brand updated and logo uploaded successfully' : 'Brand updated successfully',
        })
        router.push('/admin/catalog/brands')
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update brand',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating brand:', error)
      toast({
        title: 'Error',
        description: 'Failed to update brand',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      alias: name,
      urlHandle: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    }))
  }

  const handleLogoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Please upload an image file',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size should be less than 5MB',
        variant: 'destructive',
      })
      return
    }

    // Just set the selected file and preview
    setSelectedFile(file)
    setLogoPreview(URL.createObjectURL(file))
    
    toast({
      title: 'Logo Selected',
      description: 'Logo will be uploaded when you save the brand',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/20 via-transparent to-[#00437f]/20 rounded-full blur-xl"></div>
            <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-[#00437f]/20 border-t-[#00437f]"></div>
          </div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading brand...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => router.back()}
                  className='h-10 w-10 bg-gradient-to-br from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl'
                >
                  <FiArrowLeft className='h-5 w-5' />
                </Button>
                <div>
                  <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>Edit Brand</h1>
                  <p className='text-lg font-medium text-gray-600 dark:text-gray-300'>Update brand information</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-11 px-8 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-[#00437f]/10 hover:text-[#00437f] hover:border-[#00437f]/40 rounded-xl'
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  size='sm'
                  disabled={isSaving}
                  className='h-11 px-10 text-sm font-medium bg-gradient-to-r from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl'
                  onClick={handleSubmit}
                >
                  {isSaving ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                      <span>{selectedFile ? 'Saving & Uploading...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <FiSave className='h-4 w-4' />
                      {selectedFile ? 'Save & Upload Logo' : 'Save Changes'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-12 gap-6'>
          {/* Left Column - Main Brand Details */}
          <div className='col-span-12 lg:col-span-8 space-y-6'>
            {/* Basic Information */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                      <FiEdit className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Brand name and details</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Brand Name *
                        </label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={handleNameChange}
                          placeholder="Enter brand name"
                          className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          The main brand name
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Display Name
                        </label>
                        <Input
                          id="alias"
                          value={formData.alias}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, alias: e.target.value }))
                          }
                          placeholder="Enter display name"
                          className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Alternative display name
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter brand description"
                        rows={4}
                        className="px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200 resize-none"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Detailed description of the brand
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        URL Handle
                      </label>
                      <Input
                        id="urlHandle"
                        value={formData.urlHandle}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            urlHandle: e.target.value,
                          }))
                        }
                        placeholder="Enter URL handle"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        URL-friendly version of the brand name
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Display Settings */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                      <FiGlobe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Display Settings</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Control where the brand appears</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="space-y-0.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Show on Category Pages
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Display this brand on category pages
                        </p>
                      </div>
                      <Switch
                        id="showOnCategory"
                        checked={formData.showOnCategory}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            showOnCategory: e.target.checked,
                          }))
                        }
                        className="data-[state=checked]:bg-[#00437f] data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                      <div className="space-y-0.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Show on Product Pages
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Display this brand on product pages
                        </p>
                      </div>
                      <Switch
                        id="showOnProduct"
                        checked={formData.showOnProduct}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            showOnProduct: e.target.checked,
                          }))
                        }
                        className="data-[state=checked]:bg-[#00437f] data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - Settings & Logo */}
          <div className='col-span-12 lg:col-span-4 space-y-6'>
            {/* Status Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                      <FiSettings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Status</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Brand visibility settings</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                    <div className="space-y-0.5">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Active Status
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.status === 'active'
                          ? 'This brand is currently active and visible to customers.'
                          : 'This brand is currently inactive and hidden from customers.'}
                      </p>
                    </div>
                    <Switch
                      id="status"
                      checked={formData.status === 'active'}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.checked ? 'active' : 'inactive',
                        }))
                      }
                      className="data-[state=checked]:bg-[#00437f] data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-600"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Logo Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                      <FiImage className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Brand Logo</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Upload brand logo</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="logo-upload"
                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-colors duration-200"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {logoPreview ? (
                            <div className="relative group">
                              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-white shadow-md">
                                <img
                                  src={logoPreview}
                                  alt={formData.name}
                                  className="w-full h-full object-contain p-2"
                                />
                              </div>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    setLogoPreview(null)
                                    setFormData((prev) => ({ ...prev, logo: '' }))
                                  }}
                                  className="p-2 bg-white/90 text-red-500 rounded-full hover:bg-white transition-colors duration-200"
                                >
                                  <FiX className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-4">
                                <FiUpload className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                                <span className="font-semibold">Click to select logo</span>
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PNG, JPG or GIF (MAX. 5MB)
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          id="logo-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleLogoSelection}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      {selectedFile 
                        ? 'Logo selected - will be uploaded when you save the brand' 
                        : 'Recommended size: 800x800 pixels. Maximum file size: 5MB'
                      }
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 