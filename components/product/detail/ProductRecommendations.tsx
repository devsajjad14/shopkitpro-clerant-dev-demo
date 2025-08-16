'use client'

import { useCallback, useEffect, useState } from 'react'
import { getRecommendedProducts } from '@/lib/actions/product/getRecommendedProducts'
import ProductSlider from '../product-slider'
import { Product } from '@/types/product-types'

type FetchState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
  retries: number
}

export function ProductRecommendations({ dept, displayName }: { dept: string, displayName: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [state, setState] = useState<FetchState>({
    status: 'idle',
    error: null,
    retries: 0,
  })

  const fetchRecommendedProducts = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading' }))

    try {
      const recommendedProducts = await getRecommendedProducts(8, dept)
      if (recommendedProducts.length === 0) {
        console.warn('[ProductRecommendations] No products available for dept:', dept)
        setProducts([])
        setState({ status: 'success', error: null, retries: 0 })
        return
      }
      setProducts(recommendedProducts)
      setState({ status: 'success', error: null, retries: 0 })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch products'
      console.error('[ProductRecommendations] Fetch error:', errorMessage)
      setProducts([])
      setState((prev) => ({
        status: 'error',
        error: errorMessage,
        retries: prev.retries + 1,
      }))
    }
  }, [dept])

  // Auto-retry with exponential backoff
  useEffect(() => {
    if (state.status !== 'error' || state.retries > 3) return

    const retryDelay = Math.min(1000 * 2 ** state.retries, 10000) // Max 10s
    const timer = setTimeout(fetchRecommendedProducts, retryDelay)

    return () => clearTimeout(timer)
  }, [state.status, state.retries, fetchRecommendedProducts])

  // Initial fetch
  useEffect(() => {
    fetchRecommendedProducts()
  }, [fetchRecommendedProducts])

  if (state.status === 'loading') {
    return (
      <div className='flex flex-col items-center justify-center gap-2 py-6 sm:py-8 lg:py-12'>
        <div className='flex space-x-2'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='h-2 w-2 animate-pulse rounded-full bg-gray-300'
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className='text-xs sm:text-sm text-gray-500'>
          {state.retries > 0 ? 'Retrying...' : 'Loading recommendations...'}
        </p>
      </div>
    )
  }

  if (products.length === 0 && state.status === 'success') {
    return (
      <div className='py-6 sm:py-8 lg:py-12'>
        <h2 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 sm:mb-6 text-center sm:text-left'>
          Recommended Products
        </h2>
        <div className='text-center sm:text-left'>
          <p className='text-sm sm:text-base text-gray-500'>
            No recommendations found{displayName ? ` in ${displayName}` : ''}
          </p>
        </div>
      </div>
    )
  }

  return <ProductSlider title={`Recommended in ${displayName}`} products={products} />
}
