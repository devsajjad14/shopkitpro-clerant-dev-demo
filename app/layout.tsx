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
        {/* Critical performance optimizations for 100/100 mobile score */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.alumnihall.com" />
        <link rel="dns-prefetch" href="https://vercel.app" />
        <link rel="dns-prefetch" href="https://blob.vercel-storage.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
        <meta name="theme-color" content="#f8fafc" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="msapplication-TileColor" content="#f8fafc" />
        {/* Mobile optimization */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="ShopKit Pro" />
        {/* Resource Hints for Performance */}
        <link rel="preload" as="style" href="/css/critical.css" />
        <link rel="modulepreload" href="/_next/static/chunks/main.js" />
        <link rel="modulepreload" href="/_next/static/chunks/framework.js" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for 100/100 mobile performance */
            body { font-display: swap; contain: layout style paint; margin: 0; padding: 0; }
            .hero-carousel { min-height: 280px; contain: layout style paint; will-change: auto; }
            @media (min-width: 640px) { .hero-carousel { min-height: 380px; } }
            @media (min-width: 768px) { .hero-carousel { min-height: 450px; } }
            @media (min-width: 1024px) { .hero-carousel { min-height: 550px; } }
            @media (min-width: 1280px) { .hero-carousel { min-height: 600px; } }
            /* Mobile-first performance */
            .mobile-optimized { transform: translateZ(0); backface-visibility: hidden; contain: strict; }
            .mobile-simple-gradient { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); }
            /* Prevent layout shifts */
            * { box-sizing: border-box; }
            img { max-width: 100%; height: auto; }
            /* Critical font loading */
            @font-face { font-family: system-ui; font-display: swap; }
            /* Reduce paint complexity */
            .premium-gradient { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); }
            /* Mobile touch optimization */
            button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
            /* Skeleton loading optimization */
            .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); }
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
