'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  FiX,
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiArrowDown,
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
  FiMinus,
  FiTrash2,
  FiCopy,
  FiDownload,
  FiGlobe,
  FiTarget,
  FiBarChart2,
  FiZap,
  FiDroplet,
  FiSave,
  FiPlay,
  FiPause,
  FiRotateCcw,
  FiMaximize2,
  FiMinimize2,
  FiLayers,
  FiGrid,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiBold,
  FiItalic,
  FiUnderline,
  FiMove,
  FiCrop,
  FiFilter,
  FiLayout,
  FiSquare,
  FiSliders,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiInfo,
} from 'react-icons/fi'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { uploadCustomCmsBannerImage } from '@/lib/utils/custom-cms-banner-image';

function MiniBannerCanvas({
  devicePreview,
  bannerData,
  fileInputRef,
  isFullScreen
}: {
  devicePreview: 'desktop' | 'mobile',
  bannerData: any,
  fileInputRef: any,
  isFullScreen?: boolean
}) {
  // Sizes for normal and full screen
  const mobileWidth = isFullScreen ? 400 : 300;
  const mobileHeight = isFullScreen ? 400 : 288;
  const desktopSize = isFullScreen ? 500 : 384;

  const objectUrl = useMemo(() => {
    if (bannerData.bannerImage) {
      return URL.createObjectURL(bannerData.bannerImage);
    }
    return null;
  }, [bannerData.bannerImage]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  let imageSrc = null;
  if (bannerData.bannerImage) {
    imageSrc = objectUrl;
  } else if (bannerData.bannerImageUrl) {
    imageSrc = bannerData.bannerImageUrl;
  }
  const hasValidImageSrc = imageSrc && (imageSrc.startsWith('blob:') || imageSrc.startsWith('http'));

  return (
    <>
      {/* Mobile Device Frame */}
      {devicePreview === 'mobile' && (
        <div className='relative mx-auto' style={{ maxWidth: `${mobileWidth}px` }}>
          <div className='relative mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl p-1 border border-gray-200' style={{ width: `${mobileWidth}px` }}>
            {/* Status Bar */}
            <div className='flex items-center justify-between px-3 py-1 bg-gray-900 rounded-t-xl'>
              <div className='flex items-center gap-0.5'>
                <div className='w-1 h-1 bg-green-500 rounded-full'></div>
                <div className='w-1 h-1 bg-yellow-500 rounded-full'></div>
                <div className='w-1 h-1 bg-red-500 rounded-full'></div>
              </div>
              <div className='text-white text-xs font-medium'>9:41</div>
              <div className='flex items-center gap-0.5'>
                <div className='w-2 h-1.5 border border-white rounded-sm'></div>
                <div className='w-3 h-1 bg-white rounded-sm'></div>
              </div>
            </div>
            {/* Mobile Screen */}
            <div className='bg-white rounded-b-xl overflow-hidden'>
              <div className='relative' style={{ height: `${mobileHeight}px` }}>
                {hasValidImageSrc ? (
                  <img
                    src={imageSrc}
                    alt='Banner preview'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <div className='text-center'>
                      <FiImage className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                    </div>
                  </div>
                )}
                {/* Premium Text Overlay with Advanced Gradients */}
                <div
                  className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent backdrop-blur-[0.5px]'
                  style={{ opacity: bannerData.overlayOpacity }}
                >
                  {/* Premium Title - World-Class Typography */}
                  <div
                    className='absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-4 sm:px-6 md:px-8 transition-all duration-300 ease-out'
                    style={{
                      marginTop: `${bannerData.titleMarginTop || 0}px`,
                      marginRight: `${bannerData.titleMarginRight || 0}px`,
                      marginBottom: `${bannerData.titleMarginBottom || 0}px`,
                      marginLeft: `${bannerData.titleMarginLeft || 0}px`,
                      paddingTop: `${bannerData.titlePaddingTop || 0}px`,
                      paddingRight: `${bannerData.titlePaddingRight || 0}px`,
                      paddingBottom: `${bannerData.titlePaddingBottom || 0}px`,
                      paddingLeft: `${bannerData.titlePaddingLeft || 0}px`,
                    }}
                  >
                    <h3
                      id="mini-banner-title"
                      className={`${
                        bannerData.titleBold ? 'font-bold' : 'font-normal'
                      } ${bannerData.titleItalic ? 'italic' : 'not-italic'} ${
                        bannerData.titleUnderline
                          ? 'underline'
                          : 'no-underline'
                      } text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl leading-tight sm:leading-snug md:leading-normal lg:leading-relaxed xl:leading-loose break-words hyphens-auto drop-shadow-lg ${
                        !bannerData.titleCustomFontSize ? bannerData.titleFontSize : ''
                      }`}
                      style={{
                        fontSize: bannerData.titleCustomFontSize
                          ? devicePreview === 'mobile'
                            ? `${bannerData.titleCustomFontSizeMobile || bannerData.titleCustomFontSize}px`
                            : `${bannerData.titleCustomFontSize}px`
                          : undefined,
                        color: bannerData.titleColor,
                      }}
                    >
                      {bannerData.title || 'Your Banner Title'}
                    </h3>
                  </div>
                  {/* Premium Subtitle - World-Class Typography */}
                  <div
                    className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-3 sm:px-4 md:px-6 transition-all duration-300 ease-out'
                    style={{
                      marginTop: `${bannerData.subtitleMarginTop || 0}px`,
                      marginRight: `${bannerData.subtitleMarginRight || 0}px`,
                      marginBottom: `${
                        bannerData.subtitleMarginBottom || 0
                      }px`,
                      marginLeft: `${bannerData.subtitleMarginLeft || 0}px`,
                      paddingTop: `${bannerData.subtitlePaddingTop || 0}px`,
                      paddingRight: `${
                        bannerData.subtitlePaddingRight || 0
                      }px`,
                      paddingBottom: `${
                        bannerData.subtitlePaddingBottom || 0
                      }px`,
                      paddingLeft: `${bannerData.subtitlePaddingLeft || 0}px`,
                    }}
                  >
                    <p
                      id="mini-banner-subtitle"
                      className={`opacity-95 ${
                        bannerData.subtitleBold ? 'font-bold' : 'font-normal'
                      } ${
                        bannerData.subtitleItalic ? 'italic' : 'not-italic'
                      } ${
                        bannerData.subtitleUnderline
                          ? 'underline'
                          : 'no-underline'
                      } text-xs sm:text-sm md:text-base lg:text-lg leading-tight sm:leading-snug md:leading-normal break-words hyphens-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto drop-shadow-md ${
                        !bannerData.subtitleCustomFontSize ? bannerData.subtitleFontSize : ''
                      }`}
                      style={{
                        fontSize: bannerData.subtitleCustomFontSize
                          ? devicePreview === 'mobile'
                            ? `${bannerData.subtitleCustomFontSizeMobile || bannerData.subtitleCustomFontSize}px`
                            : `${bannerData.subtitleCustomFontSize}px`
                          : undefined,
                        color: bannerData.subtitleColor,
                      }}
                    >
                      {bannerData.subtitle || 'Your banner subtitle'}
                    </p>
                  </div>
                  {/* Premium CTA Button - World-Class Design */}
                  <div
                    className='absolute left-1/2 transform -translate-x-1/2 text-center w-full px-4 sm:px-6 md:px-8 transition-all duration-300 ease-out'
                    style={{
                      top: `calc(66.666667% + ${
                        bannerData.buttonMarginTop || 0
                      }px - ${bannerData.buttonMarginBottom || 0}px)`,
                      marginRight: `${bannerData.buttonMarginRight || 0}px`,
                      marginLeft: `${bannerData.buttonMarginLeft || 0}px`,
                      paddingTop: `${bannerData.buttonPaddingTop || 0}px`,
                      paddingRight: `${bannerData.buttonPaddingRight || 0}px`,
                      paddingBottom: `${
                        bannerData.buttonPaddingBottom || 0
                      }px`,
                      paddingLeft: `${bannerData.buttonPaddingLeft || 0}px`,
                    }}
                  >
                    <button
                      id="mini-banner-cta"
                      className={`${
                        bannerData.ctaBold ? 'font-bold' : 'font-medium'
                      } ${bannerData.ctaItalic ? 'italic' : 'not-italic'} ${
                        bannerData.ctaUnderline ? 'underline' : 'no-underline'
                      } rounded-md transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 px-2 py-0.5 sm:px-2.5 sm:py-0.5 md:px-3 md:py-0.5 lg:px-3 lg:py-0.5 text-xs sm:text-xs md:text-sm lg:text-sm leading-none`}
                      style={{
                        backgroundColor: bannerData.ctaBgColor,
                        color: bannerData.ctaColor,
                        fontSize: bannerData.ctaCustomFontSize
                          ? devicePreview === 'mobile'
                            ? `${bannerData.ctaCustomFontSizeMobile || bannerData.ctaCustomFontSize}px`
                            : `${bannerData.ctaCustomFontSize}px`
                          : undefined,
                      }}
                    >
                      {bannerData.ctaText || 'Shop Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Desktop Preview - Square Format */}
      {devicePreview === 'desktop' && (
        <div className='relative mx-auto' style={{ height: `${desktopSize}px`, width: `${desktopSize}px` }}>
          {hasValidImageSrc ? (
            <img
              src={imageSrc}
              alt='Banner preview'
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center'>
              <div className='text-center'>
                <FiImage className='w-16 h-16 text-gray-400 mx-auto mb-4' />
              </div>
            </div>
          )}
          {/* Premium Text Overlay with Advanced Gradients */}
          <div
            className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent backdrop-blur-[0.5px]'
            style={{ opacity: bannerData.overlayOpacity }}
          >
            {/* Premium Title - World-Class Typography */}
            <div
              className='absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 transition-all duration-300 ease-out'
              style={{
                marginTop: `${bannerData.titleMarginTop || 0}px`,
                marginRight: `${bannerData.titleMarginRight || 0}px`,
                marginBottom: `${bannerData.titleMarginBottom || 0}px`,
                marginLeft: `${bannerData.titleMarginLeft || 0}px`,
                paddingTop: `${bannerData.titlePaddingTop || 0}px`,
                paddingRight: `${bannerData.titlePaddingRight || 0}px`,
                paddingBottom: `${bannerData.titlePaddingBottom || 0}px`,
                paddingLeft: `${bannerData.titlePaddingLeft || 0}px`,
              }}
            >
              <h3
                id="mini-banner-title"
                className={`${
                  bannerData.titleBold ? 'font-bold' : 'font-normal'
                } ${bannerData.titleItalic ? 'italic' : 'not-italic'} ${
                  bannerData.titleUnderline
                    ? 'underline'
                    : 'no-underline'
                } text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl leading-tight sm:leading-snug md:leading-normal lg:leading-relaxed xl:leading-loose break-words hyphens-auto drop-shadow-lg ${
                  !bannerData.titleCustomFontSize ? bannerData.titleFontSize : ''
                }`}
                style={{
                  fontSize: bannerData.titleCustomFontSize
                    ? devicePreview === 'mobile'
                      ? `${bannerData.titleCustomFontSizeMobile || bannerData.titleCustomFontSize}px`
                      : `${bannerData.titleCustomFontSize}px`
                    : undefined,
                  color: bannerData.titleColor,
                }}
              >
                {bannerData.title || 'Your Banner Title'}
              </h3>
            </div>
            {/* Premium Subtitle - World-Class Typography */}
            <div
              className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 transition-all duration-300 ease-out'
              style={{
                marginTop: `${bannerData.subtitleMarginTop || 0}px`,
                marginRight: `${bannerData.subtitleMarginRight || 0}px`,
                marginBottom: `${bannerData.subtitleMarginBottom || 0}px`,
                marginLeft: `${bannerData.subtitleMarginLeft || 0}px`,
                paddingTop: `${bannerData.subtitlePaddingTop || 0}px`,
                paddingRight: `${bannerData.subtitlePaddingRight || 0}px`,
                paddingBottom: `${bannerData.subtitlePaddingBottom || 0}px`,
                paddingLeft: `${bannerData.subtitlePaddingLeft || 0}px`,
              }}
            >
              <p
                id="mini-banner-subtitle"
                className={`opacity-95 ${
                  bannerData.subtitleBold ? 'font-bold' : 'font-normal'
                } ${
                  bannerData.subtitleItalic ? 'italic' : 'not-italic'
                } ${
                  bannerData.subtitleUnderline
                    ? 'underline'
                    : 'no-underline'
                } text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-tight sm:leading-snug md:leading-normal break-words hyphens-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto drop-shadow-md ${
                  !bannerData.subtitleCustomFontSize ? bannerData.subtitleFontSize : ''
                }`}
                style={{
                  fontSize: bannerData.subtitleCustomFontSize
                    ? devicePreview === 'mobile'
                      ? `${bannerData.subtitleCustomFontSizeMobile || bannerData.subtitleCustomFontSize}px`
                      : `${bannerData.subtitleCustomFontSize}px`
                    : undefined,
                  color: bannerData.subtitleColor,
                }}
              >
                {bannerData.subtitle || 'Your banner subtitle'}
              </p>
            </div>
            {/* Premium CTA Button - World-Class Design */}
            <div
              className='absolute left-1/2 transform -translate-x-1/2 text-center w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 transition-all duration-300 ease-out'
              style={{
                top: `calc(66.666667% + ${bannerData.buttonMarginTop || 0}px - ${bannerData.buttonMarginBottom || 0}px)`,
                marginRight: `${bannerData.buttonMarginRight || 0}px`,
                marginLeft: `${bannerData.buttonMarginLeft || 0}px`,
                paddingTop: `${bannerData.buttonPaddingTop || 0}px`,
                paddingRight: `${bannerData.buttonPaddingRight || 0}px`,
                paddingBottom: `${bannerData.buttonPaddingBottom || 0}px`,
                paddingLeft: `${bannerData.buttonPaddingLeft || 0}px`,
              }}
            >
              <button
                id="mini-banner-cta"
                className={`${
                  bannerData.ctaBold ? 'font-bold' : 'font-medium'
                } ${bannerData.ctaItalic ? 'italic' : 'not-italic'} ${
                  bannerData.ctaUnderline ? 'underline' : 'no-underline'
                } rounded-md transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 px-2 py-0.5 sm:px-2.5 sm:py-0.5 md:px-3 md:py-0.5 lg:px-3 lg:py-0.5 text-xs sm:text-xs md:text-sm lg:text-sm leading-none`}
                style={{
                  backgroundColor: bannerData.ctaBgColor,
                  color: bannerData.ctaColor,
                  fontSize: bannerData.ctaCustomFontSize
                    ? devicePreview === 'mobile'
                      ? `${bannerData.ctaCustomFontSizeMobile || bannerData.ctaCustomFontSize}px`
                      : `${bannerData.ctaCustomFontSize}px`
                    : undefined,
                }}
              >
                {bannerData.ctaText || 'Shop Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function CreateBannerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [activePreset, setActivePreset] = useState<
    'standard' | 'spacious' | 'compact' | 'minimal'
  >('standard')
  const [bannerData, setBannerData] = useState({
    name: '',
    title: '',
    subtitle: '',
    description: '',
    ctaText: 'Shop Now',
    ctaColor: '#000000',
    ctaBgColor: '#FFFFFF',
    titleColor: '#EF4444',
    subtitleColor: '#3B82F6',
    descriptionColor: '#D1D5DB',
    url: '',
    buttonUrl: '',
    priority: 1,
    status: 'draft',
    startDate: '',
    endDate: '',
    bannerImage: null as File | null,
    bannerImageUrl: '',
    bannerImageFilename: '',
    targetAudience: 'all',
    deviceTargeting: 'all',
    geoTargeting: 'all',
    scheduleType: 'immediate',
    analytics: true,
    aBTesting: false,
    overlayOpacity: 0.5,
    textAlignment: 'left',
    fontSize: 'large',
    // Advanced typography properties
    titleBold: true,
    titleItalic: false,
    titleUnderline: false,
    titleFontSize: 'text-2xl',
    subtitleBold: true,
    subtitleItalic: false,
    subtitleUnderline: false,
    subtitleFontSize: 'text-lg',
    // Position properties for draggable elements
    titlePosition: { x: 50, y: 30 },
    subtitlePosition: { x: 50, y: 45 },
    descriptionPosition: { x: 50, y: 60 },
    ctaPosition: { x: 50, y: 75 },
    // Custom font size properties - Device Specific
    titleCustomFontSize: '38',
    titleCustomFontSizeMobile: '38',
    subtitleCustomFontSize: '32',
    subtitleCustomFontSizeMobile: '32',
    ctaCustomFontSize: '20',
    ctaCustomFontSizeMobile: '20',
    // CTA typography properties
    ctaBold: true,
    ctaItalic: false,
    ctaUnderline: false,
    // Spacing properties
    titleMargin: 0,
    titlePadding: 0,
    subtitleMargin: 0,
    subtitlePadding: 0,
    buttonMargin: 0,
    buttonPadding: 0,
    // Four-directional spacing properties
    titleMarginTop: 0,
    titleMarginRight: 0,
    titleMarginBottom: 0,
    titleMarginLeft: 0,
    titlePaddingTop: 0,
    titlePaddingRight: 0,
    titlePaddingBottom: 0,
    titlePaddingLeft: 0,
    subtitleMarginTop: 0,
    subtitleMarginRight: 0,
    subtitleMarginBottom: 0,
    subtitleMarginLeft: 0,
    subtitlePaddingTop: 0,
    subtitlePaddingRight: 0,
    subtitlePaddingBottom: 0,
    subtitlePaddingLeft: 0,
    buttonMarginTop: 0,
    buttonMarginRight: 0,
    buttonMarginBottom: 0,
    buttonMarginLeft: 0,
    buttonPaddingTop: 0,
    buttonPaddingRight: 0,
    buttonPaddingBottom: 0,
    buttonPaddingLeft: 0,
  })
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState(400)
  const [panelDocked, setPanelDocked] = useState<'right' | 'left' | null>(null)
  const [activePanelTab, setActivePanelTab] = useState<
    | 'links'
    | 'content'
    | 'advanced'
    | 'title-style'
    | 'subtitle-style'
    | 'button-style'
    | 'title-layout'
    | 'subtitle-layout'
    | 'button-layout'
  >('advanced')
  const [activePanelType, setActivePanelType] = useState<
    'content' | 'style' | 'layout'
  >('content')
  const [isResizing, setIsResizing] = useState(false)
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop')
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  // Add Save Draft logic
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  const steps = [
    {
      id: 1,
      title: 'Design Canvas',
      icon: FiImage,
      description: 'Visual banner builder',
    },
    {
      id: 2,
      title: 'Content & Links',
      icon: FiType,
      description: 'Text and URL management',
    },
    {
      id: 3,
      title: 'Advanced Settings',
      icon: FiSettings,
      description: 'Targeting and analytics',
    },
    {
      id: 4,
      title: 'Publish',
      icon: FiCheck,
      description: 'Review and go live',
    },
  ]

  const presetColors = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#8B5CF6',
    '#F59E0B',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#6366F1',
    '#14B8A6',
    '#F43F5E',
  ]

  const fontSizes = [
    { name: 'Small', value: 'small', class: 'text-sm' },
    { name: 'Medium', value: 'medium', class: 'text-base' },
    { name: 'Large', value: 'large', class: 'text-lg' },
    { name: 'Extra Large', value: 'xl', class: 'text-xl' },
    { name: 'Huge', value: '2xl', class: 'text-2xl' },
  ]

  const handleImageUpload = async (file: File) => {
    setBannerData((prev) => ({ ...prev, bannerImage: file, bannerImageUrl: '' }));
    if (bannerData.name.trim()) {
      try {
        const result = await uploadCustomCmsBannerImage(file, bannerData.name.trim());
        setBannerData((prev) => ({
          ...prev,
          bannerImageUrl: result.imageUrl,
          bannerImageFilename: result.filename,
        }));
      } catch (error) {
        toast({ title: 'Image Upload Failed', description: 'Could not upload image', variant: 'destructive' });
      }
    }
  };

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

  const handlePublish = async () => {
    if (!bannerData.name.trim()) {
      toast({ title: 'Banner name required', description: 'Please enter a banner name', variant: 'destructive' });
      return;
    }
    if (!bannerData.bannerImage) {
      toast({ title: 'Banner image required', description: 'Please upload a banner image', variant: 'destructive' });
      return;
    }
    setIsPublishing(true);
    try {
      const html = generateBannerHtml();
      const bannerDataToSave = {
        name: bannerData.name,
        content: html,
        status: 'active',
        priority: bannerData.priority,
        startDate: bannerData.startDate ? new Date(bannerData.startDate) : null,
        endDate: bannerData.endDate ? new Date(bannerData.endDate) : null,
        imageUrl: bannerData.bannerImageUrl || '',
      };
      const response = await fetch('/api/mini-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerDataToSave),
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Banner Published', description: 'Mini banner published successfully!' });
        router.push('/custom-cms/mini-banners');
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to publish mini banner', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error publishing mini banner:', error);
      toast({ title: 'Error', description: 'Failed to publish mini banner', variant: 'destructive' });
    } finally {
      setIsPublishing(false);
    }
  };

  // Premium Panel Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close panel
      if (e.key === 'Escape' && sidePanelOpen) {
        setSidePanelOpen(false)
      }
      // Ctrl/Cmd + P to toggle panel
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        setSidePanelOpen(!sidePanelOpen)
      }
      // Ctrl/Cmd + Shift + P to open panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setSidePanelOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidePanelOpen])

  // Focus management for panel
  useEffect(() => {
    if (sidePanelOpen && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length > 0) {
        ;(focusableElements[0] as HTMLElement).focus()
      }
    }
  }, [sidePanelOpen, activePanelTab])

  // Panel resize functionality
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing) return

      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= 300 && newWidth <= 800) {
        setPanelWidth(newWidth)
      }
    }

    const handleResizeEnd = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [isResizing])

  // Panel docking functionality
  const handleDockPanel = (position: 'right' | 'left') => {
    setPanelDocked(panelDocked === position ? null : position)
  }

  // Full screen handlers
  const handleFullScreen = useCallback(() => setIsFullScreen(true), [])
  const handleExitFullScreen = useCallback(() => setIsFullScreen(false), [])
  useEffect(() => {
    if (!isFullScreen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleExitFullScreen()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isFullScreen, handleExitFullScreen])

  // Reset handler
  const defaultBannerData = {
    name: '',
    title: '',
    subtitle: '',
    description: '',
    ctaText: 'Shop Now',
    ctaColor: '#000000',
    ctaBgColor: '#FFFFFF',
    titleColor: '#EF4444',
    subtitleColor: '#3B82F6',
    descriptionColor: '#D1D5DB',
    url: '',
    buttonUrl: '',
    priority: 1,
    status: 'draft',
    startDate: '',
    endDate: '',
    bannerImage: null as File | null,
    bannerImageUrl: '',
    bannerImageFilename: '',
    targetAudience: 'all',
    deviceTargeting: 'all',
    geoTargeting: 'all',
    scheduleType: 'immediate',
    analytics: true,
    aBTesting: false,
    overlayOpacity: 0.5,
    textAlignment: 'left',
    fontSize: 'large',
    titleBold: true,
    titleItalic: false,
    titleUnderline: false,
    titleFontSize: 'text-2xl',
    subtitleBold: true,
    subtitleItalic: false,
    subtitleUnderline: false,
    subtitleFontSize: 'text-lg',
    titlePosition: { x: 50, y: 30 },
    subtitlePosition: { x: 50, y: 45 },
    descriptionPosition: { x: 50, y: 60 },
    ctaPosition: { x: 50, y: 75 },
    titleCustomFontSize: '28',
    titleCustomFontSizeMobile: '20',
    subtitleCustomFontSize: '16',
    subtitleCustomFontSizeMobile: '14',
    ctaCustomFontSize: '10',
    ctaCustomFontSizeMobile: '8',
    ctaBold: false,
    ctaItalic: false,
    ctaUnderline: false,
    titleMargin: 0,
    titlePadding: 0,
    subtitleMargin: 0,
    subtitlePadding: 0,
    buttonMargin: 0,
    buttonPadding: 0,
    titleMarginTop: 0,
    titleMarginRight: 0,
    titleMarginBottom: 0,
    titleMarginLeft: 0,
    titlePaddingTop: 0,
    titlePaddingRight: 0,
    titlePaddingBottom: 0,
    titlePaddingLeft: 0,
    subtitleMarginTop: 0,
    subtitleMarginRight: 0,
    subtitleMarginBottom: 0,
    subtitleMarginLeft: 0,
    subtitlePaddingTop: 0,
    subtitlePaddingRight: 0,
    subtitlePaddingBottom: 0,
    subtitlePaddingLeft: 0,
    buttonMarginTop: 0,
    buttonMarginRight: 0,
    buttonMarginBottom: 0,
    buttonMarginLeft: 0,
    buttonPaddingTop: 0,
    buttonPaddingRight: 0,
    buttonPaddingBottom: 0,
    buttonPaddingLeft: 0,
  }
  const handleReset = () => {
    setBannerData(defaultBannerData)
    setShowResetConfirm(false)
  }

  function handleBannerNameChange(name: string) {
    setBannerData(prev => ({ ...prev, name }))
  }

  // Add Save Draft logic
  function generateBannerHtml() {
    const imageUrl = bannerData.bannerImageUrl || '';
    const title = bannerData.title || 'Your Banner Title';
    const subtitle = bannerData.subtitle || 'Your banner subtitle';
    const titlePositionStyle = bannerData.titlePosition ? `top: ${bannerData.titlePosition.y}%; left: ${bannerData.titlePosition.x}%; transform: translate(-50%, -50%);` : '';
    const subtitlePositionStyle = bannerData.subtitlePosition ? `top: ${bannerData.subtitlePosition.y}%; left: ${bannerData.subtitlePosition.x}%; transform: translate(-50%, -50%);` : '';
    const ctaPositionStyle = bannerData.ctaPosition ? `top: ${bannerData.ctaPosition.y}%; left: ${bannerData.ctaPosition.x}%; transform: translate(-50%, -50%);` : '';
    const titleStyles = `
      position: absolute;
      ${titlePositionStyle}
      font-weight: ${bannerData.titleBold ? 'bold' : 'normal'};
      font-style: ${bannerData.titleItalic ? 'italic' : 'normal'};
      text-decoration: ${bannerData.titleUnderline ? 'underline' : 'none'};
      color: ${bannerData.titleColor};
      font-size: ${bannerData.titleCustomFontSize}px;
      margin: ${bannerData.titleMarginTop}px ${bannerData.titleMarginRight}px ${bannerData.titleMarginBottom}px ${bannerData.titleMarginLeft}px;
      padding: ${bannerData.titlePaddingTop}px ${bannerData.titlePaddingRight}px ${bannerData.titlePaddingBottom}px ${bannerData.titlePaddingLeft}px;
      width: 100%;
      text-align: center;
      z-index: 2;
    `;
    const subtitleStyles = `
      position: absolute;
      ${subtitlePositionStyle}
      font-weight: ${bannerData.subtitleBold ? 'bold' : 'normal'};
      font-style: ${bannerData.subtitleItalic ? 'italic' : 'normal'};
      text-decoration: ${bannerData.subtitleUnderline ? 'underline' : 'none'};
      color: ${bannerData.subtitleColor};
      font-size: ${bannerData.subtitleCustomFontSize}px;
      margin: ${bannerData.subtitleMarginTop}px ${bannerData.subtitleMarginRight}px ${bannerData.subtitleMarginBottom}px ${bannerData.subtitleMarginLeft}px;
      padding: ${bannerData.subtitlePaddingTop}px ${bannerData.subtitlePaddingRight}px ${bannerData.subtitlePaddingBottom}px ${bannerData.subtitlePaddingLeft}px;
      width: 100%;
      text-align: center;
      z-index: 2;
    `;
    const buttonStyles = `
      position: absolute;
      ${ctaPositionStyle}
      font-weight: ${bannerData.ctaBold ? 'bold' : 'normal'};
      font-style: ${bannerData.ctaItalic ? 'italic' : 'normal'};
      text-decoration: ${bannerData.ctaUnderline ? 'underline' : 'none'};
      background-color: ${bannerData.ctaBgColor};
      color: ${bannerData.ctaColor};
      font-size: ${bannerData.ctaCustomFontSize}px;
      margin: ${bannerData.buttonMarginTop}px ${bannerData.buttonMarginRight}px ${bannerData.buttonMarginBottom}px ${bannerData.buttonMarginLeft}px;
      padding: ${bannerData.buttonPaddingTop}px ${bannerData.buttonPaddingRight}px ${bannerData.buttonPaddingBottom}px ${bannerData.buttonPaddingLeft}px;
      min-width: 80px;
      min-height: 32px;
      z-index: 2;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 8px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
    `;
    return `
<div class="relative mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl p-1 border border-gray-200" style="max-width: 400px;">
  <div class="relative mx-auto bg-gray-900 rounded-2xl p-1 shadow-2xl" style="width: 400px;">
    <div class="bg-white rounded-xl overflow-hidden">
      <div class="relative" style="height: 400px; width: 400px;">
        ${imageUrl ? `<img src="${imageUrl}" alt="Banner" style="width: 100%; height: 100%; object-fit: cover;" />` : ''}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent backdrop-blur-[0.5px]" style="opacity: ${bannerData.overlayOpacity};">
          <div class="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 transition-all duration-300 ease-out" style="${titlePositionStyle} margin-top: ${bannerData.titleMarginTop || 0}px; margin-right: ${bannerData.titleMarginRight || 0}px; margin-bottom: ${bannerData.titleMarginBottom || 0}px; margin-left: ${bannerData.titleMarginLeft || 0}px; padding-top: ${bannerData.titlePaddingTop || 0}px; padding-right: ${bannerData.titlePaddingRight || 0}px; padding-bottom: ${bannerData.titlePaddingBottom || 0}px; padding-left: ${bannerData.titlePaddingLeft || 0}px;">
            <h3 id="mini-banner-title" class="${bannerData.titleBold ? 'font-bold' : 'font-normal'} ${bannerData.titleItalic ? 'italic' : 'not-italic'} ${bannerData.titleUnderline ? 'underline' : 'no-underline'} text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl leading-tight sm:leading-snug md:leading-normal lg:leading-relaxed xl:leading-loose break-words hyphens-auto drop-shadow-lg ${!bannerData.titleCustomFontSize ? bannerData.titleFontSize : ''}" style="font-size: ${bannerData.titleCustomFontSize ? bannerData.titleCustomFontSize : ''}px; color: ${bannerData.titleColor};">${title}</h3>
          </div>
          <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 transition-all duration-300 ease-out" style="${subtitlePositionStyle} margin-top: ${bannerData.subtitleMarginTop || 0}px; margin-right: ${bannerData.subtitleMarginRight || 0}px; margin-bottom: ${bannerData.subtitleMarginBottom || 0}px; margin-left: ${bannerData.subtitleMarginLeft || 0}px; padding-top: ${bannerData.subtitlePaddingTop || 0}px; padding-right: ${bannerData.subtitlePaddingRight || 0}px; padding-bottom: ${bannerData.subtitlePaddingBottom || 0}px; padding-left: ${bannerData.subtitlePaddingLeft || 0}px;">
            <p id="mini-banner-subtitle" class="opacity-95 ${bannerData.subtitleBold ? 'font-bold' : 'font-normal'} ${bannerData.subtitleItalic ? 'italic' : 'not-italic'} ${bannerData.subtitleUnderline ? 'underline' : 'no-underline'} text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl leading-tight sm:leading-snug md:leading-normal break-words hyphens-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mx-auto drop-shadow-md ${!bannerData.subtitleCustomFontSize ? bannerData.subtitleFontSize : ''}" style="font-size: ${bannerData.subtitleCustomFontSize ? bannerData.subtitleCustomFontSize : ''}px; color: ${bannerData.subtitleColor};">${subtitle}</p>
          </div>
          <div class="absolute left-1/2 transform -translate-x-1/2 text-center w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 transition-all duration-300 ease-out" style="top: calc(66.666667% + ${bannerData.buttonMarginTop || 0}px - ${bannerData.buttonMarginBottom || 0}px); margin-right: ${bannerData.buttonMarginRight || 0}px; margin-left: ${bannerData.buttonMarginLeft || 0}px; padding-top: ${bannerData.buttonPaddingTop || 0}px; padding-right: ${bannerData.buttonPaddingRight || 0}px; padding-bottom: ${bannerData.buttonPaddingBottom || 0}px; padding-left: ${bannerData.buttonPaddingLeft || 0}px;">
            ${bannerData.ctaText ? `<button id="mini-banner-cta" class="${bannerData.ctaBold ? 'font-bold' : 'font-medium'} ${bannerData.ctaItalic ? 'italic' : 'not-italic'} ${bannerData.ctaUnderline ? 'underline' : 'no-underline'} rounded-md transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 px-2 py-0.5 sm:px-2.5 sm:py-0.5 md:px-3 md:py-0.5 lg:px-3 lg:py-0.5 text-xs sm:text-xs md:text-sm lg:text-sm leading-none" style="background-color: ${bannerData.ctaBgColor}; color: ${bannerData.ctaColor}; font-size: ${bannerData.ctaCustomFontSize ? bannerData.ctaCustomFontSize : ''}px;">${bannerData.ctaText}</button>` : ''}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<style>
.mini-banner-container:hover .mini-banner-cta {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
.mini-banner-cta {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 0.5rem 1.5rem;
  font-size: 1rem;
  min-width: 80px;
  min-height: 32px;
  display: inline-block;
  overflow: visible;
}
.mini-banner-cta:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
@media (max-width: 768px) {
  .mini-banner-title {
    font-size: ${bannerData.titleCustomFontSizeMobile}px !important;
  }
  .mini-banner-subtitle {
    font-size: ${bannerData.subtitleCustomFontSizeMobile}px !important;
  }
  .mini-banner-cta {
    font-size: ${bannerData.ctaCustomFontSizeMobile}px !important;
  }
}
</style>
    `;
  }
  const handleSaveDraft = async () => {
    if (!bannerData.name.trim()) {
      toast({ title: 'Banner name required', description: 'Please enter a banner name', variant: 'destructive' });
      return;
    }
    if (!bannerData.bannerImage) {
      toast({ title: 'Banner image required', description: 'Please upload a banner image', variant: 'destructive' });
      return;
    }
    setIsSavingDraft(true);
    try {
      const html = generateBannerHtml();
      const bannerDataToSave = {
        name: bannerData.name,
        content: html,
        status: 'draft',
        priority: bannerData.priority,
        startDate: bannerData.startDate ? new Date(bannerData.startDate) : null,
        endDate: bannerData.endDate ? new Date(bannerData.endDate) : null,
        imageUrl: bannerData.bannerImageUrl || '',
      };
      const response = await fetch('/api/mini-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerDataToSave),
      });
      const result = await response.json();
      if (result.success) {
        toast({ title: 'Draft Saved', description: 'Mini banner saved as draft successfully!' });
        router.push('/custom-cms/mini-banners');
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to save mini banner', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error saving mini banner:', error);
      toast({ title: 'Error', description: 'Failed to save mini banner', variant: 'destructive' });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Add useEffect to upload image when bannerImage and name are set, and bannerImageUrl is not set
  useEffect(() => {
    if (
      bannerData.bannerImage &&
      bannerData.name.trim() &&
      !bannerData.bannerImageUrl
    ) {
      uploadCustomCmsBannerImage(bannerData.bannerImage, bannerData.name.trim()).then(result => {
        setBannerData(current => ({
          ...current,
          bannerImageUrl: result.imageUrl,
          bannerImageFilename: result.filename,
        }));
      }).catch(() => {
        toast({ title: 'Image Upload Failed', description: 'Could not upload image', variant: 'destructive' });
      });
    }
  }, [bannerData.bannerImage, bannerData.name]);

  // Add handleRemoveImage function
  function handleRemoveImage() {
    setBannerData(prev => ({ ...prev, bannerImage: null, bannerImageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative'>
      {/* Premium Banner Name Input Section (moved to top, styled like main banner) */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="max-w-4xl mx-auto px-6 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push('/custom-cms/mini-banners')}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Back to banners"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Mini Banner
            </h1>
          </div>
          <p className="text-base text-gray-500 dark:text-gray-400 mb-6">
            Design a stunning mini banner for your storefront
          </p>
          {/* Banner Name Input */}
          <form onSubmit={e => e.preventDefault()}>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={bannerData.name}
                onChange={(e) => handleBannerNameChange(e.target.value)}
                placeholder="Banner name (e.g., Mini Sale 2024)"
                className="w-full pl-4 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-base font-medium transition-all duration-200"
                aria-label="Banner name"
              />
              {/* Custom tooltip for info */}
              <div className="relative group ml-1 text-gray-400 cursor-pointer">
                <FiInfo className="w-5 h-5" />
                <span className="absolute left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap transition-opacity">
                  Give your mini banner a descriptive name for easy identification
                </span>
              </div>
            </div>
            {/* Main Actions Bar */}
            <div className="flex flex-wrap gap-3 justify-end mt-2">
              <div className="relative group">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || !bannerData.name.trim() || !bannerData.bannerImage}
                  className={`px-5 py-2 rounded-lg font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSavingDraft ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Draft'
                  )}
                </button>
                {(!bannerData.name.trim() || !bannerData.bannerImage) && (
                  <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    Banner name and banner image are required.
                  </span>
                )}
              </div>
              <div className="relative group">
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || !bannerData.name.trim() || !bannerData.bannerImage}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all duration-200 px-6 py-2 min-w-[120px] flex items-center gap-2 font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Publish Mini Banner"
                  tabIndex={0}
                  style={{boxShadow: '0 4px 24px 0 rgba(59,130,246,0.10), 0 1.5px 6px 0 rgba(0,0,0,0.08)'}}
                >
                  {isPublishing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                      Publishing...
                    </span>
                  ) : (
                    <>
                      <FiCheck className="w-5 h-5 text-white" />
                      Publish Banner
                    </>
                  )}
                </button>
                {(!bannerData.name.trim() || !bannerData.bannerImage) && (
                  <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 rounded bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    Banner name and banner image are required.
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Page Header (remove action buttons from here) */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  Create Banner
                </h1>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Design your perfect banner
                </p>
              </div>
            </div>
            {/* Remove action buttons from here */}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center'>
                <div
                  className={`flex items-center gap-3 ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <FiCheck className='w-5 h-5' />
                    ) : (
                      <step.icon className='w-5 h-5' />
                    )}
                  </div>
                  <div>
                    <p className='text-sm font-medium'>{step.title}</p>
                    <p className='text-xs text-gray-500'>{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-6 ${
                      currentStep > step.id
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Dynamic Width */}
      <motion.div 
        className='px-6 py-8'
        animate={{
          width: sidePanelOpen ? `calc(100% - ${panelWidth}px)` : '100%',
          marginRight: sidePanelOpen ? `${panelWidth}px` : '0px'
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1]
        }}
      >
        {/* Design Canvas - Dynamic Width */}
        <div className='w-full'>
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Design Canvas
              </h3>
              <div className='flex items-center gap-2'>
                <button
                  className='p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
                  onClick={handleFullScreen}
                  title='Full Screen Canvas'
                  aria-label='Full Screen Canvas'
                >
                  <FiMaximize2 className='w-5 h-5' />
                </button>
                <button
                  className='p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400'
                  onClick={() => setShowResetConfirm(true)}
                  title='Reset Banner Design'
                  aria-label='Reset Banner Design'
                >
                  <FiRotateCcw className='w-5 h-5' />
                </button>
              </div>
            </div>

            {/* Responsive Mini Banner Preview - Square Format */}
            <motion.div 
              className='relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden'
              animate={{
                maxWidth: devicePreview === 'mobile' ? '300px' : '400px',
                margin: '0 auto'
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
            >
              <MiniBannerCanvas devicePreview={devicePreview} bannerData={bannerData} fileInputRef={fileInputRef} isFullScreen={isFullScreen} />
            </motion.div>

            {/* Device Toggle */}
            <div className='flex items-center justify-center mt-4'>
              <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
                <button 
                  onClick={() => setDevicePreview('desktop')}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    devicePreview === 'desktop'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiMonitor className='w-4 h-4' />
                </button>
                <button 
                  onClick={() => setDevicePreview('mobile')}
                  className={`px-4 py-2 rounded-md transition-all duration-200 ${
                    devicePreview === 'mobile'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiSmartphone className='w-4 h-4' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Floating Panel Handles - Artistic Design */}
      {!sidePanelOpen && (
        <div className='fixed top-1/2 right-4 z-50 flex flex-col items-center gap-3'>
          {/* Content Panel Toggle - Premium Glassmorphism */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className='group relative flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 hover:bg-white/90 dark:hover:bg-gray-700/90'
            style={{ 
              transform: 'translateY(-50%)',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            onClick={() => {
              setActivePanelType('content')
              setActivePanelTab('advanced')
              setSidePanelOpen(true)
            }}
            aria-label='Open content panel'
            title='Content Settings (Ctrl+P)'
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 12px 40px rgba(59, 130, 246, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className='absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            <FiImage className='w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors relative z-10' />
            <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </motion.button>

          {/* Style Panel Toggle - Premium Glassmorphism */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className='group relative flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 hover:bg-white/90 dark:hover:bg-gray-700/90'
            style={{ 
              transform: 'translateY(-50%)',
              boxShadow: '0 8px 32px rgba(147, 51, 234, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            onClick={() => {
              setActivePanelType('style')
              setActivePanelTab('title-style')
              setSidePanelOpen(true)
            }}
            aria-label='Open style panel'
            title='Style Settings'
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 12px 40px rgba(147, 51, 234, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className='absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            <FiType className='w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors relative z-10' />
            <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </motion.button>

          {/* Layout Panel Toggle - Premium Glassmorphism */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className='group relative flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 hover:bg-white/90 dark:hover:bg-gray-700/90'
            style={{ 
              transform: 'translateY(-50%)',
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            onClick={() => {
              setActivePanelType('layout')
              setActivePanelTab('title-layout')
              setSidePanelOpen(true)
            }}
            aria-label='Open layout panel'
            title='Layout Settings'
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 12px 40px rgba(34, 197, 94, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className='absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            <FiLayout className='w-5 h-5 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors relative z-10' />
            <div className='absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </motion.button>

          {/* Floating Indicator Line */}
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className='w-0.5 h-8 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-green-500/50 rounded-full'
            style={{ transform: 'translateY(-50%)' }}
          />
        </div>
      )}

      {/* Premium Sliding Side Panel with Advanced Features */}
      <AnimatePresence>
        {sidePanelOpen && (
          <>
            {/* Premium Drawer Panel */}
            <motion.aside
              ref={panelRef}
              key='sidepanel-drawer'
              initial={{ x: panelWidth, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: panelWidth, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className='fixed top-0 right-0 h-full bg-white dark:bg-gray-800 rounded-l-2xl shadow-2xl border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col'
              style={{
                width: `${panelWidth}px`,
                boxShadow: '0 8px 32px 0 rgba(31, 41, 55, 0.16)',
                maxWidth: '90vw',
              }}
            >
              {/* Resize Handle */}
              <div
                ref={resizeHandleRef}
                onMouseDown={handleResizeStart}
                className='absolute left-0 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-600 hover:bg-blue-400 dark:hover:bg-blue-500 cursor-col-resize transition-colors'
              />

              {/* Panel Header */}
              <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
                <div className='flex items-center gap-3'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    {activePanelType === 'content'
                      ? 'Content Settings'
                      : activePanelType === 'style'
                      ? 'Style Settings'
                      : 'Layout Settings'}
                  </h3>
                  <div className='flex items-center gap-1'>
                    <button
                      onClick={() => handleDockPanel('right')}
                      className={`p-1 rounded transition-colors ${
                        panelDocked === 'right'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title='Dock to Right'
                    >
                      <FiChevronRight className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDockPanel('left')}
                      className={`p-1 rounded transition-colors ${
                        panelDocked === 'left'
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title='Dock to Left'
                    >
                      <FiChevronLeft className='w-4 h-4' />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSidePanelOpen(false)}
                  className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                  title='Close Panel (Esc)'
                >
                  <FiX className='w-5 h-5' />
                </button>
              </div>

              {/* Panel Tabs */}
              <div className='flex border-b border-gray-200 dark:border-gray-700'>
                {activePanelType === 'content' ? (
                  <>
                    <button
                      onClick={() => setActivePanelTab('advanced')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'advanced'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiImage className='w-4 h-4' />
                      Banner Image
                    </button>
                    <button
                      onClick={() => setActivePanelTab('content')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'content'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiType className='w-4 h-4' />
                      Content
                    </button>
                    <button
                      onClick={() => setActivePanelTab('links')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'links'
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiLink className='w-4 h-4' />
                      Links
                    </button>
                  </>
                ) : activePanelType === 'style' ? (
                  <>
                    <button
                      onClick={() => setActivePanelTab('title-style')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'title-style'
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiType className='w-4 h-4' />
                      Title Style
                    </button>
                    <button
                      onClick={() => setActivePanelTab('subtitle-style')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'subtitle-style'
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiType className='w-4 h-4' />
                      Subtitle Style
                    </button>
                    <button
                      onClick={() => setActivePanelTab('button-style')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'button-style'
                          ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiType className='w-4 h-4' />
                      Button Style
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setActivePanelTab('title-layout')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'title-layout'
                          ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiLayout className='w-4 h-4' />
                      Title Layout
                    </button>
                    <button
                      onClick={() => setActivePanelTab('subtitle-layout')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'subtitle-layout'
                          ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiLayout className='w-4 h-4' />
                      Subtitle Layout
                    </button>
                    <button
                      onClick={() => setActivePanelTab('button-layout')}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activePanelTab === 'button-layout'
                          ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      <FiLayout className='w-4 h-4' />
                      Button Layout
                    </button>
                  </>
                )}
              </div>

              {/* Panel Content */}
              <div className='flex-1 overflow-y-auto p-6'>
                <AnimatePresence mode='wait'>
                  {activePanelType === 'content' && (
                    <>
                      {activePanelTab === 'links' && (
                        <motion.div
                          key='links-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiLink className='w-5 h-5 text-blue-400' />
                              Banner Links
                            </h4>
                            <div className='space-y-4'>
                              <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                  Banner Link (Entire Banner)
                                </label>
                                <input
                                  type='url'
                                  value={bannerData.url}
                                  onChange={(e) =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      url: e.target.value,
                                    }))
                                  }
                                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                  placeholder='https://example.com'
                                />
                              </div>
                              <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                  Button Link
                                </label>
                                <input
                                  type='url'
                                  value={bannerData.buttonUrl}
                                  onChange={(e) =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      buttonUrl: e.target.value,
                                    }))
                                  }
                                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                  placeholder='https://example.com/product'
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'content' && (
                        <motion.div
                          key='content-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiType className='w-5 h-5 text-blue-400' />
                              Banner Content
                            </h4>
                            <div className='space-y-4'>
                              {/* Title Section */}
                              <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                  Banner Title
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-0.5'>
                                    <span className='text-xs font-medium text-gray-600'>
                                      Typography
                                    </span>
                                    <div className='flex items-center space-x-1'>
                                      <button
                                        onClick={() =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            titleBold: !prev.titleBold,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.titleBold
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Bold'
                                      >
                                        <FiBold className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            titleItalic: !prev.titleItalic,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.titleItalic
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Italic'
                                      >
                                        <FiItalic className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            titleUnderline:
                                              !prev.titleUnderline,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.titleUnderline
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Underline'
                                      >
                                        <FiUnderline className='w-3 h-3' />
                                      </button>
                                    </div>
                                  </div>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-1.5'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-xs font-medium text-gray-600'>
                                        Font Size
                                      </span>
                                      <div className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                        devicePreview === 'mobile' 
                                          ? 'bg-blue-100 text-blue-700' 
                                          : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {devicePreview === 'mobile' ? 'Mobile' : 'Desktop'}
                                      </div>
                                    </div>
                                    <div className='flex items-center gap-1 bg-white rounded border border-gray-200 p-0.5'>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            setBannerData((prev) => {
                                              const currentSize = devicePreview === 'mobile'
                                                ? parseInt(prev.titleCustomFontSizeMobile) || 20
                                                : parseInt(prev.titleCustomFontSize) || 28
                                              const newSize = Math.max(8, currentSize - 1);
                                              return {
                                                ...prev,
                                                [devicePreview === 'mobile' ? 'titleCustomFontSizeMobile' : 'titleCustomFontSize']:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiMinus className='w-2.5 h-2.5' />
                                      </button>
                                                                              <span className='text-xs font-mono text-gray-700 px-1.5 min-w-[1.75rem] text-center'>
                                          {devicePreview === 'mobile' 
                                            ? (bannerData.titleCustomFontSizeMobile || '20')
                                            : (bannerData.titleCustomFontSize || '28')
                                          }
                                        </span>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            setBannerData((prev) => {
                                              const currentSize = devicePreview === 'mobile'
                                                ? parseInt(prev.titleCustomFontSizeMobile) || 20
                                                : parseInt(prev.titleCustomFontSize) || 28
                                              const newSize = currentSize + 1;
                                              return {
                                                ...prev,
                                                [devicePreview === 'mobile' ? 'titleCustomFontSizeMobile' : 'titleCustomFontSize']:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiPlus className='w-2.5 h-2.5' />
                                      </button>
                                    </div>
                                  </div>
                                  <textarea
                                    value={bannerData.title}
                                    onChange={(e) =>
                                      setBannerData((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                      }))
                                    }
                                    rows={2}
                                    className='w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 resize-none placeholder:text-xs placeholder:text-gray-400'
                                    style={{
                                      fontSize: '12px',
                                    }}
                                    placeholder='Enter banner title...'
                                  />
                                </div>
                              </div>

                              {/* Subtitle Section */}
                              <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                  Banner Subtitle
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-0.5'>
                                    <span className='text-xs font-medium text-gray-600'>
                                      Typography
                                    </span>
                                    <div className='flex items-center space-x-1'>
                                      <button
                                        onClick={() =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            subtitleBold: !prev.subtitleBold,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.subtitleBold
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Bold'
                                      >
                                        <FiBold className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            subtitleItalic:
                                              !prev.subtitleItalic,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.subtitleItalic
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Italic'
                                      >
                                        <FiItalic className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            subtitleUnderline:
                                              !prev.subtitleUnderline,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.subtitleUnderline
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Underline'
                                      >
                                        <FiUnderline className='w-3 h-3' />
                                      </button>
                                    </div>
                                  </div>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-1.5'>
                                    <span className='text-xs font-medium text-gray-600'>
                                      Font Size
                                    </span>
                                    <div className='flex items-center gap-1 bg-white rounded border border-gray-200 p-0.5'>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            setBannerData((prev) => {
                                              const currentSize = devicePreview === 'mobile'
                                                ? parseInt(prev.subtitleCustomFontSizeMobile) || 14
                                                : parseInt(prev.subtitleCustomFontSize) || 16
                                              const newSize = Math.max(8, currentSize - 1);
                                              return {
                                                ...prev,
                                                [devicePreview === 'mobile' ? 'subtitleCustomFontSizeMobile' : 'subtitleCustomFontSize']:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiMinus className='w-2.5 h-2.5' />
                                      </button>
                                      <span className='text-xs font-mono text-gray-700 px-1.5 min-w-[1.75rem] text-center'>
                                        {devicePreview === 'mobile' 
                                          ? (bannerData.subtitleCustomFontSizeMobile || '14')
                                          : (bannerData.subtitleCustomFontSize || '16')
                                        }
                                      </span>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            setBannerData((prev) => {
                                              const currentSize = devicePreview === 'mobile'
                                                ? parseInt(prev.subtitleCustomFontSizeMobile) || 14
                                                : parseInt(prev.subtitleCustomFontSize) || 16
                                              const newSize = currentSize + 1;
                                              return {
                                                ...prev,
                                                [devicePreview === 'mobile' ? 'subtitleCustomFontSizeMobile' : 'subtitleCustomFontSize']:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiPlus className='w-2.5 h-2.5' />
                                      </button>
                                    </div>
                                  </div>
                                  <textarea
                                    value={bannerData.subtitle}
                                    onChange={(e) =>
                                      setBannerData((prev) => ({
                                        ...prev,
                                        subtitle: e.target.value,
                                      }))
                                    }
                                    rows={2}
                                    className='w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 resize-none placeholder:text-xs placeholder:text-gray-400'
                                    style={{
                                      fontSize: '12px',
                                    }}
                                    placeholder='Enter banner subtitle...'
                                  />
                                </div>
                              </div>

                              {/* CTA Section */}
                              <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                                  CTA Button Text
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-0.5'>
                                    <span className='text-xs font-medium text-gray-600'>
                                      Typography
                                    </span>
                                    <div className='flex items-center space-x-1'>
                                      <button
                                        onClick={() =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            ctaBold: !prev.ctaBold,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.ctaBold
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Bold'
                                      >
                                        <FiBold className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            ctaItalic: !prev.ctaItalic,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.ctaItalic
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Italic'
                                      >
                                        <FiItalic className='w-3 h-3' />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            ctaUnderline: !prev.ctaUnderline,
                                          }))
                                        }
                                        className={`w-5 h-4 flex items-center justify-center rounded border border-gray-200 transition-all duration-200 ${
                                          bannerData.ctaUnderline
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                        title='Underline'
                                      >
                                        <FiUnderline className='w-3 h-3' />
                                      </button>
                                    </div>
                                  </div>
                                  <div className='flex items-center justify-between bg-gray-50 rounded-lg p-1.5'>
                                    <span className='text-xs font-medium text-gray-600'>
                                      Font Size
                                    </span>
                                    <div className='flex items-center gap-1 bg-white rounded border border-gray-200 p-0.5'>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            setBannerData((prev) => {
                                              const currentSize = devicePreview === 'mobile'
                                                ? parseInt(prev.ctaCustomFontSizeMobile) || 8
                                                : parseInt(prev.ctaCustomFontSize) || 10
                                              const newSize = Math.max(8, currentSize - 1);
                                              return {
                                                ...prev,
                                                [devicePreview === 'mobile' ? 'ctaCustomFontSizeMobile' : 'ctaCustomFontSize']:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiMinus className='w-2.5 h-2.5' />
                                      </button>
                                      <span className='text-xs font-mono text-gray-700 px-1.5 min-w-[1.75rem] text-center'>
                                        {devicePreview === 'mobile' 
                                          ? (bannerData.ctaCustomFontSizeMobile || '8')
                                          : (bannerData.ctaCustomFontSize || '10')
                                        }
                                      </span>
                                      <button
                                        onMouseDown={() => {
                                          const interval = setInterval(() => {
                                            setBannerData((prev) => {
                                              const currentSize = devicePreview === 'mobile'
                                                ? parseInt(prev.ctaCustomFontSizeMobile) || 8
                                                : parseInt(prev.ctaCustomFontSize) || 10
                                              const newSize = currentSize + 1;
                                              return {
                                                ...prev,
                                                [devicePreview === 'mobile' ? 'ctaCustomFontSizeMobile' : 'ctaCustomFontSize']:
                                                  newSize.toString(),
                                              }
                                            })
                                          }, 100)
                                          const handleMouseUp = () => {
                                            clearInterval(interval)
                                            document.removeEventListener(
                                              'mouseup',
                                              handleMouseUp
                                            )
                                          }
                                          document.addEventListener(
                                            'mouseup',
                                            handleMouseUp
                                          )
                                        }}
                                        className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded text-xs'
                                      >
                                        <FiPlus className='w-2.5 h-2.5' />
                                      </button>
                                    </div>
                                  </div>
                                  <input
                                    type='text'
                                    value={bannerData.ctaText}
                                    onChange={(e) =>
                                      setBannerData((prev) => ({
                                        ...prev,
                                        ctaText: e.target.value,
                                      }))
                                    }
                                    className='w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 placeholder:text-xs placeholder:text-gray-400'
                                    style={{
                                      fontSize: '12px',
                                    }}
                                    placeholder='Enter CTA button text...'
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'advanced' && (
                        <motion.div
                          key='advanced-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiImage className='w-5 h-5 text-purple-400' />
                              Banner Image
                            </h4>
                            <div className='space-y-4'>
                              {/* Banner Image Upload */}
                              <div>
                                <div
                                  onClick={() => fileInputRef.current?.click()}
                                  className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer'
                                >
                                  {bannerData.bannerImage ? (
                                    <div className='space-y-3'>
                                      <img
                                        src={URL.createObjectURL(
                                          bannerData.bannerImage!
                                        )}
                                        alt='Banner preview'
                                        className='w-full h-24 object-cover rounded'
                                      />
                                      <p className='text-xs text-gray-600 dark:text-gray-400'>
                                        {bannerData.bannerImage!.name}
                                      </p>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleRemoveImage()
                                        }}
                                        className='px-2 py-1 text-red-600 hover:text-red-700 text-xs'
                                      >
                                        Remove Image
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      <FiUpload className='w-8 h-8 text-gray-400 mx-auto mb-3' />
                                      <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                                        Upload Banner Image
                                      </p>
                                      <p className='text-xs text-gray-600 dark:text-gray-400'>
                                        Click to upload or drag and drop
                                      </p>
                                      <p className='text-xs text-gray-500 mt-1'>
                                        JPG, PNG, WebP up to 2MB
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <input
                                  ref={fileInputRef}
                                  type='file'
                                  accept='image/*'
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) await handleImageUpload(e.target.files[0]);
                                  }}
                                  className='hidden'
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {activePanelType === 'style' && (
                    <>
                      {activePanelTab === 'title-style' && (
                        <motion.div
                          key='title-style-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiType className='w-5 h-5 text-purple-400' />
                              Title Style Settings
                            </h4>
                            <div className='space-y-4'>
                              <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                                  Title Color
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center gap-3'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                                        Custom:
                                      </span>
                                      <input
                                        type='color'
                                        value={bannerData.titleColor}
                                        onChange={(e) =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            titleColor: e.target.value,
                                          }))
                                        }
                                        className='w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-105 transition-transform shadow-sm'
                                      />
                                      <span className='text-xs font-mono text-gray-600 dark:text-gray-400'>
                                        {bannerData.titleColor}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className='text-xs text-gray-500 dark:text-gray-400 mb-2 block'>
                                      Preset Colors:
                                    </span>
                                    <div className='flex gap-1 flex-wrap'>
                                      {presetColors.map((color) => (
                                        <button
                                          key={color}
                                          onClick={() =>
                                            setBannerData((prev) => ({
                                              ...prev,
                                              titleColor: color,
                                            }))
                                          }
                                          className='w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform shadow-sm'
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'subtitle-style' && (
                        <motion.div
                          key='subtitle-style-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiType className='w-5 h-5 text-purple-400' />
                              Subtitle Style Settings
                            </h4>
                            <div className='space-y-4'>
                              <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                                  Subtitle Color
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center gap-3'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                                        Custom:
                                      </span>
                                      <input
                                        type='color'
                                        value={bannerData.subtitleColor}
                                        onChange={(e) =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            subtitleColor: e.target.value,
                                          }))
                                        }
                                        className='w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-105 transition-transform shadow-sm'
                                      />
                                      <span className='text-xs font-mono text-gray-600 dark:text-gray-400'>
                                        {bannerData.subtitleColor}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className='text-xs text-gray-500 dark:text-gray-400 mb-2 block'>
                                      Preset Colors:
                                    </span>
                                    <div className='flex gap-1 flex-wrap'>
                                      {presetColors.map((color) => (
                                        <button
                                          key={color}
                                          onClick={() =>
                                            setBannerData((prev) => ({
                                              ...prev,
                                              subtitleColor: color,
                                            }))
                                          }
                                          className='w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform shadow-sm'
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'button-style' && (
                        <motion.div
                          key='button-style-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-6'
                        >
                          <div>
                            <h4 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiType className='w-5 h-5 text-purple-400' />
                              Button Style Settings
                            </h4>
                            <div className='space-y-6'>
                              <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                                  Button Background
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center gap-3'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                                        Custom:
                                      </span>
                                      <input
                                        type='color'
                                        value={bannerData.ctaBgColor}
                                        onChange={(e) =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            ctaBgColor: e.target.value,
                                          }))
                                        }
                                        className='w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-105 transition-transform shadow-sm'
                                      />
                                      <span className='text-xs font-mono text-gray-600 dark:text-gray-400'>
                                        {bannerData.ctaBgColor}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className='text-xs text-gray-500 dark:text-gray-400 mb-2 block'>
                                      Preset Colors:
                                    </span>
                                    <div className='flex gap-1 flex-wrap'>
                                      {presetColors.map((color) => (
                                        <button
                                          key={color}
                                          onClick={() =>
                                            setBannerData((prev) => ({
                                              ...prev,
                                              ctaBgColor: color,
                                            }))
                                          }
                                          className='w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform shadow-sm'
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                                  Button Text Color
                                </label>
                                <div className='space-y-3'>
                                  <div className='flex items-center gap-3'>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                                        Custom:
                                      </span>
                                      <input
                                        type='color'
                                        value={bannerData.ctaColor}
                                        onChange={(e) =>
                                          setBannerData((prev) => ({
                                            ...prev,
                                            ctaColor: e.target.value,
                                          }))
                                        }
                                        className='w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-105 transition-transform shadow-sm'
                                      />
                                      <span className='text-xs font-mono text-gray-600 dark:text-gray-400'>
                                        {bannerData.ctaColor}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <span className='text-xs text-gray-500 dark:text-gray-400 mb-2 block'>
                                      Preset Colors:
                                    </span>
                                    <div className='flex gap-1 flex-wrap'>
                                      {presetColors.map((color) => (
                                        <button
                                          key={color}
                                          onClick={() =>
                                            setBannerData((prev) => ({
                                              ...prev,
                                              ctaColor: color,
                                            }))
                                          }
                                          className='w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-110 transition-transform shadow-sm'
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {activePanelType === 'layout' && (
                    <>
                      {activePanelTab === 'title-layout' && (
                        <motion.div
                          key='title-layout-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-4'
                        >
                          {/* Title Margin Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Title Margin
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.titleMarginTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.titleMarginRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.titleMarginBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.titleMarginLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.titleMarginTop ?? 0
                                          const newValue = currentValue - 5
                                          return {
                                            ...prev,
                                            titleMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.titleMarginLeft ?? 0
                                        const newValue = currentValue - 5
                                        return {
                                          ...prev,
                                          titleMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded border border-gray-400 dark:border-gray-500'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.titleMarginLeft ?? 0
                                        const newValue = currentValue + 5
                                        return {
                                          ...prev,
                                          titleMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.titleMarginTop ?? 0
                                          const newValue = currentValue + 5
                                          return {
                                            ...prev,
                                            titleMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      titleMarginTop: 20,
                                      titleMarginRight: 20,
                                      titleMarginBottom: 20,
                                      titleMarginLeft: 20,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-green-100 dark:bg-green-700 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-600 transition-colors'
                                >
                                  All 20px
                                </button>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      titleMarginTop: 0,
                                      titleMarginRight: 0,
                                      titleMarginBottom: 0,
                                      titleMarginLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Title Padding Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Title Padding
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.titlePaddingTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.titlePaddingRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.titlePaddingBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.titlePaddingLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.titlePaddingTop ?? 0
                                          const newValue = Math.max(currentValue - 3, -20)
                                          return {
                                            ...prev,
                                            titlePaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.titlePaddingLeft ?? 0
                                        const newValue = Math.max(currentValue - 3, -20)
                                        return {
                                          ...prev,
                                          titlePaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-blue-400 dark:bg-blue-500 rounded border border-blue-500 dark:border-blue-400'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.titlePaddingLeft ?? 0
                                        const newValue = Math.min(currentValue + 3, 50)
                                        return {
                                          ...prev,
                                          titlePaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.titlePaddingTop ?? 0
                                          const newValue = Math.min(currentValue + 3, 50)
                                          return {
                                            ...prev,
                                            titlePaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      titlePaddingTop: 10,
                                      titlePaddingRight: 10,
                                      titlePaddingBottom: 10,
                                      titlePaddingLeft: 10,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors'
                                >
                                  All 10px
                                </button>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      titlePaddingTop: 0,
                                      titlePaddingRight: 0,
                                      titlePaddingBottom: 0,
                                      titlePaddingLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'subtitle-layout' && (
                        <motion.div
                          key='subtitle-layout-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-4'
                        >
                          {/* Subtitle Margin Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Subtitle Margin
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.subtitleMarginTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.subtitleMarginRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.subtitleMarginBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.subtitleMarginLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.subtitleMarginTop ?? 0
                                          const newValue = currentValue - 5
                                          return {
                                            ...prev,
                                            subtitleMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.subtitleMarginLeft ?? 0
                                        const newValue = currentValue - 5
                                        return {
                                          ...prev,
                                          subtitleMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded border border-gray-400 dark:border-gray-500'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.subtitleMarginLeft ?? 0
                                        const newValue = currentValue + 5
                                        return {
                                          ...prev,
                                          subtitleMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.subtitleMarginTop ?? 0
                                          const newValue = currentValue + 5
                                          return {
                                            ...prev,
                                            subtitleMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      subtitleMarginTop: 20,
                                      subtitleMarginRight: 20,
                                      subtitleMarginBottom: 20,
                                      subtitleMarginLeft: 20,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-purple-100 dark:bg-purple-700 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-600 transition-colors'
                                >
                                  All 20px
                                </button>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      subtitleMarginTop: 0,
                                      subtitleMarginRight: 0,
                                      subtitleMarginBottom: 0,
                                      subtitleMarginLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Subtitle Padding Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Subtitle Padding
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.subtitlePaddingTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.subtitlePaddingRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.subtitlePaddingBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.subtitlePaddingLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.subtitlePaddingTop ?? 0
                                          const newValue = Math.max(currentValue - 3, -20)
                                          return {
                                            ...prev,
                                            subtitlePaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-orange-50 dark:hover:bg-orange-600/20 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.subtitlePaddingLeft ?? 0
                                        const newValue = Math.max(currentValue - 3, -20)
                                        return {
                                          ...prev,
                                          subtitlePaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-orange-50 dark:hover:bg-orange-600/20 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-orange-400 dark:bg-orange-500 rounded border border-orange-500 dark:border-orange-400'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.subtitlePaddingLeft ?? 0
                                        const newValue = Math.min(currentValue + 3, 50)
                                        return {
                                          ...prev,
                                          subtitlePaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-orange-50 dark:hover:bg-orange-600/20 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.subtitlePaddingTop ?? 0
                                          const newValue = Math.min(currentValue + 3, 50)
                                          return {
                                            ...prev,
                                            subtitlePaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-orange-50 dark:hover:bg-orange-600/20 hover:border-orange-300 dark:hover:border-orange-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      subtitlePaddingTop: 10,
                                      subtitlePaddingRight: 10,
                                      subtitlePaddingBottom: 10,
                                      subtitlePaddingLeft: 10,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-orange-100 dark:bg-orange-700 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-600 transition-colors'
                                >
                                  All 10px
                                </button>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      subtitlePaddingTop: 0,
                                      subtitlePaddingRight: 0,
                                      subtitlePaddingBottom: 0,
                                      subtitlePaddingLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activePanelTab === 'button-layout' && (
                        <motion.div
                          key='button-layout-tab'
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className='space-y-4'
                        >
                          {/* Button Margin Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Button Margin
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.buttonMarginTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.buttonMarginRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.buttonMarginBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.buttonMarginLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.buttonMarginTop ?? 0
                                          const newValue = currentValue - 5
                                          return {
                                            ...prev,
                                            buttonMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.buttonMarginLeft ?? 0
                                        const newValue = currentValue - 5
                                        return {
                                          ...prev,
                                          buttonMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded border border-gray-400 dark:border-gray-500'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.buttonMarginLeft ?? 0
                                        const newValue = currentValue + 5
                                        return {
                                          ...prev,
                                          buttonMarginLeft: newValue,
                                        }
                                      })
                                    }, 100)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.buttonMarginTop ?? 0
                                          const newValue = currentValue + 5
                                          return {
                                            ...prev,
                                            buttonMarginTop: newValue,
                                          }
                                        })
                                      }, 100)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      buttonMarginTop: 20,
                                      buttonMarginRight: 20,
                                      buttonMarginBottom: 20,
                                      buttonMarginLeft: 20,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-600 transition-colors'
                                >
                                  All 20px
                                </button>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      buttonMarginTop: 0,
                                      buttonMarginRight: 0,
                                      buttonMarginBottom: 0,
                                      buttonMarginLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Button Padding Control */}
                          <div className='bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700'>
                            <label className='block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2'>
                              <FiMove className='w-4 h-4 text-gray-600 dark:text-gray-400' />
                              Button Padding
                            </label>

                            <div className='space-y-3'>
                              <div className='flex items-center justify-between text-xs'>
                                <span className='text-gray-600 dark:text-gray-400'>
                                  Values:
                                </span>
                                <div className='flex gap-2 text-xs'>
                                  <span>
                                    T: {bannerData.buttonPaddingTop || 0}
                                  </span>
                                  <span>
                                    R: {bannerData.buttonPaddingRight || 0}
                                  </span>
                                  <span>
                                    B: {bannerData.buttonPaddingBottom || 0}
                                  </span>
                                  <span>
                                    L: {bannerData.buttonPaddingLeft || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Four Directional Controls */}
                              <div className='grid grid-cols-3 gap-1 mb-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.buttonPaddingTop ?? 0
                                          const newValue = Math.max(currentValue - 3, -20)
                                          return {
                                            ...prev,
                                            buttonPaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-teal-50 dark:hover:bg-teal-600/20 hover:border-teal-300 dark:hover:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowUp className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              <div className='flex items-center gap-1'>
                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.buttonPaddingLeft ?? 0
                                        const newValue = Math.max(currentValue - 3, -20)
                                        return {
                                          ...prev,
                                          buttonPaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-teal-50 dark:hover:bg-teal-600/20 hover:border-teal-300 dark:hover:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowLeft className='w-2.5 h-2.5 text-gray-600' />
                                </button>

                                <div className='flex-1 bg-gray-100 dark:bg-gray-700 rounded p-2 flex items-center justify-center'>
                                  <div className='w-4 h-4 bg-teal-400 dark:bg-teal-500 rounded border border-teal-500 dark:border-teal-400'></div>
                                </div>

                                <button
                                  onMouseDown={() => {
                                    const interval = setInterval(() => {
                                      setBannerData((prev) => {
                                        const currentValue =
                                          prev.buttonPaddingLeft ?? 0
                                        const newValue = Math.min(currentValue + 3, 50)
                                        return {
                                          ...prev,
                                          buttonPaddingLeft: newValue,
                                        }
                                      })
                                    }, 50)
                                    const handleMouseUp = () => {
                                      clearInterval(interval)
                                      document.removeEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }
                                    document.addEventListener(
                                      'mouseup',
                                      handleMouseUp
                                    )
                                  }}
                                  className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-teal-50 dark:hover:bg-teal-600/20 hover:border-teal-300 dark:hover:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                >
                                  <FiArrowRight className='w-2.5 h-2.5 text-gray-600' />
                                </button>
                              </div>

                              <div className='grid grid-cols-3 gap-1 mt-2'>
                                <div></div>
                                <div className='flex justify-center'>
                                  <button
                                    onMouseDown={() => {
                                      const interval = setInterval(() => {
                                        setBannerData((prev) => {
                                          const currentValue =
                                            prev.buttonPaddingTop ?? 0
                                          const newValue = Math.min(currentValue + 3, 50)
                                          return {
                                            ...prev,
                                            buttonPaddingTop: newValue,
                                          }
                                        })
                                      }, 50)
                                      const handleMouseUp = () => {
                                        clearInterval(interval)
                                        document.removeEventListener(
                                          'mouseup',
                                          handleMouseUp
                                        )
                                      }
                                      document.addEventListener(
                                        'mouseup',
                                        handleMouseUp
                                      )
                                    }}
                                    className='w-6 h-6 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-teal-50 dark:hover:bg-teal-600/20 hover:border-teal-300 dark:hover:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95'
                                  >
                                    <FiArrowDown className='w-2.5 h-2.5 text-gray-600' />
                                  </button>
                                </div>
                                <div></div>
                              </div>

                              {/* Quick Presets */}
                              <div className='flex gap-1 mt-2'>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      buttonPaddingTop: 10,
                                      buttonPaddingRight: 10,
                                      buttonPaddingBottom: 10,
                                      buttonPaddingLeft: 10,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-teal-100 dark:bg-teal-700 text-teal-700 dark:text-teal-300 rounded hover:bg-teal-200 dark:hover:bg-teal-600 transition-colors'
                                >
                                  All 10px
                                </button>
                                <button
                                  onClick={() =>
                                    setBannerData((prev) => ({
                                      ...prev,
                                      buttonPaddingTop: 0,
                                      buttonPaddingRight: 0,
                                      buttonPaddingBottom: 0,
                                      buttonPaddingLeft: 0,
                                    }))
                                  }
                                  className='px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'
                                >
                                  Reset
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Panel Footer */}
              <div className='p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'>
                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>Panel Width: {panelWidth}px</span>
                  <span>Press Esc to close</span>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Full Screen Modal Overlay */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl'
            style={{ overscrollBehavior: 'contain' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center max-w-full max-h-full'
              style={{ width: 'min(90vw, 600px)', height: 'min(90vh, 600px)' }}
            >
              <button
                onClick={handleExitFullScreen}
                className='absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow hover:bg-white/100 dark:hover:bg-gray-700/100 text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400'
                title='Exit Full Screen'
                aria-label='Exit Full Screen'
              >
                <FiX className='w-5 h-5' />
              </button>
              <MiniBannerCanvas devicePreview={devicePreview} bannerData={bannerData} fileInputRef={fileInputRef} isFullScreen />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className='bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-xs w-full text-center'
            >
              <FiAlertCircle className='w-10 h-10 text-red-500 mx-auto mb-4' />
              <h3 className='text-lg font-bold mb-2 text-gray-900 dark:text-white'>Reset Banner Design?</h3>
              <p className='text-gray-600 dark:text-gray-300 mb-6'>This will clear all fields and revert to default. Are you sure?</p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200'
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200'
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
