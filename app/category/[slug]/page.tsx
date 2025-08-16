// app/category/[slug]/page.tsx
import { Suspense } from 'react'
import { getTaxonomyByWebURL } from '@/lib/controllers/helper/category/taxonomy'
import { fetchTaxonomyData } from '@/lib/actions/shared/taxonomy/get-all-taxonomy'
import ProductCardServerSide from '@/components/product/product-card-server-side'
import dynamic from 'next/dynamic'
const SideNavWrapper = dynamic(() => import('@/components/side-nav/SideNavWrapper'))
const Breadcrumbs = dynamic(() => import('@/components/category/Breadcrumbs'))
const ProductsFilter = dynamic(() => import('@/components/category/products-filter'))
const ProductsPagination = dynamic(() => import('@/components/category/products-pagination'))
import { FiltersList } from '@/types/taxonomy.types'
import { getProducts } from '@/lib/actions/category/getproductsByUrl'
import { getCategoryFilterAttributes } from '@/lib/actions/attributes'
import CategoryClientPage from './CategoryClientPage'
import { getSettings } from '@/lib/actions/settings'
const CategorySettingsBridge = dynamic(() => import('./CategorySettingsBridge'))

export const revalidate = 60;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await both params and searchParams
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])

  // Parallelize settings, taxonomy, and attributes fetches
  const [settingsCache, taxonomyData, attributes] = await Promise.all([
    getSettings(),
    fetchTaxonomyData(),
    getCategoryFilterAttributes(),
  ])
  const productsPerPage = Number(settingsCache.productsPerPage) || 12
  const perPage = parseInt(resolvedSearchParams?.perPage as string) || productsPerPage

  // Check if the specific category exists
  const targetCategory = taxonomyData.find(t => t.WEB_URL === resolvedParams.slug)
  if (!targetCategory) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-xl text-gray-600'>Category not found</p>
      </div>
    )
  }

  const currentTaxonomy = getTaxonomyByWebURL(resolvedParams.slug, taxonomyData)
  if (!currentTaxonomy) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-xl text-gray-600'>Category not found</p>
      </div>
    )
  }

  // Function to get category display name
  const getCategoryDisplayName = (taxonomy: any) => {
    if (!taxonomy) return 'Category'
    if (taxonomy.DEPT && taxonomy.DEPT !== 'EMPTY') {
      return taxonomy.DEPT
    }
    const hierarchy = []
    if (taxonomy.DEPT && taxonomy.DEPT !== 'EMPTY') {
      hierarchy.push(taxonomy.DEPT)
    }
    if (taxonomy.TYP && taxonomy.TYP !== 'EMPTY') {
      hierarchy.push(taxonomy.TYP)
    }
    if (taxonomy.SUBTYP_1 && taxonomy.SUBTYP_1 !== 'EMPTY') {
      hierarchy.push(taxonomy.SUBTYP_1)
    }
    if (taxonomy.SUBTYP_2 && taxonomy.SUBTYP_2 !== 'EMPTY') {
      hierarchy.push(taxonomy.SUBTYP_2)
    }
    if (taxonomy.SUBTYP_3 && taxonomy.SUBTYP_3 !== 'EMPTY') {
      hierarchy.push(taxonomy.SUBTYP_3)
    }
    return hierarchy.join(' > ') || taxonomy.DEPT || 'Category'
  }

  // Function to get current category level (the deepest non-EMPTY level)
  const getCurrentCategoryLevel = (taxonomy: any) => {
    if (!taxonomy) return 'Category'
    if (taxonomy.SUBTYP_3 && taxonomy.SUBTYP_3 !== 'EMPTY') {
      return taxonomy.SUBTYP_3
    }
    if (taxonomy.SUBTYP_2 && taxonomy.SUBTYP_2 !== 'EMPTY') {
      return taxonomy.SUBTYP_2
    }
    if (taxonomy.SUBTYP_1 && taxonomy.SUBTYP_1 !== 'EMPTY') {
      return taxonomy.SUBTYP_1
    }
    if (taxonomy.TYP && taxonomy.TYP !== 'EMPTY') {
      return taxonomy.TYP
    }
    if (taxonomy.DEPT && taxonomy.DEPT !== 'EMPTY') {
      return taxonomy.DEPT
    }
    return 'Category'
  }

  const categoryDisplayName = getCategoryDisplayName(currentTaxonomy)
  const currentCategoryLevel = getCurrentCategoryLevel(currentTaxonomy)

  // Dynamic filtersList for local mode
  const filtersList: FiltersList[] = [
    ...attributes.map((attr) => ({
      name: attr.name.toLowerCase(),
      display: attr.display,
      from: 'VARIATIONS',
      values: attr.values ? attr.values.map((v) => v.value) : [],
    })),
    { name: 'brand', from: '' },
    { name: 'price-range', from: '', isPrice: true },
  ]

  // Fetch all mapped, filtered products (for SideNav) and paginated products in parallel
  const [allResult, paginatedResult] = await Promise.all([
    getProducts({
      currentTaxonomy,
      filtersList,
      params: resolvedParams,
      searchParams: { ...resolvedSearchParams, perPage: '1000' },
    }),
    getProducts({
      currentTaxonomy,
      filtersList,
      params: resolvedParams,
      searchParams: { ...resolvedSearchParams, perPage: String(perPage) },
    })
  ])

  const allMappedProducts = allResult.products
  const paginatedProducts = paginatedResult.products
  const totalPages = paginatedResult.totalPages
  const productCount = paginatedResult.productCount
  const isLoading = paginatedResult.isLoading

  return (
    <CategoryClientPage
      allMappedProducts={allMappedProducts}
      taxonomyData={taxonomyData}
      currentTaxonomy={currentTaxonomy}
      filtersList={filtersList}
      resolvedParams={resolvedParams}
      resolvedSearchParams={resolvedSearchParams}
      currentCategoryLevel={currentCategoryLevel}
      paginatedProducts={paginatedProducts}
      totalPages={totalPages}
      productCount={productCount}
      isLoading={isLoading}
      lcpIndex={0} // Pass index of first product for LCP prioritization
    >
      <section className="mb-10 bg-gradient-to-r from-white to-gray-50/50 rounded-2xl p-6 shadow-sm border border-gray-100 px-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight scroll-mt-24 pl-4">
              {currentCategoryLevel}
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-semibold text-gray-900">
                {productCount}
              </span>
              <span className="text-gray-500 pl-4">
                {productCount === 1 ? 'product' : 'products'} available
              </span>
            </div>
          </div>
        </div>
      </section>
    </CategoryClientPage>
  )
}
