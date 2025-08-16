'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiPlus, FiTrash2, FiSave, FiX, FiTag, FiSettings, FiList, FiGlobe } from 'react-icons/fi'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { getAttributes, updateAttribute } from '@/lib/actions/attributes'
import { use } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AttributeFormData {
  name: string
  display: string
  values: string[]
  status: 'active' | 'draft' | 'archived'
  showOnCategory: 'yes' | 'no'
  showOnProduct: 'yes' | 'no'
}

export default function EditAttributePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<AttributeFormData>({
    name: '',
    display: '',
    values: [''],
    status: 'active',
    showOnCategory: 'yes',
    showOnProduct: 'yes',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  useEffect(() => {
    loadAttribute()
  }, [resolvedParams.id])

  const loadAttribute = async () => {
    setIsLoading(true)
    try {
      const attributes = await getAttributes()
      const attribute = attributes.find(attr => attr.id === resolvedParams.id)
      if (attribute) {
        setFormData({
          name: attribute.name,
          display: attribute.display,
          values: attribute.values.map(v => v.value),
          status: attribute.status as 'active' | 'draft' | 'archived',
          showOnCategory: attribute.showOnCategory ? 'yes' : 'no',
          showOnProduct: attribute.showOnProduct ? 'yes' : 'no',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Attribute not found',
          variant: 'destructive',
        })
        router.push('/admin/catalog/attributes')
      }
    } catch (error) {
      console.error('Error loading attribute:', error)
      toast({
        title: 'Error',
        description: 'Failed to load attribute',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'name') {
      // When name changes, also update display with the same value
      setFormData(prev => ({ 
        ...prev, 
        name: value,
        display: value // Update display with the same value
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...formData.values]
    newValues[index] = value
    setFormData(prev => ({ ...prev, values: newValues }))
  }

  const addValue = () => {
    setFormData(prev => ({ ...prev, values: [...prev.values, ''] }))
  }

  const removeValue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await updateAttribute(resolvedParams.id, {
        ...formData,
        showOnCategory: formData.showOnCategory === 'yes',
        showOnProduct: formData.showOnProduct === 'yes',
      })
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Attribute updated successfully',
        })
        router.push('/admin/catalog/attributes')
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update attribute',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating attribute:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while updating the attribute',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDiscard = () => {
    setShowDiscardConfirm(true)
  }

  const handleDiscardConfirm = () => {
    setShowDiscardConfirm(false)
    router.push('/admin/catalog/attributes')
  }

  const handleDiscardCancel = () => {
    setShowDiscardConfirm(false)
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='max-w-7xl mx-auto p-6'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00437f]"></div>
              <p className='text-sm text-gray-500'>Loading attribute...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='max-w-7xl mx-auto p-6 space-y-6'>
        {/* Premium Header */}
        <div className='relative'>
          <div className='absolute inset-0 bg-gradient-to-r from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl'></div>
          <div className='relative flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50 shadow-lg'>
            <div className='space-y-2'>
              <div className='flex items-center gap-3'>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()} 
                  className="h-8 w-8 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200"
                >
                  <FiArrowLeft className="h-4 w-4" />
                </Button>
                <div className='w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-lg flex items-center justify-center shadow-md'>
                  <FiTag className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Edit Attribute
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    Edit product attribute
                  </p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                className="h-10 px-4 border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
              >
                <FiX className="mr-2 h-4 w-4" />
                Discard
              </Button>
              <Button 
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-10 px-4 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-md hover:shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-12 gap-6'>
          {/* Left Column - Main Attribute Details */}
          <div className='col-span-8 space-y-6'>
            {/* Basic Information Card */}
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
                <div className='space-y-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                      <FiTag className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Basic Information</h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>Attribute name and display details</p>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        Attribute Name *
                      </label>
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter attribute name"
                        required
                        className='h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        Display Name *
                      </label>
                      <Input
                        name="display"
                        value={formData.display}
                        onChange={handleInputChange}
                        placeholder="Enter display name"
                        required
                        className='h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Values Section Card */}
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                        <FiList className='h-5 w-5 text-white' />
                      </div>
                      <div>
                        <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Attribute Values</h3>
                        <p className='text-sm text-gray-600 dark:text-gray-300'>Add possible values for this attribute</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addValue}
                      className='h-10 px-4 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-xl'
                    >
                      <FiPlus className="mr-2 h-4 w-4" />
                      Add Value
                    </Button>
                  </div>
                  <div className='space-y-4'>
                    {formData.values.map((value, index) => (
                      <div key={index} className='flex items-center gap-3'>
                        <Input
                          value={value}
                          onChange={(e) => handleValueChange(index, e.target.value)}
                          placeholder="Enter value"
                          className='h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                        />
                        {formData.values.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeValue(index)}
                            className='h-11 w-11 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-xl'
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - Settings Sidebar */}
          <div className='col-span-4 space-y-6'>
            {/* Settings Card */}
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
                <div className='space-y-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                      <FiSettings className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Settings</h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>Attribute configuration</p>
                    </div>
                  </div>
                  <div className='space-y-6'>
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        Status
                      </label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'draft' | 'archived' }))}>
                        <SelectTrigger className='h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        Show on Category
                      </label>
                      <Select value={formData.showOnCategory} onValueChange={(value) => setFormData(prev => ({ ...prev, showOnCategory: value as 'yes' | 'no' }))}>
                        <SelectTrigger className='h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        Show on Product
                      </label>
                      <Select value={formData.showOnProduct} onValueChange={(value) => setFormData(prev => ({ ...prev, showOnProduct: value as 'yes' | 'no' }))}>
                        <SelectTrigger className='h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Discard Confirmation Modal */}
        {showDiscardConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-2xl max-w-md w-full transform transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl"></div>
              <div className="relative">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                    <FiX className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                  Discard Changes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center leading-relaxed">
                  Are you sure you want to discard your changes? 
                  <br />
                  <span className="text-[#00437f] dark:text-[#00437f] font-medium">This action cannot be undone!</span>
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleDiscardCancel} 
                    className="flex-1 h-11 border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleDiscardConfirm}
                    className="flex-1 h-11 bg-gradient-to-r from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl"
                  >
                    Discard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 