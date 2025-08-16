import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Brand | CMS Dashboard | ShopKit Pro',
  description: 'Add a new brand logo to your website. Upload brand logos and manage brand information.',
  keywords: 'create brand, brand logo, logo upload, CMS, brand management',
  openGraph: {
    title: 'Create Brand | CMS Dashboard',
    description: 'Add a new brand logo to your website.',
    type: 'website',
  },
}

export default function CreateBrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 