import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pages | CMS Dashboard | ShopKit Pro',
  description: 'Manage your website pages. Create, edit, and publish content pages with our powerful CMS.',
  keywords: 'pages, content management, CMS, website pages, publishing',
  openGraph: {
    title: 'Pages | CMS Dashboard',
    description: 'Manage your website pages. Create, edit, and publish content pages.',
    type: 'website',
  },
}

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 