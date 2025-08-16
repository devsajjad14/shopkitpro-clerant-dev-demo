'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/solid'
import { getOptimizedImageUrl } from '@/lib/utils/cart-image-client'
import { useEnhancedCartItems } from '@/hooks/use-enhanced-cart-items'
import Link from 'next/link'
import { urlFriendly } from '@/lib/utils/index'

export default function CheckoutSummary() {
  const { getTotalItems, getTotalPrice, shippingCost } = useCartStore()
  const { items, isLoading } = useEnhancedCartItems()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const subtotal = getTotalPrice() - shippingCost
  const tax = (subtotal + shippingCost) * 0.08 // 8% tax
  const total = subtotal + shippingCost + tax

  if (!isMounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className='rounded-2xl bg-white/80 backdrop-blur-sm p-4 sm:p-6 shadow-[0_8px_32px_rgba(31,38,135,0.07)] border border-white/20'
    >
      {/* Header - Responsive */}
      <div className='flex items-center justify-between mb-4 sm:mb-6'>
        <h2 className='text-lg sm:text-xl font-bold text-gray-900 tracking-tight'>
          Order Summary
        </h2>
        <span className='text-xs font-medium bg-black text-white px-2 py-1 rounded-full'>
          {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Order Items - Premium Scrollable List - Responsive height */}
      <div className='max-h-[200px] sm:max-h-[300px] overflow-y-auto pr-2 -mr-2 custom-scrollbar'>
        {isLoading ? (
          <div className='space-y-3 sm:space-y-4 p-3 sm:p-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='animate-pulse'>
                <div className='flex gap-3 sm:gap-4'>
                  <div className='h-16 w-16 sm:h-20 sm:w-20 bg-gray-200 rounded-lg flex-shrink-0'></div>
                  <div className='flex-1 space-y-2 min-w-0'>
                    <div className='h-3 bg-gray-200 rounded w-3/4'></div>
                    <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                    <div className='h-3 bg-gray-200 rounded w-1/4'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className='divide-y divide-gray-200/50 p-3 sm:p-4'>
            {items.map((item) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className='py-3 sm:py-4 first:pt-0 last:pb-0'
              >
                <div className='flex gap-3 sm:gap-4'>
                  <Link href={`/product/id/${item.productId}/name/${urlFriendly(item.name)}`} className='flex-shrink-0'>
                    <div className='flex-shrink-0 relative'>
                      <Image
                        src={getOptimizedImageUrl(item.image)}
                        alt={item.name}
                        width={80}
                        height={80}
                        unoptimized
                        className='rounded-lg object-contain w-16 h-16 sm:w-20 sm:h-20 border border-gray-200/50 bg-gray-50 p-1 hover:border-blue-300 transition-colors'
                      />
                      <span className='absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-black text-white text-xs font-medium rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center'>
                        {item.quantity}
                      </span>
                    </div>
                  </Link>
                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2'>
                      <h3 className='text-sm font-medium text-gray-900 truncate'>
                        <Link href={`/product/id/${item.productId}/name/${urlFriendly(item.name)}`} className='hover:text-blue-600 transition-colors'>
                          {item.name}
                        </Link>
                      </h3>
                    </div>
                    {(item.color || item.size) && (
                      <div className='mt-1 flex flex-wrap gap-1 sm:gap-2'>
                        {item.color && (
                          <span className='inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'>
                            {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span className='inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800'>
                            {item.size}
                          </span>
                        )}
                      </div>
                    )}
                    <div className='mt-2 flex items-center'>
                      <span className='text-xs text-gray-500'>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* Order Summary - Glass Panel - Responsive padding */}
      <div className='mt-4 sm:mt-6 rounded-xl bg-gradient-to-br from-white to-gray-50 p-3 sm:p-4 border border-gray-200/50'>
        <dl className='space-y-2 sm:space-y-3'>
          <div className='flex items-center justify-between'>
            <dt className='text-sm text-gray-600'>Subtotal</dt>
            <dd className='text-sm font-medium text-gray-900'>
              ${subtotal.toFixed(2)}
            </dd>
          </div>
          <div className='flex items-center justify-between'>
            <dt className='text-sm text-gray-600'>Shipping</dt>
            <dd className='text-sm font-medium text-gray-900'>
              ${shippingCost.toFixed(2)}
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

      {/* Delivery Estimate - Premium Card - Responsive */}
      <div className='mt-4 sm:mt-6 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 sm:p-4 border border-indigo-200/50'>
        <div className='flex items-start'>
          <div className='flex-shrink-0 p-1.5 bg-indigo-100 rounded-lg'>
            <svg
              className='h-4 w-4 sm:h-5 sm:w-5 text-indigo-600'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <div className='ml-3 min-w-0 flex-1'>
            <h3 className='text-sm font-medium text-indigo-900'>
              Estimated delivery
            </h3>
            <p className='mt-1 text-xs sm:text-sm text-indigo-800'>
              {new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
              ).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Security Badge - Premium Glass - Responsive */}
      <div className='mt-4 sm:mt-6 rounded-xl bg-gradient-to-br from-white to-gray-50 p-3 sm:p-4 border border-gray-200/50'>
        <div className='flex items-start'>
          <div className='flex-shrink-0 p-1.5 bg-green-100 rounded-lg'>
            <ShieldCheckIcon className='h-4 w-4 sm:h-5 sm:w-5 text-green-600' />
          </div>
          <div className='ml-3 min-w-0 flex-1'>
            <h3 className='text-sm font-medium text-gray-900'>
              Secure Checkout
            </h3>
            <p className='mt-1 text-xs text-gray-600'>
              Your payment information is encrypted and secure. We never store
              your credit card details.
            </p>
            <div className='mt-3 flex items-center space-x-4'>
              <LockClosedIcon className='h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0' />
              <span className='text-xs text-gray-500'>
                256-bit SSL encryption
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Icons - Responsive */}
      <div className='mt-4 sm:mt-6 flex justify-center space-x-3 sm:space-x-4'>
        <Image
          src='/images/checkout/visa.svg'
          alt='Visa'
          width={32}
          height={20}
          className='h-4 w-auto sm:h-5 opacity-80 hover:opacity-100 transition-opacity'
        />
        <Image
          src='/images/checkout/mastercard.svg'
          alt='Mastercard'
          width={32}
          height={20}
          className='h-4 w-auto sm:h-5 opacity-80 hover:opacity-100 transition-opacity'
        />
        <Image
          src='/images/checkout/amex.svg'
          alt='Amex'
          width={32}
          height={20}
          className='h-4 w-auto sm:h-5 opacity-80 hover:opacity-100 transition-opacity'
        />
        <Image
          src='/images/checkout/paypal.svg'
          alt='PayPal'
          width={32}
          height={20}
          className='h-4 w-auto sm:h-5 opacity-80 hover:opacity-100 transition-opacity'
        />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </motion.div>
  )
}
