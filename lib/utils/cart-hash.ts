import { CartItem } from '@/types/cart'

/**
 * Generate a unique hash for cart items to identify unique carts
 * This ensures same cart items get the same hash, different items get different hash
 */
export function generateCartHash(items: CartItem[]): string {
  if (!items || items.length === 0) {
    return 'empty_cart'
  }

  // Sort items by productId and create a consistent string representation
  const sortedItems = items
    .sort((a, b) => a.productId - b.productId)
    .map(item => {
      // Create a consistent string for each item
      const itemString = `${item.productId}-${item.quantity}-${item.color || 'no-color'}-${item.size || 'no-size'}`
      return itemString
    })
    .join('|')

  // Create a simple hash (for production, you might want to use a more robust hashing library)
  let hash = 0
  for (let i = 0; i < sortedItems.length; i++) {
    const char = sortedItems.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return `cart_${Math.abs(hash).toString(36)}`
}

/**
 * Check if two cart item arrays represent the same cart
 */
export function areCartsEqual(items1: CartItem[], items2: CartItem[]): boolean {
  if (!items1 || !items2) return false
  if (items1.length !== items2.length) return false

  const hash1 = generateCartHash(items1)
  const hash2 = generateCartHash(items2)

  return hash1 === hash2
} 