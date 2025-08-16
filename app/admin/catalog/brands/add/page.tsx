'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiUpload, FiSave, FiX, FiAward, FiSettings, FiImage, FiGlobe, FiTag } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { createBrand } from '@/lib/actions/brands'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function AddBrandPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    description: '',
    urlHandle: '',
    logo: '',
    showOnCategory: false,
    showOnProduct: false,
    status: 'active',
  })

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

      let logoUrl = ''
      
      // If we have a selected file, upload the logo first
      if (selectedFile) {
        try {
          // Generate unique brand name with random number
          const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000) // 10 digit random number
          const uniqueBrandName = `${formData.name}_${randomNumber}`

          // Upload new logo using platform service
          const uploadFormData = new FormData()
          uploadFormData.append('file', selectedFile)
          uploadFormData.append('brandId', '0') // Temporary ID since brand doesn't exist yet
          uploadFormData.append('brandName', uniqueBrandName)

          const uploadResponse = await fetch('/api/upload/brand-platform-asset', {
            method: 'POST',
            body: uploadFormData,
          })

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json()
            console.error('Logo upload failed:', uploadError)
            toast({
              title: 'Warning',
              description: 'Logo upload failed. Creating brand without logo.',
              variant: 'default',
            })
          } else {
            const uploadData = await uploadResponse.json()
            console.log('Logo uploaded successfully:', uploadData.url)
            logoUrl = uploadData.url
          }
        } catch (uploadError) {
          console.error('Error uploading logo:', uploadError)
          toast({
            title: 'Warning',
            description: 'Logo upload failed. Creating brand without logo.',
            variant: 'default',
          })
        }
      }

      // Create the brand record with logo URL (if available)
      const brandData = {
        ...formData,
        logo: logoUrl
      }
      
      const response = await createBrand(brandData)
      
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Brand created successfully',
        })
        router.push('/admin/catalog/brands')
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create brand',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating brand:', error)
      toast({
        title: 'Error',
        description: 'Failed to create brand',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({ ...prev, name }))
    
    // Generate URL handle from name
    const urlHandle = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    setFormData((prev) => ({ ...prev, urlHandle }))
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'File size must be less than 5MB',
          variant: 'destructive',
        })
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select an image file',
          variant: 'destructive',
        })
        return
      }

      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      {/* Premium Header */}
      <div className='sticky top-0 z-10'>
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-b-2xl blur-2xl'></div>
          <div className='relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 shadow-lg'>
            <div className='max-w-[1600px] mx-auto px-6'>
              <div className='flex items-center justify-between h-16'>
                <div className='flex items-center gap-4'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => router.back()}
                    className='hover:bg-gray-100'
                  >
                    <FiArrowLeft className='h-5 w-5' />
                  </Button>
                  <div>
                    <h1 className='text-xl font-semibold text-gray-900'>
                      Add Brand
                    </h1>
                    <p className='text-sm text-gray-500'>
                      Create a new product brand
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => router.back()}
                    className='h-9 px-4 bg-white/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-white/80 dark:hover:bg-gray-600/80 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-md transition-all duration-200'
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    disabled={isSaving}
                    className='h-9 px-4 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200'
                    onClick={handleSubmit}
                  >
                    <FiSave className='h-4 w-4 mr-2' />
                    {isSaving ? (selectedFile ? 'Saving & Uploading...' : 'Saving...') : 'Create Brand'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-[1600px] mx-auto px-6 py-6'>
        <div className='grid grid-cols-12 gap-6'>
          {/* Main Information Card */}
          <div className='col-span-12 lg:col-span-8'>
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
                <div className='space-y-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                      <FiAward className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Basic Information</h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>Brand name and details</p>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <label htmlFor='name' className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        Name
                      </label>
                      <Input
                        id='name'
                        value={formData.name}
                        onChange={handleNameChange}
                        placeholder='Enter brand name'
                        className='h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                      />
                    </div>

                    <div className='space-y-2'>
                      <label htmlFor='alias' className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        Alias
                      </label>
                      <Input
                        id='alias'
                        value={formData.alias}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, alias: e.target.value }))
                        }
                        placeholder='Enter display name'
                        className='h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <label htmlFor='description' className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      Description
                    </label>
                    <Textarea
                      id='description'
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder='Enter brand description'
                      rows={4}
                      className='resize-none h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                    />
                  </div>

                  <div className='space-y-2'>
                    <label htmlFor='urlHandle' className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                      URL Handle
                    </label>
                    <Input
                      id='urlHandle'
                      value={formData.urlHandle}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          urlHandle: e.target.value,
                        }))
                      }
                      placeholder='Enter URL handle'
                      className='h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                    />
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      This will be used in the brand URL: /brands/{formData.urlHandle || 'your-brand-name'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Display Settings Card */}
            <div className='relative group mt-6'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
                <div className='space-y-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                      <FiSettings className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Display Settings</h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>Control where this brand appears</p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50'>
                      <div className='space-y-1'>
                        <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                          Show on Category
                        </label>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Display this brand on category pages
                        </p>
                      </div>
                      <Switch
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

                    <div className='flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50'>
                      <div className='space-y-1'>
                        <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                          Show on Product
                        </label>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Display this brand on product pages
                        </p>
                      </div>
                      <Switch
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

          {/* Sidebar */}
          <div className='col-span-12 lg:col-span-4 space-y-6'>
            {/* Status Card */}
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                      <FiGlobe className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Status</h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>Brand visibility</p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50'>
                    <div className='space-y-1'>
                      <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        Brand Status
                      </label>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {formData.status === 'active' ? 'Brand is currently active' : 'Brand is currently inactive'}
                      </p>
                    </div>
                    <Switch
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

            {/* Brand Logo Card */}
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                      <FiImage className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Brand Logo</h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>Upload brand logo</p>
                    </div>
                  </div>

                  <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center bg-gray-50/50 dark:bg-gray-700/50 hover:border-[#00437f]/50 dark:hover:border-[#00437f]/50 transition-all duration-200'>
                    <input
                      type='file'
                      id='logo'
                      accept='image/*'
                      onChange={handleLogoSelect}
                      className='hidden'
                    />
                    <label
                      htmlFor='logo'
                      className='cursor-pointer flex flex-col items-center justify-center'
                    >
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt='Logo preview'
                          className='w-32 h-32 object-contain mb-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg'
                        />
                      ) : (
                        <div className='w-32 h-32 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-white/50 dark:bg-gray-600/50 hover:border-[#00437f]/50 dark:hover:border-[#00437f]/50 transition-all duration-200'>
                          <FiUpload className='w-8 h-8 text-gray-400 dark:text-gray-500' />
                        </div>
                      )}
                      <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        {selectedFile ? 'Logo selected' : 'Click to select logo'}
                      </span>
                      <span className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                        {selectedFile ? 'Will be uploaded when you save the brand' : 'PNG, JPG up to 5MB'}
                      </span>
                    </label>
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