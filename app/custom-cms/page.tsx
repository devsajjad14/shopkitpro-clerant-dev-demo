'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiGrid,
  FiImage,
  FiFileText,
  FiLayers,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiUpload,
  FiSave,
  FiX,
  FiChevronRight,
  FiSearch,
  FiFilter,
  FiMousePointer,
  FiTrendingUp,
  FiBarChart2,
  FiSettings,
  FiSmartphone,
} from 'react-icons/fi'
import { useCMSContext } from './components/CustomCMSLayoutClient'
import CreateBannerModal from './components/CreateBannerModal'

export default function CMSPage() {
  const { activeTab } = useCMSContext()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [stats, setStats] = useState([
    { label: 'Main Banners', value: '0', icon: FiImage, color: 'blue' },
    { label: 'Mini Banners', value: '0', icon: FiImage, color: 'green' },
    { label: 'Brand Logos', value: '0', icon: FiLayers, color: 'purple' },
    { label: 'Pages', value: '0', icon: FiFileText, color: 'orange' },
  ])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch counts and recent data
        const [mainBannersRes, miniBannersRes, brandsRes, pagesRes] = await Promise.all([
          fetch('/api/banners'),
          fetch('/api/mini-banners'),
          fetch('/api/brands'),
          fetch('/api/pages')
        ])

        const [mainBannersData, miniBannersData, brandsData, pagesData] = await Promise.all([
          mainBannersRes.json(),
          miniBannersRes.json(),
          brandsRes.json(),
          pagesRes.json()
        ])

        // Debug: Log the data to see what's being returned
        console.log('Main Banners Data:', mainBannersData)
        console.log('Mini Banners Data:', miniBannersData)
        console.log('Brands Data:', brandsData)
        console.log('Pages Data:', pagesData)

        // Update stats
        setStats([
          { label: 'Main Banners', value: mainBannersData.data?.length?.toString() || '0', icon: FiImage, color: 'blue' },
          { label: 'Mini Banners', value: miniBannersData.data?.length?.toString() || '0', icon: FiImage, color: 'green' },
          { label: 'Brand Logos', value: brandsData.data?.length?.toString() || '0', icon: FiLayers, color: 'purple' },
          { label: 'Pages', value: pagesData.data?.length?.toString() || '0', icon: FiFileText, color: 'orange' },
        ])

        // Create recent activities from the data
        const activities: any[] = []
        
        // Add main banners activities
        if (mainBannersData.data) {
          mainBannersData.data.forEach((banner: any) => {
            activities.push({
              action: `Updated Main Banner`,
              timestamp: new Date(banner.updatedAt),
              time: getTimeAgo(new Date(banner.updatedAt)),
              type: 'edit',
            })
          })
        }

        // Add mini banners activities
        if (miniBannersData.data) {
          miniBannersData.data.forEach((banner: any) => {
            activities.push({
              action: `Updated Mini Banner`,
              timestamp: new Date(banner.updatedAt),
              time: getTimeAgo(new Date(banner.updatedAt)),
              type: 'edit',
            })
          })
        }

        // Add brands activities
        if (brandsData.data) {
          brandsData.data.forEach((brand: any) => {
            activities.push({
              action: `Updated Brand Logo`,
              timestamp: new Date(brand.updatedAt),
              time: getTimeAgo(new Date(brand.updatedAt)),
              type: 'edit',
            })
          })
        }

        // Add pages activities
        if (pagesData.data) {
          pagesData.data.forEach((page: any) => {
            activities.push({
              action: `Updated Page`,
              timestamp: new Date(page.updatedAt),
              time: getTimeAgo(new Date(page.updatedAt)),
              type: 'edit',
            })
          })
        }

        // Sort by actual timestamp (most recent first) and take top 5
        activities.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
        setRecentActivities(activities.slice(0, 5))

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Helper function to calculate time ago
  function getTimeAgo(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
    }

    const diffInYears = Math.floor(diffInDays / 365)
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
  }

  // Dashboard Component
  function DashboardContent() {

    return (
      <div className='space-y-8'>
        {/* Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>
                    {stat.label}
                  </p>
                  {isLoading ? (
                    <div className='flex items-center mt-2'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mr-2'></div>
                      <span className='text-gray-400 text-sm'>Loading...</span>
                    </div>
                  ) : (
                    <p className='text-3xl font-bold text-gray-800 mt-2'>
                      {stat.value}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Recent Activity
          </h3>
          <div className='space-y-4'>
            {isLoading ? (
              <div className='flex items-center justify-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className='flex items-center gap-4 p-3 rounded-lg bg-gray-50'
                >
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === 'add'
                        ? 'bg-green-100'
                        : activity.type === 'edit'
                        ? 'bg-blue-100'
                        : 'bg-orange-100'
                    }`}
                  >
                    {activity.type === 'add' && (
                      <FiPlus className='w-4 h-4 text-green-600' />
                    )}
                    {activity.type === 'edit' && (
                      <FiEdit3 className='w-4 h-4 text-blue-600' />
                    )}
                    {activity.type === 'create' && (
                      <FiFileText className='w-4 h-4 text-orange-600' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium text-gray-800'>{activity.action}</p>
                    <p className='text-sm text-gray-500'>{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-8 text-gray-500'>
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'dashboard' && <DashboardContent />}
      </motion.div>

      <CreateBannerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  )
}
