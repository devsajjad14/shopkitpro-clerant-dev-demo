import { CartProvider } from '@/components/providers/CartProvider'
import { Providers } from './providers'
import { Suspense } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { fetchTaxonomyData } from '@/lib/actions/shared/taxonomy/get-all-taxonomy'
import MainLayoutWrapper from './MainLayoutWrapper'

export default async function Template({ children }: { children: React.ReactNode }) {
  const txData = await fetchTaxonomyData();
  return (
    <div>
      <Providers>
        <CartProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <MainLayoutWrapper txData={txData}>{children}</MainLayoutWrapper>
          </Suspense>
        </CartProvider>
        <Toaster />
        <SonnerToaster richColors position='top-right' />
      </Providers>
    </div>
  );
} 