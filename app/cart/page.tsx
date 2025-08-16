import { Metadata } from 'next'
import CartPageClient from './CartPageClient'

export const metadata: Metadata = {
  title: 'Your Cart - My Store',
  description: 'Review your items and proceed to checkout',
}

export default function CartPage() {
  return <CartPageClient />
}
