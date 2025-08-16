'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { useEffect, useState } from 'react'
import { CartItem } from '@/lib/stores/cart-store'
import { enhanceCartItemsWithLocalData } from '@/lib/actions/cart/enhance-cart-items'

export function useEnhancedCartItems() {
  const { items } = useCartStore()
  const [enhancedItems, setEnhancedItems] = useState<CartItem[]>(items)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const enhanceItems = async () => {
      if (items.length > 0) {
        setIsLoading(true)
        try {
          const enhanced = await enhanceCartItemsWithLocalData(items)
          setEnhancedItems(enhanced)
        } catch (error) {
          console.error('Error enhancing cart items:', error)
          setEnhancedItems(items)
        } finally {
          setIsLoading(false)
        }
      } else {
        setEnhancedItems(items)
      }
    }

    enhanceItems()
  }, [items])

  return { items: enhancedItems, isLoading }
} 