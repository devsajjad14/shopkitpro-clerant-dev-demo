import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Mini Banner | CMS Dashboard | ShopKit Pro',
  description: 'Create a new mini banner with our visual editor. Design compact banners for sidebar and smaller spaces.',
  keywords: 'create mini banner, compact banner, banner editor, CMS, content creation',
  openGraph: {
    title: 'Create Mini Banner | CMS Dashboard',
    description: 'Create a new mini banner with our visual editor.',
    type: 'website',
  },
}

export default function CreateMiniBannerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 