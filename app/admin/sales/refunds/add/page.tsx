'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { FiArrowLeft, FiLoader, FiPlus, FiTrash2, FiDollarSign, FiCreditCard, FiFileText, FiSave, FiX, FiSettings, FiList, FiGlobe, FiAward } from 'react-icons/fi'

type Order = {
  id: string
  totalAmount: number
  customerName: string
  customerEmail: string
  status: string
}

type RefundItem = {
  productId: number
  quantity: number
  amount: number
  reason: string
}

type Refund = {
  id: string
  amount: number
  refundType: string
  orderId: string
}

export default function AddRefundPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<string>('')
  const [refundItems, setRefundItems] = useState<RefundItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [totalRefunded, setTotalRefunded] = useState(0)
  const [formData, setFormData] = useState({
    reason: '',
    refundMethod: 'original_payment',
    refundType: 'full',
    notes: '',
    refundPolicy: 'standard',
  })

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setIsLoadingOrders(true)
      const response = await fetch('/api/orders?status=!full_refunded')
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      if (!data.orders || !Array.isArray(data.orders)) {
        console.error('Invalid orders data:', data)
        toast({
          title: "Error",
          description: "Received invalid orders data from server",
          variant: "destructive"
        })
        return
      }
      setOrders(data.orders)
    } catch (error) {
      console.error('Error loading orders:', error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      })
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const loadRefundsForOrder = async (orderId: string) => {
    try {
      setIsLoadingOrderDetails(true)
      const response = await fetch('/api/refunds')
      if (!response.ok) throw new Error('Failed to fetch refunds')
      const refunds: Refund[] = await response.json()
      
      // Calculate total refunded amount for this order - ensure it's a number
      const orderRefunds = refunds.filter(refund => refund.orderId === orderId)
      const total = orderRefunds.reduce((sum, refund) => {
        const amount = typeof refund.amount === 'number' ? refund.amount : parseFloat(refund.amount) || 0
        return sum + amount
      }, 0)
      setTotalRefunded(total)
    } catch (error) {
      console.error('Error loading refunds:', error)
      toast({
        title: "Error",
        description: "Failed to load refund history",
        variant: "destructive"
      })
    } finally {
      setIsLoadingOrderDetails(false)
    }
  }

  const handleOrderSelect = async (orderId: string) => {
    setSelectedOrder(orderId)
    const order = orders.find(o => o.id === orderId)
    if (order) {
      await loadRefundsForOrder(orderId)
      const orderTotal = order.totalAmount
      const isPartiallyRefunded = order.status === 'partial_refunded'
      const remainingAmount = orderTotal - totalRefunded
      
      // If order is partially refunded, force partial refund type
      if (isPartiallyRefunded) {
        setFormData(prev => ({ ...prev, refundType: 'partial' }))
      }

      // Add a default refund item
      setRefundItems([{
        productId: 0,
        quantity: 1,
        amount: formData.refundType === 'full' && !isPartiallyRefunded ? remainingAmount : 0,
        reason: 'Customer request'
      }])
    }
  }

  const handleRefundTypeChange = (value: string) => {
    const order = orders.find(o => o.id === selectedOrder)
    if (!order) return

    const isPartiallyRefunded = order.status === 'partial_refunded'
    const orderTotal = order.totalAmount
    const remainingAmount = orderTotal - totalRefunded
    
    // Prevent full refund if order is partially refunded
    if (isPartiallyRefunded && value === 'full') {
      toast({
        title: "Error",
        description: "Cannot select full refund for partially refunded order",
        variant: "destructive"
      })
      return
    }

    setFormData({ ...formData, refundType: value })
    setRefundItems([{
      productId: 0,
      quantity: 1,
      amount: value === 'full' && !isPartiallyRefunded ? remainingAmount : 0,
      reason: 'Customer request'
    }])
  }

  const handleAddItem = () => {
    setRefundItems([
      ...refundItems,
      {
        productId: 0,
        quantity: 1,
        amount: 0,
        reason: ''
      }
    ])
  }

  const handleRemoveItem = (index: number) => {
    setRefundItems(refundItems.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof RefundItem, value: any) => {
    const newItems = [...refundItems]
    const order = orders.find(o => o.id === selectedOrder)
    
    if (field === 'amount' && order) {
      const orderTotal = order.totalAmount
      const isPartiallyRefunded = order.status === 'partial_refunded'
      const remainingAmount = orderTotal - totalRefunded
      
      if (formData.refundType === 'full' && !isPartiallyRefunded) {
        // For full refund, force the exact remaining amount
        value = remainingAmount
      } else {
        // For partial refund, ensure amount is less than remaining amount
        value = Math.min(value, remainingAmount - 0.01) // Subtract 0.01 to ensure it's strictly less
      }
    }
    
    newItems[index] = { ...newItems[index], [field]: value }
    setRefundItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) {
      toast({
        title: "Error",
        description: "Please select an order",
        variant: "destructive"
      })
      return
    }

    const order = orders.find(o => o.id === selectedOrder)
    if (!order) {
      toast({
        title: "Error",
        description: "Order not found",
        variant: "destructive"
      })
      return
    }

    const orderTotal = parseFloat(order.totalAmount.toString())
    const refundTotal = parseFloat(refundItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0).toFixed(2))

    // Validate refund amount based on type
    if (formData.refundType === 'full' && Math.abs(refundTotal - orderTotal) > 0.01) {
      toast({
        title: "Error",
        description: `Full refund amount must be ${orderTotal.toFixed(2)}`,
        variant: "destructive"
      })
      return
    }

    if (formData.refundType === 'partial' && refundTotal >= orderTotal) {
      toast({
        title: "Error",
        description: "Partial refund amount must be less than the order total",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder,
          amount: refundTotal, // Use actual amount, no cents conversion
          reason: formData.reason,
          refundMethod: formData.refundMethod,
          refundType: formData.refundType,
          notes: formData.notes,
          refundPolicy: formData.refundPolicy,
          refundItems: refundItems.map(item => ({
            ...item,
            amount: parseFloat(item.amount.toString()) // Use actual amount, no cents conversion
          })),
          payment_status: 'pending',
          refundStatusHistory: [{
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'Refund created',
            updatedBy: 'system'
          }]
        }),
      })

      if (!response.ok) throw new Error('Failed to create refund')

      toast({
        title: "Success",
        description: "Refund created successfully"
      })
      router.push('/admin/sales/refunds')
    } catch (error) {
      console.error('Error creating refund:', error)
      toast({
        title: "Error",
        description: "Failed to create refund",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
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
                  onClick={() => router.push('/admin/sales/refunds')}
                  className='h-10 w-10 bg-gradient-to-br from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl'
                >
                  <FiArrowLeft className='h-5 w-5' />
                </Button>
                <div>
                  <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>Create Refund</h1>
                  <p className='text-lg font-medium text-gray-600 dark:text-gray-300'>
                    Process a new refund for an existing order
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-11 px-6 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-[#00437f]/10 hover:text-[#00437f] hover:border-[#00437f]/40 rounded-xl'
                  onClick={() => router.push('/admin/sales/refunds')}
                >
                  <FiX className="h-4 w-4" />
                  Discard
                </Button>
                <Button
                  size='sm'
                  disabled={isLoading}
                  className='h-11 px-8 text-sm font-medium bg-gradient-to-r from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl'
                  type="submit"
                  form="refund-form"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4" />
                      Create Refund
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <form id="refund-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Order Information Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                  <FiCreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Order Information</h3>
                  <p className="text-gray-600 dark:text-gray-300">Select order and refund details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="order" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Select Order
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose the order to process refund for</p>
                  <Select
                    value={selectedOrder}
                    onValueChange={handleOrderSelect}
                    disabled={isLoadingOrders}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                      {isLoadingOrders ? (
                        <div className="flex items-center gap-2">
                          <FiLoader className="h-4 w-4 animate-spin" />
                          <span>Loading orders...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select an order" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>Order #{order.id}</span>
                            <span className="text-gray-500">${order.totalAmount}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refundType" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Refund Type
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose between full or partial refund</p>
                  <Select
                    value={formData.refundType}
                    onValueChange={handleRefundTypeChange}
                    disabled={isLoadingOrderDetails || orders.find(o => o.id === selectedOrder)?.status === 'partial_refunded'}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                      {isLoadingOrderDetails ? (
                        <div className="flex items-center gap-2">
                          <FiLoader className="h-4 w-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select refund type" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Refund</SelectItem>
                      <SelectItem value="partial">Partial Refund</SelectItem>
                    </SelectContent>
                  </Select>
                  {orders.find(o => o.id === selectedOrder)?.status === 'partial_refunded' && (
                    <p className="text-xs text-amber-600 mt-1">
                      This order has been partially refunded. Only partial refunds are allowed.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refundMethod" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Refund Method
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select how the refund will be processed</p>
                  <Select
                    value={formData.refundMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, refundMethod: value })
                    }
                    disabled={isLoadingOrderDetails}
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                      {isLoadingOrderDetails ? (
                        <div className="flex items-center gap-2">
                          <FiLoader className="h-4 w-4 animate-spin" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <SelectValue placeholder="Select refund method" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original_payment">Original Payment Method</SelectItem>
                      <SelectItem value="store_credit">Store Credit</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Details Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                  <FiFileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Refund Details</h3>
                  <p className="text-gray-600 dark:text-gray-300">Reason and additional information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="reason" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Reason for Refund
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Provide a detailed reason for the refund request</p>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    placeholder="Enter reason for refund"
                    required
                    className="min-h-[120px] border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Additional Notes
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Any additional information or special instructions</p>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Enter any additional notes"
                    className="min-h-[120px] border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Refund Items Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                    <FiDollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Refund Items</h3>
                    <p className="text-gray-600 dark:text-gray-300">Configure refund amounts and reasons</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  disabled={formData.refundType === 'full'}
                  className="h-11 px-6 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-[#00437f]/10 hover:text-[#00437f] hover:border-[#00437f]/40 rounded-xl"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {selectedOrder && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  {isLoadingOrderDetails ? (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <FiLoader className="h-4 w-4 animate-spin" />
                      <span>Loading order details...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {formData.refundType === 'full' 
                          ? `Full refund amount: $${((orders.find(o => o.id === selectedOrder)?.totalAmount || 0) - (Number(totalRefunded) || 0)).toFixed(2)}`
                          : `Maximum refundable amount: $${((orders.find(o => o.id === selectedOrder)?.totalAmount || 0) - (Number(totalRefunded) || 0) - 0.01).toFixed(2)}`
                        }
                      </p>
                      {(Number(totalRefunded) || 0) > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Total refunded so far: ${(Number(totalRefunded) || 0).toFixed(2)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              <div className="space-y-6">
                {refundItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="space-y-2">
                      <Label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Amount ($)</Label>
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) =>
                          handleItemChange(index, 'amount', parseFloat(e.target.value))
                        }
                        required
                        className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                        max={formData.refundType === 'partial' 
                          ? (orders.find(o => o.id === selectedOrder)?.totalAmount || 0) - (Number(totalRefunded) || 0) - 0.01
                          : (orders.find(o => o.id === selectedOrder)?.totalAmount || 0) - (Number(totalRefunded) || 0)}
                        step="0.01"
                        min="0"
                        readOnly={formData.refundType === 'full' && orders.find(o => o.id === selectedOrder)?.status !== 'partial_refunded'}
                      />
                      {formData.refundType === 'partial' && (
                        <p className="text-xs text-gray-500">
                          Max: ${((orders.find(o => o.id === selectedOrder)?.totalAmount || 0) - (Number(totalRefunded) || 0) - 0.01).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, 'quantity', parseInt(e.target.value))
                        }
                        required
                        className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Reason</Label>
                      <Input
                        value={item.reason}
                        onChange={(e) =>
                          handleItemChange(index, 'reason', e.target.value)
                        }
                        required
                        className="h-12 border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                      />
                    </div>
                    {formData.refundType === 'partial' && (
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                          className="h-12 w-12 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all duration-200 rounded-xl border-2 border-red-200 dark:border-red-700/50 hover:border-red-300 dark:hover:border-red-600"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 