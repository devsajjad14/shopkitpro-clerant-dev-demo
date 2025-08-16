'use client'

import CartDetails from '@/components/cart/cart-details'
import CartSummary from '@/components/cart/cart-summary'
import { Suspense, useEffect } from 'react'
import CartLoading from '@/components/cart/cart-loading'
import { useCartTracking } from '@/hooks/use-cart-tracking'
import { useCartStore } from '@/lib/stores/cart-store'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function CartPageClient() {
  const { trackCartView, trackCartAbandonment } = useCartTracking()
  const { getTotalItems, getTotalPrice, setItems } = useCartStore()
  const searchParams = useSearchParams()
  const isRecovery = searchParams.get('recovery') === 'true'
  const recoveryEmail = searchParams.get('email')
  const recoveryCartId = searchParams.get('cart')
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null)

  // Handle cart recovery
  useEffect(() => {
    if (isRecovery && recoveryCartId) {
      // Fetch cart data from the recovery session
      const fetchRecoveryCart = async () => {
        try {
          const response = await fetch(`/api/recovery/cart-data?cartId=${recoveryCartId}`)
          const data = await response.json()
           
          if (data.success && data.cartItems) {
            // Clear any existing cart first
            setItems([])
            
            // Set the recovery items with a small delay to ensure proper state update
            setTimeout(() => {
              setItems(data.cartItems)
              setRecoveryMessage(`🎉 Welcome back! Your cart with ${data.cartItems.length} items has been restored.`)
              
              // Clear message after 5 seconds
              setTimeout(() => setRecoveryMessage(null), 5000)
            }, 100)
          }
        } catch (error) {
          console.error('Failed to fetch recovery cart:', error)
        }
      }
      
      fetchRecoveryCart()
    }
  }, [isRecovery, recoveryCartId, recoveryEmail, setItems])

  // Track cart view when component mounts (but not for recovery scenarios)
  useEffect(() => {
    // Don't track cart view if this is a recovery scenario
    if (isRecovery) {
      console.log('Cart tracking skipped: Recovery scenario detected')
      return
    }

    const itemCount = getTotalItems()
    const totalAmount = getTotalPrice()

    // Only track if there are items and total amount > 0
    if (itemCount > 0 && totalAmount > 0) {
      const cartItems = useCartStore.getState().items
      const cartData = {
        itemCount,
        totalAmount,
        items: cartItems, // Include cart items for hash generation
      }
      trackCartView(cartData)
    } else {
      console.log('Cart tracking skipped: Empty cart or zero total', { itemCount, totalAmount })
    }
  }, [trackCartView, getTotalItems, getTotalPrice, isRecovery])

  // Track cart abandonment with proper validation (but not for recovery scenarios)
  useEffect(() => {
    // Don't track abandonment if this is a recovery scenario
    if (isRecovery) {
      console.log('Cart abandonment tracking skipped: Recovery scenario detected')
      return
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const itemCount = getTotalItems()
        const totalAmount = getTotalPrice()

        // Only track abandonment if there are items and total amount > 0
        if (itemCount > 0 && totalAmount > 0) {
          const cartItems = useCartStore.getState().items
          const cartData = {
            itemCount,
            totalAmount,
            items: cartItems, // Include cart items for hash generation
          }
          setTimeout(() => {
            if (document.hidden) {
              trackCartAbandonment(cartData)
            }
          }, 30000) // 30 seconds after page is hidden
        }
      }
    }

    const handleBeforeUnload = () => {
      const itemCount = getTotalItems()
      const totalAmount = getTotalPrice()

      // Only track abandonment if there are items and total amount > 0
      if (itemCount > 0 && totalAmount > 0) {
        const cartItems = useCartStore.getState().items
        const cartData = {
          itemCount,
          totalAmount,
          items: cartItems, // Include cart items for hash generation
        }
        trackCartAbandonment(cartData)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [trackCartAbandonment, getTotalItems, getTotalPrice, isRecovery])

  return (
    <div className='bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen'>
      <div className='mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24 pt-8 sm:pt-12 '>
        {/* Recovery Message */}
        {recoveryMessage && (
          <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <svg className='h-5 w-5 text-green-400' viewBox='0 0 20 20' fill='currentColor'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                </svg>
              </div>
              <div className='ml-3'>
                <p className='text-sm font-medium text-green-800'>{recoveryMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className='grid grid-cols-1 gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-12'>
          {/* Main Cart Section */}
          <section className='lg:col-span-8 xl:col-span-9'>
            <Suspense fallback={<CartLoading />}>
              <CartDetails />
            </Suspense>
          </section>

          {/* Cart Summary Sidebar */}
          <aside className='lg:col-span-4 xl:col-span-3'>
            <div className='lg:sticky lg:top-8'>
              <CartSummary />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
