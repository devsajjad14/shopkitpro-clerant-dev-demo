'use client'

import { useState, useEffect, use } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FiArrowLeft, FiSave, FiUser, FiLoader, FiEdit, FiX, FiMail, FiPhone, FiMapPin, FiCreditCard, FiTruck } from 'react-icons/fi'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  billingAddress: {
    street: string
    street2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  } | null
  shippingAddress: {
    street: string
    street2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  } | null
}

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [customer, setCustomer] = useState<Customer>({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    billingAddress: {
      street: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    shippingAddress: {
      street: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  })

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/customers/${resolvedParams.id}`)
        
        if (!response.ok) {
          const errorData = await response.text()
          let errorMessage = 'Failed to fetch customer'
          try {
            const parsed = JSON.parse(errorData)
            errorMessage = parsed.error || errorMessage
          } catch (e) {
            // If JSON parsing fails, use the raw text
            errorMessage = errorData || errorMessage
          }
          throw new Error(errorMessage)
        }

        const text = await response.text()
        if (!text) {
          throw new Error('Empty response from server')
        }

        const data = JSON.parse(text)
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format')
        }
        
        setCustomer({
          id: data.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email,
          phone: data.phone || '',
          billingAddress: data.billingAddress || {
            street: '',
            street2: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          },
          shippingAddress: data.shippingAddress || {
            street: '',
            street2: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          },
        })
      } catch (error) {
        console.error('Error loading customer:', error)
        toast({
          title: "Error",
          description: "Failed to load customer",
          variant: "destructive"
        })
        router.push('/admin/sales/customers')
      } finally {
        setIsLoading(false)
      }
    }

    loadCustomer()
  }, [resolvedParams.id, router])

  const handleUpdateCustomer = async () => {
    // Validate required fields
    if (!customer.firstName || !customer.lastName || !customer.email) {
      toast({
        title: "Error",
        description: "First name, last name, and email are required",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      // Ensure addresses are properly set
      const customerData = {
        ...customer,
        billingAddress: customer.billingAddress?.street ? customer.billingAddress : null,
        shippingAddress: customer.shippingAddress?.street ? customer.shippingAddress : null,
      }

      const response = await fetch(`/api/customers/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update customer')
      }

      toast({
        title: "Success",
        description: "Customer updated successfully"
      })
      router.push('/admin/sales/customers')
    } catch (error: any) {
      console.error('Error updating customer:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to update customer',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center">
                <FiLoader className="h-6 w-6 text-white animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading customer data...</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Please wait while we fetch the customer information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Premium Header */}
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
                  <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>Edit Customer</h1>
                  <p className='text-lg font-medium text-gray-600 dark:text-gray-300'>Update customer information and addresses</p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-11 px-8 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-[#00437f]/10 hover:text-[#00437f] hover:border-[#00437f]/40 rounded-xl'
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  <FiX className="h-4 w-4" />
                  Discard Changes
                </Button>
                <Button
                  size='sm'
                  disabled={isSubmitting}
                  className='h-11 px-10 text-sm font-medium bg-gradient-to-r from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl'
                  onClick={handleUpdateCustomer}
                >
                  {isSubmitting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent'></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className='h-4 w-4' />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-12 gap-6'>
          {/* Left Column - Basic Information */}
          <div className='col-span-8 space-y-6'>
            {/* Basic Information */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                      <FiUser className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Customer personal details</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name *</Label>
                      <Input
                        id="firstName"
                        value={customer.firstName}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="Enter first name"
                        required
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={customer.lastName}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Enter last name"
                        required
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customer.email}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Enter email address"
                        required
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customer.phone || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="Enter phone number"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Billing Address */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-500/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                      <FiCreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Billing Address</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Payment and billing information</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="billingStreet" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Street Address</Label>
                      <Input
                        id="billingStreet"
                        value={customer.billingAddress?.street || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            billingAddress: {
                              ...prev.billingAddress!,
                              street: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter street address"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billingStreet2" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Street Address 2</Label>
                      <Input
                        id="billingStreet2"
                        value={customer.billingAddress?.street2 || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            billingAddress: {
                              ...prev.billingAddress!,
                              street2: e.target.value,
                            },
                          }))
                        }
                        placeholder="Apartment, suite, etc."
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billingCity" className="text-sm font-semibold text-gray-700 dark:text-gray-300">City</Label>
                      <Input
                        id="billingCity"
                        value={customer.billingAddress?.city || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            billingAddress: {
                              ...prev.billingAddress!,
                              city: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter city"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billingState" className="text-sm font-semibold text-gray-700 dark:text-gray-300">State/Province</Label>
                      <Input
                        id="billingState"
                        value={customer.billingAddress?.state || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            billingAddress: {
                              ...prev.billingAddress!,
                              state: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter state or province"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billingPostalCode" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Postal Code</Label>
                      <Input
                        id="billingPostalCode"
                        value={customer.billingAddress?.postalCode || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            billingAddress: {
                              ...prev.billingAddress!,
                              postalCode: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter postal code"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="billingCountry" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Country</Label>
                      <Input
                        id="billingCountry"
                        value={customer.billingAddress?.country || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            billingAddress: {
                              ...prev.billingAddress!,
                              country: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter country"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Shipping Address */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-500/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                      <FiTruck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Address</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Delivery and shipping information</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="shippingStreet" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Street Address</Label>
                      <Input
                        id="shippingStreet"
                        value={customer.shippingAddress?.street || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            shippingAddress: {
                              ...prev.shippingAddress!,
                              street: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter street address"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingStreet2" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Street Address 2</Label>
                      <Input
                        id="shippingStreet2"
                        value={customer.shippingAddress?.street2 || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            shippingAddress: {
                              ...prev.shippingAddress!,
                              street2: e.target.value,
                            },
                          }))
                        }
                        placeholder="Apartment, suite, etc."
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingCity" className="text-sm font-semibold text-gray-700 dark:text-gray-300">City</Label>
                      <Input
                        id="shippingCity"
                        value={customer.shippingAddress?.city || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            shippingAddress: {
                              ...prev.shippingAddress!,
                              city: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter city"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingState" className="text-sm font-semibold text-gray-700 dark:text-gray-300">State/Province</Label>
                      <Input
                        id="shippingState"
                        value={customer.shippingAddress?.state || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            shippingAddress: {
                              ...prev.shippingAddress!,
                              state: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter state or province"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingPostalCode" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Postal Code</Label>
                      <Input
                        id="shippingPostalCode"
                        value={customer.shippingAddress?.postalCode || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            shippingAddress: {
                              ...prev.shippingAddress!,
                              postalCode: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter postal code"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingCountry" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Country</Label>
                      <Input
                        id="shippingCountry"
                        value={customer.shippingAddress?.country || ''}
                        onChange={(e) =>
                          setCustomer((prev) => ({
                            ...prev,
                            shippingAddress: {
                              ...prev.shippingAddress!,
                              country: e.target.value,
                            },
                          }))
                        }
                        placeholder="Enter country"
                        className="h-11 px-4 text-sm border-2 border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 rounded-xl focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - Customer Preview */}
          <div className='col-span-4 space-y-6'>
            {/* Customer Preview */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl">
                      <FiUser className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Preview</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">How the customer will appear</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiUser className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {customer.firstName && customer.lastName 
                          ? `${customer.firstName} ${customer.lastName}`
                          : 'Customer Name'
                        }
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{customer.email || 'email@example.com'}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <FiMail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {customer.email || 'No email provided'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <FiPhone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {customer.phone || 'No phone provided'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <FiMapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {customer.billingAddress?.city && customer.billingAddress?.country
                            ? `${customer.billingAddress.city}, ${customer.billingAddress.country}`
                            : customer.shippingAddress?.city && customer.shippingAddress?.country
                            ? `${customer.shippingAddress.city}, ${customer.shippingAddress.country}`
                            : 'No address provided'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Billing Address</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.billingAddress?.street 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {customer.billingAddress?.street ? 'Complete' : 'Incomplete'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600 dark:text-gray-300">Shipping Address</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          customer.shippingAddress?.street 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {customer.shippingAddress?.street ? 'Complete' : 'Incomplete'}
                        </span>
                      </div>
                    </div>
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