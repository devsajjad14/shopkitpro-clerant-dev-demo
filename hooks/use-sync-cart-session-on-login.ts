import { useSession } from 'next-auth/react'
import { useCartStore } from '@/lib/stores/cart-store'
import { useEffect } from 'react'

export function useSyncCartSessionOnLogin() {
  const { data: session } = useSession()
  const { getTotalItems, getTotalPrice, items } = useCartStore()

  useEffect(() => {
    if (
      session?.user?.id &&
      session?.user?.email &&
      Array.isArray(items) &&
      items.length > 0
    ) {
      // User just logged in and cart is not empty, sync cart to server
      const cartData = {
        itemCount: getTotalItems(),
        totalAmount: getTotalPrice(),
        items,
      }
      console.log('Syncing cart session on login:', cartData)
      fetch('/api/cart-tracking/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: localStorage.getItem('cartSessionId'),
          userId: session.user.id,
          email: session.user.email,
          name: session.user.name,
          cartData,
        }),
      })
    }
  }, [session?.user?.id, session?.user?.email, items])
} 