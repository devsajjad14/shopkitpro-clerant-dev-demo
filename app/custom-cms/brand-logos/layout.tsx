import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brand Logos | CMS Dashboard | ShopKit Pro',
  description: 'Manage your brand logos. Upload, organize, and display brand logos on your website.',
  keywords: 'brand logos, logo management, CMS, content management, branding',
  openGraph: {
    title: 'Brand Logos | CMS Dashboard',
    description: 'Manage your brand logos. Upload, organize, and display brand logos.',
    type: 'website',
  },
}

export default function BrandLogosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 