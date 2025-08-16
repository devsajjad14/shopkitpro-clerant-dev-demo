'use client'

import { useCartStore } from '@/lib/stores/cart-store'
import { FaRegHeart, FaHeart, FaShoppingBag } from 'react-icons/fa'
import { useState } from 'react'
import type { Product, Variation } from '@/types/product-types'

interface QuantityCartWishlistProps {
  productData: {
    STYLE_ID: number
    NAME: string
    SELLING_PRICE: number
    LARGEPICTURE: string
    STYLE: string
    QUANTITY_AVAILABLE: number
    VARIATIONS?: Product['VARIATIONS']
    continueSellingOutOfStock?: boolean
  }
  selectedColor: string | null
  selectedSize: string | null
  quantity: number
  onQuantityChange: (quantity: number) => void
  isWishlisted: boolean
  onToggleWishlist: () => void
}

export function QuantityCartWishlist({
  productData,
  selectedColor,
  selectedSize,
  quantity,
  onQuantityChange,
  isWishlisted,
  onToggleWishlist,
}: QuantityCartWishlistProps) {
  const { addToCart, openCart } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    
    // Check if we should block based on stock
    let shouldBlock = false
    
    if (isVariationSelected) {
      // Check variation-specific stock
      const variationStock = selectedVariation?.QUANTITY || 0
      shouldBlock = variationStock <= 0 && !productData.continueSellingOutOfStock
    } else {
      // Check overall product stock
      shouldBlock = productData.QUANTITY_AVAILABLE <= 0 && !productData.continueSellingOutOfStock
    }
    
    if (shouldBlock) {
      return
    }

    setIsAdding(true)

    const selectedPrice = selectedVariation?.PRICE || productData.SELLING_PRICE

    const cartItem = {
      productId: productData.STYLE_ID,
      name: productData.NAME,
      price: selectedPrice, // Use variation price if available
      quantity,
      image: productData.LARGEPICTURE, // This is the fallback image
      color: selectedColor,
      size: selectedSize,
      styleCode: productData.STYLE,
      variations: productData.VARIATIONS, // Pass all variations
    }
    
    addToCart(cartItem)

    setTimeout(() => {
      setIsAdding(false)
      openCart()
    }, 500)
  }

  const hasVariations =
    productData.VARIATIONS && productData.VARIATIONS.length > 0
  const hasColorOptions =
    hasVariations && productData.VARIATIONS?.some((v) => v.COLOR)
  const hasSizeOptions =
    hasVariations && productData.VARIATIONS?.some((v) => v.SIZE)

  // Find the selected variation (SKU) if both color and size are selected, or just one if only one exists
  const normalize = (val: string | null | undefined) => (val ? val.trim().toLowerCase() : '');
  let selectedVariation: Variation | null = null;
  if (productData.VARIATIONS) {
    if (hasColorOptions && hasSizeOptions) {
      if (selectedColor && selectedSize) {
        selectedVariation = productData.VARIATIONS.find(
          (v) =>
            normalize(v.ATTR1_ALIAS || v.COLOR) === normalize(selectedColor) &&
            normalize(v.SIZE) === normalize(selectedSize)
        );
      }
    } else if (hasColorOptions && selectedColor) {
      selectedVariation = productData.VARIATIONS.find(
        (v) => normalize(v.ATTR1_ALIAS || v.COLOR) === normalize(selectedColor)
      );
    } else if (hasSizeOptions && selectedSize) {
      selectedVariation = productData.VARIATIONS.find(
        (v) => normalize(v.SIZE) === normalize(selectedSize)
      );
    }
  }

  // Determine stock for the selected variation
  const variationStock = selectedVariation?.QUANTITY;
  const isVariationSelected = !!selectedVariation;
  const isVariationOutOfStock =
    isVariationSelected && (variationStock === undefined || variationStock === null || variationStock <= 0);

  // Determine if add to cart should be enabled and what message to show
  let canAddToCart = false;
  let buttonText = 'Add to Cart';
  let showBackorderMessage = false;
  let showOutOfStockMessage = false;
  let showInStockMessage = false;
  
  if (!hasVariations) {
    // Simple product (no variations) - enable based on overall inventory
    const isProductInStock = productData.QUANTITY_AVAILABLE > 0;
    const canSellOutOfStock = !!productData.continueSellingOutOfStock;
    canAddToCart = isProductInStock || canSellOutOfStock;
    
    if (isProductInStock) {
      showInStockMessage = true;
    } else if (!isProductInStock && canSellOutOfStock) {
      showBackorderMessage = true;
    } else if (!isProductInStock && !canSellOutOfStock) {
      showOutOfStockMessage = true;
    }
  } else {
    // Product with variations - require only the attribute(s) that exist
    if (
      (hasColorOptions && hasSizeOptions && isVariationSelected) ||
      (hasColorOptions && !hasSizeOptions && selectedVariation) ||
      (!hasColorOptions && hasSizeOptions && selectedVariation)
    ) {
      // Specific variation selected
      canAddToCart = !isVariationOutOfStock || !!productData.continueSellingOutOfStock;
      
      if (!isVariationOutOfStock) {
        showInStockMessage = true;
      } else if (isVariationOutOfStock && !!productData.continueSellingOutOfStock) {
        showBackorderMessage = true;
      } else if (isVariationOutOfStock && !productData.continueSellingOutOfStock) {
        showOutOfStockMessage = true;
      }
    } else {
      // No specific variation selected - disable add to cart
      canAddToCart = false;
      buttonText = 'Select Options';
    }
  }

  // Only show SKU if a valid variation is selected
  const showSku = selectedVariation && (selectedVariation.sku || selectedVariation.SKU_ID);

  return (
    <div className='mb-6 sm:mb-8'>
      {/* Stock Status Messages - Enhanced Responsive */}
      {showOutOfStockMessage && (
        <div className='flex justify-center mb-3 sm:mb-4'>
          <span className='text-sm sm:text-base font-semibold text-red-600 flex items-center gap-2'>
            <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
            </svg>
            Out of Stock
          </span>
        </div>
      )}
      
      {/* Quantity Selector - Enhanced Responsive */}
      {canAddToCart && (
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6'>
          <div className='flex items-center border border-gray-200 rounded-lg overflow-hidden'>
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className='w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium'
              disabled={quantity <= 1}
              aria-label='Decrease quantity'
            >
              -
            </button>
            <span className='w-10 sm:w-12 text-center text-sm sm:text-base font-medium'>{quantity}</span>
            <button
              onClick={() => onQuantityChange(Math.min(10, quantity + 1))}
              className='w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium'
              disabled={quantity >= 10}
              aria-label='Increase quantity'
            >
              +
            </button>
          </div>
          
          {showInStockMessage && (
            <span className='text-sm sm:text-base font-semibold text-green-600 flex items-center gap-2'>
              <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
              </svg>
              In Stock
            </span>
          )}
          
          {showBackorderMessage && (
            <span className='text-sm sm:text-base font-semibold text-orange-600 flex items-center gap-2'>
              <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              Backorder Available
            </span>
          )}
        </div>
      )}

      {/* Add to Cart and Wishlist Buttons - Enhanced Responsive */}
      <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
        {/* Add to Cart Button */}
        <div className='relative flex-1'>
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart || isAdding}
            className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
              !canAddToCart
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-black hover:bg-gray-900 text-white'
            } ${isAdding ? 'opacity-75' : ''}`}
            aria-label={
              !canAddToCart
                ? 'Out of stock'
                : isAdding
                ? 'Adding...'
                : 'Add to cart'
            }
            onMouseEnter={(e) => {
              if (!canAddToCart && !isAdding) {
                const tooltip = document.getElementById('add-to-cart-tooltip');
                if (tooltip) tooltip.style.display = 'flex';
              }
            }}
            onMouseLeave={(e) => {
              const tooltip = document.getElementById('add-to-cart-tooltip');
              if (tooltip) tooltip.style.display = 'none';
            }}
          >
            <FaShoppingBag className='h-4 w-4 sm:h-5 sm:w-5' />
            {buttonText}
          </button>
          {/* Tooltip for Out of Stock */}
          {!canAddToCart && !isAdding && (
            <div
              id='add-to-cart-tooltip'
              style={{ display: 'none' }}
              className='absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full bg-white border border-gray-300 shadow-lg rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 z-10 text-red-600 text-xs sm:text-sm font-semibold pointer-events-none'
            >
              <svg className='w-3 h-3 sm:w-4 sm:h-4 text-red-600' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
              </svg>
              Out of Stock
            </div>
          )}
        </div>

        {/* Wishlist Button - Enhanced Responsive */}
        <button
          className={`p-3 sm:p-4 border rounded-lg transition-colors flex items-center justify-center ${
            isWishlisted
              ? 'border-red-500 text-red-500 bg-red-50'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
          onClick={onToggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          disabled={
            (!hasVariations && !canAddToCart) ||
            (hasVariations && (!isVariationSelected || isVariationOutOfStock) && !productData.continueSellingOutOfStock)
          }
        >
          {isWishlisted ? (
            <FaHeart className='h-4 w-4 sm:h-5 sm:w-5' />
          ) : (
            <FaRegHeart className='h-4 w-4 sm:h-5 sm:w-5' />
          )}
        </button>
      </div>
    </div>
  )
}
