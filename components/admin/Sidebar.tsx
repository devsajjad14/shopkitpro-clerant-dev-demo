'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiTag,
  FiBarChart2,
  FiSettings,
  FiDatabase,
  FiTrendingDown,
  FiChevronDown,
  FiChevronRight,
  FiMail,
  FiEye,
} from 'react-icons/fi'

const navigation = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: <FiHome className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: <FiSettings className="h-5 w-5" />,
  },
  {
    title: 'Catalog',
    href: '/admin/catalog',
    icon: <FiPackage className="h-5 w-5" />,
  },
  {
    title: 'Sales',
    href: '/admin/sales',
    icon: <FiShoppingCart className="h-5 w-5" />,
  },
  {
    title: 'Marketing',
    href: '/admin/marketing',
    icon: <FiTag className="h-5 w-5" />,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: <FiBarChart2 className="h-5 w-5" />,
  },
  {
    title: 'Cart Abandonment',
    href: '/admin/cart-abandonment',
    icon: <FiTrendingDown className="h-5 w-5" />,
    subItems: [
      {
        title: 'Overview',
        href: '/admin/cart-abandonment',
        icon: <FiEye className="h-4 w-4" />,
      },
      {
        title: 'Analytics',
        href: '/admin/cart-abandonment/analytics',
        icon: <FiBarChart2 className="h-4 w-4" />,
      },
      {
        title: 'Campaigns',
        href: '/admin/cart-abandonment/campaigns',
        icon: <FiMail className="h-4 w-4" />,
      },
      {
        title: 'Abandoned Carts',
        href: '/admin/cart-abandonment/carts',
        icon: <FiShoppingCart className="h-4 w-4" />,
      },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => pathname === href
  const isSubItemActive = (href: string) => pathname === href
  const isParentActive = (item: any) => {
    if (item.subItems) {
      return item.subItems.some((subItem: any) => isSubItemActive(subItem.href))
    }
    return isActive(item.href)
  }

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isExpanded = expandedItems.includes(item.title)
            const isParentActiveState = isParentActive(item)
            
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${
                    isParentActiveState
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={item.subItems ? (e) => {
                    e.preventDefault()
                    toggleExpanded(item.title)
                  } : undefined}
                >
                  <div className="flex items-center">
                    <div
                      className={`mr-3 ${
                        isParentActiveState ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    >
                      {item.icon}
                    </div>
                    {item.title}
                  </div>
                  {item.subItems && (
                    <div className="text-gray-400">
                      {isExpanded ? (
                        <FiChevronDown className="h-4 w-4" />
                      ) : (
                        <FiChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </Link>
                
                {item.subItems && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((subItem: any) => {
                      const isSubActive = isSubItemActive(subItem.href)
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            isSubActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div
                            className={`mr-3 ${
                              isSubActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                            }`}
                          >
                            {subItem.icon}
                          </div>
                          {subItem.title}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 