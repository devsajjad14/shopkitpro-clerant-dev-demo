import type { Metadata } from 'next'
import CustomCMSLayoutClient from './components/CustomCMSLayoutClient'

export const metadata: Metadata = {
  title: 'CMS Dashboard | ShopKit Pro',
  description: 'Manage your content with our comprehensive CMS dashboard. Create and edit banners, brand logos, and pages.',
  keywords: 'CMS, content management, banners, brand logos, pages, dashboard',
  openGraph: {
    title: 'CMS Dashboard | ShopKit Pro',
    description: 'Manage your content with our comprehensive CMS dashboard.',
    type: 'website',
  },
}

export default function CustomCMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CustomCMSLayoutClient>{children}</CustomCMSLayoutClient>
} 