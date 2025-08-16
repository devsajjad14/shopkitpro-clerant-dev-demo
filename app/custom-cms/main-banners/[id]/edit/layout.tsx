import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Main Banner | CMS Dashboard | ShopKit Pro',
  description: 'Edit your main banner with our visual editor. Update banner content, positioning, and styling.',
  keywords: 'edit banner, main banner, banner editor, CMS, content editing',
  openGraph: {
    title: 'Edit Main Banner | CMS Dashboard',
    description: 'Edit your main banner with our visual editor.',
    type: 'website',
  },
}

export default function EditMainBannerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 