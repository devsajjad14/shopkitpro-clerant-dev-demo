/* eslint-disable no-unused-vars */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SettingState {
  settings: Record<string, any>
  isLoaded: boolean
  setSettings: (settings: Record<string, any>) => void
  updateSetting: (key: string, value: any) => void
  getSetting: (key: string) => any
  getPlatform: () => 'server' | 'vercel'
  initializeSettings: (initialSettings: Record<string, any>) => void
  setLoaded: (loaded: boolean) => void
  forceRefresh: (freshSettings: Record<string, any>) => void
}

const useSettingStore = create<SettingState>()(
  persist(
    (set, get) => ({
      settings: {},
      isLoaded: false,
      setSettings: (settings) => set({ settings, isLoaded: true }),
      updateSetting: (key, value) => set((state) => ({ 
        settings: { ...state.settings, [key]: value } 
      })),
      getSetting: (key) => get().settings[key],
      getPlatform: () => {
        const platform = get().settings.platform
        return platform === 'vercel' ? 'vercel' : 'server'
      },
      initializeSettings: (initialSettings) => {
        // Always update with fresh settings from database
        set({ settings: initialSettings, isLoaded: true })
      },
      setLoaded: (loaded) => set({ isLoaded: loaded }),
  forceRefresh: (freshSettings) => {
    // Force update settings even if already loaded - used for platform switches
    set({ settings: freshSettings, isLoaded: true })
  },
    }),
    {
      name: 'shopkit-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        settings: state.settings,
        // Don't persist isLoaded - always start as false
      }),
      onRehydrateStorage: () => {
        return (state) => {
          // Always start as not loaded to force fresh data fetch
          if (state && typeof window !== 'undefined') {
            state.isLoaded = false
          }
        }
      }
    }
  )
)

export default useSettingStore
