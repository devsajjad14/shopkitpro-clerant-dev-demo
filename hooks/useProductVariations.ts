import { useMemo } from 'react'
import type { Product } from '@/types/product-types'

export interface ColorOption {
  id: string
  name: string
  hex: string
  image: string | null
  hasImage: boolean
  sizes: string[]
  isOutOfStock: boolean
}

export interface SizeOption {
  id: string
  name: string
  stock: number
  colors: string[]
}

export function useProductVariations(
  variations: Product['VARIATIONS'],
  selectedColor: string | null,
  selectedSize: string | null,
  continueSellingOutOfStock?: boolean
) {
  // Compute all color/size/stock relationships
  const { colorOptions, sizeOptions } = useMemo(() => {
    const colors = new Map<string, ColorOption>()
    const sizes = new Map<string, SizeOption>()
    // For each size/color, track total stock
    const sizeColorStock = new Map<string, number>()
    // For each color, track all sizes
    const colorToSizes = new Map<string, Set<string>>()
    // For each size, track all colors
    const sizeToColors = new Map<string, Set<string>>()

    // Filter out variations where available is false
    const availableVariations = variations.filter(variation => variation.available !== false)
    
    availableVariations.forEach((variation) => {
      const colorName = variation.ATTR1_ALIAS || variation.COLOR
      const sizeName = variation.SIZE
      const stock = variation.QUANTITY

      // Track stock for size+color
      const key = `${sizeName}|||${colorName}`
      sizeColorStock.set(key, (sizeColorStock.get(key) || 0) + stock)

      // Track all sizes for a color
      if (!colorToSizes.has(colorName)) colorToSizes.set(colorName, new Set())
      colorToSizes.get(colorName)!.add(sizeName)
      // Track all colors for a size
      if (!sizeToColors.has(sizeName)) sizeToColors.set(sizeName, new Set())
      sizeToColors.get(sizeName)!.add(colorName)
    })

    // Build size options
    for (const sizeName of sizeToColors.keys()) {
      let totalStock = 0
      for (const colorName of sizeToColors.get(sizeName)!) {
        const key = `${sizeName}|||${colorName}`
        totalStock += sizeColorStock.get(key) || 0
      }
      sizes.set(sizeName, {
        id: `size-${sizeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: sizeName.replace('_', '/'),
        stock: totalStock,
        colors: Array.from(sizeToColors.get(sizeName)!),
      })
    }

    // Build color options
    for (const colorName of colorToSizes.keys()) {
      let isOutOfStock = true
      for (const sizeName of colorToSizes.get(colorName)!) {
        const key = `${sizeName}|||${colorName}`
        if ((sizeColorStock.get(key) || 0) > 0) {
          isOutOfStock = false
          break
        }
      }
      // Find a sample variation for hex/image
      const sample = availableVariations.find(
        (v) => (v.ATTR1_ALIAS || v.COLOR) === colorName
      )
      colors.set(colorName, {
        id: `color-${colorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: colorName,
        hex: sample?.HEX ? `#${sample.HEX}` : '#cccccc',
        image: sample?.COLORIMAGE
          ? sample.COLORIMAGE.replace('-m.jpg', '-l.jpg')
          : null,
        hasImage: !!sample?.COLORIMAGE,
        sizes: Array.from(colorToSizes.get(colorName)!),
        isOutOfStock: continueSellingOutOfStock ? false : isOutOfStock,
      })
    }

    return {
      colorOptions: Array.from(colors.values()),
      sizeOptions: Array.from(sizes.values()),
    }
  }, [variations])

  // Filtered color options based on selected size
  const filteredColorOptions = useMemo(() => {
    if (!selectedSize) return colorOptions
    // Only show colors that have this size
    return colorOptions.map((color) => {
      const hasSize = color.sizes.includes(selectedSize)
      // Out of stock for this color+size?
      const key = `${selectedSize}|||${color.name}`
      const stock = variations
        .filter(
          (v) =>
            (v.ATTR1_ALIAS || v.COLOR) === color.name && v.SIZE === selectedSize && v.available !== false
        )
        .reduce((sum, v) => sum + v.QUANTITY, 0)
      return {
        ...color,
        isOutOfStock: continueSellingOutOfStock ? false : (!hasSize || stock <= 0),
      }
    })
  }, [colorOptions, selectedSize, variations, continueSellingOutOfStock])

  // Filtered size options based on selected color
  const filteredSizeOptions = useMemo(() => {
    if (!selectedColor) return sizeOptions
    // Only show sizes that have this color
    return sizeOptions.map((size) => {
      const hasColor = size.colors.includes(selectedColor)
      // Out of stock for this size+color?
      const key = `${size.name}|||${selectedColor}`
      const stock = variations
        .filter(
          (v) =>
            v.SIZE === size.name &&
            (v.ATTR1_ALIAS || v.COLOR) === selectedColor &&
            v.available !== false
        )
        .reduce((sum, v) => sum + v.QUANTITY, 0)
      return {
        ...size,
        stock: hasColor ? stock : 0,
      }
    })
  }, [sizeOptions, selectedColor, variations])

  return {
    colorOptions,
    sizeOptions,
    filteredColorOptions,
    filteredSizeOptions,
  }
} 