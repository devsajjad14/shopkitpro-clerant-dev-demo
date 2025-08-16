'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  FiArrowLeft, 
  FiPercent, 
  FiDollarSign, 
  FiCalendar, 
  FiUsers, 
  FiTag, 
  FiSave, 
  FiX,
  FiSettings,
  FiClock,
  FiAward,
  FiGlobe
} from 'react-icons/fi'

export default function AddCouponPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    perCustomerLimit: '',
    isActive: true,
    isFirstTimeOnly: false,
    isNewCustomerOnly: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          value: parseFloat(formData.value),
          minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : null,
          maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
          usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          perCustomerLimit: formData.perCustomerLimit ? parseInt(formData.perCustomerLimit) : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create coupon')
      }

      toast({
        title: "Success",
        description: "Coupon created successfully"
      })
      router.push('/admin/marketing/coupons')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create coupon',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <div className="container mx-auto py-6 px-4">
        {/* Premium Header */}
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00437f] to-[#003366] rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <FiArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                    <FiTag className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-[#00437f] to-[#003366] dark:from-white dark:via-blue-200 dark:to-blue-300 bg-clip-text text-transparent">
                      Add New Coupon
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Create a new discount coupon for your store
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 transition-all duration-200"
                >
                  <FiX className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="coupon-form"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  {loading ? 'Creating...' : 'Create Coupon'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <form id="coupon-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <FiTag className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</Label>
                    <div className="relative">
                      <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        placeholder="Enter coupon code"
                        className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter description"
                      className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Discount Settings */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <FiPercent className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Discount Settings</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'percentage' | 'fixed' }))}
                    >
                      <SelectTrigger className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formData.type === 'percentage' ? 'Percentage' : 'Amount'}
                    </Label>
                    <div className="relative">
                      {formData.type === 'percentage' ? (
                        <FiPercent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      ) : (
                        <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      )}
                      <Input
                        id="value"
                        name="value"
                        type="number"
                        value={formData.value}
                        onChange={handleChange}
                        required
                        min="0"
                        max={formData.type === 'percentage' ? "100" : undefined}
                        placeholder={formData.type === 'percentage' ? "Enter percentage (0-100)" : "Enter amount"}
                        className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minPurchaseAmount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Purchase Amount</Label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="minPurchaseAmount"
                        name="minPurchaseAmount"
                        type="number"
                        value={formData.minPurchaseAmount}
                        onChange={handleChange}
                        min="0"
                        placeholder="Enter minimum purchase amount"
                        className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxDiscountAmount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Discount Amount</Label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="maxDiscountAmount"
                        name="maxDiscountAmount"
                        type="number"
                        value={formData.maxDiscountAmount}
                        onChange={handleChange}
                        min="0"
                        placeholder="Enter maximum discount amount"
                        className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <FiCalendar className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Validity Period</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</Label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="startDate"
                        name="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</Label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="endDate"
                        name="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                    <FiUsers className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Usage Limits</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="usageLimit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Usage Limit</Label>
                    <div className="relative">
                      <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="usageLimit"
                        name="usageLimit"
                        type="number"
                        value={formData.usageLimit}
                        onChange={handleChange}
                        min="0"
                        placeholder="Enter total usage limit"
                        className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perCustomerLimit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Per Customer Limit</Label>
                    <div className="relative">
                      <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="perCustomerLimit"
                        name="perCustomerLimit"
                        type="number"
                        value={formData.perCustomerLimit}
                        onChange={handleChange}
                        min="0"
                        placeholder="Enter per customer usage limit"
                        className="pl-10 h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                    <FiSettings className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Status & Settings</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                    <div>
                      <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Status</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable this coupon</p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="data-[state=checked]:bg-[#00437f]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                    <div>
                      <Label htmlFor="isFirstTimeOnly" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Time Only</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Restrict to first-time customers</p>
                    </div>
                    <Switch
                      id="isFirstTimeOnly"
                      checked={formData.isFirstTimeOnly}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFirstTimeOnly: e.target.checked }))}
                      className="data-[state=checked]:bg-[#00437f]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                    <div>
                      <Label htmlFor="isNewCustomerOnly" className="text-sm font-medium text-gray-700 dark:text-gray-300">New Customers Only</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Restrict to new customers only</p>
                    </div>
                    <Switch
                      id="isNewCustomerOnly"
                      checked={formData.isNewCustomerOnly}
                      onChange={(e) => setFormData(prev => ({ ...prev, isNewCustomerOnly: e.target.checked }))}
                      className="data-[state=checked]:bg-[#00437f]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 