'use client'

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/header'
import FooterSkeleton from '@/components/skeletons/FooterSkeleton'
import Footer from '@/components/footer'
import { TaxonomyItem } from '@/types/taxonomy.types'

interface MainLayoutProps {
  children: React.ReactNode
  txData: TaxonomyItem[]
}

export default function MainLayout({ children, txData }: MainLayoutProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Header txData={txData} />
      {children}
      <Suspense fallback={<FooterSkeleton />}>
        <Footer />
      </Suspense>
    </>
  )
}
