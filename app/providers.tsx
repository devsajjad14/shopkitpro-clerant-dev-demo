// app/providers.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { type ReactNode } from 'react'
import { SettingsProvider } from '@/components/providers/SettingsProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </SessionProvider>
  )
}
