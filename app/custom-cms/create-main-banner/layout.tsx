import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Main Banner | CMS Dashboard | ShopKit Pro',
  description: 'Create a new main banner with our visual editor. Design beautiful banners with custom positioning and styling.',
  keywords: 'create banner, main banner, banner editor, CMS, content creation',
  openGraph: {
    title: 'Create Main Banner | CMS Dashboard',
    description: 'Create a new main banner with our visual editor.',
    type: 'website',
  },
}

export default function CreateMainBannerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 