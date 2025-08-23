'use client'

import useSettingStore from '@/hooks/use-setting-store'

export function useCmsType() {
  const { getSetting } = useSettingStore()
  const cmsType = (getSetting('cmsType') || 'no_cms') as 'no_cms' | 'custom_cms' | 'builder_io'
  
  return {
    cmsType,
    isCustomCms: cmsType === 'custom_cms',
    isBuilderIO: cmsType === 'builder_io',
    isNoCms: cmsType === 'no_cms'
  }
}