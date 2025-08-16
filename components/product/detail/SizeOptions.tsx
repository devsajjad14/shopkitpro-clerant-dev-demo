'use client'

import { useState } from 'react'

interface SizeOption {
  id: string
  name: string
  stock: number
}

type SizeDisplayType = 'select' | 'size-box' | 'grid'

interface SizeOptionsProps {
  options: SizeOption[]
  selectedSize: string | null
  onSelectSize: (size: string | null) => void
  onShowSizeGuide?: () => void
  displaySizesAs?: SizeDisplayType
  disabled?: boolean
  continueSellingOutOfStock?: boolean
}

export function SizeOptions({
  options,
  selectedSize,
  onSelectSize,
  onShowSizeGuide,
  displaySizesAs = 'size-box',
  disabled = false,
  continueSellingOutOfStock = false,
}: SizeOptionsProps) {
  const [hoveredSize, setHoveredSize] = useState<string | null>(null)

  const handleSizeClick = (sizeName: string, isOutOfStock: boolean) => {
    if (isOutOfStock && !continueSellingOutOfStock) return
    onSelectSize(selectedSize === sizeName ? null : sizeName)
  }

  // Handle select dropdown display
  if (displaySizesAs === 'select') {
    return (
      <div className='mb-4 sm:mb-6'>
        <div className='flex justify-between items-center mb-2 sm:mb-3'>
          <label htmlFor='size-select' className='text-sm sm:text-base font-medium'>
            Size
          </label>
          {onShowSizeGuide && (
            <button
              type='button'
              onClick={onShowSizeGuide}
              className='text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline'
            >
              Size Guide
            </button>
          )}
        </div>
        <select
          id='size-select'
          className='w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-black focus:border-black transition-all text-sm sm:text-base'
          value={selectedSize || ''}
          onChange={(e) => onSelectSize(e.target.value || null)}
          disabled={disabled}
        >
          <option value=''>Select a size</option>
          {options.map((size) => (
            <option
              key={size.id}
              value={size.name}
              disabled={size.stock <= 0 && !continueSellingOutOfStock}
              className={size.stock <= 0 && !continueSellingOutOfStock ? 'text-gray-400' : ''}
            >
              {size.name} {size.stock <= 0 && !continueSellingOutOfStock && '(Out of stock)'}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // Handle grid display
  if (displaySizesAs === 'grid') {
    return (
      <div className='mb-6 sm:mb-8'>
        <div className='flex justify-between items-center mb-2 sm:mb-3'>
          <h3 className='text-sm sm:text-base font-medium'>
            Size:{' '}
            <span className='font-normal'>
              {selectedSize || 'Not selected'}
            </span>
          </h3>
          {onShowSizeGuide && (
            <button
              type='button'
              onClick={onShowSizeGuide}
              className='text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline'
            >
              Size Guide
            </button>
          )}
        </div>
        <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3'>
          {options.map((size) => {
            const isSelected = selectedSize === size.name
            const isOutOfStock = size.stock <= 0
            const isHovered = hoveredSize === size.name && (!isOutOfStock || continueSellingOutOfStock)

            return (
              <button
                key={`size-${size.id}`}
                className={`relative p-2.5 sm:p-3 border rounded-lg transition-all duration-200 flex items-center justify-center text-sm sm:text-base
                  ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-lg'
                      : isOutOfStock && !continueSellingOutOfStock
                      ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-800 border-gray-300 shadow-sm hover:shadow-md hover:border-gray-400'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => handleSizeClick(size.name, isOutOfStock)}
                onMouseEnter={() => (!isOutOfStock || continueSellingOutOfStock) && setHoveredSize(size.name)}
                onMouseLeave={() => setHoveredSize(null)}
                disabled={(isOutOfStock && !continueSellingOutOfStock) || disabled}
                title={isOutOfStock && !continueSellingOutOfStock ? `${size.name} - Out of stock` : size.name}
              >
                {size.name}
                {isOutOfStock && !continueSellingOutOfStock && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 sm:h-5 sm:w-5 text-red-500'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                )}
                {isHovered && !isSelected && (
                  <div className='absolute inset-0 border-2 border-gray-400 rounded-lg pointer-events-none'></div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Default size box display
  return (
    <div className='mb-6 sm:mb-8'>
      <div className='flex justify-between items-center mb-2 sm:mb-3'>
        <h3 className='text-sm sm:text-base font-medium'>
          Size:{' '}
          <span className='font-normal'>{selectedSize || 'Not selected'}</span>
        </h3>
        {onShowSizeGuide && (
          <button
            type='button'
            onClick={onShowSizeGuide}
            className='text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline'
          >
            Size Guide
          </button>
        )}
      </div>
      <div className='flex flex-wrap gap-2 sm:gap-3'>
        {options.map((size) => {
          const isSelected = selectedSize === size.name
          const isOutOfStock = size.stock <= 0
          const isHovered = hoveredSize === size.name && (!isOutOfStock || continueSellingOutOfStock)

          return (
            <button
              key={`size-${size.id}`}
              className={`relative px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg transition-all duration-200 flex items-center justify-center text-sm sm:text-base
                ${
                  isSelected
                    ? 'bg-black text-white border-black shadow-lg'
                    : isOutOfStock && !continueSellingOutOfStock
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-800 border-gray-300 shadow-sm hover:shadow-md hover:border-gray-400'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => handleSizeClick(size.name, isOutOfStock)}
              onMouseEnter={() => (!isOutOfStock || continueSellingOutOfStock) && setHoveredSize(size.name)}
              onMouseLeave={() => setHoveredSize(null)}
              disabled={(isOutOfStock && !continueSellingOutOfStock) || disabled}
              title={isOutOfStock && !continueSellingOutOfStock ? `${size.name} - Out of stock` : size.name}
            >
              {size.name}
              {isOutOfStock && !continueSellingOutOfStock && (
                <span className='ml-1 sm:ml-1.5'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-3 w-3 sm:h-4 sm:w-4 text-red-500'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </span>
              )}
              {isHovered && !isSelected && (
                <div className='absolute inset-0 border-2 border-gray-400 rounded-lg pointer-events-none'></div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
