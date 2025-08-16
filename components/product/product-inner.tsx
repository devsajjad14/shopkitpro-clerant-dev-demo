'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import type { Product } from '@/types/product-types'
import { ProductGallery } from './detail/ProductGallery'
import { ProductHeaderInfo } from './detail/ProductHeaderInfo'
import { ColorOptions } from './detail/ColorOptions'
import { SizeOptions } from './detail/SizeOptions'
import { QuantityCartWishlist } from './detail/QuantityCartWishlist'
import { ShippingInfo } from './detail/ShippingInfo'
import { ProductDescription } from './detail/ProductDescription'
import { ProductTabs } from './detail/ProductTabs'
import { ProductRecommendations } from './detail/ProductRecommendations'
import { TaxonomyItem } from '@/types/taxonomy.types'
import Breadcrumbs from './detail/Breadcrumbs'
import { useProductVariations } from '@/hooks/useProductVariations'
import { useProductImages } from '@/hooks/useProductImages'
import type { ColorOption, SizeOption } from '@/hooks/useProductVariations'
import { getProductReviewStats } from '@/lib/actions/product/productReviews'
import { useWishlistStore } from '@/lib/stores/wishlist-store'
import { useRouter } from 'next/navigation'

interface ProductInnerProps {
  product: Product
  taxonomyData: TaxonomyItem[]
}

export function ProductInner({ product, taxonomyData }: ProductInnerProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [zipCode, setZipCode] = useState('')
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  })

  const fetchReviewStats = useCallback(async () => {
    const stats = await getProductReviewStats(product.STYLE_ID.toString())
    setReviewStats(stats)
  }, [product.STYLE_ID])

  useEffect(() => {
    fetchReviewStats()
  }, [fetchReviewStats])

  const {
    colorOptions,
    sizeOptions,
    filteredColorOptions,
    filteredSizeOptions,
  } = useProductVariations(
    product?.VARIATIONS || [],
    selectedColor,
    selectedSize,
    product?.continueSellingOutOfStock
  )

  // Only show color options if there are real color options (not blank/empty)
  const showColorOptions = colorOptions && colorOptions.length > 0 && colorOptions.some(c => c.name && c.name.trim() !== '' && c.name.trim().toLowerCase() !== 'null' && c.name.trim().toLowerCase() !== 'undefined');
  // Only show size options if there are real size options
  const showSizeOptions = sizeOptions && sizeOptions.length > 0;

  const hasColorOptions = filteredColorOptions && filteredColorOptions.length > 0;
  const hasSizeOptions = filteredSizeOptions && filteredSizeOptions.length > 0;

  const images = useProductImages(
    product || ({} as Product),
    selectedColor,
    colorOptions
  )

  const handleColorSelect = (color: string | null) => {
    
    // Reset main image index when color changes
    if (selectedColor !== color) {
      setMainImageIndex(0)
    }
    
    setSelectedColor(color)
    
    // Force a re-render of the images
  }

  const handleSizeSelect = useCallback(
    (size: string | null) => {
      setSelectedSize(size)
      if (size && selectedColor) {
        const sizeData = sizeOptions.find((s: SizeOption) => s.name === size)
        if (sizeData && !sizeData.colors.includes(selectedColor)) {
          setSelectedColor(null)
        }
      }
    },
    [sizeOptions, selectedColor]
  )

  const handleQuantityChange = useCallback((newQuantity: number) => {
    setQuantity(newQuantity)
  }, [])

  const wishlistStore = useWishlistStore()
  const isWishlisted = wishlistStore.isInWishlist(product.STYLE_ID)
  const router = useRouter()

  // Compute the selected variation only if both color and size are selected
  const selectedVariation = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    const colorValue = selectedColor.trim().toLowerCase();
    const sizeValue = selectedSize.trim().toLowerCase();
    const found = product.VARIATIONS.find(v => {
      const vColor = (v.ATTR1_ALIAS || v.COLOR || '').trim().toLowerCase();
      const vSize = (v.SIZE || '').trim().toLowerCase();
      return vColor === colorValue && vSize === sizeValue;
    });
    return found;
  }, [product.VARIATIONS, selectedColor, selectedSize]);

  const handleWishlistToggle = useCallback(() => {
    let wishlistImage = product.LARGEPICTURE;
    if (selectedVariation && selectedVariation.COLORIMAGE) {
      wishlistImage = selectedVariation.COLORIMAGE;
    }
    if (isWishlisted) {
      wishlistStore.removeFromWishlist(product.STYLE_ID)
    } else {
      wishlistStore.addToWishlist({
        productId: product.STYLE_ID,
        name: product.NAME,
        price: selectedVariation?.PRICE || product.SELLING_PRICE,
        image: wishlistImage,
        styleCode: product.STYLE,
        color: selectedColor,
        size: selectedSize,
      })
    }
    router.push('/account/wishlist')
  }, [isWishlisted, product, wishlistStore, router, selectedVariation, selectedColor, selectedSize])

  const handleZipCodeChange = useCallback((newZipCode: string) => {
    setZipCode(newZipCode)
  }, [])

  // Find the taxonomy item for this product's category
  const categoryTaxonomy = taxonomyData.find(
    (t) => String(t.WEB_TAXONOMY_ID) === String(product.DEPT)
  )
  const categoryName = categoryTaxonomy?.DEPT || product.DEPT

  // Use the same logic for SKU as for price: show selectedVariation.sku if present, otherwise fallback to product.STYLE or '-'
  const displaySku = selectedVariation && selectedVariation.sku
    ? String(selectedVariation.sku)
    : (product.STYLE ? String(product.STYLE) : '-');
  const displayPrice = selectedVariation && selectedVariation.PRICE && selectedVariation.PRICE > 0 ? selectedVariation.PRICE : product.SELLING_PRICE;
  const displayRegularPrice = product.REGULAR_PRICE;

  if (selectedVariation) {
  }

  if (!product || !product.VARIATIONS) {
    return (
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12'>
        <div className='text-center'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-4'>
            Product Data Error
          </h1>
          <p className='text-gray-600 text-sm sm:text-base'>
            Unable to load product data. Please try again later.
          </p>
        </div>
      </div>
    )
  }

  // Filter out unavailable variations
  const availableVariations = product.VARIATIONS?.filter(v => v.available !== false) || [];

  // If there are no available variations, treat as simple product for Add to Cart logic
  const isSimpleProduct = !availableVariations.length;

  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12'>
      <Breadcrumbs productData={product} taxonomyData={taxonomyData} />

      {/* Premium Responsive Grid Layout */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 mt-6 sm:mt-8'>
        {/* Product Gallery Section */}
        <div className='order-1 lg:order-1'>
          <ProductGallery
            key={`${product.STYLE_ID}-${selectedColor || 'default'}`}
            images={images}
            mainImageIndex={mainImageIndex}
            setMainImageIndex={setMainImageIndex}
            productName={product.NAME}
            selectedColor={selectedColor || ''}
            isNew={product.IS_NEW === 'Y'}
            onSale={product.ON_SALE === 'Y'}
          />
        </div>

        {/* Product Info Section */}
        <div className='order-2 lg:order-2 space-y-6 sm:space-y-8'>
          <ProductHeaderInfo
            brand={product.BRAND}
            name={product.NAME}
            styleCode={displaySku}
            rating={reviewStats.averageRating}
            reviewCount={reviewStats.totalReviews}
            category={categoryName}
          />

          {/* Price Section with Premium Styling */}
          <div className='flex items-center gap-3 sm:gap-4'>
            <span className={`text-2xl sm:text-3xl lg:text-4xl font-bold${product.ON_SALE === 'Y' ? ' text-red-600' : ' text-gray-900'}`}>
              ${displayPrice.toFixed(2)}
            </span>
            {product.ON_SALE === 'Y' && displayRegularPrice > displayPrice && (
              <span className='text-lg sm:text-xl lg:text-2xl text-gray-500 line-through'>
                ${displayRegularPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Color Options */}
          {showColorOptions && (
            <div className='space-y-3 sm:space-y-4'>
              <ColorOptions
                options={filteredColorOptions}
                selectedColor={selectedColor}
                onSelectColor={handleColorSelect}
                displayColorsAs='color-box'
                continueSellingOutOfStock={product.continueSellingOutOfStock}
              />
            </div>
          )}

          {/* Size Options */}
          {showSizeOptions && (
            <div className='space-y-3 sm:space-y-4'>
              <SizeOptions
                options={filteredSizeOptions}
                selectedSize={selectedSize}
                onSelectSize={handleSizeSelect}
                displaySizesAs='size-box'
                // Only disable if color options exist and none is selected
                disabled={showColorOptions && !selectedColor}
                continueSellingOutOfStock={product.continueSellingOutOfStock}
              />
            </div>
          )}

          {/* Cart and Wishlist Section */}
          <div className='space-y-4 sm:space-y-6'>
            <QuantityCartWishlist
              productData={{
                STYLE_ID: product.STYLE_ID,
                NAME: product.NAME,
                SELLING_PRICE: product.SELLING_PRICE,
                LARGEPICTURE: product.LARGEPICTURE,
                STYLE: product.STYLE,
                QUANTITY_AVAILABLE: product.QUANTITY_AVAILABLE,
                VARIATIONS: isSimpleProduct ? undefined : availableVariations,
                continueSellingOutOfStock: product.continueSellingOutOfStock,
              }}
              selectedColor={showColorOptions ? selectedColor : null}
              selectedSize={showSizeOptions ? selectedSize : null}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              isWishlisted={isWishlisted}
              onToggleWishlist={handleWishlistToggle}
            />

            {/* Shipping Info */}
            <ShippingInfo
              zipCode={zipCode}
              onZipCodeChange={handleZipCodeChange}
              onCheckZipCode={() => {}}
            />
          </div>

          {/* Product Description */}
          <div className='space-y-4 sm:space-y-6'>
            <ProductDescription description={product.LONG_DESCRIPTION} />
          </div>
        </div>
      </div>

      {/* Bottom Sections with Premium Spacing */}
      <div className='mt-12 sm:mt-16 lg:mt-20 space-y-12 sm:space-y-16 lg:space-y-20'>
        <ProductTabs
          productId={product.STYLE_ID.toString()}
          onReviewSubmit={fetchReviewStats}
        />
        
        <ProductRecommendations 
          dept={String(categoryTaxonomy?.WEB_TAXONOMY_ID ?? product.DEPT)}
          displayName={categoryName}
        />
      </div>
    </div>
  )
}
