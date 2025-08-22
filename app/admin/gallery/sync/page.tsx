'use client'

import { lazy, Suspense, useMemo, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { DeploymentOverlay } from '@/components/ui/deployment-overlay'
import { useSyncService } from './components/useSyncService'
import { useSyncReducer } from './components/useSyncReducer'
import PageHeader from './components/PageHeader'
import LoadingFallback from './components/LoadingFallback'
import type { SyncDirection } from './components/types'

// Lazy Components for Code Splitting
const SyncSelectionComponent = lazy(() => import('./components/SyncSelectionComponent'))
const SyncProgressComponent = lazy(() => import('./components/SyncProgressComponent'))

export default function SyncMediaPage() {
  const [state, dispatch] = useSyncReducer()
  const { startSync } = useSyncService()

  const handleStartSync = useCallback((direction: SyncDirection) => {
    startSync(direction, dispatch)
  }, [startSync])

  const resetSync = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const progressPercent = useMemo(() => 
    state.progress.total > 0 ? Math.round((state.progress.current / state.progress.total) * 100) : 0,
    [state.progress.current, state.progress.total]
  )

  return (
    <DeploymentOverlay
      restrictedOnVercel={true}
      restrictedOnServer={false}
      restrictionTitle="Media Sync Restricted"
      restrictionMessage="Server-to-cloud media synchronization requires file system access and is not available on Vercel deployments."
      allowDismiss={false}
      className="min-h-screen"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <PageHeader />

        <AnimatePresence mode="wait">
          {state.direction === null ? (
            <Suspense fallback={<LoadingFallback />}>
              <SyncSelectionComponent onStartSync={handleStartSync} />
            </Suspense>
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <SyncProgressComponent
                syncDirection={state.direction}
                syncStatus={state.status}
                progress={state.progress}
                stats={state.stats}
                completionData={state.completionData}
                progressPercent={progressPercent}
                onRetry={() => handleStartSync(state.direction)}
                onReset={resetSync}
              />
            </Suspense>
          )}
        </AnimatePresence>
      </div>
    </DeploymentOverlay>
  )
}