'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { FiArrowLeft, FiTrash2, FiSearch, FiRefreshCw, FiSave, FiX, FiPackage, FiSettings, FiList, FiPlus } from 'react-icons/fi'
import { getProducts, updateProduct } from '@/lib/actions/products'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StockAdjustment {
  styleId: number
  sku: string
  name: string
  currentStock: number
  adjustment: number
  reason: string
  type: 'add' | 'remove' | 'set'
}

export default function AdjustStockPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([])
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProduct = (product: any) => {
    if (!adjustments.find(a => a.styleId === product.styleId)) {
      setAdjustments(prev => [...prev, {
        styleId: product.styleId,
        sku: product.sku || '',
        name: product.name,
        currentStock: product.stockQuantity || 0,
        adjustment: 0,
        reason: selectedReason === 'custom' ? customReason : selectedReason,
        type: 'add'
      }])
    }
  }

  const handleAdjustmentChange = (styleId: number, value: number, type: 'add' | 'remove' | 'set') => {
    setAdjustments(prev => prev.map(adj => {
      if (adj.styleId === styleId) {
        // If switching to 'set' type, use current stock as initial value
        const newValue = type === 'set' ? adj.currentStock : value
        return { ...adj, adjustment: newValue, type }
      }
      return adj
    }))
  }

  const handleRemoveAdjustment = (styleId: number) => {
    setAdjustments(prev => prev.filter(adj => adj.styleId !== styleId))
  }

  const handleReasonChange = (value: string) => {
    setSelectedReason(value)
    if (value !== 'custom') {
      setAdjustments(prev => prev.map(adj => ({ ...adj, reason: value })))
    }
  }

  const handleCustomReasonChange = (value: string) => {
    setCustomReason(value)
    setAdjustments(prev => prev.map(adj => ({ ...adj, reason: value })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (adjustments.length === 0) {
      toast({
        title: 'Error',
        description: 'No adjustments to save',
        variant: 'destructive',
      })
      return
    }

    if (!selectedReason && !customReason) {
      toast({
        title: 'Error',
        description: 'Please select or enter a reason for the adjustment',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSaving(true)
      
      // Process each adjustment
      for (const adjustment of adjustments) {
        let newStockQuantity = adjustment.currentStock
        
        switch (adjustment.type) {
          case 'add':
            newStockQuantity += adjustment.adjustment
            break
          case 'remove':
            newStockQuantity -= adjustment.adjustment
            break
          case 'set':
            newStockQuantity = adjustment.adjustment
            break
        }

        if (newStockQuantity < 0) {
          toast({
            title: 'Error',
            description: `Cannot set negative stock for ${adjustment.name}`,
            variant: 'destructive',
          })
          continue
        }

        const product = products.find(p => p.styleId === adjustment.styleId)
        if (!product) {
          toast({
            title: 'Error',
            description: `Product ${adjustment.name} not found`,
            variant: 'destructive',
          })
          continue
        }

        const response = await updateProduct(adjustment.styleId.toString(), {
          ...product,
          stockQuantity: newStockQuantity
        })

        if (!response.success) {
          toast({
            title: 'Error',
            description: `Failed to update stock for ${adjustment.name}: ${response.error}`,
            variant: 'destructive',
          })
        }
      }

      toast({
        title: 'Success',
        description: 'Stock adjustments saved successfully',
      })
      setAdjustments([])
      setSelectedReason('')
      setCustomReason('')
      await loadProducts() // Reload products to get updated stock levels
    } catch (error) {
      console.error('Error saving adjustments:', error)
      toast({
        title: 'Error',
        description: 'Failed to save stock adjustments',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    if (adjustments.length > 0) {
      setShowDiscardConfirm(true)
    }
  }

  const handleDiscardConfirm = () => {
    setAdjustments([])
    setSelectedReason('')
    setCustomReason('')
    setSearchQuery('')
    setShowDiscardConfirm(false)
  }

  const handleDiscardCancel = () => {
    setShowDiscardConfirm(false)
  }

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='max-w-7xl mx-auto p-6'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='flex flex-col items-center gap-4'>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00437f]"></div>
              <p className='text-sm text-gray-500'>Loading products...</p>
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
                  <FiPackage className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold text-gray-900 dark:text-white tracking-tight'>
                    Adjust Stock
                  </h1>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>
                    Update product inventory levels
                  </p>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                disabled={adjustments.length === 0}
                className="h-10 px-4 border-2 border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-200"
              >
                <FiX className="mr-2 h-4 w-4" />
                Discard
              </Button>
              <Button 
                size="sm"
                onClick={handleSubmit}
                disabled={isSaving || adjustments.length === 0}
                className="h-10 px-4 bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-md hover:shadow-lg rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-12 gap-6'>
          {/* Left Column - Product Selection */}
          <div className='col-span-4 space-y-6'>
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
                <div className='space-y-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                      <FiSearch className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Product Selection</h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>Search and select products to adjust</p>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <div className='relative flex-1'>
                        <FiSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00437f]' />
                        <Input
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className='pl-10 h-10 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-300'
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={loadProducts}
                        disabled={isLoading}
                        className='h-10 w-10 border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/10 text-[#00437f] hover:text-[#003366] transition-all duration-200 rounded-lg'
                      >
                        <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <div className='space-y-2 max-h-[400px] overflow-y-auto'>
                      {isLoading ? (
                        <div className='text-center py-4 text-gray-500'>
                          Loading products...
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className='text-center py-4 text-gray-500'>
                          No products found
                        </div>
                      ) : (
                        filteredProducts.map(product => (
                          <div
                            key={product.styleId}
                            className='p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] dark:hover:border-[#00437f] cursor-pointer bg-white/50 dark:bg-gray-700/50 hover:bg-[#00437f]/5 transition-all duration-200'
                            onClick={() => handleAddProduct(product)}
                          >
                            <div className='font-medium text-gray-900 dark:text-white'>{product.name}</div>
                            <div className='text-sm text-gray-500 dark:text-gray-400'>{product.sku || 'No SKU'}</div>
                            <div className='text-sm text-gray-500 dark:text-gray-400'>
                              Current Stock: {product.stockQuantity || 0}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - Adjustments */}
          <div className='col-span-8 space-y-6'>
            {/* Adjustment Reason */}
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
                <div className='space-y-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                      <FiSettings className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Adjustment Reason</h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>Select or enter a reason for the adjustment</p>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        Reason Type
                      </label>
                      <Select value={selectedReason} onValueChange={handleReasonChange}>
                        <SelectTrigger className='h-11 px-4 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="received">Stock Received</SelectItem>
                          <SelectItem value="damaged">Damaged Stock</SelectItem>
                          <SelectItem value="returned">Customer Return</SelectItem>
                          <SelectItem value="count">Stock Count Adjustment</SelectItem>
                          <SelectItem value="custom">Custom Reason</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedReason === 'custom' && (
                      <div className='space-y-2'>
                        <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                          Custom Reason
                        </label>
                        <Textarea
                          value={customReason}
                          onChange={(e) => handleCustomReasonChange(e.target.value)}
                          placeholder="Enter custom reason..."
                          className='min-h-[100px] px-4 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Adjustments List */}
            <div className='relative group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
              <Card className='relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]'>
                <div className='space-y-6'>
                  <div className='flex items-center gap-3 mb-4'>
                    <div className='p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl'>
                      <FiList className='h-5 w-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Stock Adjustments</h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>
                        {adjustments.length} product{adjustments.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  </div>
                  {adjustments.length === 0 ? (
                    <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
                      <FiPackage className='h-12 w-12 mx-auto mb-4 opacity-50' />
                      <p>Select products from the left to adjust their stock levels</p>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {adjustments.map(adjustment => (
                        <div key={adjustment.styleId} className='p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:border-[#00437f]/30 transition-all duration-200'>
                          <div className='flex items-center justify-between mb-4'>
                            <div>
                              <div className='font-medium text-gray-900 dark:text-white'>{adjustment.name}</div>
                              <div className='text-sm text-gray-500 dark:text-gray-400'>{adjustment.sku}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveAdjustment(adjustment.styleId)}
                              className='h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg'
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className='grid grid-cols-3 gap-4'>
                            <div className='space-y-2'>
                              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                                Current Stock
                              </label>
                              <div className='text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-600/50 rounded-lg px-3 py-2'>
                                {adjustment.currentStock}
                              </div>
                            </div>
                            <div className='space-y-2'>
                              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                                Adjustment Type
                              </label>
                              <Select value={adjustment.type} onValueChange={(value) => handleAdjustmentChange(adjustment.styleId, adjustment.adjustment, value as 'add' | 'remove' | 'set')}>
                                <SelectTrigger className='h-9 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="add">Add Stock (+)</SelectItem>
                                  <SelectItem value="remove">Remove Stock (-)</SelectItem>
                                  <SelectItem value="set">Set Stock (=)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-2'>
                              <label className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                                {adjustment.type === 'set' ? 'New Stock Level' : 'Amount to Adjust'}
                              </label>
                              <Input
                                type="number"
                                min="0"
                                value={adjustment.adjustment}
                                onChange={(e) => handleAdjustmentChange(adjustment.styleId, parseInt(e.target.value), adjustment.type)}
                                className='h-9 px-3 text-sm border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 rounded-lg focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200'
                              />
                            </div>
                          </div>
                          <div className='mt-4 text-sm'>
                            <span className='font-medium text-gray-700 dark:text-gray-300'>New Stock Level: </span>
                            <span className={`
                              ${adjustment.type === 'add' ? 'text-green-600 dark:text-green-400' : 
                                adjustment.type === 'remove' ? 'text-red-600 dark:text-red-400' : 
                                'text-blue-600 dark:text-blue-400'}
                            `}>
                              {adjustment.type === 'add' ? adjustment.currentStock + adjustment.adjustment :
                               adjustment.type === 'remove' ? adjustment.currentStock - adjustment.adjustment :
                               adjustment.adjustment}
                            </span>
                            {adjustment.type === 'add' && (
                              <span className='text-xs text-gray-500 dark:text-gray-400 ml-2'>
                                ({adjustment.currentStock} + {adjustment.adjustment})
                              </span>
                            )}
                            {adjustment.type === 'remove' && (
                              <span className='text-xs text-gray-500 dark:text-gray-400 ml-2'>
                                ({adjustment.currentStock} - {adjustment.adjustment})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  Are you sure you want to discard all changes? 
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