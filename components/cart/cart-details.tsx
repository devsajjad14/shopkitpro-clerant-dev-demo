'use client'
import { useCartStore } from '@/lib/stores/cart-store'
import { Trash2, Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'
import { getOptimizedImageUrl } from '@/lib/utils/cart-image-client'
import { useEnhancedCartItems } from '@/hooks/use-enhanced-cart-items'
import { urlFriendly } from '@/lib/utils/index'
import { useCartTracking } from '@/hooks/use-cart-tracking'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: 100 },
}

export default function CartDetails() {
  const { removeFromCart, updateQuantity, clearCart } = useCartStore()
  const { items, isLoading } = useEnhancedCartItems()
  const [isMounted, setIsMounted] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const { trackRemoveFromCart, trackUpdateQuantity } = useCartTracking()

  useEffect(() => setIsMounted(true), [])

  const handleRemove = (id: string) => {
    setRemovingId(id)
    // Find the item being removed for tracking
    const item = items.find(item => item.id === id)
    if (item) {
      trackRemoveFromCart(item, item.quantity)
    }
    setTimeout(() => removeFromCart(id), 300)
  }

  const handleQuantityUpdate = (id: string, oldQuantity: number, newQuantity: number) => {
    const item = items.find(item => item.id === id)
    if (item) {
      trackUpdateQuantity(item, oldQuantity, newQuantity)
    }
    updateQuantity(id, newQuantity)
  }

  if (!isMounted) return null
  if (isLoading) {
    return (
      <div className='space-y-4 sm:space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>
            Your{' '}
            <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Cart
            </span>
          </h2>
        </div>
        <div className='space-y-3 sm:space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='animate-pulse'>
              <div className='flex gap-3 sm:gap-4'>
                <div className='h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 bg-gray-200 rounded-xl'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                  <div className='h-3 bg-gray-200 rounded w-1/4'></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (items.length === 0) return <EmptyCart />

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header with Artistic Clear Cart Action */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>
          Your{' '}
          <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            Cart
          </span>
          <span className='ml-2 text-blue-600'>({items.length})</span>
        </h2>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => window.location.reload()}
            className='group flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors'
          >
            <ArrowPathIcon className='h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:rotate-180' />
            <span className='hidden sm:inline'>Refresh</span>
          </button>
          {/* Minimal Artistic Clear Cart Action */}
          <button
            onClick={clearCart}
            className='group flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors relative bg-transparent border-none p-0 outline-none focus:outline-none'
            style={{ boxShadow: 'none' }}
            title='Clear all items from cart'
          >
            <Trash2 className='h-3 w-3 sm:h-4 sm:w-4 transition-colors group-hover:text-purple-600' />
            <span className='hidden sm:inline group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4'>Clear Cart</span>
          </button>
        </div>
      </div>
      {/* Cart Items */}
      <div className='space-y-4 sm:space-y-6'>
        <AnimatePresence mode='popLayout'>
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              layout
              className={cn(
                'group relative py-4 sm:py-6 overflow-hidden',
                removingId === item.id ? 'opacity-60' : ''
              )}
            >
              {/* Glow Effect */}
              <div className='absolute inset-0 -z-10 bg-gradient-to-r from-white via-blue-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity' />

              <div className='flex gap-3 sm:gap-4'>
                {/* Product Image */}
                <Link href={`/product/id/${item.productId}/name/${urlFriendly(item.name)}`} className='flex-shrink-0'>
                  <div className='relative h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200/50 bg-gray-50 shadow-inner hover:border-blue-300 transition-colors'>
                    <Image
                      src={getOptimizedImageUrl(item.image)}
                      alt={item.name}
                      fill
                      unoptimized
                      className='object-contain object-center p-2 transition-transform group-hover:scale-105'
                      sizes='(max-width: 640px) 80px, (max-width: 1024px) 96px, 128px'
                    />
                    <div className='absolute top-1 right-1 sm:top-2 sm:right-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xs font-bold text-white shadow-sm backdrop-blur-sm'>
                      ×{item.quantity}
                    </div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className='flex flex-1 flex-col justify-between min-w-0'>
                  <div className='space-y-1 sm:space-y-2'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate'>
                          <Link href={`/product/id/${item.productId}/name/${urlFriendly(item.name)}`} className='hover:text-blue-600 transition-colors'>
                            {item.name}
                          </Link>
                        </h3>
                        <p className='text-xs sm:text-sm text-gray-500'>
                          Style: {item.styleCode}
                        </p>
                        {item.color && (
                          <p className='text-xs sm:text-sm text-gray-600'>
                            Color: <span className='font-medium'>{item.color}</span>
                          </p>
                        )}
                        {item.size && (
                          <p className='text-xs sm:text-sm text-gray-600'>
                            Size: <span className='font-medium'>{item.size}</span>
                          </p>
                        )}
                      </div>
                      <div className='text-right flex-shrink-0'>
                        <p className='text-base sm:text-lg font-bold text-gray-900'>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className='text-xs sm:text-sm text-gray-500'>
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Remove */}
                  <div className='mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3'>
                    <div className='flex items-center rounded-lg border border-gray-300/80 bg-white shadow-sm overflow-hidden'>
                      <button
                        onClick={() =>
                          handleQuantityUpdate(
                            item.id,
                            item.quantity,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        disabled={item.quantity <= 1}
                        className='h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30'
                      >
                        <svg
                          className='h-3 w-3 sm:h-4 sm:w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M20 12H4'
                          />
                        </svg>
                      </button>
                      <input
                        type='number'
                        min='1'
                        max={item.maxQuantity}
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityUpdate(
                            item.id,
                            item.quantity,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className='h-8 w-10 sm:h-9 sm:w-12 border-x border-gray-300/80 text-center text-xs sm:text-sm font-medium [-moz-appearance:_textfield] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                      />
                      <button
                        onClick={() =>
                          handleQuantityUpdate(
                            item.id,
                            item.quantity,
                            Math.min(item.maxQuantity, item.quantity + 1)
                          )
                        }
                        disabled={item.quantity >= item.maxQuantity}
                        className='h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30'
                      >
                        <svg
                          className='h-3 w-3 sm:h-4 sm:w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M12 4v16m8-8H4'
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      onClick={() => handleRemove(item.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className='ml-auto relative rounded-full p-1 sm:p-1.5 text-red-500 hover:text-red-600 transition-colors duration-200'
                    >
                      <XMarkIcon className='h-4 w-4 sm:h-5 sm:w-5' />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function EmptyCart() {
  return (
    <div className='flex flex-col items-center justify-center py-8 sm:py-12 animate-fade-in'>
      {/* Premium SVG Illustration */}
      <div className='relative w-40 h-32 sm:w-56 sm:h-40 mb-6'>
        <svg viewBox='0 0 220 140' fill='none' xmlns='http://www.w3.org/2000/svg' className='w-full h-full'>
          <defs>
            <linearGradient id='cartGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#a1c4fd' />
              <stop offset='100%' stopColor='#c2e9fb' />
            </linearGradient>
            <linearGradient id='cartShadow' x1='0' y1='1' x2='1' y2='1'>
              <stop offset='0%' stopColor='#e0e7ef' stopOpacity='0.7' />
              <stop offset='100%' stopColor='#f8fafc' stopOpacity='0.2' />
            </linearGradient>
          </defs>
          <ellipse cx='110' cy='130' rx='70' ry='10' fill='url(#cartShadow)' />
          <rect x='40' y='40' width='140' height='60' rx='16' fill='url(#cartGradient)' />
          <rect x='60' y='60' width='100' height='30' rx='8' fill='#fff' />
          <circle cx='80' cy='105' r='8' fill='#d1eaff' />
          <circle cx='140' cy='105' r='8' fill='#d1eaff' />
          <rect x='100' y='70' width='20' height='6' rx='3' fill='#e0e7ef' />
        </svg>
      </div>
      <h3 className='mt-2 text-lg sm:text-xl font-semibold text-gray-900 tracking-tight text-center'>
        Your cart is empty
      </h3>
      <p className='mt-1 text-sm text-gray-500 text-center max-w-xs'>
        Looks like you haven&apos;t added anything yet. Discover our premium products and fill your cart with something amazing!
      </p>
      <Link
        href='/'
        className='mt-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all'
      >
        Continue Shopping
      </Link>
    </div>
  )
}
