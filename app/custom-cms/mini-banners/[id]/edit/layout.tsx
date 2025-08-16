import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit Mini Banner | CMS Dashboard | ShopKit Pro',
  description: 'Edit your mini banner with our visual editor. Update compact banner content and styling.',
  keywords: 'edit mini banner, compact banner, banner editor, CMS, content editing',
  openGraph: {
    title: 'Edit Mini Banner | CMS Dashboard',
    description: 'Edit your mini banner with our visual editor.',
    type: 'website',
  },
}

export default function EditMiniBannerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 