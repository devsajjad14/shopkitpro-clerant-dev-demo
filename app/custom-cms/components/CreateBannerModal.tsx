'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiX, 
  FiArrowLeft, 
  FiArrowRight, 
  FiUpload, 
  FiImage, 
  FiType, 
  FiLink, 
  FiCalendar,
  FiEye,
  FiSmartphone,
  FiMonitor,
  FiSettings,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiCopy,
  FiDownload,
  FiGlobe,
  FiTarget,
  FiBarChart2,
  FiZap,
  FiDroplet
} from 'react-icons/fi'

interface CreateBannerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateBannerModal({ isOpen, onClose }: CreateBannerModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [bannerData, setBannerData] = useState({
    title: '',
    subtitle: '',
    description: '',
    ctaText: 'Shop Now',
    ctaColor: 'blue',
    url: '',
    priority: 1,
    status: 'draft',
    startDate: '',
    endDate: '',
    desktopImage: null as File | null,
    mobileImage: null as File | null,
    targetAudience: 'all',
    deviceTargeting: 'all',
    geoTargeting: 'all',
    scheduleType: 'immediate',
    analytics: true,
    aBTesting: false
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mobileFileInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    { id: 1, title: 'Basic Info', icon: FiType, description: 'Banner details and content' },
    { id: 2, title: 'Media Upload', icon: FiImage, description: 'Upload images and assets' },
    { id: 3, title: 'Design & Style', icon: FiDroplet, description: 'Customize appearance' },
    { id: 4, title: 'Targeting', icon: FiTarget, description: 'Audience and device targeting' },
    { id: 5, title: 'Schedule', icon: FiCalendar, description: 'Publishing schedule' },
    { id: 6, title: 'Review', icon: FiEye, description: 'Preview and publish' }
  ]

  const ctaColors = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-600 hover:bg-blue-700' },
    { name: 'Red', value: 'red', class: 'bg-red-600 hover:bg-red-700' },
    { name: 'Green', value: 'green', class: 'bg-green-600 hover:bg-green-700' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-600 hover:bg-purple-700' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-600 hover:bg-orange-700' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-600 hover:bg-pink-700' }
  ]

  const handleImageUpload = (file: File, type: 'desktop' | 'mobile') => {
    if (type === 'desktop') {
      setBannerData(prev => ({ ...prev, desktopImage: file }))
    } else {
      setBannerData(prev => ({ ...prev, mobileImage: file }))
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePublish = () => {
    // Handle banner publishing logic
    console.log('Publishing banner:', bannerData)
    onClose()
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Banner Title *
                </label>
                <input
                  type="text"
                  value={bannerData.title}
                  onChange={(e) => setBannerData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter banner title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={bannerData.subtitle}
                  onChange={(e) => setBannerData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter subtitle..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={bannerData.description}
                onChange={(e) => setBannerData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter banner description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CTA Text
                </label>
                <input
                  type="text"
                  value={bannerData.ctaText}
                  onChange={(e) => setBannerData(prev => ({ ...prev, ctaText: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CTA Color
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ctaColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setBannerData(prev => ({ ...prev, ctaColor: color.value }))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        bannerData.ctaColor === color.value
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-8 rounded ${color.class}`}></div>
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{color.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Destination URL *
              </label>
              <div className="relative">
                <FiLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="url"
                  value={bannerData.url}
                  onChange={(e) => setBannerData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://example.com/product"
                />
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Desktop Image Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FiMonitor className="w-5 h-5 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Desktop Image</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Required</span>
                </div>
                
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                >
                  {bannerData.desktopImage ? (
                    <div className="space-y-4">
                      <img
                        src={URL.createObjectURL(bannerData.desktopImage)}
                        alt="Desktop preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {bannerData.desktopImage.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setBannerData(prev => ({ ...prev, desktopImage: null }))
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <FiUpload className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">Upload Desktop Image</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Recommended: 1920x600px, JPG/PNG</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'desktop')}
                  className="hidden"
                />
              </div>

              {/* Mobile Image Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FiSmartphone className="w-5 h-5 text-green-600" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Mobile Image</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Optional</span>
                </div>
                
                <div
                  onClick={() => mobileFileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors cursor-pointer"
                >
                  {bannerData.mobileImage ? (
                    <div className="space-y-4">
                      <img
                        src={URL.createObjectURL(bannerData.mobileImage)}
                        alt="Mobile preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {bannerData.mobileImage.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setBannerData(prev => ({ ...prev, mobileImage: null }))
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <FiUpload className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">Upload Mobile Image</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Recommended: 750x400px, JPG/PNG</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={mobileFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'mobile')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Image Guidelines */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiZap className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900 dark:text-blue-100">Image Guidelines</h5>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                    <li>• Desktop: 1920x600px minimum, 16:9 aspect ratio recommended</li>
                    <li>• Mobile: 750x400px minimum, optimized for mobile viewing</li>
                    <li>• File size: Maximum 2MB per image</li>
                    <li>• Formats: JPG, PNG, WebP supported</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Design Options */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Design Options</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Text Overlay Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Light', 'Dark', 'Gradient', 'None'].map((style) => (
                      <button
                        key={style}
                        className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-center"
                      >
                        <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{style}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    CTA Button Style
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Filled', 'Outlined', 'Gradient', 'Minimal'].map((style) => (
                      <button
                        key={style}
                        className="p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-center"
                      >
                        <div className={`w-full h-6 rounded mb-2 ${
                          style === 'Filled' ? 'bg-blue-600' :
                          style === 'Outlined' ? 'border-2 border-blue-600' :
                          style === 'Gradient' ? 'bg-gradient-to-r from-blue-500 to-purple-600' :
                          'bg-transparent'
                        }`}></div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{style}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Live Preview</h4>
                
                <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
                  {bannerData.desktopImage ? (
                    <img
                      src={URL.createObjectURL(bannerData.desktopImage)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiImage className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Text Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-bold mb-1">{bannerData.title || 'Banner Title'}</h3>
                      <p className="text-sm opacity-90 mb-3">{bannerData.subtitle || 'Banner subtitle'}</p>
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        ctaColors.find(c => c.value === bannerData.ctaColor)?.class || 'bg-blue-600 hover:bg-blue-700'
                      }`}>
                        {bannerData.ctaText || 'Shop Now'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiEye className="w-4 h-4" />
                  <span>Live preview updates as you type</span>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Target Audience
                </label>
                <select
                  value={bannerData.targetAudience}
                  onChange={(e) => setBannerData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Visitors</option>
                  <option value="new">New Visitors Only</option>
                  <option value="returning">Returning Visitors</option>
                  <option value="logged-in">Logged-in Users</option>
                  <option value="custom">Custom Segments</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Device Targeting
                </label>
                <select
                  value={bannerData.deviceTargeting}
                  onChange={(e) => setBannerData(prev => ({ ...prev, deviceTargeting: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Devices</option>
                  <option value="desktop">Desktop Only</option>
                  <option value="mobile">Mobile Only</option>
                  <option value="tablet">Tablet Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Geographic Targeting
              </label>
              <select
                value={bannerData.geoTargeting}
                onChange={(e) => setBannerData(prev => ({ ...prev, geoTargeting: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Locations</option>
                <option value="us">United States</option>
                <option value="eu">Europe</option>
                <option value="asia">Asia</option>
                <option value="custom">Custom Locations</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Analytics & Tracking</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bannerData.analytics}
                    onChange={(e) => setBannerData(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiTarget className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900 dark:text-white">A/B Testing</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bannerData.aBTesting}
                    onChange={(e) => setBannerData(prev => ({ ...prev, aBTesting: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Schedule Type
                </label>
                <select
                  value={bannerData.scheduleType}
                  onChange={(e) => setBannerData(prev => ({ ...prev, scheduleType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="immediate">Publish Immediately</option>
                  <option value="scheduled">Schedule for Later</option>
                  <option value="draft">Save as Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Priority
                </label>
                <select
                  value={bannerData.priority}
                  onChange={(e) => setBannerData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={1}>Priority 1 (Highest)</option>
                  <option value={2}>Priority 2</option>
                  <option value={3}>Priority 3</option>
                  <option value={4}>Priority 4</option>
                  <option value={5}>Priority 5 (Lowest)</option>
                </select>
              </div>
            </div>

            {bannerData.scheduleType === 'scheduled' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={bannerData.startDate}
                    onChange={(e) => setBannerData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={bannerData.endDate}
                    onChange={(e) => setBannerData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiCalendar className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-900 dark:text-yellow-100">Scheduling Tips</h5>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 mt-1 space-y-1">
                    <li>• Higher priority banners appear first in the carousel</li>
                    <li>• Scheduled banners will automatically publish at the specified time</li>
                    <li>• Draft banners can be edited and published later</li>
                    <li>• You can modify the schedule after publishing</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Final Preview */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Final Preview</h4>
                
                <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
                  {bannerData.desktopImage ? (
                    <img
                      src={URL.createObjectURL(bannerData.desktopImage)}
                      alt="Final preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiImage className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-bold mb-1">{bannerData.title || 'Banner Title'}</h3>
                      <p className="text-sm opacity-90 mb-3">{bannerData.subtitle || 'Banner subtitle'}</p>
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        ctaColors.find(c => c.value === bannerData.ctaColor)?.class || 'bg-blue-600 hover:bg-blue-700'
                      }`}>
                        {bannerData.ctaText || 'Shop Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Summary */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Banner Summary</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
                    <span className="text-sm text-gray-900 dark:text-white">{bannerData.title || 'Not set'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      bannerData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {bannerData.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</span>
                    <span className="text-sm text-gray-900 dark:text-white">{bannerData.priority}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Audience</span>
                    <span className="text-sm text-gray-900 dark:text-white capitalize">{bannerData.targetAudience}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Analytics</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      bannerData.analytics ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {bannerData.analytics ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FiCheck className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-green-900 dark:text-green-100">Ready to Publish!</h5>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                    Your banner is ready to go live. Review the details above and click "Publish Banner" to make it live.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Banner</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Step {currentStep} of {steps.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors">
                    <FiCopy className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors">
                    <FiDownload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex items-center gap-3 ${
                        currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentStep >= step.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {currentStep > step.id ? (
                            <FiCheck className="w-4 h-4" />
                          ) : (
                            <step.icon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="hidden md:block">
                          <p className="text-sm font-medium">{step.title}</p>
                          <p className="text-xs text-gray-500">{step.description}</p>
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-12 h-0.5 mx-4 ${
                          currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {renderStepContent()}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back
                </button>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  
                  {currentStep === steps.length ? (
                    <button
                      onClick={handlePublish}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                    >
                      <FiCheck className="w-4 h-4" />
                      Publish Banner
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      Next
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 