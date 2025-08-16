import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Main Banners | CMS Dashboard | ShopKit Pro',
  description: 'Manage your main banners. Create, edit, and organize banner content for your website.',
  keywords: 'main banners, banner management, CMS, content management',
  openGraph: {
    title: 'Main Banners | CMS Dashboard',
    description: 'Manage your main banners. Create, edit, and organize banner content.',
    type: 'website',
  },
}

export default function MainBannersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 