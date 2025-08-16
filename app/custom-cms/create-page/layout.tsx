import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Page | CMS Dashboard | ShopKit Pro',
  description: 'Create a new page with our rich text editor. Write, format, and publish content pages with SEO optimization.',
  keywords: 'create page, content editor, rich text editor, CMS, page publishing, SEO',
  openGraph: {
    title: 'Create Page | CMS Dashboard',
    description: 'Create a new page with our rich text editor.',
    type: 'website',
  },
}

export default function CreatePageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 