import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { SetupStatusProvider } from '@/components/setup-wizard/SetupStatusProvider'
// Using system fonts to avoid CSS syntax errors from Google Fonts
const fontClass = 'font-sans'

export const metadata: Metadata = {
  title: 'ShopKit Pro - E-commerce Platform',
  description: 'Professional e-commerce platform for modern businesses',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical performance optimizations for mobile LCP */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.alumnihall.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#f8fafc" />
        {/* Mobile optimization */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for immediate render */
            .hero-carousel { min-height: 280px; }
            @media (min-width: 768px) { .hero-carousel { min-height: 400px; } }
            .mobile-simple-gradient { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); }
            .mobile-optimized { transform: translateZ(0); backface-visibility: hidden; }
            /* Font optimization */
            * { font-display: swap; }
            /* Reduce layout shift */
            body { contain: layout style paint; }
          `
        }} />
      </head>
      <body className={fontClass} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="shopkit-theme"
          suppressHydrationWarning
        >
          <Providers>
            <SetupStatusProvider>
              {children}
            </SetupStatusProvider>
            <Toaster />
            <SonnerToaster richColors position='top-right' />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
