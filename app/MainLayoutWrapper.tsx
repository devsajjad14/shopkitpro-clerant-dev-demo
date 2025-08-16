'use client'
import { usePathname } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import { TaxonomyItem } from '@/types/taxonomy.types'

interface MainLayoutWrapperProps {
  children: React.ReactNode
  txData: TaxonomyItem[]
}

export default function MainLayoutWrapper({ children, txData }: MainLayoutWrapperProps) {
  const pathname = usePathname();
  if (pathname.startsWith('/custom-cms') || pathname.startsWith('/setup')) {
    return <>{children}</>;
  }
  return <MainLayout txData={txData}>{children}</MainLayout>;
} 