'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FiArrowLeft, FiPlus, FiTrash2, FiSearch, FiShoppingCart, FiUser, FiCreditCard, FiSave, FiX, FiDollarSign, FiPackage, FiTruck, FiTag, FiSettings, FiEye, FiGlobe, FiEdit, FiEdit2 } from 'react-icons/fi'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/use-debounce'
import { Label } from '@/components/ui/label'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Product = {
  id: string
  name: string
  regular_price: number
  selling_price: number | null
  image: string
  stock: number
  style: string
  brand: string | null
  styleId: number
}

type OrderItem = {
  productId: string
  productName: string
  quantity: number
  price: number
  image: string
}

type Customer = {
  id: string
  name: string | null
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  billingAddress: {
    street: string
    street2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  }
  shippingAddress: {
    street: string
    street2: string | null
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export default function AddOrderPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [formData, setFormData] = useState({
    customerEmail: '',
    customerName: '',
    shippingAddress: '',
    paymentMethod: 'cash',
    status: 'paid',
    note: '',
    discountType: 'amount',
    discountValue: '',
    taxAmount: '0',
    shippingAmount: '',
    phone: '',
    billingAddress: '',
  })
  const [showDropdown, setShowDropdown] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [open, setOpen] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)
  const debouncedCustomerSearch = useDebounce(customerSearch, 300)

  // Only fetch products when there's a search query
  useEffect(() => {
    if (debouncedSearch) {
      fetchProducts()
    } else {
      setProducts([]) // Clear products when search is empty
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (debouncedCustomerSearch) {
      fetchCustomers()
    } else {
      setCustomers([])
    }
  }, [debouncedCustomerSearch])

  const fetchProducts = async () => {
    try {
      setIsSearching(true)
      const response = await fetch(`/api/products?search=${encodeURIComponent(debouncedSearch)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch products')
      }
      
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load products')
      setProducts([]) // Clear products on error
    } finally {
      setIsSearching(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      setIsSearching(true)
      const response = await fetch(`/api/customers?search=${encodeURIComponent(debouncedCustomerSearch)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch customers')
      }
      
      setCustomers(data.customers)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load customers')
      setCustomers([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddProduct = (product: Product) => {
    
    // Convert prices to numbers and ensure we have a valid value
    const sellingPrice = parseFloat(String(product.selling_price))
    const regularPrice = parseFloat(String(product.regular_price))
    
    const existingItem = orderItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      // Use selling_price if it's a valid number, otherwise use regular_price
      const price = !isNaN(sellingPrice) && sellingPrice > 0 ? sellingPrice : regularPrice
      
      setOrderItems([...orderItems, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: price,
        image: product.image
      }])
    }
    toast.success(`${product.name} added to order`)
    setSearchQuery('') // Clear search after adding product
    setProducts([]) // Clear products list
  }

  const handleRemoveItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId))
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) return
    setOrderItems(orderItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity }
        : item
    ))
  }

  const handleQuantityInput = (productId: string, value: string) => {
    const quantity = parseInt(value)
    if (isNaN(quantity) || quantity < 1) return
    handleQuantityChange(productId, quantity)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if the click came from a tab
    const target = e.target as HTMLElement
    if (target.closest('[role="tab"]')) {
      return
    }
    
    if (orderItems.length === 0) {
      toast.error('Please add at least one product to the order')
      return
    }
    
    setIsLoading(true)

    try {
      // If a customer is selected, get their ID
      let userId = null
      if (selectedCustomer) {
        userId = selectedCustomer.id
      } else if (formData.customerEmail) {
        const userResponse = await fetch(`/api/users/search?email=${encodeURIComponent(formData.customerEmail)}`)
        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData && userData.length > 0) {
            userId = userData[0].id
          }
        }
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: orderItems,
          userId,
          // Set payment status based on payment method
          paymentStatus: formData.paymentMethod === 'cash' ? 'paid' : 'unpaid',
        }),
      })

      if (!response.ok) throw new Error('Failed to create order')

      toast.success('Order created successfully')
      router.push('/admin/sales/orders')
    } catch (error) {
      toast.error('Failed to create order')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal()
    if (formData.discountType === 'percentage') {
      const percentage = parseFloat(formData.discountValue) || 0
      return (subtotal * percentage) / 100
    }
    return parseFloat(formData.discountValue) || 0
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => {
      const itemPrice = parseFloat(String(item.price))
      const itemQuantity = parseInt(String(item.quantity))
      const subtotal = !isNaN(itemPrice) && !isNaN(itemQuantity) ? itemPrice * itemQuantity : 0
      return sum + subtotal
    }, 0)
  }

  const calculateTax = () => {
    return parseFloat(formData.taxAmount) || 0
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()
    const tax = calculateTax()
    const shipping = parseFloat(formData.shippingAmount) || 0
    return subtotal - discount + tax + shipping
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearch(customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email)
    setShowCustomerDropdown(false)
    setFormData(prev => ({
      ...prev,
      customerEmail: customer.email,
      customerName: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
      shippingAddress: formatAddress(customer.shippingAddress),
      billingAddress: formatAddress(customer.billingAddress),
      phone: customer.phone || ''
    }))
  }

  const formatAddress = (address: Customer['shippingAddress']) => {
    if (!address || !address.street) return ''
    const parts = [
      address.street,
      address.street2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country
    ].filter(Boolean)
    return parts.join('\n')
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
                  <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>Create New Order</h1>
                  <p className='text-lg font-medium text-gray-600 dark:text-gray-300'>
                    Add products and complete order details
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-11 px-6 text-sm font-medium border-2 border-[#00437f]/20 dark:border-[#00437f]/30 bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-[#00437f]/10 hover:text-[#00437f] hover:border-[#00437f]/40 rounded-xl'
                  onClick={() => router.back()}
                >
                  <FiX className="h-4 w-4" />
                  Discard
                </Button>
                <Button
                  size='sm'
                  disabled={isLoading || orderItems.length === 0}
                  className='h-11 px-8 text-sm font-medium bg-gradient-to-r from-[#00437f] to-[#003366] text-white shadow-lg hover:shadow-xl rounded-xl'
                  onClick={handleSubmit}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <FiSave className="h-4 w-4" />
                      Create Order
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Product Selection and Details */}
            <div className="col-span-8 space-y-8">
              {/* Product Selection Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                      <FiPackage className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Select Products</h3>
                      <p className="text-gray-600 dark:text-gray-300">Search and add products to the order</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="relative w-full">
                      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                             <Input
                         type="text"
                         placeholder="Search by name or style ID..."
                         value={searchQuery}
                         onChange={(e) => {
                           setSearchQuery(e.target.value)
                           setShowDropdown(true)
                         }}
                         onFocus={() => setShowDropdown(true)}
                         className="pl-12 h-12 bg-white/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl text-gray-700 placeholder-gray-500 font-medium"
                       />
                      {showDropdown && searchQuery && (
                        <div className="absolute z-[9999] w-full mt-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/30 max-h-60 overflow-auto">
                          {isSearching ? (
                            <div className="p-6 flex items-center justify-center gap-3 text-gray-500">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#00437f]"></div>
                              <span className="font-medium">Searching products...</span>
                            </div>
                          ) : products.length > 0 ? (
                            products.map((product) => (
                              <div
                                key={product.id}
                                className="p-4 hover:bg-[#00437f]/5 cursor-pointer flex items-center gap-4 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                  handleAddProduct(product)
                                  setShowDropdown(false)
                                }}
                              >
                                <div className="w-12 h-12 relative bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    Style: {product.style} {product.styleId && `(ID: ${product.styleId})`}
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-[#00437f]">
                                  {(() => {
                                    const sellingPrice = parseFloat(String(product.selling_price))
                                    const regularPrice = parseFloat(String(product.regular_price))
                                    const price = !isNaN(sellingPrice) && sellingPrice > 0 ? sellingPrice : regularPrice
                                    
                                    return `$${price}`
                                  })()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center text-gray-500">
                              <div className="text-sm font-medium mb-1">No products found</div>
                              <div className="text-xs">Try searching with a different term</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {!searchQuery && (
                      <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiSearch className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-medium">Start typing in the search box to find products</p>
                        <p className="text-sm mt-1">Search by product name, style, or brand</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Details and Customer Section */}
              <div onClick={(e) => e.stopPropagation()}>
                <div onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}>
                  <Tabs defaultValue="order" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-1">
                      <TabsTrigger value="order" className="flex items-center gap-2 data-[state=active]:bg-[#00437f] data-[state=active]:text-white rounded-lg transition-all duration-200">
                        <FiCreditCard className="h-4 w-4" />
                        Order Details
                      </TabsTrigger>
                      <TabsTrigger value="customer" className="flex items-center gap-2 data-[state=active]:bg-[#00437f] data-[state=active]:text-white rounded-lg transition-all duration-200">
                        <FiUser className="h-4 w-4" />
                        Customer
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="order" className="space-y-6 mt-6">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                              <FiCreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h3>
                              <p className="text-gray-600 dark:text-gray-300">Payment method and order status</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label htmlFor="paymentMethod" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Method</Label>
                              <Select
                                value={formData.paymentMethod}
                                onValueChange={(value) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    paymentMethod: value,
                                    status: value === 'cash' ? 'paid' : prev.status
                                  }))
                                }}
                              >
                                                                 <SelectTrigger className="h-12 bg-white/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl">
                                   <SelectValue placeholder="Select payment method" />
                                 </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="credit_card">Credit Card</SelectItem>
                                  <SelectItem value="cash">Cash</SelectItem>
                                  <SelectItem value="paypal">PayPal</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-3">
                              <Label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</Label>
                              <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                                disabled={formData.paymentMethod === 'cash'}
                              >
                                                                 <SelectTrigger className="h-12 bg-white/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl">
                                   <SelectValue placeholder="Select status" />
                                 </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Discount Section */}
                          <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Discount</h3>
                              <div className="flex items-center gap-3">
                                <Select
                                  value={formData.discountType}
                                  onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                                >
                                                                     <SelectTrigger className="h-10 w-28 bg-white/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg">
                                     <SelectValue />
                                   </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="amount">Amount</SelectItem>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    {formData.discountType === 'percentage' ? '%' : '$'}
                                  </span>
                                                                     <Input
                                     type="number"
                                     value={formData.discountValue}
                                     onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                     className="h-10 w-36 pl-8 bg-white/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg"
                                     placeholder="0.00"
                                     min="0"
                                     max={formData.discountType === 'percentage' ? "100" : undefined}
                                   />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Tax Section */}
                          <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tax Amount</h3>
                              <div className="relative w-40">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                                 <Input
                                   type="number"
                                   value={formData.taxAmount}
                                   onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                                   className="h-10 pl-8 bg-white/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg"
                                   placeholder="0.00"
                                   min="0"
                                 />
                              </div>
                            </div>
                          </div>

                          {/* Shipping Section */}
                          <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shipping Amount</h3>
                              <div className="relative w-40">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                                 <Input
                                   type="number"
                                   value={formData.shippingAmount}
                                   onChange={(e) => setFormData({ ...formData, shippingAmount: e.target.value })}
                                   className="h-10 pl-8 bg-white/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg"
                                   placeholder="0.00"
                                   min="0"
                                 />
                              </div>
                            </div>
                          </div>

                          <div className="mt-8">
                            <Label htmlFor="note" className="text-lg font-semibold text-gray-900 dark:text-white mb-3 block">Order Note</Label>
                                                         <Textarea
                               value={formData.note}
                               onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                               placeholder="Add any additional notes about this order"
                               className="h-32 bg-white/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl resize-none"
                             />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="customer" className="mt-6">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                              <FiUser className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Information</h3>
                              <p className="text-gray-600 dark:text-gray-300">Search and select customer details</p>
                            </div>
                          </div>
                          
                                                     <div className="space-y-8">
                             <div className="relative group">
                               <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                               <div className="relative bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h4>
                                 <div className="space-y-4">
                                   <div className="space-y-3">
                                     <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Search Customer</Label>
                                     <div className="relative">
                                       <div className="relative">
                                         <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                                    <Input
                                             placeholder="Search customers by name, email, or phone..."
                                             value={customerSearch}
                                             onChange={(e) => {
                                               setCustomerSearch(e.target.value)
                                               setShowCustomerDropdown(true)
                                             }}
                                             onFocus={() => setShowCustomerDropdown(true)}
                                             className="w-full pl-10 h-12 bg-white/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-xl"
                                             autoComplete="off"
                                             type="search"
                                           />
                                         {isSearching && (
                                           <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                             <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#00437f]"></div>
                                           </div>
                                         )}
                                       </div>
                                       
                                                                               {showCustomerDropdown && customerSearch && (
                                          <div className="absolute z-[9999] w-full mt-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/30 max-h-60 overflow-auto">
                                           {customers.length > 0 ? (
                                             customers.map((customer) => (
                                               <div
                                                 key={customer.id}
                                                 className="p-4 hover:bg-[#00437f]/5 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                                                 onClick={() => handleCustomerSelect(customer)}
                                               >
                                                 <div className="flex items-start gap-3">
                                                   <div className="flex-1">
                                                     <div className="font-semibold text-gray-900 text-sm">
                                                       {customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email}
                                                     </div>
                                                     <div className="text-xs text-gray-500 space-y-1 mt-1">
                                                       <div className="flex items-center gap-2">
                                                         <span className="text-gray-400">Email:</span>
                                                         <span>{customer.email}</span>
                                                       </div>
                                                       {customer.phone && (
                                                         <div className="flex items-center gap-2">
                                                           <span className="text-gray-400">Phone:</span>
                                                           <span>{customer.phone}</span>
                                                         </div>
                                                       )}
                                                     </div>
                                                   </div>
                                                   <div className="flex-shrink-0">
                                                     <div className="h-8 w-8 rounded-full bg-[#00437f]/10 flex items-center justify-center text-[#00437f] font-semibold">
                                                       {customer.name?.[0] || customer.firstName?.[0] || customer.lastName?.[0] || customer.email[0].toUpperCase()}
                                                     </div>
                                                   </div>
                                                 </div>
                                               </div>
                                             ))
                                           ) : (
                                             <div className="p-6 text-center">
                                               {isSearching ? (
                                                 <div className="flex flex-col items-center gap-2">
                                                   <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[#00437f]"></div>
                                                   <span className="text-sm text-gray-500">Searching customers...</span>
                                                 </div>
                                               ) : (
                                                 <div className="text-gray-500">
                                                   <div className="text-sm font-medium mb-1">No customers found</div>
                                                   <div className="text-xs">Try searching with a different term</div>
                                                 </div>
                                               )}
                                             </div>
                                           )}
                                         </div>
                                       )}
                                     </div>
                                   </div>
                                                                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email</Label>
                                                                                 <Input
                                           value={formData.customerEmail}
                                           onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                           placeholder="Customer email"
                                           readOnly
                                           disabled
                                           className="h-12 bg-gray-50/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl"
                                         />
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Name</Label>
                                                                                 <Input
                                           value={formData.customerName}
                                           onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                           placeholder="Customer name"
                                           readOnly
                                           disabled
                                           className="h-12 bg-gray-50/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl"
                                         />
                                      </div>
                                      <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone</Label>
                                                                                 <Input
                                           value={formData.phone || ''}
                                           onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                           placeholder="Customer phone"
                                           readOnly
                                           disabled
                                           className="h-12 bg-gray-50/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl"
                                         />
                                      </div>
                                    </div>
                                 </div>
                               </div>
                             </div>
                             <div className="relative group">
                               <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                               <div className="relative bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Addresses</h4>
                                                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Billing Address</Label>
                                                                             <Textarea
                                         value={formData.billingAddress || ''}
                                         onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                                         placeholder="Enter billing address"
                                         className="h-32 bg-gray-50/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl resize-none"
                                         readOnly
                                         disabled
                                       />
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Shipping Address</Label>
                                                                             <Textarea
                                         value={formData.shippingAddress}
                                         onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                         placeholder="Enter shipping address"
                                         className="h-32 bg-gray-50/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-1 focus:ring-[#00437f]/20 rounded-xl resize-none"
                                         readOnly
                                         disabled
                                       />
                                    </div>
                                  </div>
                               </div>
                             </div>
                           </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="col-span-4 space-y-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                      <FiShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Order Summary</h3>
                      <p className="text-gray-600 dark:text-gray-300">Review your order items</p>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {orderItems.map((item) => (
                        <div key={item.productId} className="flex flex-col p-4 hover:bg-[#00437f]/5 rounded-xl border border-gray-100/50 transition-all duration-200">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-gray-900 text-sm truncate">{item.productName}</h3>
                                <p className="font-bold text-[#00437f] ml-4 flex-shrink-0">
                                  {(() => {
                                    const total = (item.price || 0) * item.quantity
                                    return `$${total}`
                                  })()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                  className="h-8 w-8 p-0 border-[#00437f]/20 hover:border-[#00437f]/40 hover:bg-[#00437f]/10 rounded-lg"
                                >
                                  -
                                </Button>
                                                                 <Input
                                   type="number"
                                   min="1"
                                   value={item.quantity}
                                   onChange={(e) => handleQuantityInput(item.productId, e.target.value)}
                                   className="w-16 h-8 text-center bg-white/60 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-600 focus:border-[#00437f] focus:ring-2 focus:ring-[#00437f]/20 rounded-lg"
                                 />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                  className="h-8 w-8 p-0 border-[#00437f]/20 hover:border-[#00437f]/40 hover:bg-[#00437f]/10 rounded-lg"
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100/50">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.productId)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors w-full"
                            >
                              <FiTrash2 className="h-4 w-4 mr-2" />
                              Remove Item
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="mt-6 pt-6 border-t border-gray-200/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">Subtotal</span>
                      <span className="font-bold text-gray-900 dark:text-white">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    {calculateDiscount() > 0 && (
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Discount</span>
                        <span className="font-bold text-green-600">-${calculateDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">Tax</span>
                      <span className="font-bold text-gray-900 dark:text-white">${calculateTax().toFixed(2)}</span>
                    </div>
                    {parseFloat(formData.shippingAmount) > 0 && (
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Shipping</span>
                        <span className="font-bold text-gray-900 dark:text-white">${parseFloat(formData.shippingAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">Total</span>
                      <span className="text-xl font-bold text-[#00437f]">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || orderItems.length === 0}
                className="w-full h-16 text-lg font-bold bg-gradient-to-r from-[#00437f] to-[#003366] hover:from-[#003366] hover:to-[#002855] text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl flex items-center justify-center gap-3 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <>
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Creating Order...
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="h-6 w-6" />
                    Create Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 