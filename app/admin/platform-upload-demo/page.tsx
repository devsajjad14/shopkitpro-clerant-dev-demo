'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Server, Cloud, Upload, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'
import useSettingStore from '@/hooks/use-setting-store'
import { useState, useEffect } from 'react'
import { getSettings } from '@/lib/actions/settings'
import { toast } from 'sonner'
import { getPlatformFromUrl, needsMigration } from '@/lib/utils/platform-utils'

export default function PlatformUploadDemo() {
  const platform = useSettingStore((state) => state.getPlatform())
  const [settings, setSettings] = useState({ logo: '', favicon: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [uploadStats, setUploadStats] = useState({
    totalAssets: 0,
    serverAssets: 0,
    vercelAssets: 0
  })

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const brandingSettings = await getSettings('branding')
        setSettings(brandingSettings)
        
        // Calculate stats
        const assets = [brandingSettings.logo, brandingSettings.favicon].filter(Boolean)
        const serverCount = assets.filter(url => 
          url.startsWith('/media/') || (!url.includes('blob.vercel-storage.com') && !url.startsWith('https://'))
        ).length
        const vercelCount = assets.filter(url => 
          url.includes('blob.vercel-storage.com') || url.startsWith('https://')
        ).length
        
        setUploadStats({
          totalAssets: assets.length,
          serverAssets: serverCount,
          vercelAssets: vercelCount
        })
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // This helper is now imported from utils

  // Migration function
  const migrateAssets = async () => {
    setIsMigrating(true)
    try {
      const response = await fetch('/api/upload/migrate-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPlatform: platform })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Reload settings
        const brandingSettings = await getSettings('branding')
        setSettings(brandingSettings)
        
        toast.success('Assets migrated successfully!', {
          description: `All assets are now stored on ${platform} platform`,
        })
        
        // Refresh page to update everything
        setTimeout(() => window.location.reload(), 2000)
      } else {
        toast.error('Migration failed', {
          description: result.message || 'Some assets failed to migrate'
        })
      }
    } catch (error) {
      console.error('Migration error:', error)
      toast.error('Migration failed', {
        description: 'An unexpected error occurred during migration'
      })
    } finally {
      setIsMigrating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Platform-Specific Upload Demo</h1>
        <p className="text-gray-600">
          This page demonstrates how file uploads are handled based on the selected resource platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Platform */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="w-5 h-5" />
              <span>Current Platform</span>
            </CardTitle>
            <CardDescription>
              Active resource platform for new uploads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge className={`flex items-center gap-1 ${
                platform === 'vercel' 
                  ? 'bg-blue-100 text-blue-700 border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                {platform === 'vercel' ? (
                  <>
                    <Cloud className="w-3 h-3" />
                    Vercel Platform
                  </>
                ) : (
                  <>
                    <Server className="w-3 h-3" />
                    Resource Platform
                  </>
                )}
              </Badge>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Storage:</strong> {platform === 'vercel' ? 'Vercel Blob Storage' : 'Local Server Storage'}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <strong>Location:</strong> {platform === 'vercel' ? 'Global CDN' : 'client/media'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Statistics</span>
            </CardTitle>
            <CardDescription>
              Current asset distribution across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Assets</span>
                <Badge variant="outline">{uploadStats.totalAssets}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Server Storage</span>
                <Badge className="bg-gray-100 text-gray-700">{uploadStats.serverAssets}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vercel Storage</span>
                <Badge className="bg-blue-100 text-blue-700">{uploadStats.vercelAssets}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Migration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5" />
              <span>Migration Status</span>
            </CardTitle>
            <CardDescription>
              Assets alignment with current platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const assetNeedsMigration = [settings.logo, settings.favicon]
                .filter(Boolean)
                .some(url => needsMigration(url, platform))
              
              return (
                <div className="space-y-4">
                  {assetNeedsMigration ? (
                    <>
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Migration Needed</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Some assets are stored on a different platform than the current selection.
                      </p>
                      <Button
                        onClick={migrateAssets}
                        disabled={isMigrating}
                        size="sm"
                        className="w-full"
                      >
                        {isMigrating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Migrating...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Migrate Assets
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">All Aligned</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        All assets are stored on the current platform.
                      </p>
                    </>
                  )}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Asset Details */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Details</CardTitle>
          <CardDescription>
            Detailed information about uploaded assets and their storage locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Store Logo', url: settings.logo, type: 'logo' },
              { name: 'Favicon', url: settings.favicon, type: 'favicon' }
            ].map((asset, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">{asset.name}</h4>
                  {asset.url ? (
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${
                        getPlatformFromUrl(asset.url) === 'vercel' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {getPlatformFromUrl(asset.url) === 'vercel' ? (
                          <>
                            <Cloud className="w-3 h-3 mr-1" />
                            Vercel
                          </>
                        ) : (
                          <>
                            <Server className="w-3 h-3 mr-1" />
                            Server
                          </>
                        )}
                      </Badge>
                      <span className="text-sm text-gray-500 truncate max-w-md">
                        {asset.url}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No asset uploaded</span>
                  )}
                </div>
                {asset.url && (
                  <div className="flex-shrink-0 w-16 h-16 border rounded-lg overflow-hidden">
                    <img 
                      src={asset.url} 
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Understanding platform-specific file uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium">Server Storage</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Files stored in <code>client/media/site/</code></li>
                  <li>• Served via <code>/api/media/[...path]</code></li>
                  <li>• Direct server access required</li>
                  <li>• Full control over file management</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium">Vercel Storage</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Files stored in Vercel Blob Storage</li>
                  <li>• Served via global CDN</li>
                  <li>• Automatic scaling and optimization</li>
                  <li>• External URL access</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Platform Selection Logic</h4>
              <p className="text-sm text-blue-800">
                The system automatically detects your current resource platform setting and routes 
                new uploads accordingly. When you switch platforms, existing assets can be migrated 
                to maintain consistency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}