// components/header/cart-button.tsx
'use client'

import { FaShoppingCart } from 'react-icons/fa'
import { useCartStore } from '@/lib/stores/cart-store'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export default function CartButton() {
  const [isMounted, setIsMounted] = useState(false)
  const { toggleCart, getTotalItems } = useCartStore()
  const itemCount = getTotalItems()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className='relative px-3 sm:px-5 py-2.5 sm:py-3 header-button rounded-lg'>
        <div className='flex items-center gap-2 sm:gap-3 text-xs sm:text-sm'>
          <FaShoppingCart className='h-7 w-7 sm:h-9 sm:w-9 text-gray-800' />
          <span className='font-semibold text-gray-900 hidden sm:block'>Cart</span>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={toggleCart}
      className='relative px-3 sm:px-5 py-2.5 sm:py-3 header-button rounded-lg hover:bg-gray-200 transition-all duration-200'
    >
      <div className='flex items-center gap-2 sm:gap-3 text-xs sm:text-sm'>
        <FaShoppingCart className='h-7 w-7 sm:h-9 sm:w-9 text-gray-800 hover:text-primary transition-all ease-in-out' />

        {itemCount > 0 && (
          <span
            className={cn(
              'bg-red-600 text-white text-xs font-semibold rounded-full absolute left-[-4px] sm:left-[-6px] top-[-4px] sm:top-[-6px] z-10 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center'
            )}
          >
            {itemCount}
          </span>
        )}

        <span className='font-semibold text-gray-900 hidden sm:block'>Cart</span>
      </div>
    </button>
  )
}
