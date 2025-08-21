'use client'

import { memo, lazy, Suspense } from 'react'
import LoadingSpinner from './ui/LoadingSpinner'
import ErrorBoundary from './ui/ErrorBoundary'

// Lazy load heavy components to reduce bundle size
const LazyDirectoryStats = lazy(() => import('./DirectoryStats'))

interface BundleOptimizerProps {
  component: 'DirectoryStats'
  fallback?: React.ReactNode
}

const BundleOptimizer = memo(function BundleOptimizer({ 
  component, 
  fallback 
}: BundleOptimizerProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" />
      <span className="ml-3 text-gray-600 dark:text-gray-400">
        Loading {component.toLowerCase()}...
      </span>
    </div>
  )

  const renderComponent = () => {
    switch (component) {
      case 'DirectoryStats':
        return <LazyDirectoryStats />
      default:
        return null
    }
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || defaultFallback}>
        {renderComponent()}
      </Suspense>
    </ErrorBoundary>
  )
})

export default BundleOptimizer