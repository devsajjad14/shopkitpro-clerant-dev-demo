'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { NavGroup } from './NavGroup'
import { NavItem } from './NavItem'
import {
  FiHome,
  FiSettings,
  FiShoppingBag,
  FiDollarSign,
  FiBarChart2,
  FiBarChart,
  FiServer,
  FiDatabase,
  FiLayers,
  FiMonitor,
  FiTrendingDown,
  FiTrash2,
  FiHelpCircle,
  FiImage,
  FiUploadCloud,
} from 'react-icons/fi'
import { Logo } from '../../Logo'

export function Sidebar({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(true)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [cartAbandonmentEnabled, setCartAbandonmentEnabled] = useState<boolean>(false)

  useEffect(() => {
    async function fetchToggle() {
      try {
        const res = await fetch('/api/cart-abandonment-toggle')
        const data = await res.json()
        setCartAbandonmentEnabled(!!data?.data?.isEnabled)
      } catch {
        setCartAbandonmentEnabled(false)
      }
    }
    fetchToggle()
  }, [])

  const handleGroupClick = (title: string) => {
    setExpandedGroup(expandedGroup === title ? null : title)
  }

  return (
    <motion.aside
      initial={{ width: isOpen ? 288 : 80 }}
      animate={{ width: isOpen ? 288 : 80 }}
      className='h-screen bg-white dark:bg-gray-800 shadow-lg flex flex-col border-r border-gray-200 dark:border-gray-700'
    >
      {/* Logo */}
      <div className='p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700'>
        {isOpen ? <Logo className='text-xl font-bold' /> : <Logo compact />}
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
          {/* Dashboard */}
          <li>
            <NavItem
              href='/admin'
              icon={<FiHome />}
              label='Dashboard'
              isOpen={isOpen}
            />
          </li>

          {/* Settings */}
          <li>
            <NavGroup
              icon={<FiSettings />}
              title='Settings'
              isOpen={isOpen}
              expanded={expandedGroup === 'Settings'}
              onToggle={() => handleGroupClick('Settings')}
            >
              <NavItem
                href='/admin/settings/general'
                label='General Settings'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/settings/theme'
                label='Theme Settings'
                nested
                isOpen={isOpen}
              />
            </NavGroup>
          </li>

          {/* Catalog */}
          <li>
            <NavGroup
              icon={<FiShoppingBag />}
              title='Catalog'
              isOpen={isOpen}
              expanded={expandedGroup === 'Catalog'}
              onToggle={() => handleGroupClick('Catalog')}
            >
              <NavItem
                href='/admin/catalog/products'
                label='Products'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/catalog/categories'
                label='Categories'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/catalog/brands'
                label='Brands'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/catalog/attributes'
                label='Attributes'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/catalog/inventory'
                label='Inventory'
                nested
                isOpen={isOpen}
              />
            </NavGroup>
          </li>

          {/* Sales */}
          <li>
            <NavGroup
              icon={<FiDollarSign />}
              title='Sales'
              isOpen={isOpen}
              expanded={expandedGroup === 'Sales'}
              onToggle={() => handleGroupClick('Sales')}
            >
              <NavItem
                href='/admin/sales/orders'
                label='Orders'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/sales/refunds'
                label='Refunds'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/sales/customers'
                label='Customers'
                nested
                isOpen={isOpen}
              />
            </NavGroup>
          </li>

          {/* Marketing */}
          <li>
            <NavGroup
              icon={<FiBarChart2 />}
              title='Marketing'
              isOpen={isOpen}
              expanded={expandedGroup === 'Marketing'}
              onToggle={() => handleGroupClick('Marketing')}
            >
              <NavItem
                href='/admin/marketing/discounts'
                label='Discounts'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/marketing/coupons'
                label='Coupons'
                nested
                isOpen={isOpen}
              />
            </NavGroup>
          </li>

          {/* Reports */}
          <li>
            <NavGroup
              icon={<FiBarChart />}
              title='Reports'
              isOpen={isOpen}
              expanded={expandedGroup === 'Reports'}
              onToggle={() => handleGroupClick('Reports')}
            >
              <NavItem
                href='/admin/reports/sales'
                label='Sales Analytics'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/reports/customers'
                label='Customer Insights'
                nested
                isOpen={isOpen}
              />
            </NavGroup>
          </li>

          {/* System */}
          <li>
            <NavGroup
              icon={<FiServer />}
              title='System'
              isOpen={isOpen}
              expanded={expandedGroup === 'System'}
              onToggle={() => handleGroupClick('System')}
            >
              <NavItem
                href='/admin/system/payment-methods'
                label='Payment Methods'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/system/users'
                label='Users'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/system/shipping'
                label='Shipping'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/system/tax'
                label='Tax'
                nested
                isOpen={isOpen}
              />
            </NavGroup>
          </li>

          {/* Cart Abandonment */}
          {cartAbandonmentEnabled && (
            <li>
              <NavGroup
                icon={<FiTrendingDown />}
                title='Cart Abandonment'
                isOpen={isOpen}
                expanded={expandedGroup === 'Cart Abandonment'}
                onToggle={() => handleGroupClick('Cart Abandonment')}
              >
                <NavItem href='/admin/cart-abandonment' label='Overview' nested isOpen={isOpen} />
                <NavItem href='/admin/cart-abandonment/campaigns' label='Campaigns' nested isOpen={isOpen} />
                <NavItem href='/admin/cart-abandonment/carts' label='Abandoned Carts' nested isOpen={isOpen} />
                <NavItem href='/admin/cart-abandonment/recovered' label='Recovered Carts' nested isOpen={isOpen} />
              </NavGroup>
            </li>
          )}

                     {/* CMS */}
           <li>
             <NavItem
               href='/admin/cms/content'
               icon={<FiMonitor />}
               label='CMS'
               isOpen={isOpen}
             />
           </li>

           {/* Demo Data */}
          <li style={{ display: 'none' }}>
            <NavGroup
              icon={<FiDatabase />}
              title='Demo Datas'
              isOpen={isOpen}
              expanded={expandedGroup === 'Demo Data'}
              onToggle={() => handleGroupClick('Demo Data')}
            >
              <NavItem
                href='/admin/seed/create'
                label='Create Data'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/seed/delete'
                label='Delete Data'
                nested
                isOpen={isOpen}
              />
            </NavGroup>
          </li>

          {/* Gallery */}
          <li>
            <NavGroup
              icon={<FiImage />}
              title='Gallery'
              isOpen={isOpen}
              expanded={expandedGroup === 'Gallery'}
              onToggle={() => handleGroupClick('Gallery')}
            >
              <NavItem
                href='/admin/gallery/manage'
                label='Gallery Manager'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/media/sync'
                label='Sync Media'
                nested
                isOpen={isOpen}
              />
            </NavGroup>
          </li>

          {/* Data Manager */}
          <li className='mt-8'>
            <NavGroup
              icon={<FiLayers />}
              title='Data Manager'
              isOpen={isOpen}
              expanded={expandedGroup === 'Data Manager'}
              onToggle={() => handleGroupClick('Data Manager')}
            >
              <NavItem
                href='/admin/data-manager/import'
                label='Import Data'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/data-manager/export'
                label='Export Data'
                nested
                isOpen={isOpen}
              />
              <NavItem
                href='/admin/data-manager/demo'
                label='Load Demo Data'
                nested
                isOpen={isOpen}
              />
            </NavGroup>
          </li>


           {/* Resetup Store */}
          <li className='mt-4'>
            <div className={`mb-3 ${isOpen ? 'px-3' : 'px-2'}`}>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full'></div>
                {isOpen && (
                  <span className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                    Resetup Store
                  </span>
                )}
              </div>
            </div>

                         <NavItem
               href='/admin/resetup'
               icon={<FiTrash2 />}
               label='Resetup you store'
               description='this will detalete tables , esase all data and restup from scrach'
               isOpen={isOpen}
             />
          </li>

           {/* Help */}
           <li className='mt-4'>
             <NavItem
               href='/admin/help'
               icon={<FiHelpCircle />}
               label='Help'
               isOpen={isOpen}
             />
           </li>

        </ul>
      </nav>
    </motion.aside>
  )
}


