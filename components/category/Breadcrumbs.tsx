'use client'
import { TaxonomyItem } from '@/types/taxonomy.types'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbsProps {
  taxonomyData: TaxonomyItem[]
  web_url: string
  productCount: number
}

export default function Breadcrumbs({ taxonomyData, web_url, productCount }: BreadcrumbsProps) {
  const currentTaxonomy = taxonomyData.find((tax) => tax.WEB_URL === web_url)
  if (!currentTaxonomy) return null

  const { DEPT, TYP, SUBTYP_1, SUBTYP_2, SUBTYP_3 } = currentTaxonomy

  const breadcrumbItems = []

  // Always add "Home" as the first breadcrumb
  breadcrumbItems.push({ label: 'Home', href: '/' })

  // Add DEPT level
  if (DEPT && DEPT !== 'EMPTY') {
    const deptTaxonomy = taxonomyData.find(
      (tax) => tax.DEPT === DEPT && tax.TYP === 'EMPTY'
    )
    if (deptTaxonomy) {
      breadcrumbItems.push({
        label: DEPT,
        href: `/category/${deptTaxonomy.WEB_URL}`,
      })
    }
  }

  // Add TYP level
  if (TYP && TYP !== 'EMPTY') {
    const typTaxonomy = taxonomyData.find(
      (tax) => tax.DEPT === DEPT && tax.TYP === TYP && tax.SUBTYP_1 === 'EMPTY'
    )
    if (typTaxonomy) {
      breadcrumbItems.push({
        label: TYP,
        href: `/category/${typTaxonomy.WEB_URL}`,
      })
    }
  }

  // Add SUBTYP_1 level
  if (SUBTYP_1 && SUBTYP_1 !== 'EMPTY') {
    const subtyp1Taxonomy = taxonomyData.find(
      (tax) =>
        tax.DEPT === DEPT &&
        tax.TYP === TYP &&
        tax.SUBTYP_1 === SUBTYP_1 &&
        tax.SUBTYP_2 === 'EMPTY'
    )
    if (subtyp1Taxonomy) {
      breadcrumbItems.push({
        label: SUBTYP_1,
        href: `/category/${subtyp1Taxonomy.WEB_URL}`,
      })
    }
  }

  // Add SUBTYP_2 level
  if (SUBTYP_2 && SUBTYP_2 !== 'EMPTY') {
    const subtyp2Taxonomy = taxonomyData.find(
      (tax) =>
        tax.DEPT === DEPT &&
        tax.TYP === TYP &&
        tax.SUBTYP_1 === SUBTYP_1 &&
        tax.SUBTYP_2 === SUBTYP_2 &&
        tax.SUBTYP_3 === 'EMPTY'
    )
    if (subtyp2Taxonomy) {
      breadcrumbItems.push({
        label: SUBTYP_2,
        href: `/category/${subtyp2Taxonomy.WEB_URL}`,
      })
    }
  }

  // Add SUBTYP_3 level
  if (SUBTYP_3 && SUBTYP_3 !== 'EMPTY') {
    const subtyp3Taxonomy = taxonomyData.find(
      (tax) =>
        tax.DEPT === DEPT &&
        tax.TYP === TYP &&
        tax.SUBTYP_1 === SUBTYP_1 &&
        tax.SUBTYP_2 === SUBTYP_2 &&
        tax.SUBTYP_3 === SUBTYP_3
    )
    if (subtyp3Taxonomy) {
      breadcrumbItems.push({
        label: SUBTYP_3,
        href: `/category/${subtyp3Taxonomy.WEB_URL}`,
      })
    }
  }

  const currentPage = breadcrumbItems[breadcrumbItems.length - 1]

  // Get the dynamic category name from current taxonomy
  const getCategoryDisplayName = (taxonomy: TaxonomyItem) => {
    if (!taxonomy) return 'Category'
    
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

  const dynamicCategoryName = getCategoryDisplayName(currentTaxonomy)

  return (
    <div className='mb-6 px-4 sm:px-0'>
      {/* Standard Breadcrumbs */}
      <nav className='flex items-center overflow-x-auto max-w-full' aria-label='Breadcrumb'>
        <ol className='flex items-center space-x-1 min-w-0'>
          {breadcrumbItems.map((item, index) => (
            <li key={item.href} className='flex items-center'>
              {index > 0 && (
                <ChevronRight className='w-4 h-4 mx-2 text-gray-400' />
              )}
              {index === breadcrumbItems.length - 1 ? (
                <span className='text-sm font-medium text-gray-900'>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className='text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors'
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
