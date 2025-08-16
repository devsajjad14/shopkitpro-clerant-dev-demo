// /lib/controllers/helper/category/shop-by-filters.ts
import { Product, Variation } from '@/types/product-types'
import { FiltersList, TaxonomyItem } from '@/types/taxonomy.types'
import { fetchTaxonomyData } from '@/lib/actions/shared/taxonomy/get-all-taxonomy'

export const showColorAsCheckboxes = true

export interface FilterState {
  allTaxonomy: TaxonomyItem[]
  isActionLoading: boolean
  openSections: Record<string, boolean>
  isCategoryOpen: boolean
  selectedFilters: Record<string, string[]>
}

export const initializeFilterState = (
  filtersList: FiltersList[]
): FilterState => ({
  allTaxonomy: [],
  isActionLoading: false,
  openSections: {},
  isCategoryOpen: false,
  selectedFilters: {
    ...filtersList.reduce((acc, { name }) => ({ ...acc, [name]: [] }), {}),
    'price-range': [],
  },
})

export const fetchInitialTaxonomy = async (): Promise<TaxonomyItem[]> => {
  return await fetchTaxonomyData()
}

export const initializeFiltersFromURL = (
  searchParams: URLSearchParams,
  filtersList: FiltersList[]
): Record<string, string[]> => {
  const newSelectedFilters: Record<string, string[]> = {}

  filtersList.forEach(({ name }) => {
    const paramValue = searchParams.get(name)
    newSelectedFilters[name] = paramValue ? paramValue.split(',') : []
  })

  const priceParam = searchParams.get('price-range')
  newSelectedFilters['price-range'] = priceParam ? priceParam.split(',') : []

  return newSelectedFilters
}

export const generateFilterData = (
  products: Product[],
  filterName: string,
  from: string,
  allAttributeValues?: string[]
): string[] => {
  // Normalize the filter key for robust matching
  const filterKey = filterName.toUpperCase();
  const filterKeyLower = filterName.toLowerCase();
  const filterKeyPascal = filterKey.charAt(0) + filterKey.slice(1).toLowerCase();

  // Helper to extract all possible values for a filter from a variation object
  const extractFromVariation = (v: any): string[] => {
    const values: string[] = [];
    // 1. Direct key (e.g., COLOR, SIZE)
    if (v[filterKey] && String(v[filterKey]).trim() !== '') {
      values.push(String(v[filterKey]));
    }
    // 2. Lowercase key (e.g., color, size)
    if (v[filterKeyLower] && String(v[filterKeyLower]).trim() !== '' && !values.includes(String(v[filterKeyLower]))) {
      values.push(String(v[filterKeyLower]));
    }
    // 3. PascalCase key (e.g., Color, Size)
    if (v[filterKeyPascal] && String(v[filterKeyPascal]).trim() !== '' && !values.includes(String(v[filterKeyPascal]))) {
      values.push(String(v[filterKeyPascal]));
    }
    // 4. Fallback: attributes array (robust for future schema changes)
    if (Array.isArray(v.attributes)) {
      for (const attr of v.attributes) {
        if (
          attr.attribute &&
          attr.attribute.name &&
          attr.attribute.name.toUpperCase() === filterKey &&
          attr.attributeValue &&
          String(attr.attributeValue.value).trim() !== '' &&
          !values.includes(String(attr.attributeValue.value))
        ) {
          values.push(String(attr.attributeValue.value));
        }
      }
    }
    return values;
  };

  // Helper to extract all possible values for a filter from a product object (product-level attributes)
  const extractFromProduct = (product: Product): string[] => {
    const values: string[] = [];
    // 1. Direct key
    if (product[filterKey as keyof Product] && String(product[filterKey as keyof Product]).trim() !== '') {
      values.push(String(product[filterKey as keyof Product]));
    }
    // 2. Lowercase key
    if (product[filterKeyLower as keyof Product] && String(product[filterKeyLower as keyof Product]).trim() !== '' && !values.includes(String(product[filterKeyLower as keyof Product]))) {
      values.push(String(product[filterKeyLower as keyof Product]));
    }
    // 3. PascalCase key
    if (product[filterKeyPascal as keyof Product] && String(product[filterKeyPascal as keyof Product]).trim() !== '' && !values.includes(String(product[filterKeyPascal as keyof Product]))) {
      values.push(String(product[filterKeyPascal as keyof Product]));
    }
    // 4. Fallback: attributes array (if present on product)
    if (Array.isArray((product as any).attributes)) {
      for (const attr of (product as any).attributes) {
        if (
          attr.attribute &&
          attr.attribute.name &&
          attr.attribute.name.toUpperCase() === filterKey &&
          attr.attributeValue &&
          String(attr.attributeValue.value).trim() !== '' &&
          !values.includes(String(attr.attributeValue.value))
        ) {
          values.push(String(attr.attributeValue.value));
        }
      }
    }
    return values;
  };

  // Aggregate all values from all products
  let usedValues: string[] = [];
  if (from === 'VARIATIONS') {
    // Flatten all variations for all products and extract values
    usedValues = products.flatMap(product =>
      Array.isArray(product.VARIATIONS)
        ? product.VARIATIONS.flatMap(extractFromVariation)
        : []
    );
  } else {
    // Product-level attributes
    usedValues = products.flatMap(extractFromProduct);
  }

  // Optionally merge with allAttributeValues (e.g., from master attribute list)
  if (allAttributeValues && Array.isArray(allAttributeValues)) {
    usedValues = [...usedValues, ...allAttributeValues];
  }

  // Deduplicate and sort for consistent UI
  return Array.from(new Set(usedValues)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

export const getShopByCategoryData = (
  slug: string | null,
  allTaxonomy: TaxonomyItem[]
): TaxonomyItem[] => {
  if (!slug) return []

  const currentTaxonomy = allTaxonomy.find((tax) => tax.WEB_URL === slug)
  if (!currentTaxonomy) return []

  const { DEPT, TYP, SUBTYP_1, SUBTYP_2 } = currentTaxonomy

  return allTaxonomy.filter((tax) => {
    if (TYP === 'EMPTY') {
      return (
        tax.DEPT === DEPT && tax.TYP !== 'EMPTY' && tax.SUBTYP_1 === 'EMPTY'
      )
    }
    if (SUBTYP_1 === 'EMPTY') {
      return (
        tax.DEPT === DEPT &&
        tax.TYP === TYP &&
        tax.SUBTYP_1 !== 'EMPTY' &&
        tax.SUBTYP_2 === 'EMPTY'
      )
    }
    if (SUBTYP_2 === 'EMPTY') {
      return (
        tax.DEPT === DEPT &&
        tax.TYP === TYP &&
        tax.SUBTYP_1 === SUBTYP_1 &&
        tax.SUBTYP_2 !== 'EMPTY' &&
        tax.SUBTYP_3 === 'EMPTY'
      )
    }
    return (
      tax.DEPT === DEPT &&
      tax.TYP === TYP &&
      tax.SUBTYP_1 === SUBTYP_1 &&
      tax.SUBTYP_2 === SUBTYP_2 &&
      tax.SUBTYP_3 !== 'EMPTY'
    )
  })
}

export const priceRanges = [
  'Under $50',
  '$50 - $100',
  '$100 - $200',
  'Over $200',
] as const
