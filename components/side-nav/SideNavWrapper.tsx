'use client'

import { useEffect, memo } from 'react'
import SideNav from './index'
import { Product } from '@/types/product-types'
import { FiltersList } from '@/types/taxonomy.types'

interface SideNavWrapperProps {
  products: any[]
  web_url: string
  filtersList: any[]
}

const SideNavWrapper = memo(function SideNavWrapper({
  products,
  web_url,
  filtersList,
}: SideNavWrapperProps) {
  useEffect(() => {
    const handleLoadingChange = (e: Event) => {
      const isLoading = (e as CustomEvent).detail.isLoading;
      if (isLoading) {
        document.body.style.cursor = 'wait';
      } else {
        document.body.style.cursor = 'default';
      }
    };
    window.addEventListener('loading-state-change', handleLoadingChange as EventListener);
    return () => {
      window.removeEventListener('loading-state-change', handleLoadingChange as EventListener);
    };
  }, []);

  return (
    <SideNav
      products={products}
      web_url={web_url}
      filtersList={filtersList}
    />
  )
})

export default SideNavWrapper
