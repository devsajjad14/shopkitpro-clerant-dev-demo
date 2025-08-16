import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mini Banners | CMS Dashboard | ShopKit Pro',
  description: 'Manage your mini banners. Create, edit, and organize compact banner content for your website.',
  keywords: 'mini banners, banner management, CMS, content management',
  openGraph: {
    title: 'Mini Banners | CMS Dashboard',
    description: 'Manage your mini banners. Create, edit, and organize compact banner content.',
    type: 'website',
  },
}

export default function MiniBannersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 