'use client'
import { Suspense, useMemo, useEffect } from 'react'
import useSettingStore from '@/hooks/use-setting-store'
import SideNavWrapper from '@/components/side-nav/SideNavWrapper'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import ProductsFilter from '@/components/category/products-filter'
import ProductCardServerSide from '@/components/product/product-card-server-side'
import ProductsPagination from '@/components/category/products-pagination'
import { Product } from '@/types/product-types'
import { FiltersList } from '@/types/taxonomy.types'
import ProductCardSkeleton from '@/components/skeletons/product-card-skeleton'

interface CategoryClientPageProps {
  allMappedProducts: Product[]
  taxonomyData: any
  currentTaxonomy: any
  filtersList: FiltersList[]
  resolvedParams: Record<string, any>
  resolvedSearchParams: Record<string, any>
  currentCategoryLevel: string
  paginatedProducts: Product[]
  totalPages: number
  productCount: number
  isLoading: boolean
  lcpIndex?: number // Add lcpIndex prop
}

export default function CategoryClientPage({
  allMappedProducts,
  taxonomyData,
  currentTaxonomy,
  filtersList,
  resolvedParams,
  resolvedSearchParams,
  currentCategoryLevel,
  paginatedProducts,
  totalPages,
  productCount,
  isLoading,
  lcpIndex = 0, // Default to 0
}: CategoryClientPageProps) {
  const settings = useSettingStore((state) => state.settings)
  
  // Memoize expensive calculations to prevent re-renders
  const { productsPerPage, defaultViewMode, enableFilters, perPage, viewMode } = useMemo(() => {
    const productsPerPage = Number(settings.productsPerPage) || 12
    const defaultViewMode = settings.defaultViewMode || 'grid'
    const enableFilters = settings.enableFilters !== false

    // Determine perPage from query or settings
    const perPage = parseInt(resolvedSearchParams?.perPage as string) || productsPerPage
    // Determine view mode from query or settings
    const viewMode =
      resolvedSearchParams?.view === 'list' || resolvedSearchParams?.view === 'grid'
        ? resolvedSearchParams.view
        : defaultViewMode

    return {
      productsPerPage,
      defaultViewMode,
      enableFilters,
      perPage,
      viewMode
    }
  }, [settings, resolvedSearchParams])

  return (
    <div className="min-h-screen w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-0 md:gap-8 px-0 sm:px-4 py-4 md:py-8">
      {/* Side Navigation: mobile first, then left on md+ */}
      {enableFilters && (
        <aside
          className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0 md:mr-0 order-1 md:order-none"
          aria-label="Category filters navigation"
        >
          <SideNavWrapper
            products={allMappedProducts}
            web_url={resolvedParams.slug}
            filtersList={filtersList}
          />
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 order-2 md:order-none md:pl-8 px-4 sm:px-0">
        {/* Breadcrumbs */}
        <Breadcrumbs
          taxonomyData={taxonomyData}
          web_url={resolvedParams.slug}
          productCount={productCount}
        />

        <section className="mb-10 bg-gradient-to-r from-white to-gray-50/50 rounded-2xl p-6 shadow-sm border border-gray-100 px-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="pl-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight scroll-mt-24">
                {currentCategoryLevel}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-semibold text-gray-900">
                  {productCount}
                </span>
                <span className="text-gray-500">
                  {productCount === 1 ? 'product' : 'products'} available
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Products Filter */}
        <div className="mb-6">
          <ProductsFilter
            totalPages={totalPages}
            currentPage={parseInt(resolvedSearchParams?.page as string) || 1}
            defaultPerPage={productsPerPage}
          />
        </div>

        {/* Products Grid - responsive, no blank spaces */}
        <section
          aria-label="Product grid"
          className="w-full"
        >
          <div
            className={
              viewMode === 'list'
                ? 'flex flex-col gap-4'
                : [
                    'grid gap-x-2 gap-y-3',
                    'grid-cols-1', // mobile
                    'sm:grid-cols-1', // sm: 1 per row
                    'md:grid-cols-2', // md: 2 per row
                    'lg:grid-cols-3', // lg: 3 per row
                    'xl:grid-cols-4', // xl: 4 per row
                    // REMOVED 2xl:grid-cols-5 to restore original desktop layout
                    'auto-rows-fr',
                    'items-stretch',
                  ].join(' ')
            }
          >
            {isLoading
              ? [
                  paginatedProducts[0] && (
                    <ProductCardServerSide
                      key={paginatedProducts[0].STYLE_ID}
                      product={paginatedProducts[0]}
                      viewMode={viewMode}
                      priority={true}
                    />
                  ),
                  ...Array.from({ length: productsPerPage - 1 }).map((_, idx) => (
                    <ProductCardSkeleton key={idx + 1} view={viewMode} />
                  ))
                ]
              : paginatedProducts.map((product, idx) => (
                  <div key={product.STYLE_ID} className="min-h-[340px] flex flex-col">
                    <ProductCardServerSide
                      product={product}
                      viewMode={viewMode}
                      priority={idx === lcpIndex}
                    />
                  </div>
                ))}
          </div>
        </section>

        {/* Pagination */}
        {totalPages > 1 && perPage < 1000 && (
          <nav className="mt-8" aria-label="Pagination">
            <ProductsPagination
              totalPages={totalPages}
              currentPage={parseInt(resolvedSearchParams?.page as string) || 1}
              isLoading={isLoading}
              totalProducts={productCount}
              productsPerPage={perPage}
            />
          </nav>
        )}
      </main>
    </div>
  )
} 