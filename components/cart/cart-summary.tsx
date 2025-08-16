'use client'
import { useCartStore } from '@/lib/stores/cart-store'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheckIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useCartTracking } from '@/hooks/use-cart-tracking'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CartSummary() {
  const { getTotalItems, getTotalPrice } = useCartStore()
  const [isMounted, setIsMounted] = useState(false)
  const { trackStartCheckout } = useCartTracking()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const handleCheckoutClick = () => {
    const cartData = {
      itemCount: getTotalItems(),
      totalAmount: total,
    }
    trackStartCheckout(cartData)
    
    // Get recovery parameters directly from window.location
    const urlParams = new URLSearchParams(window.location.search)
    const isRecovery = urlParams.get('recovery') === 'true'
    const recoveryEmail = urlParams.get('email')
    const recoveryCartId = urlParams.get('cart')
    
    if (isRecovery && recoveryEmail && recoveryCartId) {
      const checkoutUrl = `/checkout?recovery=true&email=${encodeURIComponent(recoveryEmail)}&cart=${recoveryCartId}`
      router.push(checkoutUrl)
      return
    }
    
    router.push('/checkout')
  }

  if (!isMounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='rounded-2xl bg-white/80 backdrop-blur-sm p-4 sm:p-6 shadow-[0_8px_32px_rgba(31,38,135,0.07)] border border-white/20'
    >
      <div className='flex items-center justify-between mb-4 sm:mb-6'>
        <h2 className='text-lg sm:text-xl font-bold text-gray-900 tracking-tight'>
          Cart Summary
        </h2>
        <span className='text-xs font-medium bg-black text-white px-2 py-1 rounded-full'>
          {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Order Summary - Glass Panel */}
      <div className='rounded-xl bg-gradient-to-br from-white to-gray-50 p-3 sm:p-4 border border-gray-200/50'>
        <dl className='space-y-2 sm:space-y-3'>
          <div className='flex items-center justify-between'>
            <dt className='text-sm text-gray-600'>Subtotal</dt>
            <dd className='text-sm font-medium text-gray-900'>
              ${subtotal.toFixed(2)}
            </dd>
          </div>
          <div className='flex items-center justify-between'>
            <dt className='text-sm text-gray-600'>Tax</dt>
            <dd className='text-sm font-medium text-gray-900'>
              ${tax.toFixed(2)}
            </dd>
          </div>
          <div className='flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-200/50'>
            <dt className='text-base font-bold text-gray-900'>Total</dt>
            <dd className='text-base font-bold text-gray-900'>
              ${total.toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Secure Shopping Badge */}
      <div className='mt-4 sm:mt-6 rounded-xl bg-gradient-to-br from-white to-gray-50 p-3 sm:p-4 border border-gray-200/50'>
        <div className='flex items-start'>
          <div className='flex-shrink-0 p-1.5 bg-green-100 rounded-lg'>
            <ShieldCheckIcon className='h-4 w-4 sm:h-5 sm:w-5 text-green-600' />
          </div>
          <div className='ml-3'>
            <h3 className='text-sm font-medium text-gray-900'>
              Secure Shopping
            </h3>
            <p className='mt-1 text-xs text-gray-600'>
              Your information is protected by 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckoutClick}
        className='mt-4 sm:mt-6 block w-full rounded-full bg-black px-4 sm:px-6 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors'
      >
        Proceed to Checkout
      </button>
    </motion.div>
  )
}
