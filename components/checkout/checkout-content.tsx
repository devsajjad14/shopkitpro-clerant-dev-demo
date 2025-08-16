'use client'

import CheckoutForm from '@/components/checkout/checkout-form'
import CheckoutSummary from '@/components/checkout/checkout-summary'
import { useCartStore } from '@/lib/stores/cart-store'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import NotLoginCheckoutForm from './not-login-checkout-form'
import { useCartTracking } from '@/hooks/use-cart-tracking'

export default function CheckoutContent() {
  const { data: session } = useSession()
  const { items, getTotalPrice } = useCartStore()
  const router = useRouter()
  const { trackCompleteCheckout } = useCartTracking()
  const sessionIdRef = useRef<string | null>(null)
  const [cartTrackingEnabled, setCartTrackingEnabled] = useState<boolean>(false)

  // Check if cart abandonment tracking is enabled
  useEffect(() => {
    async function checkCartTrackingStatus() {
      try {
        const response = await fetch('/api/cart-abandonment-toggle')
        const data = await response.json()
        setCartTrackingEnabled(!!data?.data?.isEnabled)
      } catch (error) {
        console.log('Cart tracking status check failed, defaulting to disabled')
        setCartTrackingEnabled(false)
      }
    }
    checkCartTrackingStatus()
  }, [])

  // Redirect to cart if no items
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  // Create cart session when checkout page loads
  useEffect(() => {
    const createCheckoutSession = async () => {
      // Only create session if cart tracking is enabled
      if (!cartTrackingEnabled) {
        console.log('Cart tracking is disabled, skipping checkout session creation')
        return
      }

      if (!session?.user?.email) {
        console.log('❌ User not logged in, skipping checkout session creation')
        return
      }

      // Check if this is a recovery scenario
      const urlParams = new URLSearchParams(window.location.search)
      const isRecovery = urlParams.get('recovery') === 'true'
      
      if (isRecovery) {
        console.log('🔄 Recovery scenario detected, skipping checkout session creation')
        return
      }

      const itemCount = items.length
      const totalAmount = getTotalPrice()

      // Only create session if there are items
      if (itemCount <= 0 || totalAmount <= 0) {
        console.log('❌ No items in cart, skipping checkout session creation')
        return
      }

      const sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionIdRef.current = sessionId

      const cartData = {
        itemCount,
        totalAmount,
        items
      }

      console.log('🔍 Creating checkout session:', {
        sessionId,
        itemCount,
        totalAmount,
        userEmail: session.user.email
      })

      try {
        const response = await fetch('/api/cart-tracking/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            userId: session.user.id,
            email: session.user.email,
            name: session.user.name,
            cartData,
          }),
        })

        if (response.ok) {
          console.log('✅ Checkout session created successfully')
        } else {
          console.error('❌ Failed to create checkout session')
        }
      } catch (error) {
        console.error('❌ Error creating checkout session:', error)
      }
    }

    createCheckoutSession()
  }, [cartTrackingEnabled, session?.user?.email, session?.user?.id, session?.user?.name, items, getTotalPrice])

  // Track abandonment when user leaves checkout
  useEffect(() => {
    const handleBeforeUnload = async () => {
      // Only track abandonment if cart tracking is enabled
      if (!cartTrackingEnabled) return
      
      if (!sessionIdRef.current || !session?.user?.email) return

      const itemCount = items.length
      const totalAmount = getTotalPrice()

      if (itemCount <= 0 || totalAmount <= 0) return

      const cartData = {
        itemCount,
        totalAmount,
        items
      }

      console.log('🚨 User leaving checkout - marking as abandoned:', {
        sessionId: sessionIdRef.current,
        itemCount,
        totalAmount
      })

      try {
        // Use sendBeacon for reliable abandonment tracking
        const blob = new Blob([JSON.stringify({
          sessionId: sessionIdRef.current,
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name,
          cartData,
        })], { type: 'application/json' })

        navigator.sendBeacon('/api/cart-tracking/abandon', blob)
      } catch (error) {
        console.error('❌ Error tracking abandonment:', error)
      }
    }

    const handleVisibilityChange = async () => {
      // Only track abandonment if cart tracking is enabled
      if (!cartTrackingEnabled) return
      
      if (document.hidden && sessionIdRef.current && session?.user?.email) {
        const itemCount = items.length
        const totalAmount = getTotalPrice()

        if (itemCount <= 0 || totalAmount <= 0) return

        const cartData = {
          itemCount,
          totalAmount,
          items
        }

        console.log('🚨 Page hidden - marking as abandoned:', {
          sessionId: sessionIdRef.current,
          itemCount,
          totalAmount
        })

        try {
          const response = await fetch('/api/cart-tracking/abandon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sessionIdRef.current,
              userId: session.user.id,
              email: session.user.email,
              name: session.user.name,
              cartData,
            }),
          })

          if (response.ok) {
            console.log('✅ Abandonment tracked successfully')
          }
        } catch (error) {
          console.error('❌ Error tracking abandonment:', error)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [cartTrackingEnabled, session?.user?.email, session?.user?.id, session?.user?.name, items, getTotalPrice])

  // Function to handle successful checkout completion
  const handleCheckoutComplete = (orderData: any) => {
    const orderInfo = {
      totalAmount: getTotalPrice(),
      itemCount: items.length,
      orderId: orderData?.orderId,
      ...orderData
    }
    trackCompleteCheckout(orderInfo)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Premium accent bar */}
      <div className='h-1 bg-gradient-to-r from-indigo-600 to-purple-600 w-full'></div>

      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Modern header - Responsive */}
        <div className='mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600'>
              Checkout
            </span>
          </h1>
          <div className='text-xs sm:text-sm text-gray-500'></div>
        </div>

        {/* Responsive layout - Stack on mobile, side-by-side on desktop */}
        <div className='flex flex-col lg:flex-row gap-4 lg:gap-6'>
          {/* Checkout Form - Full width on mobile, 68% on desktop */}
          {session?.user ? (
            <div className='w-full lg:w-[68%] order-2 lg:order-1'>
              <div className='bg-white rounded-xl border border-gray-200 shadow-sm'>
                <CheckoutForm />
              </div>
            </div>
          ) : (
            <div className='w-full lg:w-[68%] order-2 lg:order-1'>
              <div className='bg-white rounded-xl border border-gray-200 shadow-sm'>
                <NotLoginCheckoutForm />
              </div>
            </div>
          )}

          {/* Checkout Summary - Full width on mobile, 32% on desktop, sticky on desktop */}
          <div className='w-full lg:w-[32%] order-1 lg:order-2 lg:sticky lg:top-4 lg:self-start'>
            <div className='bg-white rounded-xl border border-gray-200 shadow-sm'>
              <CheckoutSummary />
            </div>
          </div>
        </div>

        {/* Trust badges - Responsive layout */}
        <div className='mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-8'>
          <div className='flex items-center text-xs font-medium text-gray-600'>
            <svg
              className='h-4 w-4 text-green-500 mr-1.5 flex-shrink-0'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                clipRule='evenodd'
              />
            </svg>
            <span className='whitespace-nowrap'>Secure Checkout</span>
          </div>
          <div className='flex items-center text-xs font-medium text-gray-600'>
            <svg
              className='h-4 w-4 text-blue-500 mr-1.5 flex-shrink-0'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M3 17a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 17z'
                clipRule='evenodd'
              />
            </svg>
            <span className='whitespace-nowrap'>PCI Compliant</span>
          </div>
          <div className='flex items-center text-xs font-medium text-gray-600'>
            <svg
              className='h-4 w-4 text-purple-500 mr-1.5 flex-shrink-0'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z'
                clipRule='evenodd'
              />
            </svg>
            <span className='whitespace-nowrap'>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  )
} 