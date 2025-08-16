"use client"

import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { useCartStore } from '@/lib/stores/cart-store'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function WishlistSection() {
  const { items, removeFromWishlist } = useWishlistStore()
  const { addToCart } = useCartStore()
  const [addingId, setAddingId] = useState<number | null>(null)

  if (!items.length) {
    return (
      <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center'>
        <p className='text-gray-500 dark:text-gray-400'>Your wishlist is empty.</p>
      </div>
    )
  }
  
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {items.map((item) => (
        <div key={item.productId} className='bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-200'>
          {/* Image Container with Fixed Height */}
          <div className='relative h-48 bg-gray-50 dark:bg-gray-800 overflow-hidden'>
            <Link href={`/product/id/${item.productId}/name/${item.name.replace(/\s+/g, '-')}`}>
              <Image 
                src={item.image} 
                alt={item.name} 
                fill
                className='object-cover hover:scale-105 transition-transform duration-200' 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </Link>
          </div>
          
          {/* Product Info */}
          <div className='p-4 space-y-3'>
            <Link href={`/product/id/${item.productId}/name/${item.name.replace(/\s+/g, '-')}`}>
              <h3 className='font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
                {item.name}
              </h3>
            </Link>
            
            <div className='text-lg font-bold text-gray-900 dark:text-white'>
              ${item.price.toFixed(2)}
            </div>
            
            {/* Action Buttons */}
            <div className='flex gap-2 pt-2'>
              <button
                onClick={() => removeFromWishlist(item.productId)}
                className='flex-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 text-sm font-medium transition-colors'
              >
                Remove
              </button>
              <button
                onClick={async () => {
                  setAddingId(item.productId)
                  addToCart({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    image: item.image,
                    color: item.color ?? null,
                    size: item.size ?? null,
                    styleCode: item.styleCode,
                  })
                  setAddingId(null)
                }}
                className='flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={addingId === item.productId}
              >
                {addingId === item.productId ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 