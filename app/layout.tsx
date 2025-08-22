import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { SetupStatusProvider } from '@/components/setup-wizard/SetupStatusProvider'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false, // Prevent unicode range issues
})

export const metadata: Metadata = {
  title: 'ShopKit Pro - E-commerce Platform',
  description: 'Professional e-commerce platform for modern businesses',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="shopkit-theme"
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
