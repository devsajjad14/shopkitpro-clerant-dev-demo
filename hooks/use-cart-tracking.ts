'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

export const useCartTracking = () => {
  const { data: session } = useSession()
  const sessionIdRef = useRef<string | null>(null)
  const [cartAbandonmentEnabled, setCartAbandonmentEnabled] = useState<boolean>(false)

  // Helper to check if user is logged in
  const isUserLoggedIn = !!session?.user?.id && !!session?.user?.email

  useEffect(() => {
    async function fetchToggle() {
      try {
        const res = await fetch('/api/cart-abandonment-toggle')
        const data = await res.json()
        setCartAbandonmentEnabled(!!data?.data?.isEnabled)
      } catch {
        setCartAbandonmentEnabled(false)
      }
    }
    fetchToggle()
  }, [])

  // Track cart view
  const trackCartView = useCallback(async (cartData?: any) => {
    if (!cartAbandonmentEnabled) {
      console.log('Cart tracking is disabled, skipping cart view tracking')
      return
    }
    if (!isUserLoggedIn) return
    try {
      let sessionId = sessionIdRef.current
      if (!sessionId) {
        sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionIdRef.current = sessionId
      }
      await fetch('/api/cart-tracking/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.name,
          cartData,
        }),
      })
    } catch (error) {
      console.error('Error tracking cart view:', error)
    }
  }, [cartAbandonmentEnabled, session, isUserLoggedIn])

  // Track add to cart
  const trackAddToCart = useCallback(async (product: any, quantity: number = 1) => {
    if (!cartAbandonmentEnabled) {
      console.log('Cart tracking is disabled, skipping add to cart tracking')
      return
    }
    if (!isUserLoggedIn) return
    try {
      let sessionId = sessionIdRef.current
      if (!sessionId) {
        sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionIdRef.current = sessionId
      }
      await fetch('/api/cart-tracking/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.name,
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
          totalValue: product.price * quantity,
          metadata: { product },
        }),
      })
    } catch (error) {
      console.error('Error tracking add to cart:', error)
    }
  }, [cartAbandonmentEnabled, session, isUserLoggedIn])

  // Track remove from cart
  const trackRemoveFromCart = useCallback(async (product: any, quantity: number = 1) => {
    if (!cartAbandonmentEnabled) {
      console.log('Cart tracking is disabled, skipping remove from cart tracking')
      return
    }
    if (!isUserLoggedIn) return
    try {
      let sessionId = sessionIdRef.current
      if (!sessionId) {
        sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionIdRef.current = sessionId
      }
      await fetch('/api/cart-tracking/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.name,
          productId: product.id,
          productName: product.name,
          quantity,
          price: product.price,
          totalValue: product.price * quantity,
          metadata: { product },
        }),
      })
    } catch (error) {
      console.error('Error tracking remove from cart:', error)
    }
  }, [cartAbandonmentEnabled, session, isUserLoggedIn])

  // Track update quantity
  const trackUpdateQuantity = useCallback(async (product: any, oldQuantity: number, newQuantity: number) => {
    if (!cartAbandonmentEnabled) {
      console.log('Cart tracking is disabled, skipping quantity update tracking')
      return
    }
    if (!isUserLoggedIn) return
    try {
      let sessionId = sessionIdRef.current
      if (!sessionId) {
        sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionIdRef.current = sessionId
      }
      await fetch('/api/cart-tracking/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.name,
          productId: product.id,
          productName: product.name,
          quantity: newQuantity,
          price: product.price,
          totalValue: product.price * newQuantity,
          metadata: { product, oldQuantity, newQuantity },
        }),
      })
    } catch (error) {
      console.error('Error tracking quantity update:', error)
    }
  }, [cartAbandonmentEnabled, session, isUserLoggedIn])

  // Track start checkout
  const trackStartCheckout = useCallback(async (cartData?: any) => {
    if (!cartAbandonmentEnabled) {
      console.log('Cart tracking is disabled, skipping checkout tracking')
      return
    }
    if (!isUserLoggedIn) return
    try {
      let sessionId = sessionIdRef.current
      if (!sessionId) {
        sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionIdRef.current = sessionId
      }
      await fetch('/api/cart-tracking/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.name,
          totalValue: cartData?.totalAmount,
          metadata: { cartData },
        }),
      })
    } catch (error) {
      console.error('Error tracking start checkout:', error)
    }
  }, [cartAbandonmentEnabled, session, isUserLoggedIn])

  // Track complete checkout
  const trackCompleteCheckout = useCallback(async (orderData?: any) => {
    if (!cartAbandonmentEnabled) {
      console.log('Cart tracking is disabled, skipping checkout completion tracking')
      return
    }
    if (!isUserLoggedIn) return
    try {
      let sessionId = sessionIdRef.current
      if (!sessionId) {
        sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionIdRef.current = sessionId
      }
      await fetch('/api/cart-tracking/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.name,
          totalAmount: orderData?.totalAmount,
          cartData: orderData,
        }),
      })
    } catch (error) {
      console.error('Error tracking complete checkout:', error)
    }
  }, [cartAbandonmentEnabled, session, isUserLoggedIn])

  // Track recovery completion
  const trackRecoveryCompletion = useCallback(async (recoveryData: { recoveryCartId: string, recoveryEmail: string, orderData?: any }) => {
    if (!cartAbandonmentEnabled || !isUserLoggedIn) return
    
    try {
      let sessionId = sessionIdRef.current
      if (!sessionId) {
        sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionIdRef.current = sessionId
      }
      
      const response = await fetch('/api/cart-tracking/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.name,
          cartData: recoveryData.orderData,
          recoveryCartId: recoveryData.recoveryCartId,
          recoveryEmail: recoveryData.recoveryEmail,
        }),
      });
      
      const result = await response.json();
      console.log('📥 RECOVERY API RESPONSE:', result);
      
    } catch (error) {
      console.error('Error tracking recovery completion:', error)
    }
  }, [cartAbandonmentEnabled, session, isUserLoggedIn])

  // Track cart abandonment
  const trackCartAbandonment = useCallback(async (cartData?: any) => {
    if (!cartAbandonmentEnabled) {
      console.log('Cart tracking is disabled, skipping cart abandonment tracking')
      return
    }
    if (!isUserLoggedIn) return
    try {
      let sessionId = sessionIdRef.current
      if (!sessionId) {
        sessionId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionIdRef.current = sessionId
      }
      await fetch('/api/cart-tracking/abandon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.name,
          cartData,
        }),
      })
    } catch (error) {
      console.error('Error tracking cart abandonment:', error)
    }
  }, [cartAbandonmentEnabled, session, isUserLoggedIn])

  // Initialize tracking on mount
  useEffect(() => {
    // This useEffect is no longer needed as tracking is server-side
    // and sessionId is managed by the API route.
    // Keeping it for now to avoid breaking existing logic, but it will be removed.
  }, [])

  // Track page visibility changes for abandonment detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, could indicate abandonment
        setTimeout(() => {
          if (document.hidden) {
            // Note: We can't get cart data here since it's a global handler
            // The individual pages should handle their own abandonment tracking
            trackCartAbandonment()
          }
        }, 30000) // 30 seconds after page is hidden
      }
    }

    const handleBeforeUnload = () => {
      // Note: We can't get cart data here since it's a global handler
      // The individual pages should handle their own abandonment tracking
      trackCartAbandonment()
    }

    // Only add event listeners if cart tracking is enabled
    if (cartAbandonmentEnabled) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('beforeunload', handleBeforeUnload)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [trackCartAbandonment, cartAbandonmentEnabled])

  // Only expose tracking functions if enabled
  return {
    trackCartView,
    trackAddToCart,
    trackRemoveFromCart,
    trackUpdateQuantity,
    trackStartCheckout,
    trackCompleteCheckout,
    trackRecoveryCompletion,
    trackCartAbandonment,
    isTrackingEnabled: cartAbandonmentEnabled,
    sessionId: sessionIdRef.current,
  };
} 