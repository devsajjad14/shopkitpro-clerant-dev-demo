'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'
import { FiPackage, FiClock, FiDollarSign, FiEye, FiLoader, FiList } from 'react-icons/fi'
import { useSearchParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FiX, FiUser, FiCreditCard, FiMapPin, FiCalendar } from 'react-icons/fi'

interface OrderItem {
  id: string
  orderId: string
  productId: number
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product?: {
    id: number
    name: string
    mediumPicture: string | null
    style: string
    brand: string | null
    styleId: number
  }
}

interface Order {
  id: string
  userId: string | null
  guestEmail: string | null
  status: string
  paymentMethod: string | null
  paymentStatus: string
  totalAmount: number
  subtotal: number
  tax: number
  discount: number
  shippingFee: number
  note: string | null
  createdAt: string
  updatedAt: string | null
  items?: OrderItem[]
}

export default function AccountOrdersPage() {
  const { user } = useAuthStore()
  const searchParams = useSearchParams()
  const pageParam = searchParams.get('page')
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(Number(pageParam) || 1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const pageSize = 10

  useEffect(() => {
    if (user?.email) {
      fetchUserOrders()
    }
  }, [user?.email, currentPage])

  const fetchUserOrders = async () => {
    if (!user?.email) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/orders?search=${encodeURIComponent(user.email)}&page=${currentPage}&limit=${pageSize}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])
      setTotalPages(data.totalPages || 1)
      setTotalOrders(data.total || 0)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load your orders')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'processing':
        return 'bg-blue-100 text-blue-700'
      case 'shipped':
        return 'bg-purple-100 text-purple-700'
      case 'delivered':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Order History</h1>
          <p className="text-gray-600">Please log in to view your orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View your past purchases and order details</p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 p-8">
              <div className="flex items-center justify-center">
                <FiLoader className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Loading your orders...</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-100 dark:border-gray-800 p-8">
              <div className="text-center">
                <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't placed any orders yet.</p>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FiPackage className="h-4 w-4" />
                          Order ID
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FiClock className="h-4 w-4" />
                          Date
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="flex items-center justify-end gap-2">
                          <FiDollarSign className="h-4 w-4" />
                          Total
                        </div>
                      </th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm text-indigo-700">
                            #{order.id.slice(0, 8)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {order.items?.length || 0} items
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 dark:text-gray-200">
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          {order.paymentStatus && (
                            <div className="text-xs text-gray-500 mt-1">
                              Payment: {order.paymentStatus}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${Number(order.totalAmount || 0).toFixed(2)}
                          </div>
                          {order.discount > 0 && (
                            <div className="text-xs text-green-600 mt-1">
                              Saved ${Number(order.discount).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsDialogOpen(true)
                            }}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-900 font-medium text-sm underline"
                          >
                            <FiEye className="h-4 w-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalOrders)} of {totalOrders} orders
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                        currentPage === totalPages 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
              {/* Order Details Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl border-0">
                  <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50/60 to-indigo-50/60 rounded-t-2xl">
                    <DialogTitle className="text-xl font-bold text-gray-900">Order Details</DialogTitle>
                    <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-gray-600 ml-auto">
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                  {selectedOrder && (
                    <div className="space-y-8 px-6 py-6">
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b pb-4">
                        <div>
                          <div className="flex items-center gap-2 text-base font-semibold text-indigo-700">
                            <FiPackage className="h-5 w-5" />
                            Order #{selectedOrder.id.slice(0, 8)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                            <FiCalendar className="h-4 w-4" />
                            {formatDate(selectedOrder.createdAt)}
                            <span>at</span>
                            {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm border ${getStatusColor(selectedOrder.status)}`}> 
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </div>
                      {/* Items List */}
                      <div className="bg-white rounded-xl border p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiList className="h-4 w-4" /> Items</h4>
                        <div className="divide-y divide-gray-100">
                          {selectedOrder.items && selectedOrder.items.length > 0 ? (
                            selectedOrder.items.map((item, idx) => (
                              <div key={item.id || idx} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden flex items-center justify-center border">
                                    {item.product?.mediumPicture ? (
                                      <img src={item.product.mediumPicture} alt={item.name} className="object-cover w-full h-full" />
                                    ) : (
                                      <FiPackage className="h-5 w-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                                    {item.product?.style && (
                                      <div className="text-xs text-gray-400">Style: {item.product.style}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-gray-900">${Number(item.totalPrice || 0).toFixed(2)}</div>
                                  <div className="text-xs text-gray-500">${Number(item.unitPrice || 0).toFixed(2)} each</div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 text-sm py-4 text-center">No items found in this order.</div>
                          )}
                        </div>
                      </div>
                      {/* Payment Summary */}
                      <div className="bg-gradient-to-br from-blue-50/40 to-white rounded-xl border p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiCreditCard className="h-4 w-4" /> Payment Summary</h4>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex justify-between"><span>Subtotal</span><span>${Number(selectedOrder.subtotal || 0).toFixed(2)}</span></div>
                          {selectedOrder.shippingFee > 0 && <div className="flex justify-between"><span>Shipping</span><span>${Number(selectedOrder.shippingFee).toFixed(2)}</span></div>}
                          {selectedOrder.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>- ${Number(selectedOrder.discount).toFixed(2)}</span></div>}
                          <div className="flex justify-between"><span>Tax</span><span>${Number(selectedOrder.tax || 0).toFixed(2)}</span></div>
                          <div className="flex justify-between font-semibold text-gray-900"><span>Total</span><span>${Number(selectedOrder.totalAmount || 0).toFixed(2)}</span></div>
                          <div className="flex justify-between mt-2"><span className="text-gray-500">Payment Method</span><span className="text-gray-900">{selectedOrder.paymentMethod ? selectedOrder.paymentMethod.charAt(0).toUpperCase() + selectedOrder.paymentMethod.slice(1) : 'N/A'}</span></div>
                        </div>
                      </div>
                      {/* Customer Info */}
                      <div className="bg-white rounded-xl border p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiUser className="h-4 w-4" /> Customer</h4>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex justify-between"><span>Email</span><span>{selectedOrder.guestEmail || 'N/A'}</span></div>
                          {selectedOrder.note && <div className="flex flex-col mt-2"><span className="text-xs text-gray-500">Order Note:</span><span className="text-gray-900">{selectedOrder.note}</span></div>}
                        </div>
                      </div>
                      {/* Timeline */}
                      <div className="bg-gradient-to-br from-gray-50/60 to-white rounded-xl border p-4 shadow-sm">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FiCalendar className="h-4 w-4" /> Timeline</h4>
                        <div className="flex flex-col gap-2 text-xs text-gray-600">
                          <div className="flex items-center gap-2"><span>Created:</span><span>{formatDate(selectedOrder.createdAt)} {new Date(selectedOrder.createdAt).toLocaleTimeString()}</span></div>
                          {selectedOrder.updatedAt && <div className="flex items-center gap-2"><span>Updated:</span><span>{formatDate(selectedOrder.updatedAt)} {new Date(selectedOrder.updatedAt).toLocaleTimeString()}</span></div>}
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 