// /components/side-nav/index2.tsx
'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import ColorSwatch from './ColorSwatch'
import {
  FilterState,
  initializeFilterState,
  fetchInitialTaxonomy,
  initializeFiltersFromURL,
  generateFilterData,
  getShopByCategoryData,
  priceRanges,
  showColorAsCheckboxes,
} from '@/lib/controllers/helper/category/shop-by-filters'
import { Product } from '@/types/product-types'
import { FiltersList } from '@/types/taxonomy.types'

interface SideNavProps {
  products: any[]
  web_url: string
  filtersList: any[]
}

export default function SideNav({ products, web_url, filtersList }: SideNavProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<FilterState>(
    initializeFilterState(filtersList)
  )

  const {
    allTaxonomy,
    isActionLoading,
    openSections,
    isCategoryOpen,
    selectedFilters,
  } = state

  // Data initialization - only run once on mount
  useEffect(() => {
    const loadData = async () => {
      const allTx = await fetchInitialTaxonomy('local')
      setState((prev) => ({ ...prev, allTaxonomy: allTx }))
    }
    loadData()
  }, [])

  // URL params initialization - memoized to prevent unnecessary updates
  const urlFilters = useMemo(() => {
    return initializeFiltersFromURL(searchParams, filtersList)
  }, [searchParams, filtersList])

  useEffect(() => {
    const newSelectedFilters = urlFilters
    const hasSelectedFilters = Object.values(newSelectedFilters).some(
      (values) => values.length > 0
    )

    const newOpenSections = Object.fromEntries(
      Object.entries(newSelectedFilters).map(([key, values]) => [
        key,
        values.length > 0,
      ])
    )

    setState((prev) => ({
      ...prev,
      selectedFilters: newSelectedFilters,
      openSections: {
        ...prev.openSections,
        ...newOpenSections,
        selectedFilters: hasSelectedFilters, // Always show if there are filters
      },
    }))
  }, [urlFilters])

  const handleActionWithLoader = useCallback(async (action: () => void) => {
    setState((prev) => ({ ...prev, isActionLoading: true }))
    try {
      action()
      await new Promise((resolve) => setTimeout(resolve, 300))
    } finally {
      setState((prev) => ({ ...prev, isActionLoading: false }))
    }
  }, [])

  const updateURL = useCallback(
    (key: string, values: string[]) => {
      handleActionWithLoader(() => {
        const newSearchParams = new URLSearchParams(searchParams.toString())
        if (values.length > 0) {
          newSearchParams.set(key, values.join(','))
        } else {
          newSearchParams.delete(key)
        }
        newSearchParams.delete('page')
        router.replace(`?${newSearchParams.toString()}`, { scroll: false })
      })
    },
    [handleActionWithLoader, router, searchParams]
  )

  const handleFilterChange = useCallback(
    (filterName: string, value: string) => {
      const updatedFilters = selectedFilters[filterName].includes(value)
        ? selectedFilters[filterName].filter((v) => v !== value)
        : [...selectedFilters[filterName], value]

      setState((prev) => ({
        ...prev,
        selectedFilters: {
          ...prev.selectedFilters,
          [filterName]: updatedFilters,
        },
        openSections: {
          ...prev.openSections,
          [filterName]: true,
          selectedFilters: true,
        },
      }))

      updateURL(filterName, updatedFilters)
    },
    [selectedFilters, updateURL]
  )

  const removeFilter = useCallback(
    (filterName: string, value: string) => {
      const updatedFilters = selectedFilters[filterName].filter(
        (v) => v !== value
      )

      setState((prev) => ({
        ...prev,
        selectedFilters: {
          ...prev.selectedFilters,
          [filterName]: updatedFilters,
        },
        openSections: {
          ...prev.openSections,
          [filterName]: updatedFilters.length > 0,
          selectedFilters: Object.entries(selectedFilters).some(
            ([key, values]) => key !== filterName && values.length > 0
          ),
        },
      }))

      updateURL(filterName, updatedFilters)
    },
    [selectedFilters, updateURL]
  )

  const resetFilters = useCallback(() => {
    handleActionWithLoader(() => {
      const resetFiltersState = filtersList.reduce(
        (acc, { name }) => ({ ...acc, [name]: [] }),
        { 'price-range': [] }
      )
      setState((prev) => ({
        ...prev,
        selectedFilters: resetFiltersState,
        openSections: {},
      }))
      router.replace(web_url, { scroll: false })
    })
  }, [filtersList, handleActionWithLoader, router, web_url])

  const toggleSection = useCallback((sectionName: string) => {
    setState((prev) => ({
      ...prev,
      openSections: {
        ...prev.openSections,
        [sectionName]: !prev.openSections[sectionName],
      },
    }))
  }, [])

  const toggleCategory = useCallback(() => {
    setState((prev) => ({ ...prev, isCategoryOpen: !prev.isCategoryOpen }))
  }, [])

  // Memoize expensive filter data generation
  const filterData = useMemo(() => {
    return filtersList.map((filterConfig) => {
      const data = generateFilterData(products, filterConfig.name, filterConfig.from)
      return { ...filterConfig, data }
    })
  }, [filtersList, products])

  const renderFilterOptions = useCallback(
    (filterName: string, data: string[]) => {
      if (filterName === 'color' && !showColorAsCheckboxes) {
        return data.map((color: string) => {
          // Find a hex code for this color from the product variations, fallback to #fff for 'White'
          let hex = '';
          for (const p of products) {
            if (p.VARIATIONS) {
              const match = p.VARIATIONS.find(
                (v: any) => (v.COLOR || '').toLowerCase() === color.toLowerCase() && v.HEX
              );
              if (match) {
                hex = match.HEX.startsWith('#') ? match.HEX : `#${match.HEX}`;
                break;
              }
            }
          }
          if (!hex && color.toLowerCase() === 'white') {
            hex = '#fff';
          }
          if (!hex) {
            hex = '#cccccc'; // fallback for unknown colors
          }
          return (
            <ColorSwatch
              key={color}
              color={color}
              hex={hex}
              isChecked={selectedFilters[filterName].includes(color)}
              onChange={() => handleFilterChange(filterName, color)}
            />
          );
        });
      }

      return data.map((value) => (
        <div
          key={value}
          className={`flex items-center gap-3 cursor-pointer ${
            isActionLoading ? 'opacity-50' : ''
          }`}
          onClick={() =>
            !isActionLoading && handleFilterChange(filterName, value)
          }
        >
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              selectedFilters[filterName].includes(value)
                ? 'border-blue-600 bg-blue-600'
                : 'border-gray-300 bg-white'
            }`}
          >
            {selectedFilters[filterName].includes(value) && (
              <Check className='w-3 h-3 text-white' />
            )}
          </div>
          <span className='text-gray-600 hover:text-blue-600'>{value}</span>
        </div>
      ))
    },
    [handleFilterChange, isActionLoading, selectedFilters, products]
  )

  // Memoize shop by category data
  const shopByCategoryData = useMemo(() => {
    return getShopByCategoryData(web_url, allTaxonomy)
  }, [web_url, allTaxonomy])

  // Find current taxonomy
  const currentTaxonomy = useMemo(() => {
    return allTaxonomy.find((tax) => tax.WEB_URL === web_url)
  }, [allTaxonomy, web_url])

  // Get current category level
  const getCurrentCategoryLevel = (taxonomy: any) => {
    if (!taxonomy) return 'Category'

    // Check from deepest to shallowest level
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

  // Get parent category URL
  const getParentCategoryUrl = (currentUrl: string, taxonomyData: any[]) => {
    const currentTaxonomy = taxonomyData.find(
      (tax) => tax.WEB_URL === currentUrl
    )
    if (!currentTaxonomy) return null

    const { DEPT, TYP, SUBTYP_1, SUBTYP_2 } = currentTaxonomy

    // Find parent category based on current level
    if (SUBTYP_2 && SUBTYP_2 !== 'EMPTY') {
      // Current is SUBTYP_2, parent is SUBTYP_1
      const parent = taxonomyData.find(
        (tax) =>
          tax.DEPT === DEPT &&
          tax.TYP === TYP &&
          tax.SUBTYP_1 === SUBTYP_1 &&
          tax.SUBTYP_2 === 'EMPTY'
      )
      return parent?.WEB_URL
    }
    if (SUBTYP_1 && SUBTYP_1 !== 'EMPTY') {
      // Current is SUBTYP_1, parent is TYP
      const parent = taxonomyData.find(
        (tax) =>
          tax.DEPT === DEPT && tax.TYP === TYP && tax.SUBTYP_1 === 'EMPTY'
      )
      return parent?.WEB_URL
    }
    if (TYP && TYP !== 'EMPTY') {
      // Current is TYP, parent is DEPT
      const parent = taxonomyData.find(
        (tax) => tax.DEPT === DEPT && tax.TYP === 'EMPTY'
      )
      return parent?.WEB_URL
    }

    return null
  }

  const currentCategoryLevel = getCurrentCategoryLevel(currentTaxonomy)

  return (
    <div className="w-full relative mb-6 bg-white shadow-lg rounded-lg p-4 sm:p-6 h-fit lg:w-72 lg:sticky lg:top-6 lg:mb-0">
      {isActionLoading && (
        <div className='w-full flex items-center justify-center mb-4'>
          <Loader2 className='h-6 w-6 text-blue-600 animate-spin' />
        </div>
      )}

      <button
        onClick={resetFilters}
        disabled={isActionLoading}
        className={`w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 px-4 py-2 rounded-lg mb-6 ${
          isActionLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isActionLoading ? (
          <Loader2 className='w-4 h-4 animate-spin' />
        ) : (
          <RefreshCw className='w-4 h-4' />
        )}
        Reset Filters
      </button>

      <div className='mb-8'>
        <div
          className='flex items-center justify-between cursor-pointer'
          onClick={() => !isActionLoading && toggleSection('selectedFilters')}
        >
          <h2 className='text-lg font-semibold text-gray-800'>
            Selected Filters
          </h2>
          {openSections.selectedFilters ? (
            <ChevronUp className='w-5 h-5 text-gray-600' />
          ) : (
            <ChevronDown className='w-5 h-5 text-gray-600' />
          )}
        </div>
        {openSections.selectedFilters && (
          <div className='mt-4 space-y-2'>
            {/* Current Category Filter */}
            {currentCategoryLevel && currentCategoryLevel !== 'Category' && (
              <div className='w-full bg-blue-50 px-4 py-3 rounded-lg flex items-center justify-between border border-blue-200'>
                <span className='text-sm text-blue-700 font-medium'>
                  category: {currentCategoryLevel}
                </span>
                {(() => {
                  // Only show cross button if not at department level
                  const currentTaxonomy = allTaxonomy.find(
                    (tax) => tax.WEB_URL === web_url
                  )
                  const isDepartmentLevel =
                    currentTaxonomy &&
                    currentTaxonomy.TYP === 'EMPTY' &&
                    currentTaxonomy.SUBTYP_1 === 'EMPTY' &&
                    currentTaxonomy.SUBTYP_2 === 'EMPTY' &&
                    currentTaxonomy.SUBTYP_3 === 'EMPTY'

                  if (!isDepartmentLevel) {
                    return (
                      <X
                        className={`w-4 h-4 cursor-pointer text-blue-500 hover:text-blue-700 ${
                          isActionLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => {
                          if (!isActionLoading) {
                            // Navigate to parent category
                            const parentUrl = getParentCategoryUrl(
                              web_url,
                              allTaxonomy
                            )
                            if (parentUrl) {
                              router.push(`/category/${parentUrl}`)
                            }
                          }
                        }}
                      />
                    )
                  }
                  return null
                })()}
              </div>
            )}

            {Object.entries(selectedFilters).flatMap(([filterName, values]) =>
              values.map((value) => (
                <div
                  key={`${filterName}-${value}`}
                  className='w-full bg-gray-50 px-4 py-3 rounded-lg flex items-center justify-between border border-gray-200'
                >
                  <span className='text-sm text-gray-700'>
                    {filterName}: {value}
                  </span>
                  <X
                    className={`w-4 h-4 cursor-pointer text-gray-500 hover:text-red-500 ${
                      isActionLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() =>
                      !isActionLoading && removeFilter(filterName, value)
                    }
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {shopByCategoryData.length > 0 && (
        <div className='mb-8'>
          <div
            className='flex items-center justify-between cursor-pointer'
            onClick={() => !isActionLoading && toggleCategory()}
          >
            <h2 className='text-lg font-semibold text-gray-800'>
              Shop by Category
            </h2>
            {isCategoryOpen ? (
              <ChevronUp className='w-5 h-5 text-gray-600' />
            ) : (
              <ChevronDown className='w-5 h-5 text-gray-600' />
            )}
          </div>
          {isCategoryOpen && (
            <ul className='space-y-2 mt-4'>
              {shopByCategoryData.map((tax) => {
                const displayName = [
                  tax.SUBTYP_3,
                  tax.SUBTYP_2,
                  tax.SUBTYP_1,
                  tax.TYP,
                  tax.DEPT,
                ].find((val) => val && val !== 'EMPTY')

                return displayName ? (
                  <li
                    key={tax.WEB_TAXONOMY_ID}
                    className='flex items-center gap-3'
                  >
                    <Link
                      href={`/category/${tax.WEB_URL}`}
                      className={`flex items-center gap-3 ${
                        isActionLoading ? 'pointer-events-none opacity-50' : ''
                      }`}
                    >
                      <span className='text-gray-600 hover:text-blue-600'>
                        {displayName}
                      </span>
                    </Link>
                  </li>
                ) : null
              })}
            </ul>
          )}
        </div>
      )}

      {filterData.map((filterConfig) => {
        if (filterConfig.data.length < 2) return null;
        return (
          <div key={filterConfig.name} className='mb-8'>
            <div
              className='flex items-center justify-between cursor-pointer'
              onClick={() => !isActionLoading && toggleSection(filterConfig.name)}
            >
              <h2 className='text-lg font-semibold text-gray-800'>
                Shop by{' '}
                {(filterConfig.display || filterConfig.name).charAt(0).toUpperCase() +
                  (filterConfig.display || filterConfig.name).slice(1)}
              </h2>
              {openSections[filterConfig.name] ? (
                <ChevronUp className='w-5 h-5 text-gray-600' />
              ) : (
                <ChevronDown className='w-5 h-5 text-gray-600' />
              )}
            </div>
            {openSections[filterConfig.name] && (
              <div
                className={`mt-4 ${
                  filterConfig.name === 'color' && !showColorAsCheckboxes
                    ? 'flex flex-wrap gap-2'
                    : 'space-y-2'
                }`}
              >
                {renderFilterOptions(filterConfig.name, filterConfig.data)}
              </div>
            )}
          </div>
        );
      })}

      <div className='mb-8'>
        <div
          className='flex items-center justify-between cursor-pointer'
          onClick={() => !isActionLoading && toggleSection('price-range')}
        >
          <h2 className='text-lg font-semibold text-gray-800'>Shop by Price</h2>
          {openSections['price-range'] ? (
            <ChevronUp className='w-5 h-5 text-gray-600' />
          ) : (
            <ChevronDown className='w-5 h-5 text-gray-600' />
          )}
        </div>
        {openSections['price-range'] && (
          <ul className='space-y-2 mt-4'>
            {renderFilterOptions('price-range', [...priceRanges])}
          </ul>
        )}
      </div>
    </div>
  )
}
