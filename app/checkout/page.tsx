'use client'

import CheckoutContent from '@/components/checkout/checkout-content'
import { useSyncCartSessionOnLogin } from '@/hooks/use-sync-cart-session-on-login'

export default function CheckoutPage() {
  useSyncCartSessionOnLogin()
  return (
    <main>
      <CheckoutContent />
    </main>
  )
}
