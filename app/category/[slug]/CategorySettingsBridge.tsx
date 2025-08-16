'use client'
import useSettingStore from '@/hooks/use-setting-store'

export default function CategorySettingsBridge({ children }: { children: (settings: any) => React.ReactNode }) {
  const settings = useSettingStore((state) => state.settings)
  return <>{children(settings)}</>
} 