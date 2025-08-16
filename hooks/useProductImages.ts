import { useMemo } from 'react'
import type { Product } from '@/types/product-types'
import type { ColorOption } from './useProductVariations'

// Helper function to normalize image URLs for comparison
const normalizeImageUrl = (url: string): string => {
  if (!url) return ''
  
  // Remove query parameters and fragments
  let normalized = url.split('?')[0].split('#')[0]
  
  // Remove leading/trailing slashes
  normalized = normalized.replace(/^\/+|\/+$/g, '')
  
  // Convert to lowercase for case-insensitive comparison
  normalized = normalized.toLowerCase()
  
  return normalized
}

// Helper function to extract filename from URL for comparison
const extractFilename = (url: string): string => {
  if (!url) return ''
  
  // Remove query parameters and fragments
  let cleanUrl = url.split('?')[0].split('#')[0]
  
  // Extract filename from path
  const filename = cleanUrl.split('/').pop() || ''
  
  // Remove file extension for comparison
  return filename.split('.')[0].toLowerCase()
}

// Helper function to check if two images are the same (by URL or filename)
const isSameImage = (image1: string, image2: string): boolean => {
  if (!image1 || !image2) return false
  
  // Direct URL comparison (normalized)
  const normalized1 = normalizeImageUrl(image1)
  const normalized2 = normalizeImageUrl(image2)
  if (normalized1 === normalized2) return true
  
  // Filename comparison (without extension)
  const filename1 = extractFilename(image1)
  const filename2 = extractFilename(image2)
  if (filename1 && filename2 && filename1 === filename2) return true
  
  return false
}

// Helper function to get all color images from variations with better detection
const getAllColorImages = (product: Product): string[] => {
  const colorImages: string[] = []
  
  if (product.VARIATIONS) {
    for (const variation of product.VARIATIONS) {
      if (variation.COLORIMAGE) {
        // Get both the original and optimized versions
        const originalColorImage = variation.COLORIMAGE
        const optimizedColorImage = getOptimizedImageUrl(variation.COLORIMAGE, 1200)
        
        colorImages.push(originalColorImage)
        if (optimizedColorImage !== originalColorImage) {
          colorImages.push(optimizedColorImage)
        }
      }
    }
  }
  
  return colorImages
}

// Helper function to check if an image is a color image by comparing with variation color images
const isColorImage = (imageUrl: string, product: Product): boolean => {
  if (!imageUrl || !product.VARIATIONS) return false
  
  const normalizedImageUrl = normalizeImageUrl(imageUrl)
  const imageFilename = extractFilename(imageUrl)
  
  // Check if this image matches any variation's color image
  for (const variation of product.VARIATIONS) {
    if (variation.COLORIMAGE) {
      const colorImageUrl = normalizeImageUrl(variation.COLORIMAGE)
      const colorImageFilename = extractFilename(variation.COLORIMAGE)
      
      // Direct URL comparison
      if (normalizedImageUrl === colorImageUrl) {
        return true
      }
      
      // Filename comparison
      if (imageFilename && colorImageFilename && imageFilename === colorImageFilename) {
        return true
      }
      
      // Check for color-specific patterns in filename
      const colorName = variation.COLOR || variation.ATTR1_ALIAS
      if (colorName && imageFilename) {
        const colorLower = colorName.toLowerCase()
        
        // Check for pattern like "100001_blue" in filename
        if (imageFilename.includes(colorLower)) {
          return true
        }
        
        // Check for styleId_color pattern
        const styleId = product.STYLE_ID?.toString()
        if (styleId && imageFilename.startsWith(styleId) && imageFilename.includes(colorLower)) {
          return true
        }
      }
    }
  }
  
  return false
}

// Helper function to optimize image URL
const getOptimizedImageUrl = (url: string, width: number, quality = 80) => {
  if (!url) return ''
  
  try {
    // Handle data URLs
    if (url.startsWith('data:')) {
      return url
    }

    // Handle relative URLs
    if (url.startsWith('/')) {
      return url
    }
    
    // Handle full URLs
    const urlObj = new URL(url)
    return url
  } catch {
    return url
  }
}

export function useProductImages(
  product: Product,
  selectedColor: string | null,
  colorOptions: ColorOption[]
) {
  return useMemo(() => {
    const images: string[] = []

    // Get all color images for reference
    const allColorImages = getAllColorImages(product)

    // Add selected color image if available (this will be the main image when color is selected)
    const selectedColorData = colorOptions.find(
      (color) => color.name === selectedColor
    )
    let selectedColorImage = ''
    if (selectedColorData?.image) {
      selectedColorImage = getOptimizedImageUrl(selectedColorData.image, 1200)
      if (selectedColorImage) {
        images.push(selectedColorImage)
      }
    } else {
      // Only add default product image if no color is selected
      if (product.LARGEPICTURE) {
        const mainImage = getOptimizedImageUrl(product.LARGEPICTURE, 1200)
        if (mainImage) {
          images.push(mainImage)
        }
      }
    }

    // Add alternate images (excluding ALL color images)
    if (product.ALTERNATE_IMAGES?.length) {
      product.ALTERNATE_IMAGES.forEach((img, index) => {
        if (img.LARGEALTPICTURE) {
          const altImage = getOptimizedImageUrl(img.LARGEALTPICTURE, 1200)
          
          // Skip if this is the selected color image
          if (selectedColorImage && isSameImage(altImage, selectedColorImage)) {
            return
          }
          
          // Skip if this is a color image (matches any variation's color image)
          if (isColorImage(altImage, product)) {
            return
          }
          
          // Skip if this matches any color image from variations
          const isAnyColorImage = allColorImages.some(colorImg => isSameImage(altImage, colorImg))
          if (isAnyColorImage) {
            return
          }
          
          // Additional check: Skip if image filename contains any color name from variations
          const imageFilename = extractFilename(altImage)
          const isColorImageByFilename = product.VARIATIONS?.some(variation => {
            const colorName = variation.COLOR || variation.ATTR1_ALIAS
            if (colorName && imageFilename) {
              const colorLower = colorName.toLowerCase()
              const styleId = product.STYLE_ID?.toString()
              
              // Check for pattern like "100054_Brown" in filename
              if (styleId && imageFilename.startsWith(styleId) && imageFilename.includes(colorLower)) {
                return true
              }
            }
            return false
          })
          
          if (isColorImageByFilename) {
            return
          }
          
          // Add non-color alternate images
          images.push(altImage)
        }
      })
      
    }

    // Ensure we always have at least one image
    if (images.length === 0 && product.MEDIUMPICTURE) {
      const fallbackImage = getOptimizedImageUrl(product.MEDIUMPICTURE, 1200)
      if (fallbackImage) images.push(fallbackImage)
    }

    // Remove any duplicate URLs
    const uniqueImages = [...new Set(images)]
    
    return uniqueImages
  }, [product, selectedColor, colorOptions])
} 