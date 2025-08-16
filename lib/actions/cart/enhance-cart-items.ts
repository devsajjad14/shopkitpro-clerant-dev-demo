'use server'

import { getLocalCartItemData } from '@/lib/utils/cart-image-utils'
import { CartItem } from '@/lib/stores/cart-store'

export async function enhanceCartItemsWithLocalData(cartItems: CartItem[]): Promise<CartItem[]> {
  try {
    const enhancedItems = await getLocalCartItemData(cartItems)
    return enhancedItems
  } catch (error) {
    console.error('Error enhancing cart items with local data:', error)
    return cartItems
  }
} 