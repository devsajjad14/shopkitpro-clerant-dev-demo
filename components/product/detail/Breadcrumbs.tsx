'use client'
import { TaxonomyItem } from '@/types/taxonomy.types'
import { Product } from '@/types/product-types'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
  isCurrent?: boolean
}

interface BreadcrumbsProps {
  productData: any
  taxonomyData: any
}

export default function Breadcrumbs({ productData, taxonomyData }: BreadcrumbsProps) {
  const { DEPT, TYP, SUBTYP, NAME } = productData

  const breadcrumbItems: BreadcrumbItem[] = []

  // Always add "Home" as the first breadcrumb
  breadcrumbItems.push({ label: 'Home', href: '/' })

  // For local data mode, find the taxonomy record by WEB_TAXONOMY_ID
  if (DEPT) {
    // Find the taxonomy record that matches the product's department ID
    const productTaxonomy = taxonomyData.find(
      (tax: any) => tax.WEB_TAXONOMY_ID?.toString() === DEPT
    )

    if (productTaxonomy) {
      const { DEPT: deptName, TYP: typName, SUBTYP_1: subtyp1Name, SUBTYP_2: subtyp2Name, SUBTYP_3: subtyp3Name } = productTaxonomy

      // Add DEPT level if exists
      if (deptName && deptName !== 'EMPTY') {
        const deptTaxonomy = taxonomyData.find(
          (tax: any) => tax.DEPT === deptName && tax.TYP === 'EMPTY'
        )
        if (deptTaxonomy) {
          breadcrumbItems.push({
            label: deptName,
            href: `/category/${deptTaxonomy.WEB_URL}`,
          })
        }
      }

      // Add TYP level if exists
      if (typName && typName !== 'EMPTY') {
        const typTaxonomy = taxonomyData.find(
          (tax: any) => tax.DEPT === deptName && tax.TYP === typName && tax.SUBTYP_1 === 'EMPTY'
        )
        if (typTaxonomy) {
          breadcrumbItems.push({
            label: typName,
            href: `/category/${typTaxonomy.WEB_URL}`,
          })
        }
      }

      // Add SUBTYP_1 level if exists
      if (subtyp1Name && subtyp1Name !== 'EMPTY') {
        const subtyp1Taxonomy = taxonomyData.find(
          (tax: any) =>
            tax.DEPT === deptName &&
            tax.TYP === typName &&
            tax.SUBTYP_1 === subtyp1Name &&
            tax.SUBTYP_2 === 'EMPTY'
        )
        if (subtyp1Taxonomy) {
          breadcrumbItems.push({
            label: subtyp1Name,
            href: `/category/${subtyp1Taxonomy.WEB_URL}`,
          })
        }
      }

      // Add SUBTYP_2 level if exists
      if (subtyp2Name && subtyp2Name !== 'EMPTY') {
        const subtyp2Taxonomy = taxonomyData.find(
          (tax: any) =>
            tax.DEPT === deptName &&
            tax.TYP === typName &&
            tax.SUBTYP_1 === subtyp1Name &&
            tax.SUBTYP_2 === subtyp2Name &&
            tax.SUBTYP_3 === 'EMPTY'
        )
        if (subtyp2Taxonomy) {
          breadcrumbItems.push({
            label: subtyp2Name,
            href: `/category/${subtyp2Taxonomy.WEB_URL}`,
          })
        }
      }

      // Add SUBTYP_3 level if exists
      if (subtyp3Name && subtyp3Name !== 'EMPTY') {
        const subtyp3Taxonomy = taxonomyData.find(
          (tax: any) =>
            tax.DEPT === deptName &&
            tax.TYP === typName &&
            tax.SUBTYP_1 === subtyp1Name &&
            tax.SUBTYP_2 === subtyp2Name &&
            tax.SUBTYP_3 === subtyp3Name
        )
        if (subtyp3Taxonomy) {
          breadcrumbItems.push({
            label: subtyp3Name,
            href: `/category/${subtyp3Taxonomy.WEB_URL}`,
          })
        }
      }
    }
  }

  // Add current product name as last breadcrumb
  breadcrumbItems.push({
    label: NAME || 'Product',
    href: '#',
    isCurrent: true,
  })

  return (
    <div className='mb-4 sm:mb-6 mt-4 sm:mt-6'>
      <nav className='flex' aria-label='Breadcrumb'>
        <ol className='inline-flex items-center flex-wrap gap-y-1'>
          {breadcrumbItems.map((item, index) => (
            <li key={index} className='inline-flex items-center'>
              {index > 0 && (
                <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-400' />
              )}
              {item.isCurrent ? (
                <span className='text-xs sm:text-sm font-medium text-gray-600 line-clamp-1 max-w-[120px] sm:max-w-[180px] md:max-w-none'>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className='text-xs sm:text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center'
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
