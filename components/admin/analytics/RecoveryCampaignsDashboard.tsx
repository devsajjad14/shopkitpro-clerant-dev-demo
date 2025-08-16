'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  FiMail, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye,
  FiSend,
  FiPause,
  FiPlay,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiShoppingCart,
  FiRefreshCw
} from 'react-icons/fi'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

interface AbandonedCart {
  id: string
  sessionId: string
  customerEmail: string
  customerName: string
  totalAmount: number
  itemCount: number
  abandonedAt: string
  emailsSent: number
  lastEmailSent: string | null
  recovered: boolean
}

export default function RecoveryCampaignsDashboard() {
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [emailsSent, setEmailsSent] = useState(0)
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    Promise.all([fetchAbandonedCarts(), fetchEmailsSent()]).finally(() => setLoading(false));
  }, []);

  const fetchAbandonedCarts = async () => {
    try {
      const response = await fetch('/api/analytics/abandoned-carts?days=7')
      const data = await response.json()
      if (data.success) setAbandonedCarts(data.carts)
    } catch (error) {
      setAbandonedCarts([])
    }
  }

  const fetchEmailsSent = async () => {
    try {
      const response = await fetch('/api/recovery/emails-sent')
      const data = await response.json()
      if (data.success) setEmailsSent(data.count)
    } catch (error) {
      setEmailsSent(0)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      // Trigger abandonment detection by calling the abandoned carts API
      await fetch('/api/analytics/abandoned-carts?days=7')
      await Promise.all([fetchAbandonedCarts(), fetchEmailsSent()])
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                  <FiShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Abandoned Carts</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Send recovery emails to customers with abandoned carts. Recovered carts are marked with green status.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <div className="relative bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-xl rounded-xl border border-blue-200/50 dark:border-blue-700/30 shadow-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 font-semibold">
                    <FiMail className="w-5 h-5 text-blue-500" />
                    Total Emails Sent: {emailsSent}
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">All time</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm" 
                disabled={loading}
                className="h-11 px-6 bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 hover:border-[#00437f] hover:bg-[#00437f]/5 rounded-xl transition-all duration-200"
              >
                <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Table */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Abandoned At</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white/60 dark:bg-gray-800/60 divide-y divide-gray-200 dark:divide-gray-700">
                {abandonedCarts && abandonedCarts.length > 0 ? (
                  abandonedCarts.slice(0, 20).map((cart) => (
                    <tr key={cart.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-300 group">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                          <FiUsers className="w-4 h-4 text-white" />
                        </div>
                        {cart.customerName || cart.customerEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {cart.recovered ? (
                          <Badge variant="outline" className="bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 shadow-md">
                            <FiTrendingUp className="w-3 h-3 mr-1" />
                            Recovered
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-500 shadow-md">
                            Abandoned
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{cart.customerEmail}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-gray-900 dark:text-white">{cart.itemCount || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-green-600 dark:text-green-400">${(cart.totalAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-xs">
                        {cart.abandonedAt ? new Date(cart.abandonedAt).toLocaleString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {cart.recovered ? (
                          <Badge variant="outline" className="bg-gradient-to-r from-green-500 to-green-600 text-white border-green-500 font-semibold shadow-md">
                            <FiTrendingUp className="w-4 h-4 mr-1" />
                            Recovered
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="px-4 py-2 font-semibold rounded-xl shadow-lg bg-gradient-to-r from-[#00437f] to-[#003366] text-white hover:from-[#003366] hover:to-[#002855] transition-all duration-200 transform hover:scale-105" 
                            disabled={sendingId === cart.id} 
                            onClick={async () => {
                              setSendingId(cart.id)
                              const res = await fetch('/api/recovery/send-email', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ cartId: cart.id }),
                              })
                              const data = await res.json()
                              setSendingId(null)
                              if (data.success) {
                                toast.success('Email sent!')
                                fetchEmailsSent()
                              } else {
                                toast.error('Failed to send email: ' + (data.error || 'Unknown error'))
                              }
                              fetchAbandonedCarts()
                            }}
                          >
                            {sendingId === cart.id ? (
                              <span className="flex items-center">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                                Sending...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <FiMail className="w-4 h-4 mr-2" />
                                {cart.emailsSent > 0 ? 'Resend Email' : 'Send Email'}
                              </span>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg mb-4">
                          <FiShoppingCart className="w-8 h-8 text-white" />
                        </div>
                        <p className="text-lg font-semibold">No abandoned carts found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Carts will appear here once customers abandon their shopping carts</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 