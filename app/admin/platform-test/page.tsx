'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlatformIndicator, usePlatform } from '@/components/platform/PlatformIndicator'
import { Badge } from '@/components/ui/badge'
import useSettingStore from '@/hooks/use-setting-store'
import { Code, Database, Settings } from 'lucide-react'

export default function PlatformTestPage() {
  const platform = usePlatform()
  const allSettings = useSettingStore((state) => state.settings)
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Platform Configuration Test</h1>
        <p className="text-gray-600">This page demonstrates the platform setting functionality.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Platform */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Current Platform</span>
            </CardTitle>
            <CardDescription>
              The deployment platform configured during setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformIndicator />
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Platform Value:</strong> <code className="bg-white px-2 py-1 rounded text-blue-600">{platform}</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Platform-specific Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span>Platform Features</span>
            </CardTitle>
            <CardDescription>
              Features available based on your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platform === 'vercel' ? (
                <>
                  <Badge className="w-full justify-center bg-blue-100 text-blue-800 hover:bg-blue-200">
                    ✅ Serverless Functions
                  </Badge>
                  <Badge className="w-full justify-center bg-blue-100 text-blue-800 hover:bg-blue-200">
                    ✅ Edge Runtime
                  </Badge>
                  <Badge className="w-full justify-center bg-blue-100 text-blue-800 hover:bg-blue-200">
                    ✅ Auto Scaling
                  </Badge>
                  <Badge className="w-full justify-center bg-blue-100 text-blue-800 hover:bg-blue-200">
                    ✅ Global CDN
                  </Badge>
                </>
              ) : (
                <>
                  <Badge className="w-full justify-center bg-gray-100 text-gray-800 hover:bg-gray-200">
                    ✅ Full Server Control
                  </Badge>
                  <Badge className="w-full justify-center bg-gray-100 text-gray-800 hover:bg-gray-200">
                    ✅ Custom Configuration
                  </Badge>
                  <Badge className="w-full justify-center bg-gray-100 text-gray-800 hover:bg-gray-200">
                    ✅ Long-running Processes
                  </Badge>
                  <Badge className="w-full justify-center bg-gray-100 text-gray-800 hover:bg-gray-200">
                    ✅ Full Database Access
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings Debug */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Settings Debug</span>
            </CardTitle>
            <CardDescription>
              View all loaded settings (including platform)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(allSettings).map(([key, value]) => (
                <div 
                  key={key} 
                  className={`p-2 rounded text-xs ${
                    key === 'platform' 
                      ? 'bg-yellow-50 border border-yellow-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-gray-600">{key}</span>
                    <span className={`font-mono ${
                      key === 'platform' ? 'text-yellow-800 font-bold' : 'text-gray-800'
                    }`}>
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            How to use the platform setting in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">1. Using the Platform Hook:</h4>
              <pre className="text-sm bg-white p-3 rounded border">
{`import { usePlatform } from '@/components/platform/PlatformIndicator'

function MyComponent() {
  const platform = usePlatform()
  
  return (
    <div>
      {platform === 'vercel' ? (
        <VercelFeature />
      ) : (
        <ServerFeature />
      )}
    </div>
  )
}`}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">2. Using the Settings Store:</h4>
              <pre className="text-sm bg-white p-3 rounded border">
{`import useSettingStore from '@/hooks/use-setting-store'

function MyComponent() {
  const platform = useSettingStore((state) => state.getPlatform())
  const platformSetting = useSettingStore((state) => state.getSetting('platform'))
  
  // Both approaches work
}`}
              </pre>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">3. Conditional Rendering:</h4>
              <pre className="text-sm bg-white p-3 rounded border">
{`{platform === 'vercel' && <VercelOnlyComponent />}
{platform === 'server' && <ServerOnlyComponent />}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}