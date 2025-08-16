'use client'

import { useState, createContext, useContext, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useAdminAuthStore } from '@/store/admin-auth-store'
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
  FiHome,
  FiLogOut,
  FiUser,
  FiSettings
} from 'react-icons/fi'
import PlatformSwitcher from '@/components/admin/PlatformSwitcher'

// Create context for sharing activeTab state
const CMSContext = createContext<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}>({
  activeTab: 'dashboard',
  setActiveTab: () => {},
})

// Custom hook to use CMS context
export const useCMSContext = () => useContext(CMSContext)

// Custom CMS Sidebar Component
function CMSSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()
  const pathname = usePathname();
  const { logout } = useAdminAuthStore();

  // Logout function
  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid, path: '/custom-cms' },
    { id: 'main-banners', label: 'Main Banners', icon: FiImage, path: '/custom-cms/main-banners' },
    { id: 'mini-banners', label: 'Mini Banners', icon: FiImage, path: '/custom-cms/mini-banners' },
    { id: 'brand-logos', label: 'Brand Logos', icon: FiLayers, path: '/custom-cms/brand-logos' },
    { id: 'pages', label: 'Pages', icon: FiFileText, path: '/custom-cms/pages' },
  ]

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    console.log('Current pathname:', pathname); // Debug log
    
    if (pathname === '/custom-cms' || pathname === '/custom-cms/') return 'dashboard';
    
    // Handle sub-pages and create/edit pages - check more specifically
    if (pathname.includes('main-banner')) return 'main-banners';
    if (pathname.includes('mini-banner')) return 'mini-banners';
    if (pathname.includes('brand')) return 'brand-logos';
    if (pathname.includes('page')) return 'pages';
    
    // Fallback to exact path matching
    for (const item of navigationItems) {
      if (pathname.startsWith(item.path)) return item.id;
    }
    return '';
  };
  const activeTab = getActiveTab();
  console.log('Active tab:', activeTab); // Debug log

  return (
    <motion.aside
      initial={{ width: isOpen ? 288 : 80 }}
      animate={{ width: isOpen ? 288 : 80 }}
      className='h-screen bg-white dark:bg-gray-800 shadow-lg flex flex-col border-r border-gray-200 dark:border-gray-700'
    >
      {/* Logo */}
      <div className='p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700'>
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiGrid className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Custom CMS</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Content Management</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FiGrid className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
        >
          {isOpen ? '◄' : '►'}
        </button>
      </div>

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto p-4'>
        <ul className='space-y-3'>
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  router.push(item.path)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <button 
            onClick={() => window.open(process.env.NEXT_PUBLIC_FRONTEND_URL || '/', '_blank')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <FiHome className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">View Site</span>}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <FiLogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  )
}

// Custom CMS Header Component
function CMSHeader() {
  const { activeTab } = useCMSContext()
  const router = useRouter()
  const { logout } = useAdminAuthStore();
  
  // Logout function
  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };
  
  return (
    <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
              {activeTab.replace('-', ' ')}
            </h1>
            {/* Platform Switcher - Left side near title */}
            <PlatformSwitcher />
          </div>
          
          {/* Premium User Info */}
          <div className="flex items-center gap-4">
            {/* Welcome Message */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <FiUser className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Welcome back</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Administrator</span>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Online</span>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push('/custom-cms')}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 group"
              >
                <FiHome className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 group"
              >
                <FiLogOut className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function CustomCMSLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isHydrated } = useAdminAuthStore()

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      return;
    }

    // Only check authentication after hydration is complete
    if (isHydrated && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [pathname, router, isAuthenticated, isHydrated]);

  // If we're on the login page, just render the children
  if (pathname === '/admin/login') {
    return children;
  }

  // For all other pages, check authentication
  if (!isAuthenticated) {
    return null; // This will briefly show while redirecting
  }

  return (
    <CMSContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <div className="sticky top-0 h-screen">
          <CMSSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <CMSHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="w-full px-6 py-8 min-h-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CMSContext.Provider>
  )
} 