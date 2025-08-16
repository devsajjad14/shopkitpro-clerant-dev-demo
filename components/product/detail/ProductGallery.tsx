'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  mainImageIndex: number
  setMainImageIndex: (index: number) => void
  productName: string
  selectedColor: string
  isNew: boolean
  onSale: boolean
}

export function ProductGallery({
  images,
  mainImageIndex,
  setMainImageIndex,
  productName,
  selectedColor,
  isNew,
  onSale,
}: ProductGalleryProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [showMagnifier, setShowMagnifier] = useState(false)
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 50, y: 50 })
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 })
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  // Check if mobile with enhanced responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle thumbnail click
  const handleThumbnailClick = useCallback((index: number) => {
    if (index !== mainImageIndex) {
      setMainImageIndex(index)
    }
  }, [mainImageIndex, setMainImageIndex])

  // Handle previous image
  const handlePrevImage = useCallback(() => {
    const newIndex = mainImageIndex === 0 ? images.length - 1 : mainImageIndex - 1
    setMainImageIndex(newIndex)
  }, [mainImageIndex, images.length, setMainImageIndex])

  // Handle next image
  const handleNextImage = useCallback(() => {
    const newIndex = mainImageIndex === images.length - 1 ? 0 : mainImageIndex + 1
    setMainImageIndex(newIndex)
  }, [mainImageIndex, images.length, setMainImageIndex])

  // Handle mouse move for zoom
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Constrain magnifier to keep it fully within the image area
    const magnifierSize = 12.5 // 25% / 2
    const constrainedX = Math.max(magnifierSize, Math.min(100 - magnifierSize, x))
    const constrainedY = Math.max(magnifierSize, Math.min(100 - magnifierSize, y))

    setMagnifierPosition({ x: constrainedX, y: constrainedY })
    
    // Map the constrained position to the actual zoom area
    // This ensures edges are visible when magnifier is near edges
    const zoomX = ((constrainedX - magnifierSize) / (100 - 2 * magnifierSize)) * 100
    const zoomY = ((constrainedY - magnifierSize) / (100 - 2 * magnifierSize)) * 100
    
    setImagePosition({ x: zoomX, y: zoomY })
  }, [])

  // Handle image load for zoom calculations
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    if (img && imageRef.current) {
      const container = imageRef.current
      const containerWidth = container.offsetWidth
      const containerHeight = container.offsetHeight
      const imgWidth = img.naturalWidth
      const imgHeight = img.naturalHeight
      
      const containerAspect = containerWidth / containerHeight
      const imgAspect = imgWidth / imgHeight
      
      let imageWidth, imageHeight, offsetX, offsetY
      
      if (containerAspect > imgAspect) {
        imageHeight = containerHeight
        imageWidth = containerHeight * imgAspect
        offsetX = (containerWidth - imageWidth) / 2
        offsetY = 0
      } else {
        imageWidth = containerWidth
        imageHeight = containerWidth / imgAspect
        offsetX = 0
        offsetY = (containerHeight - imageHeight) / 2
      }
      
      setImageDimensions({ width: imageWidth, height: imageHeight, offsetX, offsetY })
    }
  }, [])

  if (!images.length) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center">
        <p className="text-gray-500 text-sm sm:text-base">No images available</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Premium Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
        {/* Thumbnail Gallery - Vertical on Desktop */}
        <div className="hidden xl:flex flex-col gap-2 sm:gap-3">
          {images.slice(0, 5).map((image, index) => (
            <button
              key={`thumbnail-${image}-${index}`}
              className={`relative w-16 sm:w-20 h-16 sm:h-20 bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden border transition-all duration-300 ${
                mainImageIndex === index
                  ? 'border-2 border-black scale-105 shadow-lg'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 64px, 80px"
                  quality={75}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Main Image Container */}
        <div className="flex-1 min-w-0">
          <div 
            ref={imageRef}
            className="relative w-full aspect-square bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-2xl border border-gray-100 overflow-hidden mb-3 sm:mb-4 shadow-xl group"
            onMouseEnter={() => {
              setIsHovering(true)
              setShowMagnifier(true)
            }}
            onMouseLeave={() => {
              setIsHovering(false)
              setShowMagnifier(false)
            }}
            onMouseMove={handleMouseMove}
          >
            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                key={`main-${images[mainImageIndex]}-${mainImageIndex}`}
                src={images[mainImageIndex]}
                alt={`${productName} in ${selectedColor}`}
                fill
                className="object-contain p-6 sm:p-10 lg:p-14 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_4px_32px_0_rgba(99,102,241,0.10)]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                priority={mainImageIndex === 0}
                quality={90}
                onLoad={handleImageLoad}
              />
              {/* Subtle shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute -left-1/3 top-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer rounded-2xl" />
              </div>
            </div>

            {/* Glass Magnifier - Desktop Only */}
            {!isMobile && showMagnifier && (
              <div 
                className="pointer-events-none absolute h-[25%] w-[25%] rounded-full border-[3px] border-white/80 bg-white/10 backdrop-blur-[1px] shadow-lg overflow-hidden"
                style={{
                  left: `${magnifierPosition.x}%`,
                  top: `${magnifierPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.05s ease-out',
                  backgroundImage: `url(${images[mainImageIndex]})`,
                  backgroundSize: '600% 600%',
                  backgroundPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                }}
              >
                {/* Magnifier crosshair for better precision */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-px h-full bg-white/60"></div>
                  <div className="h-px w-full bg-white/60 absolute"></div>
                </div>
              </div>
            )}

            {/* Zoom Indicator - Desktop Only */}
            {!isMobile && !isHovering && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 rounded-full bg-white/95 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-900 shadow-lg backdrop-blur-sm">
                  <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Hover to zoom</span>
                </div>
              </div>
            )}

            {/* Navigation Arrows - Enhanced Responsive */}
            <button
              onClick={handlePrevImage}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" />
            </button>

            {/* Floating Badges - Enhanced Responsive */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2 z-30">
              {isNew && (
                <span className="bg-black text-white text-xs font-bold px-2 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md">
                  NEW ARRIVAL
                </span>
              )}
              {onSale && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md">
                  SALE
                </span>
              )}
            </div>
          </div>

          {/* Mobile Thumbnails - Enhanced Layout */}
          <div className="flex xl:hidden gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-3 scrollbar-hide">
            {images.slice(0, 5).map((image, index) => (
              <button
                key={`thumbnail-mobile-${image}-${index}`}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden border transition-all duration-300 flex-shrink-0 ${
                  mainImageIndex === index
                    ? 'border-2 border-black scale-105 shadow-lg'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => handleThumbnailClick(index)}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 56px, 64px"
                    quality={75}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
