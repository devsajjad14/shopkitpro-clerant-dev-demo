'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  FiArrowLeft,
  FiSave,
  FiLoader,
  FiPercent,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiTag,
  FiSettings,
  FiX,
  FiEdit,
  FiGlobe,
  FiClock,
  FiAward,
} from 'react-icons/fi'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { use } from 'react'

type Coupon = {
  id: string
  code: string
  description: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchaseAmount: number | null
  maxDiscountAmount: number | null
  startDate: string
  endDate: string
  usageLimit: number | null
  perCustomerLimit: number | null
  isActive: boolean
  isFirstTimeOnly: boolean
  isNewCustomerOnly: boolean
  excludedProducts: string[]
  excludedCategories: string[]
  includedProducts: string[]
  includedCategories: string[]
  customerGroups: string[]
}

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { toast } = useToast()
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coupon, setCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const response = await fetch(`/api/coupons/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Failed to load coupon')
        }
        const data = await response.json()
        setCoupon(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load coupon",
          variant: "destructive"
        })
        router.push('/admin/marketing/coupons')
      } finally {
        setLoading(false)
      }
    }

    loadCoupon()
  }, [resolvedParams.id, router, toast])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coupon) return

    setSaving(true)
    try {
      const response = await fetch(`/api/coupons/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...coupon,
          value: parseFloat(coupon.value.toString()),
          minPurchaseAmount: coupon.minPurchaseAmount ? parseFloat(coupon.minPurchaseAmount.toString()) : null,
          maxDiscountAmount: coupon.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount.toString()) : null,
          usageLimit: coupon.usageLimit ? parseInt(coupon.usageLimit.toString()) : null,
          perCustomerLimit: coupon.perCustomerLimit ? parseInt(coupon.perCustomerLimit.toString()) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update coupon')
      }

      toast({
        title: "Success",
        description: "Coupon updated successfully"
      })
      router.push('/admin/marketing/coupons')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update coupon",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 border-4 border-[#00437f]/20 border-t-[#00437f] rounded-full animate-spin"></div>
          </div>
          <span className="text-gray-600 dark:text-gray-300 font-medium">Loading coupon...</span>
        </div>
      </div>
    )
  }

  if (!coupon) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4 sm:px-6">
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
                    <FiEdit className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-[#00437f] to-[#003366] dark:from-white dark:via-blue-200 dark:to-blue-300 bg-clip-text text-transparent">
                      Edit Coupon
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Modify coupon details and settings
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 transition-all duration-200"
                >
                  <FiX className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="coupon-form"
                  disabled={saving}
                  className="bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <form id="coupon-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-6">
            {/* Main Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
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
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-sm font-medium text-gray-700 dark:text-gray-300">Code</Label>
                        <Input
                          id="code"
                          value={coupon.code}
                          onChange={(e) => setCoupon({ ...coupon, code: e.target.value })}
                          required
                          className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                          placeholder="Enter coupon code"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</Label>
                        <Select
                          value={coupon.type}
                          onValueChange={(value) => setCoupon({ ...coupon, type: value as 'percentage' | 'fixed' })}
                        >
                          <SelectTrigger className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200">
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              <div className="flex items-center gap-2">
                                <FiPercent className="h-4 w-4" />
                                <span>Percentage Discount</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="fixed">
                              <div className="flex items-center gap-2">
                                <FiDollarSign className="h-4 w-4" />
                                <span>Fixed Amount</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                      <Input
                        id="description"
                        value={coupon.description}
                        onChange={(e) => setCoupon({ ...coupon, description: e.target.value })}
                        className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                        placeholder="Enter coupon description"
                      />
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
                        <FiSettings className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Discount Settings</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="value" className="text-sm font-medium text-gray-700 dark:text-gray-300">Value</Label>
                        <div className="relative">
                          <Input
                            id="value"
                            type="number"
                            value={coupon.value}
                            onChange={(e) => setCoupon({ ...coupon, value: parseFloat(e.target.value) })}
                            required
                            className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200 pl-8"
                            placeholder={coupon.type === 'percentage' ? 'Enter percentage' : 'Enter amount in cents'}
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {coupon.type === 'percentage' ? <FiPercent className="h-4 w-4" /> : <FiDollarSign className="h-4 w-4" />}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minPurchaseAmount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Purchase Amount</Label>
                        <div className="relative">
                          <Input
                            id="minPurchaseAmount"
                            type="number"
                            value={coupon.minPurchaseAmount || ''}
                            onChange={(e) => setCoupon({ ...coupon, minPurchaseAmount: e.target.value ? parseFloat(e.target.value) : null })}
                            className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200 pl-8"
                            placeholder="Enter minimum amount in cents"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <FiDollarSign className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="maxDiscountAmount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Discount Amount</Label>
                        <div className="relative">
                          <Input
                            id="maxDiscountAmount"
                            type="number"
                            value={coupon.maxDiscountAmount || ''}
                            onChange={(e) => setCoupon({ ...coupon, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : null })}
                            className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200 pl-8"
                            placeholder="Enter maximum amount in cents"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <FiDollarSign className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Validity & Usage */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                        <FiCalendar className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Validity & Usage</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={coupon.startDate.split('T')[0]}
                          onChange={(e) => setCoupon({ ...coupon, startDate: e.target.value })}
                          required
                          className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={coupon.endDate.split('T')[0]}
                          onChange={(e) => setCoupon({ ...coupon, endDate: e.target.value })}
                          required
                          className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="usageLimit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Usage Limit</Label>
                        <div className="relative">
                          <Input
                            id="usageLimit"
                            type="number"
                            value={coupon.usageLimit || ''}
                            onChange={(e) => setCoupon({ ...coupon, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                            className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200 pl-8"
                            placeholder="Enter total usage limit"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <FiUsers className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="perCustomerLimit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Per Customer Limit</Label>
                        <div className="relative">
                          <Input
                            id="perCustomerLimit"
                            type="number"
                            value={coupon.perCustomerLimit || ''}
                            onChange={(e) => setCoupon({ ...coupon, perCustomerLimit: e.target.value ? parseInt(e.target.value) : null })}
                            className="h-11 border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200 pl-8"
                            placeholder="Enter per-customer limit"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <FiUsers className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Restrictions */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                        <FiUsers className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Restrictions</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                        <div>
                          <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Enable this coupon</p>
                        </div>
                        <Switch
                          id="isActive"
                          checked={coupon.isActive}
                          onChange={(e) => setCoupon({ ...coupon, isActive: e.target.checked })}
                          className="data-[state=checked]:bg-[#00437f]"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                        <div>
                          <Label htmlFor="isFirstTimeOnly" className="text-sm font-medium text-gray-700 dark:text-gray-300">First Time Only</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Restrict to first-time customers</p>
                        </div>
                        <Switch
                          id="isFirstTimeOnly"
                          checked={coupon.isFirstTimeOnly}
                          onChange={(e) => setCoupon({ ...coupon, isFirstTimeOnly: e.target.checked })}
                          className="data-[state=checked]:bg-[#00437f]"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-xl">
                        <div>
                          <Label htmlFor="isNewCustomerOnly" className="text-sm font-medium text-gray-700 dark:text-gray-300">New Customers Only</Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Restrict to new customers</p>
                        </div>
                        <Switch
                          id="isNewCustomerOnly"
                          checked={coupon.isNewCustomerOnly}
                          onChange={(e) => setCoupon({ ...coupon, isNewCustomerOnly: e.target.checked })}
                          className="data-[state=checked]:bg-[#00437f]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Preview */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-20"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                        <FiAward className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Coupon Preview</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-lg text-blue-900 dark:text-blue-100">{coupon.code}</span>
                          <span className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                            {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-200">{coupon.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiCalendar className="h-4 w-4" />
                          <span>Valid: {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiUsers className="h-4 w-4" />
                          <span>Usage: {coupon.usageLimit || 'Unlimited'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiTag className="h-4 w-4" />
                          <span>Status: {coupon.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>
                    </div>
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