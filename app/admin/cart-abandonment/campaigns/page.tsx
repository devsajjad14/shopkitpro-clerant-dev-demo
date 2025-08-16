'use client'

import RecoveryCampaignsDashboard from '@/components/admin/analytics/RecoveryCampaignsDashboard'
import { FiMail } from 'react-icons/fi'

export default function RecoveryCampaignsPage() {
  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-3xl blur-3xl"></div>
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-xl flex items-center justify-center shadow-lg">
                  <FiMail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Campaigns
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-base mt-1">
                    Manage cart recovery campaigns to increase conversions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Policy Notice */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00437f]/5 via-transparent to-[#00437f]/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-3 h-3 bg-gradient-to-br from-[#00437f] to-[#003366] rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
            <div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">24-Hour Abandonment Policy</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                All inactive shopping carts are automatically marked as abandoned after 24 hours of inactivity. 
                This ensures accurate tracking and timely recovery campaigns.
              </p>
            </div>
          </div>
        </div>
      </div>

      <RecoveryCampaignsDashboard />
    </div>
  )
} 