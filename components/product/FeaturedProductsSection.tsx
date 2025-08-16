'use client'
// app/FeaturedProductsSection.tsx
import ProductSlider from '@/components/product/product-slider'
import { Product } from '@/types/product-types'

export default function FeaturedProductsSection({
  featuredProducts,
}: {
  featuredProducts: Product[]
}) {
  return <ProductSlider title='Featured Products' products={featuredProducts} />
}
